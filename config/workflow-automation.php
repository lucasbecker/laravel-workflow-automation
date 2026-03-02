<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Table Names
    |--------------------------------------------------------------------------
    |
    | Customize the database table names used by the workflow engine.
    |
    */

    'tables' => [
        'workflows'  => 'workflows',
        'nodes'      => 'workflow_nodes',
        'edges'      => 'workflow_edges',
        'runs'       => 'workflow_runs',
        'node_runs'  => 'workflow_node_runs',
    ],

    /*
    |--------------------------------------------------------------------------
    | Model Classes
    |--------------------------------------------------------------------------
    |
    | Override these to extend the default models with your own.
    |
    */

    'models' => [
        'workflow'  => Aftandilmmd\WorkflowAutomation\Models\Workflow::class,
        'node'      => Aftandilmmd\WorkflowAutomation\Models\WorkflowNode::class,
        'edge'      => Aftandilmmd\WorkflowAutomation\Models\WorkflowEdge::class,
        'run'       => Aftandilmmd\WorkflowAutomation\Models\WorkflowRun::class,
        'node_run'  => Aftandilmmd\WorkflowAutomation\Models\WorkflowNodeRun::class,
    ],

    /*
    |--------------------------------------------------------------------------
    | Queue Configuration
    |--------------------------------------------------------------------------
    |
    | When async is true, workflows are dispatched to the queue.
    | Set false for synchronous execution (useful for testing/debugging).
    |
    */

    'async' => env('WORKFLOW_ASYNC', true),
    'queue' => env('WORKFLOW_QUEUE', 'default'),

    /*
    |--------------------------------------------------------------------------
    | HTTP Routes
    |--------------------------------------------------------------------------
    |
    | Configure the API route prefix and middleware. Set 'routes' to false
    | to disable all package-provided routes entirely.
    |
    */

    'routes'     => true,
    'prefix'     => env('WORKFLOW_PREFIX', 'workflow-engine'),
    'middleware'  => ['api'],

    /*
    |--------------------------------------------------------------------------
    | Webhook
    |--------------------------------------------------------------------------
    |
    | The URL prefix for webhook trigger endpoints.
    | Webhooks are registered as: POST /{webhook_prefix}/{uuid}
    |
    */

    'webhook_prefix' => 'workflow-webhook',

    /*
    |--------------------------------------------------------------------------
    | Execution Limits
    |--------------------------------------------------------------------------
    */

    'max_execution_time'     => env('WORKFLOW_MAX_EXECUTION', 300),
    'default_retry_count'    => 0,
    'default_retry_delay_ms' => 1000,
    'retry_backoff'          => 'exponential', // linear | exponential

    /*
    |--------------------------------------------------------------------------
    | Expression Engine
    |--------------------------------------------------------------------------
    |
    | 'safe'   — Dot-notation access + whitelisted functions (recommended)
    | 'strict' — Dot-notation access only, no function calls
    |
    */

    'expression_mode' => 'safe',

    /*
    |--------------------------------------------------------------------------
    | Node Auto-Discovery
    |--------------------------------------------------------------------------
    |
    | Directories to scan for classes with the #[AsWorkflowNode] attribute.
    | Package built-in nodes are always registered automatically.
    |
    */

    'node_discovery' => [
        'app_paths' => [
            // app_path('Workflow/Nodes'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Log Retention
    |--------------------------------------------------------------------------
    |
    | Workflow run records older than this many days will be pruned
    | by the workflow:clean-runs command. Set 0 to disable pruning.
    |
    */

    'log_retention_days' => env('WORKFLOW_LOG_RETENTION', 30),

];
