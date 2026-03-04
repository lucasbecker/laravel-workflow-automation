# Laravel Workflow Automation

> English | **[Türkçe](README.tr.md)**

Define multi-step business logic as visual, configurable graphs — then let Laravel execute them. Instead of scattering if/else chains, queue jobs, and event listeners across your codebase, you describe the entire flow once: trigger, conditions, actions, loops, delays. The engine handles execution, retries, logging, and human-in-the-loop pauses. Think N8N, but as a Laravel package you own and extend.

## Installation

```bash
composer require aftandilmmd/laravel-workflow-automation
php artisan vendor:publish --tag=workflow-automation-config --tag=workflow-automation-migrations
php artisan migrate
```

## How It Works

A **workflow** is a directed graph made of three things:

- **Node** — A single unit of work: send an email, check a condition, call an API, wait for approval.
- **Edge** — A connection from one node's output port to another node's input. Edges define the order.
- **Trigger** — The first node. It decides *when* the workflow runs: manually, on a model event, via webhook, or on a cron schedule.

```
[Trigger] → [Condition] → true  → [Send Email]
                        → false → [Update DB]
```

You define the graph once (usually in an artisan command or a setup controller). Then you trigger it — the engine walks the graph, runs each node, and logs every step.

> Both fluent (`$workflow->addNode(...)`) and Facade (`Workflow::addNode(...)`) APIs are supported. Examples use the fluent style.

## Quick Start

The simplest real scenario: when a user registers, send a welcome email.

**Step 1 — Define the workflow** (run once via `php artisan workflow:setup-welcome`):

```php
// app/Console/Commands/SetupWelcomeWorkflow.php

use Aftandilmmd\WorkflowAutomation\Models\Workflow;
use Illuminate\Console\Command;

class SetupWelcomeWorkflow extends Command
{
    protected $signature = 'workflow:setup-welcome';
    protected $description = 'Create the welcome email workflow';

    public function handle(): void
    {
        $workflow = Workflow::create(['name' => 'Welcome Email']);

        $trigger = $workflow->addNode('User Created', 'model_event', [
            'model'  => 'App\\Models\\User',
            'events' => ['created'],
        ]);

        $email = $workflow->addNode('Send Welcome', 'send_mail', [
            'to'      => '{{ item.email }}',
            'subject' => 'Welcome, {{ item.name }}!',
            'body'    => 'Thanks for signing up.',
        ]);

        $trigger->connect($email);
        $workflow->activate();

        $this->info("Welcome Email workflow created (ID: {$workflow->id})");
    }
}
```

**That's it.** Every `User::create()` call now triggers the workflow automatically — the package registers model event listeners on boot. No manual `Workflow::run()` needed.

## Adding Logic

Add an `if_condition` node to branch based on data. This workflow sends a VIP notice for orders over $100, or just marks them processed:

```php
$trigger   = $workflow->addNode('New Order', 'manual');
$condition = $workflow->addNode('High Value?', 'if_condition', [
    'field'    => 'amount',
    'operator' => 'greater_than',
    'value'    => 100,
]);
$notify    = $workflow->addNode('Notify VIP Team', 'send_mail', [
    'to'      => 'vip-team@company.com',
    'subject' => 'High value order: ${{ item.amount }}',
    'body'    => 'Order #{{ item.id }} needs review.',
]);
$markDone  = $workflow->addNode('Mark Processed', 'set_fields', [
    'fields' => ['status' => 'processed'],
]);

$trigger->connect($condition);
$condition->connect($notify, sourcePort: 'true');
$condition->connect($markDone, sourcePort: 'false');
```

`sourcePort` is how branching works. Condition nodes output to named ports (`true`/`false`). Switch nodes output to `case_*` ports. You connect edges to whichever port you want.

Then trigger it from anywhere:

```php
use Aftandilmmd\WorkflowAutomation\Models\Workflow;

$workflow = Workflow::where('name', 'Order Processing')->first();
$run = $workflow->start([['id' => 42, 'amount' => 250, 'email' => 'customer@test.com']]);
// $run->status === 'completed'
```

## Triggers

There are 5 ways to start a workflow:

**Manual** — Call `$workflow->start()` from your code or the API.

```php
$workflow->addNode('Start', 'manual');
// Trigger: $workflow->start([['key' => 'value']]);
```

**Model Event** — Fires when an Eloquent model is created, updated, or deleted.

```php
$workflow->addNode('Order Created', 'model_event', [
    'model'  => 'App\\Models\\Order',
    'events' => ['created'],
]);
// Trigger: automatic — Order::create([...]) fires the workflow
```

**Event** — Fires when any Laravel event is dispatched.

```php
$workflow->addNode('Order Placed', 'event', [
    'event_class' => 'App\\Events\\OrderPlaced',
]);
// Trigger: automatic — event(new OrderPlaced(...)) fires the workflow
```

**Webhook** — Generates a unique URL that accepts POST requests.

```php
$node = $workflow->addNode('Stripe Hook', 'webhook', [
    'method'    => 'POST',
    'auth_type' => 'bearer',
]);
// URL: POST /workflow-webhook/{uuid} (uuid is in $node->config['path'])
// Trigger: external service sends HTTP request
```

