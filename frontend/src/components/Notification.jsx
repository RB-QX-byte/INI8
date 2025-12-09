import { useEffect } from 'react'
import './Notification.css'

function Notification({ message, type, onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000)
        return () => clearTimeout(timer)
    }, [onClose])

    return (
        <div className={`notification ${type}`}>
            <span className="notification-message">{message}</span>
            <button className="notification-close" onClick={onClose}>
                ✕
            </button>
        </div>
    )
}

export default Notification
