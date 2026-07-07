import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import SecurityFeatures from './components/SecurityFeatures';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import SignIn from './components/SignIn';
import Dashboard from './components/dashboard/Dashboard';
import CandidateProfile from './components/dashboard/CandidateProfile';
import ActiveElections from './components/dashboard/ActiveElections';
import Ballot from './components/dashboard/Ballot';
import VoteReview from './components/dashboard/VoteReview';
import VoteSubmitted from './components/dashboard/VoteSubmitted';
import PastElections from './components/dashboard/PastElections';
import PastElectionResults from './components/dashboard/PastElectionResults';
import HelpCenter from './components/dashboard/HelpCenter';
import LiveResults from './components/dashboard/LiveResults';
import CandidatesList from './components/dashboard/CandidatesList';
import NotFound from './components/dashboard/NotFound';
import CommissionerDashboard from './components/commissioner/CommissionerDashboard';
import CommissionerLogin from './components/commissioner/CommissionerLogin';

function App() {
  const getInitialPage = () => {
    if (window.location.pathname === '/commissioner') {
      return localStorage.getItem('admin') ? 'commissioner' : 'commissioner-login';
    }
    return localStorage.getItem('currentPage') || 'landing';
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return saved;
    }
  });
  const [adminUser, setAdminUser] = useState(() => localStorage.getItem('admin') || null);
  const [selectedElection, setSelectedElection] = useState(() => {
    const saved = localStorage.getItem('selectedElection');
    if (!saved) return null;
    try { return JSON.parse(saved); } catch { return null; }
  });
  const [selectedCandidateProfile, setSelectedCandidateProfile] = useState(() => {
    const saved = localStorage.getItem('selectedCandidateProfile');
    if (!saved) return null;
    try { return JSON.parse(saved); } catch { return null; }
  });
  const [selections, setSelections] = useState(() => {
    const saved = localStorage.getItem('selections');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => { 
    if (currentPage !== 'commissioner' && currentPage !== 'commissioner-login') {
      localStorage.setItem('currentPage', currentPage); 
    }
  }, [currentPage]);

  useEffect(() => { 
    if (user) {
      localStorage.setItem('user', typeof user === 'object' ? JSON.stringify(user) : user); 
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => { 
    if (adminUser) localStorage.setItem('admin', adminUser); 
    else localStorage.removeItem('admin');
  }, [adminUser]);

  useEffect(() => {
    if (selectedElection) localStorage.setItem('selectedElection', JSON.stringify(selectedElection));
    else localStorage.removeItem('selectedElection');
  }, [selectedElection]);

  useEffect(() => {
    if (selectedCandidateProfile) localStorage.setItem('selectedCandidateProfile', JSON.stringify(selectedCandidateProfile));
    else localStorage.removeItem('selectedCandidateProfile');
  }, [selectedCandidateProfile]);

  useEffect(() => { localStorage.setItem('selections', JSON.stringify(selections)); }, [selections]);

  // Inactivity timeout: 15 minutes (15 * 60 * 1000 ms)
  useEffect(() => {
    if (!user && !adminUser) return;

    let timeoutId;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        alert('You have been logged out due to 15 minutes of inactivity.');
        handleLogout();
      }, 15 * 60 * 1000); // 15 minutes
    };

    // Track user activity events
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const addListeners = () => {
      events.forEach(event => {
        window.addEventListener(event, resetTimer);
      });
    };

    const removeListeners = () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };

    addListeners();
    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      removeListeners();
    };
  }, [user, adminUser]);

  useEffect(() => {
    const checkSession = async () => {
      if (!user && !adminUser) return;
      try {
        const r = await fetch('/api/auth/me', { credentials: 'include' });
        if (r.status === 401) {
          if (adminUser) {
            localStorage.removeItem('admin');
            setAdminUser(null);
            setCurrentPage('commissioner-login');
            window.history.pushState({}, '', '/commissioner');
          }
          if (user) {
            localStorage.removeItem('user');
            setUser(null);
            setCurrentPage('landing');
            window.history.pushState({}, '', '/');
          }
        }
      } catch (err) {
        console.error('Session check failed:', err);
      }
    };
    checkSession();
    const interval = setInterval(checkSession, 60000); // Check session every minute
    return () => clearInterval(interval);
  }, [user, adminUser]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(getInitialPage());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (page) => {
    let targetPage = page;
    
    if (targetPage === 'logout') {
      handleLogout();
      return;
    }
    
    // Auth check for commissioner route
    if (targetPage === 'admin' || targetPage === 'commissioner') {
      targetPage = adminUser ? 'commissioner' : 'commissioner-login';
    }
    
    // Update URL depending on route
    if (targetPage === 'commissioner' || targetPage === 'commissioner-login') {
      window.history.pushState({}, '', '/commissioner');
    } else {
      window.history.pushState({}, '', '/');
    }
    
    setCurrentPage(targetPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (username, role = 'student') => {
    if (role === 'admin') {
      // Set both state and localStorage synchronously before navigating.
      // Do NOT call handleNavigate here — it reads the stale adminUser closure
      // value (still null) and would route to commissioner-login instead.
      localStorage.setItem('admin', username);
      setAdminUser(username);
      window.history.pushState({}, '', '/commissioner');
      setCurrentPage('commissioner');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      localStorage.setItem('user', typeof username === 'object' ? JSON.stringify(username) : username);
      setUser(username);
      window.history.pushState({}, '', '/');
      setCurrentPage('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('admin');
    localStorage.removeItem('user');
    localStorage.removeItem('currentPage');
    localStorage.removeItem('selectedElection');
    localStorage.removeItem('selectedCandidateProfile');
    localStorage.removeItem('selections');

    try {
      await fetch('/api/auth/admin-logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (_) {}

    setUser(null);
    setAdminUser(null);
    setSelectedElection(null);
    setSelectedCandidateProfile(null);
    setSelections({});

    window.history.pushState({}, '', '/');
    setCurrentPage('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCandidate = (position, candidate) => {
    setSelections(prev => ({ ...prev, [position]: candidate }));
  };

  const handleResetBallot = () => {
    setSelections({});
  };

  if (currentPage === 'signin') {
    return <SignIn onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />;
  }

  if (currentPage === 'dashboard') {
    return (
      <Dashboard 
        user={user} 
        onNavigate={handleNavigate} 
        onLogout={handleLogout} 
        onSelectElection={setSelectedElection}
      />
    );
  }

  if (currentPage === 'candidate') {
    return (
      <CandidateProfile 
        user={user} 
        onNavigate={handleNavigate} 
        candidate={selectedCandidateProfile}
      />
    );
  }

  if (currentPage === 'candidates-list') {
    return (
      <CandidatesList 
        user={user} 
        onNavigate={handleNavigate} 
        election={selectedElection} 
        onSelectCandidateProfile={setSelectedCandidateProfile}
      />
    );
  }

  if (currentPage === 'active-elections') {
    return <ActiveElections user={user} onNavigate={handleNavigate} onSelectElection={setSelectedElection} />;
  }

  if (currentPage === 'ballot') {
    return (
      <Ballot 
        user={user} 
        election={selectedElection}
        selections={selections}
        onNavigate={handleNavigate} 
        onSelectCandidate={handleSelectCandidate} 
        onSelectCandidateProfile={setSelectedCandidateProfile}
      />
    );
  }

  if (currentPage === 'vote-review') {
    return (
      <VoteReview 
        user={user} 
        election={selectedElection}
        selections={selections} 
        onNavigate={handleNavigate} 
        onSubmitBallot={() => handleNavigate('vote-submitted')} 
      />
    );
  }

  if (currentPage === 'vote-submitted') {
    return (
      <VoteSubmitted 
        user={user} 
        selections={selections} 
        onNavigate={handleNavigate} 
        onResetBallot={handleResetBallot} 
      />
    );
  }

  if (currentPage === 'past-elections') {
    return <PastElections user={user} onNavigate={handleNavigate} onSelectElection={setSelectedElection} />;
  }

  if (currentPage === 'past-election-results') {
    return <PastElectionResults user={user} onNavigate={handleNavigate} election={selectedElection} />;
  }

  if (currentPage === 'help-center') {
    return <HelpCenter user={user} onNavigate={handleNavigate} />;
  }

  if (currentPage === 'live-results') {
    return <LiveResults user={user} onNavigate={handleNavigate} />;
  }

  if (currentPage === 'landing') {
    return (
      <div className="bg-background text-on-background selection:bg-primary-fixed-dim selection:text-on-primary-fixed min-h-screen flex flex-col">
        <Header onNavigate={handleNavigate} user={user} />
        
        {user && (
          <div className="bg-secondary-container text-on-secondary-container py-2 text-center text-label-sm font-semibold flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Secure Session Active: Signed in as {user?.fullName || user}
            <button 
              onClick={handleLogout}
              className="underline ml-4 hover:opacity-80 transition-opacity"
            >
              Sign Out
            </button>
          </div>
        )}

        <main className="flex-grow pb-16 md:pb-0">
          <Hero onNavigate={handleNavigate} />
          <HowItWorks />
          <SecurityFeatures />
          <CTASection onNavigate={handleNavigate} />
        </main>
        
        <Footer />
      </div>
    );
  }

  if (currentPage === 'commissioner-login') {
    return <CommissionerLogin onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />;
  }

  if (currentPage === 'commissioner') {
    return <CommissionerDashboard onNavigate={handleNavigate} />;
  }

  // Catch-all 404 handler
  return <NotFound onNavigate={handleNavigate} />;
}

export default App;
