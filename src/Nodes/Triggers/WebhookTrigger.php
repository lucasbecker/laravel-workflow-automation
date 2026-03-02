<?php

namespace Aftandilmmd\WorkflowAutomation\Nodes\Triggers;

use Aftandilmmd\WorkflowAutomation\Attributes\AsWorkflowNode;
use Aftandilmmd\WorkflowAutomation\Contracts\TriggerInterface;
use Aftandilmmd\WorkflowAutomation\DTOs\NodeInput;
use Aftandilmmd\WorkflowAutomation\DTOs\NodeOutput;
use Aftandilmmd\WorkflowAutomation\Enums\NodeType;

#[AsWorkflowNode(key: 'webhook', type: NodeType::Trigger, label: 'Webhook')]
class WebhookTrigger implements TriggerInterface
{
    public function inputPorts(): array
    {
        return [];
    }

    public function outputPorts(): array
    {
        return ['main'];
    }

    public static function configSchema(): array
    {
        return [
            ['key' => 'path', 'type' => 'string', 'label' => 'Webhook Path (auto-generated UUID)', 'required' => false, 'readonly' => true],
            ['key' => 'method', 'type' => 'select', 'label' => 'HTTP Method', 'options' => ['GET', 'POST', 'PUT', 'PATCH'], 'required' => true],
            ['key' => 'auth_type', 'type' => 'select', 'label' => 'Authentication', 'options' => ['none', 'basic', 'bearer', 'header_key'], 'required' => true],
            ['key' => 'auth_value', 'type' => 'string', 'label' => 'Auth Value', 'required' => false],
        ];
    }

    public function register(int $workflowId, int $nodeId, array $config): void
    {
        // Webhook route handled by WebhookController
    }

    public function unregister(int $workflowId, int $nodeId, array $config): void {}

    public function extractPayload(mixed $event): array
    {
        if ($event instanceof \Illuminate\Http\Request) {
            return [$event->all()];
        }

        return is_array($event) ? [$event] : [[]];
    }

    public function execute(NodeInput $input, array $config): NodeOutput
    {
        return NodeOutput::main($input->items);
    }
}
