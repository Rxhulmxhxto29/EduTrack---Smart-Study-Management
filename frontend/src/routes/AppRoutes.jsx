import { Routes, Route, Navigate } from 'react-router-dom';

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
      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      
      {/* Student Routes */}
      <Route path="/dashboard" element={<StudentDashboard />} />
      <Route path="/notes" element={<NotesPage />} />
      <Route path="/notes/:id" element={<NotesDetail />} />
      <Route path="/assignments" element={<AssignmentsPage />} />
      <Route path="/timetable" element={<TimetablePage />} />
      <Route path="/progress" element={<ProgressPage />} />
      <Route path="/exam-mode" element={<ExamMode />} />
      <Route path="/ai-insights" element={<AIInsights />} />

      {/* Profile */}
      <Route path="/profile" element={<ProfilePage />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
