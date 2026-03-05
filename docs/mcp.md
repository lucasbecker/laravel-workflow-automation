<div v-pre>

# MCP Server

Let AI clients (Claude, GPT, Cursor, etc.) create, edit, and execute workflows through the **Model Context Protocol**.

The package ships with a built-in MCP server that exposes **20 tools** and **1 prompt** — everything an LLM needs to build complete workflows without writing a single line of PHP.

## Requirements

The MCP server requires the official Laravel MCP package:

```bash
composer require laravel/mcp
```

## Setup

Enable the MCP server in your `.env`:

```ini
WORKFLOW_MCP_ENABLED=true
```

The server registers at `/mcp/workflow` by default. Customize the path in `config/workflow-automation.php`:

```php
'mcp' => [
    'enabled' => env('WORKFLOW_MCP_ENABLED', false),
    'path'    => '/mcp/workflow',
],
```

## Tools

### Workflow Management

| Tool | Description | Read-Only |
|------|-------------|-----------|
| `list_workflows` | List all workflows with status and node/edge counts | Yes |
| `show_workflow` | Get workflow details with all nodes and edges | Yes |
| `create_workflow` | Create a new workflow | No |
| `update_workflow` | Update name or description | No |
| `delete_workflow` | Permanently delete a workflow | No |
| `activate_workflow` | Activate a workflow | No |
| `deactivate_workflow` | Deactivate a workflow | No |
| `validate_workflow` | Check for graph errors | Yes |
| `duplicate_workflow` | Clone a workflow | No |

### Node & Edge

| Tool | Description | Read-Only |
|------|-------------|-----------|
| `add_node` | Add a node to a workflow | No |
| `update_node` | Update node name or config | No |
| `remove_node` | Remove a node and its edges | No |
| `connect_nodes` | Create an edge between nodes | No |
| `remove_edge` | Remove an edge | No |

### Execution

| Tool | Description | Read-Only |
|------|-------------|-----------|
| `run_workflow` | Execute a workflow with payload | No |
| `get_run` | Get run details with per-node results | Yes |
| `list_runs` | List runs for a workflow | Yes |

### Registry

| Tool | Description | Read-Only |
|------|-------------|-----------|
| `list_node_types` | List all available node types with ports and config schema | Yes |
| `show_node_type` | Get full details for a specific node type | Yes |
| `get_available_variables` | Get available variables for a node's expressions (globals, upstream outputs, functions) | Yes |

## Prompt

The server includes a **workflow_builder** prompt that gives the LLM a comprehensive guide covering:

- All available node types (dynamically loaded from your registry)
- Port system and connection rules
- Expression engine syntax
- Step-by-step workflow building process
- Best practices

Use it with an optional `goal` argument:

```
workflow_builder(goal: "Send welcome email when user registers")
```

## Typical LLM Flow

An AI client connected to the MCP server will typically follow this sequence:

```
1. list_node_types              → Discover available nodes
2. create_workflow               → Create the workflow
3. add_node (trigger)            → Add a trigger node
4. add_node (actions...)         → Add action/condition nodes
5. connect_nodes (repeat)        → Wire the graph
6. get_available_variables       → Discover variables for expressions
7. validate_workflow             → Check for errors
8. activate_workflow             → Go live
```

## Example Session

Here's what a conversation with an AI client looks like:

> **User:** Create a workflow that sends a welcome email when a new user registers.

The AI client calls:

```
create_workflow(name: "Welcome Email")
→ { id: 1 }

add_node(workflow_id: 1, node_key: "model_event", name: "User Registered",
    config: { model: "App\\Models\\User", events: ["created"] })
→ { id: 1 }

add_node(workflow_id: 1, node_key: "send_mail", name: "Send Welcome",
    config: { send_mode: "inline", to: "{{ item.email }}", subject: "Welcome!", body: "Hi {{ item.name }}!" })
→ { id: 2 }

connect_nodes(source_node_id: 1, target_node_id: 2)
→ { id: 1 }

validate_workflow(workflow_id: 1)
→ { valid: true, errors: [] }

activate_workflow(workflow_id: 1)
→ { is_active: true }
```

## Connecting AI Clients

### Claude Desktop

Add to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "workflow": {
      "url": "http://your-app.test/mcp/workflow"
    }
  }
}
```

### Cursor

Add the MCP server URL in Cursor's settings under the MCP section:

```
http://your-app.test/mcp/workflow
```

### Any MCP Client

The server supports the standard MCP protocol over HTTP. Point any MCP-compatible client to:

```
POST http://your-app.test/mcp/workflow
```

## Security

The MCP endpoint inherits your application's middleware. By default it uses the `api` middleware group configured in `workflow-automation.php`.

For production, consider adding authentication middleware:

```php
// config/workflow-automation.php
'middleware' => ['api', 'auth:sanctum'],
```

</div>
