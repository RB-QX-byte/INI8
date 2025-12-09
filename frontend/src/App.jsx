import { useState, useEffect } from 'react'
import UploadForm from './components/UploadForm'
import DocumentList from './components/DocumentList'
import Notification from './components/Notification'
import PDFViewer from './components/PDFViewer'
import './App.css'

const API_URL = 'http://localhost:3000'

function App() {
  const [documents, setDocuments] = useState([])
  const [notification, setNotification] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewingDocument, setViewingDocument] = useState(null)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  // Apply dark mode class to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  // Fetch documents on mount
  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/documents`)
      const data = await response.json()
      if (data.success) {
        setDocuments(data.documents)
      }
    } catch (error) {
      showNotification('Failed to fetch documents', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleUpload = async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${API_URL}/documents/upload`, {
        method: 'POST',
        body: formData
      })
      const data = await response.json()

      if (data.success) {
        showNotification('File uploaded successfully!', 'success')
        fetchDocuments()
      } else {
        showNotification(data.error || 'Upload failed', 'error')
      }
    } catch (error) {
      showNotification('Failed to upload file', 'error')
    }
  }

  const handleDownload = async (id, filename) => {
    try {
      const response = await fetch(`${API_URL}/documents/${id}`)
      if (!response.ok) {
        throw new Error('Download failed')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      showNotification('File downloaded!', 'success')
    } catch (error) {
      showNotification('Failed to download file', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/documents/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        // Close the viewer if the deleted document was being viewed
        if (viewingDocument && viewingDocument.id === id) {
          setViewingDocument(null)
        }
        showNotification('Document deleted successfully!', 'success')
        fetchDocuments()
      } else {
        showNotification(data.error || 'Delete failed', 'error')
      }
    } catch (error) {
      showNotification('Failed to delete document', 'error')
    }
  }

  const handleView = (id) => {
    const doc = documents.find(d => d.id === id)
    if (doc) {
      setViewingDocument(doc)
    }
  }

  const handleCloseViewer = () => {
    setViewingDocument(null)
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <h1>PATIENT PORTAL</h1>
          </div>
          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      <div className={`content-wrapper ${viewingDocument ? 'viewing' : ''}`}>
        <main className="main">
          <section className="upload-section">
            <h2>Upload Document</h2>
            <UploadForm onUpload={handleUpload} />
          </section>

          <section className="documents-section">
            <h2>Your Documents</h2>
            <DocumentList
              documents={documents}
              loading={loading}
              onView={handleView}
              onDownload={handleDownload}
              onDelete={handleDelete}
              viewingId={viewingDocument?.id}
            />
          </section>
        </main>

        {viewingDocument && (
          <aside className="pdf-panel">
            <div className="pdf-panel-header">
              <h3 className="pdf-panel-title">{viewingDocument.filename}</h3>
              <button className="pdf-panel-close" onClick={handleCloseViewer}>
                ✕ Close
              </button>
            </div>
            <div className="pdf-panel-content">
              <iframe
                src={`${API_URL}/documents/${viewingDocument.id}?view=true`}
                title={viewingDocument.filename}
                className="pdf-iframe"
              />
            </div>
          </aside>
        )}
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  )
}

export default App
