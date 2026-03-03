import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { CustomNodeData } from '../../lib/mappers'
import { NODE_TYPE_COLORS } from '../../lib/constants'
import { NODE_TYPE_ICON } from './nodeStyles'
import type { NodeType } from '../../api/types'

function CustomNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as CustomNodeData
  const colors = NODE_TYPE_COLORS[nodeData.nodeType as NodeType] ?? NODE_TYPE_COLORS.action
  const Icon = NODE_TYPE_ICON[nodeData.nodeType as NodeType] ?? NODE_TYPE_ICON.action

  const inputPorts = nodeData.inputPorts ?? []
  const outputPorts = nodeData.outputPorts ?? []

  return (
    <div
      className={`min-w-[160px] rounded-lg border-l-4 bg-white shadow-md ${colors.border} ${
        selected ? 'ring-2 ring-blue-400' : ''
      }`}
    >
      {/* Input Handles */}
      {inputPorts.map((port, i) => {
        const topPercent =
          inputPorts.length === 1 ? 50 : 20 + (60 / (inputPorts.length - 1)) * i
        return (
          <Handle
            key={`in-${port}`}
            type="target"
            position={Position.Left}
            id={port}
            style={{ top: `${topPercent}%` }}
            className="!h-2.5 !w-2.5 !border-2 !border-white !bg-gray-400"
          />
        )
      })}

      {/* Node Body */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Icon size={14} className={colors.text} />
          <span className="truncate text-xs font-semibold text-gray-800">
            {nodeData.label}
          </span>
        </div>
        <div className="mt-0.5 text-[10px] text-gray-400">{nodeData.nodeKey}</div>
      </div>

      {/* Port Labels */}
      {outputPorts.length > 1 && (
        <div className="border-t border-gray-100 px-3 py-1">
          <div className="flex flex-wrap gap-1">
            {outputPorts.map((port) => (
              <span key={port} className="rounded bg-gray-100 px-1 py-0.5 text-[9px] text-gray-500">
                {port}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Output Handles */}
      {outputPorts.map((port, i) => {
        const topPercent =
          outputPorts.length === 1 ? 50 : 20 + (60 / (outputPorts.length - 1)) * i
        return (
          <Handle
            key={`out-${port}`}
            type="source"
            position={Position.Right}
            id={port}
            style={{ top: `${topPercent}%` }}
            className="!h-2.5 !w-2.5 !border-2 !border-white !bg-blue-500"
          />
        )
      })}
    </div>
  )
}

export const CustomNode = memo(CustomNodeComponent)
