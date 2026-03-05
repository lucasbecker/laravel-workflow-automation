import { create } from 'zustand'
import type { WorkflowNodeRun, WorkflowRun } from '../api/types'
import { runsApi } from '../api/runs'
import { workflowsApi } from '../api/workflows'

interface RunStore {
  runs: WorkflowRun[]
  selectedRun: WorkflowRun | null
  isLoading: boolean
  isReplaying: boolean
  nodeTestResults: Record<number, WorkflowNodeRun> | null
  isTestingNode: boolean
  fetchRuns: (workflowId: number) => Promise<void>
  fetchRunDetail: (runId: number) => Promise<void>
  cancelRun: (runId: number) => Promise<void>
  replayRun: (runId: number) => Promise<void>
  retryFromFailure: (runId: number) => Promise<void>
  clearSelectedRun: () => void
  testNode: (workflowId: number, nodeId: number, payload?: Record<string, unknown>) => Promise<void>
  clearNodeTestResults: () => void
}

export const useRunStore = create<RunStore>((set) => ({
  runs: [],
  selectedRun: null,
  isLoading: false,
  isReplaying: false,
  nodeTestResults: null,
  isTestingNode: false,

  fetchRuns: async (workflowId) => {
    set({ isLoading: true })
    try {
      const res = await runsApi.list(workflowId)
      set({ runs: res.data })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchRunDetail: async (runId) => {
    const res = await runsApi.show(runId)
    set({ selectedRun: res.data })
  },

  cancelRun: async (runId) => {
    await runsApi.cancel(runId)
    const res = await runsApi.show(runId)
    set({ selectedRun: res.data })
  },

  replayRun: async (runId) => {
    set({ isReplaying: true })
    try {
      await runsApi.replay(runId)
    } finally {
      set({ isReplaying: false })
    }
  },

  retryFromFailure: async (runId) => {
    await runsApi.retryFromFailure(runId)
  },

  clearSelectedRun: () => set({ selectedRun: null }),

  testNode: async (workflowId, nodeId, payload) => {
    set({ isTestingNode: true, nodeTestResults: null })
    try {
      const res = await workflowsApi.testNode(workflowId, nodeId, payload)
      const run = res.data
      const map: Record<number, WorkflowNodeRun> = {}
      for (const nr of run.node_runs ?? []) {
        map[nr.node_id] = nr
      }
      set({ nodeTestResults: map })
    } finally {
      set({ isTestingNode: false })
    }
  },

  clearNodeTestResults: () => set({ nodeTestResults: null }),
}))
