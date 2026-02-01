import { useState, useRef, useEffect } from 'react';
import StudentLayout from '../../components/layout/StudentLayout';
import Card from '../../components/common/Card';
import { 
  BookOpen, Plus, Edit2, Trash2, X, Upload, FileText, Image, 
  Play, Pause, RotateCcw, CheckCircle, XCircle, Clock, Target,
  Brain, Layers, Timer, Award, ChevronLeft, ChevronRight, Shuffle,
  Volume2, Check, AlertCircle, Download, Eye, Paperclip, Sparkles, Save, Rocket
} from 'lucide-react';
import toast from 'react-hot-toast';

// Storage keys
const STORAGE_KEYS = {
  materials: 'edutrack_study_materials',
  flashcards: 'edutrack_flashcards',
  quizResults: 'edutrack_quiz_results',
  tasks: 'edutrack_tasks'
};

// Load from localStorage
const loadFromStorage = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

// Save to localStorage
const saveToStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Default subjects - students can add custom ones
const DEFAULT_SUBJECTS = ['Data Structures', 'Database Systems', 'Operating Systems', 'Computer Networks', 'Mathematics', 'Physics'];

// Load custom subjects from localStorage
const loadCustomSubjects = () => {
  try {
    const stored = localStorage.getItem('edutrack_custom_subjects');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

const saveCustomSubjects = (subjects) => {
  localStorage.setItem('edutrack_custom_subjects', JSON.stringify(subjects));
};

function Assignments() {
  // Active tab
  const [activeTab, setActiveTab] = useState('materials');
  
  // Custom subjects state
  const [customSubjects, setCustomSubjects] = useState(loadCustomSubjects);
  const [showCustomInput, setShowCustomInput] = useState(null); // Which modal: 'material', 'flashcard', 'task'
  const [newCustomSubject, setNewCustomSubject] = useState('');
  
  // Get all subjects (default + custom)
  const ALL_SUBJECTS = [...DEFAULT_SUBJECTS, ...customSubjects];

  // Add custom subject
  const addCustomSubject = (formType, setForm, form) => {
    if (newCustomSubject.trim() && !ALL_SUBJECTS.includes(newCustomSubject.trim())) {
      const updated = [...customSubjects, newCustomSubject.trim()];
      setCustomSubjects(updated);
      saveCustomSubjects(updated);
      setForm({ ...form, subject: newCustomSubject.trim() });
      setNewCustomSubject('');
      setShowCustomInput(null);
      toast.success('Subject added!');
    }
  };
  
  // Study Materials State
  const [materials, setMaterials] = useState(() => loadFromStorage(STORAGE_KEYS.materials, []));
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [materialForm, setMaterialForm] = useState({ title: '', subject: '', file: null, filePreview: null });
  const fileInputRef = useRef(null);

  // Flashcards State
  const [flashcards, setFlashcards] = useState(() => loadFromStorage(STORAGE_KEYS.flashcards, []));
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [flashcardForm, setFlashcardForm] = useState({ question: '', answer: '', subject: '' });
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [shuffledCards, setShuffledCards] = useState([]);

  // Quiz State
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState(() => loadFromStorage(STORAGE_KEYS.quizResults, []));

  // Pomodoro Timer State
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState('focus'); // focus, shortBreak, longBreak
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  // Tasks State
  const [tasks, setTasks] = useState(() => loadFromStorage(STORAGE_KEYS.tasks, [
    { _id: '1', title: 'Complete Data Structures Assignment', subject: 'Data Structures', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], priority: 'high', status: 'pending', completed: false, submission: null },
    { _id: '2', title: 'Review Database Normalization', subject: 'Database Systems', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], priority: 'medium', status: 'pending', completed: false, submission: null },
  ]));
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', subject: '', dueDate: '', priority: 'medium', status: 'pending' });
  const [editingTask, setEditingTask] = useState(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submittingTask, setSubmittingTask] = useState(null);
  const taskFileInputRef = useRef(null);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        if (timerSeconds === 0) {
          if (timerMinutes === 0) {
            // Timer finished
            setIsTimerRunning(false);
            if (timerMode === 'focus') {
              setCompletedPomodoros(prev => prev + 1);
              toast.success('🎉 Pomodoro completed! Take a break.');
              // Auto switch to break
              setTimerMode('shortBreak');
              setTimerMinutes(5);
            } else {
              toast.success('Break over! Ready for another session?');
              setTimerMode('focus');
              setTimerMinutes(25);
            }
          } else {
            setTimerMinutes(prev => prev - 1);
            setTimerSeconds(59);
          }
        } else {
          setTimerSeconds(prev => prev - 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerMinutes, timerSeconds, timerMode]);

  // Save data when it changes
  useEffect(() => { saveToStorage(STORAGE_KEYS.materials, materials); }, [materials]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.flashcards, flashcards); }, [flashcards]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.quizResults, quizResults); }, [quizResults]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.tasks, tasks); }, [tasks]);

  // ==================== STUDY MATERIALS ====================
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF and image files are allowed');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setMaterialForm(prev => ({
        ...prev,
        file: { name: file.name, type: file.type, size: file.size, data: e.target.result },
        filePreview: file.type.startsWith('image/') ? e.target.result : null
      }));
    };
    reader.readAsDataURL(file);
  };

  const saveMaterial = () => {
    if (!materialForm.title || !materialForm.file) {
      toast.error('Please add title and file');
      return;
    }
    const newMaterial = {
      _id: Date.now().toString(),
      ...materialForm,
      createdAt: new Date().toISOString()
    };
    setMaterials([newMaterial, ...materials]);
    setShowMaterialModal(false);
    setMaterialForm({ title: '', subject: '', file: null, filePreview: null });
    toast.success('Study material added!');
  };

  const deleteMaterial = (id) => {
    if (confirm('Delete this material?')) {
      setMaterials(materials.filter(m => m._id !== id));
      toast.success('Material deleted');
    }
  };

  // ==================== FLASHCARDS ====================
  const saveFlashcard = () => {
    if (!flashcardForm.question || !flashcardForm.answer) {
      toast.error('Please fill question and answer');
      return;
    }
    const newCard = {
      _id: Date.now().toString(),
      ...flashcardForm,
      createdAt: new Date().toISOString()
    };
    setFlashcards([...flashcards, newCard]);
    setShowFlashcardModal(false);
    setFlashcardForm({ question: '', answer: '', subject: '' });
    toast.success('Flashcard created!');
  };

  const deleteFlashcard = (id) => {
    setFlashcards(flashcards.filter(f => f._id !== id));
    toast.success('Flashcard deleted');
  };

  const startStudyMode = () => {
    if (flashcards.length === 0) {
      toast.error('Create some flashcards first!');
      return;
    }
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setStudyMode(true);
  };

  const nextCard = () => {
    if (currentCardIndex < shuffledCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  // ==================== QUIZ ====================
  const startQuiz = () => {
    if (flashcards.length < 3) {
      toast.error('Need at least 3 flashcards to create a quiz');
      return;
    }
    
    // Generate quiz questions from flashcards
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5).slice(0, Math.min(10, flashcards.length));
    const questions = shuffled.map(card => {
      // Get wrong answers from other cards
      const otherAnswers = flashcards
        .filter(f => f._id !== card._id)
        .map(f => f.answer)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const options = [...otherAnswers, card.answer].sort(() => Math.random() - 0.5);
      
      return {
        _id: card._id,
        question: card.question,
        correctAnswer: card.answer,
        options: options.length >= 4 ? options : [card.answer, 'Option A', 'Option B', 'Option C']
      };
    });
    
    setQuizQuestions(questions);
    setCurrentQuizIndex(0);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizMode(true);
  };

  const submitQuiz = () => {
    let score = 0;
    quizQuestions.forEach(q => {
      if (quizAnswers[q._id] === q.correctAnswer) score++;
    });
    
    const result = {
      _id: Date.now().toString(),
      date: new Date().toISOString(),
      totalQuestions: quizQuestions.length,
      correctAnswers: score,
      percentage: Math.round((score / quizQuestions.length) * 100)
    };
    
    setQuizResults([result, ...quizResults]);
    setQuizSubmitted(true);
    toast.success(`Quiz completed! Score: ${result.percentage}%`);
  };

  // ==================== TIMER ====================
  const resetTimer = () => {
    setIsTimerRunning(false);
    if (timerMode === 'focus') setTimerMinutes(25);
    else if (timerMode === 'shortBreak') setTimerMinutes(5);
    else setTimerMinutes(15);
    setTimerSeconds(0);
  };

  const setTimerModeAndReset = (mode) => {
    setTimerMode(mode);
    setIsTimerRunning(false);
    if (mode === 'focus') setTimerMinutes(25);
    else if (mode === 'shortBreak') setTimerMinutes(5);
    else setTimerMinutes(15);
    setTimerSeconds(0);
  };

  // ==================== TASKS ====================
  const saveTask = () => {
    if (!taskForm.title) {
      toast.error('Please enter task title');
      return;
    }
    
    if (editingTask) {
      setTasks(tasks.map(t => t._id === editingTask._id ? { ...t, ...taskForm } : t));
      toast.success('Task updated!');
    } else {
      const newTask = {
        _id: Date.now().toString(),
        ...taskForm,
        status: 'pending',
        completed: false,
        submission: null,
        createdAt: new Date().toISOString()
      };
      setTasks([newTask, ...tasks]);
      toast.success('Task added!');
    }
    
    setShowTaskModal(false);
    setTaskForm({ title: '', subject: '', dueDate: '', priority: 'medium', status: 'pending' });
    setEditingTask(null);
  };

  const toggleTaskComplete = (id) => {
    setTasks(tasks.map(t => {
      if (t._id === id) {
        const newCompleted = !t.completed;
        return { 
          ...t, 
          completed: newCompleted,
          status: newCompleted ? 'submitted' : (t.submission ? 'submitted' : 'pending')
        };
      }
      return t;
    }));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t._id !== id));
    toast.success('Task deleted');
  };

  const editTask = (task) => {
    setEditingTask(task);
    setTaskForm({ 
      title: task.title, 
      subject: task.subject || '', 
      dueDate: task.dueDate || '', 
      priority: task.priority || 'medium',
      status: task.status || 'pending'
    });
    setShowTaskModal(true);
  };

  const openSubmissionModal = (task) => {
    setSubmittingTask(task);
    setShowSubmissionModal(true);
  };

  const handleTaskFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const submission = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: e.target.result,
          submittedAt: new Date().toISOString()
        };
        
        setTasks(tasks.map(t => 
          t._id === submittingTask._id 
            ? { ...t, submission, status: 'submitted', completed: true }
            : t
        ));
        
        toast.success(`Submitted: ${file.name}`);
        setShowSubmissionModal(false);
        setSubmittingTask(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSubmission = (taskId) => {
    setTasks(tasks.map(t => 
      t._id === taskId 
        ? { ...t, submission: null, status: 'pending', completed: false }
        : t
    ));
    toast.success('Submission removed');
  };

  const getTaskStatusColor = (task) => {
    if (task.status === 'submitted' || task.completed) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (task.dueDate && new Date(task.dueDate) < new Date()) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
  };

  const getTaskStatusText = (task) => {
    if (task.status === 'submitted' || task.completed) return 'Submitted';
    if (task.dueDate && new Date(task.dueDate) < new Date()) return 'Late';
    return 'Pending';
  };

  // ==================== RENDER ====================
  const tabs = [
    { id: 'materials', label: 'Study Materials', icon: FileText, color: 'from-blue-500 to-indigo-600', count: materials.length },
    { id: 'flashcards', label: 'Flashcards', icon: Layers, color: 'from-purple-500 to-violet-600', count: flashcards.length },
    { id: 'quiz', label: 'Quick Quiz', icon: Brain, color: 'from-pink-500 to-rose-600', count: quizResults.length },
    { id: 'timer', label: 'Study Timer', icon: Timer, color: 'from-amber-500 to-orange-600', count: completedPomodoros },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle, color: 'from-emerald-500 to-teal-600', count: tasks.length },
  ];

  return (
    <StudentLayout>
      <div className="space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Rocket className="w-12 h-12" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Study Hub</h1>
                <p className="text-white/80 mt-2 max-w-md">Your complete study toolkit - materials, flashcards, quizzes & more</p>
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">{materials.length} Materials</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                    <Layers className="w-4 h-4" />
                    <span className="text-sm font-medium">{flashcards.length} Cards</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                    <Award className="w-4 h-4 text-amber-300" />
                    <span className="text-sm font-medium">{completedPomodoros} Pomodoros</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-2 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab, idx) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === tab.id 
                      ? 'bg-white/20' 
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ==================== STUDY MATERIALS TAB ==================== */}
        {activeTab === 'materials' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{materials.length} Study Materials</h2>
                  <p className="text-sm text-gray-500">Upload PDFs and images to study from</p>
                </div>
              </div>
              <button
                onClick={() => setShowMaterialModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium group"
              >
                <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Upload Material
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map((material, idx) => (
                <div 
                  key={material._id} 
                  className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${material.file?.type?.startsWith('image/') ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                          {material.file?.type?.startsWith('image/') ? (
                            <Image className="w-6 h-6 text-green-600 dark:text-green-400" />
                          ) : (
                            <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{material.title}</h3>
                          <p className="text-xs text-gray-500">{material.subject || 'No subject'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteMaterial(material._id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {material.file?.type?.startsWith('image/') && (
                      <img src={material.file.data} alt={material.title} className="w-full h-32 object-cover rounded-lg" />
                    )}
                    
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-xs text-gray-400">
                        {(material.file?.size / 1024).toFixed(1)} KB
                      </span>
                      <button
                        onClick={() => window.open(material.file.data, '_blank')}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {materials.length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                  <Upload className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Materials Yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Upload PDFs or images to study from</p>
                <button
                  onClick={() => setShowMaterialModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                >
                  <Upload className="w-5 h-5" />
                  Upload First Material
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================== FLASHCARDS TAB ==================== */}
        {activeTab === 'flashcards' && !studyMode && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{flashcards.length} Flashcards</h2>
                  <p className="text-sm text-gray-500">Create cards and test your knowledge</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={startStudyMode}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium group"
                >
                  <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Study Mode
                </button>
                <button
                  onClick={() => setShowFlashcardModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium group"
                >
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  Add Card
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flashcards.map((card, idx) => (
                <div 
                  key={card._id} 
                  className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-violet-600"></div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="px-3 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                        {card.subject || 'General'}
                      </span>
                      <button
                        onClick={() => deleteFlashcard(card._id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="pt-2 space-y-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-xs text-gray-400 uppercase tracking-wide">Question</span>
                        <p className="font-medium text-gray-900 dark:text-white mt-1">{card.question}</p>
                      </div>
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Answer</span>
                        <p className="text-gray-700 dark:text-gray-300 mt-1">{card.answer}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {flashcards.length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 flex items-center justify-center">
                  <Layers className="w-10 h-10 text-purple-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Flashcards Yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Create flashcards to test your knowledge</p>
                <button
                  onClick={() => setShowFlashcardModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Create First Card
                </button>
              </div>
            )}
          </div>
        )}

        {/* Flashcard Study Mode */}
        {activeTab === 'flashcards' && studyMode && shuffledCards.length > 0 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setStudyMode(false)}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ChevronLeft className="w-5 h-5" />
                Back to Cards
              </button>
              <span className="text-gray-600 dark:text-gray-400">
                {currentCardIndex + 1} / {shuffledCards.length}
              </span>
            </div>

            {/* Flashcard */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="cursor-pointer perspective-1000"
            >
              <div className={`relative min-h-[300px] transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                <Card className={`absolute inset-0 flex items-center justify-center p-8 ${isFlipped ? 'opacity-0' : 'opacity-100'} bg-gradient-to-br from-blue-500 to-blue-600`}>
                  <div className="text-center text-white">
                    <p className="text-sm mb-4 opacity-75">Question</p>
                    <p className="text-2xl font-semibold">{shuffledCards[currentCardIndex]?.question}</p>
                    <p className="text-sm mt-6 opacity-75">Click to reveal answer</p>
                  </div>
                </Card>
                <Card className={`absolute inset-0 flex items-center justify-center p-8 ${isFlipped ? 'opacity-100' : 'opacity-0'} bg-gradient-to-br from-green-500 to-green-600`}>
                  <div className="text-center text-white">
                    <p className="text-sm mb-4 opacity-75">Answer</p>
                    <p className="text-2xl font-semibold">{shuffledCards[currentCardIndex]?.answer}</p>
                    <p className="text-sm mt-6 opacity-75">Click to see question</p>
                  </div>
                </Card>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-center gap-4">
              <button
                onClick={prevCard}
                disabled={currentCardIndex === 0}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>
              <button
                onClick={() => {
                  setShuffledCards([...shuffledCards].sort(() => Math.random() - 0.5));
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg"
              >
                <Shuffle className="w-5 h-5" />
                Shuffle
              </button>
              <button
                onClick={nextCard}
                disabled={currentCardIndex === shuffledCards.length - 1}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ==================== QUIZ TAB ==================== */}
        {activeTab === 'quiz' && !quizMode && (
          <div className="space-y-6">
            <Card className="text-center py-12">
              <Brain className="w-20 h-20 text-purple-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Quick Quiz</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Test yourself with a quiz generated from your flashcards
              </p>
              <button
                onClick={startQuiz}
                className="inline-flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-lg font-semibold"
              >
                <Play className="w-5 h-5" />
                Start Quiz
              </button>
              <p className="text-sm text-gray-500 mt-4">
                You have {flashcards.length} flashcards (need at least 3)
              </p>
            </Card>

            {/* Quiz History */}
            {quizResults.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {quizResults.slice(0, 6).map(result => (
                    <Card key={result._id}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.percentage}%</p>
                          <p className="text-sm text-gray-500">
                            {result.correctAnswers}/{result.totalQuestions} correct
                          </p>
                        </div>
                        <Award className={`w-10 h-10 ${result.percentage >= 80 ? 'text-yellow-500' : result.percentage >= 60 ? 'text-gray-400' : 'text-orange-400'}`} />
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(result.date).toLocaleDateString()}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quiz Mode */}
        {activeTab === 'quiz' && quizMode && !quizSubmitted && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setQuizMode(false)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900"
              >
                ← Exit Quiz
              </button>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full">
                Question {currentQuizIndex + 1} of {quizQuestions.length}
              </span>
            </div>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {quizQuestions[currentQuizIndex]?.question}
              </h3>
              
              <div className="space-y-3">
                {quizQuestions[currentQuizIndex]?.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuizAnswers({ ...quizAnswers, [quizQuestions[currentQuizIndex]._id]: option })}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      quizAnswers[quizQuestions[currentQuizIndex]._id] === option
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </Card>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentQuizIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuizIndex === 0}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              
              {currentQuizIndex === quizQuestions.length - 1 ? (
                <button
                  onClick={submitQuiz}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuizIndex(prev => prev + 1)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}

        {/* Quiz Results */}
        {activeTab === 'quiz' && quizMode && quizSubmitted && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="text-center py-8">
              <Award className={`w-20 h-20 mx-auto mb-4 ${quizResults[0]?.percentage >= 80 ? 'text-yellow-500' : 'text-gray-400'}`} />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{quizResults[0]?.percentage}%</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {quizResults[0]?.correctAnswers} out of {quizResults[0]?.totalQuestions} correct
              </p>
            </Card>

            <div className="space-y-4">
              {quizQuestions.map((q, idx) => (
                <Card key={q._id} className={`border-l-4 ${quizAnswers[q._id] === q.correctAnswer ? 'border-green-500' : 'border-red-500'}`}>
                  <div className="flex items-start gap-3">
                    {quizAnswers[q._id] === q.correctAnswer ? (
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{q.question}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Your answer: <span className={quizAnswers[q._id] === q.correctAnswer ? 'text-green-600' : 'text-red-600'}>{quizAnswers[q._id] || 'Not answered'}</span>
                      </p>
                      {quizAnswers[q._id] !== q.correctAnswer && (
                        <p className="text-sm text-green-600 mt-1">Correct: {q.correctAnswer}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <button
              onClick={() => { setQuizMode(false); setQuizSubmitted(false); }}
              className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Back to Quiz Menu
            </button>
          </div>
        )}

        {/* ==================== TIMER TAB ==================== */}
        {activeTab === 'timer' && (
          <div className="max-w-lg mx-auto space-y-6">
            <Card className="text-center py-8">
              <div className="mb-6">
                <div className="flex justify-center gap-2 mb-6">
                  {['focus', 'shortBreak', 'longBreak'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setTimerModeAndReset(mode)}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        timerMode === mode
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {mode === 'focus' ? '🎯 Focus' : mode === 'shortBreak' ? '☕ Short Break' : '🌴 Long Break'}
                    </button>
                  ))}
                </div>
                
                <div className={`text-8xl font-bold mb-4 ${timerMode === 'focus' ? 'text-blue-600' : 'text-green-600'}`}>
                  {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
                </div>
                
                <p className="text-gray-600 dark:text-gray-400">
                  {timerMode === 'focus' ? 'Stay focused!' : 'Take a break!'}
                </p>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`flex items-center gap-2 px-8 py-3 rounded-lg text-white font-semibold ${
                    isTimerRunning ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  {isTimerRunning ? 'Pause' : 'Start'}
                </button>
                <button
                  onClick={resetTimer}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </button>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Completed Today</h3>
                  <p className="text-sm text-gray-500">Great progress!</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-600">{completedPomodoros}</p>
                  <p className="text-sm text-gray-500">Pomodoros</p>
                </div>
              </div>
            </Card>

            <Card className="bg-blue-50 dark:bg-blue-900/20">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 Pomodoro Technique</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Work for 25 minutes (Focus)</li>
                <li>• Take a 5-minute break (Short Break)</li>
                <li>• After 4 pomodoros, take a 15-minute break (Long Break)</li>
              </ul>
            </Card>
          </div>
        )}

        {/* ==================== TASKS TAB ==================== */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <span className="text-gray-600 dark:text-gray-400">
                  {tasks.filter(t => !t.completed && t.status !== 'submitted').length} pending • 
                  {tasks.filter(t => t.completed || t.status === 'submitted').length} submitted •
                  {tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'submitted').length} late
                </span>
              </div>
              <button
                onClick={() => { setEditingTask(null); setTaskForm({ title: '', subject: '', dueDate: '', priority: 'medium', status: 'pending' }); setShowTaskModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>

            <div className="space-y-3">
              {tasks.map(task => (
                <Card key={task._id} className={`${task.completed || task.status === 'submitted' ? 'opacity-75' : ''}`}>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleTaskComplete(task._id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        task.completed || task.status === 'submitted' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {(task.completed || task.status === 'submitted') && <Check className="w-4 h-4" />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium ${task.completed || task.status === 'submitted' ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                        {task.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                        {task.subject && <span>{task.subject}</span>}
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {task.submission && (
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <Paperclip className="w-3 h-3" />
                            {task.submission.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${getTaskStatusColor(task)}`}>
                      {getTaskStatusText(task)}
                    </span>

                    {/* Priority Badge */}
                    <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                      'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    }`}>
                      {task.priority}
                    </span>

                    <div className="flex gap-1 flex-shrink-0">
                      {/* Upload/View Submission Button */}
                      {task.submission ? (
                        <button 
                          onClick={() => removeSubmission(task._id)} 
                          className="p-1.5 text-green-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                          title="Remove submission"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => openSubmissionModal(task)} 
                          className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded"
                          title="Upload submission"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => editTask(task)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteTask(task._id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {tasks.length === 0 && (
              <Card className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No tasks yet</h3>
                <p className="text-gray-600 dark:text-gray-400">Add tasks to track your assignments and upload submissions</p>
              </Card>
            )}
          </div>
        )}

        {/* ==================== MODALS ==================== */}
        
        {/* Material Upload Modal */}
        {showMaterialModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upload Study Material</h2>
                <button onClick={() => setShowMaterialModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <input
                  type="text"
                  placeholder="Material title"
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <select
                  value={materialForm.subject}
                  onChange={(e) => {
                    if (e.target.value === '__add_custom__') {
                      setShowCustomInput('material');
                    } else {
                      setMaterialForm({ ...materialForm, subject: e.target.value });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="">Select Subject</option>
                  {ALL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  <option value="__add_custom__">➕ Add Custom Subject...</option>
                </select>
                {showCustomInput === 'material' && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newCustomSubject}
                      onChange={(e) => setNewCustomSubject(e.target.value)}
                      placeholder="Enter custom subject"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                      autoFocus
                    />
                    <button onClick={() => addCustomSubject('material', setMaterialForm, materialForm)} className="px-3 py-2 bg-green-600 text-white rounded-lg">Add</button>
                    <button onClick={() => { setShowCustomInput(null); setNewCustomSubject(''); }} className="px-3 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg">✕</button>
                  </div>
                )}
                
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf,image/*" className="hidden" />
                
                {!materialForm.file ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500"
                  >
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Click to upload PDF or Image</span>
                  </button>
                ) : (
                  <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-6 h-6 text-blue-500" />
                        <span className="text-sm">{materialForm.file.name}</span>
                      </div>
                      <button onClick={() => setMaterialForm({ ...materialForm, file: null, filePreview: null })} className="text-red-500">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    {materialForm.filePreview && (
                      <img src={materialForm.filePreview} alt="Preview" className="mt-2 max-h-32 mx-auto rounded" />
                    )}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => setShowMaterialModal(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  Cancel
                </button>
                <button onClick={saveMaterial} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Upload
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Flashcard Modal */}
        {showFlashcardModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create Flashcard</h2>
                <button onClick={() => setShowFlashcardModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <select
                  value={flashcardForm.subject}
                  onChange={(e) => {
                    if (e.target.value === '__add_custom__') {
                      setShowCustomInput('flashcard');
                    } else {
                      setFlashcardForm({ ...flashcardForm, subject: e.target.value });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="">Select Subject</option>
                  {ALL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  <option value="__add_custom__">➕ Add Custom Subject...</option>
                </select>
                {showCustomInput === 'flashcard' && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCustomSubject}
                      onChange={(e) => setNewCustomSubject(e.target.value)}
                      placeholder="Enter custom subject"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                      autoFocus
                    />
                    <button onClick={() => addCustomSubject('flashcard', setFlashcardForm, flashcardForm)} className="px-3 py-2 bg-green-600 text-white rounded-lg">Add</button>
                    <button onClick={() => { setShowCustomInput(null); setNewCustomSubject(''); }} className="px-3 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg">✕</button>
                  </div>
                )}
                <textarea
                  placeholder="Question"
                  value={flashcardForm.question}
                  onChange={(e) => setFlashcardForm({ ...flashcardForm, question: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <textarea
                  placeholder="Answer"
                  value={flashcardForm.answer}
                  onChange={(e) => setFlashcardForm({ ...flashcardForm, answer: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => setShowFlashcardModal(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  Cancel
                </button>
                <button onClick={saveFlashcard} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Create Card
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Task Modal */}
        {showTaskModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{editingTask ? 'Edit Task' : 'Add Task'}</h2>
                <button onClick={() => setShowTaskModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <input
                  type="text"
                  placeholder="Task title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <select
                  value={taskForm.subject}
                  onChange={(e) => {
                    if (e.target.value === '__add_custom__') {
                      setShowCustomInput('task');
                    } else {
                      setTaskForm({ ...taskForm, subject: e.target.value });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="">Select Subject</option>
                  {ALL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  <option value="__add_custom__">➕ Add Custom Subject...</option>
                </select>
                {showCustomInput === 'task' && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newCustomSubject}
                      onChange={(e) => setNewCustomSubject(e.target.value)}
                      placeholder="Enter custom subject"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                      autoFocus
                    />
                    <button onClick={() => addCustomSubject('task', setTaskForm, taskForm)} className="px-3 py-2 bg-green-600 text-white rounded-lg">Add</button>
                    <button onClick={() => { setShowCustomInput(null); setNewCustomSubject(''); }} className="px-3 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg">✕</button>
                  </div>
                )}
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => setShowTaskModal(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  Cancel
                </button>
                <button onClick={saveTask} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {editingTask ? 'Save Changes' : 'Add Task'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Submission Upload Modal */}
        {showSubmissionModal && submittingTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upload Submission</h2>
                <button onClick={() => { setShowSubmissionModal(false); setSubmittingTask(null); }} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Task:</p>
                  <p className="font-medium text-gray-900 dark:text-white">{submittingTask.title}</p>
                  {submittingTask.dueDate && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Due: {new Date(submittingTask.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div 
                  onClick={() => taskFileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Click to upload your submission</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB)</p>
                </div>

                <input
                  ref={taskFileInputRef}
                  type="file"
                  onChange={handleTaskFileSelect}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  className="hidden"
                />

                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 Your file will be stored locally and marked as submitted.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                <button 
                  onClick={() => { setShowSubmissionModal(false); setSubmittingTask(null); }} 
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
    </StudentLayout>
  );
}

export default Assignments;
