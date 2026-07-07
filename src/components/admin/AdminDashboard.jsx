import React, { useState } from 'react';

const AdminSidebar = ({ activeTab, setActiveTab, onNavigate }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'elections', label: 'Elections', icon: 'how_to_vote' },
    { id: 'candidates', label: 'Candidates', icon: 'group' },
    { id: 'voters', label: 'Voters List', icon: 'list_alt' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-outline/20 bg-surface/50 backdrop-blur-xl z-40">
      <div className="p-6 border-b border-outline/20 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
        </div>
        <span className="font-bold text-lg tracking-tight text-on-surface">E-Vote Admin</span>
      </div>
      
      <div className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-outline mb-4 px-4 uppercase tracking-wider">Menu</div>
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
          onClick={() => onNavigate('landing')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-error hover:bg-error/10 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Exit Admin</span>
        </button>
      </div>
    </aside>
  );
};

const AdminTopbar = () => {
  return (
    <header className="lg:pl-64 fixed top-0 left-0 right-0 z-30 border-b border-outline/20 bg-background/95 backdrop-blur-2xl">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        <div className="flex items-center gap-3 lg:hidden">
           <button className="p-2 text-on-surface">
             <span className="material-symbols-outlined">menu</span>
           </button>
           <span className="font-bold text-lg">Admin Panel</span>
        </div>
        <div className="hidden lg:block font-semibold text-lg text-on-surface">
          Dashboard
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-xl bg-surface-container hover:bg-surface-variant transition-colors relative">
            <span className="material-symbols-outlined text-outline">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full animate-pulse-soft"></span>
          </button>
          
          <div className="flex items-center gap-2 pl-4 border-l border-outline/20">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              A
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-on-surface leading-tight">Admin User</p>
              <p className="text-xs text-outline leading-tight">Electoral Commission</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const StatCard = ({ title, value, icon, trend, colorClass }) => (
  <div className="glass-card rounded-2xl p-5 flex flex-col gap-3 transition-all hover:shadow-lg">
    <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center`}>
      <span className="material-symbols-outlined">{icon}</span>
    </div>
    <div>
      <p className="text-2xl font-bold text-on-surface">{value}</p>
      <div className="flex items-center justify-between mt-0.5">
        <p className="text-xs text-outline font-medium">{title}</p>
        {trend && (
          <span className="text-xs font-semibold text-primary flex items-center">
            <span className="material-symbols-outlined text-[14px]">trending_up</span> {trend}
          </span>
        )}
      </div>
    </div>
  </div>
);

const AdminOverview = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Voters" value="12,450" icon="groups" trend="+2%" colorClass="bg-primary/10 text-primary" />
        <StatCard title="Votes Cast" value="8,234" icon="how_to_vote" trend="+15%" colorClass="bg-secondary/20 text-secondary" />
        <StatCard title="Active Elections" value="3" icon="event_available" colorClass="bg-tertiary/10 text-tertiary" />
        <StatCard title="Candidates" value="45" icon="person" colorClass="bg-primary-container/30 text-primary-container" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-on-surface">Recent Activity</h3>
            <button className="text-sm font-medium text-primary hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 bg-surface-container/30 hover:bg-surface-container/50 transition-colors rounded-xl px-4 py-3 border border-outline/5">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">how_to_vote</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">Vote cast in SRC Election</p>
                  <p className="text-xs text-outline">Matric No: 2021/******</p>
                </div>
                <div className="text-xs text-outline font-medium">Just now</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 flex flex-col">
          <h3 className="text-lg font-bold text-on-surface mb-6">System Status</h3>
          
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
            <div className="relative flex items-center justify-center w-24 h-24">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="material-symbols-outlined text-4xl text-primary">verified_user</span>
            </div>
            
            <div>
              <p className="font-bold text-lg text-on-surface">All Systems Operational</p>
              <p className="text-sm text-outline mt-1">Database connection stable. Mail service active.</p>
            </div>
            
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-semibold">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
               </span>
               Server Running
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onNavigate={onNavigate} />
      <AdminTopbar />
      <main className="lg:pl-64 pt-16 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
          {activeTab === 'overview' && <AdminOverview />}
          {activeTab === 'elections' && (
             <div className="glass-card rounded-3xl p-8 text-center py-20">
               <span className="material-symbols-outlined text-6xl text-outline/50 mb-4">event</span>
               <h2 className="text-2xl font-bold text-on-surface">Manage Elections</h2>
               <p className="text-outline mt-2 max-w-md mx-auto">Create new elections, set start and end times, and manage active polls.</p>
               <button className="mt-6 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all inline-flex items-center gap-2">
                 <span className="material-symbols-outlined">add</span> Create Election
               </button>
             </div>
          )}
          {activeTab === 'candidates' && (
             <div className="glass-card rounded-3xl p-8 text-center py-20">
               <span className="material-symbols-outlined text-6xl text-outline/50 mb-4">group_add</span>
               <h2 className="text-2xl font-bold text-on-surface">Manage Candidates</h2>
               <p className="text-outline mt-2 max-w-md mx-auto">Approve, disqualify, and review candidate profiles and manifestos.</p>
             </div>
          )}
          {activeTab === 'voters' && (
             <div className="glass-card rounded-3xl p-8 text-center py-20">
               <span className="material-symbols-outlined text-6xl text-outline/50 mb-4">upload_file</span>
               <h2 className="text-2xl font-bold text-on-surface">Voter Registry</h2>
               <p className="text-outline mt-2 max-w-md mx-auto">Upload the eligible voters list via JSON or CSV to authenticate students.</p>
               <button className="mt-6 bg-surface-container text-on-surface px-6 py-3 rounded-xl font-bold border border-outline/20 hover:bg-surface-variant transition-all inline-flex items-center gap-2">
                 <span className="material-symbols-outlined">file_upload</span> Upload Registry
               </button>
             </div>
          )}
          {activeTab === 'settings' && (
             <div className="border border-error/20 bg-error/[0.02] rounded-3xl p-6 space-y-4">
               <h3 className="font-bold text-error flex items-center gap-2 text-lg">
                 <span className="material-symbols-outlined">shield</span> Danger Zone
               </h3>
               <p className="text-sm text-on-surface">Actions here are destructive and cannot be undone.</p>
               <button className="bg-error/10 text-error px-4 py-2 rounded-lg font-semibold hover:bg-error hover:text-on-error transition-colors">
                 Reset All Data
               </button>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}
