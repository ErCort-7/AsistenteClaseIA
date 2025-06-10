import React, { useState } from 'react';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Generator from './pages/Generator';
import StudentDashboard from './pages/StudentDashboard';
import StudentGuide from './pages/StudentGuide';

type PageType = 'dashboard' | 'generate' | 'student-dashboard' | 'student-guide';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

  // Simple routing mechanism
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'generate':
        return <Generator />;
      case 'student-dashboard':
        return <StudentDashboard />;
      case 'student-guide':
        return <StudentGuide />;
      default:
        return <Dashboard />;
    }
  };

  // Override the useNavigate hook for this demo
  React.useEffect(() => {
    const originalConsoleLog = console.log;
    console.log = (message: any, ...args: any[]) => {
      if (typeof message === 'string' && message.startsWith('Navigation to ')) {
        const path = message.replace('Navigation to ', '');
        if (path === '/generate') {
          setCurrentPage('generate');
        } else if (path === '/student-dashboard') {
          setCurrentPage('student-dashboard');
        } else if (path === '/student-guide') {
          setCurrentPage('student-guide');
        } else if (path === '/dashboard' || path === '/') {
          setCurrentPage('dashboard');
        }
      } else {
        originalConsoleLog(message, ...args);
      }
    };

    return () => {
      console.log = originalConsoleLog;
    };
  }, []);

  return (
    <MainLayout>
      {renderPage()}
    </MainLayout>
  );
}

export default App;