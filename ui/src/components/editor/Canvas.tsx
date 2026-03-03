import { useCallback, useRef } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  type OnSelectionChangeFunc,
  type Connection,
  type Node,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useWorkflowEditorStore } from '../../stores/useWorkflowEditorStore'
import { useRegistryStore } from '../../stores/useRegistryStore'
import { useAutoSavePosition } from '../../hooks/useAutoSavePosition'
import { CustomNode } from '../nodes/CustomNode'

const nodeTypes = { custom: CustomNode }

export function Canvas() {
  const {
    rfNodes,
    rfEdges,
    onNodesChange,
    onEdgesChange,
    addEdge,
    addNode,
    deleteNode,
    deleteEdge,
    selectNode,
  } = useWorkflowEditorStore()
  const getByKey = useRegistryStore((s) => s.getByKey)
  const savePosition = useAutoSavePosition()
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { screenToFlowPosition } = useReactFlow()

  const onConnect = useCallback(
    (connection: Connection) => {
      addEdge(connection)
    },
    [addEdge],
  )

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      savePosition(node.id, node.position.x, node.position.y)
    },
    [savePosition],
  )

  const onSelectionChange: OnSelectionChangeFunc = useCallback(
    ({ nodes }) => {
      if (nodes.length === 1) {
        selectNode(nodes[0].id)
      } else {
        selectNode(null)
      }
    },
    [selectNode],
  )

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const nodeKey = e.dataTransfer.getData('application/workflow-node-key')
      if (!nodeKey) return

      const registryNode = getByKey(nodeKey)
      if (!registryNode) return

      const position = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      })

      addNode(nodeKey, position, registryNode)
    },
    [getByKey, screenToFlowPosition, addNode],
  )

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedNodeId = useWorkflowEditorStore.getState().selectedNodeId
        if (selectedNodeId) {
          deleteNode(parseInt(selectedNodeId))
        }
        const selectedEdges = rfEdges.filter(
          (edge) => (edge as { selected?: boolean }).selected,
        )
        for (const edge of selectedEdges) {
          deleteEdge(parseInt(edge.id))
        }
      }
    },
    [deleteNode, deleteEdge, rfEdges],
  )

  return (
    <div ref={reactFlowWrapper} className="h-full w-full" onKeyDown={onKeyDown} tabIndex={0}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onSelectionChange={onSelectionChange}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        fitView
        deleteKeyCode={null}
        className="bg-gray-50"
      >
        <Controls position="bottom-left" />
        <MiniMap
          position="bottom-right"
          className="!rounded-lg !border !border-gray-200 !shadow-sm"
          maskColor="rgb(240 240 240 / 0.7)"
        />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#d1d5db" />
      </ReactFlow>
    </div>
  )
}
