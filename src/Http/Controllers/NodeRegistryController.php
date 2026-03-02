<?php

namespace Aftandilmmd\WorkflowAutomation\Http\Controllers;

use Aftandilmmd\WorkflowAutomation\Registry\NodeRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class NodeRegistryController extends Controller
{
    public function __construct(
        private readonly NodeRegistry $registry,
    ) {}

    public function index(): JsonResponse
    {
        return response()->json(['data' => $this->registry->all()]);
    }

    public function show(string $key): JsonResponse
    {
        if (! $this->registry->has($key)) {
            return response()->json(['message' => "Node type '{$key}' not found."], 404);
        }

        $all = $this->registry->all();
        $node = collect($all)->firstWhere('key', $key);

        return response()->json(['data' => $node]);
    }
}
