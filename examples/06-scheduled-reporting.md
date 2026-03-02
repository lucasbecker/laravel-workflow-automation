# Scheduled Daily Report

Every morning at 8 AM, fetch yesterday's sales data, filter out zero-revenue entries, aggregate by department, and email the summary. This example shows the `schedule` trigger and a linear data processing pipeline.

## Flow

```
[Schedule: 8 AM daily] → [HTTP: fetch sales] → [Filter: non-zero] → [Aggregate: by department] → [Send Mail: report]
```

## Step 1 — Define the Workflow

Create an artisan command and run it once with `php artisan workflow:setup-daily-report`.

```php
// app/Console/Commands/SetupDailyReport.php

use Aftandilmmd\WorkflowAutomation\Facades\Workflow;
use Illuminate\Console\Command;

class SetupDailyReport extends Command
{
    protected $signature = 'workflow:setup-daily-report';
    protected $description = 'Create the daily sales report workflow';

    public function handle(): void
    {
        $workflow = Workflow::create(['name' => 'Daily Sales Report']);

        $trigger = Workflow::addNode($workflow, 'schedule', [
            'interval_type' => 'custom_cron',
            'cron'          => '0 8 * * *', // Every day at 8:00 AM
        ], name: 'Daily 8 AM');

        $fetchData = Workflow::addNode($workflow, 'http_request', [
            'url'    => 'https://analytics.example.com/api/daily-sales?date={{ date_format(now(), "Y-m-d") }}',
            'method' => 'GET',
        ], name: 'Fetch Sales');

        $filterNonZero = Workflow::addNode($workflow, 'filter', [
            'conditions' => [
                ['field' => 'revenue', 'operator' => 'greater_than', 'value' => 0],
            ],
        ], name: 'Non-Zero Revenue');

        $aggregate = Workflow::addNode($workflow, 'aggregate', [
            'group_by'   => 'department',
            'operations' => [
                ['field' => 'revenue',      'function' => 'sum', 'alias' => 'total_revenue'],
                ['field' => 'transactions', 'function' => 'sum', 'alias' => 'total_transactions'],
            ],
        ], name: 'By Department');

        $sendReport = Workflow::addNode($workflow, 'send_mail', [
            'to'      => 'team@company.com',
            'subject' => 'Daily Sales Report — {{ date_format(now(), "M d, Y") }}',
            'body'    => 'Daily sales report attached.',
        ], name: 'Email Report');

        // Edges
        Workflow::connect($trigger->id, $fetchData->id);
        Workflow::connect($fetchData->id, $filterNonZero->id);
        Workflow::connect($filterNonZero->id, $aggregate->id);
        Workflow::connect($aggregate->id, $sendReport->id);

        Workflow::activate($workflow);

        $this->info("Daily Sales Report workflow created (ID: {$workflow->id})");
    }
}
```

## Step 2 — Enable the Schedule Runner

The package provides `workflow:schedule-run`, which checks all schedule triggers every minute. Add it to your Laravel scheduler:

```php
// routes/console.php
Schedule::command('workflow:schedule-run')->everyMinute();
```

Make sure the Laravel scheduler itself is running:

```bash
* * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
```

That's it. At 8:00 AM every day, the workflow runs automatically.

## Example Data Flow

**API returns:**

| department | revenue | transactions |
|------------|---------|--------------|
| Electronics | 15000 | 42 |
| Clothing | 8500 | 67 |
| Books | 0 | 0 |
| Electronics | 3200 | 15 |

**After Filter** — removes Books (zero revenue).

**After Aggregate** — grouped by department:

```json
[
    {"department": "Electronics", "total_revenue": 18200, "total_transactions": 57},
    {"department": "Clothing",    "total_revenue": 8500,  "total_transactions": 67}
]
```

## Other Schedule Options

```php
// Every 5 minutes
Workflow::addNode($workflow, 'schedule', [
    'interval_type'  => 'minutes',
    'interval_value' => 5,
], name: 'Every 5 Min');

// Weekdays at 9 AM
Workflow::addNode($workflow, 'schedule', [
    'interval_type' => 'custom_cron',
    'cron'          => '0 9 * * 1-5',
], name: 'Weekday 9 AM');

// First day of each month
Workflow::addNode($workflow, 'schedule', [
    'interval_type' => 'custom_cron',
    'cron'          => '0 0 1 * *',
], name: 'Monthly');
```

## Concepts Demonstrated

| Concept | How |
|---------|-----|
| Cron-based trigger | `schedule` with `custom_cron` runs at a specific time |
| No manual trigger | `workflow:schedule-run` dispatches automatically |
| Data filtering | `filter` removes zero-revenue entries |
| Aggregation | `aggregate` groups and sums by department |
| Built-in functions | `{{ date_format(now(), "Y-m-d") }}` in expressions |
