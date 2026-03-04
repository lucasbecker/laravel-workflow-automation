import { create } from 'zustand'
import type { WorkflowRun } from '../api/types'
import { runsApi } from '../api/runs'

interface RunStore {
  runs: WorkflowRun[]
  selectedRun: WorkflowRun | null
  isLoading: boolean
  isReplaying: boolean
  fetchRuns: (workflowId: number) => Promise<void>
  fetchRunDetail: (runId: number) => Promise<void>
  cancelRun: (runId: number) => Promise<void>
  replayRun: (runId: number) => Promise<void>
  retryFromFailure: (runId: number) => Promise<void>
  clearSelectedRun: () => void
}

export const useRunStore = create<RunStore>((set) => ({
  runs: [],
  selectedRun: null,
  isLoading: false,
  isReplaying: false,

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
}))
