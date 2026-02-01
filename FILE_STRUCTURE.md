# 📁 EduTrack Backend - Complete File Structure

```
EduTrack/
│
├── 📄 .env                              # Environment variables (SECRET - not in git)
├── 📄 .env.example                      # Example environment file
├── 📄 .gitignore                        # Git ignore rules
├── 📄 package.json                      # Dependencies & scripts
├── 📄 package-lock.json                 # Dependency lock file
├── 📄 server.js                         # 🚀 Main entry point
│
├── 📚 README.md                         # Project overview & features
├── 📚 API_DOCUMENTATION.md              # Complete API reference (50+ endpoints)
├── 📚 QUICK_START.md                    # Step-by-step setup guide
├── 📚 SETUP_SUMMARY.md                  # Comprehensive system summary
├── 📚 FEATURES.md                       # Feature highlights & USPs
├── 📚 FILE_STRUCTURE.md                 # This file
│
├── 📁 .github/
│   └── 📄 copilot-instructions.md       # Project setup instructions
│
├── 📁 node_modules/                     # Dependencies (150 packages)
│
└── 📁 src/                              # Source code
    │
    ├── 📁 config/                       # Configuration files
    │   ├── 📄 database.js               # MongoDB connection setup
    │   └── 📄 cloudinary.js             # Cloudinary file storage config
    │
    ├── 📁 models/                       # Mongoose schemas (8 models)
    │   ├── 📄 User.js                   # User model with roles & authentication
    │   ├── 📄 Subject.js                # Subject/course model
    │   ├── 📄 Unit.js                   # Course unit/module model
    │   ├── 📄 Note.js                   # Notes with files, ratings, versions (★ Core)
    │   ├── 📄 Assignment.js             # Assignment with submissions & grading
    │   ├── 📄 Timetable.js              # Class schedule model
    │   ├── 📄 Progress.js               # Student progress tracking
    │   └── 📄 Announcement.js           # System announcements
    │
    ├── 📁 controllers/                  # Business logic (7 controllers)
    │   ├── 📄 authController.js         # Authentication & user management
    │   ├── 📄 subjectController.js      # Subject & unit operations
    │   ├── 📄 noteController.js         # Note CRUD, search, exam mode (★ Core)
    │   ├── 📄 assignmentController.js   # Assignment & grading operations
    │   ├── 📄 timetableController.js    # Timetable management
    │   ├── 📄 progressController.js     # Progress tracking operations
    │   └── 📄 announcementController.js # Announcement operations
    │
    ├── 📁 routes/                       # API routes (7 route files)
    │   ├── 📄 authRoutes.js             # /api/auth/* endpoints
    │   ├── 📄 subjectRoutes.js          # /api/subjects/* endpoints
    │   ├── 📄 noteRoutes.js             # /api/notes/* endpoints (★ Core)
    │   ├── 📄 assignmentRoutes.js       # /api/assignments/* endpoints
    │   ├── 📄 timetableRoutes.js        # /api/timetable/* endpoints
    │   ├── 📄 progressRoutes.js         # /api/progress/* endpoints
    │   └── 📄 announcementRoutes.js     # /api/announcements/* endpoints
    │
    ├── 📁 middleware/                   # Custom middleware (4 files)
    │   ├── 📄 auth.js                   # JWT authentication middleware
    │   ├── 📄 roleCheck.js              # Role-based authorization
    │   ├── 📄 errorHandler.js           # Global error handling
    │   └── 📄 fileUpload.js             # File validation middleware
    │
    ├── 📁 services/                     # Business services (2 files)
    │   ├── 📄 fileService.js            # Cloudinary operations (★ Important)
    │   └── 📄 searchService.js          # Advanced search functionality (★ Important)
    │
    └── 📁 utils/                        # Helper utilities (3 files)
        ├── 📄 ApiError.js               # Custom error class
        ├── 📄 ApiResponse.js            # Standard response formatter
        └── 📄 helpers.js                # 20+ utility functions
```

---

## 📊 Statistics

### Total Files: 44
- Configuration: 2
- Models: 8
- Controllers: 7
- Routes: 7
- Middleware: 4
- Services: 2
- Utils: 3
- Documentation: 6
- Config files: 5

### Lines of Code: ~5,500+
- Models: ~1,200 lines
- Controllers: ~2,500 lines
- Routes: ~400 lines
- Middleware: ~300 lines
- Services: ~600 lines
- Utils: ~400 lines

### API Endpoints: 50+
- Auth: 8 endpoints
- Subjects: 7 endpoints
- Notes: 9 endpoints
- Assignments: 7 endpoints
- Timetable: 4 endpoints
- Progress: 6 endpoints
- Announcements: 7 endpoints

---

## 🎯 Key Files Explained

### 🚀 Entry Point
**server.js** (60 lines)
- Initializes Express app
- Connects to MongoDB
- Sets up middleware
- Registers all routes
- Starts server on port 5000

### 💾 Database Config
**src/config/database.js** (30 lines)
- MongoDB connection
- Error handling
- Connection event listeners
- Graceful shutdown

### ☁️ File Storage Config
**src/config/cloudinary.js** (60 lines)
- Cloudinary setup
- Upload function
- Delete function
- File handling utilities

---

## ⭐ Core Feature Files

