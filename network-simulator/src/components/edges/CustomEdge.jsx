import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from 'reactflow'

const cableStyles = {
  'Cat5e':    { color: '#9e9e9e', width: 2,   dash: null,  glow: false },
  'Cat6':     { color: '#4a9eff', width: 2.5, dash: null,  glow: false },
  'Cat6a':    { color: '#00c853', width: 3,   dash: null,  glow: false },
  'Fiber SM': { color: '#ffeb3b', width: 2,   dash: null,  glow: true  },
  'Fiber MM': { color: '#00bcd4', width: 2,   dash: null,  glow: true  },
  'Coaxial':  { color: '#8d6e63', width: 4,   dash: '8,4', glow: false },
  'Serial':   { color: '#ff5722', width: 2,   dash: '6,6', glow: false },
}

function CustomEdge({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, markerEnd, animated }) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  })

  const style = cableStyles[data?.cableType] || cableStyles['Cat6']

  return (
    <>
      {style.glow && (
        <path
          d={edgePath}
          fill="none"
          stroke={style.color}
          strokeWidth={style.width + 6}
          opacity="0.25"
          style={{ filter: 'blur(4px)', pointerEvents: 'none' }}
        />
      )}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: style.color,
          strokeWidth: animated ? style.width + 1 : style.width,
          strokeDasharray: style.dash || undefined,
          filter: animated ? `drop-shadow(0 0 4px ${style.color})` : undefined,
        }}
      />
      {animated && (
        <circle r="5" fill={style.color} style={{ filter: `drop-shadow(0 0 6px ${style.color})` }}>
          <animateMotion dur="0.8s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div
            className="px-2 py-0.5 rounded text-xs font-mono whitespace-nowrap"
            style={{
              background: '#0d1117',
              border: `1px solid ${style.color}`,
              color: style.color,
            }}
          >
            {data?.cableType} · {data?.speed}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

export default CustomEdge