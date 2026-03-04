---
layout: home

hero:
  name: Build Workflows, Not Boilerplate
  tagline: Stop hardcoding automation in controllers. Design trigger → condition → action flows visually or through code — and let AI agents extend your app without touching a single PHP file.
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started/installation
    - theme: alt
      text: View on GitHub
      link: https://github.com/aftandilmmd/laravel-workflow-automation

features:
  - icon: 🔗
    title: 26 Ready-to-Use Nodes
    details: Email, HTTP, AI, delays, conditions, loops — connect them like building blocks. No code needed for common scenarios.
  - icon: ⚡
    title: Dynamic Expressions
    details: "Use {{ item.email }} to reference any data in your flow. 38+ built-in functions, fully sandboxed — no eval(), no risk."
  - icon: 🔄
    title: Reliable Execution
    details: Every node runs in order with automatic retries and backoff. Pause, resume, and pick up right where you left off.
  - icon: 🛠️
    title: Extend with One Class
    details: "Write a single PHP class with #[AsWorkflowNode] — it's instantly available in the editor, API, and registry. Zero config."
  - icon: 🌐
    title: Full REST API
    details: Create, edit, run, and monitor workflows from any frontend, dashboard, or AI agent. Complete CRUD + execution endpoints.
  - icon: ⏱️
    title: Approval Workflows
    details: Need manager sign-off? Wait/Resume nodes pause the flow, send a unique token, and continue when approved.
---

## Quick Overview

Run this once — from a command, seeder, or Tinker — and the workflow lives in the database forever.

```php
use App\Models\User;
use Aftandilmmd\WorkflowAutomation\Models\Workflow;

// 1. Create a workflow
$workflow = Workflow::create(['name' => 'Welcome Email']);

// 2. Add nodes
$trigger = $workflow->addNode('User Registered', 'model_event', [
    'model'  => User::class,
    'events' => ['created'],
]);

$sendMail = $workflow->addNode('Send Welcome', 'send_mail', [
    'to'      => '{{ item.email }}',
    'subject' => 'Welcome, {{ item.name }}!',
    'body'    => 'Thanks for joining us.',
]);

$notifyAdmin = $workflow->addNode('Notify Admin', 'send_notification', [
    'notification_class'  => \App\Notifications\NewUserSignup::class,
    'notifiable_model'    => User::class,
    'notifiable_id_field' => 'id',
]);

// 3. Connect & activate
$trigger->connect($sendMail);
$sendMail->connect($notifyAdmin);
$workflow->activate();
// That's it — every new user gets a welcome email
// and the admin is notified automatically.
```

## Why Workflow Automation?

**Turn your Laravel app into a programmable automation platform — without touching your core code.**

- **AI-Agent Friendly** — Expose a REST API that AI agents can use to build and modify workflows. Agents change your app's behavior without editing a single PHP file.
- **No-Code Scenarios** — Non-technical team members build workflows from the visual editor. New business rule = new workflow, zero deployments.
- **Core Stays Clean** — Workflows live outside your application code. Add, change, or disable scenarios without modifying controllers, models, or routes.
- **Full Observability** — Every run is recorded with per-node input/output, duration, and errors. Trace failures, debug AI responses, replay any run.
- **Extensible** — One PHP class = one custom node. Internal APIs, domain logic, third-party services — all become reusable workflow building blocks.

[Learn more about when and why to use this package →](/getting-started/why-use-this)
