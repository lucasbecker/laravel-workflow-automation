<?php

namespace Aftandilmmd\WorkflowAutomation\Events;

use Aftandilmmd\WorkflowAutomation\Models\WorkflowRun;
use Illuminate\Foundation\Events\Dispatchable;

class WorkflowResumed
{
    use Dispatchable;

    public function __construct(
        public readonly WorkflowRun $run,
        public readonly array       $payload = [],
    ) {}
}
