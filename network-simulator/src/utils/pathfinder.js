export function findPath(nodes, edges, sourceId, targetId) {
  if (sourceId === targetId) return []

  const adj = {}
  nodes.forEach(n => { adj[n.id] = [] })
  edges.forEach(e => {
    adj[e.source]?.push({ nodeId: e.target, edge: e })
    adj[e.target]?.push({ nodeId: e.source, edge: e })
  })

  const queue = [[sourceId, []]]
  const visited = new Set([sourceId])

  while (queue.length > 0) {
    const [current, path] = queue.shift()
    for (const { nodeId, edge } of (adj[current] || [])) {
      if (!visited.has(nodeId)) {
        const newPath = [...path, edge]
        if (nodeId === targetId) return newPath
        visited.add(nodeId)
        queue.push([nodeId, newPath])
      }
    }
  }
  return null
}