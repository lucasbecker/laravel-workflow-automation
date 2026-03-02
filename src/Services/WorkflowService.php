<?php

namespace Aftandilmmd\WorkflowAutomation\Services;

use Aftandilmmd\WorkflowAutomation\Engine\GraphExecutor;
use Aftandilmmd\WorkflowAutomation\Engine\GraphValidator;
use Aftandilmmd\WorkflowAutomation\Enums\NodeType;
use Aftandilmmd\WorkflowAutomation\Enums\RunStatus;
use Aftandilmmd\WorkflowAutomation\Exceptions\WorkflowException;
use Aftandilmmd\WorkflowAutomation\Jobs\ExecuteWorkflowJob;
use Aftandilmmd\WorkflowAutomation\Models\Workflow;
use Aftandilmmd\WorkflowAutomation\Models\WorkflowEdge;
use Aftandilmmd\WorkflowAutomation\Models\WorkflowNode;
use Aftandilmmd\WorkflowAutomation\Models\WorkflowRun;

class WorkflowService
{
    public function __construct(
        private readonly GraphExecutor  $executor,
        private readonly GraphValidator $validator,
    ) {}

    // ── Execution ──────────────────────────────────────────────────

    /**
     * Run a workflow synchronously.
     */
    public function run(int|Workflow $workflow, array $payload = []): WorkflowRun
    {
        $workflow = $this->resolveWorkflow($workflow);

        return $this->executor->execute($workflow, $payload);
    }

    /**
     * Dispatch a workflow to the queue for async execution.
     */
    public function runAsync(int|Workflow $workflow, array $payload = []): void
    {
        $workflow = $this->resolveWorkflow($workflow);

        ExecuteWorkflowJob::dispatch($workflow->id, $payload)
            ->onQueue(config('workflow-automation.queue', 'default'));
    }

    /**
     * Resume a waiting workflow run.
     */
    public function resume(int|WorkflowRun $run, string $resumeToken, array $payload = []): WorkflowRun
    {
        $run = $this->resolveRun($run);

        // Find the waiting node run that holds this resume token
        $nodeRun = $run->nodeRuns()
            ->where('status', 'completed')
            ->whereJsonContains('output->resume->0->resume_token', $resumeToken)
            ->first();

        $resumeNodeId = $nodeRun?->node_id ?? 0;

        return $this->executor->resume($run, $resumeNodeId, $payload);
    }

    /**
     * Cancel a running or waiting workflow.
     */
    public function cancel(int|WorkflowRun $run): WorkflowRun
    {
        $run = $this->resolveRun($run);

        if ($run->isFinished()) {
            return $run;
        }

        $run->update([
            'status'      => RunStatus::Cancelled,
            'finished_at' => now(),
        ]);

        return $run->fresh();
    }

    /**
     * Replay a completed/failed run with its original payload.
     */
    public function replay(int|WorkflowRun $run): WorkflowRun
    {
        $run = $this->resolveRun($run);

        return $this->run($run->workflow_id, $run->initial_payload ?? []);
    }

    /**
     * Retry a failed run from the point of failure.
     */
    public function retryFromFailure(int|WorkflowRun $run): WorkflowRun
    {
        $run = $this->resolveRun($run);

        if ($run->status !== RunStatus::Failed) {
            throw new WorkflowException("Can only retry failed runs. Current status: {$run->status->value}");
        }

        return $this->executor->retryFromFailure($run);
    }

    /**
     * Retry a single failed node within a run.
     */
    public function retryNode(int|WorkflowRun $run, int $nodeId): WorkflowRun
    {
        $run = $this->resolveRun($run);

        if ($run->status !== RunStatus::Failed) {
            throw new WorkflowException("Can only retry nodes in failed runs. Current status: {$run->status->value}");
        }

        return $this->executor->retryNode($run, $nodeId);
    }

    // ── CRUD ───────────────────────────────────────────────────────

    public function create(array $data): Workflow
    {
        return Workflow::create($data);
    }

    public function update(int|Workflow $workflow, array $data): Workflow
    {
        $workflow = $this->resolveWorkflow($workflow);
        $workflow->update($data);

        return $workflow->fresh();
    }

    public function delete(int|Workflow $workflow): void
    {
        $workflow = $this->resolveWorkflow($workflow);
        $workflow->delete();
    }

    public function duplicate(int|Workflow $workflow): Workflow
    {
        $workflow = $this->resolveWorkflow($workflow);

        $new = $workflow->replicate();
        $new->name = $workflow->name.' (Copy)';
        $new->is_active = false;
        $new->save();

        $nodeIdMap = [];
        foreach ($workflow->nodes as $node) {
            $newNode = $node->replicate();
            $newNode->workflow_id = $new->id;
            $newNode->save();
            $nodeIdMap[$node->id] = $newNode->id;
        }

        foreach ($workflow->edges as $edge) {
            $new->edges()->create([
                'source_node_id' => $nodeIdMap[$edge->source_node_id],
                'source_port'    => $edge->source_port,
                'target_node_id' => $nodeIdMap[$edge->target_node_id],
                'target_port'    => $edge->target_port,
            ]);
        }

        return $new->load(['nodes', 'edges']);
    }

    // ── State ──────────────────────────────────────────────────────

    public function activate(int|Workflow $workflow): Workflow
    {
        $workflow = $this->resolveWorkflow($workflow);
        $workflow->update(['is_active' => true]);

        return $workflow->fresh();
    }

    public function deactivate(int|Workflow $workflow): Workflow
    {
        $workflow = $this->resolveWorkflow($workflow);
        $workflow->update(['is_active' => false]);

        return $workflow->fresh();
    }

    /**
     * Validate a workflow and return error messages.
     *
     * @return string[]
     */
    public function validate(int|Workflow $workflow): array
    {
        $workflow = $this->resolveWorkflow($workflow);

        return $this->validator->errors($workflow);
    }

    // ── Builder helpers ────────────────────────────────────────────

    public function addNode(
        int|Workflow $workflow,
        string $nodeKey,
        array $config = [],
        ?string $name = null,
    ): WorkflowNode {
        $workflow = $this->resolveWorkflow($workflow);

        return $workflow->nodes()->create([
            'type'     => app(\Aftandilmmd\WorkflowAutomation\Registry\NodeRegistry::class)->getMeta($nodeKey)['type'] ?? NodeType::Action,
            'node_key' => $nodeKey,
            'name'     => $name,
            'config'   => $config,
        ]);
    }

    public function connect(
        int $sourceNodeId,
        int $targetNodeId,
        string $sourcePort = 'main',
        string $targetPort = 'main',
    ): WorkflowEdge {
        $sourceNode = WorkflowNode::findOrFail($sourceNodeId);

        return WorkflowEdge::create([
            'workflow_id'    => $sourceNode->workflow_id,
            'source_node_id' => $sourceNodeId,
            'source_port'    => $sourcePort,
            'target_node_id' => $targetNodeId,
            'target_port'    => $targetPort,
        ]);
    }

    public function removeNode(int $nodeId): void
    {
        WorkflowNode::findOrFail($nodeId)->delete();
    }

    public function removeEdge(int $edgeId): void
    {
        WorkflowEdge::findOrFail($edgeId)->delete();
    }

    // ── Helpers ────────────────────────────────────────────────────

    private function resolveWorkflow(int|Workflow $workflow): Workflow
    {
        return $workflow instanceof Workflow ? $workflow : Workflow::findOrFail($workflow);
    }

    private function resolveRun(int|WorkflowRun $run): WorkflowRun
    {
        return $run instanceof WorkflowRun ? $run : WorkflowRun::findOrFail($run);
    }
}
