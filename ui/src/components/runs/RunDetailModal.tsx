import { X, RotateCw, Ban } from 'lucide-react'
import type { WorkflowRun } from '../../api/types'
import { RunStatusBadge, NodeRunStatusBadge } from '../shared/StatusBadge'
import { JsonViewer } from '../shared/JsonViewer'
import { useRunStore } from '../../stores/useRunStore'
import { useState } from 'react'

interface Props {
  run: WorkflowRun
  onClose: () => void
}

export function RunDetailModal({ run, onClose }: Props) {
  const { cancelRun, replayRun } = useRunStore()
  const [expandedNode, setExpandedNode] = useState<number | null>(null)

  const canCancel = run.status === 'running' || run.status === 'waiting'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex max-h-[80vh] w-full max-w-3xl flex-col rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Run #{run.id}</h3>
            <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
              <RunStatusBadge status={run.status} />
              {run.duration_ms != null && <span>{run.duration_ms}ms</span>}
              {run.started_at && <span>{new Date(run.started_at).toLocaleString()}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canCancel && (
              <button
                onClick={() => cancelRun(run.id)}
                className="flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100"
              >
                <Ban size={12} /> Cancel
              </button>
            )}
            <button
              onClick={() => replayRun(run.id)}
              className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100"
            >
              <RotateCw size={12} /> Replay
            </button>
            <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Error */}
        {run.error_message && (
          <div className="mx-5 mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            {run.error_message}
          </div>
        )}

        {/* Node Runs */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!run.node_runs || run.node_runs.length === 0 ? (
            <p className="text-center text-sm text-gray-400">No node runs recorded</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">Node</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Duration</th>
                  <th className="pb-2 font-medium">Attempts</th>
                  <th className="pb-2 font-medium">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {run.node_runs.map((nr) => (
                  <>
                    <tr
                      key={nr.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setExpandedNode(expandedNode === nr.id ? null : nr.id)}
                    >
                      <td className="py-2 font-mono">#{nr.node_id}</td>
                      <td className="py-2">
                        <NodeRunStatusBadge status={nr.status} />
                      </td>
                      <td className="py-2 text-gray-500">{nr.duration_ms ? `${nr.duration_ms}ms` : '-'}</td>
                      <td className="py-2 text-gray-500">{nr.attempts ?? '-'}</td>
                      <td className="max-w-[200px] truncate py-2 text-red-500">{nr.error_message || '-'}</td>
                    </tr>
                    {expandedNode === nr.id && (
                      <tr key={`${nr.id}-detail`}>
                        <td colSpan={5} className="bg-gray-50 p-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="mb-1 text-[10px] font-medium text-gray-500">Input</p>
                              <JsonViewer data={nr.input} maxHeight="200px" />
                            </div>
                            <div>
                              <p className="mb-1 text-[10px] font-medium text-gray-500">Output</p>
                              <JsonViewer data={nr.output} maxHeight="200px" />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
