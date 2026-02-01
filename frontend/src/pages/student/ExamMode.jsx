import { useState, useEffect, useCallback } from 'react';
import StudentLayout from '../../components/layout/StudentLayout';
import Card from '../../components/common/Card';
import { 
  Target, BookOpen, Clock, CheckCircle, XCircle, ChevronRight, RotateCcw,
  Calendar, AlertTriangle, Brain, Zap, TrendingUp, Star, Heart, Coffee,
  Play, Pause, Plus, Trash2, Edit2, X, Award, Bookmark, BookmarkCheck,
  Volume2, VolumeX, Eye, EyeOff, ArrowLeft, Timer, Flame, BarChart3,
  Sparkles, Trophy, Save, Rocket, FileText, RefreshCw, Lightbulb, Loader
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getData, saveData } from '../../services/userDataService';

const API_URL = 'http://localhost:5000/api';

// Default subjects that have question banks
const DEFAULT_SUBJECTS = ['Data Structures', 'Database Systems', 'Operating Systems'];

// Question Bank with difficulty levels
const QUESTION_BANK = {
  'Data Structures': {
    easy: [
      { _id: 'ds1', question: 'What data structure uses LIFO principle?', options: ['Queue', 'Stack', 'Array', 'Tree'], correctAnswer: 1, explanation: 'Stack follows Last In First Out (LIFO) principle.' },
      { _id: 'ds2', question: 'What data structure uses FIFO principle?', options: ['Stack', 'Queue', 'Heap', 'Graph'], correctAnswer: 1, explanation: 'Queue follows First In First Out (FIFO) principle.' },
      { _id: 'ds3', question: 'Array index starts from?', options: ['0', '1', '-1', 'Any number'], correctAnswer: 0, explanation: 'In most programming languages, array indexing starts from 0.' },
    ],
    medium: [
      { _id: 'ds4', question: 'Time complexity of Binary Search?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], correctAnswer: 2, explanation: 'Binary Search has O(log n) as it halves the search space each iteration.' },
      { _id: 'ds5', question: 'Which traversal gives BST elements in sorted order?', options: ['Preorder', 'Inorder', 'Postorder', 'Level order'], correctAnswer: 1, explanation: 'Inorder traversal (Left-Root-Right) gives sorted elements.' },
      { _id: 'ds6', question: 'Space complexity of recursive Fibonacci?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(2^n)'], correctAnswer: 1, explanation: 'Recursive Fibonacci has O(n) space due to call stack depth.' },
    ],
    hard: [
      { _id: 'ds7', question: 'Time complexity of building a heap?', options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(n²)'], correctAnswer: 0, explanation: 'Building a heap from an array is O(n) using bottom-up approach.' },
      { _id: 'ds8', question: 'Worst case of QuickSort occurs when?', options: ['Array is sorted', 'Array is random', 'Array has duplicates', 'Array is empty'], correctAnswer: 0, explanation: 'QuickSort has O(n²) worst case when array is already sorted and pivot is first/last element.' },
    ]
  },
  'Database Systems': {
    easy: [
      { _id: 'db1', question: 'SQL stands for?', options: ['Structured Query Language', 'Simple Query Language', 'Standard Query Language', 'None'], correctAnswer: 0, explanation: 'SQL stands for Structured Query Language.' },
      { _id: 'db2', question: 'Which command is used to retrieve data?', options: ['INSERT', 'UPDATE', 'SELECT', 'DELETE'], correctAnswer: 2, explanation: 'SELECT is used to retrieve data from database.' },
    ],
    medium: [
      { _id: 'db3', question: 'ACID stands for?', options: ['Atomicity, Consistency, Isolation, Durability', 'Accuracy, Consistency, Integrity, Durability', 'None', 'All'], correctAnswer: 0, explanation: 'ACID ensures reliable database transactions.' },
      { _id: 'db4', question: 'Which normal form removes partial dependencies?', options: ['1NF', '2NF', '3NF', 'BCNF'], correctAnswer: 1, explanation: '2NF removes partial dependencies on primary key.' },
    ],
    hard: [
      { _id: 'db5', question: 'Phantom read occurs in which isolation level?', options: ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'None'], correctAnswer: 2, explanation: 'Phantom reads can occur in Repeatable Read isolation level.' },
    ]
  },
  'Operating Systems': {
    easy: [
      { _id: 'os1', question: 'CPU scheduling is done by?', options: ['Hardware', 'Operating System', 'User', 'Application'], correctAnswer: 1, explanation: 'OS kernel handles CPU scheduling.' },
      { _id: 'os2', question: 'What is a process?', options: ['Program in execution', 'Stored program', 'Hardware', 'Memory'], correctAnswer: 0, explanation: 'A process is a program in execution.' },
    ],
    medium: [
      { _id: 'os3', question: 'Which scheduling has convoy effect?', options: ['SJF', 'FCFS', 'Round Robin', 'Priority'], correctAnswer: 1, explanation: 'FCFS can cause convoy effect where short processes wait behind long ones.' },
      { _id: 'os4', question: 'Deadlock requires how many conditions?', options: ['2', '3', '4', '5'], correctAnswer: 2, explanation: 'Deadlock requires 4 conditions: Mutual exclusion, Hold & wait, No preemption, Circular wait.' },
    ],
    hard: [
      { _id: 'os5', question: 'Belady\'s anomaly occurs in?', options: ['LRU', 'FIFO', 'Optimal', 'LFU'], correctAnswer: 1, explanation: 'FIFO page replacement can show Belady\'s anomaly where more frames cause more page faults.' },
    ]
  }
};

