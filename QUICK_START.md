# EduTrack Backend - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for file uploads)

### 1. Installation

```bash
# Install dependencies
npm install
```

### 2. Configuration

Create `.env` file in the root directory (or copy from `.env.example`):

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/edutrack
# OR use MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edutrack

# JWT Secret (Change this!)
JWT_SECRET=edutrack_super_secret_jwt_key_2024_change_in_production
JWT_EXPIRE=7d

# Cloudinary (Get from cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# File Upload
MAX_FILE_SIZE=10485760

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 3. Setup Cloudinary

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Go to Dashboard
4. Copy your Cloud Name, API Key, and API Secret
5. Update the `.env` file with these credentials

### 4. Setup MongoDB

**Option A: Local MongoDB**
```bash
# Make sure MongoDB is running on localhost:27017
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Replace `MONGODB_URI` in `.env` with your connection string

### 5. Run the Application

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

---

## 📋 Testing the API

### Method 1: Using Postman

1. Download [Postman](https://www.postman.com/downloads/)
2. Import the API endpoints from `API_DOCUMENTATION.md`
3. Set base URL: `http://localhost:5000/api`

### Method 2: Using cURL

**Register a user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@edutrack.com",
    "password": "admin123",
    "role": "admin"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@edutrack.com",
    "password": "admin123"
  }'
```

Save the token from response!

**Get Current User:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🎯 Quick Setup Workflow

### Step 1: Create Admin Account
```bash
POST /api/auth/register
{
  "name": "Admin",
  "email": "admin@edutrack.com",
  "password": "admin123",
  "role": "admin"
}
```

### Step 2: Login and Get Token
```bash
POST /api/auth/login
{
  "email": "admin@edutrack.com",
  "password": "admin123"
}
```
Save the token!

### Step 3: Create a Subject
```bash
POST /api/subjects
Headers: Authorization: Bearer <token>
{
  "name": "Data Structures",
  "code": "CS301",
  "branch": "CSE",
  "semester": 3,
  "credits": 4,
  "description": "Introduction to data structures"
}
```

### Step 4: Create Units for Subject
```bash
POST /api/subjects/<subject_id>/units
Headers: Authorization: Bearer <token>
{
  "unitNumber": 1,
  "name": "Arrays",
  "description": "Introduction to arrays",
  "topics": [
    {
      "name": "Array Basics",
      "isImportant": true
    }
  ]
}
```

### Step 5: Create Teacher Account
```bash
POST /api/auth/register
{
  "name": "Teacher",
  "email": "teacher@edutrack.com",
  "password": "teacher123",
  "role": "teacher"
}
```

### Step 6: Upload Notes (as Teacher)
```bash
POST /api/notes
Headers: Authorization: Bearer <teacher_token>
Form Data:
  file: <upload PDF>
  title: "Arrays Lecture Notes"
  subject: <subject_id>
  unit: <unit_id>
  tags: "arrays,important"
  isImportant: true
```

### Step 7: Create Student Account
```bash
POST /api/auth/register
{
  "name": "John Doe",
  "email": "student@edutrack.com",
  "password": "student123",
  "role": "student",
  "branch": "CSE",
  "semester": 3,
  "section": "A",
  "enrollmentNumber": "2021CSE001"
}
```

### Step 8: View Notes (as Student)
```bash
GET /api/notes
Headers: Authorization: Bearer <student_token>
```

---

## 🔍 Common Issues

### Issue: MongoDB Connection Error
**Solution:** 
- Check if MongoDB is running: `mongod`
- Verify `MONGODB_URI` in `.env`
- For Atlas, check network access and whitelist IP

### Issue: File Upload Fails
**Solution:**
- Verify Cloudinary credentials in `.env`
- Check file size (max 10MB by default)
- Ensure temp directory exists

### Issue: Token Expired
**Solution:**
- Login again to get a new token
- Token expires after 7 days (configurable in `.env`)

### Issue: CORS Error
**Solution:**
- Add your frontend URL to `ALLOWED_ORIGINS` in `.env`

---

## 📂 Project Structure

```
edutrack-backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── cloudinary.js        # Cloudinary setup
│   ├── models/                  # Mongoose schemas
│   │   ├── User.js
│   │   ├── Subject.js
│   │   ├── Unit.js
│   │   ├── Note.js
│   │   ├── Assignment.js
│   │   ├── Timetable.js
│   │   ├── Progress.js
│   │   └── Announcement.js
│   ├── controllers/             # Business logic
│   ├── routes/                  # API routes
│   ├── middleware/              # Auth, validation, errors
│   ├── services/                # File & search services
│   ├── utils/                   # Helper functions
│   └── validators/              # Input validation
├── .env                         # Environment variables
├── .env.example                 # Example env file
├── .gitignore
├── package.json
├── server.js                    # Entry point
├── README.md
└── API_DOCUMENTATION.md
```

---

## 🛠️ Development Scripts

```bash
# Start development server (auto-restart)
npm run dev

# Start production server
npm start

# Run tests (when implemented)
npm test
```

---

## 🔐 Security Best Practices

1. **Change JWT_SECRET** in production
2. **Use strong passwords** for database
3. **Enable HTTPS** in production
4. **Whitelist only required IPs** for database
5. **Use environment variables** for all secrets
6. **Never commit .env** file to git

---

## 📊 Database Collections

The system creates these collections:
- `users` - User accounts
- `subjects` - Subjects/Courses
- `units` - Course units/modules
- `notes` - Study notes with files
- `assignments` - Assignments and submissions
- `timetables` - Class schedules
- `progresses` - Student progress tracking
- `announcements` - System announcements

---

## 🎓 Role-Based Access

### Admin
- Full access to everything
- Manage subjects, users, and content
- View all statistics

### Teacher
- Create and manage notes
- Create and grade assignments
- Post announcements
- View assigned classes

### Student
- View and download notes
- Submit assignments
- Track progress
- View timetable and announcements

---

## 📱 API Testing Checklist

- [ ] Register admin user
- [ ] Login and get JWT token
- [ ] Create subject
- [ ] Create units for subject
- [ ] Register teacher user
- [ ] Teacher uploads notes
- [ ] Register student user
- [ ] Student views notes
- [ ] Student rates notes
- [ ] Teacher creates assignment
- [ ] Student submits assignment
- [ ] Teacher grades submission
- [ ] Student marks topic complete
- [ ] Student checks progress
- [ ] Admin posts announcement

---

## 🚀 Deployment

### Deploy to Heroku

```bash
heroku create edutrack-backend
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
# Set other env variables
git push heroku main
```

### Deploy to Railway

1. Connect GitHub repo
2. Add environment variables
3. Deploy automatically

### Deploy to Render

1. Connect repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables

---

## 📞 Support

For issues or questions:
1. Check `API_DOCUMENTATION.md`
2. Review error messages carefully
3. Check MongoDB and Cloudinary connections
4. Verify authentication tokens

---

## ⭐ Next Steps

1. ✅ Set up the backend
2. 🎨 Build the frontend (React/Vue/Angular)
3. 🔗 Connect frontend to backend
4. 🚀 Deploy to production
5. 📱 Create mobile app (optional)

Happy coding! 🎉
