<?php

namespace Aftandilmmd\WorkflowAutomation\Nodes;

use Aftandilmmd\WorkflowAutomation\Contracts\NodeInterface;

abstract class BaseNode implements NodeInterface
{
    public function inputPorts(): array
    {
        return ['main'];
    }

    public function outputPorts(): array
    {
        return ['main', 'error'];
    }

    public static function configSchema(): array
    {
        return [];
    }

    public static function outputSchema(): array
    {
        return [];
    }
}
