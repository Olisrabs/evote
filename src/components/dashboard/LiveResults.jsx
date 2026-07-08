import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';

const LiveResults = ({ user, onNavigate }) => {
  const [activeElectionsList, setActiveElectionsList] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [results, setResults] = useState([]);
  const [electionTitle, setElectionTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Fetch only active elections for live results
  useEffect(() => {
    const loadElections = async () => {
      try {
        const rActive = await fetch('/api/elections', { credentials: 'include' });

        if (rActive.status === 401 && onNavigate) {
          onNavigate('logout');
          return;
        }

        const activeData = rActive.ok ? await rActive.json() : { elections: [] };
        const list = activeData.elections || [];

        setActiveElectionsList(list);
        if (list.length > 0) {
          setSelectedElectionId(list[0].id);
          setElectionTitle(list[0].title);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadElections();
  }, [onNavigate]);

  // 2. Fetch results when selected election changes
  useEffect(() => {
    if (!selectedElectionId) return;
    const loadResults = async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/elections/${selectedElectionId}/results`, { credentials: 'include' });
        if (r.status === 401 && onNavigate) {
          onNavigate('logout');
          return;
        }
        if (!r.ok) throw new Error('Failed to load results');
        const data = await r.json();
        setResults(data.results || []);
        setElectionTitle(data.election?.title || '');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadResults();
  }, [selectedElectionId]);

  // Group candidates by position
  const positionsMap = {};
  results.forEach(cand => {
    const normalizedPosition = cand.position
      ? cand.position.trim().replace(/\s+/g, ' ').toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : '';
    if (!positionsMap[normalizedPosition]) {
      positionsMap[normalizedPosition] = {
        position: normalizedPosition,
        candidates: []
      };
    }
    positionsMap[normalizedPosition].candidates.push(cand);
  });

  const positionResultsList = Object.values(positionsMap).map(posData => {
    // Sort candidates by voteCount desc
    const sorted = [...posData.candidates].sort((a, b) => b.voteCount - a.voteCount);
    const totalVotes = sorted.reduce((sum, c) => sum + c.voteCount, 0);

    return {
      position: posData.position,
      totalVotes,
      candidates: sorted.map(c => ({
        ...c,
        percentage: totalVotes > 0 ? ((c.voteCount / totalVotes) * 100).toFixed(1) : '0.0'
      }))
    };
  });

  return (
    <DashboardLayout user={user} onNavigate={onNavigate} activeTab="past-elections">
      <div className="w-full max-w-[800px] mx-auto px-margin-mobile md:px-0 py-xl flex-grow">
        <div className="mb-lg flex justify-between items-center">
          <button 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center space-x-2 text-on-surface-variant hover:text-primary transition-colors font-semibold"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span className="font-label-md text-label-md">Back to Dashboard</span>
          </button>
        </div>

        <div className="text-center mb-xl">
          <div className="inline-flex items-center space-x-2 bg-secondary-container text-on-secondary-container px-4 py-1.5 rounded-full mb-4">
            <span className="w-2.5 h-2.5 bg-secondary rounded-full animate-pulse"></span>
            <span className="font-label-sm font-bold uppercase tracking-wide">Live Polling Data</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">
            {electionTitle || 'Election Results'}
          </h1>
          <p className="font-body-md text-on-surface-variant mt-2">
            Certified historical tallies retrieved dynamically from secure logs.
          </p>

          {activeElectionsList.length > 1 && (
            <div className="mt-md max-w-xs mx-auto">
              <select
                value={selectedElectionId}
                onChange={(e) => setSelectedElectionId(e.target.value)}
                className="w-full bg-white border border-outline-variant rounded-lg px-3 py-2 font-label-md text-label-md text-on-surface-variant focus:ring-2 focus:ring-primary outline-none"
              >
                {activeElectionsList.map(el => (
                  <option key={el.id} value={el.id}>{el.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-on-surface-variant font-medium">Loading election results...</p>
          </div>
        ) : error ? (
          <div className="p-md rounded-xl bg-error/10 text-error border border-error/20 text-center font-medium">
            {error}
          </div>
        ) : positionResultsList.length === 0 ? (
          <div className="p-xl rounded-xl bg-surface-container/30 border border-outline/10 text-center text-outline">
            <span className="material-symbols-outlined text-[48px] mb-2">analytics</span>
            <p className="text-sm font-semibold">No results recorded for this election.</p>
          </div>
        ) : (
          <div className="space-y-xl">
            {positionResultsList.map((posData, idx) => (
              <div key={idx} className="bg-white border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm">
                <h3 className="font-headline-md text-headline-md text-primary font-bold mb-6">
                  {posData.position}
                </h3>
                <div className="space-y-6">
                  {posData.candidates.map((res, i) => (
                    <div key={res.id}>
                      <div className="flex justify-between items-end mb-2">
                        <div className="flex items-center gap-3">
                          <img 
                            src={res.photoUrl || '/images.jpg'}  
                            alt={res.fullName} 
                            className="w-10 h-10 rounded-full object-cover border border-outline-variant"
                          />
                          <div>
                            <span className="font-label-md font-bold text-on-surface">{res.fullName}</span>
                            <span className="text-on-surface-variant text-xs ml-2">({res.studentId})</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-headline-sm font-bold text-primary">{res.percentage}%</span>
                          <span className="text-on-surface-variant text-xs block">{res.voteCount.toLocaleString()} votes</span>
                        </div>
                      </div>
                      <div className="w-full bg-surface-variant rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-full ${i === 0 ? 'bg-primary' : 'bg-outline'} rounded-full transition-all duration-1000`} 
                          style={{ width: `${res.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LiveResults;
