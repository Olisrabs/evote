import { useState } from 'react';

const CandidateProfile = ({ user, onNavigate }) => {
  const [selectionState, setSelectionState] = useState('idle'); // 'idle', 'loading', 'confirmed'
  const [showConfetti, setShowConfetti] = useState(false);
  const [activePlatform, setActivePlatform] = useState(null);

  const platformPillars = [
    {
      id: 'green-corridor',
      title: 'Green Corridor Initiative',
      icon: 'forest',
      tagline: '25% increase in public parks and eco-friendly spaces.',
      description: 'Building on our success with District 07 Community Development Board, we will expand public parks, plant urban forests, and develop community gardens. Every citizen deserves clean air and accessible green spaces within a 10-minute walk from their home.',
      stats: 'Goal: +15 new parks'
    },
    {
      id: 'transit',
      title: 'Smart & Sustainable Transit',
      icon: 'directions_bus',
      tagline: 'Zero-emission buses and integrated cycling network.',
      description: 'Upgrading our municipal fleet to electric models, introducing traffic signal priority for public transit, and creating physically separated cycling lanes to connect our local neighborhoods to commercial hubs safely.',
      stats: 'Budget allocated: 85% green transit'
    },
    {
      id: 'transparency',
      title: 'Civic Accessibility & Trust',
      icon: 'groups',
      tagline: 'Bi-monthly town halls & digital public budget portal.',
      description: 'Democratizing municipal decisions by launching a secure, public portal showing exactly where tax dollars go. Sarah will host regular community forums to review neighborhood budgets and solicit direct voter feedback before all key votes.',
      stats: '100% transparent audit trail'
    }
  ];

  const handleSelectCandidate = () => {
    if (selectionState !== 'idle') return;
    
    setSelectionState('loading');
    
    setTimeout(() => {
      setSelectionState('confirmed');
      setShowConfetti(true);
      
      // Remove confetti animation after 1.5 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 1500);
    }, 1200);
  };

  const getInitials = (name) => {
    if (!name) return 'JD';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex w-full relative">
      {/* Confetti / Verification Overlay */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center bg-black/10 backdrop-blur-[2px] transition-all">
          <div className="text-secondary text-9xl animate-ping flex flex-col items-center">
            <span className="material-symbols-outlined" style={{ fontSize: '150px' }}>
              verified
            </span>
            <span className="text-xl font-bold text-secondary mt-4 bg-white/90 px-6 py-2 rounded-full shadow-lg border border-outline-variant">
              Selection Confirmed
            </span>
          </div>
        </div>
      )}

      {/* SideNavBar (Shared Component) */}
      <aside className="hidden md:flex h-screen w-72 left-0 top-0 fixed bg-surface-container-low border-r border-outline-variant shadow-md flex-col p-md space-y-base z-40">
        <div className="mb-lg">
          <button 
            onClick={() => onNavigate('landing')}
            className="font-headline-md text-headline-md text-primary font-bold text-left hover:opacity-85 transition-opacity flex items-center space-x-2"
          >
            <span className="material-symbols-outlined">account_balance</span>
            <span>CivicVote</span>
          </button>
        </div>
        
        {/* User Card */}
        <div className="flex items-center space-x-3 p-3 bg-surface-container rounded-xl mb-md border border-outline-variant/30">
          <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold">
            {getInitials(user || 'Jonathan Doe')}
          </div>
          <div>
            <p className="font-label-md text-label-md text-on-surface font-semibold">{user || 'Jonathan Doe'}</p>
            <p className="text-xs text-on-surface-variant">ID: 882-XJ9-012</p>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 space-y-1">
          <button 
            onClick={() => onNavigate('dashboard')} 
            className="w-full flex items-center space-x-3 px-4 py-3 text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg text-left"
          >
            <span className="material-symbols-outlined">home</span>
            <span className="font-body-md font-medium">Home</span>
          </button>
          <button 
            onClick={() => onNavigate('dashboard')} 
            className="w-full flex items-center space-x-3 px-4 py-3 bg-secondary-container text-on-secondary-container rounded-lg font-bold transition-all duration-200 text-left"
          >
            <span className="material-symbols-outlined">ballot</span>
            <span className="font-body-md">Active Elections</span>
          </button>
          <button 
            onClick={() => onNavigate('dashboard')} 
            className="w-full flex items-center space-x-3 px-4 py-3 text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg text-left"
          >
            <span className="material-symbols-outlined">history</span>
            <span className="font-body-md font-medium">Past Elections</span>
          </button>
          <button 
            onClick={() => onNavigate('dashboard')} 
            className="w-full flex items-center space-x-3 px-4 py-3 text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg text-left"
          >
            <span className="material-symbols-outlined">gpp_good</span>
            <span className="font-body-md font-medium">Security Audit</span>
          </button>
          <button 
            onClick={() => onNavigate('dashboard')} 
            className="w-full flex items-center space-x-3 px-4 py-3 text-on-surface-variant hover:bg-surface-variant transition-all duration-200 rounded-lg text-left"
          >
            <span className="material-symbols-outlined">help</span>
            <span className="font-body-md font-medium">Help Center</span>
          </button>
        </nav>

        <button className="mt-auto w-full py-3 px-4 bg-primary text-white rounded-lg font-label-md hover:bg-on-primary-fixed-variant transition-colors active:scale-95 transition-transform">
          View Digital ID
        </button>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 md:ml-72 flex flex-col min-h-screen">
        {/* TopAppBar (Shared Component) */}
        <header className="w-full top-0 sticky z-30 bg-surface-container-lowest border-b border-outline-variant shadow-sm">
          <div className="flex justify-between items-center px-4 md:px-margin-mobile lg:px-md h-16 w-full max-w-container-max mx-auto">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => onNavigate('dashboard')}
                className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors active:scale-95 transition-transform md:hidden"
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
              <button 
                onClick={() => onNavigate('dashboard')}
                className="flex items-center space-x-2 text-on-surface-variant hover:text-primary transition-colors font-semibold"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                <span className="hidden sm:inline font-label-md">Back to Ballot</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="material-symbols-outlined text-primary" title="Secured Session">verified_user</span>
              <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-xs" title={user || 'Jonathan Doe'}>
                {getInitials(user || 'Jonathan Doe')}
              </div>
            </div>
          </div>
        </header>

        {/* Progress Stepper (Contextual) */}
        <div className="w-full max-w-3xl mx-auto px-4 mt-8">
          <div className="flex items-center justify-between">
            {/* Step 1 */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center text-xs font-bold shadow-md">
                <span className="material-symbols-outlined text-sm">check</span>
              </div>
              <span className="font-label-sm text-label-sm text-secondary font-semibold">Select Election</span>
            </div>
            <div className="flex-1 h-0.5 bg-secondary mx-4"></div>
            {/* Step 2 */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold ring-4 ring-primary-container shadow-md">
                2
              </div>
              <span className="font-label-sm text-label-sm text-primary font-bold">Review Candidate</span>
            </div>
            <div className="flex-1 h-0.5 bg-outline-variant mx-4"></div>
            {/* Step 3 */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center text-xs font-bold">
                3
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Cast Encrypted Ballot</span>
            </div>
          </div>
        </div>

        {/* Candidate Profile Layout */}
        <div className="max-w-3xl w-full mx-auto p-4 md:p-8 space-y-8 flex-grow">
          {/* Hero Section: Header */}
          <section className="flex flex-col items-center text-center space-y-4">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden ring-1 ring-outline-variant group-hover:scale-105 transition-transform duration-300">
                <img 
                  alt="Dr. Sarah Chen Portrait" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTwB-AbEiUo6oExM1C5MdY8ix9G0YU74V7d7FFoukri397jFLVUZxJ6qym_yOkQr1mMsciO_ADeoZQVmWvCP48LYAkYYrdFqBLzlR3BxQpDUGX_5WBBzG_8oY8ZnxtY9lnBoz1Ue6krmz3uBDeYt6vBTI2vMrYZkwQMYqRBllaBDJ3VKWp5UMaa5SKSmoqQca8gqtzsCXGsfKbJtfo2s_krvwKw3-jmY4dYdq2C7g0jCjumx5xS32Uf1bMwL5MHFlZE3UkK2EZIshT"
                />
              </div>
              <div className="absolute bottom-2 right-2 bg-secondary text-white rounded-full p-1.5 shadow-lg ring-2 ring-white hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-lg block" style={{ fontVariationSettings: '"FILL" 1' }}>
                  verified
                </span>
              </div>
            </div>
            
            <div className="space-y-1">
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Dr. Sarah Chen</h2>
              <p className="font-headline-md text-headline-md text-primary font-semibold">District 07 Council Candidate</p>
              
              <div className="flex items-center justify-center space-x-2 mt-2">
                <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold flex items-center space-x-1">
                  <span className="material-symbols-outlined text-xs">shield</span>
                  <span>Incumbent</span>
                </span>
                <span className="bg-surface-container-highest text-on-surface-variant px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold flex items-center space-x-1">
                  <span className="material-symbols-outlined text-xs">thumb_up</span>
                  <span>Community Choice</span>
                </span>
              </div>
            </div>
          </section>

          {/* Bio Section */}
          <section className="glass-card rounded-2xl p-6 md:p-8 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant pb-2 flex items-center font-bold">
              <span className="material-symbols-outlined mr-2 text-primary">work</span>
              <span>Manifesto</span>
            </h3>
            <div className="space-y-4 text-on-surface-variant leading-relaxed font-body-md">
              <p>
                Dr. Sarah Chen is a dedicated public servant and urban planning expert with over 15 years of experience in local governance. Holding a Ph.D. in Public Policy, she has focused her career on creating sustainable, inclusive urban environments that prioritize community well-being.
              </p>
              <p>
                Before entering public office, Dr. Chen served as the Director of the District 07 Community Development Board, where she successfully led the "Green Corridor" initiative, increasing public park space by 25%. Her approach combines data-driven decision-making with a deep commitment to listening to resident concerns.
              </p>
            </div>
          </section>

          {/* Platform Pillars Section */}
          <section className="space-y-4">
            <h3 className="font-headline-md text-headline-md text-on-surface flex items-center font-bold px-2">
              <span className="material-symbols-outlined mr-2 text-primary">explore</span>
              <span>Platform Pillars</span>
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              {platformPillars.map((pillar) => {
                const isOpen = activePlatform === pillar.id;
                return (
                  <div 
                    key={pillar.id}
                    className="p-5 bg-white border border-outline-variant rounded-xl shadow-sm hover:border-primary/50 transition-all cursor-pointer"
                    onClick={() => setActivePlatform(isOpen ? null : pillar.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary-container text-primary rounded-lg flex items-center justify-center">
                          <span className="material-symbols-outlined">{pillar.icon}</span>
                        </div>
                        <div>
                          <h4 className="font-headline-md text-base md:text-lg text-on-surface font-semibold">{pillar.title}</h4>
                          <p className="text-xs text-on-surface-variant font-medium">{pillar.tagline}</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        expand_more
                      </span>
                    </div>

                    {isOpen && (
                      <div className="mt-4 pt-4 border-t border-outline-variant/50 space-y-2 text-on-surface-variant text-sm leading-relaxed animate-fadeIn">
                        <p>{pillar.description}</p>
                        <div className="mt-2 inline-flex items-center space-x-1 bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-xs font-semibold">
                          <span className="material-symbols-outlined text-[14px]">trending_up</span>
                          <span>{pillar.stats}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* CTA Section */}
          <section className="sticky bottom-4 md:bottom-8 py-4 z-20">
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-outline-variant shadow-lg max-w-xl mx-auto">
              <button
                id="select-candidate"
                onClick={handleSelectCandidate}
                disabled={selectionState !== 'idle'}
                className={`w-full py-4 font-label-md text-label-md font-bold rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all duration-300 ${
                  selectionState === 'idle'
                    ? 'voter-momentum-gradient text-white hover:opacity-95 active:scale-[0.98]'
                    : selectionState === 'loading'
                    ? 'bg-secondary text-white cursor-not-allowed opacity-90'
                    : 'bg-secondary text-white cursor-default'
                }`}
              >
                {selectionState === 'idle' && (
                  <>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>how_to_vote</span>
                    <span>Select Dr. Sarah Chen</span>
                  </>
                )}
                {selectionState === 'loading' && (
                  <>
                    <span className="material-symbols-outlined animate-spin">sync</span>
                    <span>Recording Choice...</span>
                  </>
                )}
                {selectionState === 'confirmed' && (
                  <>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                    <span>Selection Confirmed</span>
                  </>
                )}
              </button>
              
              {selectionState === 'confirmed' && (
                <div className="mt-3 text-center animate-fadeIn">
                  <p className="text-xs text-on-surface-variant font-medium">
                    Your preference has been registered. You can now review and cast your final ballot.
                  </p>
                  <button 
                    onClick={() => onNavigate('dashboard')}
                    className="mt-2 text-primary font-bold text-xs hover:underline flex items-center justify-center mx-auto space-x-1"
                  >
                    <span>Proceed to Ballot Review</span>
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer (Shared Component) */}
        <footer className="w-full py-xl mt-auto bg-surface-dim border-t border-outline-variant">
          <div className="max-w-container-max mx-auto px-4 md:px-md flex flex-col md:flex-row justify-between items-center space-y-md md:space-y-0">
            <p className="font-body-md text-body-md text-on-surface-variant">
              © 2024 CivicVote. Secure Digital Democracy Infrastructure.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Accessibility Statement</a>
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Security Protocol</a>
            </div>
          </div>
        </footer>
      </main>

      {/* BottomNavBar (Mobile Only Shared Component) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center h-16 px-2 pb-safe bg-surface-container border-t border-outline-variant shadow-lg">
        <button 
          onClick={() => onNavigate('dashboard')}
          className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary active:scale-90 transition-all"
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-label-sm text-label-sm">Dashboard</span>
        </button>
        <button 
          onClick={() => onNavigate('dashboard')}
          className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-xl px-4 py-1 active:scale-90 transition-all animate-pulse"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>how_to_vote</span>
          <span className="font-label-sm text-label-sm font-semibold">Ballot</span>
        </button>
        <button 
          onClick={() => onNavigate('dashboard')}
          className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary active:scale-90 transition-all"
        >
          <span className="material-symbols-outlined">analytics</span>
          <span className="font-label-sm text-label-sm font-semibold">Results</span>
        </button>
        <button 
          onClick={() => onNavigate('dashboard')}
          className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary active:scale-90 transition-all"
        >
          <span className="material-symbols-outlined">person</span>
          <span className="font-label-sm text-label-sm">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default CandidateProfile;