### 📝 Notes System (Most Important)
**src/models/Note.js** (200+ lines)
- Comprehensive note schema
- File info, tags, ratings
- Version control
- Duplicate detection
- Indexes for performance

**src/controllers/noteController.js** (400+ lines)
- Create, read, update, delete notes
- File upload handling
- Search functionality
- Exam mode
- Rating system
- Version management

**src/services/searchService.js** (250+ lines)
- Advanced search
- Exam mode filtering
- Related notes
- PYQ search
- Autocomplete

---

## 🔐 Security Files

### Authentication
**src/middleware/auth.js** (80 lines)
- JWT token verification
- User authentication
- Token generation

**src/middleware/roleCheck.js** (100 lines)
- Admin checks
- Teacher checks
- Ownership validation
- Class-based access

---

## 🛠️ Utility Files

### Helpers
**src/utils/helpers.js** (250+ lines)
- File operations (hash, validate, format)
- Pagination utilities
- Date/time helpers
- Search sanitization
- Filter building

### API Classes
**src/utils/ApiError.js** (50 lines)
- Custom error class
- Static error methods
- Status code handling

**src/utils/ApiResponse.js** (40 lines)
- Standard response format
- Success responses
- Created responses

---

## 📚 Documentation Files

### User Guides
**README.md** (300+ lines)
- Project overview
- Features list
- Installation guide
- API endpoints
- Project structure

**QUICK_START.md** (450+ lines)
- Step-by-step setup
- Configuration guide
- Testing instructions
- Common issues
- Deployment guide

### Reference
**API_DOCUMENTATION.md** (800+ lines)
- All 50+ endpoints
- Request/response examples
- Authentication guide
- Error codes
- Testing examples

**SETUP_SUMMARY.md** (600+ lines)
- Complete feature list
- Implementation details
- Architecture overview
- Testing checklist

**FEATURES.md** (500+ lines)
- Feature highlights
- USPs
- Problem solutions
- Innovation points

---

## 🔄 Data Flow

```
Client Request
      ↓
server.js (Entry)
      ↓
Routes (URL matching)
      ↓
Middleware (Auth, Validation)
      ↓
Controllers (Business Logic)
      ↓
Services (Complex Operations)
      ↓
Models (Database)
      ↓
Database (MongoDB)
      ↓
Response (via ApiResponse)
      ↓
Client
```

---

## 🎨 Code Organization

### By Feature:
Each feature (Notes, Assignments, etc.) has:
- ✅ Model (Schema definition)
- ✅ Controller (Business logic)
- ✅ Routes (API endpoints)
- ✅ Middleware (Validation, Auth)

### By Layer:
- **Presentation**: Routes
- **Business Logic**: Controllers, Services
- **Data Access**: Models
- **Cross-cutting**: Middleware, Utils

---

## 🚀 Quick Navigation Guide

**Need to add a new feature?**
1. Create model in `src/models/`
2. Create controller in `src/controllers/`
3. Create routes in `src/routes/`
4. Register routes in `server.js`

**Need to modify authentication?**
→ `src/middleware/auth.js`

**Need to change file upload logic?**
→ `src/services/fileService.js`

**Need to adjust search?**
→ `src/services/searchService.js`

**Need to update database connection?**
→ `src/config/database.js`

**Need to add utilities?**
→ `src/utils/helpers.js`

**Need API documentation?**
→ `API_DOCUMENTATION.md`

---

## 📦 Dependencies Breakdown

### Production (10 packages)
```json
{
  "express": "Web framework",
  "mongoose": "MongoDB ODM",
  "bcryptjs": "Password hashing",
  "jsonwebtoken": "JWT auth",
  "dotenv": "Environment variables",
  "cors": "CORS support",
  "morgan": "Logging",
  "express-fileupload": "File uploads",
  "express-validator": "Validation",
  "cloudinary": "File storage"
}
```

### Development (1 package)
```json
{
  "nodemon": "Auto-restart server"
}
```

---

## 🎯 File Importance Rating

### Critical (★★★★★)
- server.js
- src/models/Note.js
- src/controllers/noteController.js
- src/middleware/auth.js
- src/config/database.js

### Very Important (★★★★)
- All other models
- All other controllers
- src/services/fileService.js
- src/services/searchService.js

### Important (★★★)
- All routes
- All middleware
- All utilities

### Supporting (★★)
- Configuration files
- Documentation files

---

## 🔍 Finding Specific Code

**Authentication logic?**
→ `src/controllers/authController.js`
→ `src/middleware/auth.js`

**File upload logic?**
→ `src/services/fileService.js`
→ `src/middleware/fileUpload.js`

**Search functionality?**
→ `src/services/searchService.js`
→ `src/controllers/noteController.js` (searchNotes)

**Error handling?**
→ `src/middleware/errorHandler.js`
→ `src/utils/ApiError.js`

**Database schemas?**
→ `src/models/` directory

**API endpoints?**
→ `src/routes/` directory

**Helper functions?**
→ `src/utils/helpers.js`

---

## 🎉 Summary

This is a **professionally structured** backend project with:
✅ Clear separation of concerns
✅ Modular architecture
✅ Comprehensive documentation
✅ Production-ready code
✅ Easy to navigate
✅ Easy to extend
✅ Well-organized files

**Total Project Size**: ~5,500+ lines of production-quality code
**Documentation**: ~3,000+ lines of guides and references

**Every file has a clear purpose and proper documentation.** 🚀
