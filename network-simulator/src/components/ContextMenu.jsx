import { useEffect, useRef } from "react"

function ContextMenu({ x, y, onDelete, onClose}) {
    const menuRef = useRef(null)

    useEffect(() => {
        const handleMouseDown = (e) => {
            if(menuRef.current && !menuRef.current.contains(e.target)){
                onClose()
            }
        }
        document.addEventListener('mousedown', handleMouseDown)
        return () => document.removeEventListener('mousedown',handleMouseDown)
    }, [onClose])
    
    return (
        <div ref={menuRef} className="fixed z-50 bg-white-800 border border-gray-600 rounded-lg shadow-cl py-1 min-w-36"
        style={{left: x, top: y}}>
            <button onClick={onDelete} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors">
                Delete
            </button>
        </div>
    )
}

export default ContextMenu