import './DocumentList.css'

function DocumentList({ documents, loading, onDownload, onDelete, onView, viewingId }) {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    if (loading) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <p>Loading documents...</p>
            </div>
        )
    }

    if (documents.length === 0) {
        return (
            <div className="empty-state">
                <h3>No Documents found</h3>
                <p>Upload your first PDF to get started</p>
            </div>
        )
    }

    return (
        <div className="document-list">
            {documents.map((doc) => (
                <div
                    key={doc.id}
                    className={`document-card ${viewingId === doc.id ? 'active' : ''} ${viewingId ? 'clickable' : ''}`}
                    onClick={() => viewingId && onView(doc.id)}
                >
                    <div className="document-info">
                        <h3 className="document-name">{doc.filename}</h3>
                        <div className="document-meta">
                            <span className="meta-item">
                                {formatFileSize(doc.filesize)}
                            </span>
                            <span className="meta-item">
                                {formatDate(doc.created_at)}
                            </span>
                        </div>
                    </div>
                    <div className="document-actions">
                        <button
                            className="action-btn view-btn"
                            onClick={() => onView(doc.id)}
                            title="View"
                        >
                            View
                        </button>
                        <button
                            className="action-btn download-btn"
                            onClick={() => onDownload(doc.id, doc.filename)}
                            title="Download"
                        >
                            Download
                        </button>
                        <button
                            className="action-btn delete-btn"
                            onClick={() => onDelete(doc.id)}
                            title="Delete"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default DocumentList
