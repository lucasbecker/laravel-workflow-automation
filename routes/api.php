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

// ── API Routes (CRUD + execution) ──────────────────────────────
if (config('workflow-automation.api_routes', true)) {
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
}

// ── UI (SPA catch-all) ──────────────────────────────────────────
if (config('workflow-automation.ui_routes', true)) {
    // Static assets must be registered BEFORE the SPA catch-all
    Route::get('workflow-editor/assets/{file}', function (string $file) {
        $published = public_path("workflow-editor/assets/{$file}");
        $packaged  = __DIR__."/../ui/dist/assets/{$file}";

        $path = file_exists($published) ? $published : $packaged;

        if (! file_exists($path)) {
            abort(404);
        }

        $mime = match (pathinfo($file, PATHINFO_EXTENSION)) {
            'js'  => 'application/javascript',
            'css' => 'text/css',
            'svg' => 'image/svg+xml',
            'png' => 'image/png',
            'ico' => 'image/x-icon',
            'woff2' => 'font/woff2',
            'woff'  => 'font/woff',
            default => 'application/octet-stream',
        };

        return response()->file($path, ['Content-Type' => $mime]);
    })->name('workflow.ui.assets');

    // Favicon and other root-level static files
    Route::get('workflow-editor/{file}', function (string $file) {
        $published = public_path("workflow-editor/{$file}");
        $packaged  = __DIR__."/../ui/dist/{$file}";

        $path = file_exists($published) ? $published : $packaged;

        if (! file_exists($path)) {
            abort(404);
        }

        $mime = match (pathinfo($file, PATHINFO_EXTENSION)) {
            'svg' => 'image/svg+xml',
            'png' => 'image/png',
            'ico' => 'image/x-icon',
            default => 'application/octet-stream',
        };

        return response()->file($path, ['Content-Type' => $mime]);
    })->where('file', '.+\\.(?:svg|png|ico|webp|jpg|jpeg)$')->name('workflow.ui.static');

    // SPA catch-all — serves index.html for all non-asset routes
    Route::get('workflow-editor/{any?}', function () {
        $published = public_path('workflow-editor/index.html');
        $packaged  = __DIR__.'/../ui/dist/index.html';

        $path = file_exists($published) ? $published : $packaged;

        if (! file_exists($path)) {
            abort(404, 'Workflow UI not built. Run: cd vendor/aftandilmmd/laravel-workflow-automation/ui && npm install && npm run build');
        }

        return response()->file($path, ['Content-Type' => 'text/html']);
    })
        ->where('any', '.*')
        ->middleware(config('workflow-automation.middleware', ['api']))
        ->name('workflow.ui');
}

// ── Webhook (no auth middleware) ────────────────────────────────
if (config('workflow-automation.webhook_routes', true)) {
    $webhookPrefix = config('workflow-automation.webhook_prefix', 'workflow-webhook');

    Route::post("{$webhookPrefix}/{uuid}", [WebhookController::class, 'handle'])
        ->middleware('api')
        ->name('workflow.webhook');
}
