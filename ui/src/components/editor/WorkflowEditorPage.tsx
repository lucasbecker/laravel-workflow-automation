import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Play,
  ToggleLeft,
  ToggleRight,
  Clock,
  Layers,
} from 'lucide-react'
import { ReactFlowProvider } from '@xyflow/react'

import { useWorkflowEditorStore } from '../../stores/useWorkflowEditorStore'
import { useRegistryStore } from '../../stores/useRegistryStore'
import { useRunStore } from '../../stores/useRunStore'
import { workflowsApi } from '../../api/workflows'
import { Canvas } from './Canvas'
import { NodePalette } from '../palette/NodePalette'
import { NodeConfigPanel } from '../config/NodeConfigPanel'
import { RunHistoryPanel } from '../runs/RunHistoryPanel'
import { ExecuteModal } from '../execution/ExecuteModal'
import { LoadingSpinner } from '../shared/LoadingSpinner'

type SidebarTab = 'palette' | 'runs'

export function WorkflowEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { workflow, isLoading, loadWorkflow, reset, selectedNodeId } = useWorkflowEditorStore()
  const { fetchRegistry, getByKey } = useRegistryStore()
  const { fetchRuns } = useRunStore()
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('palette')
  const [showExecute, setShowExecute] = useState(false)

  useEffect(() => {
    fetchRegistry()
  }, [fetchRegistry])

  useEffect(() => {
    if (id) {
      loadWorkflow(parseInt(id), getByKey)
    }
    return () => reset()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleActive = async () => {
    if (!workflow) return
    if (workflow.is_active) {
      await workflowsApi.deactivate(workflow.id)
    } else {
      await workflowsApi.activate(workflow.id)
    }
    loadWorkflow(workflow.id, getByKey)
  }

  if (isLoading || !workflow) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-sm font-semibold text-gray-900">{workflow.name}</h1>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              workflow.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {workflow.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleActive}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
            title={workflow.is_active ? 'Deactivate' : 'Activate'}
          >
            {workflow.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
            {workflow.is_active ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => setShowExecute(true)}
            className="flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
          >
            <Play size={12} /> Run
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="flex w-60 shrink-0 flex-col border-r border-gray-200 bg-white">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setSidebarTab('palette')}
              className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium ${
                sidebarTab === 'palette'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Layers size={12} /> Nodes
            </button>
            <button
              onClick={() => setSidebarTab('runs')}
              className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium ${
                sidebarTab === 'runs'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Clock size={12} /> Runs
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-2">
            {sidebarTab === 'palette' ? <NodePalette /> : <RunHistoryPanel />}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1">
          <ReactFlowProvider>
            <Canvas />
          </ReactFlowProvider>
        </div>

        {/* Right Panel (Config) */}
        {selectedNodeId && (
          <div className="w-80 shrink-0 border-l border-gray-200 bg-white">
            <NodeConfigPanel />
          </div>
        )}
      </div>

      {/* Execute Modal */}
      {showExecute && (
        <ExecuteModal
          workflowId={workflow.id}
          onClose={() => setShowExecute(false)}
          onExecuted={() => {
            if (workflow?.id) fetchRuns(workflow.id)
            setSidebarTab('runs')
          }}
        />
      )}
    </div>
  )
}
