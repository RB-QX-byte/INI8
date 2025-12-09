# Patient Portal - Medical Document Management

A full-stack web application for patients to upload, view, download, and delete their medical documents (PDFs).

![Tech Stack](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat&logo=react)
![Tech Stack](https://img.shields.io/badge/Backend-Express.js-000000?style=flat&logo=express)
![Tech Stack](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat&logo=mongodb)
![Tech Stack](https://img.shields.io/badge/Styling-TailwindCSS-38B2AC?style=flat&logo=tailwindcss)

## 🚀 Features

- **Upload** PDF documents with drag-and-drop support
- **View** PDFs in-app with split-view layout
- **Download** any document with a single click
- **Delete** documents when no longer needed
- **Dark/Light Theme** toggle with preference persistence
- **Split-View PDF Viewer** - view PDFs alongside your document list
- **Quick Document Switching** - click any document to switch PDF view
- File validation (PDF only, 10MB limit)
- Success/error notifications
- Responsive design for all screen sizes

## 📋 Prerequisites

- Node.js v18 or higher
- npm (comes with Node.js)
- **MongoDB** (local installation or MongoDB Atlas)

### Installing MongoDB Locally

**Windows:**
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Run the installer and follow the setup wizard
3. MongoDB will run as a Windows service automatically

**Or use MongoDB Atlas (Cloud):**
1. Sign up at https://www.mongodb.com/atlas
2. Create a free cluster
3. Get your connection string and set it as `MONGODB_URI` environment variable

## 🛠️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/patient-portal.git
cd patient-portal
```

### 2. Start MongoDB

Make sure MongoDB is running locally on `mongodb://localhost:27017` or set the `MONGODB_URI` environment variable.

```bash
# Check if MongoDB is running (Windows)
mongosh
```

### 3. Start the Backend

```bash
cd backend
npm install
npm start
```

The backend server will start at **http://localhost:3000**

### 4. Start the Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

The frontend will start at **http://localhost:5173** (or next available port)

### 5. Open in Browser

Navigate to **http://localhost:5173** to use the application.

## 📁 Project Structure

```
patient-portal/
├── .gitignore             # Git ignore configuration
├── design.md              # Design document with architecture & decisions
├── README.md              # This file
├── backend/
│   ├── package.json       # Backend dependencies (express, mongoose, multer)
│   ├── server.js          # Express server entry point
│   ├── database.js        # MongoDB connection & Mongoose schema
│   ├── .env               # Environment variables (not in git)
│   ├── routes/
│   │   └── documents.js   # REST API routes
│   └── uploads/           # Uploaded PDF files (not in git)
└── frontend/
    ├── package.json       # Frontend dependencies
    ├── vite.config.js     # Vite configuration with Tailwind
    ├── src/
    │   ├── App.jsx        # Main React component
    │   ├── App.css        # Global styles with dark mode support
    │   ├── index.css      # Tailwind imports
    │   └── components/
    │       ├── UploadForm.jsx      # File upload component
    │       ├── UploadForm.css
    │       ├── DocumentList.jsx    # Document list component
    │       ├── DocumentList.css
    │       ├── PDFViewer.jsx       # PDF viewer component (removed - inline)
    │       ├── Notification.jsx    # Toast notifications
    │       └── Notification.css
    └── index.html
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/documents/upload` | Upload a new PDF document |
| GET | `/documents` | List all documents |
| GET | `/documents/:id` | Download/View a document |
| DELETE | `/documents/:id` | Delete a document |

### Example: Upload a Document

```bash
curl -X POST http://localhost:3000/documents/upload \
  -F "file=@/path/to/your/document.pdf"
```

### Example: List All Documents

```bash
curl http://localhost:3000/documents
```

## 🌙 Dark Mode

The application includes a dark/light theme toggle:
- Click the theme button in the header to switch
- Your preference is saved in localStorage
- Smooth transitions between themes

## ⚠️ Notes

- Requires **MongoDB** to be running locally or via MongoDB Atlas
- Only PDF files are accepted (MIME type validation)
- Maximum file size: 10MB
- Files are stored in `backend/uploads/` directory
- Database: MongoDB `patient-portal` database, `documents` collection

## 📝 Design Document

See [design.md](./design.md) for:
- Tech stack choices and justifications
- Architecture overview
- API specifications
- Data flow descriptions
- Scaling considerations

## 📄 License

This project is created as part of a Full Stack Developer assessment.
