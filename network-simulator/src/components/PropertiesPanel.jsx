function PropertiesPanel({ node, onClose, onUpdate }) {
  const handleChange = (field, value) => {
    onUpdate(node.id, { ...node.data, [field]: value })
  }

  const deviceColors = {
    PC: '#4a9eff',
    Router: '#ff8c00',
    Switch: '#00c853',
    Hub: '#9c27b0',
  }

  const color = deviceColors[node.data.deviceType] || '#fff'

  return (
    <div className="absolute top-0 right-0 h-full w-64 bg-gray-900 border-l border-gray-700 z-30 flex flex-col shadow-2xl">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-gray-700"
        style={{ borderTop: `3px solid ${color}` }}
      >
        <span className="text-white font-semibold text-sm">
          {node.data.deviceType} Properties
        </span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-lg leading-none"
        >
          ✕
        </button>
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-5 px-4 py-5">
        {/* Name */}
        <div className="flex flex-col gap-1">
          <label className="text-gray-400 text-xs uppercase tracking-wider">
            Device Name
          </label>
          <input
            type="text"
            value={node.data.label}
            onChange={(e) => handleChange('label', e.target.value)}
            className="bg-gray-800 text-white text-sm px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* IP Address */}
        <div className="flex flex-col gap-1">
          <label className="text-gray-400 text-xs uppercase tracking-wider">
            IP Address
          </label>
          <input
            type="text"
            value={node.data.ip || ''}
            onChange={(e) => handleChange('ip', e.target.value)}
            placeholder="e.g. 192.168.1.1"
            className="bg-gray-800 text-white text-sm px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none placeholder-gray-600"
          />
        </div>

        {/* Device Type — read only */}
        <div className="flex flex-col gap-1">
          <label className="text-gray-400 text-xs uppercase tracking-wider">
            Device Type
          </label>
          <div
            className="text-sm px-3 py-2 rounded border font-mono"
            style={{ color, borderColor: color, background: `${color}11` }}
          >
            {node.data.deviceType}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertiesPanel