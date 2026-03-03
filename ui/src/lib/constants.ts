import type { NodeType, RunStatus, NodeRunStatus } from '../api/types'

export const NODE_TYPE_COLORS: Record<NodeType, { bg: string; border: string; text: string }> = {
  trigger:     { bg: 'bg-green-50',   border: 'border-green-500',  text: 'text-green-700' },
  action:      { bg: 'bg-blue-50',    border: 'border-blue-500',   text: 'text-blue-700' },
  condition:   { bg: 'bg-amber-50',   border: 'border-amber-500',  text: 'text-amber-700' },
  transformer: { bg: 'bg-purple-50',  border: 'border-purple-500', text: 'text-purple-700' },
  control:     { bg: 'bg-gray-50',    border: 'border-gray-500',   text: 'text-gray-700' },
  utility:     { bg: 'bg-teal-50',    border: 'border-teal-500',   text: 'text-teal-700' },
  code:        { bg: 'bg-slate-50',   border: 'border-slate-500',  text: 'text-slate-700' },
}

export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  trigger:     'Triggers',
  action:      'Actions',
  condition:   'Conditions',
  transformer: 'Transformers',
  control:     'Control',
  utility:     'Utility',
  code:        'Code',
}

export const RUN_STATUS_COLORS: Record<RunStatus, string> = {
  pending:   'bg-gray-100 text-gray-700',
  running:   'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed:    'bg-red-100 text-red-700',
  cancelled: 'bg-orange-100 text-orange-700',
  waiting:   'bg-yellow-100 text-yellow-700',
}

export const NODE_RUN_STATUS_COLORS: Record<NodeRunStatus, string> = {
  pending:   'bg-gray-100 text-gray-700',
  running:   'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed:    'bg-red-100 text-red-700',
  skipped:   'bg-gray-100 text-gray-500',
}

export const NODE_RUN_BORDER_COLORS: Record<NodeRunStatus, string> = {
  pending:   'border-gray-300',
  running:   'border-blue-400',
  completed: 'border-green-400',
  failed:    'border-red-400',
  skipped:   'border-gray-300',
}
