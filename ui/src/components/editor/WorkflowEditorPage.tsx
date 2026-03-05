import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Play,
  Copy,
  ToggleLeft,
  ToggleRight,
  Clock,
  Layers,
  Sun,
  Moon,
  Menu,
} from 'lucide-react'
import { ReactFlowProvider } from '@xyflow/react'

import { useWorkflowEditorStore } from '../../stores/useWorkflowEditorStore'
import { useRegistryStore } from '../../stores/useRegistryStore'
import { useRunStore } from '../../stores/useRunStore'
import { useThemeStore } from '../../stores/useThemeStore'
import { workflowsApi } from '../../api/workflows'
import { Canvas } from './Canvas'
import { ExportDropdown } from './ExportDropdown'
import { NodePalette } from '../palette/NodePalette'
import { NodeConfigPanel } from '../config/NodeConfigPanel'
import { RunHistoryPanel } from '../runs/RunHistoryPanel'
import { ExecuteModal } from '../execution/ExecuteModal'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { ConfirmDialog } from '../shared/ConfirmDialog'

type SidebarTab = 'palette' | 'runs'

export function WorkflowEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { workflow, isLoading, loadWorkflow, reset, selectedNodeId } = useWorkflowEditorStore()
  const { fetchRegistry } = useRegistryStore()
  const { fetchRuns } = useRunStore()
  const { theme, toggle: toggleTheme } = useThemeStore()
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('palette')
  const [showExecute, setShowExecute] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false)
  const [mobileLeftOpen, setMobileLeftOpen] = useState(false)
  const [mobileRightOpen, setMobileRightOpen] = useState(false)

  useEffect(() => {
    const init = async () => {
      await fetchRegistry()
      if (id) {
        loadWorkflow(parseInt(id), useRegistryStore.getState().getByKey)
      }
    }
    init()
    return () => reset()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setMobileRightOpen(!!selectedNodeId)
  }, [selectedNodeId])

  const handleToggleActive = async () => {
    if (!workflow) return
    if (workflow.is_active) {
      await workflowsApi.deactivate(workflow.id)
    } else {
      await workflowsApi.activate(workflow.id)
    }
    loadWorkflow(workflow.id, useRegistryStore.getState().getByKey)
  }

  const handleDuplicate = async () => {
    if (!workflow || isDuplicating) return
    setIsDuplicating(true)
    try {
      const res = await workflowsApi.duplicate(workflow.id)
      navigate(`/${res.data.id}`)
    } finally {
      setIsDuplicating(false)
    }
  }

  if (isLoading || !workflow) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <ReactFlowProvider>
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <button
            onClick={() => setMobileLeftOpen((v) => !v)}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 md:hidden"
          >
            <Menu size={18} />
          </button>
          <button
            onClick={() => navigate('/')}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="truncate max-w-[140px] md:max-w-none text-sm font-semibold text-gray-900 dark:text-gray-100">{workflow.name}</h1>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
              workflow.is_active ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
            }`}
          >
            {workflow.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            title={theme === 'light' ? 'Dark mode' : 'Light mode'}
          >
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          </button>
          <div className="hidden md:flex items-center gap-2">
            <ExportDropdown workflow={workflow} />
            <button
              onClick={() => setShowDuplicateConfirm(true)}
              disabled={isDuplicating}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50"
              title="Duplicate"
            >
              <Copy size={14} />
              {isDuplicating ? 'Duplicating...' : 'Duplicate'}
            </button>
            <button
              onClick={handleToggleActive}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium ${
                workflow.is_active
                  ? 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30'
                  : 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30'
              }`}
              title={workflow.is_active ? 'Deactivate' : 'Activate'}
            >
              {workflow.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
              {workflow.is_active ? 'Active' : 'Inactive'}
            </button>
          </div>
          <button
            onClick={() => setShowExecute(true)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
              workflow.is_active
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400'
            }`}
          >
            <Play size={12} /> <span className="hidden md:inline">{workflow.is_active ? 'Run' : 'Run (Inactive)'}</span>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Mobile backdrop for left drawer */}
        {mobileLeftOpen && (
          <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setMobileLeftOpen(false)} />
        )}

        {/* Left Sidebar — static on desktop, drawer on mobile */}
        <div className={`
          flex flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800
          fixed top-12 bottom-0 left-0 z-40 w-72 transition-transform duration-200
          ${mobileLeftOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:top-auto md:bottom-auto md:z-auto md:w-60 md:shrink-0 md:translate-x-0 md:transition-none
        `}>
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setSidebarTab('palette')}
              className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium ${
                sidebarTab === 'palette'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Layers size={12} /> Nodes
            </button>
            <button
              onClick={() => setSidebarTab('runs')}
              className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium ${
                sidebarTab === 'runs'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
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
        <div className="min-w-0 flex-1">
          <Canvas />
        </div>

        {/* Right Panel (Config) — static on desktop, drawer on mobile */}
        {selectedNodeId && (
          <>
            {mobileRightOpen && (
              <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setMobileRightOpen(false)} />
            )}
            <div className={`
              border-l border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800
              fixed top-12 bottom-0 right-0 z-40 w-[85vw] max-w-sm transition-transform duration-200
              ${mobileRightOpen ? 'translate-x-0' : 'translate-x-full'}
              md:relative md:top-auto md:bottom-auto md:z-auto md:w-80 md:max-w-none md:shrink-0 md:translate-x-0 md:transition-none
            `}>
              <NodeConfigPanel />
            </div>
          </>
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
      <ConfirmDialog
        open={showDuplicateConfirm}
        title="Duplicate Workflow"
        message={`Create a copy of "${workflow.name}"? The duplicate will be inactive by default.`}
        confirmLabel="Duplicate"
        variant="primary"
        onConfirm={async () => {
          setShowDuplicateConfirm(false)
          await handleDuplicate()
        }}
        onCancel={() => setShowDuplicateConfirm(false)}
      />
    </div>
    </ReactFlowProvider>
  )
}
