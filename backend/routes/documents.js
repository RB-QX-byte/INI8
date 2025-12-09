const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Document } = require('../database');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Add timestamp to filename to prevent collisions
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

// File filter to accept only PDFs
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// POST /documents/upload - Upload a PDF
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        const { originalname, filename, size } = req.file;
        const filepath = `uploads/${filename}`;

        // Create document in MongoDB
        const document = new Document({
            filename: originalname,
            filepath: filepath,
            filesize: size
        });
        await document.save();

        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            document: {
                id: document._id,
                filename: document.filename,
                filepath: document.filepath,
                filesize: document.filesize,
                created_at: document.created_at
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload file'
        });
    }
});

// GET /documents - List all documents
router.get('/', async (req, res) => {
    try {
        const documents = await Document.find().sort({ created_at: -1 });
        res.json({
            success: true,
            documents: documents.map(doc => ({
                id: doc._id,
                filename: doc.filename,
                filesize: doc.filesize,
                created_at: doc.created_at
            }))
        });
    } catch (error) {
        console.error('List error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve documents'
        });
    }
});

// GET /documents/:id - Download or view a document
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { view } = req.query; // Check if viewing (inline) or downloading
        const document = await Document.findById(id);

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found'
            });
        }

        const filePath = path.join(__dirname, '..', document.filepath);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: 'File not found on server'
            });
        }

        // Set headers - inline for viewing, attachment for download
        res.setHeader('Content-Type', 'application/pdf');
        if (view === 'true') {
            res.setHeader('Content-Disposition', `inline; filename="${document.filename}"`);
        } else {
            res.setHeader('Content-Disposition', `attachment; filename="${document.filename}"`);
        }

        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to download file'
        });
    }
});

// DELETE /documents/:id - Delete a document
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const document = await Document.findById(id);

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found'
            });
        }

        // Delete file from filesystem
        const filePath = path.join(__dirname, '..', document.filepath);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete from MongoDB
        await Document.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Document deleted successfully'
        });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete document'
        });
    }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File size exceeds 10MB limit'
            });
        }
    }
    if (error.message === 'Only PDF files are allowed') {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
    next(error);
});

module.exports = router;
