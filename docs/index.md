---
layout: home

hero:
  name: Laravel Workflow Automation
  text: Graph-Based Workflow Engine
  tagline: Build visual, configurable workflow graphs in Laravel — triggers, conditions, actions, loops, and more.
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
