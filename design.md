# Patient Portal - Design Document

## 1. Tech Stack Choices

### Q1. Frontend Framework: React (Vite)
**Why React?**
- **Component-based architecture**: Makes it easy to build reusable UI components like document cards, upload forms, and notification systems
- **Virtual DOM**: Efficient re-rendering when the document list updates after upload/delete operations
- **Large ecosystem**: Access to libraries like `axios` for API calls and great developer tools
- **Vite as build tool**: Faster development experience with hot module replacement (HMR)

### Q2. Backend Framework: Node.js + Express
**Why Express?**
- **Lightweight & minimal**: Perfect for a simple REST API without unnecessary overhead
- **Excellent file handling**: Works seamlessly with `multer` middleware for PDF uploads
- **JavaScript throughout**: Same language on frontend and backend reduces context switching
- **Easy to set up**: Can have a working API in minutes
- **Great documentation**: Well-documented with abundant community resources

### Q3. Database: MongoDB
**Why MongoDB?**
- **Document-oriented**: Flexible schema perfect for storing file metadata as JSON-like documents
- **Scalable**: Designed for horizontal scaling, ready for production workloads
- **Mongoose ODM**: Elegant object modeling with schema validation
- **Rich queries**: Powerful query language for filtering and sorting documents
- **Developer friendly**: Easy to set up locally with MongoDB Community Edition

### Q4. Scaling to 1,000 Users
If this application needed to support 1,000 concurrent users, I would consider:

| Change | Reason |
|--------|--------|
| **MongoDB Atlas** | Migrate from local MongoDB to managed cloud MongoDB for high availability |
| **Cloud Storage (S3/GCS)** | Move file storage from local `uploads/` to cloud object storage for scalability and reliability |
| **User Authentication** | Implement JWT-based auth so each user can only access their own documents |
| **Load Balancer** | Distribute traffic across multiple backend instances |
| **Redis Caching** | Cache frequently accessed file metadata to reduce database load |
| **File Size Limits** | Implement stricter limits and virus scanning for uploaded files |
| **CDN** | Serve static frontend assets and downloadable files through a CDN |

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                      │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐    │
│  │  Upload Form  │  │ Document List │  │  Notifications    │    │
│  └───────────────┘  └───────────────┘  └───────────────────┘    │
│                          Port: 5173                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                          HTTP/REST API
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Express.js)                         │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐    │
│  │   Routes      │  │   Multer      │  │   Controllers     │    │
│  │  /documents   │  │ (File Upload) │  │  (Business Logic) │    │
│  └───────────────┘  └───────────────┘  └───────────────────┘    │
│                          Port: 3000                              │
└─────────────────────────────────────────────────────────────────┘
                │                               │
                ▼                               ▼
┌───────────────────────────┐    ┌───────────────────────────────┐
│    MongoDB Database       │    │      Local File Storage       │
│  ┌─────────────────────┐  │    │  ┌─────────────────────────┐  │
│  │  documents collection│  │    │  │      uploads/           │  │
│  │  - _id (ObjectId)   │  │    │  │  - document1.pdf        │  │
│  │  - filename         │  │    │  │  - document2.pdf        │  │
│  │  - filepath         │  │    │  │  - ...                  │  │
│  │  - filesize         │  │    │  └─────────────────────────┘  │
│  │  - created_at       │  │    │                               │
│  └─────────────────────┘  │    │                               │
└───────────────────────────┘    └───────────────────────────────┘
```

### Data Flow (Bullet Points)
1. **Frontend** sends HTTP requests to the Express backend
2. **Backend** processes requests, handles file operations via Multer
3. **File metadata** is stored in MongoDB database
4. **Actual PDF files** are stored in `uploads/` directory
5. **Responses** sent back to frontend for UI updates

---

## 3. API Specification

### POST /documents/upload
**Description:** Upload a new PDF document

**Request:**
- Content-Type: `multipart/form-data`
- Body: PDF file in `file` field

```bash
curl -X POST http://localhost:3000/documents/upload \
  -F "file=@prescription.pdf"
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "document": {
    "id": 1,
    "filename": "prescription.pdf",
    "filepath": "uploads/1702234567890-prescription.pdf",
    "filesize": 125432,
    "created_at": "2024-12-10T12:30:00.000Z"
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "error": "Only PDF files are allowed"
}
```

---

### GET /documents
**Description:** List all uploaded documents

**Request:**
```bash
curl http://localhost:3000/documents
```

**Response (Success - 200):**
```json
{
  "success": true,
  "documents": [
    {
      "id": 1,
      "filename": "prescription.pdf",
      "filesize": 125432,
      "created_at": "2024-12-10T12:30:00.000Z"
    },
    {
      "id": 2,
      "filename": "test_results.pdf",
      "filesize": 256789,
      "created_at": "2024-12-10T14:45:00.000Z"
    }
  ]
}
```

---

### GET /documents/:id
**Description:** Download a specific document

**Request:**
```bash
curl -O http://localhost:3000/documents/1
```

**Response (Success - 200):**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="prescription.pdf"`
- Body: Binary PDF data

**Response (Error - 404):**
```json
{
  "success": false,
  "error": "Document not found"
}
```

---

### DELETE /documents/:id
**Description:** Delete a document

**Request:**
```bash
curl -X DELETE http://localhost:3000/documents/1
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "error": "Document not found"
}
```

---

## 4. Data Flow Description

### Q5. File Upload Process
1. User selects a PDF file in the upload form
2. Frontend validates file type (must be `.pdf`)
3. Frontend sends `POST /documents/upload` with file as `multipart/form-data`
4. Backend receives request, Multer middleware extracts the file
5. Multer validates file type (MIME type check) and size limits
6. File is saved to `uploads/` folder with a unique timestamped name
7. Metadata (filename, filepath, filesize, created_at) is saved to MongoDB
8. Backend returns success response with document ID
9. Frontend displays success notification and refreshes document list

### Q5. File Download Process
1. User clicks "Download" button on a document
2. Frontend sends `GET /documents/:id` request
3. Backend queries MongoDB for document metadata by ObjectId
4. If found, backend reads file from `uploads/` using filepath
5. Backend sets appropriate headers (Content-Type, Content-Disposition)
6. File is streamed to the client
7. Browser initiates download with original filename

---

## 5. Assumptions

### Q6. Assumptions Made

| Category | Assumption |
|----------|------------|
| **Users** | Single user system - no authentication required |
| **File Types** | Only PDF files are accepted (validated on both frontend and backend) |
| **File Size** | Maximum file size limit of 10MB per upload |
| **Storage** | Local filesystem storage is sufficient; no cloud storage needed |
| **Concurrency** | Single-user access; no concurrent write conflicts expected |
| **Security** | Running locally; no HTTPS or advanced security measures required |
| **Browser** | Modern browser with JavaScript enabled |
| **Filenames** | Files are renamed with timestamp prefix to prevent collisions |
| **Database** | MongoDB runs locally on mongodb://localhost:27017 |
| **Persistence** | Data persists between server restarts |
