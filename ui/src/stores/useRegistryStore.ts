import { create } from 'zustand'
import type { RegistryNode, NodeType } from '../api/types'
import { registryApi } from '../api/registry'

interface RegistryStore {
  nodes: RegistryNode[]
  isLoading: boolean
  fetchRegistry: () => Promise<void>
  getByKey: (key: string) => RegistryNode | undefined
  getGroupedByType: () => Record<NodeType, RegistryNode[]>
}

export const useRegistryStore = create<RegistryStore>((set, get) => ({
  nodes: [],
  isLoading: false,

  fetchRegistry: async () => {
    if (get().nodes.length > 0) return
    set({ isLoading: true })
    try {
      const res = await registryApi.list()
      set({ nodes: res.data })
    } finally {
      set({ isLoading: false })
    }
  },

  getByKey: (key: string) => get().nodes.find((n) => n.key === key),

  getGroupedByType: () => {
    const grouped: Record<string, RegistryNode[]> = {}
    for (const node of get().nodes) {
      if (!grouped[node.type]) grouped[node.type] = []
      grouped[node.type].push(node)
    }
    return grouped as Record<NodeType, RegistryNode[]>
  },
}))
