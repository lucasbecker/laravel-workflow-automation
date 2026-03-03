---
layout: home

hero:
  name: Laravel Workflow Automation
  text: Automation Engine for Laravel
  tagline: Turn your Laravel app into a programmable automation platform. Design workflows visually, let AI agents extend your app through the API, and keep your core code clean.
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started/installation
    - theme: alt
      text: View on GitHub
      link: https://github.com/aftandilmmd/laravel-workflow-automation

features:
  - icon: 🔗
    title: 24 Built-in Nodes
    details: Triggers, actions, conditions, transformers, control flow, utility, and AI nodes ready to use out of the box.
  - icon: ⚡
    title: Expression Engine
    details: "Powerful {{ expression }} syntax with 38+ functions — no eval(), fully sandboxed recursive descent parser."
  - icon: 🔄
    title: BFS Graph Execution
    details: Breadth-first traversal with automatic multi-input merging, pause/resume, and retry with backoff.
  - icon: 🛠️
    title: Custom Nodes
    details: "Create your own nodes with a single PHP attribute: #[AsWorkflowNode]. Auto-discovered, zero config."
  - icon: 🌐
    title: Full REST API
    details: Complete CRUD + execution endpoints. Build visual workflow editors, dashboards, or integrate with any frontend.
  - icon: ⏱️
    title: Human-in-the-Loop
    details: Wait/Resume nodes for approval workflows. Pause execution, generate tokens, resume with external payload.
---

## Quick Overview

```php
use Aftandilmmd\WorkflowAutomation\Models\Workflow;

// 1. Create a workflow
$workflow = Workflow::create(['name' => 'Welcome Email']);

// 2. Add nodes
$trigger  = $workflow->addNode('Start', 'manual');
$sendMail = $workflow->addNode('Send Welcome', 'send_mail', [
    'to'      => '{{ item.email }}',
    'subject' => 'Welcome, {{ item.name }}!',
    'body'    => 'Thanks for joining us.',
]);

// 3. Connect & activate
$trigger->connect($sendMail);
$workflow->activate();

// 4. Run it
$run = $workflow->start([
    ['name' => 'Alice', 'email' => 'alice@example.com'],
]);
// $run->status === 'completed'
```

## Why Workflow Automation?

**Turn your Laravel app into a programmable automation platform — without touching your core code.**

- **AI-Agent Friendly** — Expose a REST API that AI agents can use to build and modify workflows. Agents change your app's behavior without editing a single PHP file.
- **No-Code Scenarios** — Non-technical team members build workflows from the visual editor. New business rule = new workflow, zero deployments.
- **Core Stays Clean** — Workflows live outside your application code. Add, change, or disable scenarios without modifying controllers, models, or routes.
- **Full Observability** — Every run is recorded with per-node input/output, duration, and errors. Trace failures, debug AI responses, replay any run.
- **Extensible** — One PHP class = one custom node. Internal APIs, domain logic, third-party services — all become reusable workflow building blocks.

[Learn more about when and why to use this package →](/getting-started/why-use-this)
