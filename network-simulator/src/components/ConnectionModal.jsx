import { useState } from 'react'

const cableTypes = ['Cat5e', 'Cat6', 'Cat6a', 'Fiber SM', 'Fiber MM', 'Coaxial', 'Serial']

const speedOptions = {
  'Cat5e':    ['10Mbps', '100Mbps', '1Gbps'],
  'Cat6':     ['1Gbps', '10Gbps'],
  'Cat6a':    ['1Gbps', '10Gbps'],
  'Fiber SM': ['10Gbps', '40Gbps', '100Gbps'],
  'Fiber MM': ['1Gbps', '10Gbps', '40Gbps'],
  'Coaxial':  ['10Mbps'],
  'Serial':   ['64Kbps', '2Mbps', '155Mbps'],
}

const cableColors = {
  'Cat5e':    '#9e9e9e',
  'Cat6':     '#4a9eff',
  'Cat6a':    '#00c853',
  'Fiber SM': '#ffeb3b',
  'Fiber MM': '#00bcd4',
  'Coaxial':  '#8d6e63',
  'Serial':   '#ff5722',
}

function ConnectionModal({ onConfirm, onCancel }) {
  const [cableType, setCableType] = useState('Cat6')
  const [speed, setSpeed] = useState('1Gbps')

  const handleCableChange = (type) => {
    setCableType(type)
    setSpeed(speedOptions[type][0])
  }

  const color = cableColors[cableType]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-6 w-80">
        <h3 className="text-white font-semibold text-base mb-4">Configure Link</h3>

        <div className="mb-4">
          <label className="text-gray-400 text-xs uppercase tracking-wider block mb-2">
            Cable Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {cableTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleCableChange(type)}
                className="px-3 py-2 rounded text-xs font-mono transition-all text-left"
                style={{
                  background: cableType === type ? `${cableColors[type]}22` : '#1f2937',
                  border: `1px solid ${cableType === type ? cableColors[type] : '#374151'}`,
                  color: cableType === type ? cableColors[type] : '#9ca3af',
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="text-gray-400 text-xs uppercase tracking-wider block mb-2">
            Speed
          </label>
          <div className="flex gap-2 flex-wrap">
            {speedOptions[cableType].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className="px-3 py-1.5 rounded text-xs font-mono transition-all"
                style={{
                  background: speed === s ? `${color}22` : '#1f2937',
                  border: `1px solid ${speed === s ? color : '#374151'}`,
                  color: speed === s ? color : '#9ca3af',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Live preview */}
        <div className="mb-5 flex items-center gap-3 px-3 py-2 rounded bg-gray-800">
          <div className="h-0.5 flex-1 rounded"
            style={{ background: color, boxShadow: `0 0 6px ${color}` }}/>
          <span className="text-xs font-mono" style={{ color }}>
            {cableType} · {speed}
          </span>
          <div className="h-0.5 flex-1 rounded"
            style={{ background: color, boxShadow: `0 0 6px ${color}` }}/>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded border border-gray-600 text-gray-400 text-sm hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm({ cableType, speed })}
            className="flex-1 py-2 rounded text-sm font-medium transition-colors"
            style={{ background: color, color: '#000' }}
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConnectionModal