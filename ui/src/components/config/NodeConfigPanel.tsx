import { useState, useEffect, useCallback } from 'react'
import { X, Save, Play, Loader2, Settings, Database } from 'lucide-react'
import { useWorkflowEditorStore } from '../../stores/useWorkflowEditorStore'
import { useRunStore } from '../../stores/useRunStore'
import { nodesApi } from '../../api/nodes'
import type { AvailableVariablesResponse } from '../../api/types'
import { DynamicForm } from './DynamicForm'
import { VariablePanel } from './VariablePanel'
import { JsonViewer } from '../shared/JsonViewer'
import { NodeRunStatusBadge } from '../shared/StatusBadge'
import { TestNodeInputModal } from '../execution/TestNodeInputModal'

type Tab = 'config' | 'output'

export function NodeConfigPanel() {
  const { workflow, selectedApiNode, selectedRegistryNode, selectNode, updateNodeConfig, updateNodeLabel, setNodeLabel } =
    useWorkflowEditorStore()
  const { nodeTestResults, isTestingNode, testNode } = useRunStore()

  const [localConfig, setLocalConfig] = useState<Record<string, unknown>>({})
  const [localLabel, setLocalLabel] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [tab, setTab] = useState<Tab>('config')
  const [showTestModal, setShowTestModal] = useState(false)
  const [variables, setVariables] = useState<AvailableVariablesResponse | null>(null)

  useEffect(() => {
    if (selectedApiNode) {
      setLocalConfig(selectedApiNode.config ?? {})
      setLocalLabel(selectedApiNode.name ?? '')
      setIsDirty(false)
      setTab('config')
    }
  }, [selectedApiNode?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!workflow || !selectedApiNode) {
      setVariables(null)
      return
    }
    nodesApi.availableVariables(workflow.id, selectedApiNode.id)
      .then(setVariables)
      .catch(() => setVariables(null))
  }, [workflow?.id, selectedApiNode?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleConfigChange = useCallback((key: string, value: unknown) => {
    setLocalConfig((prev) => ({ ...prev, [key]: value }))
    setIsDirty(true)
  }, [])

  const handleSave = async () => {
    if (!selectedApiNode) return
    setIsSaving(true)
    try {
      if (localLabel !== (selectedApiNode.name ?? '')) {
        await updateNodeLabel(selectedApiNode.id, localLabel)
      }
      await updateNodeConfig(selectedApiNode.id, localConfig)
      setIsDirty(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestNode = async (payload: Record<string, unknown>) => {
    if (!workflow || !selectedApiNode) return
    await testNode(workflow.id, selectedApiNode.id, payload)
    setShowTestModal(false)
    setTab('output')
  }

  if (!selectedApiNode || !selectedRegistryNode) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-sm text-gray-400 dark:text-gray-500">
        Select a node to configure it
      </div>
    )
  }

  const nodeResult = nodeTestResults?.[selectedApiNode.id]

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="min-w-0">
          <input
            type="text"
            value={localLabel}
            onChange={(e) => {
              setLocalLabel(e.target.value)
              setIsDirty(true)
              if (selectedApiNode) {
                setNodeLabel(selectedApiNode.id, e.target.value)
              }
            }}
            className="w-full truncate border-none bg-transparent text-sm font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-0"
            placeholder="Node Name"
          />
          <div className="text-[10px] text-gray-400 dark:text-gray-500">{selectedApiNode.node_key}</div>
        </div>
        <button
          onClick={() => selectNode(null)}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
        >
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setTab('config')}
          className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium ${
            tab === 'config'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <Settings size={12} /> Config
        </button>
        <button
          onClick={() => setTab('output')}
          className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium ${
            tab === 'output'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <Database size={12} /> Output
          {nodeResult && (
            <span
              className={`ml-1 inline-block h-1.5 w-1.5 rounded-full ${
                nodeResult.status === 'completed' ? 'bg-green-500' : nodeResult.status === 'failed' ? 'bg-red-500' : 'bg-gray-400'
              }`}
            />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {tab === 'config' ? (
          <div className="space-y-4">
            <DynamicForm
              schema={selectedRegistryNode.config_schema}
              values={localConfig}
              onChange={handleConfigChange}
              variables={variables}
            />
            {variables && (
              <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                <VariablePanel
                  data={variables}
                  onInsert={(expr) => navigator.clipboard.writeText(expr)}
                />
              </div>
            )}
          </div>
        ) : (
          <NodeOutputView nodeResult={nodeResult} />
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex gap-2">
          {isDirty && tab === 'config' && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Save size={14} />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          )}
          <button
            onClick={() => setShowTestModal(true)}
            disabled={isTestingNode}
            className={`flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 ${
              isDirty && tab === 'config' ? '' : 'flex-1'
            }`}
          >
            {isTestingNode ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Play size={14} />
            )}
            {isTestingNode ? 'Testing...' : 'Test'}
          </button>
        </div>
      </div>

      {showTestModal && (
        <TestNodeInputModal
          nodeName={localLabel || selectedApiNode.node_key}
          onRun={handleTestNode}
          onClose={() => setShowTestModal(false)}
          isRunning={isTestingNode}
        />
      )}
    </div>
  )
}

function NodeOutputView({ nodeResult }: { nodeResult?: { status: string; input: Record<string, unknown> | null; output: Record<string, unknown> | null; error_message: string | null; duration_ms: number | null } | null }) {
  if (!nodeResult) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Database size={32} className="mb-3 text-gray-300 dark:text-gray-600" />
        <p className="text-sm text-gray-400 dark:text-gray-500">No test output yet</p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          Click <strong>Test</strong> to execute the workflow up to this node
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Status */}
      <div className="flex items-center gap-3">
        <NodeRunStatusBadge status={nodeResult.status as 'completed' | 'failed' | 'running' | 'pending' | 'skipped'} />
        {nodeResult.duration_ms != null && (
          <span className="text-xs text-gray-500 dark:text-gray-400">{nodeResult.duration_ms}ms</span>
        )}
      </div>

      {/* Error */}
      {nodeResult.error_message && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {nodeResult.error_message}
        </div>
      )}

      {/* Input */}
      <div>
        <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Input</p>
        <JsonViewer data={nodeResult.input} maxHeight="200px" />
      </div>

      {/* Output */}
      <div>
        <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Output</p>
        <JsonViewer data={nodeResult.output} maxHeight="300px" />
      </div>
    </div>
  )
}
