# EduTrack Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication using JWT Bearer token:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📝 Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "branch": "CSE",
  "semester": 3,
  "section": "A",
  "enrollmentNumber": "2021CSE001"
}
```

### Login
```http
POST /auth/login
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Current User
```http
GET /auth/me
Headers: Authorization: Bearer <token>
```

### Update Profile
```http
PUT /auth/update-profile
Headers: Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "John Updated",
  "semester": 4
}
```

### Change Password
```http
PUT /auth/change-password
Headers: Authorization: Bearer <token>
```

**Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```

---

## 📚 Subject Endpoints

### Get All Subjects
```http
GET /subjects?branch=CSE&semester=3&page=1&limit=20
Headers: Authorization: Bearer <token>
```

### Get Subject by ID
```http
GET /subjects/:id
Headers: Authorization: Bearer <token>
```

### Create Subject (Admin)
```http
POST /subjects
Headers: Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Data Structures",
  "code": "CS301",
  "branch": "CSE",
  "semester": 3,
  "credits": 4,
  "description": "Introduction to data structures and algorithms"
}
```

### Create Unit for Subject (Teacher/Admin)
```http
POST /subjects/:subjectId/units
Headers: Authorization: Bearer <token>
```

**Body:**
```json
{
  "unitNumber": 1,
  "name": "Introduction to Arrays",
  "description": "Basic concepts of arrays",
  "topics": [
    {
      "name": "Array Declaration",
      "description": "How to declare arrays",
      "isImportant": true
    }
  ],
  "duration": "2 weeks"
}
```

---

## 📄 Notes Endpoints

### Get All Notes
```http
GET /notes?subject=<id>&isImportant=true&page=1&limit=20
Headers: Authorization: Bearer <token>
```

**Query Parameters:**
- `subject` - Subject ID
- `unit` - Unit ID
- `tags` - Comma-separated tags
- `branch` - Branch (CSE, ECE, etc.)
- `semester` - Semester number
- `isImportant` - true/false
- `isExamFocused` - true/false
- `isPYQ` - true/false
- `minRating` - Minimum rating (1-5)
- `page` - Page number
- `limit` - Items per page
- `sortBy` - Sort field (createdAt, averageRating, etc.)
- `sortOrder` - asc/desc

### Search Notes
```http
GET /notes/search?query=array&subject=<id>
Headers: Authorization: Bearer <token>
```

### Get Exam Mode Notes
```http
GET /notes/exam-mode?subject=<id>&unit=<id>
Headers: Authorization: Bearer <token>
```

### Get Single Note
```http
GET /notes/:id
Headers: Authorization: Bearer <token>
```

### Create Note (Teacher/Admin)
```http
POST /notes
Headers: 
  Authorization: Bearer <token>
  Content-Type: multipart/form-data
```

**Form Data:**
```
file: <PDF or Image file>
title: "Arrays Lecture Notes"
description: "Complete notes on arrays"
subject: <subject_id>
unit: <unit_id>
topic: "Arrays"
tags: "arrays,data-structures,important"
isImportant: true
isExamFocused: true
hasFormulas: false
hasDiagrams: true
isPYQ: false
visibility: "class"
```

### Update Note (Teacher/Admin/Owner)
```http
PUT /notes/:id
Headers: Authorization: Bearer <token>
```

**Body (form-data if updating file):**
```json
{
  "title": "Updated Title",
  "tags": "updated,tags",
  "isImportant": true
}
```

### Delete Note (Soft Delete)
```http
DELETE /notes/:id
Headers: Authorization: Bearer <token>
```

### Rate Note
```http
POST /notes/:id/rate
Headers: Authorization: Bearer <token>
```

**Body:**
```json
{
  "rating": 5,
  "review": "Excellent notes!"
}
```

### Track Download
```http
POST /notes/:id/download
Headers: Authorization: Bearer <token>
```

### Get Related Notes
```http
GET /notes/:id/related
Headers: Authorization: Bearer <token>
```

---

## 📝 Assignment Endpoints

### Get All Assignments
```http
GET /assignments?subject=<id>&page=1&limit=20
Headers: Authorization: Bearer <token>
```

### Get Pending Assignments (Student)
```http
GET /assignments/pending
Headers: Authorization: Bearer <token>
```

### Get Assignment by ID
```http
GET /assignments/:id
Headers: Authorization: Bearer <token>
```

### Create Assignment (Teacher/Admin)
```http
POST /assignments
Headers: 
  Authorization: Bearer <token>
  Content-Type: multipart/form-data
```

**Form Data:**
```
title: "Array Implementation Assignment"
description: "Implement various array operations"
subject: <subject_id>
unit: <unit_id>
branch: "CSE"
semester: 3
sections: ["A", "B"]
dueDate: "2024-12-31T23:59:59.000Z"
maxMarks: 100
allowLateSubmission: false
files: <optional attachment files>
```

### Submit Assignment (Student)
```http
POST /assignments/:id/submit
Headers: 
  Authorization: Bearer <token>
  Content-Type: multipart/form-data
