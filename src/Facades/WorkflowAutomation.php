<?php

namespace Aftandilmmd\WorkflowAutomation\Facades;

use Aftandilmmd\WorkflowAutomation\Plugin\PluginManager;
use Illuminate\Support\Facades\Facade;

/**
 * @method static void plugin(\Aftandilmmd\WorkflowAutomation\Contracts\PluginInterface $plugin)
 * @method static \Aftandilmmd\WorkflowAutomation\Plugin\PluginRegistry plugins()
 * @method static \Aftandilmmd\WorkflowAutomation\Plugin\PluginContext context()
 *
 * @see PluginManager
 */
class WorkflowAutomation extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return PluginManager::class;
    }
}
