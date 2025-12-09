import './PDFViewer.css'

function PDFViewer({ documentId, filename, onClose }) {
    const API_URL = 'http://localhost:3000'

    return (
        <div className="pdf-viewer-overlay">
            <div className="pdf-viewer-container">
                <div className="pdf-viewer-header">
                    <h3 className="pdf-viewer-title">{filename}</h3>
                    <button className="pdf-viewer-close" onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div className="pdf-viewer-content">
                    <iframe
                        src={`${API_URL}/documents/${documentId}?view=true`}
                        title={filename}
                        className="pdf-iframe"
                    />
                </div>
            </div>
        </div>
    )
}

export default PDFViewer
