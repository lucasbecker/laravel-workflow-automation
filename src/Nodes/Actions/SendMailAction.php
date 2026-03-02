<?php

namespace Aftandilmmd\WorkflowAutomation\Nodes\Actions;

use Aftandilmmd\WorkflowAutomation\Attributes\AsWorkflowNode;
use Aftandilmmd\WorkflowAutomation\DTOs\NodeInput;
use Aftandilmmd\WorkflowAutomation\DTOs\NodeOutput;
use Aftandilmmd\WorkflowAutomation\Enums\NodeType;
use Aftandilmmd\WorkflowAutomation\Nodes\BaseNode;
use Illuminate\Support\Facades\Mail;

#[AsWorkflowNode(key: 'send_mail', type: NodeType::Action, label: 'Send Mail')]
class SendMailAction extends BaseNode
{
    public static function configSchema(): array
    {
        return [
            ['key' => 'to', 'type' => 'string', 'label' => 'Recipient', 'required' => true, 'supports_expression' => true],
            ['key' => 'subject', 'type' => 'string', 'label' => 'Subject', 'required' => true, 'supports_expression' => true],
            ['key' => 'body', 'type' => 'textarea', 'label' => 'Body', 'required' => true, 'supports_expression' => true],
            ['key' => 'from', 'type' => 'string', 'label' => 'From', 'required' => false],
            ['key' => 'is_html', 'type' => 'boolean', 'label' => 'HTML?', 'required' => false],
        ];
    }

    public function execute(NodeInput $input, array $config): NodeOutput
    {
        $results = [];

        foreach ($input->items as $item) {
            try {
                Mail::raw($config['body'], function ($message) use ($config) {
                    $message->to($config['to'])->subject($config['subject']);

                    if (! empty($config['from'])) {
                        $message->from($config['from']);
                    }
                });

                $results[] = array_merge($item, ['mail_sent' => true]);
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
