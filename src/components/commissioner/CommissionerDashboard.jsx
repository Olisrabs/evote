import React, { useState } from 'react';
import Overview from './Overview';
import ElectionsManagement from './ElectionsManagement';
import VoterRegistry from './VoterRegistry';
import Results from './Results';

const Sidebar = ({ activeTab, setActiveTab, onNavigate }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'elections', label: 'Elections', icon: 'how_to_vote' },
    { id: 'voters', label: 'Voter Registry', icon: 'group' },
    { id: 'results', label: 'Results', icon: 'bar_chart' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-outline/20 bg-surface/50 backdrop-blur-xl z-40">
      <div className="p-6 border-b border-outline/20 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
        </div>
        <span className="font-bold text-lg tracking-tight text-on-surface">Commissioner</span>
      </div>
      
      <div className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-outline mb-4 px-4 uppercase tracking-wider">Management</div>
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 relative' 
                  : 'text-outline hover:text-on-surface hover:bg-surface-container/50'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="relative z-10">{item.label}</span>
              {isActive && <span className="material-symbols-outlined text-[14px] ml-auto opacity-70">chevron_right</span>}
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-outline/20">
        <button
          onClick={() => onNavigate('logout')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-error hover:bg-error/10 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

const Topbar = () => {
  return (
    <header className="lg:pl-64 fixed top-0 left-0 right-0 z-30 border-b border-outline/20 bg-background/95 backdrop-blur-2xl">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        <div className="flex items-center gap-3 lg:hidden">
           <button className="p-2 text-on-surface">
             <span className="material-symbols-outlined">menu</span>
           </button>
           <span className="font-bold text-lg">Commissioner Portal</span>
        </div>
        <div className="hidden lg:block font-semibold text-lg text-on-surface">
          Electoral Commission Hub
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 pl-4 border-l border-outline/20">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              C
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-on-surface leading-tight">Chief Commissioner</p>
              <p className="text-xs text-outline leading-tight">Admin Status</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default function CommissionerDashboard({ onNavigate }) {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('commissionerActiveTab') || 'overview';
  });

  const handleSetActiveTab = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('commissionerActiveTab', tab);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeTab={activeTab} setActiveTab={handleSetActiveTab} onNavigate={onNavigate} />
      <Topbar />
      <main className="lg:pl-64 pt-16 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
          {activeTab === 'overview' && <Overview onNavigate={handleSetActiveTab} />}
          {activeTab === 'elections' && <ElectionsManagement onNavigate={onNavigate} />}
          {activeTab === 'voters' && <VoterRegistry onNavigate={onNavigate} />}
          {activeTab === 'results' && <Results onNavigate={onNavigate} />}
        </div>
      </main>
    </div>
  );
}
