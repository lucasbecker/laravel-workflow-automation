<?php

namespace Aftandilmmd\WorkflowAutomation\Database\Factories;

use Aftandilmmd\WorkflowAutomation\Models\WorkflowTag;
use Illuminate\Database\Eloquent\Factories\Factory;

class WorkflowTagFactory extends Factory
{
    protected $model = WorkflowTag::class;

    public function definition(): array
    {
        return [
            'name'  => fake()->unique()->word(),
            'color' => fake()->hexColor(),
        ];
    }
}
