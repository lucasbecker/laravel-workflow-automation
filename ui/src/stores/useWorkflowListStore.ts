import { create } from 'zustand'
import type { Workflow } from '../api/types'
import { workflowsApi } from '../api/workflows'

interface WorkflowListStore {
  workflows: Workflow[]
  currentPage: number
  lastPage: number
  total: number
  isLoading: boolean
  fetchWorkflows: (page?: number) => Promise<void>
  createWorkflow: (name: string, description?: string) => Promise<Workflow>
  deleteWorkflow: (id: number) => Promise<void>
  duplicateWorkflow: (id: number) => Promise<void>
  toggleActive: (id: number, currentlyActive: boolean) => Promise<void>
}

export const useWorkflowListStore = create<WorkflowListStore>((set, get) => ({
  workflows: [],
  currentPage: 1,
  lastPage: 1,
  total: 0,
  isLoading: false,

  fetchWorkflows: async (page = 1) => {
    set({ isLoading: true })
    try {
      const res = await workflowsApi.list(page)
      set({
        workflows: res.data,
        currentPage: res.meta.current_page,
        lastPage: res.meta.last_page,
        total: res.meta.total,
      })
    } finally {
      set({ isLoading: false })
    }
  },

  createWorkflow: async (name, description) => {
    const res = await workflowsApi.create({ name, description, created_via: 'editor' })
    await get().fetchWorkflows(get().currentPage)
    return res.data
  },

  deleteWorkflow: async (id) => {
    await workflowsApi.destroy(id)
    await get().fetchWorkflows(get().currentPage)
  },

  duplicateWorkflow: async (id) => {
    await workflowsApi.duplicate(id)
    await get().fetchWorkflows(get().currentPage)
  },

  toggleActive: async (id, currentlyActive) => {
    if (currentlyActive) {
      await workflowsApi.deactivate(id)
    } else {
      await workflowsApi.activate(id)
    }
    await get().fetchWorkflows(get().currentPage)
  },
}))
