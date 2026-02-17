require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
// const fileUpload = require('express-fileupload'); // Removed for cost optimization
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
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// ... (other imports)

const app = express();

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow loading resources across origins (dev mode)
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api', limiter);

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

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// File upload middleware removed
// app.use(fileUpload({ ... }));

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

// File upload endpoint disabled for free tier
app.post('/api/upload', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'File upload is disabled in the free version to reduce costs. Please use external links.'
  });
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
