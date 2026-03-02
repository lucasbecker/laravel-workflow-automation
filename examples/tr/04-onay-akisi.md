# Satın Alma Onayı (İnsan Onayı)

> [English](../04-approval-workflow.md) | Türkçe

Biri 1.000$'ın üzerinde satın alma talebi gönderdiğinde, workflow duraklar ve yöneticinin API üzerinden onaylamasını veya reddetmesini bekler. 1.000$ altı otomatik onaylanır. Bu örnek insan onayı akışları için `wait_resume` node'unu gösterir.

## Akış

```
[Manuel Tetikleyici] → [IF: tutar > 1000]
                           ├─ true  → [E-posta: yöneticiye sor] → [Bekle/Devam Et] → [IF: onaylandı mı?]
                           │                                                              ├─ true  → [E-posta: onaylandı]
                           │                                                              └─ false → [E-posta: reddedildi]
                           └─ false → [E-posta: otomatik onaylandı]
```

## Adım 1 — Workflow'u Tanımla

Bir artisan komutu oluşturup `php artisan workflow:setup-approvals` ile bir kez çalıştırın.

```php
// app/Console/Commands/SetupApprovalWorkflow.php

use Aftandilmmd\WorkflowAutomation\Facades\Workflow;
use Illuminate\Console\Command;

class SetupApprovalWorkflow extends Command
{
    protected $signature = 'workflow:setup-approvals';
    protected $description = 'Satın alma onay workflow\'unu oluştur';

    public function handle(): void
    {
        $workflow = Workflow::create(['name' => 'Purchase Approval']);

        $trigger = Workflow::addNode($workflow, 'manual', name: 'New Request');

        $checkAmount = Workflow::addNode($workflow, 'if_condition', [
            'field'    => 'amount',
            'operator' => 'greater_than',
            'value'    => 1000,
        ], name: 'Needs Approval?');

        // ── Yüksek değer yolu: yönetici bekle ────────────────

        $askManager = Workflow::addNode($workflow, 'send_mail', [
            'to'      => '{{ item.manager_email }}',
            'subject' => 'Approval Required: ${{ item.amount }}',
            'body'    => '{{ item.requester }} needs approval for: {{ item.description }}',
        ], name: 'Ask Manager');

        $wait = Workflow::addNode($workflow, 'wait_resume', [
            'timeout_seconds' => 259200, // 3 gün
        ], name: 'Wait for Decision');

        $checkDecision = Workflow::addNode($workflow, 'if_condition', [
            'field'    => 'approved',
            'operator' => 'equals',
            'value'    => true,
        ], name: 'Approved?');

        $notifyApproved = Workflow::addNode($workflow, 'send_mail', [
            'to'      => '{{ item.requester_email }}',
            'subject' => 'Purchase Approved',
            'body'    => 'Your request for ${{ item.amount }} has been approved.',
        ], name: 'Notify Approved');

        $notifyRejected = Workflow::addNode($workflow, 'send_mail', [
            'to'      => '{{ item.requester_email }}',
            'subject' => 'Purchase Rejected',
            'body'    => 'Your request for ${{ item.amount }} was rejected. Reason: {{ item.reason }}',
        ], name: 'Notify Rejected');

        // ── Düşük değer yolu: otomatik onay ──────────────────

        $notifyAutoApproved = Workflow::addNode($workflow, 'send_mail', [
            'to'      => '{{ item.requester_email }}',
            'subject' => 'Purchase Auto-Approved',
            'body'    => 'Your request for ${{ item.amount }} was auto-approved (under $1,000).',
        ], name: 'Notify Auto-Approved');

        // Edge'ler
        Workflow::connect($trigger->id, $checkAmount->id);

        // Yüksek değer: yöneticiye e-posta → duraklat → kararı kontrol et
        Workflow::connect($checkAmount->id, $askManager->id, sourcePort: 'true');
        Workflow::connect($askManager->id, $wait->id);
        Workflow::connect($wait->id, $checkDecision->id, sourcePort: 'resume');
        Workflow::connect($checkDecision->id, $notifyApproved->id, sourcePort: 'true');
        Workflow::connect($checkDecision->id, $notifyRejected->id, sourcePort: 'false');

        // Düşük değer: otomatik onay
        Workflow::connect($checkAmount->id, $notifyAutoApproved->id, sourcePort: 'false');

        Workflow::activate($workflow);

        $this->info("Purchase Approval workflow created (ID: {$workflow->id})");
    }
}
```

## Adım 2 — Satın Alma Talebi Gönder

```php
// app/Http/Controllers/PurchaseController.php

$workflow = WorkflowModel::where('name', 'Purchase Approval')->firstOrFail();

$run = Workflow::run($workflow, [[
    'requester'       => auth()->user()->name,
    'requester_email' => auth()->user()->email,
    'manager_email'   => 'manager@company.com',
    'amount'          => 2500,
    'description'     => 'Geliştirme ekibi için 5 laptop',
]]);

// $run->status === 'waiting' (çünkü 2500 > 1000)
```

## Adım 3 — Yönetici Onaylar veya Reddeder

Workflow `wait_resume`'a geldiğinde duraklar ve node çalıştırma çıktısında bir `resume_token` saklar. Arayüzünüz bu token'ı okuyup devam endpoint'ini çağırır:

```php
// Onayla
Workflow::resume($runId, $resumeToken, ['approved' => true]);

// Reddet
Workflow::resume($runId, $resumeToken, [
    'approved' => false,
    'reason'   => 'Q1 bütçesi aşıldı',
]);
```

Veya API ile:

```bash
# Onayla
POST /workflow-engine/runs/{id}/resume
{"resume_token": "...", "payload": {"approved": true}}

# Reddet
POST /workflow-engine/runs/{id}/resume
{"resume_token": "...", "payload": {"approved": false, "reason": "Bütçe aşıldı"}}
```

## Ne Olur

**2.500$ talep:**

1. **IF** → `2500 > 1000` = true
2. **E-posta** → Yönetici onay talebi e-postası alır
3. **Bekle/Devam Et** → Workflow duraklar (durum: `waiting`)
4. Yönetici resume API'yi `approved: true` ile çağırır
5. **IF** → `approved == true` → true
6. **E-posta** → Talep sahibi "onaylandı" e-postası alır

**500$ talep:**

1. **IF** → `500 > 1000` = false
2. **E-posta** → Talep sahibi "otomatik onaylandı" e-postası alır
3. Workflow anında tamamlanır, bekleme yok

## Gösterilen Kavramlar

| Kavram | Nasıl |
|--------|-------|
| İnsan onayı | `wait_resume` dış sinyal gelene kadar duraklatır |
| Veriyle devam | `Workflow::resume()` yeni veri enjekte eder (`approved`, `reason`) |
| Zaman aşımı | `timeout_seconds: 259200` — 3 günlük süre yönetimi |
| İki seviyeli dallanma | Önce tutara göre, sonra onay kararına göre dallanma |
