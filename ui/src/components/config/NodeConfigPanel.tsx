import { useState, useEffect, useCallback } from 'react'
import { X, Save } from 'lucide-react'
import { useWorkflowEditorStore } from '../../stores/useWorkflowEditorStore'
import { DynamicForm } from './DynamicForm'

export function NodeConfigPanel() {
  const { selectedApiNode, selectedRegistryNode, selectNode, updateNodeConfig, updateNodeLabel } =
    useWorkflowEditorStore()

  const [localConfig, setLocalConfig] = useState<Record<string, unknown>>({})
  const [localLabel, setLocalLabel] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (selectedApiNode) {
      setLocalConfig(selectedApiNode.config ?? {})
      setLocalLabel(selectedApiNode.name ?? '')
      setIsDirty(false)
    }
  }, [selectedApiNode?.id]) // eslint-disable-line react-hooks/exhaustive-deps

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

  if (!selectedApiNode || !selectedRegistryNode) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-sm text-gray-400">
        Select a node to configure it
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="min-w-0">
          <input
            type="text"
            value={localLabel}
            onChange={(e) => {
              setLocalLabel(e.target.value)
              setIsDirty(true)
            }}
            className="w-full truncate border-none bg-transparent text-sm font-semibold text-gray-900 focus:outline-none focus:ring-0"
            placeholder="Node Name"
          />
          <div className="text-[10px] text-gray-400">{selectedApiNode.node_key}</div>
        </div>
        <button
          onClick={() => selectNode(null)}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      </div>

      {/* Config Form */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <DynamicForm
          schema={selectedRegistryNode.config_schema}
          values={localConfig}
          onChange={handleConfigChange}
        />
      </div>

      {/* Save Button */}
      {isDirty && (
        <div className="border-t border-gray-200 px-4 py-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={14} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  )
}
