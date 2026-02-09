import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import StudentLayout from '../../components/layout/StudentLayout';
import Card from '../../components/common/Card';
import SmartSearch from '../../components/common/SmartSearch';
import { Search, Plus, Edit2, Trash2, X, FileText, Upload, File, Image, Download, Eye, Star, Heart, Filter, Tag, BookOpen, Sparkles, FolderOpen, Zap, Brain, AlertTriangle, CheckCircle, TrendingUp, Copy, RefreshCw, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const API_URL = 'http://localhost:5000/api';

// Default subjects - students can add custom ones
const DEFAULT_SUBJECTS = ['Data Structures', 'Database Systems', 'Operating Systems', 'Computer Networks', 'Web Development', 'Mathematics', 'Physics'];

// Tag definitions with colors and gradients
const TAG_DEFINITIONS = {
  'important': { label: 'Important', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', gradient: 'from-red-500 to-rose-500' },
  'exam-focused': { label: 'Exam Focused', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', gradient: 'from-amber-500 to-orange-500' },
  'revision': { label: 'Revision', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', gradient: 'from-emerald-500 to-green-500' },
  'formulas': { label: 'Formulas', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300', gradient: 'from-violet-500 to-purple-500' },
  'homework': { label: 'Homework', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', gradient: 'from-blue-500 to-cyan-500' },
};

// AI Tag definitions
const AI_TAG_DEFINITIONS = {
  'high-value': { label: 'High Value', color: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white', icon: '⭐' },
  'exam-important': { label: 'Exam Important', color: 'bg-gradient-to-r from-red-500 to-rose-500 text-white', icon: '🎯' },
  'formula-heavy': { label: 'Formula Heavy', color: 'bg-gradient-to-r from-purple-500 to-violet-500 text-white', icon: '🔢' },
  'definition-rich': { label: 'Definition Rich', color: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white', icon: '📖' },
  'pyq-relevant': { label: 'PYQ Relevant', color: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white', icon: '📋' },
  'needs-review': { label: 'Needs Review', color: 'bg-gradient-to-r from-gray-500 to-slate-500 text-white', icon: '🔄' },
  'well-structured': { label: 'Well Structured', color: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white', icon: '✨' },
  'quick-revision': { label: 'Quick Revision', color: 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white', icon: '⚡' },
};

// Subject colors for visual distinction
const SUBJECT_COLORS = [
  'from-indigo-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-red-500',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-blue-600',
  'from-amber-500 to-yellow-600',
  'from-violet-500 to-purple-600',
];

const getSubjectColor = (subject) => {
  const index = subject ? subject.length % SUBJECT_COLORS.length : 0;
  return SUBJECT_COLORS[index];
};

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

// Load favorites from localStorage
const loadFavorites = () => {
  try {
    const stored = localStorage.getItem('edutrack_favorites');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

const saveFavorites = (favorites) => {
  localStorage.setItem('edutrack_favorites', JSON.stringify(favorites));
};

function Notes() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [customSubjects, setCustomSubjects] = useState(loadCustomSubjects);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [newCustomSubject, setNewCustomSubject] = useState('');
  const [favorites, setFavorites] = useState(loadFavorites);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    subject: '',
    tags: [],
    rating: 0
  });
  
  // AI-related state
  const [showSmartSearch, setShowSmartSearch] = useState(false);
  const [analyzingNotes, setAnalyzingNotes] = useState(false);
  const [duplicates, setDuplicates] = useState([]);
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
  const [filterAI, setFilterAI] = useState(''); // AI tag filter
  const [showAIOnly, setShowAIOnly] = useState(false); // Show only AI-analyzed notes

  // Fetch notes from backend on mount
  useEffect(() => {
    fetchNotes();
  }, []);

  // Sync search query from URL params
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  // Fetch notes from backend
  const fetchNotes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // API returns { data: { notes: [...], pagination: {...} } }
        const notesArray = Array.isArray(data.data) ? data.data : (data.data?.notes || []);
        // Normalize populated object fields (subject, unit) to plain strings
        const normalized = notesArray.map(note => ({
          ...note,
          subject: note.subject && typeof note.subject === 'object' ? note.subject.name : note.subject,
          unit: note.unit && typeof note.unit === 'object' ? note.unit.name : note.unit,
        }));
        setNotes(normalized);
      } else {
        // Fallback to localStorage if backend fails
        const stored = localStorage.getItem('edutrack_notes');
        if (stored) {
          setNotes(JSON.parse(stored));
        }
      }
    } catch (error) {
      console.log('Backend not available, using local storage');
      const stored = localStorage.getItem('edutrack_notes');
      if (stored) {
        setNotes(JSON.parse(stored));
      } else {
        // Default demo notes
        setNotes([
          { 
            _id: '1', 
            title: 'Introduction to Trees', 
            description: 'Complete guide to tree data structures including BST, AVL, and Red-Black trees.',
            content: 'Trees are hierarchical data structures...',
            subject: 'Data Structures',
            tags: ['important', 'exam-focused'],
            file: null,
            rating: 5,
            createdAt: new Date().toISOString()
          },
          { 
            _id: '2', 
            title: 'Database Normalization', 
            description: 'Understanding 1NF, 2NF, 3NF, and BCNF with practical examples.',
            content: 'Normalization is the process of organizing data...',
            subject: 'Database Systems',
            tags: ['important'],
            file: null,
            rating: 4,
            createdAt: new Date().toISOString()
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Save notes (create or update) to backend
  const saveNoteToBackend = async (noteData, isUpdate = false, noteId = null) => {
    try {
      const token = localStorage.getItem('token');
      const url = isUpdate ? `${API_URL}/notes/${noteId}` : `${API_URL}/notes`;
      const method = isUpdate ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(noteData)
      });
      
      const data = await res.json();
      if (data.success) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.log('Backend save failed, saving locally');
      return null;
    }
  };

  // Delete note from backend
  const deleteNoteFromBackend = async (noteId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/notes/${noteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      return data.success;
    } catch (error) {
      console.log('Backend delete failed');
      return false;
    }
  };

  // Local storage fallback
  const saveNotesLocally = (newNotes) => {
    localStorage.setItem('edutrack_notes', JSON.stringify(newNotes));
  };

  // Check for duplicates on mount
  useEffect(() => {
    if (notes.length > 0) {
      checkForDuplicates();
    }
  }, [notes]);

  // Check for duplicate notes using AI
  const checkForDuplicates = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const res = await fetch(`${API_URL}/ai/duplicates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setDuplicates(data.data);
        setShowDuplicateAlert(true);
      }
    } catch (error) {
      // Silently fail - duplicates are a nice-to-have feature
      console.log('Duplicate check not available');
    }
  };

  // Analyze all notes with AI
  const handleAnalyzeAllNotes = async () => {
    setAnalyzingNotes(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/ai/analyze-notes`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Analyzed ${data.data.analyzed} notes with AI`);
        // Refresh notes to get AI scores
        await fetchNotes();
      }
    } catch (error) {
      toast.error('AI analysis not available');
    } finally {
      setAnalyzingNotes(false);
    }
  };

  // Analyze single note
  const handleAnalyzeNote = async (noteId, e) => {
    e?.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/ai/analyze-note/${noteId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // Update local note with AI data
        const updatedNotes = notes.map(n => 
          n._id === noteId ? { 
            ...n, 
            aiScore: data.data.score,
            aiTags: data.data.tags,
            aiKeywords: data.data.keywords,
            aiSummary: data.data.summary,
            aiAnalyzedAt: new Date().toISOString()
          } : n
        );
        setNotes(updatedNotes);
        saveNotesLocally(updatedNotes);
        toast.success('Note analyzed with AI');
      }
    } catch (error) {
      toast.error('AI analysis failed');
    }
  };

  // Handle smart search result selection
  const handleSmartSearchResult = (note) => {
    navigate(`/notes/${note._id}`);
    setShowSmartSearch(false);
  };

  // Get all subjects (default + custom)
  const ALL_SUBJECTS = [...DEFAULT_SUBJECTS, ...customSubjects];

  // Toggle favorite
  const toggleFavorite = (noteId, e) => {
    e.stopPropagation();
    let updated;
    if (favorites.includes(noteId)) {
      updated = favorites.filter(id => id !== noteId);
    } else {
      updated = [...favorites, noteId];
    }
    setFavorites(updated);
    saveFavorites(updated);
    toast.success(favorites.includes(noteId) ? 'Removed from favorites' : 'Added to favorites');
  };

  // Update rating
  const updateRating = async (noteId, rating, e) => {
    e.stopPropagation();
    const updatedNotes = notes.map(n => 
      n._id === noteId ? { ...n, rating } : n
    );
    setNotes(updatedNotes);
    saveNotesLocally(updatedNotes);
    
    // Try to update in backend
    await saveNoteToBackend({ rating }, true, noteId);
    toast.success(`Rating updated to ${rating} stars`);
  };

  // Add custom subject
  const addCustomSubject = () => {
    if (newCustomSubject.trim() && !ALL_SUBJECTS.includes(newCustomSubject.trim())) {
      const updated = [...customSubjects, newCustomSubject.trim()];
      setCustomSubjects(updated);
      saveCustomSubjects(updated);
      setFormData({ ...formData, subject: newCustomSubject.trim() });
      setNewCustomSubject('');
      setShowCustomInput(false);
      toast.success('Subject added!');
    }
  };

  // Handle subject change
  const handleSubjectChange = (value) => {
    if (value === '__add_custom__') {
      setShowCustomInput(true);
    } else {
      setFormData({ ...formData, subject: value });
    }
  };

  // Filter notes with highlighting support
  const filteredNotes = notes.filter(note => {
    const matchesSearch = !searchQuery || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.content && note.content.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = !filterSubject || note.subject === filterSubject;
    const matchesTag = !filterTag || (note.tags && note.tags.includes(filterTag));
    const matchesFavorite = !showFavoritesOnly || favorites.includes(note._id);
    const matchesAITag = !filterAI || (note.aiTags && note.aiTags.includes(filterAI));
    const matchesAIOnly = !showAIOnly || note.aiAnalyzedAt;
    return matchesSearch && matchesSubject && matchesTag && matchesFavorite && matchesAITag && matchesAIOnly;
  });

  // Highlight search text in string
  const highlightText = (text, query) => {
    if (!query || !text) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">{part}</mark>
        : part
    );
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF and image files are allowed');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }

    toast.success(`File selected: ${file.name}`);
  };

  // Remove selected file
  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Open modal for creating new note
  const handleCreate = () => {
    setEditingNote(null);
    setFormData({ title: '', description: '', content: '', subject: '', tags: [], rating: 0 });
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowModal(true);
  };

  // Open modal for editing
  const handleEdit = (note, e) => {
    e.stopPropagation();
    setEditingNote(note);
    setFormData({
      title: note.title,
      description: note.description,
      content: note.content || '',
      subject: note.subject,
      tags: note.tags || [],
      rating: note.rating || 0
    });
    setSelectedFile(null);
    setPreviewUrl(note.file?.url || null);
    setShowModal(true);
  };

  // Delete note
  const handleDelete = async (noteId, e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this note?')) {
      // Try to delete from backend
      await deleteNoteFromBackend(noteId);
      
      // Update local state
      const updatedNotes = notes.filter(n => n._id !== noteId);
      setNotes(updatedNotes);
      saveNotesLocally(updatedNotes);
      toast.success('Note deleted');
    }
  };

  // Upload file to backend
  const uploadFileToBackend = async (file) => {
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    
    try {
      // Try to upload to backend
      const response = await api.post('/api/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data;
    } catch (error) {
      // If backend is not available, store as base64 locally
      console.log('Backend not available, storing file locally');
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            url: e.target.result,
            filename: file.name,
            mimetype: file.type,
            size: file.size,
            isLocal: true
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Save note (create or update)
  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setUploading(true);

    try {
      let fileData = editingNote?.file || null;

      // Upload new file if selected
      if (selectedFile) {
        fileData = await uploadFileToBackend(selectedFile);
      }

      const noteData = {
        ...formData,
        file: fileData
      };

      if (editingNote) {
        // Update existing note - try backend first
        const backendResult = await saveNoteToBackend(noteData, true, editingNote._id);
        
        if (backendResult) {
          // Backend succeeded, use returned data
          const updatedNotes = notes.map(n => 
            n._id === editingNote._id ? backendResult : n
          );
          setNotes(updatedNotes);
          saveNotesLocally(updatedNotes);
        } else {
          // Backend failed, save locally
          const updatedNotes = notes.map(n => 
            n._id === editingNote._id 
              ? { ...n, ...noteData, updatedAt: new Date().toISOString() }
              : n
          );
          setNotes(updatedNotes);
          saveNotesLocally(updatedNotes);
        }
        toast.success('Note updated successfully');
      } else {
        // Create new note - try backend first
        const backendResult = await saveNoteToBackend(noteData, false);
        
        if (backendResult) {
          // Backend succeeded, use returned data with real _id
          setNotes([backendResult, ...notes]);
          saveNotesLocally([backendResult, ...notes]);
        } else {
          // Backend failed, save locally with temp _id
          const newNote = {
            _id: Date.now().toString(),
            ...noteData,
            createdAt: new Date().toISOString()
          };
          setNotes([newNote, ...notes]);
          saveNotesLocally([newNote, ...notes]);
        }
        toast.success('Note created successfully');
      }
      
      setShowModal(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      toast.error('Error saving note');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  // Toggle tag
  const toggleTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  // View/Download file
  const handleViewFile = (note, e) => {
    e.stopPropagation();
    if (note.file?.url) {
      window.open(note.file.url, '_blank');
    }
  };

  // Get file icon based on type
  const getFileIcon = (file) => {
    if (!file) return null;
    if (file.mimetype?.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Duplicate Alert */}
        {showDuplicateAlert && duplicates.length > 0 && (
          <div className="animate-fade-in bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-lg">
                <Copy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-amber-800 dark:text-amber-200">
                  Potential Duplicates Detected
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  AI found {duplicates.length} potential duplicate note{duplicates.length !== 1 ? 's' : ''}.
                  Consider merging or removing redundant notes.
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => navigate('/ai-insights')}
                    className="text-sm px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Review Duplicates
                  </button>
                  <button
                    onClick={() => setShowDuplicateAlert(false)}
                    className="text-sm px-3 py-1.5 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-800 rounded-lg transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 lg:p-8 text-white shadow-xl">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          </div>
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-medium text-white/80">AI-Powered Knowledge Base</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">My Notes 📚</h1>
              <p className="text-white/80">Create and organize your study notes with AI insights</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-center px-4 py-2 bg-white/15 backdrop-blur-sm rounded-xl">
                <p className="text-2xl font-bold">{notes.length}</p>
                <p className="text-xs text-white/70">Total Notes</p>
              </div>
              <div className="text-center px-4 py-2 bg-white/15 backdrop-blur-sm rounded-xl">
                <p className="text-2xl font-bold">{notes.filter(n => n.aiAnalyzedAt).length}</p>
                <p className="text-xs text-white/70">AI Analyzed</p>
              </div>
              <button
                onClick={handleAnalyzeAllNotes}
                disabled={analyzingNotes}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all font-medium disabled:opacity-50"
              >
                {analyzingNotes ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Brain className="w-4 h-4" />
                )}
                {analyzingNotes ? 'Analyzing...' : 'Analyze All'}
              </button>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-5 py-3 bg-white text-indigo-600 rounded-xl hover:bg-white/90 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
              >
                <Plus className="w-5 h-5" />
                Add Note
              </button>
            </div>
          </div>
        </div>

        {/* Smart Search */}
        <Card className="!p-4 relative z-20">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">AI Smart Search</h3>
            <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 rounded-full">Beta</span>
          </div>
          <SmartSearch 
            onResultSelect={handleSmartSearchResult}
            className="w-full"
          />
        </Card>

        {/* Search & Filters */}
        <Card className="!p-0 overflow-hidden">
          <div className="p-5 space-y-4">
            {/* Filter buttons row */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowAIOnly(!showAIOnly)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all font-medium ${
                  showAIOnly 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 border-transparent text-white shadow-lg' 
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-300'
                }`}
              >
                <Brain className="w-4 h-4" />
                AI Analyzed
              </button>
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all font-medium ${
                  showFavoritesOnly 
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 border-transparent text-white shadow-lg' 
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-pink-300'
                }`}
              >
                <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                Favorites
              </button>
              
              {/* Quick search input */}
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Quick filter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>
            
            {/* Filters row */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                <Filter className="w-4 h-4" />
                Filters:
              </div>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="px-4 py-2 text-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              >
                <option value="">All Subjects</option>
                {ALL_SUBJECTS.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="px-4 py-2 text-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              >
                <option value="">All Tags</option>
                {Object.entries(TAG_DEFINITIONS).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <select
                value={filterAI}
                onChange={(e) => setFilterAI(e.target.value)}
                className="px-4 py-2 text-sm border-2 border-indigo-200 dark:border-indigo-700 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              >
                <option value="">🤖 AI Tags</option>
                {Object.entries(AI_TAG_DEFINITIONS).map(([key, { label, icon }]) => (
                  <option key={key} value={key}>{icon} {label}</option>
                ))}
              </select>
              {(filterSubject || filterTag || filterAI || showFavoritesOnly || showAIOnly || searchQuery) && (
                <button
                  onClick={() => {
                    setFilterSubject('');
                    setFilterTag('');
                    setFilterAI('');
                    setShowFavoritesOnly(false);
                    setShowAIOnly(false);
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl font-medium transition-colors"
                >
                  ✕ Clear All
                </button>
              )}
            </div>
          </div>
          {/* Results count bar */}
          <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">{filteredNotes.length}</span> note{filteredNotes.length !== 1 ? 's' : ''} found
              {searchQuery && <span className="ml-2 text-indigo-600 dark:text-indigo-400">matching "{searchQuery}"</span>}
              {showAIOnly && <span className="ml-2 text-purple-600 dark:text-purple-400">• AI analyzed only</span>}
            </p>
          </div>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading notes from server...</p>
            </div>
          </div>
        )}

        {/* Notes Grid */}
        {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note, index) => (
            <div 
              key={note._id}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-soft hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => navigate(`/notes/${note._id}`)}
            >
              {/* Gradient accent bar */}
              <div className={`h-1.5 bg-gradient-to-r ${getSubjectColor(note.subject)}`} />
              
              {/* AI Score Badge - Top Right Corner */}
              {note.aiScore?.overall && (
                <div className="absolute top-4 right-4 z-10">
                  <div className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                    note.aiScore.overall >= 80 ? 'bg-emerald-500 text-white' :
                    note.aiScore.overall >= 60 ? 'bg-amber-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    <Zap className="w-3 h-3" />
                    {note.aiScore.overall}%
                  </div>
                </div>
              )}
              
              <div className="p-5 space-y-4">
                {/* Header with subject & actions */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-xs font-semibold bg-gradient-to-r ${getSubjectColor(note.subject)} text-white rounded-lg shadow-sm`}>
                      {note.subject || 'General'}
                    </span>
                    {note.aiAnalyzedAt && (
                      <span className="p-1 bg-indigo-100 dark:bg-indigo-900/50 rounded-md" title="AI Analyzed">
                        <Brain className="w-3 h-3 text-indigo-500" />
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {/* Analyze button */}
                    {!note.aiAnalyzedAt && (
                      <button
                        onClick={(e) => handleAnalyzeNote(note._id, e)}
                        className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        title="Analyze with AI"
                      >
                        <Brain className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => toggleFavorite(note._id, e)}
                      className={`p-2 rounded-lg transition-all ${
                        favorites.includes(note._id)
                          ? 'text-pink-500 bg-pink-50 dark:bg-pink-900/30'
                          : 'text-gray-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/30 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${favorites.includes(note._id) ? 'fill-current' : ''}`} />
                    </button>
                    {note.file && (
                      <button
                        onClick={(e) => handleViewFile(note, e)}
                        className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        title="View/Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleEdit(note, e)}
                      className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(note._id, e)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {searchQuery ? highlightText(note.title, searchQuery) : note.title}
                </h3>

                {/* AI Summary if available */}
                {note.aiSummary?.short ? (
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 border-l-2 border-indigo-400 pl-3 bg-indigo-50/50 dark:bg-indigo-900/20 py-1 rounded-r">
                    <span className="text-indigo-500 font-medium">AI: </span>
                    {note.aiSummary.short}
                  </p>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                    {searchQuery ? highlightText(note.description || 'No description', searchQuery) : (note.description || 'No description')}
                  </p>
                )}

                {/* AI Score Breakdown - Mini */}
                {note.aiScore && (
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1" title="Exam Relevance">
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                      <span className="text-gray-600 dark:text-gray-400">{note.aiScore.examRelevance || 0}%</span>
                    </div>
                    <div className="flex items-center gap-1" title="Quality Score">
                      <CheckCircle className="w-3 h-3 text-blue-500" />
                      <span className="text-gray-600 dark:text-gray-400">{note.aiScore.quality || 0}%</span>
                    </div>
                    <div className="flex items-center gap-1" title="Completeness">
                      <FileText className="w-3 h-3 text-purple-500" />
                      <span className="text-gray-600 dark:text-gray-400">{note.aiScore.completeness || 0}%</span>
                    </div>
                  </div>
                )}

                {/* Rating Stars */}
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={(e) => updateRating(note._id, star, e)}
                      className="p-0.5 hover:scale-125 transition-transform"
                    >
                      <Star 
                        className={`w-4 h-4 ${
                          star <= (note.rating || 0) 
                            ? 'text-amber-400 fill-amber-400' 
                            : 'text-gray-300 dark:text-gray-600'
                        }`} 
                      />
                    </button>
                  ))}
                  <span className="text-xs text-gray-500 ml-2 font-medium">{note.rating || 0}/5</span>
                </div>

                {/* File indicator */}
                {note.file && (
                  <div className="flex items-center gap-3 text-sm bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 px-4 py-3 rounded-xl">
                    <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                      {getFileIcon(note.file)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{note.file.filename || 'Attached file'}</p>
                      <p className="text-xs text-gray-500">{(note.file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                )}

                {/* AI Tags */}
                {note.aiTags && note.aiTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {note.aiTags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className={`px-2 py-0.5 text-xs font-medium rounded-md ${AI_TAG_DEFINITIONS[tag]?.color || 'bg-gray-200 text-gray-700'}`}
                      >
                        {AI_TAG_DEFINITIONS[tag]?.icon} {AI_TAG_DEFINITIONS[tag]?.label || tag}
                      </span>
                    ))}
                    {note.aiTags.length > 3 && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md">
                        +{note.aiTags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Manual Tags */}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map(tag => (
                      <span
                        key={tag}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg ${TAG_DEFINITIONS[tag]?.color || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                      >
                        {TAG_DEFINITIONS[tag]?.label || tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Date */}
                <p className="text-xs text-gray-400 font-medium">
                  {new Date(note.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Empty State */}
        {!loading && filteredNotes.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 mb-6">
              <FolderOpen className="w-10 h-10 text-indigo-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No notes found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {searchQuery || filterSubject ? 'Try adjusting your filters or search query' : 'Start building your knowledge base by creating your first note'}
            </p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all transform hover:scale-105 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Create Your First Note
            </button>
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-500 to-purple-600">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    {editingNote ? 'Edit Note' : 'Create New Note'}
                  </h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-5 max-h-[calc(90vh-180px)] overflow-y-auto">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-modern"
                    placeholder="Enter note title"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Subject
                  </label>
                  {!showCustomInput ? (
                    <select
                      value={formData.subject}
                      onChange={(e) => handleSubjectChange(e.target.value)}
                      className="input-modern"
                    >
                      <option value="">Select Subject</option>
                      {ALL_SUBJECTS.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                      <option value="__add_custom__">➕ Add Custom Subject...</option>
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCustomSubject}
                        onChange={(e) => setNewCustomSubject(e.target.value)}
                        placeholder="Enter custom subject name"
                        className="input-modern flex-1"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={addCustomSubject}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowCustomInput(false); setNewCustomSubject(''); }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="input-modern resize-none"
                    placeholder="Brief description of the note"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={4}
                    className="input-modern resize-none"
                    placeholder="Write your note content here..."
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Attach File (PDF or Image)
                  </label>
                  <div className="mt-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept=".pdf,image/*"
                      className="hidden"
                    />
                    
                    {!selectedFile && !previewUrl ? (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex flex-col items-center justify-center px-6 py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-400 transition-all bg-gray-50 dark:bg-gray-700/50 group"
                      >
                        <div className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                          <Upload className="w-8 h-8 text-indigo-500" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Click to upload PDF or Image
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          Max file size: 10MB
                        </span>
                      </button>
                    ) : (
                      <div className="relative border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4 bg-gray-50 dark:bg-gray-700/50">
                        <button
                          type="button"
                          onClick={removeSelectedFile}
                          className="absolute top-3 right-3 p-2 bg-red-100 dark:bg-red-900/50 text-red-600 rounded-xl hover:bg-red-200 dark:hover:bg-red-900 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        
                        {previewUrl && previewUrl.startsWith('data:image') ? (
                          <div className="text-center">
                            <img 
                              src={previewUrl} 
                              alt="Preview" 
                              className="max-h-48 mx-auto rounded-xl shadow-lg"
                            />
                            <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                              {selectedFile?.name || editingNote?.file?.filename}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <div className="p-4 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl shadow-lg">
                              <FileText className="w-8 h-8 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {selectedFile?.name || editingNote?.file?.filename || 'PDF File'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 
                                 editingNote?.file?.size ? `${(editingNote.file.size / 1024).toFixed(1)} KB` : ''}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(TAG_DEFINITIONS).map(([tag, { label, gradient }]) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all transform hover:scale-105 ${
                          formData.tags.includes(tag)
                            ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="p-1 hover:scale-125 transition-transform"
                      >
                        <Star 
                          className={`w-8 h-8 ${
                            star <= (formData.rating || 0) 
                              ? 'text-amber-400 fill-amber-400' 
                              : 'text-gray-300 dark:text-gray-600'
                          }`} 
                        />
                      </button>
                    ))}
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 ml-3">
                      {formData.rating ? `${formData.rating}/5 stars` : 'No rating'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={uploading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all transform hover:scale-105 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      {editingNote ? 'Save Changes' : 'Create Note'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

export default Notes;
