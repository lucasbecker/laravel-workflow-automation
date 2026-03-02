<?php

namespace Aftandilmmd\WorkflowAutomation\Events;

use Aftandilmmd\WorkflowAutomation\Models\WorkflowRun;
use Illuminate\Foundation\Events\Dispatchable;

class WorkflowStarted
{
    use Dispatchable;

    public function __construct(
        public readonly WorkflowRun $run,
    ) {}
}