// Motivational quotes for stress relief
const MOTIVATIONAL_QUOTES = [
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { quote: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { quote: "The expert in anything was once a beginner.", author: "Helen Hayes" },
];

// Breathing exercise steps
const BREATHING_STEPS = [
  { action: 'Breathe In', duration: 4, color: 'bg-blue-500' },
  { action: 'Hold', duration: 4, color: 'bg-purple-500' },
  { action: 'Breathe Out', duration: 4, color: 'bg-green-500' },
  { action: 'Hold', duration: 2, color: 'bg-orange-500' },
];

function ExamMode() {
  // Main tabs
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Custom subjects state
  const [customSubjects, setCustomSubjects] = useState([]);
  const [showCustomInput, setShowCustomInput] = useState(null); // 'exam', 'note'
  const [newCustomSubject, setNewCustomSubject] = useState('');
  
  // AI-powered state
  const [aiRevisionNotes, setAiRevisionNotes] = useState([]);
  const [aiExamReady, setAiExamReady] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(true);
  
  // Get all subjects (default + custom)
  const ALL_SUBJECTS = [...DEFAULT_SUBJECTS, ...customSubjects];

  // Fetch AI revision notes on mount
  useEffect(() => {
    fetchAIRevisionData();
  }, []);

  // Fetch AI-powered revision data
  const fetchAIRevisionData = async () => {
    try {
      setAiLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // Fetch last 24h revision notes
      const revisionRes = await fetch(`${API_URL}/ai/revision-24h`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const revisionData = await revisionRes.json();
      if (revisionData.success) {
        setAiRevisionNotes(revisionData.data);
      }
      
      // Fetch exam-ready notes
      const examRes = await fetch(`${API_URL}/ai/exam-ready?minScore=70`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const examData = await examRes.json();
      if (examData.success) {
        setAiExamReady(examData.data);
      }
    } catch (error) {
      console.log('AI features not available');
    } finally {
      setAiLoading(false);
    }
  };

  // Add custom subject
  const addCustomSubjectHandler = async (formType, setForm, form) => {
    if (newCustomSubject.trim() && !ALL_SUBJECTS.includes(newCustomSubject.trim())) {
      const updated = [...customSubjects, newCustomSubject.trim()];
      setCustomSubjects(updated);
      await saveData('custom_subjects', updated);
      setForm({ ...form, subject: newCustomSubject.trim() });
      setNewCustomSubject('');
      setShowCustomInput(null);
      toast.success('Subject added!');
    }
  };
  
  // Default exam data
  const DEFAULT_EXAMS = [
    { _id: '1', name: 'Data Structures Mid-Term', subject: 'Data Structures', date: '2026-02-15', time: '10:00' },
    { _id: '2', name: 'Database Final', subject: 'Database Systems', date: '2026-02-20', time: '14:00' },
  ];
  
  const DEFAULT_NOTES = [
    { _id: '1', subject: 'Data Structures', title: 'Big O Notation', content: 'O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2^n)' },
    { _id: '2', subject: 'Database Systems', title: 'Normal Forms', content: '1NF: Atomic values\n2NF: No partial dependency\n3NF: No transitive dependency\nBCNF: Every determinant is a key' },
  ];
  
  // Exams state
  const [exams, setExams] = useState(DEFAULT_EXAMS);
  const [showExamModal, setShowExamModal] = useState(false);
  const [examForm, setExamForm] = useState({ name: '', subject: '', date: '', time: '' });

  // Quick Notes state
  const [quickNotes, setQuickNotes] = useState(DEFAULT_NOTES);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteForm, setNoteForm] = useState({ subject: '', title: '', content: '' });

  // Practice state
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceSubject, setPracticeSubject] = useState('');
  const [practiceDifficulty, setPracticeDifficulty] = useState('medium');
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [practiceScore, setPracticeScore] = useState({ correct: 0, wrong: 0 });
  const [practiceTimer, setPracticeTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Bookmarked questions
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState([]);

  // Exam history
  const [examHistory, setExamHistory] = useState([]);

  // Study streak
  const [studyStreak, setStudyStreak] = useState({ 
    currentStreak: 0, 
    lastStudyDate: null,
    totalDaysStudied: 0 
  });

  // Relaxation state
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingStep, setBreathingStep] = useState(0);
  const [breathingTimer, setBreathingTimer] = useState(0);

  // Load data from backend on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const examData = await getData('exam_mode_data', {
          exams: DEFAULT_EXAMS,
          quickNotes: DEFAULT_NOTES,
          bookmarkedQuestions: [],
          examHistory: []
        });
        
        const subjectsData = await getData('custom_subjects', []);
        const streakData = await getData('study_streak', { 
          currentStreak: 0, 
          lastStudyDate: null,
          totalDaysStudied: 0 
        });
        
        setExams(examData.exams || DEFAULT_EXAMS);
        setQuickNotes(examData.quickNotes || DEFAULT_NOTES);
        setBookmarkedQuestions(examData.bookmarkedQuestions || []);
        setExamHistory(examData.examHistory || []);
        setCustomSubjects(subjectsData);
        
        // Handle study streak format
        if (typeof streakData === 'object') {
          setStudyStreak(streakData.days !== undefined ? { currentStreak: streakData.days, lastStudyDate: streakData.lastStudyDate, totalDaysStudied: 0 } : streakData);
        }
      } catch (error) {
        console.error('Failed to load exam mode data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Save exam mode data to backend
  const saveExamModeData = useCallback(async (newExams, newQuickNotes, newBookmarked, newHistory) => {
    await saveData('exam_mode_data', {
      exams: newExams !== undefined ? newExams : exams,
      quickNotes: newQuickNotes !== undefined ? newQuickNotes : quickNotes,
      bookmarkedQuestions: newBookmarked !== undefined ? newBookmarked : bookmarkedQuestions,
      examHistory: newHistory !== undefined ? newHistory : examHistory
    });
  }, [exams, quickNotes, bookmarkedQuestions, examHistory]);

  // Practice timer
  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => setPracticeTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Breathing exercise timer
  useEffect(() => {
    let interval;
    if (breathingActive) {
      interval = setInterval(() => {
        setBreathingTimer(t => {
          if (t >= BREATHING_STEPS[breathingStep].duration) {
            setBreathingStep(s => (s + 1) % BREATHING_STEPS.length);
            return 0;
          }
          return t + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [breathingActive, breathingStep]);

  // Update study streak
  useEffect(() => {
    const today = new Date().toDateString();
    if (studyStreak.lastStudyDate !== today && practiceMode) {
      setStudyStreak(prev => ({
        currentStreak: prev.lastStudyDate === new Date(Date.now() - 86400000).toDateString() ? prev.currentStreak + 1 : 1,
        lastStudyDate: today,
        totalDaysStudied: prev.totalDaysStudied + 1
      }));
    }
  }, [practiceMode]);

  // Calculate days until exam
  const getDaysUntil = (dateStr) => {
    const examDate = new Date(dateStr);
    const today = new Date();
    const diff = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start practice
  const startPractice = () => {
    if (!practiceSubject) {
      toast.error('Please select a subject');
      return;
    }
    
    const subjectQuestions = QUESTION_BANK[practiceSubject];
    if (!subjectQuestions) {
      toast.error('No questions available for this subject');
      return;
    }

    let questions = [];
    if (practiceDifficulty === 'mixed') {
      questions = [...(subjectQuestions.easy || []), ...(subjectQuestions.medium || []), ...(subjectQuestions.hard || [])];
    } else {
      questions = subjectQuestions[practiceDifficulty] || [];
    }

    if (questions.length === 0) {
      toast.error('No questions available for this difficulty');
      return;
    }

    // Shuffle questions
    questions = questions.sort(() => Math.random() - 0.5);
    
    setPracticeQuestions(questions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setPracticeScore({ correct: 0, wrong: 0 });
    setPracticeTimer(0);
    setIsTimerRunning(true);
    setPracticeMode(true);
    toast.success('Practice started! Good luck! 🎯');
  };

  // Submit answer
  const submitAnswer = () => {
    if (selectedAnswer === null) {
      toast.error('Please select an answer');
      return;
    }

    const currentQ = practiceQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQ.correctAnswer;
    
    if (isCorrect) {
      setPracticeScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      toast.success('Correct! 🎉');
    } else {
      setPracticeScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
      toast.error('Wrong answer');
    }
    
    setShowAnswer(true);
  };

  // Next question
  const nextQuestion = () => {
    if (currentQuestionIndex < practiceQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    } else {
      // End practice
      endPractice();
    }
  };

  // End practice
  const endPractice = async () => {
    setIsTimerRunning(false);
    const result = {
      _id: Date.now().toString(),
      subject: practiceSubject,
      difficulty: practiceDifficulty,
      correct: practiceScore.correct,
      total: practiceQuestions.length,
      percentage: Math.round((practiceScore.correct / practiceQuestions.length) * 100),
      timeSpent: practiceTimer,
      date: new Date().toISOString()
    };
    const newHistory = [result, ...examHistory];
    setExamHistory(newHistory);
    await saveExamModeData(undefined, undefined, undefined, newHistory);
    setPracticeMode(false);
    toast.success(`Practice completed! Score: ${result.percentage}%`);
  };

  // Toggle bookmark
  const toggleBookmark = async (question) => {
    const isBookmarked = bookmarkedQuestions.some(q => q._id === question._id);
    let newBookmarks;
    if (isBookmarked) {
      newBookmarks = bookmarkedQuestions.filter(q => q._id !== question._id);
      toast.success('Removed from bookmarks');
    } else {
      newBookmarks = [...bookmarkedQuestions, { ...question, subject: practiceSubject }];
      toast.success('Added to bookmarks');
    }
    setBookmarkedQuestions(newBookmarks);
    await saveExamModeData(undefined, undefined, newBookmarks, undefined);
  };

  // Add exam
  const addExam = async () => {
    if (!examForm.name || !examForm.date) {
      toast.error('Please fill required fields');
      return;
    }
    const newExam = { _id: Date.now().toString(), ...examForm };
    const newExams = [...exams, newExam];
    setExams(newExams);
    await saveExamModeData(newExams, undefined, undefined, undefined);
    setShowExamModal(false);
    setExamForm({ name: '', subject: '', date: '', time: '' });
    toast.success('Exam added!');
  };

  // Delete exam
  const deleteExam = async (id) => {
    const newExams = exams.filter(e => e._id !== id);
    setExams(newExams);
    await saveExamModeData(newExams, undefined, undefined, undefined);
  };

  // Add quick note
  const addQuickNote = async () => {
    if (!noteForm.title || !noteForm.content) {
      toast.error('Please fill all fields');
      return;
    }
    const newNote = { _id: Date.now().toString(), ...noteForm };
    const newNotes = [...quickNotes, newNote];
    setQuickNotes(newNotes);
    await saveExamModeData(undefined, newNotes, undefined, undefined);
    setShowNoteModal(false);
    setNoteForm({ subject: '', title: '', content: '' });
    toast.success('Quick note added!');
  };

  // Delete quick note
  const deleteQuickNote = async (id) => {
    const newNotes = quickNotes.filter(n => n._id !== id);
    setQuickNotes(newNotes);
    await saveExamModeData(undefined, newNotes, undefined, undefined);
  };

  // Delete bookmark
  const deleteBookmark = async (id) => {
    const newBookmarks = bookmarkedQuestions.filter(q => q._id !== id);
    setBookmarkedQuestions(newBookmarks);
    await saveExamModeData(undefined, undefined, newBookmarks, undefined);
  };

  // Get random quote
  const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

  // Calculate overall stats
  const overallStats = {
    totalPractice: examHistory.length,
    avgScore: examHistory.length > 0 ? Math.round(examHistory.reduce((a, b) => a + b.percentage, 0) / examHistory.length) : 0,
    totalQuestions: examHistory.reduce((a, b) => a + b.total, 0),
    correctAnswers: examHistory.reduce((a, b) => a + b.correct, 0)
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'from-indigo-500 to-purple-600' },
    { id: 'ai-revision', label: 'AI Revision', icon: Sparkles, color: 'from-violet-500 to-purple-600', badge: 'AI' },
    { id: 'practice', label: 'Practice', icon: Brain, color: 'from-pink-500 to-rose-600' },
    { id: 'quicknotes', label: 'Quick Notes', icon: Zap, color: 'from-amber-500 to-orange-600' },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark, color: 'from-cyan-500 to-blue-600' },
    { id: 'relax', label: 'Stress Relief', icon: Heart, color: 'from-rose-500 to-pink-600' },
  ];

  // Loading state
  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <Loader className="w-6 h-6 animate-spin" />
            <span>Loading exam mode...</span>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 via-pink-600 to-purple-600 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Target className="w-12 h-12" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Exam Mode</h1>
                <p className="text-white/80 mt-2 max-w-md">Prepare, Practice, and Ace your exams!</p>
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                    <Flame className="w-4 h-4 text-orange-300" />
                    <span className="text-sm font-medium">{studyStreak.currentStreak} Day Streak</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                    <Trophy className="w-4 h-4 text-amber-300" />
                    <span className="text-sm font-medium">{overallStats.avgScore}% Avg Score</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                    <Brain className="w-4 h-4" />
                    <span className="text-sm font-medium">{overallStats.totalPractice} Sessions</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Action */}
            <button
              onClick={() => setActiveTab('practice')}
              className="flex items-center gap-2 px-6 py-3 bg-white text-rose-600 rounded-xl hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold group"
            >
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Start Practice
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-2 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); if (practiceMode && tab.id !== 'practice') { if (confirm('Exit practice?')) { setPracticeMode(false); setIsTimerRunning(false); } else return; } }}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md ${
                    activeTab === tab.id ? 'bg-white/30 text-white' : 'bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ==================== DASHBOARD TAB ==================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Upcoming Exams */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Exams
                </h2>
                <button
                  onClick={() => setShowExamModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Exam
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exams.sort((a, b) => new Date(a.date) - new Date(b.date)).map(exam => {
                  const daysLeft = getDaysUntil(exam.date);
                  const isUrgent = daysLeft <= 3;
                  const isPast = daysLeft < 0;
                  
                  return (
                    <Card key={exam._id} className={`${isUrgent && !isPast ? 'border-2 border-red-500' : ''} ${isPast ? 'opacity-50' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{exam.name}</h3>
                          <p className="text-sm text-gray-500">{exam.subject}</p>
                        </div>
                        <button
                          onClick={() => deleteExam(exam._id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          {new Date(exam.date).toLocaleDateString()}
                          {exam.time && ` at ${exam.time}`}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          isPast ? 'bg-gray-200 text-gray-600' :
                          isUrgent ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                          daysLeft <= 7 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                          'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        }`}>
                          {isPast ? 'Done' : `${daysLeft} days left`}
                        </span>
                      </div>
                      {isUrgent && !isPast && (
                        <div className="mt-2 flex items-center gap-1 text-red-600 text-sm">
                          <AlertTriangle className="w-4 h-4" />
                          Exam coming soon!
                        </div>
                      )}
                    </Card>
                  );
                })}
                
                {exams.length === 0 && (
                  <Card className="col-span-full text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No exams scheduled</p>
                  </Card>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center">
                <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{overallStats.totalPractice}</p>
                <p className="text-sm text-gray-500">Practice Sessions</p>
              </Card>
              <Card className="text-center">
                <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{overallStats.avgScore}%</p>
                <p className="text-sm text-gray-500">Average Score</p>
              </Card>
              <Card className="text-center">
                <CheckCircle className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{overallStats.correctAnswers}</p>
                <p className="text-sm text-gray-500">Correct Answers</p>
              </Card>
              <Card className="text-center">
                <Bookmark className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{bookmarkedQuestions.length}</p>
                <p className="text-sm text-gray-500">Bookmarked</p>
              </Card>
            </div>

            {/* Recent Performance */}
            {examHistory.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {examHistory.slice(0, 6).map(result => (
                    <Card key={result._id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{result.subject}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          result.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                          result.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {result.difficulty}
                        </span>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">{result.percentage}%</p>
                          <p className="text-sm text-gray-500">{result.correct}/{result.total} correct</p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>{formatTime(result.timeSpent)}</p>
                          <p>{new Date(result.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Motivational Quote */}
            <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
              <div className="flex items-start gap-4">
                <Star className="w-10 h-10 flex-shrink-0" />
                <div>
                  <p className="text-lg italic">"{randomQuote.quote}"</p>
                  <p className="text-sm mt-2 opacity-75">— {randomQuote.author}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ==================== AI REVISION TAB ==================== */}
        {activeTab === 'ai-revision' && (
          <div className="space-y-6">
            {/* AI Revision Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl text-white">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI-Powered Revision</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Intelligent study recommendations based on your notes</p>
                </div>
              </div>
              <button
                onClick={fetchAIRevisionData}
                disabled={aiLoading}
                className="flex items-center gap-2 px-4 py-2 bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 rounded-xl hover:bg-violet-200 dark:hover:bg-violet-900 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {/* Last 24 Hours Revision */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <h3 className="font-semibold">Last 24 Hours - Revision Focus</h3>
                  </div>
                  <span className="text-sm bg-white/20 px-2 py-0.5 rounded-full">
                    {aiRevisionNotes.length} notes
                  </span>
                </div>
              </div>
              <div className="p-5">
                {aiLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full"></div>
                  </div>
                ) : aiRevisionNotes.length > 0 ? (
                  <div className="space-y-3">
                    {aiRevisionNotes.map((note, idx) => (
                      <div 
                        key={note._id || idx}
                        className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors cursor-pointer"
                        onClick={() => window.location.href = `/notes/${note._id}`}
                      >
                        <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-lg">
                          <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">{note.title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {note.aiSummary?.short || note.description || 'No description'}
                          </p>
                        </div>
                        {note.aiScore?.examRelevance && (
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              note.aiScore.examRelevance >= 80 ? 'text-emerald-600' :
                              note.aiScore.examRelevance >= 60 ? 'text-amber-600' : 'text-gray-500'
                            }`}>
                              {note.aiScore.examRelevance}%
                            </div>
                            <p className="text-xs text-gray-500">Exam Relevance</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No notes updated in the last 24 hours</p>
                    <p className="text-sm mt-1">Keep studying to see recommendations here!</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Exam-Ready Notes */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-5 py-3">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <h3 className="font-semibold">Exam-Ready Notes (70%+ Score)</h3>
                  </div>
                  <span className="text-sm bg-white/20 px-2 py-0.5 rounded-full">
                    {aiExamReady.length} notes
                  </span>
                </div>
              </div>
              <div className="p-5">
                {aiLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full"></div>
                  </div>
                ) : aiExamReady.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aiExamReady.slice(0, 6).map((note, idx) => (
                      <div 
                        key={note._id || idx}
                        className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800"
                        onClick={() => window.location.href = `/notes/${note._id}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">{note.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {note.subject || 'General'}
                            </p>
                          </div>
                          <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
                            note.aiScore?.overall >= 85 ? 'bg-emerald-500 text-white' : 'bg-emerald-200 text-emerald-700'
                          }`}>
                            {note.aiScore?.overall || 0}%
                          </div>
                        </div>
                        {note.aiTags && note.aiTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {note.aiTags.slice(0, 2).map((tag, i) => (
                              <span key={i} className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs rounded-md">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No exam-ready notes found</p>
                    <p className="text-sm mt-1">Analyze your notes to discover high-value content!</p>
                  </div>
                )}
              </div>
            </Card>

            {/* AI Study Tips */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">AI Study Tips</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">🎯 Focus on High-Value Topics</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Notes with 70%+ exam relevance score are most likely to appear in exams. Prioritize these during revision.
                  </p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">📝 Review Definitions & Formulas</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Notes tagged as "definition-rich" or "formula-heavy" are essential for quick reference questions.
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <h4 className="font-medium text-emerald-800 dark:text-emerald-200 mb-2">⏰ Use Active Recall</h4>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    After reading a note, close it and try to recall key points. This strengthens memory retention.
                  </p>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                  <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">🔄 Spaced Repetition</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Review notes at increasing intervals (1 day, 3 days, 1 week) for long-term retention.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ==================== PRACTICE TAB ==================== */}
        {activeTab === 'practice' && !practiceMode && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                Start Practice Session
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Subject
                  </label>
                  <select
                    value={practiceSubject}
                    onChange={(e) => setPracticeSubject(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Choose a subject</option>
                    {Object.keys(QUESTION_BANK).map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['easy', 'medium', 'hard', 'mixed'].map(level => (
                      <button
                        key={level}
                        onClick={() => setPracticeDifficulty(level)}
                        className={`px-4 py-2 rounded-lg font-medium capitalize ${
                          practiceDifficulty === level
                            ? level === 'easy' ? 'bg-green-500 text-white' :
                              level === 'medium' ? 'bg-yellow-500 text-white' :
                              level === 'hard' ? 'bg-red-500 text-white' :
                              'bg-purple-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={startPractice}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-semibold mt-6"
                >
                  <Play className="w-6 h-6" />
                  Start Practice
                </button>
              </div>
            </Card>

            {/* Tips */}
            <Card className="bg-blue-50 dark:bg-blue-900/20">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 Practice Tips</h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Start with easy questions to build confidence</li>
                <li>• Bookmark difficult questions to revisit later</li>
                <li>• Read explanations even for correct answers</li>
                <li>• Practice in short sessions (15-20 mins)</li>
                <li>• Mix difficulties to simulate real exams</li>
              </ul>
            </Card>
          </div>
        )}

        {/* Practice Mode Active */}
        {activeTab === 'practice' && practiceMode && practiceQuestions.length > 0 && (
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Progress Bar */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Question {currentQuestionIndex + 1} of {practiceQuestions.length}
              </span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" /> {practiceScore.correct}
                </span>
                <span className="flex items-center gap-1 text-red-600">
                  <XCircle className="w-4 h-4" /> {practiceScore.wrong}
                </span>
                <span className="flex items-center gap-1 text-blue-600">
                  <Timer className="w-4 h-4" /> {formatTime(practiceTimer)}
                </span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestionIndex + 1) / practiceQuestions.length) * 100}%` }}
              />
            </div>

            {/* Question Card */}
            <Card className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  practiceDifficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  practiceDifficulty === 'hard' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {practiceDifficulty}
                </span>
                <button
                  onClick={() => toggleBookmark(practiceQuestions[currentQuestionIndex])}
                  className={`p-2 rounded-lg ${
                    bookmarkedQuestions.some(q => q._id === practiceQuestions[currentQuestionIndex]._id)
                      ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/30'
                      : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {bookmarkedQuestions.some(q => q._id === practiceQuestions[currentQuestionIndex]._id) 
                    ? <BookmarkCheck className="w-5 h-5" /> 
                    : <Bookmark className="w-5 h-5" />}
                </button>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {practiceQuestions[currentQuestionIndex].question}
              </h3>

              <div className="space-y-3">
                {practiceQuestions[currentQuestionIndex].options.map((option, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = idx === practiceQuestions[currentQuestionIndex].correctAnswer;
                  const showCorrectWrong = showAnswer;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => !showAnswer && setSelectedAnswer(idx)}
                      disabled={showAnswer}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        showCorrectWrong
                          ? isCorrect
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                            : isSelected
                              ? 'border-red-500 bg-red-50 dark:bg-red-900/30'
                              : 'border-gray-200 dark:border-gray-700'
                          : isSelected
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {showCorrectWrong && isCorrect && <CheckCircle className="w-5 h-5 text-green-500" />}
                        {showCorrectWrong && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showAnswer && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    💡 Explanation
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    {practiceQuestions[currentQuestionIndex].explanation}
                  </p>
                </div>
              )}
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              {!showAnswer ? (
                <button
                  onClick={submitAnswer}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {currentQuestionIndex < practiceQuestions.length - 1 ? 'Next Question' : 'Finish Practice'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
              
              <button
                onClick={() => { if (confirm('End practice session?')) endPractice(); }}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                End
              </button>
            </div>
          </div>
        )}

        {/* ==================== QUICK NOTES TAB ==================== */}
        {activeTab === 'quicknotes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-gray-600 dark:text-gray-400">
                Quick reference notes for last-minute revision
              </p>
              <button
                onClick={() => setShowNoteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Note
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickNotes.map(note => (
                <Card key={note._id} className="group">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                        {note.subject || 'General'}
                      </span>
                      <h3 className="font-semibold text-gray-900 dark:text-white mt-1">{note.title}</h3>
                    </div>
                    <button
                      onClick={() => deleteQuickNote(note._id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    {note.content}
                  </pre>
                </Card>
              ))}
            </div>

            {quickNotes.length === 0 && (
              <Card className="text-center py-12">
                <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No quick notes yet</h3>
                <p className="text-gray-600 dark:text-gray-400">Add formulas, key points, and important facts</p>
              </Card>
            )}
          </div>
        )}

        {/* ==================== BOOKMARKS TAB ==================== */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Questions you marked for revision ({bookmarkedQuestions.length} bookmarked)
            </p>

            {bookmarkedQuestions.map((question, idx) => (
              <Card key={question._id}>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                    {question.subject}
                  </span>
                  <button
                    onClick={() => toggleBookmark(question)}
                    className="text-yellow-500 hover:text-gray-400"
                  >
                    <BookmarkCheck className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{question.question}</h3>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {question.options.map((opt, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded text-sm ${
                        i === question.correctAnswer
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                  💡 {question.explanation}
                </p>
              </Card>
            ))}

            {bookmarkedQuestions.length === 0 && (
              <Card className="text-center py-12">
                <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No bookmarks yet</h3>
                <p className="text-gray-600 dark:text-gray-400">Bookmark difficult questions during practice</p>
              </Card>
            )}
          </div>
        )}

        {/* ==================== STRESS RELIEF TAB ==================== */}
        {activeTab === 'relax' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Breathing Exercise */}
            <Card className="text-center py-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                🧘 Breathing Exercise
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Calm your mind before the exam
              </p>

              {!breathingActive ? (
                <button
                  onClick={() => { setBreathingActive(true); setBreathingStep(0); setBreathingTimer(0); }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Start Breathing Exercise
                </button>
              ) : (
                <div className="space-y-6">
                  <div className={`w-48 h-48 mx-auto rounded-full flex items-center justify-center ${BREATHING_STEPS[breathingStep].color} transition-all duration-1000`}
                    style={{ transform: `scale(${breathingStep === 0 || breathingStep === 1 ? 1 + (breathingTimer * 0.1) : 1.4 - (breathingTimer * 0.1)})` }}
                  >
                    <div className="text-white text-center">
                      <p className="text-2xl font-bold">{BREATHING_STEPS[breathingStep].action}</p>
                      <p className="text-4xl font-bold mt-2">
                        {BREATHING_STEPS[breathingStep].duration - breathingTimer}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setBreathingActive(false)}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
                  >
                    Stop
                  </button>
                </div>
              )}
            </Card>

            {/* Quick Tips */}
            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Coffee className="w-5 h-5" />
                Quick Stress Relief Tips
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { emoji: '💧', tip: 'Stay hydrated - drink water' },
                  { emoji: '🚶', tip: 'Take a short walk' },
                  { emoji: '🎵', tip: 'Listen to calming music' },
                  { emoji: '✍️', tip: 'Write down your worries' },
                  { emoji: '🌿', tip: 'Take deep breaths' },
                  { emoji: '😴', tip: 'Get enough sleep' },
                  { emoji: '🍎', tip: 'Eat healthy snacks' },
                  { emoji: '💬', tip: 'Talk to a friend' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="text-gray-700 dark:text-gray-300">{item.tip}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Motivational Section */}
            <Card className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
              <div className="text-center py-4">
                <h3 className="text-xl font-semibold mb-2">Remember...</h3>
                <p className="text-lg opacity-90">
                  You've prepared for this. Trust yourself and do your best! 💪
                </p>
              </div>
            </Card>

            {/* Affirmations */}
            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                ✨ Positive Affirmations
              </h3>
              <div className="space-y-2">
                {[
                  "I am well prepared for this exam",
                  "I can handle whatever comes my way",
                  "I am calm, focused, and confident",
                  "My hard work will pay off",
                  "I believe in my abilities"
                ].map((affirmation, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Heart className="w-4 h-4 text-purple-500" />
                    <span className="text-purple-800 dark:text-purple-200">{affirmation}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ==================== MODALS ==================== */}
        
        {/* Add Exam Modal */}
        {showExamModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add Exam</h2>
                <button onClick={() => setShowExamModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <input
                  type="text"
                  placeholder="Exam name *"
                  value={examForm.name}
                  onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
                <select
                  value={examForm.subject}
                  onChange={(e) => {
                    if (e.target.value === '__add_custom__') {
                      setShowCustomInput('exam');
                    } else {
                      setExamForm({ ...examForm, subject: e.target.value });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="">Select Subject</option>
                  {ALL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  <option value="__add_custom__">➕ Add Custom Subject...</option>
                </select>
                {showCustomInput === 'exam' && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCustomSubject}
                      onChange={(e) => setNewCustomSubject(e.target.value)}
                      placeholder="Enter custom subject"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                      autoFocus
                    />
                    <button onClick={() => addCustomSubjectHandler('exam', setExamForm, examForm)} className="px-3 py-2 bg-green-600 text-white rounded-lg">Add</button>
                    <button onClick={() => { setShowCustomInput(null); setNewCustomSubject(''); }} className="px-3 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg">✕</button>
                  </div>
                )}
                <input
                  type="date"
                  value={examForm.date}
                  onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
                <input
                  type="time"
                  value={examForm.time}
                  onChange={(e) => setExamForm({ ...examForm, time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
              <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => setShowExamModal(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  Cancel
                </button>
                <button onClick={addExam} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Add Exam
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Quick Note Modal */}
        {showNoteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add Quick Note</h2>
                <button onClick={() => setShowNoteModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <select
                  value={noteForm.subject}
                  onChange={(e) => {
                    if (e.target.value === '__add_custom__') {
                      setShowCustomInput('note');
                    } else {
                      setNoteForm({ ...noteForm, subject: e.target.value });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="">Select Subject</option>
                  {ALL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  <option value="__add_custom__">➕ Add Custom Subject...</option>
                </select>
                {showCustomInput === 'note' && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCustomSubject}
                      onChange={(e) => setNewCustomSubject(e.target.value)}
                      placeholder="Enter custom subject"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                      autoFocus
                    />
                    <button onClick={() => addCustomSubjectHandler('note', setNoteForm, noteForm)} className="px-3 py-2 bg-green-600 text-white rounded-lg">Add</button>
                    <button onClick={() => { setShowCustomInput(null); setNewCustomSubject(''); }} className="px-3 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg">✕</button>
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Title (e.g., Important Formulas)"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
                <textarea
                  placeholder="Content (formulas, key points, etc.)"
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-mono text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => setShowNoteModal(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  Cancel
                </button>
                <button onClick={addQuickNote} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Add Note
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

export default ExamMode;
