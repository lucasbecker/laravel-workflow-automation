import { useCallback, useRef, useState, useEffect } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  type OnSelectionChangeFunc,
  type Connection,
  type Node,
  type Edge,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Trash2, LayoutGrid } from 'lucide-react'

import { useWorkflowEditorStore } from '../../stores/useWorkflowEditorStore'
import { useRegistryStore } from '../../stores/useRegistryStore'
import { useAutoSavePosition } from '../../hooks/useAutoSavePosition'
import { CustomNode } from '../nodes/CustomNode'

const nodeTypes = { custom: CustomNode }

interface EdgeContextMenu {
  edgeId: string
  x: number
  y: number
}

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
    autoLayout,
  } = useWorkflowEditorStore()
  const getByKey = useRegistryStore((s) => s.getByKey)
  const savePosition = useAutoSavePosition()
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { screenToFlowPosition, fitView } = useReactFlow()
  const [edgeMenu, setEdgeMenu] = useState<EdgeContextMenu | null>(null)

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

  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault()
      setEdgeMenu({ edgeId: edge.id, x: event.clientX, y: event.clientY })
    },
    [],
  )

  const onAutoLayout = useCallback(async () => {
    await autoLayout()
    window.requestAnimationFrame(() => fitView({ padding: 0.2 }))
  }, [autoLayout, fitView])

  const onPaneClick = useCallback(() => {
    setEdgeMenu(null)
  }, [])

  useEffect(() => {
    const handleClickOutside = () => setEdgeMenu(null)
    if (edgeMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [edgeMenu])

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
        onEdgeContextMenu={onEdgeContextMenu}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        deleteKeyCode={null}
        className="bg-gray-50 dark:bg-gray-900"
      >
        <Controls position="bottom-left" />
        <div className="absolute left-2 top-2 z-10">
          <button
            onClick={onAutoLayout}
            className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            title="Auto Layout"
          >
            <LayoutGrid size={14} />
            Auto Layout
          </button>
        </div>
        <MiniMap
          position="bottom-right"
          className="!rounded-lg !border !border-gray-200 dark:!border-gray-700 !shadow-sm dark:!bg-gray-800"
          maskColor="rgb(240 240 240 / 0.7)"
        />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#d1d5db" />
      </ReactFlow>

      {edgeMenu && (
        <div
          className="fixed z-50 min-w-[140px] rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-1 shadow-lg"
          style={{ top: edgeMenu.y, left: edgeMenu.x }}
        >
          <button
            className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
            onClick={() => {
              deleteEdge(parseInt(edgeMenu.edgeId))
              setEdgeMenu(null)
            }}
          >
            <Trash2 size={14} />
            Delete connection
          </button>
        </div>
      )}
    </div>
  )
}
