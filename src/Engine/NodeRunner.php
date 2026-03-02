<?php

namespace Aftandilmmd\WorkflowAutomation\Engine;

use Aftandilmmd\WorkflowAutomation\Contracts\NodeInterface;
use Aftandilmmd\WorkflowAutomation\DTOs\NodeInput;
use Aftandilmmd\WorkflowAutomation\DTOs\NodeOutput;

class NodeRunner
{
    /**
     * Execute a node with optional retry support.
     *
     * If the node has an 'error' output port and execution fails after all retries,
     * the error is routed to that port instead of being thrown.
     */
    public function run(
        NodeInterface $node,
        NodeInput $input,
        array $config,
        int $maxRetries = 0,
        int $retryDelayMs = 1000,
        string $backoffStrategy = 'exponential',
    ): NodeOutput {
        $attempt = 0;

        while (true) {
            try {
                return $node->execute($input, $config);
            } catch (\Throwable $e) {
                $attempt++;

                if ($attempt > $maxRetries) {
                    // If the node declares an error port, route errors there
                    if (in_array('error', $node->outputPorts())) {
                        return NodeOutput::ports([
                            'main'  => [],
                            'error' => [['error' => $e->getMessage(), 'input' => $input->items]],
                        ]);
                    }

                    throw $e;
                }

                $delay = $this->calculateDelay($attempt, $retryDelayMs, $backoffStrategy);
                usleep($delay * 1000);
            }
        }
    }

    /**
     * Calculate retry delay in milliseconds.
     */
    private function calculateDelay(int $attempt, int $baseDelayMs, string $strategy): int
    {
        $delay = match ($strategy) {
            'exponential' => $baseDelayMs * (2 ** ($attempt - 1)),
            default       => $baseDelayMs * $attempt, // linear
        };

        // Add jitter (±25%)
        $jitter = (int) ($delay * 0.25);

        return $delay + random_int(-$jitter, $jitter);
    }
}
