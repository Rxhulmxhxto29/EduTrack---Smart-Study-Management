import { useState, useEffect, useCallback } from 'react';
import StudentLayout from '../../components/layout/StudentLayout';
import Card from '../../components/common/Card';
import { 
  TrendingUp, CheckCircle, Circle, Award, Target, BookOpen, Plus, Edit2, Trash2, X,
  ChevronDown, ChevronRight, Clock, AlertCircle, Save, Sparkles, Flame, Trophy, Zap, Loader
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getData, saveData } from '../../services/userDataService';

// Storage key
const STORAGE_KEY = 'progress_data';
const STREAK_KEY = 'study_streak';

// Default progress data
const DEFAULT_SUBJECTS = [
  {
    _id: '1',
    name: 'Data Structures',
    code: 'CS301',
    units: [
      { _id: 'u1', name: 'Arrays & Strings', topics: [
        { _id: 't1', name: 'Array Basics', status: 'completed' },
        { _id: 't2', name: 'String Operations', status: 'completed' },
        { _id: 't3', name: 'Two Pointers', status: 'completed' },
        { _id: 't4', name: 'Sliding Window', status: 'completed' },
        { _id: 't5', name: 'Dynamic Arrays', status: 'completed' },
      ]},
      { _id: 'u2', name: 'Linked Lists', topics: [
        { _id: 't6', name: 'Singly Linked List', status: 'completed' },
        { _id: 't7', name: 'Doubly Linked List', status: 'completed' },
        { _id: 't8', name: 'Circular Linked List', status: 'completed' },
        { _id: 't9', name: 'LL Operations', status: 'completed' },
      ]},
      { _id: 'u3', name: 'Stacks & Queues', topics: [
        { _id: 't10', name: 'Stack Implementation', status: 'completed' },
        { _id: 't11', name: 'Stack Applications', status: 'completed' },
        { _id: 't12', name: 'Queue Implementation', status: 'in-progress' },
        { _id: 't13', name: 'Priority Queue', status: 'not-started' },
      ]},
      { _id: 'u4', name: 'Trees', topics: [
        { _id: 't14', name: 'Binary Trees', status: 'completed' },
        { _id: 't15', name: 'BST Operations', status: 'completed' },
        { _id: 't16', name: 'Tree Traversals', status: 'in-progress' },
        { _id: 't17', name: 'AVL Trees', status: 'not-started' },
        { _id: 't18', name: 'Red-Black Trees', status: 'not-started' },
        { _id: 't19', name: 'B-Trees', status: 'not-started' },
      ]},
      { _id: 'u5', name: 'Graphs', topics: [
        { _id: 't20', name: 'Graph Basics', status: 'completed' },
        { _id: 't21', name: 'BFS', status: 'completed' },
        { _id: 't22', name: 'DFS', status: 'not-started' },
        { _id: 't23', name: 'Shortest Path', status: 'not-started' },
        { _id: 't24', name: 'MST', status: 'not-started' },
        { _id: 't25', name: 'Topological Sort', status: 'not-started' },
      ]},
    ]
  },
  {
    _id: '2',
    name: 'Database Systems',
    code: 'CS302',
    units: [
      { _id: 'u6', name: 'Introduction to DBMS', topics: [
        { _id: 't26', name: 'Database Concepts', status: 'completed' },
        { _id: 't27', name: 'DBMS Architecture', status: 'completed' },
        { _id: 't28', name: 'Data Models', status: 'completed' },
      ]},
      { _id: 'u7', name: 'ER Modeling', topics: [
        { _id: 't29', name: 'ER Diagrams', status: 'completed' },
        { _id: 't30', name: 'Relationships', status: 'completed' },
        { _id: 't31', name: 'Extended ER', status: 'completed' },
        { _id: 't32', name: 'ER to Relational', status: 'completed' },
      ]},
      { _id: 'u8', name: 'Normalization', topics: [
        { _id: 't33', name: 'Functional Dependencies', status: 'completed' },
        { _id: 't34', name: '1NF, 2NF, 3NF', status: 'completed' },
        { _id: 't35', name: 'BCNF', status: 'completed' },
        { _id: 't36', name: 'Decomposition', status: 'in-progress' },
      ]},
      { _id: 'u9', name: 'SQL', topics: [
        { _id: 't37', name: 'Basic SQL', status: 'completed' },
        { _id: 't38', name: 'Joins', status: 'completed' },
        { _id: 't39', name: 'Subqueries', status: 'in-progress' },
        { _id: 't40', name: 'Views & Indexes', status: 'not-started' },
        { _id: 't41', name: 'Stored Procedures', status: 'not-started' },
      ]},
      { _id: 'u10', name: 'Transactions', topics: [
        { _id: 't42', name: 'ACID Properties', status: 'not-started' },
        { _id: 't43', name: 'Concurrency Control', status: 'not-started' },
        { _id: 't44', name: 'Recovery', status: 'not-started' },
        { _id: 't45', name: 'Deadlock Handling', status: 'not-started' },
      ]},
    ]
  },
];

