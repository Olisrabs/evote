import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';

const Dashboard = ({ user, onNavigate, onLogout, onSelectElection }) => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadElections = async () => {
      try {
        const r = await fetch('/api/elections', { credentials: 'include' });
        if (r.status === 401 && onLogout) {
          onLogout();
          return;
        }
        if (!r.ok) throw new Error('Failed to load active elections');
        const data = await r.json();
        setElections(data.elections || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadElections();
  }, [onLogout]);

  const getClosesIn = (endsAt) => {
    const diffMs = new Date(endsAt) - new Date();
    if (diffMs <= 0) return 'Closed';
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) return `Closes in ${diffDays}d ${diffHours % 24}h`;
    if (diffHours > 0) return `Closes in ${diffHours}h ${diffMins % 60}m`;
    return `Closes in ${diffMins}m`;
  };

  return (
    <DashboardLayout user={user} onNavigate={onNavigate} activeTab="dashboard">
      <header className="mb-lg">
        <h1 className="text-headline-lg font-bold text-on-surface text-center md:text-left">Student Dashboard</h1>
        <p className="text-body-md text-on-surface-variant text-center md:text-left">
          Welcome back, {user?.fullName || user || 'Jonathan'}. Your participation strengthens our campus.
        </p>
      </header>

      {/* Top Grid: Stats & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-lg">
        {/* Status Card (Bento Style) */}
        <div className="p-md bg-white border border-outline-variant rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-label-md font-semibold text-on-surface-variant uppercase tracking-wider mb-xs">
                  Student Registry Status
                </p>
                <h3 className="text-headline-md font-semibold text-secondary flex items-center space-x-2">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>
                    verified
                  </span>
                  <span>Verified Student</span>
                </h3>
              </div>
              <span className="material-symbols-outlined text-secondary opacity-20 text-[64px] absolute -right-4 -top-4">
                how_to_reg
              </span>
            </div>
            <div className="mt-md flex flex-wrap gap-x-6 gap-y-2">
              <div className="flex flex-col">
                <span className="text-label-sm font-medium text-on-surface-variant">Matric No</span>
                <span className="text-body-md font-semibold">{user?.matricNo || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-label-sm font-medium text-on-surface-variant">Faculty</span>
                <span className="text-body-md font-semibold">{user?.faculty || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-label-sm font-medium text-on-surface-variant">Department</span>
                <span className="text-body-md font-semibold">{user?.department || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-label-sm font-medium text-on-surface-variant">Level</span>
                <span className="text-body-md font-semibold">{user?.level || 'N/A'}</span>
              </div>
            </div>
          </div>
          {/* Decorative element */}
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-secondary opacity-5 rounded-tl-full"></div>
        </div>

        {/* Live Results Card */}
        <div className="p-md bg-primary text-on-primary rounded-xl shadow-md flex flex-col justify-center items-center text-center relative overflow-hidden group cursor-pointer hover:bg-primary/90 transition-colors" onClick={() => onNavigate('live-results')}>
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="material-symbols-outlined text-[48px] mb-2 animate-pulse" style={{ fontVariationSettings: '"FILL" 1' }}>query_stats</span>
          <h3 className="text-headline-md font-bold mb-1">See Live Results</h3>
        </div>
      </div>

      {/* Election Overview Cards */}
      <div className="mb-lg w-full">
        <div className="flex justify-between items-end mb-md">
          <h2 className="text-headline-md font-bold text-on-surface">Active Elections</h2>
          <button 
            onClick={() => onNavigate('active-elections')}
            className="text-primary text-label-md font-semibold hover:underline"
          >
            View All
          </button>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md w-full">
            {[1, 2].map(i => (
              <div key={i} className="p-md bg-white border border-outline-variant rounded-xl shadow-sm animate-pulse min-h-[180px]">
                <div className="h-6 w-24 bg-surface-container rounded mb-4" />
                <div className="h-8 w-3/4 bg-surface-container rounded mb-2" />
                <div className="h-4 w-1/2 bg-surface-container rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-md rounded-xl bg-error/10 text-error border border-error/20 text-center font-medium w-full">
            {error}
          </div>
        ) : elections.length === 0 ? (
          <div className="p-xl rounded-xl bg-surface-container/30 border border-outline/10 text-center text-outline w-full">
            <span className="material-symbols-outlined text-[48px] mb-2 text-primary">campaign</span>
            <p className="text-sm font-semibold">No active elections currently match your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md w-full">
            {elections.slice(0, 4).map((election) => (
              <div
                key={election.id}
                onClick={() => {
                  if (election.hasVoted) return;
                  onSelectElection(election);
                  onNavigate('ballot');
                }}
                className={`p-md bg-white border-2 rounded-xl shadow-md relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer flex flex-col justify-between min-h-[200px] ${
                  election.hasVoted 
                    ? 'border-outline-variant opacity-75 grayscale pointer-events-none' 
                    : 'border-primary'
                }`}
              >
                <div>
                  <div className="flex justify-between mb-md">
                    <div className={`px-3 py-1 rounded-full text-label-sm font-semibold ${
                      election.hasVoted 
                        ? 'bg-outline/20 text-outline' 
                        : 'bg-primary text-on-primary animate-pulse'
                    }`}>
                      {election.hasVoted ? 'SUBMITTED' : 'ACTIVE'}
                    </div>
                    <span className="material-symbols-outlined text-primary">campaign</span>
                  </div>
                  <h4 className="text-headline-md font-bold mb-xs truncate" title={election.title}>{election.title}</h4>
                  <p className="text-body-md text-on-surface-variant mb-md font-medium">{getClosesIn(election.endsAt)}</p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (election.hasVoted) return;
                    onSelectElection(election);
                    onNavigate('ballot');
                  }}
                  disabled={election.hasVoted}
                  className={`w-full py-2 rounded-lg text-label-md font-semibold transition-all relative z-10 ${
                    election.hasVoted 
                      ? 'bg-outline/10 text-outline cursor-not-allowed'
                      : 'bg-primary text-on-primary hover:bg-on-primary-fixed-variant'
                  }`}
                >
                  {election.hasVoted ? 'Vote Submitted' : 'Vote Now'}
                </button>
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:rotate-12 transition-transform pointer-events-none">
                  <span className="material-symbols-outlined text-[120px]">how_to_vote</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Digital Receipt Preview */}
      <div className="p-lg bg-white border border-outline-variant rounded-xl shadow-sm border-dashed relative mb-6">
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
          <span className="material-symbols-outlined text-primary text-[48px] mb-base">verified</span>
          <h3 className="text-headline-md font-bold text-on-surface mb-xs">Digital Voting Integrity</h3>
          <p className="text-body-md text-on-surface-variant mb-md">
            Every vote you cast is cryptographically secured. Your participation is recorded on the
            immutable ledger for complete transparency.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