```

**Form Data:**
```
files: <submission files>
remarks: "Assignment completed as per requirements"
```

### Grade Submission (Teacher/Admin)
```http
PUT /assignments/:assignmentId/submissions/:submissionId/grade
Headers: Authorization: Bearer <token>
```

**Body:**
```json
{
  "marksObtained": 85,
  "feedback": "Good work! Improve error handling.",
  "status": "graded"
}
```

---

## 🗓️ Timetable Endpoints

### Get Timetable
```http
GET /timetable?dayOfWeek=monday
Headers: Authorization: Bearer <token>
```

### Create Timetable Entry
```http
POST /timetable
Headers: Authorization: Bearer <token>
```

**Body:**
```json
{
  "type": "personal",
  "dayOfWeek": "monday",
  "startTime": "09:00",
  "endTime": "10:00",
  "subject": "<subject_id>",
  "classType": "lecture",
  "room": "CS-101",
  "teacher": "Dr. Smith",
  "notes": "Bring laptop",
  "onlineLink": "https://meet.google.com/xyz"
}
```

### Update Timetable Entry
```http
PUT /timetable/:id
Headers: Authorization: Bearer <token>
```

### Delete Timetable Entry
```http
DELETE /timetable/:id
Headers: Authorization: Bearer <token>
```

---

## 📊 Progress Tracking Endpoints

### Get Progress
```http
GET /progress?subject=<id>
Headers: Authorization: Bearer <token>
```

### Get Progress Statistics
```http
GET /progress/stats
Headers: Authorization: Bearer <token>
```

### Mark Topic Complete
```http
POST /progress/mark-complete
Headers: Authorization: Bearer <token>
```

**Body:**
```json
{
  "subject": "<subject_id>",
  "unit": "<unit_id>",
  "topicName": "Array Declaration",
  "confidenceLevel": 4,
  "userNotes": "Understood well",
  "timeSpent": 30
}
```

### Update Topic Status
```http
PUT /progress/:progressId/topic
Headers: Authorization: Bearer <token>
```

**Body:**
```json
{
  "topicName": "Array Declaration",
  "status": "completed",
  "confidenceLevel": 5
}
```

### Mark Ready for Exam
```http
PUT /progress/:progressId/ready-for-exam
Headers: Authorization: Bearer <token>
```

### Record Revision
```http
POST /progress/:progressId/revision
Headers: Authorization: Bearer <token>
```

---

## 📢 Announcement Endpoints

### Get All Announcements
```http
GET /announcements?type=exam&priority=high&page=1&limit=20
Headers: Authorization: Bearer <token>
```

### Get Announcement by ID
```http
GET /announcements/:id
Headers: Authorization: Bearer <token>
```

### Create Announcement (Teacher/Admin)
```http
POST /announcements
Headers: Authorization: Bearer <token>
```

**Body:**
```json
{
  "title": "Mid-Term Exam Schedule",
  "message": "Mid-term exams will be held from...",
  "type": "exam",
  "priority": "high",
  "targetAudience": "specific-class",
  "branch": "CSE",
  "semester": 3,
  "sections": ["A", "B"],
  "expiresAt": "2024-12-31T23:59:59.000Z",
  "isPinned": true
}
```

### Update Announcement
```http
PUT /announcements/:id
Headers: Authorization: Bearer <token>
```

### Delete Announcement
```http
DELETE /announcements/:id
Headers: Authorization: Bearer <token>
```

### Mark as Read
```http
POST /announcements/:id/read
Headers: Authorization: Bearer <token>
```

---

## 👥 Admin User Management

### Get All Users (Admin)
```http
GET /auth/users?role=student&branch=CSE&semester=3&page=1&limit=20
Headers: Authorization: Bearer <token>
```

### Update User Role (Admin)
```http
PUT /auth/users/:userId/role
Headers: Authorization: Bearer <token>
```

**Body:**
```json
{
  "role": "teacher"
}
```

### Deactivate User (Admin)
```http
PUT /auth/users/:userId/deactivate
Headers: Authorization: Bearer <token>
```

### Activate User (Admin)
```http
PUT /auth/users/:userId/activate
Headers: Authorization: Bearer <token>
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "stack": "Error stack trace (development only)"
}
```

---

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Internal Server Error

---

## User Roles

- **student** - Can view notes, submit assignments, track progress
- **teacher** - Can create notes, assignments, grade submissions
- **admin** - Full access to all features

---

## File Upload

Supported file formats for notes:
- PDF (.pdf)
- Images (.jpg, .jpeg, .png)
- Documents (.doc, .docx)

Maximum file size: 10MB (configurable in .env)

---

## Testing Tips

1. **First, register an admin user** to manage subjects and units
2. **Create subjects and units** before adding notes
3. **Use the exam-mode endpoint** for filtered important notes
4. **Track downloads and views** automatically when accessing notes
5. **Use search with filters** for better results

---

## Example Workflow

1. Register as admin → Create subjects → Add units
2. Register as teacher → Upload notes with proper tags
3. Register as student → View notes → Rate notes → Track progress
4. Teacher creates assignments → Student submits → Teacher grades
5. Student marks topics complete → Checks progress stats
6. Admin posts announcements → Students read announcements
