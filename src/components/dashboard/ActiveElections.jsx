import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';

const ActiveElections = ({ user, onNavigate, onSelectElection }) => {
  const [selectedElectionId, setSelectedElectionId] = useState(null);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadElections = async () => {
      try {
        const r = await fetch('/api/elections', { credentials: 'include' });
        if (r.status === 401 && onNavigate) {
          onNavigate('logout');
          return;
        }
        if (!r.ok) throw new Error('Failed to load active elections');
        const data = await r.json();
        // Filter out any elections that are expired client-side (belt-and-suspenders)
        const now = new Date();
        const live = (data.elections || []).filter(
          el => !el.endsAt || new Date(el.endsAt) > now
        );
        setElections(live);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadElections();
    // Re-check every 60 s so expired elections disappear without a page reload
    const interval = setInterval(loadElections, 60_000);
    return () => clearInterval(interval);
  }, [onNavigate]);

  const getClosesIn = (endsAtStr) => {
    const diffMs = new Date(endsAtStr) - new Date();
    if (diffMs <= 0) return 'Closed';
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) return `Closing in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `Closing in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    return `Closing in ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
  };

  const rules = [
    {
      title: 'Registration',
      description: 'Must be a fully registered student of the university for the current academic session.',
      icon: 'task_alt'
    },
    {
      title: 'Academic Standing',
      description: 'Must maintain a minimum CGPA requirement as stipulated by the electoral committee.',
      icon: 'task_alt'
    },
    {
      title: 'Verification',
      description: 'Submission of valid University Student ID through the e-vote biometric gateway.',
      icon: 'task_alt'
    },
    {
      title: 'One Vote Policy',
      description: 'The system enforces a strict one-student-one-ballot policy via secure ledger technology.',
      icon: 'task_alt'
    }
  ];

  return (
    <DashboardLayout user={user} onNavigate={onNavigate} activeTab="active-elections">
      <div className="mx-auto max-w-4xl w-full">
        {/* Hero Header */}
        <header className="mb-lg">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
            <div>
              <nav className="flex items-center space-x-xs text-on-surface-variant mb-base">
                <button 
                  onClick={() => onNavigate('dashboard')} 
                  className="font-label-sm text-label-sm hover:text-primary hover:underline"
                >
                  Elections
                </button>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                <span className="font-label-sm text-label-sm text-primary font-bold">Current</span>
              </nav>
              <h1 className="font-headline-lg text-headline-lg md:text-display text-on-surface mb-xs font-bold">Active Elections</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl leading-relaxed">
                Campus democratic exercise to determine student union representatives and faculty leadership for the upcoming academic session. Your participation ensures a representative and transparent student government.
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-gutter">
          <div className="space-y-lg">
            {/* Positions & Candidates */}
            <section className="mb-lg">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md w-full">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-md bg-white border border-outline-variant rounded-xl min-h-[220px] animate-pulse">
                      <div className="h-6 w-16 bg-surface-container rounded mb-4" />
                      <div className="h-8 w-3/4 bg-surface-container rounded mb-2" />
                      <div className="h-4 w-1/2 bg-surface-container rounded" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="p-md rounded-xl bg-error/10 text-error border border-error/20 text-center font-medium">
                  {error}
                </div>
              ) : elections.length === 0 ? (
                <div className="p-xl rounded-xl bg-surface-container/30 border border-outline/10 text-center text-outline">
                  <span className="material-symbols-outlined text-[48px] mb-2">how_to_vote</span>
                  <p className="text-sm font-semibold">No active elections available for your level/scope right now.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md w-full">
                  {elections.map((election) => {
                    const isSelected = selectedElectionId === election.id;
                    const isClosed = election.endsAt && new Date() > new Date(election.endsAt);
                    const canVote = !election.hasVoted && !isClosed;
                    return (
                      <div
                        key={election.id}
                        onClick={() => {
                          if (!canVote) return;
                          setSelectedElectionId(election.id);
                        }}
                        className={`p-md bg-white border-2 rounded-xl relative overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-between min-h-[220px] ${
                          isSelected 
                            ? 'border-primary shadow-md' 
                            : 'border-outline-variant hover:border-primary/50 shadow-sm'
                        } ${!canVote ? 'opacity-75 grayscale' : ''}`}
                      >
                        <div>
                          <div className="flex justify-between mb-md">
                            <div className={`px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold ${
                              election.hasVoted 
                                ? 'bg-outline/20 text-outline' 
                                : isClosed
                                ? 'bg-error/20 text-error'
                                : 'bg-primary text-on-primary'
                            }`}>
                              {election.hasVoted ? 'SUBMITTED' : isClosed ? 'CLOSED' : 'ACTIVE'}
                            </div>
                            <span className="material-symbols-outlined text-primary">campaign</span>
                          </div>
                          <h4 className="font-headline-md text-headline-md font-bold mb-xs truncate" title={election.title}>{election.title}</h4>
                          <p className="font-body-md text-body-md text-on-surface-variant mb-md">{getClosesIn(election.endsAt)}</p>
                        </div>
                        <div className="flex gap-2 relative z-10">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectElection(election);
                              onNavigate('candidates-list');
                            }}
                            className="flex-1 py-2 border-2 border-primary text-primary rounded-lg font-label-sm text-label-sm font-bold hover:bg-primary/5 active:scale-[0.98] transition-all"
                          >
                            Candidates
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!canVote) return;
                              onSelectElection(election);
                              onNavigate('ballot');
                            }}
                            disabled={!canVote}
                            className={`flex-1 py-2 rounded-lg font-label-sm text-label-sm font-bold active:scale-[0.98] transition-all ${
                              !canVote 
                                ? 'bg-outline/10 text-outline cursor-not-allowed'
                                : 'bg-primary text-on-primary hover:bg-on-primary-fixed-variant'
                            }`}
                          >
                            {election.hasVoted ? 'Voted' : isClosed ? 'Closed' : 'Cast Vote'}
                          </button>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:rotate-12 transition-transform pointer-events-none">
                          <span className="material-symbols-outlined text-[120px]">how_to_vote</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Rules & Eligibility Status Banner */}
            <div className="p-md bg-secondary-container/30 border border-secondary/20 rounded-xl mb-lg">
              <div className="flex items-center space-x-md">
                <span className="material-symbols-outlined text-secondary text-[32px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                  verified
                </span>
                <div>
                  <p className="font-label-md text-label-md text-on-secondary-container font-bold">Identity Confirmed</p>
                  <p className="font-label-sm text-label-sm text-on-secondary-container opacity-80">Authenticated via Biometric ID</p>
                </div>
              </div>
            </div>

            {/* Rules & Eligibility */}
            <section className="bg-surface-container-low rounded-xl p-md border border-outline-variant">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-md font-bold">Rules &amp; Eligibility</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-md">
                {rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start space-x-sm">
                    <span className="material-symbols-outlined text-secondary">{rule.icon}</span>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface font-bold">{rule.title}</p>
                      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{rule.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ActiveElections;
