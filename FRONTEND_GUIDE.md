# EduTrack - Frontend Development Guide

## 🎯 Backend Status: READY ✅

**Backend is 100% complete and tested. All 21/21 tests passing.**

---

## 📋 What You Have Available

### API Base URL
```
http://localhost:5000/api
```

### Test Accounts
```javascript
// Admin
{
  email: "admin@edutrack.com",
  password: "admin123456"
}

// Teacher
{
  email: "teacher@edutrack.com",
  password: "teacher123"
}

// Student
{
  email: "student@edutrack.com",
  password: "student123"
}
```

---

## 🚀 Recommended Frontend Tech Stack

### Option 1: React + Vite (Recommended)
- **Fast:** Lightning-fast development with HMR
- **Modern:** Latest React features
- **Simple:** Easy setup and configuration

### Option 2: Next.js
- **Full-stack:** Built-in API routes (though not needed)
- **SEO-friendly:** Server-side rendering
- **Production-ready:** Optimization out of the box

### Option 3: Vue 3 + Vite
- **Progressive:** Easy to learn
- **Flexible:** Component-based
- **Performant:** Reactive system

---

## 📦 Recommended Frontend Libraries

### Core
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "axios": "^1.6.2"
}
```

### UI Framework (Choose One)
```json
{
  "tailwindcss": "^3.4.0",          // Utility-first CSS
  "@mui/material": "^5.15.0",        // Material UI
  "antd": "^5.12.0",                 // Ant Design
  "chakra-ui": "^2.8.0"              // Chakra UI
}
```

### State Management
```json
{
  "zustand": "^4.4.7",               // Simple & lightweight
  "@tanstack/react-query": "^5.14.0" // Data fetching & caching
}
```

### Forms & Validation
```json
{
  "react-hook-form": "^7.49.0",
  "zod": "^3.22.4"
}
```

### Additional Utilities
```json
{
  "date-fns": "^3.0.0",              // Date formatting
  "react-icons": "^4.12.0",          // Icon library
  "react-hot-toast": "^2.4.1",       // Notifications
  "framer-motion": "^10.16.0"        // Animations
}
```

---

## 🏗️ Recommended Project Structure

```
frontend/
├── public/
│   └── assets/
├── src/
│   ├── api/
│   │   ├── axios.js           # Axios instance with auth
│   │   ├── auth.js            # Auth API calls
│   │   ├── subjects.js        # Subject API calls
│   │   ├── assignments.js     # Assignment API calls
│   │   └── ...
│   ├── components/
│   │   ├── common/            # Reusable components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   └── Modal.jsx
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Footer.jsx
│   │   └── features/          # Feature-specific components
│   │       ├── auth/
│   │       ├── subjects/
│   │       ├── assignments/
│   │       └── ...
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Subjects.jsx
│   │   ├── Assignments.jsx
│   │   └── ...
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useSubjects.js
│   │   └── ...
│   ├── store/
│   │   ├── authStore.js
│   │   └── appStore.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── validators.js
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

---

## 🔐 Authentication Flow

### 1. Create Axios Instance with Interceptors

```javascript
// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;
```

### 2. Create Auth API Functions

```javascript
// src/api/auth.js
import api from './axios';

export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getProfile: async () => {
    return await api.get('/auth/profile');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};
```

### 3. Create Auth Context/Store

```javascript
// src/store/authStore.js (using Zustand)
import { create } from 'zustand';
import { authAPI } from '../api/auth';

export const useAuthStore = create((set) => ({
  user: authAPI.getCurrentUser(),
  isAuthenticated: authAPI.isAuthenticated(),
  loading: false,

  login: async (credentials) => {
    set({ loading: true });
    try {
      const response = await authAPI.login(credentials);
      set({ 
        user: response.data.user, 
        isAuthenticated: true,
        loading: false 
      });
      return response;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: () => {
    authAPI.logout();
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (userData) => {
    set({ user: userData });
    localStorage.setItem('user', JSON.stringify(userData));
  }
}));
```

### 4. Protected Route Component

```javascript
// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
```

---

## 📱 Key Pages to Build

### 1. Authentication Pages
- ✅ Login page
- ✅ Register page (with role selection)
- ✅ Forgot password (optional)

### 2. Dashboard
- ✅ Student dashboard (upcoming assignments, progress overview)
- ✅ Teacher dashboard (recent submissions, class overview)
- ✅ Admin dashboard (system statistics)

### 3. Subject Management
- ✅ Subjects list
- ✅ Subject details with units
- ✅ Create/Edit subject (Admin only)

### 4. Assignment Pages
- ✅ Assignment list
- ✅ Assignment details
- ✅ Create assignment (Teacher)
- ✅ Submit assignment (Student)
- ✅ Grade submissions (Teacher)

### 5. Notes System
- ✅ Notes library
- ✅ Upload notes
- ✅ Search notes
- ✅ View/Download notes

### 6. Timetable
- ✅ Weekly timetable view
- ✅ Create/Edit schedule

### 7. Progress Tracking
- ✅ Progress overview
- ✅ Subject-wise progress
- ✅ Mark topics complete

### 8. Announcements
- ✅ Announcements feed
- ✅ Create announcement (Teacher/Admin)
- ✅ View announcement details

