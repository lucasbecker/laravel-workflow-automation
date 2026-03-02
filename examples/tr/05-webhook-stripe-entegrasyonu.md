# Stripe Webhook İşleyici

> [English](../05-webhook-stripe-integration.md) | Türkçe

Stripe webhook eventlerini al, event tipine göre yönlendir, veritabanındaki siparişi güncelle ve doğru e-postayı gönder. Bu örnek `webhook` tetikleyici, `switch` yönlendirme, `update_model` ve `delay` node'larını gösterir.

## Akış

```
[Webhook Tetikleyici] → [Switch: event tipi]
                            ├─ ödeme başarılı → [Model Güncelle: ödendi]    → [E-posta: makbuz]
                            ├─ ödeme başarısız → [Model Güncelle: başarısız] → [E-posta: yeniden deneme] → [Gecikme: 1sa] → [HTTP: tekrar tahsil]
                            └─ iade           → [Model Güncelle: iade edildi] → [E-posta: iade onayı]
```

## Adım 1 — Workflow'u Tanımla

Bir artisan komutu oluşturup `php artisan workflow:setup-stripe` ile bir kez çalıştırın.

```php
// app/Console/Commands/SetupStripeWorkflow.php

use Aftandilmmd\WorkflowAutomation\Facades\Workflow;
use Illuminate\Console\Command;

class SetupStripeWorkflow extends Command
{
    protected $signature = 'workflow:setup-stripe';
    protected $description = 'Stripe webhook handler workflow\'unu oluştur';

    public function handle(): void
    {
        $workflow = Workflow::create(['name' => 'Stripe Webhooks']);

        $trigger = Workflow::addNode($workflow, 'webhook', [
            'method'    => 'POST',
            'auth_type' => 'header_key',
        ], name: 'Stripe Webhook');

        $switchEvent = Workflow::addNode($workflow, 'switch', [
            'field' => 'type',
            'cases' => [
                ['port' => 'case_succeeded', 'operator' => 'equals', 'value' => 'payment_intent.succeeded'],
                ['port' => 'case_failed',    'operator' => 'equals', 'value' => 'payment_intent.payment_failed'],
                ['port' => 'case_refund',    'operator' => 'equals', 'value' => 'charge.refunded'],
            ],
        ], name: 'Route by Event');

        // ── Ödeme başarılı ────────────────────────────────────

        $markPaid = Workflow::addNode($workflow, 'update_model', [
            'model'      => 'App\\Models\\Order',
            'find_by'    => 'stripe_payment_intent',
            'find_value' => '{{ item.data.object.id }}',
            'fields'     => ['status' => 'paid', 'paid_at' => '{{ now() }}'],
        ], name: 'Mark Paid');

        $sendReceipt = Workflow::addNode($workflow, 'send_mail', [
            'to'      => '{{ item.data.object.receipt_email }}',
            'subject' => 'Payment Confirmed — Order #{{ item.data.object.metadata.order_id }}',
            'body'    => 'Your payment of ${{ item.data.object.amount / 100 }} has been confirmed.',
        ], name: 'Send Receipt');

        // ── Ödeme başarısız ───────────────────────────────────

        $markFailed = Workflow::addNode($workflow, 'update_model', [
            'model'      => 'App\\Models\\Order',
            'find_by'    => 'stripe_payment_intent',
            'find_value' => '{{ item.data.object.id }}',
            'fields'     => ['status' => 'payment_failed'],
        ], name: 'Mark Failed');

        $sendRetryNotice = Workflow::addNode($workflow, 'send_mail', [
            'to'      => '{{ item.data.object.receipt_email }}',
            'subject' => 'Payment Failed — Action Required',
            'body'    => 'Your payment could not be processed. We will retry in 1 hour.',
        ], name: 'Retry Notice');

        $delay = Workflow::addNode($workflow, 'delay', [
            'delay_seconds' => 3600, // 1 saat
        ], name: 'Wait 1 Hour');

        $retryCharge = Workflow::addNode($workflow, 'http_request', [
            'url'    => 'https://api.stripe.com/v1/payment_intents/{{ item.data.object.id }}/confirm',
            'method' => 'POST',
        ], name: 'Retry Charge');

        // ── İade ──────────────────────────────────────────────

        $markRefunded = Workflow::addNode($workflow, 'update_model', [
            'model'      => 'App\\Models\\Order',
            'find_by'    => 'stripe_charge_id',
            'find_value' => '{{ item.data.object.id }}',
            'fields'     => ['status' => 'refunded', 'refunded_at' => '{{ now() }}'],
        ], name: 'Mark Refunded');

        $sendRefundEmail = Workflow::addNode($workflow, 'send_mail', [
            'to'      => '{{ item.data.object.receipt_email }}',
            'subject' => 'Refund Processed',
            'body'    => 'Your refund of ${{ item.data.object.amount_refunded / 100 }} has been processed.',
        ], name: 'Refund Confirmation');

        // Edge'ler
        Workflow::connect($trigger->id, $switchEvent->id);

        Workflow::connect($switchEvent->id, $markPaid->id, sourcePort: 'case_succeeded');
        Workflow::connect($markPaid->id, $sendReceipt->id);

        Workflow::connect($switchEvent->id, $markFailed->id, sourcePort: 'case_failed');
        Workflow::connect($markFailed->id, $sendRetryNotice->id);
        Workflow::connect($sendRetryNotice->id, $delay->id);
        Workflow::connect($delay->id, $retryCharge->id);

        Workflow::connect($switchEvent->id, $markRefunded->id, sourcePort: 'case_refund');
        Workflow::connect($markRefunded->id, $sendRefundEmail->id);

        Workflow::activate($workflow);

        $this->info("Stripe Webhooks workflow created (ID: {$workflow->id})");
    }
}
```

