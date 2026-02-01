import { useState, useEffect, useCallback } from 'react';
import StudentLayout from '../../components/layout/StudentLayout';
import Card from '../../components/common/Card';
import { Plus, Edit2, Trash2, X, Calendar, Clock, MapPin, BookOpen, Sparkles, Save, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { getData, saveData } from '../../services/userDataService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'
];

const INITIAL_SCHEDULE = [
  { _id: '1', day: 'Monday', time: '9:00 AM', subject: 'Data Structures', room: 'Room 301', type: 'Lecture' },
  { _id: '2', day: 'Monday', time: '11:00 AM', subject: 'Database Systems', room: 'Lab 102', type: 'Lab' },
  { _id: '3', day: 'Monday', time: '2:00 PM', subject: 'Operating Systems', room: 'Room 205', type: 'Lecture' },
  { _id: '4', day: 'Tuesday', time: '10:00 AM', subject: 'Computer Networks', room: 'Room 401', type: 'Lecture' },
  { _id: '5', day: 'Tuesday', time: '2:00 PM', subject: 'Data Structures', room: 'Lab 101', type: 'Lab' },
  { _id: '6', day: 'Wednesday', time: '9:00 AM', subject: 'Operating Systems', room: 'Room 205', type: 'Lecture' },
  { _id: '7', day: 'Wednesday', time: '11:00 AM', subject: 'Database Systems', room: 'Room 302', type: 'Lecture' },
  { _id: '8', day: 'Thursday', time: '9:00 AM', subject: 'Data Structures', room: 'Room 301', type: 'Lecture' },
  { _id: '9', day: 'Friday', time: '10:00 AM', subject: 'Database Systems', room: 'Room 302', type: 'Lecture' },
];

// Default subjects - students can add custom ones
const DEFAULT_SUBJECTS = ['Data Structures', 'Database Systems', 'Operating Systems', 'Computer Networks', 'Web Development', 'Mathematics'];

const CLASS_TYPES = ['Lecture', 'Lab', 'Tutorial', 'Seminar'];

