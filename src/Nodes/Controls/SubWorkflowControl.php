<?php

namespace Aftandilmmd\WorkflowAutomation\Nodes\Controls;

use Aftandilmmd\WorkflowAutomation\Attributes\AsWorkflowNode;
use Aftandilmmd\WorkflowAutomation\DTOs\NodeInput;
use Aftandilmmd\WorkflowAutomation\DTOs\NodeOutput;
use Aftandilmmd\WorkflowAutomation\Engine\GraphExecutor;
use Aftandilmmd\WorkflowAutomation\Enums\NodeType;
use Aftandilmmd\WorkflowAutomation\Jobs\ExecuteWorkflowJob;
use Aftandilmmd\WorkflowAutomation\Models\Workflow;
use Aftandilmmd\WorkflowAutomation\Nodes\BaseNode;

#[AsWorkflowNode(key: 'sub_workflow', type: NodeType::Control, label: 'Sub Workflow')]
class SubWorkflowControl extends BaseNode
{
    public static function configSchema(): array
    {
        return [
            ['key' => 'workflow_id', 'type' => 'workflow_select', 'label' => 'Workflow', 'required' => true],
            ['key' => 'pass_items', 'type' => 'boolean', 'label' => 'Pass items as payload', 'required' => false],
            ['key' => 'wait_for_result', 'type' => 'boolean', 'label' => 'Wait for result', 'required' => false],
        ];
    }

    public function execute(NodeInput $input, array $config): NodeOutput
    {
        $workflow = Workflow::find($config['workflow_id']);

        if (! $workflow) {
            return NodeOutput::ports([
                'main'  => [],
                'error' => [['error' => "Workflow not found: {$config['workflow_id']}"]],
            ]);
        }

        $payload = ($config['pass_items'] ?? false) ? $input->items : [];

        if ($config['wait_for_result'] ?? false) {
            $executor = app(GraphExecutor::class);
            $run = $executor->execute($workflow, $payload);

            return NodeOutput::main([[
                'sub_workflow_run_id' => $run->id,
                'status'              => $run->status->value,
            ]]);
        }

        ExecuteWorkflowJob::dispatch($workflow->id, $payload);

        return NodeOutput::main($input->items);
    }
}
