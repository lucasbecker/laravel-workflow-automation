<?php

namespace Aftandilmmd\WorkflowAutomation\Events;

use Aftandilmmd\WorkflowAutomation\Models\WorkflowNodeRun;
use Illuminate\Foundation\Events\Dispatchable;

class NodeExecuted
{
    use Dispatchable;

    public function __construct(
        public readonly WorkflowNodeRun $nodeRun,
    ) {}
}