const TYPE_COLORS = {
  Lecture: { gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500' },
  Lab: { gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500' },
  Tutorial: { gradient: 'from-purple-500 to-violet-600', bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500' },
  Seminar: { gradient: 'from-orange-500 to-amber-600', bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500' },
};

function Timetable() {
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay() - 1] || 'Monday');
  const [viewMode, setViewMode] = useState('day');
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [customSubjects, setCustomSubjects] = useState([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [newCustomSubject, setNewCustomSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    day: 'Monday',
    time: '9:00 AM',
    subject: '',
    room: '',
    type: 'Lecture'
  });

  // Load data from backend on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [timetableData, subjectsData] = await Promise.all([
          getData('timetable_data', INITIAL_SCHEDULE),
          getData('custom_subjects', [])
        ]);
        setSchedule(timetableData);
        setCustomSubjects(subjectsData);
      } catch (error) {
        console.error('Failed to load timetable data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Save schedule to backend
  const saveSchedule = useCallback(async (newSchedule) => {
    setSchedule(newSchedule);
    await saveData('timetable_data', newSchedule);
  }, []);

  // Save custom subjects to backend
  const saveCustomSubjectsData = useCallback(async (subjects) => {
    setCustomSubjects(subjects);
    await saveData('custom_subjects', subjects);
  }, []);

  // Get all subjects (default + custom)
  const ALL_SUBJECTS = [...DEFAULT_SUBJECTS, ...customSubjects];

  // Add custom subject
  const addCustomSubject = async () => {
    if (newCustomSubject.trim() && !ALL_SUBJECTS.includes(newCustomSubject.trim())) {
      const updated = [...customSubjects, newCustomSubject.trim()];
      await saveCustomSubjectsData(updated);
      setFormData({ ...formData, subject: newCustomSubject.trim() });
      setNewCustomSubject('');
      setShowCustomInput(false);
      toast.success('Subject added!');
    }
  };

  const getTypeColor = (type) => {
    return TYPE_COLORS[type] || TYPE_COLORS.Lecture;
  };

  const todaySchedule = schedule
    .filter(s => s.day === selectedDay)
    .sort((a, b) => TIME_SLOTS.indexOf(a.time) - TIME_SLOTS.indexOf(b.time));

  // Open modal for creating
  const handleCreate = () => {
    setEditingClass(null);
    setFormData({
      day: selectedDay,
      time: '9:00 AM',
      subject: '',
      room: '',
      type: 'Lecture'
    });
    setShowModal(true);
  };

  // Open modal for editing
  const handleEdit = (classItem) => {
    setEditingClass(classItem);
    setFormData({
      day: classItem.day,
      time: classItem.time,
      subject: classItem.subject,
      room: classItem.room || '',
      type: classItem.type
    });
    setShowModal(true);
  };

  // Delete class
  const handleDelete = async (classId) => {
    if (confirm('Are you sure you want to delete this class?')) {
      const newSchedule = schedule.filter(s => s._id !== classId);
      await saveSchedule(newSchedule);
      toast.success('Class deleted');
    }
  };

  // Save class
  const handleSave = async () => {
    if (!formData.subject.trim()) {
      alert('Please select a subject');
      return;
    }

    let newSchedule;
    if (editingClass) {
      newSchedule = schedule.map(s => 
        s._id === editingClass._id ? { ...s, ...formData } : s
      );
    } else {
      const newClass = {
        _id: Date.now().toString(),
        ...formData
      };
      newSchedule = [...schedule, newClass];
    }
    await saveSchedule(newSchedule);
    toast.success(editingClass ? 'Class updated' : 'Class added');
    setShowModal(false);
  };

  // Loading state
  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <Loader className="w-6 h-6 animate-spin" />
            <span>Loading timetable...</span>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Calendar className="w-12 h-12" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">My Timetable</h1>
                <p className="text-white/80 mt-2">Organize your classes and never miss a lecture</p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm font-medium">{schedule.length} Classes</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{todaySchedule.length} Today</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-white/20 backdrop-blur-sm rounded-xl p-1">
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    viewMode === 'day'
                      ? 'bg-white text-indigo-600 shadow-md'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Day View
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    viewMode === 'week'
                      ? 'bg-white text-indigo-600 shadow-md'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Week View
                </button>
              </div>
              
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                Add Class
              </button>
            </div>
          </div>
        </div>

        {/* Day View */}
        {viewMode === 'day' && (
          <>
            {/* Day Selector */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const idx = DAYS.indexOf(selectedDay);
                    setSelectedDay(DAYS[(idx - 1 + DAYS.length) % DAYS.length]);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-500" />
                </button>
                
                <div className="flex-1 flex gap-2 overflow-x-auto py-1">
                  {DAYS.map((day, idx) => {
                    const dayClasses = schedule.filter(s => s.day === day).length;
                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`flex-1 min-w-[100px] px-4 py-3 rounded-xl font-medium whitespace-nowrap transition-all duration-300 ${
                          selectedDay === day
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                            : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="text-center">
                          <span className="block text-sm">{day.slice(0, 3)}</span>
                          <span className={`text-xs mt-1 ${selectedDay === day ? 'text-white/70' : 'text-gray-400'}`}>
                            {dayClasses} class{dayClasses !== 1 ? 'es' : ''}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => {
                    const idx = DAYS.indexOf(selectedDay);
                    setSelectedDay(DAYS[(idx + 1) % DAYS.length]);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Schedule Cards */}
            <div className="space-y-4">
              {todaySchedule.length > 0 ? (
                todaySchedule.map((slot, idx) => {
                  const typeColor = getTypeColor(slot.type);
                  return (
                    <div 
                      key={slot._id} 
                      className={`group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in`}
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${typeColor.gradient}`}></div>
                      
                      <div className="p-5 pl-6 flex items-center justify-between">
                        <div className="flex items-start gap-5">
                          {/* Time Badge */}
                          <div className={`flex flex-col items-center p-3 rounded-xl ${typeColor.bg}`}>
                            <Clock className={`w-5 h-5 ${typeColor.text} mb-1`} />
                            <p className={`font-bold ${typeColor.text}`}>{slot.time}</p>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {slot.subject}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                              {slot.room && (
                                <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                                  <MapPin className="w-4 h-4" />
                                  {slot.room}
                                </span>
                              )}
                              <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${typeColor.gradient} text-white`}>
                                {slot.type}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => handleEdit(slot)}
                            className="p-2 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(slot._id)}
                            className="p-2 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 flex items-center justify-center">
                    <Calendar className="w-10 h-10 text-cyan-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No classes on {selectedDay}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Enjoy your free day or add a class!</p>
                  <button
                    onClick={handleCreate}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    Add Class
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Week View */}
        {viewMode === 'week' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750">
                    <th className="p-4 text-left text-gray-500 dark:text-gray-400 font-semibold w-24 border-b border-gray-200 dark:border-gray-700">Time</th>
                    {DAYS.map(day => (
                      <th key={day} className="p-4 text-center text-gray-700 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-gray-700">
                        <span className="block">{day}</span>
                        <span className="text-xs text-gray-400 font-normal">{schedule.filter(s => s.day === day).length} classes</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map((time, timeIdx) => (
                    <tr key={time} className={`border-b border-gray-100 dark:border-gray-700/50 ${timeIdx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'}`}>
                      <td className="p-3 text-sm text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
                        {time}
                      </td>
                      {DAYS.map(day => {
                        const slot = schedule.find(s => s.day === day && s.time === time);
                        const typeColor = slot ? getTypeColor(slot.type) : null;
                        return (
                          <td key={day} className="p-2">
                            {slot ? (
                              <div 
                                className={`p-3 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${typeColor.bg} border-l-4 ${typeColor.border}`}
                                onClick={() => handleEdit(slot)}
                              >
                                <p className={`font-medium text-sm ${typeColor.text} truncate`}>{slot.subject}</p>
                                {slot.room && <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{slot.room}</p>}
                                <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-gradient-to-r ${typeColor.gradient} text-white`}>
                                  {slot.type}
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setFormData({ ...formData, day, time });
                                  handleCreate();
                                }}
                                className="w-full h-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200 group"
                              >
                                <Plus className="w-4 h-4 mx-auto text-gray-300 group-hover:text-indigo-500 transition-colors" />
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Class Types Legend
          </h3>
          <div className="flex flex-wrap gap-4">
            {CLASS_TYPES.map(type => {
              const typeColor = TYPE_COLORS[type];
              return (
                <div key={type} className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${typeColor.gradient}`}></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{type}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
              <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">{editingClass ? 'Edit Class' : 'Add New Class'}</h2>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Day & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Day</label>
                    <select
                      value={formData.day}
                      onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                      className="input-modern"
                    >
                      {DAYS.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time</label>
                    <select
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="input-modern"
                    >
                      {TIME_SLOTS.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject *</label>
                  {!showCustomInput ? (
                    <select
                      value={formData.subject}
                      onChange={(e) => {
                        if (e.target.value === '__add_custom__') {
                          setShowCustomInput(true);
                        } else {
                          setFormData({ ...formData, subject: e.target.value });
                        }
                      }}
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
                        placeholder="Enter custom subject"
                        className="flex-1 input-modern"
                        autoFocus
                      />
                      <button type="button" onClick={addCustomSubject} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-md transition-all">Add</button>
                      <button type="button" onClick={() => { setShowCustomInput(false); setNewCustomSubject(''); }} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">✕</button>
                    </div>
                  )}
                </div>

                {/* Room */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Room / Location</label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="e.g., Room 301, Lab 102"
                    className="input-modern"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Class Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {CLASS_TYPES.map(type => {
                      const typeColor = TYPE_COLORS[type];
                      const isSelected = formData.type === type;
                      return (
                        <button
                          key={type}
                          onClick={() => setFormData({ ...formData, type })}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                            isSelected 
                              ? `border-transparent bg-gradient-to-r ${typeColor.gradient} text-white shadow-md` 
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <span className="text-xs font-medium">{type}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingClass ? 'Save Changes' : 'Add Class'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

export default Timetable;
