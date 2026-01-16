import { useState, useEffect } from 'react';
import MainLayout from './components/MainLayout';
import AdminPanel from './components/AdminPanel';
import TermsScreen from './components/TermsScreen';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [showTerms, setShowTerms] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const handleTermsAccept = () => {
    setShowTerms(false);
    setTimeout(() => setShowContent(true), 50);
  };

  if (currentPath === '/admin') {
    return <AdminPanel onBack={() => navigate('/')} />;
  }

  return (
    <>
      <div className={`transition-opacity duration-700 ${!showTerms && showContent ? 'opacity-100' : 'opacity-0'}`}>
        <MainLayout navigate={navigate} />
      </div>
      {showTerms && <TermsScreen onAccept={handleTermsAccept} />}
    </>
  );
}

export default App;
