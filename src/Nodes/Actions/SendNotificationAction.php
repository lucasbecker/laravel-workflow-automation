<?php

namespace Aftandilmmd\WorkflowAutomation\Nodes\Actions;

use Aftandilmmd\WorkflowAutomation\Attributes\AsWorkflowNode;
use Aftandilmmd\WorkflowAutomation\DTOs\NodeInput;
use Aftandilmmd\WorkflowAutomation\DTOs\NodeOutput;
use Aftandilmmd\WorkflowAutomation\Enums\NodeType;
use Aftandilmmd\WorkflowAutomation\Nodes\BaseNode;

#[AsWorkflowNode(key: 'send_notification', type: NodeType::Action, label: 'Send Notification')]
class SendNotificationAction extends BaseNode
{
    public static function configSchema(): array
    {
        return [
            ['key' => 'notification_class', 'type' => 'string', 'label' => 'Notification Class', 'required' => true],
            ['key' => 'notifiable_model', 'type' => 'string', 'label' => 'Notifiable Model', 'required' => true],
            ['key' => 'notifiable_id_field', 'type' => 'string', 'label' => 'ID field from item', 'required' => true, 'supports_expression' => true],
        ];
    }

    public static function outputSchema(): array
    {
        return [
            'main' => [
                ['key' => 'notification_sent', 'type' => 'boolean', 'label' => 'Notification Sent'],
            ],
        ];
    }

    public function execute(NodeInput $input, array $config): NodeOutput
    {
        $results = [];

        foreach ($input->items as $item) {
            try {
                $notifiable = app($config['notifiable_model'])
                    ->find($item[$config['notifiable_id_field']] ?? null);

                if ($notifiable) {
                    $notifiable->notify(new $config['notification_class']($item));
                }

                $results[] = array_merge($item, ['notification_sent' => (bool) $notifiable]);
            } catch (\Throwable $e) {
                return NodeOutput::ports([
                    'main'  => $results,
                    'error' => [array_merge($item, ['error' => $e->getMessage()])],
                ]);
            }
        }

        return NodeOutput::main($results);
    }
}
