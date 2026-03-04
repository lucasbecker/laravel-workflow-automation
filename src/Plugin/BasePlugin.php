<?php

namespace Aftandilmmd\WorkflowAutomation\Plugin;

use Aftandilmmd\WorkflowAutomation\Contracts\PluginInterface;

abstract class BasePlugin implements PluginInterface
{
    public function boot(PluginContext $context): void
    {
        //
    }

    public function editorScripts(): array
    {
        return [];
    }

    public static function make(): static
    {
        return new static;
    }
}
