<?php

namespace Aftandilmmd\WorkflowAutomation\Contracts;

use Aftandilmmd\WorkflowAutomation\Plugin\PluginContext;

interface PluginInterface
{
    /**
     * Unique identifier for this plugin (e.g. 'acme/workflow-slack').
     */
    public function getId(): string;

    /**
     * Human-readable name.
     */
    public function getName(): string;

    /**
     * Called during ServiceProvider register phase.
     * Use this to register node classes, expression functions, middleware.
     */
    public function register(PluginContext $context): void;

    /**
     * Called during ServiceProvider boot phase.
     * Use this to register routes, event listeners, publish assets.
     */
    public function boot(PluginContext $context): void;

    /**
     * Static factory for fluent API.
     */
    public static function make(): static;
}