## Adım 2 — Webhook URL'ini Al

Komutu çalıştırdıktan sonra, `webhook` node'u benzersiz bir UUID yolu oluşturur:

```php
use Aftandilmmd\WorkflowAutomation\Models\WorkflowNode;

$node = WorkflowNode::where('name', 'Stripe Webhook')->first();
$url = url("workflow-webhook/{$node->config['path']}");
// → https://yourapp.com/workflow-webhook/a1b2c3d4-e5f6-...
```

Stripe'ın webhook ayarlarını bu URL'e yönlendirin. Uygulamanızda kod yazmanıza gerek yok — paket gelen isteği alır, kimlik doğrulamasını yapar ve workflow'u çalıştırır.

## Ne Olur

**`payment_intent.succeeded`:**

1. **Switch** → `case_succeeded` eşleşir
2. **Model Güncelle** → `Order`'ı `stripe_payment_intent` ile bulur, `status: paid` ayarlar
3. **E-posta** → Müşteri makbuz alır

**`payment_intent.payment_failed`:**

1. **Switch** → `case_failed` eşleşir
2. **Model Güncelle** → `status: payment_failed` ayarlar
3. **E-posta** → Müşteri yeniden deneme bildirimi alır
4. **Gecikme** → Workflow 1 saat duraklar (kuyruk tabanlı, non-blocking)
5. **HTTP İsteği** → Stripe API üzerinden ödemeyi yeniden dener

**`charge.refunded`:**

1. **Switch** → `case_refund` eşleşir
2. **Model Güncelle** → `status: refunded` ayarlar
3. **E-posta** → Müşteri iade onayı alır

## Gösterilen Kavramlar

| Kavram | Nasıl |
|--------|-------|
| Webhook tetikleyici | Dış servis (Stripe) oluşturulan URL'e POST gönderir |
| Çok yönlü yönlendirme | `switch` event tipine göre farklı dallara yönlendirir |
| Veritabanı güncelleme | `update_model` Eloquent modelleri bulur ve günceller |
| Non-blocking gecikme | `delay` Laravel kuyruklarını kullanır — worker bekleme süresinde serbesttir |
| İç içe ifadeler | `{{ item.data.object.metadata.order_id }}` derin iç içe veriye erişir |