**Schedule** — Runs on a cron schedule.

```php
$workflow->addNode('Morning Report', 'schedule', [
    'interval_type' => 'custom_cron',
    'cron'          => '0 8 * * *', // Daily at 8 AM
]);
// Trigger: automatic — requires Schedule::command('workflow:schedule-run')->everyMinute()
```

## Node Types

### Triggers

| Key | Description |
|-----|-------------|
| `manual` | Triggered via code or API |
| `model_event` | Eloquent model events (created, updated, deleted) |
| `event` | Any Laravel event (domain events, custom events) |
| `schedule` | Cron-based scheduling |
| `webhook` | HTTP endpoint with auth support |

### Actions

| Key | Description |
|-----|-------------|
| `send_mail` | Send email via Laravel Mail |
| `http_request` | Make HTTP requests to external APIs |
| `update_model` | Find and update Eloquent models |
| `dispatch_job` | Dispatch a Laravel queue job |
| `send_notification` | Send Laravel notifications |

### Conditions

| Key | Description | Output Ports |
|-----|-------------|--------------|
| `if_condition` | Binary branching | `true`, `false` |
| `switch` | Multi-way branching | `case_*`, `default` |

### Transformers

| Key | Description |
|-----|-------------|
| `set_fields` | Set or overwrite fields on items |
| `parse_data` | Parse JSON, CSV, or key-value strings |

### Controls

| Key | Description |
|-----|-------------|
| `loop` | Iterate over an array field (outputs: `loop_item`, `loop_done`) |
| `merge` | Wait for multiple branches, then combine |
| `delay` | Queue-based pause (non-blocking, uses Laravel jobs) |
| `sub_workflow` | Execute another workflow |
| `error_handler` | Route errors to different strategies |
| `wait_resume` | Pause for external signal (outputs: `resume`, `timeout`) |

### Utilities

| Key | Description |
|-----|-------------|
| `filter` | Keep items matching conditions |
| `aggregate` | Group and aggregate (sum, count, avg, min, max) |
| `code` | Safe expression-based transformations |

## Expressions

Use `{{ }}` in any config value. The engine resolves them before each node runs.

```
{{ item.email }}                          Access current item field
{{ item.price * item.qty }}               Arithmetic
{{ item.status == 'active' }}             Comparison (returns bool)
{{ item.age > 18 ? 'adult' : 'minor' }}  Ternary
{{ upper(item.name) }}                    Function call
{{ payload.date }}                        Original trigger payload
{{ nodes.Fetch_Data.main.0.total }}       Output of another node (by name)
```

Available functions: `upper`, `lower`, `trim`, `length`, `substr`, `replace`, `contains`, `starts_with`, `ends_with`, `split`, `join`, `round`, `ceil`, `floor`, `abs`, `min`, `max`, `sum`, `avg`, `count`, `first`, `last`, `pluck`, `flatten`, `unique`, `sort`, `now`, `date_format`, `date_diff`, `int`, `float`, `string`, `bool`, `json_encode`, `json_decode`

> No `eval()` — the engine uses a custom recursive descent parser.

## Advanced Patterns

### Loop over items

Expand an array into individual items, process each one:

```php
$loop = $workflow->addNode('Each Item', 'loop', [
    'source_field' => 'order_items',
]);

$updateStock = $workflow->addNode('Update Stock', 'http_request', [
    'url'    => 'https://inventory.api/stock',
    'method' => 'POST',
    'body'   => ['sku' => '{{ item._loop_item.sku }}', 'qty' => '{{ item._loop_item.qty }}'],
]);

$loop->connect($updateStock, sourcePort: 'loop_item');
```

### Wait for human approval

Pause the workflow until someone approves or rejects:

```php
$wait = $workflow->addNode('Await Approval', 'wait_resume', [
    'timeout_seconds' => 259200, // 3 days
]);

$approved = $workflow->addNode('Approved?', 'if_condition', [
    'field' => 'approved', 'operator' => 'equals', 'value' => true,
]);

$wait->connect($approved, sourcePort: 'resume');
```

The workflow pauses (`$run->status === 'waiting'`). Resume it later:

```php
use Aftandilmmd\WorkflowAutomation\Facades\Workflow;

Workflow::resume($runId, $resumeToken, ['approved' => true]);
```

Or via API: `POST /workflow-engine/runs/{id}/resume` with `{"resume_token": "...", "payload": {"approved": true}}`.

### Retry and replay failed runs

```php
use Aftandilmmd\WorkflowAutomation\Facades\Workflow;

// Replay: re-run a completed or failed workflow with its original payload
Workflow::replay($runId);

// Retry: re-run from the exact point of failure (restores context)
Workflow::retryFromFailure($runId);

// Retry a specific node
Workflow::retryNode($runId, $nodeId);
```

Or via API:

```bash
POST /workflow-engine/runs/{id}/replay
POST /workflow-engine/runs/{id}/retry
POST /workflow-engine/runs/{id}/retry-node   {"node_id": 42}
```

