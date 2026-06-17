const deviceTypes = [
    {type: 'PC', label: 'PC'},
    {type: 'Router', label: 'Router'},
    {type: 'Switch', label: 'Switch'},
    {type: 'Hub', label: 'Hub'},
]

function Sidebar({ onAddNode }) {
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
        </div>
    )
}

export default Sidebar