<?php

namespace Aftandilmmd\WorkflowAutomation\Http\Controllers;

use Aftandilmmd\WorkflowAutomation\Http\Requests\StoreNodeRequest;
use Aftandilmmd\WorkflowAutomation\Http\Requests\UpdateNodeRequest;
use Aftandilmmd\WorkflowAutomation\Http\Resources\WorkflowNodeResource;
use Aftandilmmd\WorkflowAutomation\Models\Workflow;
use Aftandilmmd\WorkflowAutomation\Models\WorkflowNode;
use Aftandilmmd\WorkflowAutomation\Services\WorkflowService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class WorkflowNodeController extends Controller
{
    public function __construct(
        private readonly WorkflowService $service,
    ) {}

    public function store(StoreNodeRequest $request, Workflow $workflow): WorkflowNodeResource
    {
        $node = $this->service->addNode(
            workflow: $workflow,
            nodeKey: $request->validated('node_key'),
            config: $request->validated('config', []),
            name: $request->validated('name'),
        );

        if ($request->has('position_x')) {
            $node->update([
                'position_x' => $request->integer('position_x'),
                'position_y' => $request->integer('position_y'),
            ]);
        }

        return new WorkflowNodeResource($node);
    }

    public function update(UpdateNodeRequest $request, Workflow $workflow, WorkflowNode $node): WorkflowNodeResource
    {
        $node->update($request->validated());

        return new WorkflowNodeResource($node->fresh());
    }

    public function destroy(Workflow $workflow, WorkflowNode $node): JsonResponse
    {
        $this->service->removeNode($node->id);

        return response()->json(['message' => 'Node deleted.'], 200);
    }

    public function position(Request $request, Workflow $workflow, WorkflowNode $node): WorkflowNodeResource
    {
        $request->validate([
            'position_x' => ['required', 'integer'],
            'position_y' => ['required', 'integer'],
        ]);

        $node->update([
            'position_x' => $request->integer('position_x'),
            'position_y' => $request->integer('position_y'),
        ]);

        return new WorkflowNodeResource($node->fresh());
    }
}
