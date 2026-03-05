<?php

namespace Aftandilmmd\WorkflowAutomation\Jobs;

use Aftandilmmd\WorkflowAutomation\Engine\GraphExecutor;
use Aftandilmmd\WorkflowAutomation\Models\Workflow;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ExecuteWorkflowJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 300;

    public function __construct(
        public readonly int   $workflowId,
        public readonly array $payload = [],
        public readonly ?int  $triggerNodeId = null,
    ) {
        $this->timeout = (int) config('workflow-automation.max_execution_time', 300);
    }

    public function handle(GraphExecutor $executor): void
    {
        $workflow = Workflow::find($this->workflowId);

        if (! $workflow) {
            Log::warning("WorkflowJob skipped: workflow_id={$this->workflowId} not found.");

            return;
        }

        if (! $workflow->is_active) {
            Log::info("WorkflowJob skipped: workflow_id={$this->workflowId} is inactive.");

            return;
        }

        $executor->execute($workflow, $this->payload, $this->triggerNodeId);
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("WorkflowJob failed: workflow_id={$this->workflowId}", [
            'error' => $exception->getMessage(),
        ]);
    }
}
