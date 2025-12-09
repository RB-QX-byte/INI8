import { useState, useRef } from 'react'
import './UploadForm.css'

function UploadForm({ onUpload }) {
    const [dragActive, setDragActive] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null)
    const [error, setError] = useState('')
    const [uploading, setUploading] = useState(false)
    const inputRef = useRef(null)

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const validateFile = (file) => {
        if (!file) return 'No file selected'
        if (file.type !== 'application/pdf') {
            return 'Only PDF files are allowed'
        }
        if (file.size > 10 * 1024 * 1024) {
            return 'File size must be less than 10MB'
        }
        return null
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        const file = e.dataTransfer.files[0]
        const validationError = validateFile(file)
        if (validationError) {
            setError(validationError)
            return
        }
        setError('')
        setSelectedFile(file)
    }

    const handleChange = (e) => {
        const file = e.target.files[0]
        const validationError = validateFile(file)
        if (validationError) {
            setError(validationError)
            return
        }
        setError('')
        setSelectedFile(file)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!selectedFile) {
            setError('Please select a file')
            return
        }

        setUploading(true)
        try {
            await onUpload(selectedFile)
            setSelectedFile(null)
            if (inputRef.current) {
                inputRef.current.value = ''
            }
        } finally {
            setUploading(false)
        }
    }

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    return (
        <form className="upload-form" onSubmit={handleSubmit}>
            <div
                className={`drop-zone ${dragActive ? 'active' : ''} ${selectedFile ? 'has-file' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleChange}
                    className="file-input"
                />

                {selectedFile ? (
                    <div className="selected-file">
                        <div className="file-info">
                            <span className="file-name">{selectedFile.name}</span>
                            <span className="file-size">{formatFileSize(selectedFile.size)}</span>
                        </div>
                        <button
                            type="button"
                            className="clear-btn"
                            onClick={(e) => {
                                e.stopPropagation()
                                setSelectedFile(null)
                                if (inputRef.current) inputRef.current.value = ''
                            }}
                        >
                            ✕
                        </button>
                    </div>
                ) : (
                    <div className="drop-message">
                        <p>Drag and drop a PDF here, or click to browse</p>
                        <span className="file-hint">Maximum file size: 10MB</span>
                    </div>
                )}
            </div>

            {error && <p className="error-message">{error}</p>}

            <button
                type="submit"
                className="upload-btn"
                disabled={!selectedFile || uploading}
            >
                {uploading ? (
                    <>
                        <span className="spinner"></span>
                        Uploading...
                    </>
                ) : (
                    <>
                        Upload Document
                    </>
                )}
            </button>
        </form>
    )
}

export default UploadForm
