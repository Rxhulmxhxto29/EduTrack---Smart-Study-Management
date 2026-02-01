import { useState, useEffect, useCallback } from 'react';
import StudentLayout from '../../components/layout/StudentLayout';
import Card from '../../components/common/Card';
import { 
  BookOpen, FileText, Calendar, Clock, CheckCircle, Lightbulb, Target, Plus, Zap,
  TrendingUp, AlertTriangle, Edit2, Trash2, X, Play, Star, Bell, ArrowRight,
  Flame, Trophy, Sparkles, GraduationCap, Rocket, Loader
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getData, saveData } from '../../services/userDataService';

// Storage keys
const STORAGE_KEYS = {
  subjects: 'dashboard_data',
  deadlines: 'dashboard_data',
  lastViewed: 'preferences'
};

// Load from localStorage (fallback for non-async initial load)
const loadFromStorage = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(`edutrack_${key}`);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

// Default subjects with progress
const DEFAULT_SUBJECTS = [
  { _id: '1', name: 'Data Structures', code: 'CS301', totalUnits: 5, completedUnits: 3, totalTopics: 25, completedTopics: 18, color: 'indigo' },
  { _id: '2', name: 'Database Systems', code: 'CS302', totalUnits: 5, completedUnits: 4, totalTopics: 20, completedTopics: 14, color: 'emerald' },
  { _id: '3', name: 'Operating Systems', code: 'CS303', totalUnits: 5, completedUnits: 2, totalTopics: 22, completedTopics: 10, color: 'violet' },
  { _id: '4', name: 'Computer Networks', code: 'CS304', totalUnits: 5, completedUnits: 1, totalTopics: 18, completedTopics: 6, color: 'amber' },
];

// Default deadlines
const DEFAULT_DEADLINES = [
  { _id: '1', title: 'Data Structures Lab 5', type: 'assignment', subject: 'Data Structures', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() },
  { _id: '2', title: 'Database Project Phase 2', type: 'assignment', subject: 'Database Systems', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },
  { _id: '3', title: 'Data Structures Mid-Term', type: 'internal', subject: 'Data Structures', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() },
  { _id: '4', title: 'Semester Final Exams', type: 'semester', subject: 'All Subjects', dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString() },
];

const STUDY_TIPS = [
  { icon: '🎯', tip: 'Break large topics into smaller chunks for better retention', color: 'from-blue-500 to-cyan-500' },
  { icon: '⏰', tip: 'Use the Pomodoro technique: 25 min study, 5 min break', color: 'from-purple-500 to-pink-500' },
  { icon: '📝', tip: 'Write notes in your own words to understand better', color: 'from-orange-500 to-red-500' },
  { icon: '🔄', tip: 'Review your notes within 24 hours to boost memory', color: 'from-green-500 to-emerald-500' },
  { icon: '💤', tip: 'Get enough sleep - it helps consolidate learning', color: 'from-indigo-500 to-purple-500' },
  { icon: '🧠', tip: 'Teach concepts to others - it deepens understanding', color: 'from-pink-500 to-rose-500' },
];

