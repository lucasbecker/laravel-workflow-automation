<?php

namespace Aftandilmmd\WorkflowAutomation\Credentials\Types;

use Aftandilmmd\WorkflowAutomation\Credentials\CredentialTypeInterface;

class BearerTokenCredential implements CredentialTypeInterface
{
    public static function getKey(): string
    {
        return 'bearer_token';
    }

    public static function getLabel(): string
    {
        return 'Bearer Token';
    }

    public static function schema(): array
    {
        return [
            ['key' => 'token', 'type' => 'password', 'label' => 'Token', 'required' => true],
        ];
    }
}
