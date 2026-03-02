<?php

namespace Aftandilmmd\WorkflowAutomation\Listeners;

use Aftandilmmd\WorkflowAutomation\Enums\NodeType;
use Aftandilmmd\WorkflowAutomation\Jobs\ExecuteWorkflowJob;
use Aftandilmmd\WorkflowAutomation\Models\WorkflowNode;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class ModelEventListener
{
    /**
     * Register model event listeners for all active model_event triggers.
     */
    public static function register(): void
    {
        $triggers = static::getActiveTriggers();

        foreach ($triggers as $trigger) {
            $modelClass = $trigger['config']['model'] ?? null;
            $events = $trigger['config']['events'] ?? [];

            if (! $modelClass || ! class_exists($modelClass) || empty($events)) {
                continue;
            }

            foreach ($events as $eventName) {
                $modelClass::{$eventName}(function (Model $model) use ($trigger, $eventName) {
                    static::handleEvent($model, $trigger, $eventName);
                });
            }
        }
    }

    private static function handleEvent(Model $model, array $trigger, string $eventName): void
    {
        $config = $trigger['config'];

        // Check only_fields filter for 'updated' event
        if ($eventName === 'updated' && ! empty($config['only_fields'])) {
            $changed = array_keys($model->getDirty());
            $watched = (array) $config['only_fields'];

            if (empty(array_intersect($changed, $watched))) {
                return;
            }
        }

        ExecuteWorkflowJob::dispatch(
            workflowId: $trigger['workflow_id'],
            payload: [$model->toArray()],
            triggerNodeId: $trigger['node_id'],
        )->onQueue(config('workflow-automation.queue', 'default'));
    }

    /**
     * @return array<int, array{workflow_id: int, node_id: int, config: array}>
     */
    private static function getActiveTriggers(): array
    {
        return Cache::remember('workflow:model_event_triggers', 60, function () {
            return WorkflowNode::query()
                ->where('type', NodeType::Trigger)
                ->where('node_key', 'model_event')
                ->whereHas('workflow', fn ($q) => $q->where('is_active', true))
                ->get()
                ->map(fn (WorkflowNode $node) => [
                    'workflow_id' => $node->workflow_id,
                    'node_id'     => $node->id,
                    'config'      => $node->config ?? [],
                ])
                ->toArray();
        });
    }
}
