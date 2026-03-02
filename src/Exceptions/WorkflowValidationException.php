<?php

namespace Aftandilmmd\WorkflowAutomation\Exceptions;

class WorkflowValidationException extends WorkflowException
{
    /**
     * @param  array<int, string>  $errors  List of validation error messages.
     */
    public function __construct(
        public readonly array $errors = [],
        string $message = 'Workflow validation failed.',
    ) {
        parent::__construct($message);
    }
}