const DEFAULT_ACHIEVEMENTS = [
  { id: 1, title: 'First Steps', description: 'Complete your first topic', target: 1, icon: '🎯' },
  { id: 2, title: 'Quick Learner', description: 'Complete 10 topics', target: 10, icon: '⚡' },
  { id: 3, title: 'Consistent', description: 'Complete 25 topics', target: 25, icon: '📅' },
  { id: 4, title: 'Data Master', description: 'Complete 40 topics', target: 40, icon: '🏆' },
  { id: 5, title: 'Scholar', description: 'Complete 50 topics', target: 50, icon: '🎓' },
];

const STATUS_OPTIONS = [
  { value: 'not-started', label: 'Not Started', color: 'bg-gray-400 dark:bg-gray-600', textColor: 'text-gray-500 dark:text-gray-400', icon: Circle, gradient: 'from-gray-400 to-gray-500' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400', icon: Clock, gradient: 'from-amber-500 to-orange-500' },
  { value: 'completed', label: 'Completed', color: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircle, gradient: 'from-emerald-500 to-green-500' },
];

// Subject colors for visual distinction
const SUBJECT_COLORS = [
  { gradient: 'from-indigo-500 to-purple-600', light: 'bg-indigo-50 dark:bg-indigo-900/20' },
  { gradient: 'from-emerald-500 to-teal-600', light: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { gradient: 'from-orange-500 to-red-500', light: 'bg-orange-50 dark:bg-orange-900/20' },
  { gradient: 'from-pink-500 to-rose-600', light: 'bg-pink-50 dark:bg-pink-900/20' },
  { gradient: 'from-cyan-500 to-blue-600', light: 'bg-cyan-50 dark:bg-cyan-900/20' },
];

const getSubjectColor = (index) => SUBJECT_COLORS[index % SUBJECT_COLORS.length];

function Progress() {
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [expandedUnits, setExpandedUnits] = useState({});
  const [studyStreak, setStudyStreak] = useState({ days: 5, lastStudyDate: new Date().toDateString() });
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [editingUnit, setEditingUnit] = useState(null);
  const [editingTopic, setEditingTopic] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  
  // Forms
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '' });
  const [unitForm, setUnitForm] = useState({ name: '' });
  const [topicForm, setTopicForm] = useState({ name: '', status: 'not-started' });

  // Load data from backend/localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [progressData, streakData] = await Promise.all([
          getData(STORAGE_KEY, DEFAULT_SUBJECTS),
          getData(STREAK_KEY, { days: 5, lastStudyDate: new Date().toDateString() })
        ]);
        setSubjects(progressData);
        setStudyStreak(streakData);
      } catch (error) {
        console.error('Failed to load progress data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Save to backend when subjects change
  const saveSubjects = useCallback(async (newSubjects) => {
    setSubjects(newSubjects);
    await saveData(STORAGE_KEY, newSubjects);
  }, []);

  // Save streak to backend
  const saveStreak = useCallback(async (newStreak) => {
    setStudyStreak(newStreak);
    await saveData(STREAK_KEY, newStreak);
  }, []);

  // Calculate stats
  const calculateStats = () => {
    let totalTopics = 0;
    let completedTopics = 0;
    let inProgressTopics = 0;
    
    subjects.forEach(subject => {
      subject.units?.forEach(unit => {
        unit.topics?.forEach(topic => {
          totalTopics++;
          if (topic.status === 'completed') completedTopics++;
          if (topic.status === 'in-progress') inProgressTopics++;
        });
      });
    });
    
    return { totalTopics, completedTopics, inProgressTopics };
  };

  const stats = calculateStats();
  const overallProgress = stats.totalTopics > 0 ? Math.round((stats.completedTopics / stats.totalTopics) * 100) : 0;

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-blue-500';
    if (percentage >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSubjectStats = (subject) => {
    let total = 0, completed = 0;
    subject.units?.forEach(unit => {
      unit.topics?.forEach(topic => {
        total++;
        if (topic.status === 'completed') completed++;
      });
    });
    return { total, completed, progress: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const getUnitStats = (unit) => {
    const total = unit.topics?.length || 0;
    const completed = unit.topics?.filter(t => t.status === 'completed').length || 0;
    return { total, completed, progress: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  // Toggle functions
  const toggleSubject = (id) => {
    setExpandedSubjects(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleUnit = (id) => {
    setExpandedUnits(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Topic status update
  const updateTopicStatus = async (subjectId, unitId, topicId, newStatus) => {
    const newSubjects = subjects.map(subject => {
      if (subject._id !== subjectId) return subject;
      return {
        ...subject,
        units: subject.units.map(unit => {
          if (unit._id !== unitId) return unit;
          return {
            ...unit,
            topics: unit.topics.map(topic => {
              if (topic._id !== topicId) return topic;
              return { ...topic, status: newStatus };
            })
          };
        })
      };
    });
    
    await saveSubjects(newSubjects);
    
    // Update study streak if completing a topic
    if (newStatus === 'completed') {
      const today = new Date().toDateString();
      if (studyStreak.lastStudyDate !== today) {
        const newStreak = { days: studyStreak.days + 1, lastStudyDate: today };
        await saveStreak(newStreak);
      }
      toast.success('Topic marked as completed! 🎉');
    }
  };

  // CRUD - Subjects
  const handleAddSubject = () => {
    setEditingSubject(null);
    setSubjectForm({ name: '', code: '' });
    setShowSubjectModal(true);
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setSubjectForm({ name: subject.name, code: subject.code });
    setShowSubjectModal(true);
  };

  const handleDeleteSubject = async (id) => {
    if (confirm('Delete this subject and all its units and topics?')) {
      const newSubjects = subjects.filter(s => s._id !== id);
      await saveSubjects(newSubjects);
      toast.success('Subject deleted');
    }
  };

  const saveSubject = async () => {
    if (!subjectForm.name.trim()) {
      toast.error('Please enter subject name');
      return;
    }
    let newSubjects;
    if (editingSubject) {
      newSubjects = subjects.map(s => s._id === editingSubject._id ? { ...s, ...subjectForm } : s);
      toast.success('Subject updated');
    } else {
      newSubjects = [...subjects, { _id: Date.now().toString(), ...subjectForm, units: [] }];
      toast.success('Subject added');
    }
    await saveSubjects(newSubjects);
    setShowSubjectModal(false);
  };

  // CRUD - Units
  const handleAddUnit = (subjectId) => {
    setSelectedSubjectId(subjectId);
    setEditingUnit(null);
    setUnitForm({ name: '' });
    setShowUnitModal(true);
  };

  const handleEditUnit = (subjectId, unit) => {
    setSelectedSubjectId(subjectId);
    setEditingUnit(unit);
    setUnitForm({ name: unit.name });
    setShowUnitModal(true);
  };

  const handleDeleteUnit = async (subjectId, unitId) => {
    if (confirm('Delete this unit and all its topics?')) {
      const newSubjects = subjects.map(s => {
        if (s._id !== subjectId) return s;
        return { ...s, units: s.units.filter(u => u._id !== unitId) };
      });
      await saveSubjects(newSubjects);
      toast.success('Unit deleted');
    }
  };

  const saveUnit = async () => {
    if (!unitForm.name.trim()) {
      toast.error('Please enter unit name');
      return;
    }
    const newSubjects = subjects.map(s => {
      if (s._id !== selectedSubjectId) return s;
      if (editingUnit) {
        return { ...s, units: s.units.map(u => u._id === editingUnit._id ? { ...u, ...unitForm } : u) };
      } else {
        return { ...s, units: [...(s.units || []), { _id: Date.now().toString(), ...unitForm, topics: [] }] };
      }
    });
    await saveSubjects(newSubjects);
    toast.success(editingUnit ? 'Unit updated' : 'Unit added');
    setShowUnitModal(false);
  };

  // CRUD - Topics
  const handleAddTopic = (subjectId, unitId) => {
    setSelectedSubjectId(subjectId);
    setSelectedUnitId(unitId);
    setEditingTopic(null);
    setTopicForm({ name: '', status: 'not-started' });
    setShowTopicModal(true);
  };

  const handleEditTopic = (subjectId, unitId, topic) => {
    setSelectedSubjectId(subjectId);
    setSelectedUnitId(unitId);
    setEditingTopic(topic);
    setTopicForm({ name: topic.name, status: topic.status });
    setShowTopicModal(true);
  };

  const handleDeleteTopic = async (subjectId, unitId, topicId) => {
    if (confirm('Delete this topic?')) {
      const newSubjects = subjects.map(s => {
        if (s._id !== subjectId) return s;
        return {
          ...s,
          units: s.units.map(u => {
            if (u._id !== unitId) return u;
            return { ...u, topics: u.topics.filter(t => t._id !== topicId) };
          })
        };
      });
      await saveSubjects(newSubjects);
      toast.success('Topic deleted');
    }
  };

  const saveTopic = async () => {
    if (!topicForm.name.trim()) {
      toast.error('Please enter topic name');
      return;
    }
    const newSubjects = subjects.map(s => {
      if (s._id !== selectedSubjectId) return s;
      return {
        ...s,
        units: s.units.map(u => {
          if (u._id !== selectedUnitId) return u;
          if (editingTopic) {
            return { ...u, topics: u.topics.map(t => t._id === editingTopic._id ? { ...t, ...topicForm } : t) };
          } else {
            return { ...u, topics: [...(u.topics || []), { _id: Date.now().toString(), ...topicForm }] };
          }
        })
      };
    });
    await saveSubjects(newSubjects);
    toast.success(editingTopic ? 'Topic updated' : 'Topic added');
    setShowTopicModal(false);
  };

  // Achievements check
  const achievements = DEFAULT_ACHIEVEMENTS.map(a => ({
    ...a,
    earned: stats.completedTopics >= a.target
  }));

  // Loading state
  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <Loader className="w-6 h-6 animate-spin" />
            <span>Loading progress data...</span>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Circular Progress Ring */}
              <div className="relative">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle cx="56" cy="56" r="48" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="none" />
                  <circle 
                    cx="56" cy="56" r="48" 
                    stroke="url(#progressGradient)" 
                    strokeWidth="8" 
                    fill="none" 
                    strokeLinecap="round"
                    strokeDasharray={`${overallProgress * 3.02} 302`}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{overallProgress}%</span>
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-8 h-8" />
                  <h1 className="text-3xl font-bold">Progress Tracker</h1>
                </div>
                <p className="text-white/80 max-w-lg">
                  Track your learning journey across all subjects. Stay organized and motivated!
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                    <Flame className="w-4 h-4 text-orange-300" />
                    <span className="text-sm font-medium">{studyStreak.days} Day Streak</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                    <Trophy className="w-4 h-4 text-yellow-300" />
                    <span className="text-sm font-medium">{achievements.filter(a => a.earned).length} Badges</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleAddSubject}
              className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              Add Subject
            </button>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Overall Progress', value: `${overallProgress}%`, icon: TrendingUp, gradient: 'from-indigo-500 to-purple-600', subtext: 'Keep pushing!' },
            { label: 'Topics Completed', value: `${stats.completedTopics}/${stats.totalTopics}`, icon: CheckCircle, gradient: 'from-emerald-500 to-teal-600', subtext: 'Great progress' },
            { label: 'In Progress', value: stats.inProgressTopics, icon: Clock, gradient: 'from-amber-500 to-orange-600', subtext: 'Stay focused' },
            { label: 'Study Streak', value: `${studyStreak.days} days`, icon: Flame, gradient: 'from-rose-500 to-pink-600', subtext: 'On fire! 🔥' },
          ].map((stat, idx) => (
            <div 
              key={idx}
              className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${stat.gradient}`}></div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.subtext}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Subject Progress - Expandable Tree */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Subject Progress</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Click to expand subjects and manage topics</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 space-y-3">
            {subjects.map((subject, subjectIndex) => {
              const subjectStats = getSubjectStats(subject);
              const isExpanded = expandedSubjects[subject._id];
              const subjectColor = getSubjectColor(subjectIndex);
              
              return (
                <div 
                  key={subject._id} 
                  className={`rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 animate-fade-in ${isExpanded ? 'shadow-md' : 'hover:shadow-sm'}`}
                  style={{ animationDelay: `${subjectIndex * 50}ms` }}
                >
                  {/* Subject Header */}
                  <div 
                    className={`flex items-center justify-between p-4 cursor-pointer transition-all duration-200 ${subjectColor.light}`}
                    onClick={() => toggleSubject(subject._id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${subjectColor.gradient} text-white shadow-sm`}>
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{subject.name}</h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{subject.code}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Circular Progress */}
                      <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 transform -rotate-90">
                          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="none" className="text-gray-200 dark:text-gray-600" />
                          <circle 
                            cx="24" cy="24" r="20" 
                            stroke="currentColor" 
                            strokeWidth="4" 
                            fill="none" 
                            strokeLinecap="round"
                            strokeDasharray={`${subjectStats.progress * 1.26} 126`}
                            className={`text-emerald-500 transition-all duration-500`}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-300">
                          {subjectStats.progress}%
                        </span>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{subjectStats.completed}/{subjectStats.total}</p>
                        <p className="text-xs text-gray-500">topics</p>
                      </div>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => handleAddUnit(subject._id)} className="p-2 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-colors" title="Add Unit">
                          <Plus className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEditSubject(subject)} className="p-2 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors" title="Edit Subject">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteSubject(subject._id)} className="p-2 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg transition-colors" title="Delete Subject">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Units */}
                  {isExpanded && (
                    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                      <div className="p-4 space-y-2">
                        {subject.units?.map((unit, unitIndex) => {
                          const unitStats = getUnitStats(unit);
                          const isUnitExpanded = expandedUnits[unit._id];
                          
                          return (
                            <div 
                              key={unit._id} 
                              className="ml-4 border-l-2 border-gray-200 dark:border-gray-600 animate-fade-in"
                              style={{ animationDelay: `${unitIndex * 30}ms` }}
                            >
                              {/* Unit Header */}
                              <div 
                                className="flex items-center justify-between py-3 px-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-r-lg transition-colors"
                                onClick={() => toggleUnit(unit._id)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`p-1.5 rounded-lg ${isUnitExpanded ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                                    {isUnitExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                  </div>
                                  <span className="font-medium text-gray-800 dark:text-gray-200">{unit.name}</span>
                                  <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                    {unitStats.completed}/{unitStats.total}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                  <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                                    <div 
                                      className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(unitStats.progress)}`} 
                                      style={{ width: `${unitStats.progress}%` }} 
                                    />
                                  </div>
                                  <button onClick={() => handleAddTopic(subject._id, unit._id)} className="p-1.5 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg" title="Add Topic">
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => handleEditUnit(subject._id, unit)} className="p-1.5 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg" title="Edit Unit">
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => handleDeleteUnit(subject._id, unit._id)} className="p-1.5 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg" title="Delete Unit">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              
                              {/* Topics */}
                              {isUnitExpanded && (
                                <div className="ml-8 py-2 space-y-1">
                                  {unit.topics?.map((topic, topicIndex) => {
                                    const statusOption = STATUS_OPTIONS.find(s => s.value === topic.status) || STATUS_OPTIONS[0];
                                    const StatusIcon = statusOption.icon;
                                    
                                    return (
                                      <div 
                                        key={topic._id} 
                                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 group transition-all duration-200 animate-fade-in"
                                        style={{ animationDelay: `${topicIndex * 20}ms` }}
                                      >
                                        <div className="flex items-center gap-3">
                                          <StatusIcon className={`w-4 h-4 ${statusOption.textColor}`} />
                                          <span className="text-sm text-gray-700 dark:text-gray-300">{topic.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <select
                                            value={topic.status}
                                            onChange={(e) => updateTopicStatus(subject._id, unit._id, topic._id, e.target.value)}
                                            className={`text-xs px-3 py-1.5 rounded-lg border-0 cursor-pointer font-medium bg-gradient-to-r ${statusOption.gradient} text-white shadow-sm hover:shadow-md transition-shadow`}
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            {STATUS_OPTIONS.map(opt => (
                                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                          </select>
                                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEditTopic(subject._id, unit._id, topic)} className="p-1.5 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg">
                                              <Edit2 className="w-3 h-3" />
                                            </button>
                                            <button onClick={() => handleDeleteTopic(subject._id, unit._id, topic._id)} className="p-1.5 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg">
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  {(!unit.topics || unit.topics.length === 0) && (
                                    <p className="text-sm text-gray-500 italic py-3 px-3 flex items-center gap-2">
                                      <AlertCircle className="w-4 h-4" />
                                      No topics yet. Click + to add topics.
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {(!subject.units || subject.units.length === 0) && (
                          <p className="text-sm text-gray-500 italic py-4 pl-4 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            No units yet. Click + to add units.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {subjects.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-indigo-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Subjects Yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Start tracking your progress by adding your first subject!</p>
                <button
                  onClick={handleAddSubject}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Subject
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/10 dark:to-yellow-900/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Achievements</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Unlock badges by completing topics</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, idx) => (
              <div 
                key={achievement.id}
                className={`relative overflow-hidden p-5 rounded-xl border-2 transition-all duration-300 animate-fade-in ${
                  achievement.earned 
                    ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 shadow-md' 
                    : 'border-gray-200 dark:border-gray-700 opacity-70 grayscale'
                }`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {achievement.earned && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-sm">
                      UNLOCKED!
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className={`text-4xl p-2 rounded-xl ${achievement.earned ? 'bg-amber-100 dark:bg-amber-900/30 animate-bounce-subtle' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${achievement.earned ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {achievement.description}
                    </p>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">{Math.min(stats.completedTopics, achievement.target)}/{achievement.target}</span>
                        <span className="font-medium">{Math.min(100, Math.round((stats.completedTopics / achievement.target) * 100))}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${achievement.earned ? 'bg-gradient-to-r from-amber-500 to-yellow-500' : 'bg-gray-400'}`}
                          style={{ width: `${Math.min(100, (stats.completedTopics / achievement.target) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Weekly Activity</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Keep your streak going!</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-center max-w-lg mx-auto">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                const isActive = idx < studyStreak.days % 7 || studyStreak.days >= 7;
                const isToday = idx === new Date().getDay() - 1;
                return (
                  <div key={day} className="flex flex-col items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{day}</span>
                    <div 
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 scale-105' 
                          : isToday 
                            ? 'border-2 border-dashed border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      {isActive ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : isToday ? (
                        <Zap className="w-5 h-5 text-indigo-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="text-center mt-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl">
                <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {studyStreak.days} day streak!
                </span>
                <span className="text-2xl">🔥</span>
              </div>
              <p className="text-sm text-gray-500 mt-3">Complete a topic every day to maintain your streak!</p>
            </div>
          </div>
        </div>

        {/* Subject Modal */}
        {showSubjectModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">{editingSubject ? 'Edit Subject' : 'Add New Subject'}</h2>
                  </div>
                  <button onClick={() => setShowSubjectModal(false)} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Data Structures" 
                    value={subjectForm.name} 
                    onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} 
                    className="input-modern" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject Code</label>
                  <input 
                    type="text" 
                    placeholder="e.g., CS301" 
                    value={subjectForm.code} 
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })} 
                    className="input-modern" 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <button onClick={() => setShowSubjectModal(false)} className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors">
                  Cancel
                </button>
                <button onClick={saveSubject} className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium flex items-center gap-2">
                  <Save className="w-4 h-4" /> 
                  {editingSubject ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Unit Modal */}
        {showUnitModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">{editingUnit ? 'Edit Unit' : 'Add New Unit'}</h2>
                  </div>
                  <button onClick={() => setShowUnitModal(false)} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unit Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g., Arrays & Linked Lists" 
                  value={unitForm.name} 
                  onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })} 
                  className="input-modern" 
                />
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <button onClick={() => setShowUnitModal(false)} className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors">
                  Cancel
                </button>
                <button onClick={saveUnit} className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium flex items-center gap-2">
                  <Save className="w-4 h-4" /> 
                  {editingUnit ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Topic Modal */}
        {showTopicModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">{editingTopic ? 'Edit Topic' : 'Add New Topic'}</h2>
                  </div>
                  <button onClick={() => setShowTopicModal(false)} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Topic Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Binary Search Trees" 
                    value={topicForm.name} 
                    onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })} 
                    className="input-modern" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {STATUS_OPTIONS.map(opt => {
                      const StatusIcon = opt.icon;
                      const isSelected = topicForm.status === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setTopicForm({ ...topicForm, status: opt.value })}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                            isSelected 
                              ? `border-transparent bg-gradient-to-r ${opt.gradient} text-white shadow-md` 
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <StatusIcon className="w-5 h-5" />
                          <span className="text-xs font-medium">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <button onClick={() => setShowTopicModal(false)} className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors">
                  Cancel
                </button>
                <button onClick={saveTopic} className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium flex items-center gap-2">
                  <Save className="w-4 h-4" /> 
                  {editingTopic ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

export default Progress;
