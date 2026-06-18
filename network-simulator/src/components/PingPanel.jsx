function PingPanel({ logs, onClose }) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[500px] bg-gray-950 border border-gray-700 rounded-lg shadow-2xl z-30 font-mono">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <span className="text-green-400 text-xs font-bold tracking-widest">● PING TERMINAL</span>
        <button onClick={onClose} className="text-gray-500 hover:text-white text-xs">✕ Close</button>
      </div>
      <div className="px-4 py-3 min-h-28 max-h-52 overflow-y-auto space-y-0.5">
        {logs.length === 0 && (
          <div className="text-gray-500 text-xs">Waiting for input...</div>
        )}
        {logs.map((log, i) => (
          <div key={i} className="text-xs" style={{
            color: log.type === 'success' ? '#00c853'
                 : log.type === 'error'   ? '#ff5252'
                 : log.type === 'info'    ? '#4a9eff'
                 : '#6b7280'
          }}>
            {log.text}
          </div>
        ))}
      </div>
    </div>
  )
}

export default PingPanel