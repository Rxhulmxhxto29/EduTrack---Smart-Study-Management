import api from './api';

/**
 * UserData Service
 * Handles syncing user data between frontend and backend
 */

// Valid keys matching backend
const VALID_KEYS = [
  'progress_data',
  'timetable_data',
  'custom_subjects',
  'study_streak',
  'exam_mode_data',
  'favorites',
  'preferences',
  'dashboard_data'
];

// LocalStorage key prefix
const LOCAL_PREFIX = 'edutrack_';

// Map localStorage keys to API keys
const KEY_MAP = {
  'edutrack_progress_data': 'progress_data',
  'edutrack_timetable_data': 'timetable_data',
  'edutrack_custom_subjects': 'custom_subjects',
  'edutrack_study_streak': 'study_streak',
  'edutrack_exam_mode_data': 'exam_mode_data',
  'edutrack_favorites': 'favorites',
  'edutrack_preferences': 'preferences',
  'edutrack_dashboard_data': 'dashboard_data'
};

/**
 * Get data from backend, fallback to localStorage
 */
export const getData = async (key, defaultValue = null) => {
  const apiKey = KEY_MAP[`edutrack_${key}`] || key;
  const localKey = `edutrack_${key}`;
  
  try {
    const response = await api.get(`/user-data/${apiKey}`);
    if (response.data?.success && response.data?.data?.data !== null) {
      // Also update localStorage as cache
      localStorage.setItem(localKey, JSON.stringify(response.data.data.data));
      return response.data.data.data;
    }
  } catch (error) {
    console.log(`Backend fetch failed for ${key}, using localStorage`);
  }
  
  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(localKey);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

/**
 * Save data to backend and localStorage
 */
export const saveData = async (key, data) => {
  const apiKey = KEY_MAP[`edutrack_${key}`] || key;
  const localKey = `edutrack_${key}`;
  
  // Always save to localStorage first (for immediate access)
  localStorage.setItem(localKey, JSON.stringify(data));
  
  try {
    const response = await api.post(`/user-data/${apiKey}`, { data });
    return response.data?.success || false;
  } catch (error) {
    console.log(`Backend save failed for ${key}, saved to localStorage only`);
    return false;
  }
};

/**
 * Get all user data from backend
 */
export const getAllData = async () => {
  try {
    const response = await api.get('/user-data');
    if (response.data?.success) {
      const data = response.data.data.data || {};
      
      // Update localStorage cache
      Object.entries(data).forEach(([key, value]) => {
        const localKey = `edutrack_${key}`;
        localStorage.setItem(localKey, JSON.stringify(value));
      });
      
      return data;
    }
  } catch (error) {
    console.log('Failed to fetch all user data from backend');
  }
  
  // Fallback to localStorage
  const result = {};
  Object.values(KEY_MAP).forEach(key => {
    const localKey = `edutrack_${key}`;
    try {
      const stored = localStorage.getItem(localKey);
      if (stored) {
        result[key] = JSON.parse(stored);
      }
    } catch (e) {
      // Skip invalid JSON
    }
  });
  
  return result;
};

/**
 * Bulk save multiple data items
 */
export const bulkSave = async (items) => {
  // Save to localStorage first
  items.forEach(({ key, data }) => {
    const localKey = `edutrack_${key}`;
    localStorage.setItem(localKey, JSON.stringify(data));
  });
  
  try {
    const apiItems = items.map(({ key, data }) => ({
      key: KEY_MAP[`edutrack_${key}`] || key,
      data
    }));
    
    const response = await api.post('/user-data/bulk', { items: apiItems });
    return response.data?.success || false;
  } catch (error) {
    console.log('Bulk save to backend failed, saved to localStorage only');
    return false;
  }
};

/**
 * Sync localStorage to backend (for migration)
 */
export const syncToBackend = async () => {
  const items = [];
  
  Object.entries(KEY_MAP).forEach(([localKey, apiKey]) => {
    try {
      const stored = localStorage.getItem(localKey);
      if (stored) {
        items.push({ key: apiKey, data: JSON.parse(stored) });
      }
    } catch (e) {
      // Skip invalid JSON
    }
  });
  
  if (items.length === 0) return true;
  
  return bulkSave(items.map(item => ({
    key: Object.entries(KEY_MAP).find(([, v]) => v === item.key)?.[0]?.replace('edutrack_', '') || item.key,
    data: item.data
  })));
};

/**
 * Delete data from backend and localStorage
 */
export const deleteData = async (key) => {
  const apiKey = KEY_MAP[`edutrack_${key}`] || key;
  const localKey = `edutrack_${key}`;
  
  // Remove from localStorage
  localStorage.removeItem(localKey);
  
  try {
    await api.delete(`/user-data/${apiKey}`);
    return true;
  } catch (error) {
    console.log(`Backend delete failed for ${key}`);
    return false;
  }
};

export default {
  getData,
  saveData,
  getAllData,
  bulkSave,
  syncToBackend,
  deleteData,
  VALID_KEYS
};
