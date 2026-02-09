import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Auth
import AuthPage from '../pages/Auth';

// Student Pages
import StudentDashboard from '../pages/student/Dashboard';
import NotesPage from '../pages/student/Notes';
import NotesDetail from '../pages/student/NotesDetail';
import AssignmentsPage from '../pages/student/Assignments';
import TimetablePage from '../pages/student/Timetable';
import ProgressPage from '../pages/student/Progress';
import ExamMode from '../pages/student/ExamMode';
import AIInsights from '../pages/student/AIInsights';

// Shared
import ProfilePage from '../pages/Profile';
import NotFound from '../pages/NotFound';

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<AuthPage />} />

      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" />} />

      {/* Protected Student Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
      <Route path="/notes" element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
      <Route path="/notes/:id" element={<ProtectedRoute><NotesDetail /></ProtectedRoute>} />
      <Route path="/assignments" element={<ProtectedRoute><AssignmentsPage /></ProtectedRoute>} />
      <Route path="/timetable" element={<ProtectedRoute><TimetablePage /></ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
      <Route path="/exam-mode" element={<ProtectedRoute><ExamMode /></ProtectedRoute>} />
      <Route path="/ai-insights" element={<ProtectedRoute><AIInsights /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
