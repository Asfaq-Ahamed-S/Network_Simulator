/*function App() {
  return (
    <div className="w-screen h-screen bg-gray-900 text-white flex items-center justify-center">
      <h1 className="text-3xl font-bold">Network Simulator</h1>
    </div>
  )
}
*/

import { useState, useCallback, useEffect } from "react"
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
import PingPanel from "./components/PingPanel"
import { findPath } from "./utils/pathfinder"
import { checkConnection } from "./utils/connectionRules"
import Toast from "./components/Toast"
import { initNetworkState } from "./utils/networkLayer"

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
  const [toast, setToast] = useState(null)
  const [networkState, setNetworkState] = useState(null)

  //Ping state
  const [pingMode, setPingMode] = useState(false)
  const [pingSource, setPingSource] = useState(null)
  const [pingLogs, setPingLogs] = useState([])
  const [showPingPanel, setShowPingPanel] = useState(false)
  const [animatingEdgeIds, setAnimatingEdgeIds] = useState([])

  //Apply animation to edges
  useEffect(() => {
    setEdges(eds => eds.map(e=>({
      ...e,
      animated: animatingEdgeIds.includes(e.id),
    })))
  },[animatingEdgeIds])

  useEffect(()=> {
    const state = initNetworkState(nodes, edges)
    setNetworkState(state)
    console.log('networkState:', state)
  },[nodes, edges])

  const executePing = useCallback((source, target) => {
    const path = findPath(nodes, edges, source.id, target.id)
    const targetLabel = target.data.ip || target.data.label

    setPingLogs(prev => [
      ...prev,
      {type: 'info', text: `Target: ${target.data.label}${target.data.ip ? `(${target.data.ip})` : ''}`},
      {type: 'gray', text: `Pinging ${targetLabel} with 32 bytes of data:` },
    ])

    if (!path) {
      setTimeout(() => setPingLogs(prev => [...prev,
        {type: 'error', text: 'Requested timed out.'},
        {type: 'error', text: 'Requested timed out.'},
        {type: 'error', text: 'Requested timed out.'},
        {type: 'gray', text: ''},
        {type: 'error', text: `Ping statistics for ${targetLabel}:`},
        {type: 'error', text: '     Packets: Sent = 3, Recieved = 0, Lost = 3 (100% loss)'},
      ]), 1000)
      return
    }

    const pathIds = path.map(e => e.id)
    setAnimatingEdgeIds(pathIds)

    const r = () => Math.floor(Math.random()*6) + 1
    const [t1, t2, t3] = [r(), r(), r()]

    setTimeout(() => setPingLogs(prev => [...prev,
      {type: 'success', text: `Reply from ${targetLabel}: bytes=32 time=${t1}ms TTL=128`}
    ]),900)
    setTimeout(() => setPingLogs(prev => [...prev,
      {type: 'success', text: `Reply from ${targetLabel}: bytes=32 time=${t2}ms TTL=128`}
    ]),1800)
    setTimeout(() => setPingLogs(prev => [...prev,
      {type: 'success', text: `Reply from ${targetLabel}: bytes=32 time=${t3}ms TTL=128`}
    ]),2700)
    setTimeout(()=>{
      setPingLogs(prev => [...prev,
        {type: 'gray', text: ''},
        {type: 'gray', text: `Ping statistics for ${targetLabel}:`},
        {type: 'gray', text: '    Packets: Sent = 3, Received = 3, Lost = 0 (0% loss)'},
        {type: 'success', text: `Approximate round trip: min=${Math.min(t1,t2,t3)}ms max=${Math.max(t1,t2,t3)}ms avg=${Math.round((t1+t2+t3)/3)}ms`},
      ])
      setAnimatingEdgeIds([])
      setPingSource(null)
    }, 3500)
  }, [nodes, edges])

  const onConnect = useCallback((params) => {
    const sourceNode = nodes.find(n => n.id === params.source)
    const targetNode = nodes.find(n => n.id === params.target)

    if (!sourceNode || !targetNode) return

    const rule = checkConnection(sourceNode.data.deviceType, targetNode.data.deviceType)

    if (rule.status === 'block') {
      setToast({type: 'block', message: rule.message})
      return
    }
    if (rule.status === 'warn') {
      setToast({type: 'warn', message: rule.message})
    }
    setPendingConnection(params)
  },[nodes]
  )

  const handleConfirmConnection = useCallback(({ cableType, speed }) =>{
    if(!pendingConnection) return
    setEdges((eds)=> addEdge({
      ...pendingConnection,
      id: `edge-${edgeId++}`,
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
      data: {
        label: `${type} ${id}`,
        deviceType: type,
        ip: '',
        ...(['Server', 'PC'].includes(type) ? {ports: [], ipMode: type === 'Server' ? 'static' : 'dhcp' } : {}),
      },
      position: {x: Math.random()*400+100, y: Math.random() * 300 + 100}, 
    }
    setNodes((nds)=> [...nds, newNode])
  },[setNodes])

  const onNodeClick = useCallback((event, node) => {
    if (pingMode) {
      if (!pingSource) {
        setPingSource(node)
        setShowPingPanel(true)
        setPingLogs([
          {type: 'info', text: `Source: ${node.data.label}${node.data.ip ? `(${node.data.ip})` : ''}`},
          {type: 'gray', text: 'Now click the target node...'},
        ])
      } else if (pingSource.id !== node.id) {
        executePing(pingSource, node)
      }
      return
    }
    setSelectedNode(node)
  },[pingMode, pingSource, executePing])

  const onTogglePing = useCallback(() => {
    setPingMode(p => !p)
    setPingSource(null)
    setAnimatingEdgeIds([])
    if (!pingMode) {
      setShowPingPanel(true)
      setPingLogs([])
      setSelectedNode(null)
    }
  },[pingMode])

  const onPanelClick = useCallback(()=>{
    setMenu(null)
    if (!pingMode) setSelectedNode(null)
  },[pingMode])

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
      <Sidebar onAddNode={addNode} pingMode={pingMode} onTogglePing={onTogglePing} />
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
          onPaneClick={onPanelClick}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background color="#290392ff" gap={16} />
        </ReactFlow>

        <Toast toast={toast} onClose={()=> setToast(null)} />

        {showPingPanel && (
          <PingPanel
          logs={pingLogs}
          onClose={()=> {
            setShowPingPanel(false)
            setPingLogs([])
            setPingSource(null)
            setAnimatingEdgeIds([])
          }} />
        )}
      </div>

      {selectedNode && !pingMode && (
        <PropertiesPanel
        node={selectedNode}
        onClose={()=> setSelectedNode(null)}
        onUpdate={handleUpdateNode}
        networkState={networkState}
        edges={edges}
        nodes={nodes}
        />
      )}

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