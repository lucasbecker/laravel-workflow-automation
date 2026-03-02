<?php

use Aftandilmmd\WorkflowAutomation\Http\Controllers\NodeRegistryController;
use Aftandilmmd\WorkflowAutomation\Http\Controllers\WebhookController;
use Aftandilmmd\WorkflowAutomation\Http\Controllers\WorkflowController;
use Aftandilmmd\WorkflowAutomation\Http\Controllers\WorkflowEdgeController;
use Aftandilmmd\WorkflowAutomation\Http\Controllers\WorkflowNodeController;
use Aftandilmmd\WorkflowAutomation\Http\Controllers\WorkflowRunController;
use Illuminate\Support\Facades\Route;

$prefix     = config('workflow-automation.prefix', 'workflow-engine');
$middleware = config('workflow-automation.middleware', ['api']);

Route::prefix($prefix)
    ->middleware($middleware)
    ->group(function () {
        // ── Workflows ────────────────────────────────────────────
        Route::apiResource('workflows', WorkflowController::class);
        Route::post('workflows/{workflow}/activate', [WorkflowController::class, 'activate']);
        Route::post('workflows/{workflow}/deactivate', [WorkflowController::class, 'deactivate']);
        Route::post('workflows/{workflow}/run', [WorkflowController::class, 'run']);
        Route::post('workflows/{workflow}/duplicate', [WorkflowController::class, 'duplicate']);
        Route::post('workflows/{workflow}/validate', [WorkflowController::class, 'validateWorkflow']);

        // ── Nodes ────────────────────────────────────────────────
        Route::post('workflows/{workflow}/nodes', [WorkflowNodeController::class, 'store']);
        Route::put('workflows/{workflow}/nodes/{node}', [WorkflowNodeController::class, 'update']);
        Route::delete('workflows/{workflow}/nodes/{node}', [WorkflowNodeController::class, 'destroy']);
        Route::patch('workflows/{workflow}/nodes/{node}/position', [WorkflowNodeController::class, 'position']);

        // ── Edges ────────────────────────────────────────────────
        Route::post('workflows/{workflow}/edges', [WorkflowEdgeController::class, 'store']);
        Route::delete('workflows/{workflow}/edges/{edge}', [WorkflowEdgeController::class, 'destroy']);

        // ── Runs ─────────────────────────────────────────────────
        Route::get('workflows/{workflow}/runs', [WorkflowRunController::class, 'index']);
        Route::get('runs/{run}', [WorkflowRunController::class, 'show']);
        Route::post('runs/{run}/cancel', [WorkflowRunController::class, 'cancel']);
        Route::post('runs/{run}/resume', [WorkflowRunController::class, 'resume']);
        Route::post('runs/{run}/replay', [WorkflowRunController::class, 'replay']);
        Route::post('runs/{run}/retry', [WorkflowRunController::class, 'retryFromFailure']);
        Route::post('runs/{run}/retry-node', [WorkflowRunController::class, 'retryNode']);

        // ── Node Registry ────────────────────────────────────────
        Route::get('registry/nodes', [NodeRegistryController::class, 'index']);
        Route::get('registry/nodes/{key}', [NodeRegistryController::class, 'show']);
    });

// ── Webhook (no auth middleware) ────────────────────────────────
$webhookPrefix = config('workflow-automation.webhook_prefix', 'workflow-webhook');

Route::post("{$webhookPrefix}/{uuid}", [WebhookController::class, 'handle'])
    ->middleware('api')
    ->name('workflow.webhook');
