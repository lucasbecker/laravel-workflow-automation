---
layout: home

hero:
  name: Build Workflows, Not Boilerplate
  tagline: "Stop hardcoding automation in controllers.\nDesign trigger → condition → action flows visually or through code — and let AI agents extend your app without touching a single PHP file."
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started/installation
    - theme: alt
      text: View on GitHub
      link: https://github.com/aftandilmmd/laravel-workflow-automation

features:
  - icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 22V7a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a1 1 0 0 0-1-1H2"/><rect x="14" y="2" width="8" height="8" rx="1"/></svg>'
    title: 26 Ready-to-Use Nodes
    details: Email, HTTP, AI, delays, conditions, loops — connect them like building blocks. No code needed for common scenarios.
  - icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>'
    title: Visual Editor
    details: Drag-and-drop workflow builder with live preview. Design complex automations visually — no code needed for common scenarios.
    link: /ui-editor
  - icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 18V5"/><path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4"/><path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5"/><path d="M17.997 5.125a4 4 0 0 1 2.526 5.77"/><path d="M18 18a4 4 0 0 0 2-7.464"/><path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517"/><path d="M6 18a4 4 0 0 1-2-7.464"/><path d="M6.003 5.125a4 4 0 0 0-2.526 5.77"/></svg>'
    title: AI Node
    details: Connect any LLM to your workflows. Classify, summarize, extract, generate — AI becomes just another node in your flow.
  - icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>'
    title: Reliable Execution
    details: Every node runs in order with automatic retries and backoff. Pause, resume, and pick up right where you left off.
  - icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z"/></svg>'
    title: Plugin System
    details: Bundle custom nodes, middleware, and event listeners into reusable plugins. Share across projects or publish as packages.
  - icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>'
    title: Full REST API
    details: Create, edit, run, and monitor workflows from any frontend, dashboard, or AI agent. Complete CRUD + execution endpoints.
---

<div style="margin: 2rem 0;">
  <img src="./screenshots/workflow-editor.png" alt="Visual Workflow Editor" style="border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.1);" />
</div>

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
