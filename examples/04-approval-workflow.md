# Purchase Approval (Human-in-the-Loop)

When someone submits a purchase request over $1,000, the workflow pauses and waits for a manager to approve or reject it via API. Under $1,000, it auto-approves. This example shows the `wait_resume` node for human-in-the-loop flows.

## Flow

```
[Manual Trigger] → [IF: amount > 1000]
                       ├─ true  → [Send Mail: ask manager] → [Wait/Resume] → [IF: approved?]
                       │                                                          ├─ true  → [Send Mail: approved]
                       │                                                          └─ false → [Send Mail: rejected]
                       └─ false → [Send Mail: auto-approved]
```

## Step 1 — Define the Workflow

Create an artisan command and run it once with `php artisan workflow:setup-approvals`.

```php
// app/Console/Commands/SetupApprovalWorkflow.php

use Aftandilmmd\WorkflowAutomation\Facades\Workflow;
use Illuminate\Console\Command;

class SetupApprovalWorkflow extends Command
{
    protected $signature = 'workflow:setup-approvals';
    protected $description = 'Create the purchase approval workflow';

    public function handle(): void
    {
        $workflow = Workflow::create(['name' => 'Purchase Approval']);

        $trigger = Workflow::addNode($workflow, 'manual', name: 'New Request');

        $checkAmount = Workflow::addNode($workflow, 'if_condition', [
            'field'    => 'amount',
            'operator' => 'greater_than',
            'value'    => 1000,
        ], name: 'Needs Approval?');

        // ── High value path: wait for manager ─────────────────

        $askManager = Workflow::addNode($workflow, 'send_mail', [
            'to'      => '{{ item.manager_email }}',
            'subject' => 'Approval Required: ${{ item.amount }}',
            'body'    => '{{ item.requester }} needs approval for: {{ item.description }}',
        ], name: 'Ask Manager');

        $wait = Workflow::addNode($workflow, 'wait_resume', [
            'timeout_seconds' => 259200, // 3 days
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

        // ── Low value path: auto-approve ──────────────────────

        $notifyAutoApproved = Workflow::addNode($workflow, 'send_mail', [
            'to'      => '{{ item.requester_email }}',
            'subject' => 'Purchase Auto-Approved',
            'body'    => 'Your request for ${{ item.amount }} was auto-approved (under $1,000).',
        ], name: 'Notify Auto-Approved');

        // Edges
        Workflow::connect($trigger->id, $checkAmount->id);

        // High value: email manager → pause → check decision
        Workflow::connect($checkAmount->id, $askManager->id, sourcePort: 'true');
        Workflow::connect($askManager->id, $wait->id);
        Workflow::connect($wait->id, $checkDecision->id, sourcePort: 'resume');
        Workflow::connect($checkDecision->id, $notifyApproved->id, sourcePort: 'true');
        Workflow::connect($checkDecision->id, $notifyRejected->id, sourcePort: 'false');

        // Low value: auto-approve
        Workflow::connect($checkAmount->id, $notifyAutoApproved->id, sourcePort: 'false');

        Workflow::activate($workflow);

        $this->info("Purchase Approval workflow created (ID: {$workflow->id})");
    }
}
```

## Step 2 — Submit a Purchase Request

```php
// app/Http/Controllers/PurchaseController.php

$workflow = WorkflowModel::where('name', 'Purchase Approval')->firstOrFail();

$run = Workflow::run($workflow, [[
    'requester'       => auth()->user()->name,
    'requester_email' => auth()->user()->email,
    'manager_email'   => 'manager@company.com',
    'amount'          => 2500,
    'description'     => '5 laptops for the dev team',
]]);

// $run->status === 'waiting' (because 2500 > 1000)
```

## Step 3 — Manager Approves or Rejects

When the workflow hits `wait_resume`, it pauses and stores a `resume_token` in the node run output. Your UI reads this token and calls the resume endpoint:

```php
// Approve
Workflow::resume($runId, $resumeToken, ['approved' => true]);

// Reject
Workflow::resume($runId, $resumeToken, [
    'approved' => false,
    'reason'   => 'Budget exceeded for Q1',
]);
```

Or via API:

```bash
# Approve
POST /workflow-engine/runs/{id}/resume
{"resume_token": "...", "payload": {"approved": true}}

# Reject
POST /workflow-engine/runs/{id}/resume
{"resume_token": "...", "payload": {"approved": false, "reason": "Budget exceeded"}}
```

## What Happens

**$2,500 request:**

1. **IF** → `2500 > 1000` = true
2. **Send Mail** → Manager gets approval request email
3. **Wait/Resume** → Workflow pauses (status: `waiting`)
4. Manager calls resume API with `approved: true`
5. **IF** → `approved == true` → true
6. **Send Mail** → Requester gets "approved" email

**$500 request:**

1. **IF** → `500 > 1000` = false
2. **Send Mail** → Requester gets "auto-approved" email
3. Workflow completes immediately, no waiting

## Concepts Demonstrated

| Concept | How |
|---------|-----|
| Human-in-the-loop | `wait_resume` pauses until external signal |
| Resume with data | `Workflow::resume()` injects new data (`approved`, `reason`) |
| Timeout | `timeout_seconds: 259200` — workflow can handle 3-day expiry |
| Two-level branching | First branch by amount, then branch by approval decision |
