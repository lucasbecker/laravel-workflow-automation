import { api } from './client'
import type {
  ApiResponse,
  AvailableVariablesResponse,
  CreateNodePayload,
  UpdateNodePayload,
  UpdateNodePositionPayload,
  WorkflowNode,
} from './types'

export const nodesApi = {
  create: (workflowId: number, data: CreateNodePayload) =>
    api.post<ApiResponse<WorkflowNode>>(`/workflows/${workflowId}/nodes`, data),

  update: (workflowId: number, nodeId: number, data: UpdateNodePayload) =>
    api.put<ApiResponse<WorkflowNode>>(`/workflows/${workflowId}/nodes/${nodeId}`, data),

  destroy: (workflowId: number, nodeId: number) =>
    api.delete<void>(`/workflows/${workflowId}/nodes/${nodeId}`),

  updatePosition: (workflowId: number, nodeId: number, data: UpdateNodePositionPayload) =>
    api.patch<ApiResponse<WorkflowNode>>(`/workflows/${workflowId}/nodes/${nodeId}/position`, data),

  availableVariables: (workflowId: number, nodeId: number) =>
    api.get<AvailableVariablesResponse>(`/workflows/${workflowId}/nodes/${nodeId}/variables`),
}
