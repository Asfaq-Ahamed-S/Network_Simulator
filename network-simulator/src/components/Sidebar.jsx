const deviceTypes = [
    {type: 'PC', label: 'PC'},
    {type: 'Router', label: 'Router'},
    {type: 'Switch', label: 'Switch'},
    {type: 'Hub', label: 'Hub'},
    {type: 'Firewall', label:'Firewall'},
    {type: 'Server', label:'Server'},
    {type: 'IDS', label:'IDS'},
    {type: 'WAF', label:'WAF'},
    {type: 'AccessPoint', label:'AccessPoint'},
    {type: 'Cloud', label:'Cloud'},
    {type: 'VPN', label:'VPN'},
]

function Sidebar({ onAddNode, pingMode, onTogglePing }) {
    return (
        <div className="w-48 bg-gray-800 text-white flex flex-col gap-3 p-4 border-r border-gray-600">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">
                Devices
            </h2>
            {deviceTypes.map( (d) => (
                <button key={d.type} onClick={()=> onAddNode(d.type)}
                className="bg-gray-700 hover:bg-blue-600 transition-colors text-sm py-2 px-3 rounded text-left">
                    {d.label}
                </button>
            ))}

            <div className="mt-auto pt-4 border-t border-gray-600">
                {pingMode && (
                    <p className="text-xs text-yellow-400 mb-2 text-center">
                        Click source --- then target
                    </p>
                )}
                <button onClick={onTogglePing} className="w-full py-2 px-3 rounded text-sm font-medium transition-all"
                style={{
                    background: pingMode ? '#00c85322' : '#1f2937',
                    border: `1px solid ${pingMode ? '#00c853' : '#374151'}`,
                    color: pingMode ? '#00c853' : '#9ca3af',
                }}>
                    {pingMode ? 'ExitPing' : 'Ping Mode'}
                </button>
            </div>
        </div>
    )
}

export default Sidebar