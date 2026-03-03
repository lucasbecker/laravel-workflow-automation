<?php

namespace Aftandilmmd\WorkflowAutomation\Nodes\Actions;

use Aftandilmmd\WorkflowAutomation\Attributes\AsWorkflowNode;
use Aftandilmmd\WorkflowAutomation\DTOs\NodeInput;
use Aftandilmmd\WorkflowAutomation\DTOs\NodeOutput;
use Aftandilmmd\WorkflowAutomation\Enums\NodeType;
use Aftandilmmd\WorkflowAutomation\Nodes\BaseNode;

#[AsWorkflowNode(key: 'ai', type: NodeType::Action, label: 'AI')]
class AiAction extends BaseNode
{
    public static function configSchema(): array
    {
        return [
            ['key' => 'prompt',          'type' => 'textarea', 'label' => 'Prompt',              'required' => true,  'supports_expression' => true],
            ['key' => 'system_prompt',   'type' => 'textarea', 'label' => 'System Prompt',       'required' => false, 'supports_expression' => true],
            ['key' => 'provider',        'type' => 'string',   'label' => 'Provider',            'required' => false, 'supports_expression' => false],
            ['key' => 'model',           'type' => 'string',   'label' => 'Model',               'required' => false, 'supports_expression' => false],
            ['key' => 'temperature',     'type' => 'string',   'label' => 'Temperature (0-2)',   'required' => false, 'supports_expression' => false],
            ['key' => 'max_tokens',      'type' => 'integer',  'label' => 'Max Tokens',          'required' => false],
            ['key' => 'output_key',      'type' => 'string',   'label' => 'Output Key',          'required' => false, 'supports_expression' => false],
        ];
    }

    public function execute(NodeInput $input, array $config): NodeOutput
    {
        $this->ensureLaravelAiInstalled();

        $results = [];

        foreach ($input->items as $item) {
            try {
                $response = $this->callAi($config);

                $outputKey = $config['output_key'] ?? 'ai_response';

                $results[] = array_merge($item, [
                    $outputKey => $response['text'],
                    'ai_usage' => $response['usage'],
                ]);
            } catch (\Throwable $e) {
                return NodeOutput::ports([
                    'main'  => $results,
                    'error' => [array_merge($item, ['error' => $e->getMessage()])],
                ]);
            }
        }

        return NodeOutput::main($results);
    }

    protected function callAi(array $config): array
    {
        $agent = \Laravel\Ai\agent(
            instructions: $config['system_prompt'] ?? '',
        );

        $args = [];

        $provider = $config['provider'] ?? config('workflow-automation.ai.default_provider');
        if (! empty($provider)) {
            $args['provider'] = $this->resolveProvider($provider);
        }

        $model = $config['model'] ?? config('workflow-automation.ai.default_model');
        if (! empty($model)) {
            $args['model'] = $model;
        }

        $maxTokens = $config['max_tokens'] ?? config('workflow-automation.ai.max_tokens');
        if (! empty($maxTokens) && $maxTokens > 0) {
            $args['maxTokens'] = (int) $maxTokens;
        }

        if (isset($config['temperature']) && $config['temperature'] !== '') {
            $args['temperature'] = (float) $config['temperature'];
        }

        $response = $agent->prompt($config['prompt'], ...$args);

        return [
            'text'  => $response->text,
            'usage' => [
                'input_tokens'  => $response->usage->inputTokens ?? null,
                'output_tokens' => $response->usage->outputTokens ?? null,
            ],
        ];
    }

    protected function resolveProvider(string $provider): mixed
    {
        if (! class_exists(\Laravel\Ai\Enums\Lab::class)) {
            throw new \RuntimeException(
                'The AI node requires the laravel/ai package. Install it with: composer require laravel/ai'
            );
        }

        $supported = ['openai', 'anthropic', 'gemini', 'groq', 'mistral', 'deepseek', 'ollama', 'xai', 'cohere'];
        $key = strtolower($provider);

        if (! in_array($key, $supported)) {
            throw new \InvalidArgumentException(
                "Unknown AI provider: {$provider}. Supported: " . implode(', ', $supported)
            );
        }

        $map = [
            'openai'    => \Laravel\Ai\Enums\Lab::OpenAI,
            'anthropic' => \Laravel\Ai\Enums\Lab::Anthropic,
            'gemini'    => \Laravel\Ai\Enums\Lab::Gemini,
            'groq'      => \Laravel\Ai\Enums\Lab::Groq,
            'mistral'   => \Laravel\Ai\Enums\Lab::Mistral,
            'deepseek'  => \Laravel\Ai\Enums\Lab::DeepSeek,
            'ollama'    => \Laravel\Ai\Enums\Lab::Ollama,
            'xai'       => \Laravel\Ai\Enums\Lab::xAI,
            'cohere'    => \Laravel\Ai\Enums\Lab::Cohere,
        ];

        return $map[$key];
    }

    protected function ensureLaravelAiInstalled(): void
    {
        if (! function_exists('\Laravel\Ai\agent')) {
            throw new \RuntimeException(
                'The AI node requires the laravel/ai package. Install it with: composer require laravel/ai'
            );
        }
    }
}
