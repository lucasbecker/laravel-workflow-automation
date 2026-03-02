# Laravel Workflow Automation

Graph-based workflow automation engine for Laravel. N8N-inspired logic with triggers, conditions, actions, loops, and more.

## Package Info

- **Namespace:** `Aftandilmmd\WorkflowAutomation`
- **PHP:** >= 8.3
- **Laravel:** 10+, 11+, 12+
- **Dependencies:** Zero beyond Laravel illuminate/*

## Architecture

### Core Layers
- **Registry** (`NodeRegistry`) — Attribute-based auto-discovery + manual registration of nodes
- **Engine** (`GraphExecutor`, `GraphValidator`, `NodeRunner`, `ExpressionEvaluator`) — BFS graph traversal, cycle detection, retry logic, safe expression parsing
- **Service** (`WorkflowService`) — Convenience layer wrapping engine (NOT sole entry point)
- **HTTP** — REST API controllers under configurable prefix

### Key Design Decisions
- **Expression engine:** Custom recursive descent parser. NO eval(), NO external deps
- **Delay:** Queue-based via `ResumeWorkflowJob::dispatch()->delay()`. Never `sleep()`
- **Node registration:** `#[AsWorkflowNode]` attribute for auto-discovery
- **Status tracking:** PHP backed enums (`RunStatus`, `NodeRunStatus`, `NodeType`)
- **Tables/Models:** Config-driven via `getTable()` and model class config
- **Code node:** Expression-only, no closures or arbitrary PHP

### 22 Node Types
- **Triggers (4):** manual, model_event, schedule, webhook
- **Actions (5):** send_mail, http_request, update_model, dispatch_job, send_notification
- **Conditions (2):** if_condition, switch
- **Transformers (2):** set_fields, parse_data
- **Controls (6):** loop, merge, delay, sub_workflow, error_handler, wait_resume
- **Utilities (3):** filter, aggregate, code

## Commands

```bash
# Run tests
cd packages/laravel-workflow-automation && ./vendor/bin/pest

# Run specific test file
./vendor/bin/pest tests/Unit/Engine/ExpressionEvaluatorTest.php

# Install dependencies
composer install
```

## Project Structure

```
src/
├── Attributes/          # AsWorkflowNode attribute
├── Contracts/           # NodeInterface, TriggerInterface, ExpressionEvaluatorInterface
├── Console/Commands/    # schedule-run, clean-runs, validate
├── DTOs/                # NodeInput, NodeOutput, ExecutionContext
├── Engine/              # GraphExecutor, GraphValidator, NodeRunner, ExpressionEvaluator
├── Enums/               # NodeType, RunStatus, NodeRunStatus
├── Events/              # WorkflowStarted/Completed/Failed, NodeExecuted/Failed, WorkflowResumed
├── Exceptions/          # WorkflowException, CycleDetected, ExpressionException, etc.
├── Facades/             # Workflow facade
├── Http/                # Controllers, Requests, Resources
├── Jobs/                # ExecuteWorkflowJob, ResumeWorkflowJob
├── Listeners/           # ModelEventListener
├── Models/              # Workflow, WorkflowNode, WorkflowEdge, WorkflowRun, WorkflowNodeRun
├── Nodes/               # All 22 node implementations organized by type
├── Registry/            # NodeRegistry
├── Services/            # WorkflowService
config/                  # workflow-automation.php
database/
├── factories/           # 5 model factories
├── migrations/          # 5 migration files
routes/                  # api.php
tests/
├── Unit/Engine/         # ExpressionEvaluator, GraphValidator, GraphExecutor, NodeRunner
├── Unit/Nodes/          # IfCondition, Switch, Loop, Filter, Aggregate, SetFields, Code
├── Unit/Registry/       # NodeRegistry
├── Feature/             # WorkflowApi, WorkflowExecution, WebhookTrigger, WaitResume
```

## Conventions

- All models use `$guarded = []` with config-driven table names
- Factories available for all 5 models with state methods
- DTOs are `readonly` classes
- Nodes extend `BaseNode` or implement `NodeInterface` directly
- No Spatie package-tools — plain ServiceProvider
- Testing with Pest + Orchestra Testbench + SQLite in-memory
