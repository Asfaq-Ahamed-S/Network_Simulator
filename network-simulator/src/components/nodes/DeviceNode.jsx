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
  
  Firewall: (
  <svg viewBox="0 0 80 75" width="80" height="75">
    {/* Brick wall — standard FW icon, row 1 */}
    <rect x="5"  y="8"  width="32" height="14" rx="2" fill="#1f0808" stroke="#ef4444" strokeWidth="1.5"/>
    <rect x="41" y="8"  width="34" height="14" rx="2" fill="#1f0808" stroke="#ef4444" strokeWidth="1.5"/>
    {/* Row 2 — offset */}
    <rect x="5"  y="25" width="14" height="14" rx="2" fill="#1f0808" stroke="#ef4444" strokeWidth="1.5"/>
    <rect x="23" y="25" width="32" height="14" rx="2" fill="#1f0808" stroke="#ef4444" strokeWidth="1.5"/>
    <rect x="59" y="25" width="16" height="14" rx="2" fill="#1f0808" stroke="#ef4444" strokeWidth="1.5"/>
    {/* Row 3 */}
    <rect x="5"  y="42" width="32" height="14" rx="2" fill="#1f0808" stroke="#ef4444" strokeWidth="1.5"/>
    <rect x="41" y="42" width="34" height="14" rx="2" fill="#1f0808" stroke="#ef4444" strokeWidth="1.5"/>
    {/* Status dots */}
    <circle cx="20" cy="63" r="2" fill="#ef4444" opacity="0.7"/>
    <circle cx="40" cy="63" r="2" fill="#ef4444" opacity="0.5"/>
    <circle cx="60" cy="63" r="2" fill="#ef4444" opacity="0.3"/>
  </svg>
),

Server: (
  <svg viewBox="0 0 80 75" width="80" height="75">
    {/* Rack Unit 1 */}
    <rect x="5" y="5"  width="70" height="18" rx="2" fill="#071a19" stroke="#14b8a6" strokeWidth="1.5"/>
    <rect x="10" y="9" width="18" height="10" rx="1" fill="#0a2422"/>
    <rect x="31" y="9" width="18" height="10" rx="1" fill="#0a2422"/>
    <circle cx="63" cy="11" r="2.5" fill="#14b8a6" opacity="0.9"/>
    <circle cx="70" cy="11" r="2.5" fill="#14b8a6" opacity="0.35"/>
    <rect x="58" y="16" width="15" height="4" rx="1" fill="#071a19" stroke="#14b8a6" strokeWidth="0.8"/>
    {/* Rack Unit 2 */}
    <rect x="5" y="28" width="70" height="18" rx="2" fill="#071a19" stroke="#14b8a6" strokeWidth="1.5"/>
    <rect x="10" y="32" width="18" height="10" rx="1" fill="#0a2422"/>
    <rect x="31" y="32" width="18" height="10" rx="1" fill="#0a2422"/>
    <circle cx="63" cy="34" r="2.5" fill="#14b8a6" opacity="0.9"/>
    <circle cx="70" cy="34" r="2.5" fill="#14b8a6" opacity="0.35"/>
    <rect x="58" y="39" width="15" height="4" rx="1" fill="#071a19" stroke="#14b8a6" strokeWidth="0.8"/>
    {/* Rack Unit 3 */}
    <rect x="5" y="51" width="70" height="18" rx="2" fill="#071a19" stroke="#14b8a6" strokeWidth="1.5"/>
    <rect x="10" y="55" width="18" height="10" rx="1" fill="#0a2422"/>
    <rect x="31" y="55" width="18" height="10" rx="1" fill="#0a2422"/>
    <circle cx="63" cy="57" r="2.5" fill="#14b8a6" opacity="0.9"/>
    <circle cx="70" cy="57" r="2.5" fill="#14b8a6" opacity="0.35"/>
    <rect x="58" y="62" width="15" height="4" rx="1" fill="#071a19" stroke="#14b8a6" strokeWidth="0.8"/>
  </svg>
),

