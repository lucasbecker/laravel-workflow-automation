<div v-pre>

# Visual Workflow Editor

The package includes a React-based visual workflow editor that lets you build workflows with a drag-and-drop canvas, configure nodes through dynamic forms, execute workflows, and view run history — all from your browser.

## Quick Start

The editor is available at `/workflow-editor` once the package is installed:

```
http://your-app.test/workflow-editor
```

No extra setup is required — the UI is served directly from the package.

![Workflow Editor](./screenshots/workflow-editor.png)

::: tip Build Required
If you installed the package via Composer, the pre-built UI files are included. If you cloned the repository directly, you need to build the UI first:

```bash
cd vendor/aftandilmmd/laravel-workflow-automation/ui
npm install && npm run build
```
:::

## Features

### Workflow List

The landing page shows all your workflows in a card grid with:

- **Create** — New workflow with name and description
- **Activate / Deactivate** — Toggle workflow status
- **Duplicate** — Clone an existing workflow
- **Delete** — Remove with confirmation dialog
- **Pagination** — Navigate through large workflow collections

### Canvas Editor

Click on any workflow to open the visual editor with three panels:

| Panel | Position | Description |
|-------|----------|-------------|
| **Node Palette** | Left sidebar | All available node types grouped by category |
| **Canvas** | Center | React Flow graph with drag, zoom, and pan |
| **Config Panel** | Right sidebar | Dynamic form for selected node's configuration |

### Adding Nodes

**Drag & Drop:** Drag a node type from the palette onto the canvas.

**Click to Add:** Click the **+** button next to any node type in the palette. The node is placed automatically on the canvas.

### Connecting Nodes

Drag from a **source handle** (right side, blue dot) to a **target handle** (left side, gray dot) to create an edge. Multi-port nodes like IF Condition show labeled handles (`true`, `false`).

### Configuring Nodes

Click a node on the canvas to open its config panel on the right. The form is generated dynamically from the node's `config_schema` and supports all field types:

| Field Type | Description |
|------------|-------------|
| `string` | Text input |
| `textarea` | Multi-line text |
| `select` | Dropdown with options (supports `depends_on` + `options_map`) |
| `multiselect` | Multi-selection dropdown |
| `boolean` | Toggle switch |
| `integer` | Integer number input |
| `number` | Float number input with `min`, `max`, `step` |
| `json` | JSON editor with validation |
| `keyvalue` | Dynamic key-value pairs |
| `array_of_objects` | Repeatable nested groups |
| `model_select` | Eloquent model picker |
| `url` | URL input with validation |
| `password` | Masked input with show/hide toggle |
| `color` | Color picker with hex input |
| `slider` | Range slider with `min`, `max`, `step` |
| `code` | Monospace code editor with `language` hint |
| `info` | Read-only information text (not a form field) |
| `section` | Collapsible section heading for grouping fields |
| `custom` | Web Component rendered via `custom_component` tag name (see [Plugin System](/advanced/plugins)) |

Fields that support expressions show a `{{ }}` indicator — you can use the expression engine syntax like `{{ item.email }}` directly in the field. Fields can also have `description` help text and `placeholder` values. Use `show_when` to conditionally show/hide fields based on other field values.

### Pinned Test Data

Pin fixed test data to any node for repeatable debugging. This is similar to n8n's pin feature.

- **Pin output** — The node is skipped during test runs and returns the pinned output directly. Useful for expensive or external nodes (HTTP requests, AI calls) where you don't want to re-execute every time.
- **Pin input** — The node still executes but receives pinned input instead of computed input. Useful for testing a node with specific data regardless of upstream changes.

**How to pin:**

1. Open a node's config panel and switch to the **Output** tab
2. Click **Test** to run the workflow up to that node
3. Once you see the output, click **Pin** to save it as fixed test data
4. A pin icon appears on the node in the canvas and an orange banner shows in the config panel

**How to unpin:** Click the **Unpin** button in the orange banner or in the Output tab.

::: tip
Pinned data only affects test runs (the **Test** button). Normal workflow execution ignores pinned data entirely.
:::

### Executing Workflows

1. Click the **Run** button in the header
2. Enter a JSON payload in the modal
3. Optionally click **Validate** to check for configuration issues
4. Click **Execute** to run the workflow

### Run History

Switch to the **Runs** tab in the left sidebar to see execution history. Click any run to view:

- Per-node execution status (completed, failed, running, skipped)
- Duration per node
- Expandable JSON input/output for each node run
- Error messages for failed nodes
- Actions: **Cancel** (running/waiting), **Replay** (re-execute with same payload)

## Configuration

### Disabling the UI

To disable the visual editor routes entirely:

```php
// config/workflow-automation.php
'editor_routes' => false,
```

### Custom Middleware

The UI routes use the same middleware as the API:

```php
'middleware' => ['api', 'auth:sanctum'],
```

### API Base URL

The editor auto-detects the API URL from the `prefix` config. If you need to override it, add to your Blade layout before the UI script:

```html
<script>
  window.__WORKFLOW_API_BASE_URL__ = '/custom-api-prefix';
</script>
```

## Publishing Assets (Optional)

For full control over the UI files, publish them to your `public/` directory:

```bash
php artisan vendor:publish --tag=workflow-automation-editor
```

This copies the built assets to `public/workflow-editor/`. Published assets take priority over the package's built-in files.

## Development

To work on the editor UI itself:

```bash
cd vendor/aftandilmmd/laravel-workflow-automation/ui

# Install dependencies
npm install

# Start dev server with HMR
npm run dev
```

The Vite dev server runs at `http://localhost:5173` and proxies API requests to `http://localhost:8000`.

### Building for Production

```bash
cd vendor/aftandilmmd/laravel-workflow-automation/ui
npm run build
```

The built files are output to `ui/dist/` and served automatically by the package.

## Tech Stack

| Library | Purpose |
|---------|---------|
| React 18 + TypeScript | UI framework |
| [React Flow](https://reactflow.dev) | Graph canvas |
| Zustand | State management |
| Tailwind CSS v4 | Styling |
| Vite | Build tool |

</div>
