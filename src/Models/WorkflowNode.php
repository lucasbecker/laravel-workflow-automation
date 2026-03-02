<?php

namespace Aftandilmmd\WorkflowAutomation\Models;

use Aftandilmmd\WorkflowAutomation\Enums\NodeType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkflowNode extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function getTable(): string
    {
        return config('workflow-automation.tables.nodes', 'workflow_nodes');
    }

    protected function casts(): array
    {
        return [
            'type'   => NodeType::class,
            'config' => 'array',
        ];
    }

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(
            config('workflow-automation.models.workflow', Workflow::class),
        );
    }

    public function outgoingEdges(): HasMany
    {
        return $this->hasMany(
            config('workflow-automation.models.edge', WorkflowEdge::class),
            'source_node_id',
        );
    }

    public function incomingEdges(): HasMany
    {
        return $this->hasMany(
            config('workflow-automation.models.edge', WorkflowEdge::class),
            'target_node_id',
        );
    }

    public function nodeRuns(): HasMany
    {
        return $this->hasMany(
            config('workflow-automation.models.node_run', WorkflowNodeRun::class),
            'node_id',
        );
    }
}
