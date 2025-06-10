import React, { useState } from 'react';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Generator from './pages/Generator';
import StudentDashboard from './pages/StudentDashboard';
import StudentGuide from './pages/StudentGuide';

type PageType = 'landing' | 'dashboard' | 'generate' | 'student-dashboard' | 'student-guide';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('landing');

  // Simple routing mechanism
  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'dashboard':
        return <Dashboard />;
      case 'generate':
        return <Generator />;
      case 'student-dashboard':
        return <StudentDashboard />;
      case 'student-guide':
        return <StudentGuide />;
      default:
        return <LandingPage />;
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
        } else if (path === '/dashboard') {
          setCurrentPage('dashboard');
        } else if (path === '/') {
          setCurrentPage('landing');
        }
      } else {
        originalConsoleLog(message, ...args);
      }
    };

    return () => {
      console.log = originalConsoleLog;
    };
  }, []);

  // Show landing page without layout, others with layout
  if (currentPage === 'landing') {
    return <LandingPage />;
  }

  return (
    <MainLayout>
      {renderPage()}
    </MainLayout>
  );
}

export default App;