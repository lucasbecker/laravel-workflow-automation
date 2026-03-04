// ── API Response Types (matches Laravel Resources exactly) ──

export interface Workflow {
  id: number
  name: string
  description: string | null
  is_active: boolean
  run_async: boolean
  settings: Record<string, unknown> | null
  created_via: CreatedVia | null
  created_at: string
  updated_at: string
  nodes?: WorkflowNode[]
  edges?: WorkflowEdge[]
}

export interface WorkflowNode {
  id: number
  workflow_id: number
  type: NodeType
  node_key: string
  name: string | null
  config: Record<string, unknown> | null
  position_x: number | null
  position_y: number | null
  created_at: string
  updated_at: string
}

export interface WorkflowEdge {
  id: number
  workflow_id: number
  source_node_id: number
  target_node_id: number
  source_port: string
  target_port: string
  created_at: string
  updated_at: string
}

export interface WorkflowRun {
  id: number
  workflow_id: number
  status: RunStatus
  trigger_node_id: number | null
  initial_payload: Record<string, unknown> | null
  error_message: string | null
  duration_ms: number | null
  started_at: string | null
  finished_at: string | null
  created_at: string
  updated_at: string
  node_runs?: WorkflowNodeRun[]
}

export interface WorkflowNodeRun {
  id: number
  workflow_run_id: number
  node_id: number
  status: NodeRunStatus
  input: Record<string, unknown> | null
  output: Record<string, unknown> | null
  error_message: string | null
  duration_ms: number | null
  attempts: number | null
  executed_at: string | null
  created_at: string
  updated_at: string
}

export interface RegistryNode {
  key: string
  label: string
  type: NodeType
  input_ports: string[]
  output_ports: string[]
  config_schema: ConfigSchemaField[]
}

export interface ConfigSchemaField {
  key: string
  type: 'string' | 'textarea' | 'select' | 'boolean' | 'integer' | 'json' | 'keyvalue' | 'array_of_objects' | 'multiselect' | 'model_select'
  label: string
  required?: boolean
  options?: string[]
  options_from?: string
  supports_expression?: boolean
  readonly?: boolean
  schema?: ConfigSchemaField[]
  show_when?: { key: string; value: string | string[] }
}

export type CreatedVia = 'editor' | 'import' | 'code' | 'api' | 'duplicate'
export type NodeType = 'trigger' | 'action' | 'condition' | 'transformer' | 'control' | 'utility' | 'code'
export type RunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'waiting'
export type NodeRunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped'

// ── Request Payloads ──

export interface CreateWorkflowPayload {
  name: string
  description?: string
  is_active?: boolean
  created_via?: CreatedVia
}

export interface UpdateWorkflowPayload {
  name?: string
  description?: string
}

export interface CreateNodePayload {
  node_key: string
  label?: string
  config?: Record<string, unknown>
  position_x?: number
  position_y?: number
}

export interface UpdateNodePayload {
  label?: string
  config?: Record<string, unknown>
}

export interface UpdateNodePositionPayload {
  position_x: number
  position_y: number
}

export interface CreateEdgePayload {
  source_node_id: number
  target_node_id: number
  source_port?: string
  target_port?: string
}

// ── Pagination ──

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
}

export interface ApiResponse<T> {
  data: T
}
