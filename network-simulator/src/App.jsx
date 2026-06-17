/*function App() {
  return (
    <div className="w-screen h-screen bg-gray-900 text-white flex items-center justify-center">
      <h1 className="text-3xl font-bold">Network Simulator</h1>
    </div>
  )
}
*/

import { useState, useCallback } from "react"
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import Sidebar from "./components/Sidebar"

const initialNodes = []
const initialEdges = []

let nodeId = 1

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const addNode = useCallback((type) => {
    const newNode = {
      id: `node-${nodeId++}`,
      data: {label: `${type} ${nodeId - 1}`},
      position: {x: Math.random()*400+100, y: Math.random() * 300 + 100}, 
    }
    setNodes((nds)=> [...nds, newNode])
  },[setNodes])

  return (
    <div className="flex w-screen h-screen bg-gray-900">
      <Sidebar onAddNode={addNode} />
      <div className="flex-1">
        <ReactFlow 
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background color="#444" gap={16} />
        </ReactFlow>
      </div>
    </div>
  )
}

export default App