IDS: (
  <svg viewBox="0 0 80 75" width="80" height="75">
    {/* Appliance body */}
    <rect x="5" y="15" width="70" height="48" rx="3" fill="#1a1100" stroke="#f59e0b" strokeWidth="1.5"/>
    {/* Eye outer */}
    <ellipse cx="36" cy="39" rx="22" ry="13" fill="#0d0900" stroke="#f59e0b" strokeWidth="1.5"/>
    {/* Iris */}
    <circle cx="36" cy="39" r="9"   fill="#1a1100" stroke="#f59e0b" strokeWidth="1.5"/>
    {/* Pupil glow */}
    <circle cx="36" cy="39" r="5"   fill="#f59e0b" opacity="0.25"/>
    <circle cx="36" cy="39" r="2.5" fill="#f59e0b" opacity="0.9"/>
    {/* Glint */}
    <circle cx="38.5" cy="37" r="1.2" fill="white" opacity="0.7"/>
    {/* Scan lines */}
    <line x1="5"  y1="39" x2="14" y2="39" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.8"/>
    <line x1="58" y1="39" x2="75" y2="39" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.8"/>
    {/* Ports */}
    <rect x="10" y="53" width="11" height="6" rx="1" fill="#0d0900" stroke="#f59e0b" strokeWidth="1"/>
    <rect x="24" y="53" width="11" height="6" rx="1" fill="#0d0900" stroke="#f59e0b" strokeWidth="1"/>
    {/* LEDs */}
    <circle cx="63" cy="21" r="3" fill="#f59e0b" opacity="0.9"/>
    <circle cx="71" cy="21" r="3" fill="#f59e0b" opacity="0.3"/>
  </svg>
),

WAF: (
  <svg viewBox="0 0 80 75" width="80" height="75">
    {/* Appliance body */}
    <rect x="5" y="8" width="70" height="60" rx="3" fill="#1a0011" stroke="#ec4899" strokeWidth="1.5"/>
    {/* Globe */}
    <circle cx="37" cy="37" r="22" fill="#0d0009" stroke="#ec4899" strokeWidth="1.5"/>
    {/* Latitude lines */}
    <line x1="15" y1="37" x2="59" y2="37" stroke="#ec4899" strokeWidth="1"   opacity="0.7"/>
    <line x1="17" y1="27" x2="57" y2="27" stroke="#ec4899" strokeWidth="1"   opacity="0.5"/>
    <line x1="17" y1="47" x2="57" y2="47" stroke="#ec4899" strokeWidth="1"   opacity="0.5"/>
    {/* Longitude ellipses */}
    <ellipse cx="37" cy="37" rx="8"  ry="22" fill="none" stroke="#ec4899" strokeWidth="1" opacity="0.7"/>
    <ellipse cx="37" cy="37" rx="16" ry="22" fill="none" stroke="#ec4899" strokeWidth="1" opacity="0.4"/>
    {/* Ports */}
    <rect x="10" y="58" width="11" height="6" rx="1" fill="#0d0009" stroke="#ec4899" strokeWidth="1"/>
    <rect x="24" y="58" width="11" height="6" rx="1" fill="#0d0009" stroke="#ec4899" strokeWidth="1"/>
    {/* LEDs */}
    <circle cx="63" cy="14" r="3" fill="#ec4899" opacity="0.9"/>
    <circle cx="71" cy="14" r="3" fill="#ec4899" opacity="0.3"/>
  </svg>
),

