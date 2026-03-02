# User Onboarding

When a new user registers, send a different welcome email depending on how they signed up (organic, referral, or ad campaign). If they came via referral, also credit the referrer. This example shows automatic model-event triggering and multi-way branching with `switch`.

## Flow

```
[Model Event: User created] → [Switch: source]
                                  ├─ case_organic  → [Send Mail: organic welcome]
                                  ├─ case_referral → [Send Mail: referral welcome] → [HTTP: credit referrer]
                                  └─ default       → [Send Mail: generic welcome]
```

## Step 1 — Define the Workflow

Create an artisan command and run it once with `php artisan workflow:setup-onboarding`.

```php
// app/Console/Commands/SetupOnboardingWorkflow.php

use Aftandilmmd\WorkflowAutomation\Facades\Workflow;
use Illuminate\Console\Command;

class SetupOnboardingWorkflow extends Command
{
    protected $signature = 'workflow:setup-onboarding';
    protected $description = 'Create the user onboarding workflow';

    public function handle(): void
    {
        $workflow = Workflow::create(['name' => 'User Onboarding']);

        $trigger = Workflow::addNode($workflow, 'model_event', [
            'model'  => 'App\\Models\\User',
            'events' => ['created'],
        ], name: 'User Created');

        $switchSource = Workflow::addNode($workflow, 'switch', [
            'field' => 'source',
            'cases' => [
                ['port' => 'case_organic',  'operator' => 'equals', 'value' => 'organic'],
                ['port' => 'case_referral', 'operator' => 'equals', 'value' => 'referral'],
            ],
        ], name: 'Check Source');

        $welcomeOrganic = Workflow::addNode($workflow, 'send_mail', [
            'to'      => '{{ item.email }}',
            'subject' => 'Welcome, {{ item.name }}!',
            'body'    => 'Thanks for signing up. Start your 14-day trial today.',
        ], name: 'Welcome (Organic)');

        $welcomeReferral = Workflow::addNode($workflow, 'send_mail', [
            'to'      => '{{ item.email }}',
            'subject' => 'Your friend invited you! Welcome, {{ item.name }}',
            'body'    => 'You were referred by a friend — both of you get bonus credits.',
        ], name: 'Welcome (Referral)');

        $creditReferrer = Workflow::addNode($workflow, 'http_request', [
            'url'    => 'https://api.yourapp.com/referrals/credit',
            'method' => 'POST',
            'body'   => [
                'referrer_code' => '{{ item.referral_code }}',
                'new_user_id'   => '{{ item.id }}',
            ],
        ], name: 'Credit Referrer');

        $welcomeGeneric = Workflow::addNode($workflow, 'send_mail', [
            'to'      => '{{ item.email }}',
            'subject' => 'Welcome, {{ item.name }}!',
            'body'    => 'We are glad to have you.',
        ], name: 'Welcome (Generic)');

        // Edges
        Workflow::connect($trigger->id, $switchSource->id);
        Workflow::connect($switchSource->id, $welcomeOrganic->id, sourcePort: 'case_organic');
        Workflow::connect($switchSource->id, $welcomeReferral->id, sourcePort: 'case_referral');
        Workflow::connect($welcomeReferral->id, $creditReferrer->id);
        Workflow::connect($switchSource->id, $welcomeGeneric->id, sourcePort: 'default');

        Workflow::activate($workflow);

        $this->info("User Onboarding workflow created (ID: {$workflow->id})");
    }
}
```

## Step 2 — Register the Model Event Listener

Add one line to your `AppServiceProvider`. This tells the package to watch for Eloquent events:

```php
// app/Providers/AppServiceProvider.php

use Aftandilmmd\WorkflowAutomation\Listeners\ModelEventListener;

public function boot(): void
{
    ModelEventListener::register();
}
```

## Step 3 — It Just Works

No `Workflow::run()` needed. When a user registers, the workflow fires automatically:

```php
// Anywhere in your app
User::create([
    'name'          => 'Alice',
    'email'         => 'alice@example.com',
    'password'      => bcrypt('secret'),
    'source'        => 'referral',
    'referral_code' => 'BOB123',
]);
// → Workflow runs: referral welcome email + credit referrer API call
```

## What Happens

When `User::create(['source' => 'referral', ...])` is called:

1. **Model Event** fires on `User::created`
2. **Switch** checks `source` → matches `case_referral`
3. **Send Mail** → Referral welcome email sent to the user
4. **HTTP Request** → Calls the referral API to credit the referrer

If `source = 'organic'` → organic welcome. If `source = 'google_ads'` → no case matches → `default` port → generic welcome.

## Concepts Demonstrated

| Concept | How |
|---------|-----|
| Automatic triggering | `model_event` fires on `User::created` — no manual call |
| Multi-way branching | `switch` with named ports (`case_organic`, `case_referral`, `default`) |
| Sequential actions | Referral welcome → credit referrer (connected in sequence) |
| Fallback routing | Unmatched cases go to `default` port |
