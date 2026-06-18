import { Handle, Position } from 'reactflow'

const deviceSVGs = {
  PC: (
    <svg viewBox="0 0 80 75" width="80" height="75">
      <rect x="8" y="5" width="64" height="45" rx="4" fill="#1a2744" stroke="#4a9eff" strokeWidth="1.5"/>
      <rect x="13" y="10" width="54" height="35" rx="2" fill="#0a1929"/>
      <line x1="17" y1="18" x2="45" y2="18" stroke="#4a9eff" strokeWidth="1.5" opacity="0.7"/>
      <line x1="17" y1="24" x2="55" y2="24" stroke="#4a9eff" strokeWidth="1.5" opacity="0.5"/>
      <line x1="17" y1="30" x2="38" y2="30" stroke="#4a9eff" strokeWidth="1.5" opacity="0.4"/>
      <line x1="17" y1="36" x2="50" y2="36" stroke="#4a9eff" strokeWidth="1.5" opacity="0.3"/>
      <rect x="35" y="50" width="10" height="8" fill="#1a2744"/>
      <rect x="24" y="58" width="32" height="5" rx="2.5" fill="#1a2744" stroke="#4a9eff" strokeWidth="1"/>
      <circle cx="68" cy="46" r="2" fill="#4a9eff" opacity="0.9"/>
    </svg>
  ),
  Router: (
    <svg viewBox="0 0 80 75" width="80" height="75">
      <line x1="25" y1="28" x2="20" y2="8" stroke="#ff8c00" strokeWidth="2" strokeLinecap="round"/>
      <line x1="40" y1="28" x2="40" y2="6" stroke="#ff8c00" strokeWidth="2" strokeLinecap="round"/>
      <line x1="55" y1="28" x2="60" y2="8" stroke="#ff8c00" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="20" cy="8" r="2.5" fill="#ff8c00"/>
      <circle cx="40" cy="6" r="2.5" fill="#ff8c00"/>
      <circle cx="60" cy="8" r="2.5" fill="#ff8c00"/>
      <rect x="10" y="28" width="60" height="28" rx="5" fill="#2d1a00" stroke="#ff8c00" strokeWidth="1.5"/>
      <rect x="16" y="38" width="8" height="6" rx="1" fill="#ff8c00" opacity="0.6"/>
      <rect x="28" y="38" width="8" height="6" rx="1" fill="#ff8c00" opacity="0.6"/>
      <rect x="40" y="38" width="8" height="6" rx="1" fill="#ff8c00" opacity="0.6"/>
      <circle cx="58" cy="35" r="2" fill="#ff8c00" opacity="0.9"/>
      <circle cx="63" cy="35" r="2" fill="#4a9eff" opacity="0.7"/>
    </svg>
  ),
  Switch: (
    <svg viewBox="0 0 80 75" width="80" height="75">
      <rect x="5" y="22" width="70" height="30" rx="3" fill="#0d2b0d" stroke="#00c853" strokeWidth="1.5"/>
      <rect x="7" y="24" width="66" height="4" rx="2" fill="#00c853" opacity="0.15"/>
      {[0,1,2,3,4,5,6,7].map(i => (
        <rect key={i} x={10 + i * 8} y="32" width="5" height="7" rx="0.5"
          fill="#004d20" stroke="#00c853" strokeWidth="0.8"/>
      ))}
      {[0,1,2,3,4,5,6,7].map(i => (
        <circle key={i} cx={12.5 + i * 8} cy="44" r="1.5"
          fill="#00c853" opacity={i % 3 === 0 ? 0.3 : 0.9}/>
      ))}
      <circle cx="62" cy="28" r="2" fill="#00c853" opacity="0.9"/>
      <circle cx="67" cy="28" r="2" fill="#ffab00" opacity="0.7"/>
    </svg>
  ),
  Hub: (
    <svg viewBox="0 0 80 75" width="80" height="75">
      <ellipse cx="40" cy="25" rx="32" ry="8" fill="#2a0a4a" stroke="#9c27b0" strokeWidth="1.5"/>
      <rect x="8" y="25" width="64" height="28" fill="#2a0a4a" stroke="#9c27b0" strokeWidth="1.5"/>
      <ellipse cx="40" cy="53" rx="32" ry="8" fill="#1e0838" stroke="#9c27b0" strokeWidth="1.5"/>
      <ellipse cx="40" cy="39" rx="10" ry="10" fill="none" stroke="#9c27b0" strokeWidth="1" opacity="0.5"/>
      <circle cx="40" cy="39" r="4" fill="#9c27b0" opacity="0.8"/>
      {[0,1,2,3,4,5].map(i => {
        const angle = (i * 60 - 90) * Math.PI / 180
        return <circle key={i}
          cx={40 + 18 * Math.cos(angle)}
          cy={39 + 8 * Math.sin(angle)}
          r="2.5" fill="#9c27b0" opacity="0.7"/>
      })}
    </svg>
  ),
}

function DeviceNode({ data }) {
  return (
    <div className="flex flex-col items-center">
      <Handle type="target" position={Position.Top} />
      <div className="rounded-lg p-1 cursor-pointer">
        {deviceSVGs[data.deviceType]}
      </div>
      <div className="text-white text-xs mt-1 bg-gray-900 bg-opacity-80 px-2 py-0.5 rounded font-mono">
        {data.label}
      </div>
      {data.ip && (
        <div className='text-xs px-2 py-0.5 rounded font-mono'
        style={{color: "#4a9eff", background: '#4a9eff11', border:'1px solid #4a9eff44'}}>
          {data.ip}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

export default DeviceNode