AccessPoint: (
  <svg viewBox="0 0 80 75" width="80" height="75">
    {/* Left antenna */}
    <line x1="24" y1="52" x2="15" y2="8"  stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="15" cy="6" r="3.5" fill="#0ea5e9" opacity="0.9"/>
    {/* Right antenna */}
    <line x1="56" y1="52" x2="65" y2="8"  stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="65" cy="6" r="3.5" fill="#0ea5e9" opacity="0.9"/>
    {/* Disc outer */}
    <ellipse cx="40" cy="62" rx="34" ry="12" fill="#041520" stroke="#0ea5e9" strokeWidth="1.5"/>
    {/* Disc middle ring */}
    <ellipse cx="40" cy="62" rx="22" ry="7.5" fill="#062030" stroke="#0ea5e9" strokeWidth="1" opacity="0.7"/>
    {/* Disc inner ring */}
    <ellipse cx="40" cy="62" rx="10" ry="4"   fill="#083040" stroke="#0ea5e9" strokeWidth="1" opacity="0.5"/>
    {/* Center LED */}
    <circle cx="40" cy="62" r="3.5" fill="#0ea5e9" opacity="0.9"/>
    <circle cx="40" cy="62" r="1.5" fill="white"   opacity="0.6"/>
  </svg>
),

Cloud: (
  <svg viewBox="0 0 80 75" width="80" height="75">
    {/* Cloud blob */}
    <path d="M14 62 A16 16 0 0 1 14 30 A13 13 0 0 1 28 18 A20 20 0 0 1 68 34 A15 15 0 0 1 70 62 Z"
      fill="#141820" stroke="#94a3b8" strokeWidth="1.5"/>
    {/* Inner contour */}
    <path d="M20 55 A11 11 0 0 1 20 35 A9 9 0 0 1 31 26 A14 14 0 0 1 62 39 A10 10 0 0 1 63 55 Z"
      fill="none" stroke="#94a3b8" strokeWidth="0.7" opacity="0.35"/>
    {/* Connection stubs */}
    <line x1="28" y1="62" x2="22" y2="72" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="42" y1="62" x2="42" y2="72" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="56" y1="62" x2="62" y2="72" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/>
    {/* Status glows */}
    <circle cx="55" cy="36" r="3" fill="#94a3b8" opacity="0.5"/>
    <circle cx="63" cy="44" r="2" fill="#94a3b8" opacity="0.3"/>
  </svg>
),

VPN: (
  <svg viewBox="0 0 80 75" width="80" height="75">
    {/* Left antenna */}
    <line x1="22" y1="30" x2="14" y2="8"  stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="14" cy="6" r="3.5" fill="#6366f1" opacity="0.9"/>
    {/* Right antenna */}
    <line x1="58" y1="30" x2="66" y2="8"  stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="66" cy="6" r="3.5" fill="#6366f1" opacity="0.9"/>
    {/* Router body */}
    <rect x="5" y="30" width="70" height="40" rx="3" fill="#08082a" stroke="#6366f1" strokeWidth="1.5"/>
    {/* Left ports */}
    <rect x="10" y="38" width="13" height="9" rx="1" fill="#050520" stroke="#6366f1" strokeWidth="1"/>
    <rect x="26" y="38" width="13" height="9" rx="1" fill="#050520" stroke="#6366f1" strokeWidth="1"/>
    {/* Lock badge */}
    <rect x="44" y="34" width="27" height="28" rx="2.5" fill="#10103a" stroke="#6366f1" strokeWidth="1.5"/>
    {/* Shackle */}
    <path d="M51 34 L51 27 C51 20 64 20 64 27 L64 34"
      fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Keyhole */}
    <circle cx="57.5" cy="45" r="5.5" fill="#08082a" stroke="#6366f1" strokeWidth="1.5"/>
    <circle cx="57.5" cy="45" r="2.5" fill="#6366f1" opacity="0.5"/>
    <line x1="57.5" y1="47.5" x2="57.5" y2="53" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
    {/* LEDs */}
    <circle cx="12" cy="60" r="2.5" fill="#6366f1" opacity="0.9"/>
    <circle cx="19" cy="60" r="2.5" fill="#6366f1" opacity="0.35"/>
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