import { api } from './client'
import type {
  ApiResponse,
  CreateWorkflowPayload,
  PaginatedResponse,
  UpdateWorkflowPayload,
  Workflow,
} from './types'

export const workflowsApi = {
  list: (page = 1) =>
    api.get<PaginatedResponse<Workflow>>(`/workflows?page=${page}`),

  show: (id: number) =>
    api.get<ApiResponse<Workflow>>(`/workflows/${id}`),

  create: (data: CreateWorkflowPayload) =>
    api.post<ApiResponse<Workflow>>('/workflows', data),

  update: (id: number, data: UpdateWorkflowPayload) =>
    api.put<ApiResponse<Workflow>>(`/workflows/${id}`, data),

  destroy: (id: number) =>
    api.delete<void>(`/workflows/${id}`),

  activate: (id: number) =>
    api.post<ApiResponse<Workflow>>(`/workflows/${id}/activate`),

  deactivate: (id: number) =>
    api.post<ApiResponse<Workflow>>(`/workflows/${id}/deactivate`),

  execute: (id: number, payload: Record<string, unknown>) =>
    api.post<ApiResponse<unknown>>(`/workflows/${id}/run`, { payload }),

  duplicate: (id: number) =>
    api.post<ApiResponse<Workflow>>(`/workflows/${id}/duplicate`),

  validate: (id: number) =>
    api.post<{ valid: boolean; errors: string[] }>(`/workflows/${id}/validate`),
}
