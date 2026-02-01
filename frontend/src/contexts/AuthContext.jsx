import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

// Default avatar options
const DEFAULT_AVATARS = {
  male: 'https://api.dicebear.com/7.x/lorelei/svg?seed=John&backgroundColor=b6e3f4&hair=variant01&beard=variant01',
  female: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Emma&backgroundColor=ffd5dc&hair=variant17&earrings=variant01'
};

// Mock user - no login required
const MOCK_USER = {
  _id: 'mock-user-123',
  name: 'Student User',
  email: 'student@edutrack.com',
  role: 'user',
  branch: 'Computer Science',
  semester: 5,
  avatar: DEFAULT_AVATARS.male
};

// Load saved user data from localStorage
const loadUserData = () => {
  try {
    const saved = localStorage.getItem('edutrack_user_profile');
    if (saved) {
      return { ...MOCK_USER, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load user profile:', e);
  }
  return MOCK_USER;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(loadUserData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set mock authorization header
    api.defaults.headers.common['Authorization'] = 'Bearer mock-token';
  }, []);

  const logout = () => {
    toast.success('Logged out successfully');
    window.location.href = '/';
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    // Persist to localStorage
    localStorage.setItem('edutrack_user_profile', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
