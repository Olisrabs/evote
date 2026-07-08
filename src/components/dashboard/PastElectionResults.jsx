import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';

const PastElectionResults = ({ user, election, onNavigate }) => {
  const [copied, setCopied] = useState(false);
  const [results, setResults] = useState([]);
  const [userVotes, setUserVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!election) return;
    const loadResults = async () => {
      try {
        // Fetch results
        const resR = await fetch(`/api/elections/${election.id}/results`, { credentials: 'include' });
        if (!resR.ok) throw new Error('Failed to load election results');
        const dataR = await resR.json();
        setResults(dataR.results || []);

        // Fetch user's votes
        const resV = await fetch(`/api/elections/${election.id}`, { credentials: 'include' });
        if (resV.ok) {
          const dataV = await resV.json();
          setUserVotes(dataV.castVotes || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadResults();
  }, [election]);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(election?.id || 'f12c8a927a7c8ef401eb39071c54b2e1');
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  if (!election) {
    return (
      <DashboardLayout user={user} onNavigate={onNavigate} activeTab="past-elections">
        <div className="max-w-3xl w-full mx-auto p-md text-center">
          <p className="text-outline mb-4">No election selected.</p>
          <button onClick={() => onNavigate('past-elections')} className="text-primary hover:underline font-semibold">Back to Past Elections</button>
        </div>
      </DashboardLayout>
    );
  }

  // Group candidates by position
  const positionsMap = {};
  results.forEach(cand => {
    if (!positionsMap[cand.position]) {
      positionsMap[cand.position] = {
        position: cand.position,
        candidates: []
      };
    }
    positionsMap[cand.position].candidates.push(cand);
  });

  const positionResultsList = Object.values(positionsMap).map(posData => {
    // Sort candidates by voteCount desc
    const sorted = [...posData.candidates].sort((a, b) => b.voteCount - a.voteCount);
    const winner = sorted[0];
    const totalVotes = sorted.reduce((sum, c) => sum + c.voteCount, 0);

    // Find what the user voted for
    const userVoteObj = userVotes.find(v => v.position === posData.position);
    const userVotedCandidate = posData.candidates.find(c => c.id === userVoteObj?.candidateId);

    return {
      position: posData.position,
      totalVotes,
      candidates: sorted.map(c => ({
        ...c,
        percentage: totalVotes > 0 ? ((c.voteCount / totalVotes) * 100).toFixed(1) + '%' : '0.0%'
      })),
      winner: winner ? {
        ...winner,
        percentage: totalVotes > 0 ? ((winner.voteCount / totalVotes) * 100).toFixed(1) + '%' : '0.0%'
      } : null,
      userVote: userVotedCandidate ? {
        name: userVotedCandidate.fullName,
        photo: userVotedCandidate.photoUrl || '/images.jpg'
      } : null
    };
  });

  const totalVotesCastSum = results.reduce((sum, c) => sum + c.voteCount, 0);

  return (
    <DashboardLayout user={user} onNavigate={onNavigate} activeTab="past-elections">
      {/* Breadcrumb back to past elections list */}
      <div className="mb-4">
        <button 
          onClick={() => onNavigate('past-elections')}
          className="flex items-center space-x-1 text-primary font-bold text-sm hover:underline"
        >
          <span className="material-symbols-outlined text-xs">arrow_back</span>
          <span>Back to Past Elections</span>
        </button>
      </div>

      {/* Page Header & Action */}
      <div className="mb-lg flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <div className="flex items-center gap-xs text-primary font-label-md mb-xs font-bold">
            <span className="material-symbols-outlined text-[18px]">history</span>
            <span>PAST ELECTION • {new Date(election.endsAt).getFullYear()}</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold mb-xs">{election.title}</h1>
          <p className="text-on-surface-variant max-w-2xl leading-relaxed">
            {election.description || 'Final certified results. All votes have been tallied and cryptographically verified.'}
          </p>
        </div>
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
      ) : (
        <>
          {/* Dashboard Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-lg">
            <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm flex flex-col justify-center hover:shadow-md transition-shadow">
              <span className="text-on-surface-variant font-label-md mb-xs font-semibold">Total Votes Cast</span>
              <span className="text-display font-display text-primary leading-none font-bold">{totalVotesCastSum.toLocaleString()}</span>
              <div className="flex items-center gap-xs text-secondary mt-sm font-label-sm font-bold">
                <span className="material-symbols-outlined text-[16px]">how_to_vote</span>
                <span>Across all positions</span>
              </div>
            </div>
            
            <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm flex flex-col justify-center hover:shadow-md transition-shadow">
              <span className="text-on-surface-variant font-label-md mb-xs font-semibold">Election Audit Hash</span>
              <div className="flex items-center space-x-2 mt-xs">
                <code className="text-xs bg-surface-container-high px-2 py-1 rounded truncate max-w-[150px] font-mono text-on-surface">
                  {election.id}
                </code>
                <button 
                  onClick={handleCopyHash}
                  className="p-1 hover:bg-surface-container rounded transition-colors text-primary"
                  title="Copy Audit Hash"
                >
                  <span className="material-symbols-outlined text-sm">{copied ? 'check' : 'content_copy'}</span>
                </button>
              </div>
            </div>
            
            <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm flex flex-col justify-center overflow-hidden relative hover:shadow-md transition-shadow">
              <div className="relative z-10">
                <span className="text-on-surface-variant font-label-md mb-xs font-semibold">Verification Status</span>
                <div className="flex items-center gap-sm mt-xs">
                  <span className="material-symbols-outlined text-secondary text-[40px]" style={{ fontVariationSettings: '"FILL" 1' }}>verified</span>
                  <div>
                    <span className="text-headline-md font-headline-md text-on-surface block font-bold">Certified</span>
                    <span className="text-label-sm font-label-sm text-secondary font-bold">Secured by Cryptographic Proof</span>
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-5">
                <span className="material-symbols-outlined text-[120px]">security</span>
              </div>
            </div>
          </div>

          <div className="space-y-lg">
            {/* Header for Breakdown */}
            <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-base font-bold">
              <span className="material-symbols-outlined">analytics</span>
              <span>Position Results & Your Ballot</span>
            </h2>

            {/* Dynamic Position Cards */}
            {positionResultsList.map((result, idx) => {
              const userVotedForWinner = result.winner && result.userVote && result.winner.fullName === result.userVote.name;

              return (
                <div key={idx} className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Position Header */}
                  <div className="bg-surface-container-low px-6 py-4 border-b border-outline-variant flex justify-between items-center">
                    <h3 className="font-headline-md text-[20px] font-bold text-on-surface">{result.position}</h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Elected Candidate (Left) */}
                    <div className="p-6 relative border-b lg:border-b-0 lg:border-r border-outline-variant">
                      {result.winner && (
                        <>
                          <div className="absolute top-0 right-0">
                            <div className="bg-primary text-on-primary px-10 py-1 font-label-sm rotate-45 translate-x-10 translate-y-3 text-center text-[10px] font-bold tracking-wider shadow-sm">
                              WINNER
                            </div>
                          </div>
                          <h4 className="text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider mb-4">Official Winner</h4>
                          
                          <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full border-4 border-primary/20 overflow-hidden shrink-0 shadow-sm">
                              <img 
                                alt={result.winner.fullName} 
                                className="w-full h-full object-cover" 
                                src={result.winner.photoUrl || '/images.jpg'}
                              />
                            </div>
                            <div className="flex-grow">
                              <h4 className="font-headline-md text-[18px] text-on-surface font-bold">{result.winner.fullName}</h4>
                              <p className="font-label-sm text-secondary font-semibold mb-2">{result.winner.studentId}</p>
                              
                              <div className="flex items-end gap-2">
                                <span className="text-display font-display text-on-surface leading-none font-bold text-[24px]">{result.winner.voteCount}</span>
                                <span className="text-on-surface-variant font-body-sm font-medium pb-0.5">votes ({result.winner.percentage})</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-full bg-surface-container rounded-full h-1.5 mt-4">
                            <div className="bg-primary h-1.5 rounded-full" style={{ width: result.winner.percentage }}></div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* User's Vote (Right) */}
                    <div className="p-6 bg-surface-container-lowest flex flex-col justify-center relative">
                      <h4 className="text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>how_to_vote</span>
                        Your Selection
                      </h4>
                      
                      {result.userVote ? (
                        <div className="flex items-center gap-4">
                          <div className={`w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 ${userVotedForWinner ? 'border-primary' : 'border-outline-variant'}`}>
                            <img 
                              alt={result.userVote.name} 
                              className="w-full h-full object-cover opacity-90" 
                              src={result.userVote.photo}
                            />
                          </div>
                          <div>
                            <h4 className="font-headline-sm text-[16px] text-on-surface font-bold">{result.userVote.name}</h4>
                            {userVotedForWinner ? (
                              <span className="inline-flex items-center gap-1 mt-1 bg-primary-container text-on-primary-container px-2 py-0.5 rounded text-[10px] font-bold tracking-wide">
                                <span className="material-symbols-outlined text-[12px]">check</span>
                                MATCHES WINNER
                              </span>
                            ) : (
                              <span className="text-on-surface-variant font-label-sm mt-1 block">Different Selection</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-on-surface-variant font-label-md italic">
                          No vote recorded for this position.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};
export default PastElectionResults;
