import { createContext, useContext, useState, useEffect } from 'react';

const ExamModeContext = createContext();

export const ExamModeProvider = ({ children }) => {
  const [examModeActive, setExamModeActive] = useState(() => {
    try {
      const stored = localStorage.getItem('edutrack_exam_mode_active');
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem('edutrack_exam_mode_active', JSON.stringify(examModeActive));
    
    // Apply exam mode styles to document
    if (examModeActive) {
      document.documentElement.classList.add('exam-mode');
      document.body.style.background = '#1a1a2e';
    } else {
      document.documentElement.classList.remove('exam-mode');
      document.body.style.background = '';
    }
  }, [examModeActive]);

  const toggleExamMode = () => {
    setExamModeActive(prev => !prev);
  };

  return (
    <ExamModeContext.Provider value={{ examModeActive, toggleExamMode, setExamModeActive }}>
      {children}
    </ExamModeContext.Provider>
  );
};

export const useExamMode = () => {
  const context = useContext(ExamModeContext);
  if (!context) {
    throw new Error('useExamMode must be used within an ExamModeProvider');
  }
  return context;
};

export default ExamModeContext;
