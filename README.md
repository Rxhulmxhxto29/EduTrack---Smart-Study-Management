# 📚 EduTrack - Smart Study Management Platform

<div align="center">

![EduTrack Banner](https://img.shields.io/badge/EduTrack-Smart%20Study%20Platform-4F46E5?style=for-the-badge&logo=bookstack&logoColor=white)

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.21-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

**A comprehensive, AI-powered study management platform designed for students to organize notes, track progress, manage assignments, and optimize their learning journey.**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Tech Stack](#-tech-stack) • [API Documentation](#-api-documentation)

### 🎥 Live Demo
Check out the project showcase and walkthrough on LinkedIn:
👉 [View Live Demo](https://www.linkedin.com/posts/rahul-mahato-0b1534254_webdevelopment-fullstack-javascript-activity-7426733289874407424-5Vqo)

</div>

---

## 🌟 Overview

EduTrack is a modern, full-stack web application that revolutionizes how students manage their academic life. Built with React and Node.js, it offers an intuitive interface with powerful features including AI-powered smart search, exam mode for distraction-free studying, progress tracking with visual analytics, and real-time notifications.

### Why EduTrack?

- 🎯 **All-in-One Solution**: Notes, assignments, timetable, and progress tracking in one place
- 🤖 **AI-Powered**: Smart search with natural language processing and intelligent recommendations
- 📊 **Visual Analytics**: Track your learning progress with beautiful charts and insights
- 🌙 **Dark Mode**: Easy on the eyes with full dark/light theme support
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- ⚡ **Lightning Fast**: Built with Vite for optimal performance

---

## ✨ Features

### 📝 Notes Management
- **Create & Organize**: Rich text notes with subject and unit categorization
- **AI Smart Search**: Natural language search with intelligent suggestions
- **Favorites & Bookmarks**: Quick access to important notes
- **File Attachments**: Support for PDFs, images, and documents (optional - requires Cloudinary setup)
- **Duplicate Detection**: Automatic detection of similar content

### 📋 Assignment Tracking
- **Due Date Management**: Never miss a deadline with visual reminders
- **Status Tracking**: Pending, In Progress, Submitted, Graded
- **Submission System**: Upload and track assignment submissions
- **Grade Recording**: View grades and feedback from teachers

### 📅 Timetable Management
- **Weekly Schedule**: Visual weekly timetable view
- **Class Management**: Add, edit, and delete class schedules
- **Time Slot Organization**: Organized by day and time
- **Quick Overview**: At-a-glance view of daily schedule

### 📈 Progress Tracking
- **Subject-wise Progress**: Track completion by subject and unit
- **Confidence Levels**: Mark topics with confidence ratings (Low/Medium/High)
- **Visual Charts**: Beautiful progress visualization with charts
- **Study Streaks**: Track your consistency with streak counters

### 🎯 Exam Mode
- **Distraction-Free**: Focused study environment
- **Timer**: Built-in study timer with break reminders
- **Quick Notes**: Jot down notes without leaving exam mode
- **Progress Tracking**: Track study sessions and productivity

### 🤖 AI Insights
- **Study Recommendations**: AI-powered study suggestions
- **Performance Analysis**: Identify strengths and weaknesses
- **Smart Scheduling**: Optimal study time recommendations
- **Learning Patterns**: Analyze your learning habits

### 🔔 Notifications
- **Real-time Alerts**: Assignment deadlines, announcements
- **Categorized**: Different notification types with icons
- **Mark as Read**: Track which notifications you've seen
- **Quick Actions**: Direct links to relevant content

### 🛠️ Additional Features
- **Scientific Calculator**: Built-in calculator in header
- **Quick Notepad**: Jot down quick notes anytime
- **Real-time Clock**: Live clock with date display
- **Collapsible Sidebar**: More screen space when needed
- **Theme Toggle**: Dark/Light mode with system preference support

---

## 🖼️ Screenshots

<details>
<summary>Click to view screenshots</summary>

### Dashboard
The main dashboard provides an overview of your academic progress, upcoming deadlines, and quick access to all features.

### Notes Page
Organize and search through your notes with AI-powered smart search and filtering options.

### Progress Tracking
Visual charts and analytics to track your learning progress across subjects.

### Exam Mode
Distraction-free study environment with timer and focused note access.

</details>

---

## 🚀 Demo

**Live Demo**: Coming Soon

**Local Setup**: Follow the installation instructions below to run locally.

---

## 💻 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18.3.1 | UI Framework |
| Vite 5.4.21 | Build Tool & Dev Server |
| TailwindCSS | Styling |
| React Router v6 | Navigation |
| Recharts | Data Visualization |
| Lucide React | Icons |
| Axios | HTTP Client |
| date-fns | Date Formatting |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime Environment |
| Express.js | Web Framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| Bcrypt | Password Hashing |
| Cloudinary | File Storage (Optional) |
| mongodb-memory-server | In-Memory DB (Dev) |

---

## 🚀 Deployment

Zero-cost deployment is fully supported! You can host the frontend on Vercel and backend on Render for free.

👉 **[Read the Full Deployment Guide](DEPLOYMENT_GUIDE.md)** for step-by-step instructions.

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rxhulmxhxto29/EduTrack---Smart-Study-Management.git
   cd EduTrack---Smart-Study-Management
   ```

2. **Install Backend Dependencies**
   ```bash
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   cd ..
   ```

4. **Configure Environment Variables**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key_here
   MONGODB_URI=mongodb://localhost:27017/edutrack
   
   # OPTIONAL: Only needed for file upload features (PDF/image attachments)
   # CLOUDINARY_CLOUD_NAME=your_cloud_name
   # CLOUDINARY_API_KEY=your_api_key
   # CLOUDINARY_API_SECRET=your_api_secret
   ```
   
   > **Note**: The app uses in-memory MongoDB by default for development. No database setup required!
   > 
   > **Note**: Cloudinary is optional and only needed for file uploads. All other features work without it!

5. **Start the Backend Server**
   ```bash
   node server.js
   ```
   Server runs at: `http://localhost:5000`

6. **Start the Frontend (New Terminal)**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs at: `http://localhost:3000`

7. **Open your browser**
   Navigate to `http://localhost:3000`

---

## 📁 Project Structure

```
EduTrack/
├── 📂 frontend/                    # React Frontend
│   ├── 📂 public/                  # Static assets
│   ├── 📂 src/
│   │   ├── 📂 components/          # Reusable components
│   │   │   ├── 📂 common/          # SmartSearch, etc.
│   │   │   └── 📂 layout/          # StudentLayout
│   │   ├── 📂 contexts/            # React Contexts
│   │   │   ├── AuthContext.jsx     # User state
│   │   │   ├── ThemeContext.jsx    # Theme management
│   │   │   └── ExamModeContext.jsx # Exam mode state
│   │   ├── 📂 pages/
│   │   │   └── 📂 student/         # Student pages
│   │   │       ├── Dashboard.jsx
│   │   │       ├── Notes.jsx
│   │   │       ├── Assignments.jsx
│   │   │       ├── Timetable.jsx
│   │   │       ├── Progress.jsx
│   │   │       ├── ExamMode.jsx
│   │   │       └── AIInsights.jsx
│   │   ├── 📂 routes/              # App routing
│   │   ├── 📂 services/            # API services
│   │   ├── App.jsx                 # Main App component
│   │   ├── main.jsx                # Entry point
│   │   └── index.css               # Global styles
│   ├── package.json
│   └── vite.config.js
│
├── 📂 src/                         # Backend Source
│   ├── 📂 config/
│   │   ├── database.js             # DB configuration
│   │   ├── memoryDatabase.js       # In-memory MongoDB
│   │   └── cloudinary.js           # Cloudinary config
│   ├── 📂 controllers/             # Route controllers
│   │   ├── noteController.js
│   │   ├── assignmentController.js
│   │   ├── progressController.js
│   │   ├── timetableController.js
│   │   ├── subjectController.js
│   │   └── announcementController.js
│   ├── 📂 models/                  # Mongoose models
│   │   ├── User.js
│   │   ├── Note.js
│   │   ├── Assignment.js
│   │   ├── Subject.js
│   │   ├── Unit.js
│   │   ├── Timetable.js
│   │   ├── Progress.js
│   │   └── Announcement.js
│   ├── 📂 routes/                  # API routes
│   ├── 📂 middleware/              # Express middleware
│   ├── 📂 services/                # Business logic
│   └── 📂 utils/                   # Utility functions
│
├── server.js                       # Backend entry point
├── package.json                    # Backend dependencies
├── .env                            # Environment variables
└── README.md                       # This file
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints Overview

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/health` | GET | Health check |
| `/api/notes` | GET, POST, PUT, DELETE | Notes management |
| `/api/subjects` | GET, POST, PUT, DELETE | Subjects & Units |
| `/api/assignments` | GET, POST, PUT | Assignments |
| `/api/timetable` | GET, POST, PUT, DELETE | Schedule management |
| `/api/progress` | GET, POST, PUT | Progress tracking |
| `/api/announcements` | GET, POST | Announcements |

### Example Requests

<details>
<summary>📝 Notes API</summary>

**Get All Notes**
```bash
GET /api/notes
```

**Create Note**
```bash
POST /api/notes
Content-Type: application/json

{
  "title": "Chapter 1 Notes",
  "content": "Introduction to the subject...",
  "subject": "Mathematics",
  "unit": "Algebra",
  "tags": ["important", "exam"]
}
```

**Search Notes**
```bash
GET /api/notes/search?q=algebra&subject=Mathematics
```

</details>

<details>
<summary>📋 Assignments API</summary>

**Get All Assignments**
```bash
GET /api/assignments
```

**Create Assignment**
```bash
POST /api/assignments
Content-Type: application/json

{
  "title": "Math Homework",
  "description": "Complete exercises 1-10",
  "subject": "Mathematics",
  "dueDate": "2026-02-15",
  "priority": "high"
}
```

</details>

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | 5000 |
| `NODE_ENV` | Environment mode | development |
| `JWT_SECRET` | JWT signing secret | - |
| `MONGODB_URI` | MongoDB connection string | In-memory |
| `CLOUDINARY_*` | Cloudinary credentials (Optional) | - |

### Frontend Configuration

Edit `frontend/vite.config.js` for:
- Proxy settings
- Port configuration
- Build options

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Rahul Mahato**

- GitHub: [@Rxhulmxhxto29](https://github.com/Rxhulmxhxto29)

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI Framework
- [Vite](https://vitejs.dev/) - Build Tool
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [Lucide Icons](https://lucide.dev/) - Beautiful Icons
- [MongoDB](https://www.mongodb.com/) - Database
- [Cloudinary](https://cloudinary.com/) - Media Storage (Optional)

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ by Rahul Mahato

</div>