const COLOR_MAP = {
  indigo: { gradient: 'from-indigo-500 to-purple-600', bg: 'bg-indigo-500', light: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400' },
  emerald: { gradient: 'from-emerald-500 to-green-600', bg: 'bg-emerald-500', light: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' },
  violet: { gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-500', light: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400' },
  amber: { gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-500', light: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400' },
  rose: { gradient: 'from-rose-500 to-pink-600', bg: 'bg-rose-500', light: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400' },
  cyan: { gradient: 'from-cyan-500 to-blue-600', bg: 'bg-cyan-500', light: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-600 dark:text-cyan-400' },
};

// Progress Ring Component
const ProgressRing = ({ progress, size = 120, strokeWidth = 10 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle className="text-white/20" strokeWidth={strokeWidth} stroke="currentColor" fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
        <circle className="text-white" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx={size / 2} cy={size / 2} style={{ transition: 'stroke-dashoffset 0.5s ease-out' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <span className="text-3xl font-bold text-white">{progress}%</span>
          <p className="text-xs text-white/70">Complete</p>
        </div>
      </div>
    </div>
  );
};

function StudentDashboard() {
  const navigate = useNavigate();
  
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  const [deadlines, setDeadlines] = useState(DEFAULT_DEADLINES);
  const [recentNotes, setRecentNotes] = useState([]);
  const [lastViewed, setLastViewed] = useState(null);
  const [currentTip] = useState(STUDY_TIPS[Math.floor(Math.random() * STUDY_TIPS.length)]);
  const [greeting, setGreeting] = useState('');
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [editingDeadline, setEditingDeadline] = useState(null);
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', totalUnits: 5, completedUnits: 0, totalTopics: 20, completedTopics: 0, color: 'indigo' });
  const [deadlineForm, setDeadlineForm] = useState({ title: '', type: 'assignment', subject: '', dueDate: '' });
  const [loading, setLoading] = useState(true);
  const [studyStreak, setStudyStreak] = useState(7);

  // Load data from backend on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [dashboardData, prefsData, streakData] = await Promise.all([
          getData('dashboard_data', { subjects: DEFAULT_SUBJECTS, deadlines: DEFAULT_DEADLINES }),
          getData('preferences', { lastViewed: null }),
          getData('study_streak', { days: 7, lastStudyDate: null })
        ]);
        
        setSubjects(dashboardData.subjects || DEFAULT_SUBJECTS);
        setDeadlines(dashboardData.deadlines || DEFAULT_DEADLINES);
        setLastViewed(prefsData.lastViewed);
        
        // Handle study streak
        const streak = typeof streakData === 'number' ? streakData : (streakData.days || 7);
        setStudyStreak(streak);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Save dashboard data to backend
  const saveDashboardData = useCallback(async (newSubjects, newDeadlines) => {
    await saveData('dashboard_data', { subjects: newSubjects, deadlines: newDeadlines });
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    const notes = loadFromStorage('notes', []);
    setRecentNotes(notes.slice(0, 5));
  }, []);

  const totalNotes = loadFromStorage('notes', []).length;
  const totalTasks = loadFromStorage('tasks', []).length;
  const completedTasks = loadFromStorage('tasks', []).filter(t => t.completed).length;
  const totalTopics = subjects.reduce((sum, s) => sum + s.totalTopics, 0);
  const completedTopics = subjects.reduce((sum, s) => sum + s.completedTopics, 0);
  const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  const upcomingDeadlines = deadlines.filter(d => new Date(d.dueDate) > new Date()).length;

  const getDaysUntil = (dateString) => {
    const days = Math.ceil((new Date(dateString) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    if (days === 1) return 'Tomorrow';
    return `${days} days`;
  };

  const getDeadlineColor = (dateString) => {
    const days = Math.ceil((new Date(dateString) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    if (days <= 2) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    if (days <= 7) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'assignment': return <FileText className="w-4 h-4" />;
      case 'internal': return <Target className="w-4 h-4" />;
      case 'semester': return <AlertTriangle className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  // CRUD for Subjects
  const handleAddSubject = () => { setEditingSubject(null); setSubjectForm({ name: '', code: '', totalUnits: 5, completedUnits: 0, totalTopics: 20, completedTopics: 0, color: 'indigo' }); setShowSubjectModal(true); };
  const handleEditSubject = (subject) => { setEditingSubject(subject); setSubjectForm({ ...subject }); setShowSubjectModal(true); };
  const handleDeleteSubject = async (id) => { 
    if (confirm('Delete this subject?')) { 
      const newSubjects = subjects.filter(s => s._id !== id);
      setSubjects(newSubjects);
      await saveDashboardData(newSubjects, deadlines);
      toast.success('Subject deleted'); 
    } 
  };
  const saveSubject = async () => {
    if (!subjectForm.name.trim()) { toast.error('Please enter subject name'); return; }
    let newSubjects;
    if (editingSubject) { 
      newSubjects = subjects.map(s => s._id === editingSubject._id ? { ...s, ...subjectForm } : s);
      toast.success('Subject updated! 📚'); 
    } else { 
      newSubjects = [...subjects, { _id: Date.now().toString(), ...subjectForm }];
      toast.success('Subject added! 🎉'); 
    }
    setSubjects(newSubjects);
    await saveDashboardData(newSubjects, deadlines);
    setShowSubjectModal(false);
  };

  // CRUD for Deadlines
  const handleAddDeadline = () => { setEditingDeadline(null); setDeadlineForm({ title: '', type: 'assignment', subject: '', dueDate: '' }); setShowDeadlineModal(true); };
  const handleEditDeadline = (deadline) => { setEditingDeadline(deadline); setDeadlineForm({ ...deadline, dueDate: deadline.dueDate.split('T')[0] }); setShowDeadlineModal(true); };
  const handleDeleteDeadline = async (id) => { 
    if (confirm('Delete this deadline?')) { 
      const newDeadlines = deadlines.filter(d => d._id !== id);
      setDeadlines(newDeadlines);
      await saveDashboardData(subjects, newDeadlines);
      toast.success('Deadline deleted'); 
    } 
  };
  const saveDeadline = async () => {
    if (!deadlineForm.title.trim() || !deadlineForm.dueDate) { toast.error('Please fill all required fields'); return; }
    let newDeadlines;
    if (editingDeadline) { 
      newDeadlines = deadlines.map(d => d._id === editingDeadline._id ? { ...d, ...deadlineForm, dueDate: new Date(deadlineForm.dueDate).toISOString() } : d);
      toast.success('Deadline updated! ⏰'); 
    } else { 
      newDeadlines = [...deadlines, { _id: Date.now().toString(), ...deadlineForm, dueDate: new Date(deadlineForm.dueDate).toISOString() }];
      toast.success('Deadline added! 📅'); 
    }
    setDeadlines(newDeadlines);
    await saveDashboardData(subjects, newDeadlines);
    setShowDeadlineModal(false);
  };

  const handleResumeLast = () => { if (lastViewed) { navigate(lastViewed.path); } else { toast('No recent activity to resume'); } };

  // Loading state
  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <Loader className="w-6 h-6 animate-spin" />
            <span>Loading dashboard...</span>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6 lg:space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 lg:p-8 text-white shadow-2xl">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          </div>
          
          <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                <span className="text-sm font-medium text-white/80">{greeting}</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">Welcome back, Student! 👋</h1>
              <p className="text-white/80 text-lg mb-4">Computer Science • Semester 5</p>
              
              <div className="flex flex-wrap gap-3 mt-4">
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <span className="font-semibold">{studyStreak} day streak</span>
                </div>
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold">{completedTopics} topics done</span>
                </div>
              </div>

              {lastViewed && (
                <button onClick={handleResumeLast} className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all group">
                  <Play className="w-5 h-5" />
                  <span>Resume: {lastViewed.title}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
            <ProgressRing progress={overallProgress} size={140} strokeWidth={12} />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Notes', value: totalNotes, icon: BookOpen, color: 'from-blue-500 to-cyan-500', path: '/notes' },
            { label: 'Tasks Done', value: `${completedTasks}/${totalTasks}`, icon: CheckCircle, color: 'from-emerald-500 to-green-500', path: '/assignments' },
            { label: 'Topics', value: `${completedTopics}/${totalTopics}`, icon: TrendingUp, color: 'from-violet-500 to-purple-500', path: '/progress' },
            { label: 'Deadlines', value: upcomingDeadlines, icon: Bell, color: 'from-amber-500 to-orange-500', path: null },
          ].map((stat, index) => (
            <div key={stat.label} onClick={() => stat.path && navigate(stat.path)}
              className={`relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-soft hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1 ${stat.path ? 'cursor-pointer' : ''} animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}>
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -translate-y-8 translate-x-8`} />
              <div className="relative">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Subject Progress */}
        <div>
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Subject Progress</h2>
            </div>
            <button onClick={handleAddSubject} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all transform hover:scale-105">
              <Plus className="w-4 h-4" /> Add Subject
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {subjects.map((subject, index) => {
              const progress = subject.totalTopics > 0 ? Math.round((subject.completedTopics / subject.totalTopics) * 100) : 0;
              const colors = COLOR_MAP[subject.color] || COLOR_MAP.indigo;
              return (
                <Card key={subject._id} className="group relative overflow-hidden" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient}`} />
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{subject.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{subject.code}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditSubject(subject)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Edit2 className="w-4 h-4 text-gray-500" /></button>
                      <button onClick={() => handleDeleteSubject(subject._id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16">
                      <svg className="transform -rotate-90 w-16 h-16">
                        <circle className="text-gray-200 dark:text-gray-700" strokeWidth="4" stroke="currentColor" fill="transparent" r="28" cx="32" cy="32" />
                        <circle className={colors.text} strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="transparent" r="28" cx="32" cy="32"
                          style={{ strokeDasharray: 175.9, strokeDashoffset: 175.9 - (progress / 100) * 175.9, transition: 'stroke-dashoffset 0.5s ease-out' }} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-sm font-bold ${colors.text}`}>{progress}%</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1"><span className="text-gray-600 dark:text-gray-400">Units</span><span className="font-semibold text-gray-900 dark:text-white">{subject.completedUnits}/{subject.totalUnits}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">Topics</span><span className="font-semibold text-gray-900 dark:text-white">{subject.completedTopics}/{subject.totalTopics}</span></div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deadlines */}
          <Card noPadding className="overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-500"><AlertTriangle className="w-5 h-5 text-white" /></div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Upcoming Deadlines</h2>
              </div>
              <button onClick={handleAddDeadline} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"><Plus className="w-4 h-4" />Add</button>
            </div>
            <div className="p-5 space-y-3 max-h-80 overflow-y-auto">
              {deadlines.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).map(deadline => (
                <div key={deadline._id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${getDeadlineColor(deadline.dueDate)}`}>{getTypeIcon(deadline.type)}</div>
                    <div><h4 className="font-semibold text-gray-900 dark:text-white">{deadline.title}</h4><p className="text-sm text-gray-500">{deadline.subject}</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getDeadlineColor(deadline.dueDate)}`}>{getDaysUntil(deadline.dueDate)}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                      <button onClick={() => handleEditDeadline(deadline)} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"><Edit2 className="w-3.5 h-3.5 text-gray-500" /></button>
                      <button onClick={() => handleDeleteDeadline(deadline._id)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                    </div>
                  </div>
                </div>
              ))}
              {deadlines.length === 0 && <div className="text-center py-8"><Clock className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" /><p className="text-gray-500">No upcoming deadlines</p></div>}
            </div>
          </Card>

          {/* Recent Notes */}
          <Card noPadding className="overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500"><Star className="w-5 h-5 text-white" /></div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Notes</h2>
              </div>
              <Link to="/notes" className="flex items-center gap-1 text-sm font-medium text-indigo-600 group">View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></Link>
            </div>
            <div className="p-5 space-y-2">
              {recentNotes.map(note => (
                <Link key={note._id} to="/notes" className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
                  onClick={() => { const newLastViewed = { title: note.title, path: '/notes' }; setLastViewed(newLastViewed); saveToStorage(STORAGE_KEYS.lastViewed, newLastViewed); }}>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500"><FileText className="w-4 h-4 text-white" /></div>
                    <div><h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">{note.title}</h4><p className="text-sm text-gray-500">{note.subject}</p></div>
                  </div>
                  {note.tags?.includes('important') && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
                </Link>
              ))}
              {recentNotes.length === 0 && <div className="text-center py-8"><FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" /><p className="text-gray-500">No notes yet</p><Link to="/notes" className="mt-2 text-indigo-600 text-sm font-medium hover:underline inline-block">Create your first note</Link></div>}
            </div>
          </Card>
        </div>

        {/* Quick Actions & Study Tip */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500"><Rocket className="w-5 h-5 text-white" /></div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Add Note', icon: Plus, path: '/notes', gradient: 'from-blue-500 to-cyan-500' },
                { label: 'Add Task', icon: Plus, path: '/assignments', gradient: 'from-emerald-500 to-green-500' },
                { label: 'Timetable', icon: Calendar, path: '/timetable', gradient: 'from-violet-500 to-purple-500' },
                { label: 'Exam Mode', icon: Zap, path: '/exam-mode', gradient: 'from-amber-500 to-orange-500' },
              ].map((action) => (
                <Link key={action.label} to={action.path} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group transform hover:scale-[1.02]">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${action.gradient} shadow-lg`}><action.icon className="w-5 h-5 text-white" /></div>
                  <span className="font-semibold text-gray-900 dark:text-white">{action.label}</span>
                </Link>
              ))}
            </div>
          </Card>

          <div className={`rounded-2xl bg-gradient-to-br ${currentTip.color} p-6 text-white shadow-xl relative overflow-hidden`}>
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-4"><Lightbulb className="w-6 h-6" /><h2 className="text-lg font-bold">Study Tip of the Day</h2></div>
              <div className="flex items-start gap-4">
                <span className="text-5xl animate-bounce-subtle">{currentTip.icon}</span>
                <p className="text-lg text-white/90 leading-relaxed">{currentTip.tip}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Modal */}
        {showSubjectModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
              <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingSubject ? 'Edit Subject' : 'Add New Subject'}</h2>
                <button onClick={() => setShowSubjectModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Subject Name *</label><input type="text" placeholder="e.g., Data Structures" value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} className="input-modern" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Subject Code</label><input type="text" placeholder="e.g., CS301" value={subjectForm.code} onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })} className="input-modern" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Total Units</label><input type="number" min="1" value={subjectForm.totalUnits} onChange={(e) => setSubjectForm({ ...subjectForm, totalUnits: parseInt(e.target.value) || 1 })} className="input-modern" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Completed</label><input type="number" min="0" max={subjectForm.totalUnits} value={subjectForm.completedUnits} onChange={(e) => setSubjectForm({ ...subjectForm, completedUnits: parseInt(e.target.value) || 0 })} className="input-modern" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Total Topics</label><input type="number" min="1" value={subjectForm.totalTopics} onChange={(e) => setSubjectForm({ ...subjectForm, totalTopics: parseInt(e.target.value) || 1 })} className="input-modern" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Completed</label><input type="number" min="0" max={subjectForm.totalTopics} value={subjectForm.completedTopics} onChange={(e) => setSubjectForm({ ...subjectForm, completedTopics: parseInt(e.target.value) || 0 })} className="input-modern" /></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color Theme</label>
                  <div className="flex gap-2 flex-wrap">{Object.keys(COLOR_MAP).map(color => (<button key={color} onClick={() => setSubjectForm({ ...subjectForm, color })} className={`w-10 h-10 rounded-xl bg-gradient-to-br ${COLOR_MAP[color].gradient} transition-all transform hover:scale-110 ${subjectForm.color === color ? 'ring-4 ring-offset-2 ring-gray-400 scale-110' : ''}`} />))}</div>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
                <button onClick={() => setShowSubjectModal(false)} className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-medium">Cancel</button>
                <button onClick={saveSubject} className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all transform hover:scale-105">{editingSubject ? 'Save Changes' : 'Add Subject'}</button>
              </div>
            </div>
          </div>
        )}

        {/* Deadline Modal */}
        {showDeadlineModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
              <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingDeadline ? 'Edit Deadline' : 'Add New Deadline'}</h2>
                <button onClick={() => setShowDeadlineModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title *</label><input type="text" placeholder="e.g., Assignment 5" value={deadlineForm.title} onChange={(e) => setDeadlineForm({ ...deadlineForm, title: e.target.value })} className="input-modern" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type</label><select value={deadlineForm.type} onChange={(e) => setDeadlineForm({ ...deadlineForm, type: e.target.value })} className="input-modern"><option value="assignment">📝 Assignment</option><option value="internal">🎯 Internal Exam</option><option value="semester">📚 Semester Exam</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Subject</label><input type="text" placeholder="e.g., Data Structures" value={deadlineForm.subject} onChange={(e) => setDeadlineForm({ ...deadlineForm, subject: e.target.value })} className="input-modern" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Due Date *</label><input type="date" value={deadlineForm.dueDate} onChange={(e) => setDeadlineForm({ ...deadlineForm, dueDate: e.target.value })} className="input-modern" /></div>
              </div>
              <div className="flex justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
                <button onClick={() => setShowDeadlineModal(false)} className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-medium">Cancel</button>
                <button onClick={saveDeadline} className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all transform hover:scale-105">{editingDeadline ? 'Save Changes' : 'Add Deadline'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

export default StudentDashboard;
