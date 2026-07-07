import React from 'react';

const DashboardLayout = ({ user, onNavigate, activeTab, children }) => {
  const getInitials = (name) => {
    if (!name) return 'JD';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const sidebarLinks = [
    { id: 'dashboard', label: 'Home', icon: 'home' },
    { id: 'active-elections', label: 'Active Elections', icon: 'ballot' },
    { id: 'past-elections', label: 'Past Elections', icon: 'history' },
    { id: 'help-center', label: 'Help Center', icon: 'help' },
  ];

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen overflow-x-hidden flex flex-col pt-16">
      {/* Top Header for Desktop & Mobile */}
      <header className="fixed top-0 left-0 w-full h-16 bg-surface-container-lowest border-b border-outline-variant shadow-sm z-50 flex justify-between items-center px-4 md:px-lg">
        <button 
          onClick={() => onNavigate('dashboard')}
          className="font-headline-md text-headline-md font-bold text-primary flex items-center space-x-2"
        >
          <span>e-vote</span>
        </button>
        <div className="flex items-center space-x-sm md:space-x-base">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xs">
              {getInitials(user?.fullName || user || 'User')}
            </div>
          </div>
          <button 
            onClick={() => {
              onNavigate('logout');
            }}
            className="p-2 rounded-full hover:bg-surface-container transition-colors active:scale-95 flex items-center justify-center group hidden md:flex"
            title="Sign Out"
          >
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-error transition-colors">logout</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 w-full max-w-[1400px] mx-auto">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col p-4 border-r border-outline-variant fixed left-0 top-16 h-[calc(100vh-64px)] bg-surface-container-low space-y-6 overflow-y-auto z-40">
          <div className="flex items-center space-x-3 p-3 bg-white rounded-xl shadow-sm border border-outline-variant">
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
              <span className="material-symbols-outlined">person</span>
            </div>
            <div>
              <p className="font-label-md text-label-md text-on-surface font-semibold truncate max-w-[120px]">{user?.fullName || user || 'User'}</p>
              <div className="flex items-center space-x-1 text-primary">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                <span className="text-[10px] font-medium uppercase tracking-wider">Verified</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {sidebarLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 text-left ${
                    isActive
                      ? 'bg-secondary-container text-on-secondary-container font-bold shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-variant font-medium'
                  }`}
                >
                  <span className="material-symbols-outlined">{link.icon}</span>
                  <span className="text-body-md">{link.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-h-screen flex flex-col w-full lg:ml-64">
          <div className="flex-1 flex flex-col items-center w-full px-4 md:px-8 py-6 pb-24 md:pb-8">
            <div className="w-full max-w-[800px]">
              {children}
            </div>
          </div>
          
          {/* Desktop Footer (Reduced height & thinner) */}
          <footer className="hidden md:flex w-full bg-surface-container border-t border-outline-variant py-2 mt-auto">
            <div className="max-w-[800px] w-full mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm">
              <p className="text-on-surface-variant">
                © 2024 e-vote. Secure Digital University.
              </p>
              <div className="flex space-x-4">
                <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy</a>
                <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Terms</a>
                <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Security</a>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Mobile Bottom NavBar */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-between items-center h-16 px-4 pb-safe bg-surface-container border-t border-outline-variant shadow-lg overflow-x-auto">
        <button 
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 transition-all active:scale-90 ${activeTab === 'dashboard' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
        >
          <span className="material-symbols-outlined text-[22px]">{activeTab === 'dashboard' ? 'dashboard' : 'dashboard'}</span>
          <span className="text-[10px] font-medium mt-0.5">Home</span>
        </button>
        <button 
          onClick={() => onNavigate('active-elections')}
          className={`flex flex-col items-center justify-center flex-1 transition-all active:scale-90 ${activeTab === 'active-elections' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
        >
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: activeTab === 'active-elections' ? '"FILL" 1' : 'normal' }}>how_to_vote</span>
          <span className="text-[10px] font-medium mt-0.5">Ballot</span>
        </button>
        <button 
          onClick={() => onNavigate('past-elections')}
          className={`flex flex-col items-center justify-center flex-1 transition-all active:scale-90 ${activeTab === 'past-elections' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
        >
          <span className="material-symbols-outlined text-[22px]">history</span>
          <span className="text-[10px] font-medium mt-0.5">Results</span>
        </button>
        <button 
          onClick={() => onNavigate('logout')}
          className="flex flex-col items-center justify-center flex-1 text-on-surface-variant hover:text-error transition-all active:scale-90"
        >
          <span className="material-symbols-outlined text-[22px]">logout</span>
          <span className="text-[10px] font-medium mt-0.5">Sign Out</span>
        </button>
      </nav>
    </div>
  );
};

export default DashboardLayout;
