import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Upload,
  Copy,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react'
import { useWorkflowListStore } from '../../stores/useWorkflowListStore'
import { useRegistryStore } from '../../stores/useRegistryStore'
import { useThemeStore } from '../../stores/useThemeStore'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { ConfirmDialog } from '../shared/ConfirmDialog'
import { ImportWorkflowModal } from './ImportWorkflowModal'
import type { Workflow } from '../../api/types'

export function WorkflowListPage() {
  const navigate = useNavigate()
  const {
    workflows,
    currentPage,
    lastPage,
    total,
    isLoading,
    fetchWorkflows,
    createWorkflow,
    deleteWorkflow,
    duplicateWorkflow,
    toggleActive,
  } = useWorkflowListStore()
  const { theme, toggle: toggleTheme } = useThemeStore()
  const { nodes: registryNodes, fetchRegistry } = useRegistryStore()

  const [showCreate, setShowCreate] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [duplicateId, setDuplicateId] = useState<number | null>(null)

  useEffect(() => {
    fetchWorkflows()
  }, [fetchWorkflows])

  const handleCreate = async () => {
    if (!newName.trim()) return
    const wf = await createWorkflow(newName.trim(), newDesc.trim() || undefined)
    setShowCreate(false)
    setNewName('')
    setNewDesc('')
    navigate(`/${wf.id}`)
  }

  const handleDelete = async () => {
    if (deleteId === null) return
    await deleteWorkflow(deleteId)
    setDeleteId(null)
  }

  const handleDuplicate = async () => {
    if (duplicateId === null) return
    await duplicateWorkflow(duplicateId)
    setDuplicateId(null)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Workflows</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{total} workflow{total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={toggleTheme}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            title={theme === 'light' ? 'Dark mode' : 'Light mode'}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button
            onClick={async () => {
              await fetchRegistry()
              setShowImport(true)
            }}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Upload size={16} />
            <span className="hidden sm:inline">Import</span>
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Workflow</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-16 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : workflows.length === 0 ? (
        <div className="mt-16 text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg">No workflows yet</p>
          <p className="mt-1 text-sm">Create your first workflow to get started.</p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workflows.map((wf) => (
              <div
                key={wf.id}
                className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500"
                onClick={() => navigate(`/${wf.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{wf.name}</h3>
                    {wf.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{wf.description}</p>
                    )}
                  </div>
                  <span
                    className={`ml-2 inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      wf.is_active
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {wf.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                  Updated {new Date(wf.updated_at).toLocaleDateString()}
                </div>

                <div
                  className="mt-3 flex gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => toggleActive(wf.id, wf.is_active)}
                    className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                    title={wf.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {wf.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  </button>
                  <button
                    onClick={() => setDuplicateId(wf.id)}
                    className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                    title="Duplicate"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteId(wf.id)}
                    className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:text-gray-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {lastPage > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => fetchWorkflows(currentPage - 1)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {lastPage}
              </span>
              <button
                disabled={currentPage >= lastPage}
                onClick={() => fetchWorkflows(currentPage + 1)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800 dark:shadow-2xl dark:shadow-black/40">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">New Workflow</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="My Workflow"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Optional description"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-md px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showImport && (
        <ImportWorkflowModal
          registryNodes={registryNodes}
          existingWorkflows={workflows}
          onImported={(workflow: Workflow) => {
            setShowImport(false)
            fetchWorkflows()
            navigate(`/${workflow.id}`)
          }}
          onClose={() => setShowImport(false)}
        />
      )}

      <ConfirmDialog
        open={duplicateId !== null}
        title="Duplicate Workflow"
        message={`Create a copy of "${workflows.find((w) => w.id === duplicateId)?.name ?? ''}"? The duplicate will be inactive by default.`}
        confirmLabel="Duplicate"
        variant="primary"
        onConfirm={handleDuplicate}
        onCancel={() => setDuplicateId(null)}
      />

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Workflow"
        message="This action cannot be undone. All nodes, edges, and run history will be permanently deleted."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
