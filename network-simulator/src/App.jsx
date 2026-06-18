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
import DeviceNode from "./components/nodes/DeviceNode"
import ContextMenu from "./components/ContextMenu"
import PropertiesPanel from "./components/PropertiesPanel"
import ConnectionModal from "./components/ConnectionModal"
import CustomEdge from "./components/edges/CustomEdge"

const nodeTypes = { device: DeviceNode }
const edgeTypes = { custom: CustomEdge }
const initialNodes = []
const initialEdges = []
let nodeId = 1
let edgeId = 1

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [menu, setMenu] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [pendingConnection, setPendingConnection] = useState(null)

  const onConnect = useCallback(
    (params) => { setPendingConnection(params) },[]
  )

  const handleConfirmConnection = useCallback(({ cableType, speed }) =>{
    if(!pendingConnection) return
    setEdges((eds)=> addEdge({
      ...pendingConnection,
      id: `edge-$edgeId++`,
      type: 'custom',
      data: {cableType, speed},
    }, eds))
    setPendingConnection(null)
  }, [pendingConnection, setEdges])

  const addNode = useCallback((type) => {
    const id = nodeId++
    const newNode = {
      id: `node-${id}`,
      type: 'device',
      data: {label: `${type} ${id}`, deviceType: type, ip: ''},
      position: {x: Math.random()*400+100, y: Math.random() * 300 + 100}, 
    }
    setNodes((nds)=> [...nds, newNode])
  },[setNodes])

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node)
  },[])

  const onPanelClick = useCallback(()=>{
    setMenu(null)
    setSelectedNode(null)
  },[])

  const handleUpdateNode = useCallback((id, newData)=>{
    setNodes((nds)=> nds.map((n)=> (n.id === id ? {...n, data: newData} :n))
  )
  setSelectedNode((prev)=>prev?.id === id? {...prev,data: newData}: prev)
  },[setNodes])

  const onNodeContextMenu = useCallback((event, node)=> {
    event.preventDefault()
    setMenu({x: event.clientX, y: event.clientY, type: 'node', id: node.id})
  },[])

  const onEdgeContextMenu = useCallback((event, edge)=>{
    event.preventDefault()
    setMenu({x: event.clientX, y: event.clientY, type: 'edge', id: edge.id})
  },[])

//  const onPanelClick = useCallback(()=> setMenu(null),[])

  const handleDelete = useCallback(()=>{
    if(!menu) return
    if (menu.type === 'node'){
      setNodes((nds)=> nds.filter((n)=>n.id !== menu.id))
      setEdges((eds)=> eds.filter((e)=>e.source !== menu.id && e.target !== menu.id))
      if (selectedNode?.id === menu.id ) setSelectedNode(null)
    } else {
      setEdges((eds)=> eds.filter((e)=>e.id !== menu.id))
    }
    setMenu(null)
  }, [menu, selectedNode, setNodes, setEdges])

  return (
    <div className="flex w-screen h-screen bg-gray-900">
      <Sidebar onAddNode={addNode} />
      <div className="flex-1 relative">
        <ReactFlow 
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={onNodeClick}
          onNodeContextMenu={onNodeContextMenu}
          onEdgeContextMenu={onEdgeContextMenu}
          onPanelClick={onPanelClick}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background color="#290392ff" gap={16} />
        </ReactFlow>

        {selectedNode && (
          <PropertiesPanel node={selectedNode} onClose={()=> setSelectedNode(null)} onUpdate={handleUpdateNode} />
        )}
      </div>

      {pendingConnection && (
        <ConnectionModal onConfirm={handleConfirmConnection} onCancel={
          ()=> setPendingConnection(null)
        } />
      )}
      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          onDelete={handleDelete}
          onClose={()=> setMenu(null)}
        />
      )}
    </div>
  )
}

export default App