## Custom Nodes

Create a class, add the attribute, done:

```php
// app/Workflow/Nodes/SendSmsAction.php

use Aftandilmmd\WorkflowAutomation\Attributes\AsWorkflowNode;
use Aftandilmmd\WorkflowAutomation\Contracts\NodeInterface;
use Aftandilmmd\WorkflowAutomation\DTOs\{NodeInput, NodeOutput};
use Aftandilmmd\WorkflowAutomation\Enums\NodeType;

#[AsWorkflowNode(key: 'send_sms', type: NodeType::Action, label: 'Send SMS')]
class SendSmsAction implements NodeInterface
{
    public function inputPorts(): array  { return ['main']; }
    public function outputPorts(): array { return ['main', 'error']; }

    public static function configSchema(): array
    {
        return [
            ['key' => 'to', 'type' => 'string', 'label' => 'Phone', 'required' => true],
            ['key' => 'message', 'type' => 'textarea', 'label' => 'Message', 'required' => true],
        ];
    }

    public function execute(NodeInput $input, array $config): NodeOutput
    {
        $results = [];
        foreach ($input->items as $item) {
            // your SMS logic
            $results[] = array_merge($item, ['sms_sent' => true]);
        }
        return NodeOutput::main($results);
    }
}
```

Tell the package where to find it:

```php
// config/workflow-automation.php
'node_discovery' => [
    'app_paths' => [app_path('Workflow/Nodes')],
],
```

## Configuration

```php
// config/workflow-automation.php
return [
    'tables'     => [...],              // Custom table names
    'models'     => [...],              // Custom model classes (extend defaults)
    'async'      => true,               // Queue-based execution by default
    'queue'      => 'default',          // Queue name
    'prefix'     => 'workflow-engine',  // API route prefix
    'middleware'  => ['api'],            // API middleware
    'routes'     => true,               // Set false to disable package routes
    'webhook_prefix'         => 'workflow-webhook',
    'max_execution_time'     => 300,
    'default_retry_count'    => 0,
    'default_retry_delay_ms' => 1000,
    'retry_backoff'          => 'exponential',
    'expression_mode'        => 'safe',  // 'strict' disables functions
    'node_discovery'         => ['app_paths' => []],
    'log_retention_days'     => 30,
];
```

## API Reference

All endpoints are under the configurable prefix (default: `/workflow-engine`).

### Workflows

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workflows` | List (paginated) |
| POST | `/workflows` | Create |
| GET | `/workflows/{id}` | Show with nodes and edges |
| PUT | `/workflows/{id}` | Update |
| DELETE | `/workflows/{id}` | Soft delete |
| POST | `/workflows/{id}/activate` | Activate |
| POST | `/workflows/{id}/deactivate` | Deactivate |
| POST | `/workflows/{id}/run` | Manual trigger |
| POST | `/workflows/{id}/duplicate` | Clone |
| POST | `/workflows/{id}/validate` | Validate graph |

### Nodes and Edges

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/workflows/{id}/nodes` | Add node |
| PUT | `/workflows/{id}/nodes/{nodeId}` | Update node config |
| DELETE | `/workflows/{id}/nodes/{nodeId}` | Remove node |
| PATCH | `/workflows/{id}/nodes/{nodeId}/position` | Update canvas position |
| POST | `/workflows/{id}/edges` | Add edge |
| DELETE | `/workflows/{id}/edges/{edgeId}` | Remove edge |

### Runs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workflows/{id}/runs` | List runs (filterable by status) |
| GET | `/runs/{id}` | Run details with all node runs |
| POST | `/runs/{id}/cancel` | Cancel running/waiting workflow |
| POST | `/runs/{id}/resume` | Resume waiting workflow |
| POST | `/runs/{id}/replay` | Re-run with original payload |
| POST | `/runs/{id}/retry` | Re-run from failure point |
| POST | `/runs/{id}/retry-node` | Retry a specific failed node |

### Registry

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/registry/nodes` | All available node types |
| GET | `/registry/nodes/{key}` | Node type details + config schema |

## Events

| Event | Payload |
|-------|---------|
| `WorkflowStarted` | `WorkflowRun $run` |
| `WorkflowCompleted` | `WorkflowRun $run` |
| `WorkflowFailed` | `WorkflowRun $run`, `Throwable $exception` |
| `WorkflowResumed` | `WorkflowRun $run`, `array $payload` |
| `NodeExecuted` | `WorkflowNodeRun $nodeRun` |
| `NodeFailed` | `WorkflowNodeRun $nodeRun`, `Throwable $exception` |

## Artisan Commands

```bash
php artisan workflow:schedule-run          # Check and dispatch due scheduled workflows
php artisan workflow:clean-runs            # Delete old runs (default: 30 days)
php artisan workflow:clean-runs --days=7   # Custom retention
php artisan workflow:validate {id}         # Validate a workflow graph
```

Add the schedule runner to your scheduler:

```php
// routes/console.php
Schedule::command('workflow:schedule-run')->everyMinute();
```

## Testing

```bash
composer test
```

## License

MIT
