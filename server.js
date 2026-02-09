require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const setupDatabase = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const subjectRoutes = require('./src/routes/subjectRoutes');
const noteRoutes = require('./src/routes/noteRoutes');
const assignmentRoutes = require('./src/routes/assignmentRoutes');
const timetableRoutes = require('./src/routes/timetableRoutes');
const progressRoutes = require('./src/routes/progressRoutes');
const announcementRoutes = require('./src/routes/announcementRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const userDataRoutes = require('./src/routes/userDataRoutes');
const flashcardRoutes = require('./src/routes/flashcardRoutes');
const seedDatabase = require('./src/config/seedData');

// Initialize express app
const app = express();

// Display header
console.log('\n' + '='.repeat(60));
console.log('🎓 EduTrack - Smart Student Study Management System');
console.log('='.repeat(60) + '\n');

// Setup database and seed data
setupDatabase().then(async () => {
  // Seed data for in-memory database (fresh data on each restart)
  const useMemoryDB = process.env.USE_MEMORY_DB === 'true' || !process.env.MONGODB_URI;
  if (useMemoryDB) {
    try {
      await seedDatabase();
    } catch (err) {
      console.error('⚠️ Seeding failed:', err.message);
    }
  }
}).catch(err => {
  console.error('❌ Database setup failed:', err.message);
});

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 }
}));

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎓 EduTrack Backend API - Student Study Platform',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      subjects: '/api/subjects',
      notes: '/api/notes',
      assignments: '/api/assignments',
      timetable: '/api/timetable',
      progress: '/api/progress',
      announcements: '/api/announcements',
      ai: '/api/ai',
      userData: '/api/user-data',
      flashcards: '/api/flashcards'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'EduTrack Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Simple file upload endpoint (stores as base64 for simplicity)
app.post('/api/upload', (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const file = req.files.file;
    const base64 = file.data.toString('base64');
    const dataUrl = `data:${file.mimetype};base64,${base64}`;
    
    res.json({
      success: true,
      data: {
        url: dataUrl,
        filename: file.name,
        mimetype: file.mimetype,
        size: file.size
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/user-data', userDataRoutes);
app.use('/api/flashcards', flashcardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 EduTrack Backend running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('❌ Server error:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Kill the process and try again.`);
  }
  process.exit(1);
});

module.exports = app;
