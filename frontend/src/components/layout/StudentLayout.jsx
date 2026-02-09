import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useExamMode } from '../../contexts/ExamModeContext';
import { 
  BookOpen, 
  FileText, 
  Calendar, 
  TrendingUp, 
  Target,
  User,
  Menu,
  X,
  Sun,
  Moon,
  Focus,
  Zap,
  Search,
  Bell,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  GraduationCap,
  Brain,
  Clock,
  AlertTriangle,
  Trophy,
  CheckCircle,
  BookMarked,
  Calculator,
  StickyNote,
  Delete,
  RotateCcw,
  Save,
  Trash2,
  Plus,
  Minus,
  Divide,
  Equal,
  Percent,
  PanelLeftClose,
  PanelLeft,
  LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';

function StudentLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('edutrack_sidebar_collapsed');
    return saved === 'true';
  });
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showNotepad, setShowNotepad] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  
  // Calculator state
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcExpression, setCalcExpression] = useState('');
  const [calcHistory, setCalcHistory] = useState([]);
  const [calcMode, setCalcMode] = useState('deg'); // deg or rad
  const [calcMemory, setCalcMemory] = useState(0);
  const [isNewNumber, setIsNewNumber] = useState(true);
  
  // Notepad state
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('edutrack_quicknotes');
    return saved ? JSON.parse(saved) : [{ id: 1, title: 'Quick Note', content: '', createdAt: new Date().toISOString() }];
  });
  const [activeNoteId, setActiveNoteId] = useState(1);
  const [noteContent, setNoteContent] = useState('');
  
  // Real-time clock state
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const { examModeActive, toggleExamMode } = useExamMode();
  const location = useLocation();
  const navigate = useNavigate();

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time display
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Generate notifications from app data
  const generateNotifications = useMemo(() => {
    const notifs = [];
    const now = new Date();
    const readNotifications = JSON.parse(localStorage.getItem('edutrack_read_notifications') || '[]');

    // 1. Check for upcoming deadlines (from tasks/assignments)
    const tasks = JSON.parse(localStorage.getItem('edutrack_tasks') || '[]');
    tasks.forEach(task => {
      if (!task.completed && task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const daysUntil = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        if (daysUntil <= 3 && daysUntil >= 0) {
          notifs.push({
            id: `deadline-${task.id}`,
            type: 'deadline',
            icon: AlertTriangle,
            iconColor: daysUntil <= 1 ? 'text-red-500' : 'text-amber-500',
            bgColor: daysUntil <= 1 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30',
            title: daysUntil === 0 ? 'Due Today!' : daysUntil === 1 ? 'Due Tomorrow!' : `Due in ${daysUntil} days`,
            message: task.title || task.name || 'Task deadline approaching',
            time: dueDate.toLocaleDateString(),
            read: readNotifications.includes(`deadline-${task.id}`),
            priority: daysUntil <= 1 ? 1 : 2
          });
        }
      }
    });

    // 2. Check study streak
    const studyStreak = JSON.parse(localStorage.getItem('study_streak') || '{}');
    const lastStudyDate = studyStreak.lastStudyDate ? new Date(studyStreak.lastStudyDate) : null;
    const todayStr = now.toDateString();
    const hasStudiedToday = lastStudyDate && lastStudyDate.toDateString() === todayStr;
    
    if (!hasStudiedToday && now.getHours() >= 10) {
      notifs.push({
        id: 'study-reminder',
        type: 'reminder',
        icon: BookMarked,
        iconColor: 'text-blue-500',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        title: 'Study Reminder',
        message: studyStreak.currentStreak > 0 
          ? `Don't break your ${studyStreak.currentStreak}-day streak! Start studying now.`
          : 'Start your study session today to build your streak!',
        time: 'Today',
        read: readNotifications.includes('study-reminder'),
        priority: 3
      });
    }

    // 3. Check for exams (from exam mode data)
    const examData = JSON.parse(localStorage.getItem('exam_mode_data') || '{}');
    if (examData.examDate) {
      const examDate = new Date(examData.examDate);
      const daysUntilExam = Math.ceil((examDate - now) / (1000 * 60 * 60 * 24));
      if (daysUntilExam <= 7 && daysUntilExam >= 0) {
        notifs.push({
          id: 'exam-alert',
          type: 'exam',
          icon: Clock,
          iconColor: daysUntilExam <= 2 ? 'text-red-500' : 'text-purple-500',
          bgColor: daysUntilExam <= 2 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-purple-100 dark:bg-purple-900/30',
          title: daysUntilExam === 0 ? 'Exam Today!' : `Exam in ${daysUntilExam} days`,
          message: examData.examName || 'Your scheduled exam is approaching',
          time: examDate.toLocaleDateString(),
          read: readNotifications.includes('exam-alert'),
          priority: daysUntilExam <= 2 ? 0 : 2
        });
      }
    }

    // 4. Progress achievements
    const progressData = JSON.parse(localStorage.getItem('progress_data') || '{}');
    const completedTopics = progressData.completedTopics?.length || 0;
    const milestones = [5, 10, 25, 50, 100];
    milestones.forEach(milestone => {
      if (completedTopics >= milestone && !readNotifications.includes(`achievement-${milestone}`)) {
        const existingAchievement = notifs.find(n => n.type === 'achievement');
        if (!existingAchievement || milestone > existingAchievement.milestone) {
          // Remove lower achievement if exists
          const idx = notifs.findIndex(n => n.type === 'achievement');
          if (idx > -1) notifs.splice(idx, 1);
          
          notifs.push({
            id: `achievement-${milestone}`,
            type: 'achievement',
            icon: Trophy,
            iconColor: 'text-yellow-500',
            bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
            title: '🎉 Achievement Unlocked!',
            message: `You've completed ${milestone} topics! Keep going!`,
            time: 'Recent',
            read: false,
            priority: 4,
            milestone
          });
        }
      }
    });

    // 5. Timetable - upcoming class reminders
    const timetableData = JSON.parse(localStorage.getItem('timetable_data') || '{}');
    const schedule = timetableData.schedule || [];
    const today = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    
    schedule.forEach(entry => {
      if (entry.day === today && entry.startTime) {
        const [startHour, startMin] = entry.startTime.split(':').map(Number);
        const minutesUntil = (startHour * 60 + startMin) - (currentHour * 60 + currentMin);
        
        if (minutesUntil > 0 && minutesUntil <= 60) {
          notifs.push({
            id: `class-${entry.id || entry.subject}`,
            type: 'class',
            icon: GraduationCap,
            iconColor: 'text-green-500',
            bgColor: 'bg-green-100 dark:bg-green-900/30',
            title: `Class in ${minutesUntil} min`,
            message: `${entry.subject}${entry.room ? ` - Room ${entry.room}` : ''}`,
            time: entry.startTime,
            read: readNotifications.includes(`class-${entry.id || entry.subject}`),
            priority: 1
          });
        }
      }
    });

    // 6. Notes pending review (notes marked for review)
    const notes = JSON.parse(localStorage.getItem('edutrack_notes') || '[]');
    const notesForReview = notes.filter(n => n.needsReview || n.markedForReview);
    if (notesForReview.length > 0) {
      notifs.push({
        id: 'notes-review',
        type: 'review',
        icon: FileText,
        iconColor: 'text-indigo-500',
        bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
        title: 'Notes to Review',
        message: `${notesForReview.length} note${notesForReview.length > 1 ? 's' : ''} marked for review`,
        time: 'Pending',
        read: readNotifications.includes('notes-review'),
        priority: 5
      });
    }

    // Sort by priority (lower number = higher priority)
    return notifs.sort((a, b) => a.priority - b.priority);
  }, []);

  useEffect(() => {
    setNotifications(generateNotifications);
    // Re-check notifications every minute
    const interval = setInterval(() => {
      setNotifications(generateNotifications);
    }, 60000);
    return () => clearInterval(interval);
  }, [generateNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId) => {
    const readNotifications = JSON.parse(localStorage.getItem('edutrack_read_notifications') || '[]');
    if (!readNotifications.includes(notificationId)) {
      readNotifications.push(notificationId);
      localStorage.setItem('edutrack_read_notifications', JSON.stringify(readNotifications));
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    }
  };

  const markAllAsRead = () => {
    const readNotifications = JSON.parse(localStorage.getItem('edutrack_read_notifications') || '[]');
    notifications.forEach(n => {
      if (!readNotifications.includes(n.id)) {
        readNotifications.push(n.id);
      }
    });
    localStorage.setItem('edutrack_read_notifications', JSON.stringify(readNotifications));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (notificationId) => {
    markAsRead(notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // ==================== SCIENTIFIC CALCULATOR ====================
  
  // Load active note content when switching notes
  useEffect(() => {
    const activeNote = notes.find(n => n.id === activeNoteId);
    if (activeNote) {
      setNoteContent(activeNote.content);
    }
  }, [activeNoteId, notes]);

  // Calculator functions
  const toRadians = (deg) => (deg * Math.PI) / 180;
  const toDegrees = (rad) => (rad * 180) / Math.PI;

  const calcFunctions = {
    sin: (x) => calcMode === 'deg' ? Math.sin(toRadians(x)) : Math.sin(x),
    cos: (x) => calcMode === 'deg' ? Math.cos(toRadians(x)) : Math.cos(x),
    tan: (x) => calcMode === 'deg' ? Math.tan(toRadians(x)) : Math.tan(x),
    asin: (x) => calcMode === 'deg' ? toDegrees(Math.asin(x)) : Math.asin(x),
    acos: (x) => calcMode === 'deg' ? toDegrees(Math.acos(x)) : Math.acos(x),
    atan: (x) => calcMode === 'deg' ? toDegrees(Math.atan(x)) : Math.atan(x),
    sinh: (x) => Math.sinh(x),
    cosh: (x) => Math.cosh(x),
    tanh: (x) => Math.tanh(x),
    log: (x) => Math.log10(x),
    ln: (x) => Math.log(x),
    sqrt: (x) => Math.sqrt(x),
    cbrt: (x) => Math.cbrt(x),
    abs: (x) => Math.abs(x),
    exp: (x) => Math.exp(x),
    fact: (x) => {
      if (x < 0) return NaN;
      if (x === 0 || x === 1) return 1;
      let result = 1;
      for (let i = 2; i <= x; i++) result *= i;
      return result;
    },
  };

  const handleCalcInput = useCallback((value) => {
    if (isNewNumber && !isNaN(value)) {
      setCalcDisplay(value === '.' ? '0.' : value);
      setIsNewNumber(false);
    } else if (!isNaN(value) || value === '.') {
      if (value === '.' && calcDisplay.includes('.')) return;
      setCalcDisplay(prev => prev === '0' && value !== '.' ? value : prev + value);
    }
  }, [isNewNumber, calcDisplay]);

  const handleCalcOperator = useCallback((op) => {
    setCalcExpression(prev => prev + calcDisplay + ' ' + op + ' ');
    setIsNewNumber(true);
  }, [calcDisplay]);

  const handleCalcFunction = useCallback((func) => {
    try {
      const num = parseFloat(calcDisplay);
      const result = calcFunctions[func](num);
      if (isNaN(result) || !isFinite(result)) {
        setCalcDisplay('Error');
      } else {
        setCalcDisplay(result.toString());
      }
      setIsNewNumber(true);
    } catch {
      setCalcDisplay('Error');
    }
  }, [calcDisplay, calcMode]);

  const handleCalcEquals = useCallback(() => {
    try {
      const fullExpression = calcExpression + calcDisplay;
      // Safe evaluation using Function
      const sanitized = fullExpression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**')
        .replace(/π/g, Math.PI.toString())
        .replace(/e(?![xp])/g, Math.E.toString());
      
      // eslint-disable-next-line no-new-func
      const result = new Function('return ' + sanitized)();
      
      if (isNaN(result) || !isFinite(result)) {
        setCalcDisplay('Error');
      } else {
        const formattedResult = Number.isInteger(result) ? result.toString() : result.toFixed(10).replace(/\.?0+$/, '');
        setCalcHistory(prev => [...prev.slice(-9), { expression: fullExpression, result: formattedResult }]);
        setCalcDisplay(formattedResult);
      }
      setCalcExpression('');
      setIsNewNumber(true);
    } catch {
      setCalcDisplay('Error');
      setCalcExpression('');
      setIsNewNumber(true);
    }
  }, [calcExpression, calcDisplay]);

  const handleCalcClear = () => {
    setCalcDisplay('0');
    setCalcExpression('');
    setIsNewNumber(true);
  };

  const handleCalcBackspace = () => {
    setCalcDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  };

  const handleCalcPower = (power) => {
    const num = parseFloat(calcDisplay);
    setCalcDisplay(Math.pow(num, power).toString());
    setIsNewNumber(true);
  };

  const handleCalcMemory = (action) => {
    const num = parseFloat(calcDisplay);
    switch (action) {
      case 'MC': setCalcMemory(0); break;
      case 'MR': setCalcDisplay(calcMemory.toString()); setIsNewNumber(true); break;
      case 'M+': setCalcMemory(prev => prev + num); break;
      case 'M-': setCalcMemory(prev => prev - num); break;
      case 'MS': setCalcMemory(num); break;
    }
  };

  // ==================== NOTEPAD FUNCTIONS ====================
  
  const saveNotes = useCallback((updatedNotes) => {
    localStorage.setItem('edutrack_quicknotes', JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  }, []);

  const handleNoteChange = (content) => {
    setNoteContent(content);
    const updatedNotes = notes.map(n => 
      n.id === activeNoteId ? { ...n, content, updatedAt: new Date().toISOString() } : n
    );
    saveNotes(updatedNotes);
  };

  const addNewNote = () => {
    const newNote = {
      id: Date.now(),
      title: `Note ${notes.length + 1}`,
      content: '',
      createdAt: new Date().toISOString()
    };
    const updatedNotes = [...notes, newNote];
    saveNotes(updatedNotes);
    setActiveNoteId(newNote.id);
    setNoteContent('');
    toast.success('New note created!');
  };

  const deleteNote = (noteId) => {
    if (notes.length <= 1) {
      toast.error('Cannot delete the last note');
      return;
    }
    const updatedNotes = notes.filter(n => n.id !== noteId);
    saveNotes(updatedNotes);
    if (activeNoteId === noteId) {
      setActiveNoteId(updatedNotes[0].id);
    }
    toast.success('Note deleted');
  };

  const renameNote = (noteId, newTitle) => {
    const updatedNotes = notes.map(n => 
      n.id === noteId ? { ...n, title: newTitle } : n
    );
    saveNotes(updatedNotes);
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showNotifications && !e.target.closest('.notifications-container')) {
        setShowNotifications(false);
      }
      if (showCalculator && !e.target.closest('.calculator-container')) {
        setShowCalculator(false);
      }
      if (showNotepad && !e.target.closest('.notepad-container')) {
        setShowNotepad(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showNotifications, showCalculator, showNotepad]);

  // Track scroll for header shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle sidebar collapse
  const toggleSidebarCollapse = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('edutrack_sidebar_collapsed', newState.toString());
  };

  // Navigation items with colors
  const fullNavigation = [
    { name: 'Dashboard', path: '/dashboard', icon: BookOpen, color: 'from-blue-500 to-cyan-500' },
    { name: 'Notes', path: '/notes', icon: FileText, color: 'from-purple-500 to-pink-500' },
    { name: 'AI Insights', path: '/ai-insights', icon: Brain, color: 'from-indigo-500 to-violet-500', badge: 'AI' },
    { name: 'Study Hub', path: '/assignments', icon: Target, color: 'from-orange-500 to-red-500' },
    { name: 'Timetable', path: '/timetable', icon: Calendar, color: 'from-green-500 to-emerald-500' },
    { name: 'Progress', path: '/progress', icon: TrendingUp, color: 'from-indigo-500 to-purple-500' },
    { name: 'Exam Mode', path: '/exam-mode', icon: Zap, color: 'from-amber-500 to-orange-500' },
  ];

  const examNavigation = [
    { name: 'Exam Mode', path: '/exam-mode', icon: Zap, color: 'from-amber-500 to-orange-500' },
    { name: 'Notes', path: '/notes', icon: FileText, color: 'from-purple-500 to-pink-500' },
    { name: 'AI Insights', path: '/ai-insights', icon: Brain, color: 'from-indigo-500 to-violet-500', badge: 'AI' },
    { name: 'Progress', path: '/progress', icon: TrendingUp, color: 'from-indigo-500 to-purple-500' },
  ];

  const navigation = examModeActive ? examNavigation : fullNavigation;

  const isActive = (path) => location.pathname === path;

  const handleExamModeToggle = () => {
    toggleExamMode();
    if (!examModeActive) {
      toast.success('🎯 Focus Mode Activated!', { 
        duration: 3000,
        style: { background: '#1f2937', color: '#fff' }
      });
      navigate('/exam-mode');
    } else {
      toast.success('Focus Mode Deactivated', { duration: 2000 });
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-mesh transition-all duration-500 ease-in-out`}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ease-in-out"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen
        ${sidebarCollapsed ? 'w-[76px]' : 'w-72'}
        bg-white/90 dark:bg-gray-900/95 backdrop-blur-2xl
        border-r border-gray-200/50 dark:border-gray-700/50
        shadow-2xl shadow-gray-500/10 dark:shadow-black/30
        transform transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo Section */}
          <div className={`${sidebarCollapsed ? 'p-3' : 'p-6'} border-b border-gray-200/50 dark:border-gray-700/50 transition-all duration-300`}>
            <div className="flex items-center justify-between">
              <Link to="/dashboard" className={`flex items-center ${sidebarCollapsed ? 'justify-center w-full' : 'gap-3'} group`}>
                <div className={`${sidebarCollapsed ? 'w-11 h-11' : 'w-10 h-10'} rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 
                              flex items-center justify-center shadow-lg shadow-indigo-500/30
                              group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-indigo-500/40
                              transition-all duration-300 ease-out`}>
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                {!sidebarCollapsed && (
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 
                                 bg-clip-text text-transparent">
                      EduTrack
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Smart Learning</p>
                  </div>
                )}
              </Link>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Exam Mode Banner */}
          {examModeActive && !sidebarCollapsed && (
            <div className="mx-4 mt-4 p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 animate-pulse" />
                <span className="font-semibold text-sm">Focus Mode Active</span>
              </div>
              <p className="text-xs mt-1 opacity-90">Distractions minimized</p>
            </div>
          )}
          {examModeActive && sidebarCollapsed && (
            <div className="mx-2 mt-4 p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white flex justify-center">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
          )}

          {/* Navigation */}
          <nav className={`flex-1 ${sidebarCollapsed ? 'p-2' : 'p-4'} space-y-1.5 overflow-y-auto transition-all duration-300 
                         scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent`}>
            {!sidebarCollapsed && (
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-3 
                          transition-opacity duration-300">
                Menu
              </p>
            )}
            {navigation.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={sidebarCollapsed ? item.name : undefined}
                  className={`
                    group flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 rounded-xl
                    transition-all duration-300 ease-out
                    hover:scale-[1.02] active:scale-[0.98]
                    ${active 
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-${item.color.split('-')[1]}-500/25` 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/60'
                    }
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className={`
                    p-2 rounded-lg transition-all duration-300
                    ${active 
                      ? 'bg-white/20' 
                      : `bg-gradient-to-r ${item.color} bg-opacity-10 group-hover:scale-110`
                    }
                  `}>
                    <Icon size={18} className={`${active ? 'text-white' : ''} transition-transform duration-300`} />
                  </div>
                  {!sidebarCollapsed && (
                    <>
                      <span className="font-medium transition-all duration-300">{item.name}</span>
                      {item.badge && (
                        <span className={`ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-md transition-all duration-300 ${
                          active ? 'bg-white/30 text-white' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      {active && (
                        <ChevronRight className="w-4 h-4 ml-auto opacity-70" />
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className={`${sidebarCollapsed ? 'p-2' : 'p-4'} border-t border-gray-200/50 dark:border-gray-700/50`}>
            {/* Quick Stats */}
            {!sidebarCollapsed && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 
                              rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {JSON.parse(localStorage.getItem('edutrack_notes') || '[]').length}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Notes</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 
                            rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {JSON.parse(localStorage.getItem('edutrack_tasks') || '[]').filter(t => t.completed).length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Done</p>
              </div>
            </div>
            )}

            {/* User Card */}
            <div 
              onClick={() => { navigate('/profile'); setSidebarOpen(false); }}
              className={`flex items-center ${sidebarCollapsed ? 'justify-center p-2' : 'gap-3 p-3'} rounded-xl cursor-pointer
                       bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800
                       transition-colors group`}
              title={sidebarCollapsed ? (user?.name || 'Profile') : undefined}
            >
              <div className="relative">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user?.name || 'User'}
                    className={`${sidebarCollapsed ? 'w-10 h-10' : 'w-11 h-11'} rounded-xl object-cover shadow-lg`}
                  />
                ) : (
                  <div className={`${sidebarCollapsed ? 'w-10 h-10' : 'w-11 h-11'} rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 
                                flex items-center justify-center text-white font-bold ${sidebarCollapsed ? 'text-base' : 'text-lg'} shadow-lg`}>
                    {user?.name?.charAt(0) || 'S'}
                  </div>
                )}
                <div className={`absolute -bottom-1 -right-1 ${sidebarCollapsed ? 'w-3 h-3' : 'w-4 h-4'} bg-green-500 rounded-full 
                              border-2 border-white dark:border-gray-800`} />
              </div>
              {!sidebarCollapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user?.name || 'Student'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email || 'student@edutrack.com'}
                    </p>
                  </div>
                  <User className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                </>
              )}
            </div>

            {/* Sign Out */}
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className={`flex items-center ${sidebarCollapsed ? 'justify-center p-2' : 'gap-2 px-3 py-2'} mt-3 w-full rounded-xl
                       text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
                       transition-colors text-sm font-medium`}
              title={sidebarCollapsed ? 'Sign Out' : undefined}
            >
              <LogOut className="w-4 h-4" />
              {!sidebarCollapsed && <span>Sign Out</span>}
            </button>

            {/* Collapse Toggle Button */}
            <button
              onClick={toggleSidebarCollapse}
              className={`hidden lg:flex items-center justify-center mt-3 w-full py-2.5 rounded-xl
                       bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700
                       text-gray-600 dark:text-gray-400 
                       transition-all duration-300 ease-out
                       hover:scale-[1.02] active:scale-[0.98]
                       border border-transparent hover:border-gray-300 dark:hover:border-gray-600`}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <PanelLeft className="w-5 h-5 transition-transform duration-300 hover:scale-110" />
              ) : (
                <>
                  <PanelLeftClose className="w-5 h-5 mr-2 transition-transform duration-300" />
                  <span className="text-xs font-medium">Collapse</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`${sidebarCollapsed ? 'lg:ml-[76px]' : 'lg:ml-72'} min-h-screen transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]`}>
        {/* Top Header */}
        <header className={`
          sticky top-0 z-30 transition-all duration-300 ease-out
          ${scrolled 
            ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/30' 
            : 'bg-transparent'
          }
          ${examModeActive ? 'border-b-2 border-amber-500' : ''}
        `}>
          <div className="flex items-center justify-between px-4 lg:px-6 py-3">
            {/* Left: Menu Button + Page Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-600 dark:text-gray-300 
                         hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl 
                         transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Menu size={24} />
              </button>
              
              {/* Current Page Indicator */}
              <div className="hidden sm:flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {navigation.find(n => isActive(n.path))?.name || 'Dashboard'}
                </span>
              </div>
            </div>

            {/* Real-Time Clock Display */}
            <div className="hidden md:flex items-center gap-4 px-5 py-2.5 ml-4 rounded-2xl
                          bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30
                          border border-indigo-100 dark:border-indigo-800/50
                          shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-800/50">
                  <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-gray-500 dark:text-gray-400 leading-none">
                    {formatDate(currentTime)}
                  </span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono tracking-wider leading-tight">
                    {formatTime(currentTime)}
                  </span>
                </div>
              </div>
              <div className="w-px h-10 bg-indigo-200 dark:bg-indigo-700/50" />
              <div className="flex flex-col items-center px-1">
                <span className="text-xl font-bold text-purple-600 dark:text-purple-400 leading-none">
                  {currentTime.getDate()}
                </span>
                <span className="text-[10px] uppercase font-semibold text-purple-500 dark:text-purple-400 leading-tight mt-0.5">
                  {currentTime.toLocaleDateString('en-US', { month: 'short' })}
                </span>
              </div>
            </div>

            {/* Center: Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (headerSearch.trim()) {
                  navigate(`/notes?search=${encodeURIComponent(headerSearch.trim())}`);
                  setHeaderSearch('');
                }
              }} className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  placeholder="Search notes, topics..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl
                           bg-gray-100/80 dark:bg-gray-800/80 
                           border border-transparent
                           focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                           focus:bg-white dark:focus:bg-gray-800
                           text-sm text-gray-900 dark:text-gray-100
                           placeholder:text-gray-400 dark:placeholder:text-gray-500
                           transition-all duration-300 ease-out"
                />
              </form>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5">
              {/* Focus Mode Toggle */}
              <button
                onClick={handleExamModeToggle}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm
                  transition-all duration-300 ease-out
                  hover:scale-105 active:scale-95
                  ${examModeActive 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40' 
                    : 'bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }
                `}
              >
                <Focus className={`w-4 h-4 transition-transform duration-300 ${examModeActive ? 'animate-pulse' : 'group-hover:rotate-12'}`} />
                <span className="hidden sm:inline">
                  {examModeActive ? 'Exit Focus' : 'Focus Mode'}
                </span>
              </button>
              
              {/* Notifications */}
              <div className="relative notifications-container">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNotifications(!showNotifications);
                  }}
                  className="relative p-2.5 text-gray-600 dark:text-gray-300 
                             hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl 
                             transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <Bell className="w-5 h-5 transition-transform duration-200 hover:rotate-12" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] 
                                   bg-red-500 text-white text-[10px] font-bold 
                                   rounded-full flex items-center justify-center px-1
                                   animate-bounce">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-96
                                bg-white dark:bg-gray-900 rounded-2xl shadow-2xl
                                border border-gray-200 dark:border-gray-700
                                overflow-hidden z-50 animate-slide-in">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700
                                  bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-indigo-500" />
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            Notifications
                          </h3>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 
                                           text-indigo-600 dark:text-indigo-400 
                                           text-xs font-medium rounded-full">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button 
                            onClick={markAllAsRead}
                            className="text-xs text-indigo-500 hover:text-indigo-600 
                                     dark:text-indigo-400 font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <div className="w-12 h-12 mx-auto mb-3 rounded-full 
                                        bg-gray-100 dark:bg-gray-800 
                                        flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            You're all caught up! 🎉
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            No new notifications
                          </p>
                        </div>
                      ) : (
                        notifications.map((notif) => {
                          const Icon = notif.icon;
                          return (
                            <div 
                              key={notif.id}
                              className={`
                                px-4 py-3 border-b border-gray-100 dark:border-gray-800
                                hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer
                                transition-colors
                                ${!notif.read ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}
                              `}
                              onClick={() => markAsRead(notif.id)}
                            >
                              <div className="flex gap-3">
                                <div className={`
                                  flex-shrink-0 w-10 h-10 rounded-xl 
                                  ${notif.bgColor}
                                  flex items-center justify-center
                                `}>
                                  <Icon className={`w-5 h-5 ${notif.iconColor}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className={`text-sm font-medium ${
                                      !notif.read 
                                        ? 'text-gray-900 dark:text-white' 
                                        : 'text-gray-600 dark:text-gray-300'
                                    }`}>
                                      {notif.title}
                                    </p>
                                    {!notif.read && (
                                      <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 
                                              mt-0.5 line-clamp-2">
                                    {notif.message}
                                  </p>
                                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                                    {notif.time}
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    clearNotification(notif.id);
                                  }}
                                  className="flex-shrink-0 p-1 text-gray-400 
                                           hover:text-gray-600 dark:hover:text-gray-300
                                           hover:bg-gray-200 dark:hover:bg-gray-700 
                                           rounded-lg transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700
                                  bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
                        📚 Notifications update based on your activity
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Scientific Calculator */}
              <div className="relative calculator-container">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCalculator(!showCalculator);
                    setShowNotepad(false);
                  }}
                  className="p-2.5 text-gray-600 dark:text-gray-300 
                             hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl 
                             transition-all duration-200 hover:scale-105 active:scale-95"
                  title="Scientific Calculator"
                >
                  <Calculator className="w-5 h-5 transition-transform duration-200 hover:rotate-12" />
                </button>

                {/* Calculator Dropdown */}
                {showCalculator && (
                  <div className="absolute right-0 top-full mt-2 w-64
                                bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-gray-300/50 dark:shadow-black/50
                                border border-gray-200 dark:border-gray-700
                                overflow-hidden z-50 
                                animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
                    {/* Calculator Header */}
                    <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700
                                  bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Calculator className="w-4 h-4 text-emerald-500" />
                          <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                            Scientific Calculator
                          </h3>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setCalcMode(calcMode === 'deg' ? 'rad' : 'deg')}
                            className={`px-2 py-1 text-[10px] font-bold rounded transition-all duration-200 ${
                              calcMode === 'deg' 
                                ? 'bg-emerald-500 text-white' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                            }`}
                          >
                            {calcMode.toUpperCase()}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Display */}
                    <div className="p-2 bg-gray-50 dark:bg-gray-800">
                      <div className="text-right text-[10px] text-gray-500 dark:text-gray-400 h-3 truncate">
                        {calcExpression || ' '}
                      </div>
                      <div className="text-right text-lg font-mono font-bold text-gray-900 dark:text-white truncate">
                        {calcDisplay}
                      </div>
                      {calcMemory !== 0 && (
                        <div className="text-right text-[10px] text-emerald-500">M = {calcMemory}</div>
                      )}
                    </div>

                    {/* Memory & Functions Row */}
                    <div className="grid grid-cols-5 gap-0.5 p-1.5 bg-gray-100 dark:bg-gray-800/50">
                      {['MC', 'MR', 'M+', 'M-', 'MS'].map(btn => (
                        <button
                          key={btn}
                          onClick={() => handleCalcMemory(btn)}
                          className="py-1 text-[9px] font-semibold rounded bg-gray-200 dark:bg-gray-700 
                                   text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          {btn}
                        </button>
                      ))}
                    </div>

                    {/* Scientific Functions */}
                    <div className="grid grid-cols-5 gap-0.5 p-1.5 border-t border-gray-200 dark:border-gray-700">
                      {['sin', 'cos', 'tan', 'log', 'ln'].map(func => (
                        <button
                          key={func}
                          onClick={() => handleCalcFunction(func)}
                          className="py-1.5 text-[10px] font-semibold rounded bg-indigo-100 dark:bg-indigo-900/30 
                                   text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800/50"
                        >
                          {func}
                        </button>
                      ))}
                      {['asin', 'acos', 'atan', 'sqrt', 'cbrt'].map(func => (
                        <button
                          key={func}
                          onClick={() => handleCalcFunction(func)}
                          className="py-1.5 text-[10px] font-semibold rounded bg-indigo-100 dark:bg-indigo-900/30 
                                   text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800/50"
                        >
                          {func === 'sqrt' ? '√' : func === 'cbrt' ? '∛' : func}
                        </button>
                      ))}
                      {['sinh', 'cosh', 'tanh', 'exp', 'abs'].map(func => (
                        <button
                          key={func}
                          onClick={() => handleCalcFunction(func)}
                          className="py-1.5 text-[10px] font-semibold rounded bg-indigo-100 dark:bg-indigo-900/30 
                                   text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800/50"
                        >
                          {func}
                        </button>
                      ))}
                    </div>

                    {/* Power & Special */}
                    <div className="grid grid-cols-5 gap-0.5 px-1.5 pb-0.5">
                      <button onClick={() => handleCalcPower(2)} className="py-1.5 text-[10px] font-semibold rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200">x²</button>
                      <button onClick={() => handleCalcPower(3)} className="py-1.5 text-[10px] font-semibold rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200">x³</button>
                      <button onClick={() => handleCalcOperator('^')} className="py-1.5 text-[10px] font-semibold rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200">xʸ</button>
                      <button onClick={() => setCalcDisplay(Math.PI.toString())} className="py-1.5 text-[10px] font-semibold rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200">π</button>
                      <button onClick={() => setCalcDisplay(Math.E.toString())} className="py-1.5 text-[10px] font-semibold rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200">e</button>
                    </div>

                    {/* Main Keypad */}
                    <div className="grid grid-cols-4 gap-0.5 p-1.5 border-t border-gray-200 dark:border-gray-700">
                      <button onClick={handleCalcClear} className="py-2 text-xs font-bold rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200">AC</button>
                      <button onClick={() => handleCalcFunction('fact')} className="py-2 text-xs font-bold rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300">n!</button>
                      <button onClick={() => { const num = parseFloat(calcDisplay); setCalcDisplay((1/num).toString()); }} className="py-2 text-xs font-bold rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300">1/x</button>
                      <button onClick={() => handleCalcOperator('÷')} className="py-2 text-xs font-bold rounded bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200">÷</button>
                      
                      {['7', '8', '9'].map(num => (
                        <button key={num} onClick={() => handleCalcInput(num)} className="py-2 text-sm font-semibold rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700">{num}</button>
                      ))}
                      <button onClick={() => handleCalcOperator('×')} className="py-2 text-xs font-bold rounded bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200">×</button>
                      
                      {['4', '5', '6'].map(num => (
                        <button key={num} onClick={() => handleCalcInput(num)} className="py-2 text-sm font-semibold rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700">{num}</button>
                      ))}
                      <button onClick={() => handleCalcOperator('-')} className="py-2 text-xs font-bold rounded bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200">−</button>
                      
                      {['1', '2', '3'].map(num => (
                        <button key={num} onClick={() => handleCalcInput(num)} className="py-2 text-sm font-semibold rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700">{num}</button>
                      ))}
                      <button onClick={() => handleCalcOperator('+')} className="py-2 text-xs font-bold rounded bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200">+</button>
                      
                      <button onClick={() => { const num = parseFloat(calcDisplay); setCalcDisplay((-num).toString()); }} className="py-2 text-sm font-semibold rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700">±</button>
                      <button onClick={() => handleCalcInput('0')} className="py-2 text-sm font-semibold rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700">0</button>
                      <button onClick={() => handleCalcInput('.')} className="py-2 text-sm font-semibold rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700">.</button>
                      <button onClick={handleCalcEquals} className="py-2 text-xs font-bold rounded bg-emerald-500 text-white hover:bg-emerald-600">=</button>
                    </div>

                    {/* History */}
                    {calcHistory.length > 0 && (
                      <div className="max-h-24 overflow-y-auto border-t border-gray-200 dark:border-gray-700">
                        <div className="px-3 py-1 text-[10px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                          History
                        </div>
                        {calcHistory.slice().reverse().map((item, idx) => (
                          <div key={idx} className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                               onClick={() => { setCalcDisplay(item.result); setIsNewNumber(true); }}>
                            <span className="text-gray-400">{item.expression} = </span>
                            <span className="font-semibold text-gray-900 dark:text-white">{item.result}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Notepad */}
              <div className="relative notepad-container">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNotepad(!showNotepad);
                    setShowCalculator(false);
                  }}
                  className="p-2.5 text-gray-600 dark:text-gray-300 
                             hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl 
                             transition-all duration-200 hover:scale-105 active:scale-95"
                  title="Quick Notepad"
                >
                  <StickyNote className="w-5 h-5 transition-transform duration-200 hover:rotate-12" />
                </button>

                {/* Notepad Dropdown */}
                {showNotepad && (
                  <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[420px]
                                bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-gray-300/50 dark:shadow-black/50
                                border border-gray-200 dark:border-gray-700
                                overflow-hidden z-50 
                                animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
                    {/* Notepad Header */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700
                                  bg-gradient-to-r from-amber-500/10 to-orange-500/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StickyNote className="w-5 h-5 text-amber-500" />
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            Quick Notes
                          </h3>
                          <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 
                                         text-amber-600 dark:text-amber-400 
                                         text-[10px] font-medium rounded-full">
                            {notes.length} notes
                          </span>
                        </div>
                        <button
                          onClick={addNewNote}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium
                                   text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 
                                   rounded-lg transition-all duration-200 hover:scale-105"
                          title="Add new note"
                        >
                          <Plus className="w-4 h-4" />
                          <span className="hidden sm:inline">New</span>
                        </button>
                      </div>
                    </div>

                    {/* Note Tabs - Horizontal Scrollable */}
                    <div className="flex gap-1.5 p-2 bg-gray-50 dark:bg-gray-800/50 overflow-x-auto 
                                  scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                      {notes.map(note => (
                        <button
                          key={note.id}
                          className={`
                            flex items-center gap-1.5 px-3 py-2 rounded-lg
                            text-xs font-medium whitespace-nowrap transition-all
                            min-w-[80px] justify-center
                            ${activeNoteId === note.id 
                              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30' 
                              : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 border border-gray-200 dark:border-gray-600'}
                          `}
                          onClick={() => setActiveNoteId(note.id)}
                        >
                          <FileText className="w-3 h-3" />
                          <span className="max-w-[60px] truncate">{note.title}</span>
                        </button>
                      ))}
                    </div>

                    {/* Active Note Title (Editable) */}
                    <div className="px-3 pt-3 pb-1">
                      <input
                        type="text"
                        value={notes.find(n => n.id === activeNoteId)?.title || ''}
                        onChange={(e) => renameNote(activeNoteId, e.target.value)}
                        className="w-full px-3 py-2 text-sm font-semibold rounded-lg
                                 bg-gray-100 dark:bg-gray-800 
                                 text-gray-900 dark:text-white
                                 border border-transparent
                                 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20
                                 transition-all"
                        placeholder="Note title..."
                      />
                    </div>

                    {/* Note Content */}
                    <div className="px-3 pb-2">
                      <textarea
                        value={noteContent}
                        onChange={(e) => handleNoteChange(e.target.value)}
                        placeholder="Start typing your notes here...

✏️ Great for:
• Quick formulas & equations
• Important reminders
• Code snippets
• Lecture points
• Todo lists"
                        className="w-full h-44 p-3 text-sm rounded-xl resize-none
                                 bg-gray-50 dark:bg-gray-800 
                                 text-gray-900 dark:text-gray-100
                                 placeholder:text-gray-400 dark:placeholder:text-gray-500
                                 border border-gray-200 dark:border-gray-700
                                 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20
                                 transition-all leading-relaxed"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="px-3 pb-3 flex gap-2">
                      <button
                        onClick={() => {
                          handleNoteChange(noteContent);
                          toast.success('Note saved!');
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5
                                 bg-emerald-500 hover:bg-emerald-600 text-white
                                 rounded-xl text-sm font-medium transition-colors shadow-md shadow-emerald-500/30"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setNoteContent('');
                          handleNoteChange('');
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2.5
                                 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600
                                 text-gray-700 dark:text-gray-300
                                 rounded-xl text-sm font-medium transition-colors"
                        title="Clear note content"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Clear
                      </button>
                      <button
                        onClick={() => {
                          if (notes.length <= 1) {
                            toast.error('Cannot delete the last note');
                            return;
                          }
                          if (confirm('Delete this note?')) {
                            deleteNote(activeNoteId);
                          }
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2.5
                                 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/50
                                 text-red-600 dark:text-red-400
                                 rounded-xl text-sm font-medium transition-colors"
                        title="Delete this note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Notepad Footer */}
                    <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700
                                  bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">
                        {noteContent.length} chars • {noteContent.split(/\s+/).filter(Boolean).length} words
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                          {notes.find(n => n.id === activeNoteId)?.updatedAt 
                            ? `Updated ${new Date(notes.find(n => n.id === activeNoteId).updatedAt).toLocaleTimeString()}`
                            : 'New note'}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-500">
                          <CheckCircle className="w-3 h-3" />
                          Auto-saved
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2.5 text-gray-600 dark:text-gray-300 
                         hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl 
                         transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-amber-500 transition-transform duration-500 hover:rotate-180" />
                ) : (
                  <Moon className="w-5 h-5 transition-transform duration-500 hover:-rotate-12" />
                )}
              </button>

              {/* Mobile Profile */}
              <button
                onClick={() => navigate('/profile')}
                className="lg:hidden p-1 transition-transform duration-200 hover:scale-105 active:scale-95"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 
                              flex items-center justify-center text-white font-bold text-sm
                              shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40
                              transition-all duration-300">
                  {user?.name?.charAt(0) || 'S'}
                </div>
              </button>

              {/* Mobile Sign Out */}
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="lg:hidden p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6 transition-all duration-300">
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default StudentLayout;
