import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/lorelei/svg?seed=John&backgroundColor=b6e3f4&hair=variant01&beard=variant01';

const saveSession = (userData, token) => {
  localStorage.setItem('token', token);
  localStorage.setItem('edutrack_user_profile', JSON.stringify(userData));
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('edutrack_user_profile');
  delete api.defaults.headers.common['Authorization'];
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: check if there's a saved token and verify it
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) { setLoading(false); return; }

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      try {
        const res = await api.get('/api/auth/me');
        if (res.data.success) {
          const userData = { ...res.data.data, avatar: res.data.data.avatar || DEFAULT_AVATAR };
          setUser(userData);
          localStorage.setItem('edutrack_user_profile', JSON.stringify(userData));
        } else {
          clearSession();
        }
      } catch {
        clearSession();
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    if (!res.data.success) throw new Error(res.data.message || 'Login failed');
    const { user: userData, token } = res.data.data;
    userData.avatar = userData.avatar || DEFAULT_AVATAR;
    saveSession(userData, token);
    setUser(userData);
    toast.success(`Welcome back, ${userData.name}!`);
  };

  const register = async ({ name, email, password, branch, semester }) => {
    const res = await api.post('/api/auth/register', { name, email, password, branch, semester });
    if (!res.data.success) throw new Error(res.data.message || 'Registration failed');
    const { user: userData, token } = res.data.data;
    userData.avatar = userData.avatar || DEFAULT_AVATAR;
    saveSession(userData, token);
    setUser(userData);
    toast.success(`Welcome to EduTrack, ${userData.name}!`);
  };

  const logout = () => {
    clearSession();
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('edutrack_user_profile', JSON.stringify(updatedUser));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser }}>
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
