<?php

namespace Aftandilmmd\WorkflowAutomation\Models;

use Aftandilmmd\WorkflowAutomation\Enums\NodeType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Workflow extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    public function getTable(): string
    {
        return config('workflow-automation.tables.workflows', 'workflows');
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'run_async' => 'boolean',
            'settings'  => 'array',
        ];
    }

    public function nodes(): HasMany
    {
        return $this->hasMany(
            config('workflow-automation.models.node', WorkflowNode::class),
        );
    }

    public function edges(): HasMany
    {
        return $this->hasMany(
            config('workflow-automation.models.edge', WorkflowEdge::class),
        );
    }

    public function runs(): HasMany
    {
        return $this->hasMany(
            config('workflow-automation.models.run', WorkflowRun::class),
        );
    }

    /**
     * Get the single trigger node for this workflow.
     */
    public function triggerNode(): ?WorkflowNode
    {
        return $this->nodes()->where('type', NodeType::Trigger)->first();
    }
}