---

## 🎨 UI/UX Recommendations

### Color Scheme
```css
:root {
  --primary: #3b82f6;      /* Blue */
  --secondary: #8b5cf6;    /* Purple */
  --success: #10b981;      /* Green */
  --warning: #f59e0b;      /* Orange */
  --danger: #ef4444;       /* Red */
  --dark: #1f2937;         /* Dark Gray */
  --light: #f3f4f6;        /* Light Gray */
}
```

### Responsive Breakpoints
```css
/* Mobile First */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
```

### Key Features
- 📱 Mobile-responsive design
- 🌓 Dark mode support (optional)
- 🔔 Real-time notifications
- 📊 Charts and statistics
- 🔍 Advanced search and filters
- ⚡ Optimistic UI updates
- 💾 Offline support (optional)

---

## 🔧 API Integration Examples

### Fetch Subjects
```javascript
// src/api/subjects.js
import api from './axios';

export const subjectsAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/subjects?${params}`);
  },

  getById: async (id) => {
    return await api.get(`/subjects/${id}`);
  },

  create: async (data) => {
    return await api.post('/subjects', data);
  },

  update: async (id, data) => {
    return await api.put(`/subjects/${id}`, data);
  },

  delete: async (id) => {
    return await api.delete(`/subjects/${id}`);
  },

  getUnits: async (subjectId) => {
    return await api.get(`/subjects/${subjectId}/units`);
  }
};
```

### Using React Query
```javascript
// src/hooks/useSubjects.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subjectsAPI } from '../api/subjects';

export const useSubjects = (filters) => {
  return useQuery({
    queryKey: ['subjects', filters],
    queryFn: () => subjectsAPI.getAll(filters)
  });
};

export const useCreateSubject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: subjectsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['subjects']);
    }
  });
};
```

### Usage in Component
```javascript
// src/pages/Subjects.jsx
import { useSubjects, useCreateSubject } from '../hooks/useSubjects';

export const Subjects = () => {
  const { data, isLoading, error } = useSubjects();
  const createMutation = useCreateSubject();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Subjects</h1>
      {data?.data?.map(subject => (
        <div key={subject._id}>
          {subject.name} - {subject.code}
        </div>
      ))}
    </div>
  );
};
```

---

## 🚀 Quick Start Commands

### Create React + Vite Project
```bash
npm create vite@latest edutrack-frontend -- --template react
cd edutrack-frontend
npm install
```

### Install Dependencies
```bash
npm install react-router-dom axios zustand @tanstack/react-query
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Start Development Server
```bash
npm run dev
```

---

## ✅ Development Checklist

### Phase 1: Setup (Day 1)
- [ ] Create frontend project
- [ ] Install dependencies
- [ ] Setup routing
- [ ] Configure axios
- [ ] Create auth store
- [ ] Build layout components

### Phase 2: Authentication (Day 2)
- [ ] Login page
- [ ] Register page
- [ ] Protected routes
- [ ] Auth context/store
- [ ] Token management

### Phase 3: Core Features (Day 3-5)
- [ ] Dashboard
- [ ] Subjects page
- [ ] Assignments page
- [ ] Timetable page
- [ ] Progress tracking

### Phase 4: Advanced Features (Day 6-7)
- [ ] Notes system
- [ ] Announcements
- [ ] Search functionality
- [ ] File uploads
- [ ] Notifications

### Phase 5: Polish (Day 8-9)
- [ ] Responsive design
- [ ] Error handling
- [ ] Loading states
- [ ] Form validation
- [ ] UI animations

### Phase 6: Testing (Day 10)
- [ ] Test all user flows
- [ ] Fix bugs
- [ ] Optimize performance
- [ ] Final polish

---

## 📚 Helpful Resources

### Documentation
- React: https://react.dev/
- Vite: https://vitejs.dev/
- TailwindCSS: https://tailwindcss.com/
- React Query: https://tanstack.com/query/latest
- Zustand: https://github.com/pmndrs/zustand

### Learning
- React Router Tutorial
- Axios Interceptors Guide
- JWT Authentication Best Practices
- React Query Patterns

---

## 💡 Pro Tips

1. **Start Simple:** Build basic functionality first, polish later
2. **Reusable Components:** Create common components early
3. **Error Handling:** Handle errors gracefully with toast notifications
4. **Loading States:** Show loading indicators for better UX
5. **Type Safety:** Consider using TypeScript for larger projects
6. **Code Organization:** Keep related code together
7. **Git Commits:** Commit often with meaningful messages
8. **Test Early:** Test as you build, not at the end

---

## 🎯 Success Criteria

Your frontend is ready when:
- ✅ Users can register and login
- ✅ Students can view subjects and assignments
- ✅ Teachers can create and grade assignments
- ✅ Admin can manage users and subjects
- ✅ Progress tracking works
- ✅ Timetable is functional
- ✅ Announcements display correctly
- ✅ UI is responsive and intuitive
- ✅ No critical bugs
- ✅ Performance is acceptable

---

**Backend: READY ✅**  
**Frontend: LET'S BUILD! 🚀**

Good luck with your frontend development! The backend is solid and ready to support whatever you build. 💪
