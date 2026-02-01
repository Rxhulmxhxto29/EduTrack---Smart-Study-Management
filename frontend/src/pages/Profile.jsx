import { useState, useEffect } from 'react';
import StudentLayout from '../components/layout/StudentLayout';
import Card from '../components/common/Card';
import { User, Mail, BookOpen, Calendar, Edit2, Save, Camera, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Default avatar options
const AVATAR_OPTIONS = [
  {
    id: 'male',
    name: 'Male',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=John&backgroundColor=b6e3f4&hair=variant01&beard=variant01'
  },
  {
    id: 'female',
    name: 'Female', 
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Emma&backgroundColor=ffd5dc&hair=variant17&earrings=variant01'
  }
];

function Profile() {
  const { user: authUser, updateUser } = useAuth();
  
  // Merge auth user with additional profile fields
  const [user, setUser] = useState({
    ...authUser,
    enrollmentNo: authUser.enrollmentNo || 'CS2021001',
    phone: authUser.phone || '+91 9876543210',
    joinedDate: authUser.joinedDate || '2021-08-01',
    avatar: authUser.avatar || AVATAR_OPTIONS[0].url
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Sync with auth context when it changes
  useEffect(() => {
    setUser(prev => ({ ...prev, ...authUser }));
    setFormData(prev => ({ ...prev, ...authUser }));
  }, [authUser]);

  const handleSave = () => {
    setUser(formData);
    // Update the global auth context so sidebar and other components get the update
    updateUser(formData);
    setIsEditing(false);
    setShowAvatarPicker(false);
    alert('Profile updated successfully!');
  };

  const selectAvatar = (url) => {
    const newData = { ...formData, avatar: url };
    setFormData(newData);
    setUser(newData);
    // Update auth context immediately for avatar changes
    updateUser({ avatar: url });
    setShowAvatarPicker(false);
  };

  return (
    <StudentLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile 👤</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage your profile information
          </p>
        </div>

        {/* Profile Card */}
        <Card>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1 shadow-xl">
                <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  <img 
                    src={user.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              {/* Decorative ring */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30 blur-sm group-hover:opacity-50 transition-opacity -z-10"></div>
              {/* Online indicator */}
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white dark:border-gray-800 shadow-lg"></div>
              {/* Camera button */}
              <button 
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="absolute bottom-0 right-0 p-2.5 bg-white dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 hover:scale-110 transition-all duration-200"
              >
                <Camera className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              
              {/* Avatar Picker Dropdown */}
              {showAvatarPicker && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">Choose Avatar</p>
                  <div className="flex gap-3">
                    {AVATAR_OPTIONS.map((avatar) => (
                      <button
                        key={avatar.id}
                        onClick={() => selectAvatar(avatar.url)}
                        className={`relative w-16 h-16 rounded-full overflow-hidden border-3 transition-all hover:scale-110 ${
                          user.avatar === avatar.url 
                            ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2' 
                            : 'border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
                        {user.avatar === avatar.url && (
                          <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
                            <Check className="w-5 h-5 text-indigo-600" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                    Click to select
                  </p>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm">
                  {user.branch}
                </span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm">
                  Semester {user.semester}
                </span>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Edit2 className="w-4 h-4" />
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>
        </Card>

        {/* Details Card */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
          
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <BookOpen className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Enrollment No.</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.enrollmentNo}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Joined</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(user.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Academic Info */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Academic Information</h3>
          </div>
          
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Branch
                </label>
                <select
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="Electrical">Electrical</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Semester
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Branch</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.branch}</p>
              </div>
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Current Semester</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">Semester {user.semester}</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </StudentLayout>
  );
}

export default Profile;
