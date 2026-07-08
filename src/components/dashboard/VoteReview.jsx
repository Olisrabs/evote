import { useState } from 'react';
import DashboardLayout from './DashboardLayout';

const VoteReview = ({ user, election, selections, onNavigate, onSubmitBallot }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const normalizePositionName = (pos) => {
    return pos
      ? pos.trim().replace(/\s+/g, ' ').toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : '';
  };

  const handleSubmit = async () => {
    if (!election) return;
    setIsSubmitting(true);
    setError('');
    try {
      const validPositions = new Set(election?.candidates?.map(c => normalizePositionName(c.position)) || []);
      const votesPayload = Object.entries(selections || {})
        .filter(([position, candidate]) => validPositions.has(normalizePositionName(position)) && candidate !== null && candidate !== undefined)
        .map(([position, candidate]) => ({
          position: normalizePositionName(position),
          candidateId: typeof candidate === 'object' ? candidate.id : candidate
        }));

      const r = await fetch(`/api/elections/${election.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ votes: votesPayload }),
        credentials: 'include'
      });

      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        throw new Error(body.message || body.error || 'Failed to submit ballot');
      }

      onSubmitBallot();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validPositions = new Set(election?.candidates?.map(c => normalizePositionName(c.position)) || []);
  const selectedCandidatesList = Object.entries(selections || {})
    .filter(([position, candidate]) => validPositions.has(normalizePositionName(position)) && candidate !== null && candidate !== undefined)
    .map(([position, candidate]) => ({
      position: normalizePositionName(position),
      name: typeof candidate === 'object' ? (candidate.name || candidate.fullName || 'Unknown Candidate') : 'Unknown Candidate',
      party: typeof candidate === 'object' ? (candidate.party || candidate.studentId || 'N/A') : 'N/A',
      id: typeof candidate === 'object' ? candidate.id : candidate
    }));

  return (
    <DashboardLayout user={user} onNavigate={onNavigate} activeTab="active-elections">
      <div className="w-full flex-grow flex flex-col items-center justify-start pb-24 md:pb-8">
        {/* Progress Stepper */}
        <div className="w-full max-w-2xl mx-auto px-4 mt-8">
          <div className="flex items-center justify-between">
            {/* Step 1 */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center text-xs font-bold shadow-md">
                <span className="material-symbols-outlined text-sm">check</span>
              </div>
              <span className="font-label-sm text-label-sm text-secondary font-semibold">Select Candidate</span>
            </div>
            <div className="flex-1 h-0.5 bg-secondary mx-4"></div>
            {/* Step 2 */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center text-xs font-bold shadow-md">
                <span className="material-symbols-outlined text-sm">check</span>
              </div>
              <span className="font-label-sm text-label-sm text-secondary font-semibold">Review Platform</span>
            </div>
            <div className="flex-1 h-0.5 bg-secondary mx-4"></div>
            {/* Step 3 */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold ring-4 ring-primary-container shadow-md">
                3
              </div>
              <span className="font-label-sm text-label-sm text-primary font-bold">Cast Encrypted Ballot</span>
            </div>
          </div>
        </div>

        {/* Content Canvas */}
        <div className="flex-grow p-4 md:p-lg flex flex-col items-center w-full">
          <div className="w-full max-w-2xl">
            <header className="mb-md text-center mt-6">
              <h2 className="font-headline-lg text-headline-lg text-on-background mb-base font-bold">Review Your Official Ballot</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">{election?.title || 'SUG General Election'}</p>
            </header>

            {/* Summary Section with Trust Background */}
            <section className="bg-primary-container/10 border border-primary-container rounded-2xl overflow-hidden shadow-sm mb-lg">
              <div className="bg-primary-container p-md flex items-center space-x-sm text-white">
                <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: '"FILL" 1' }}>
                  security
                </span>
                <h3 className="font-label-md text-label-md text-on-primary font-bold">Encrypted Summary of Selections</h3>
              </div>
              
              <div className="p-md space-y-md max-h-[500px] overflow-y-auto scrolling-content">
                {selectedCandidatesList.length === 0 ? (
                  <div className="p-md text-center text-on-surface-variant font-medium">
                    No selections made.
                  </div>
                ) : (
                  selectedCandidatesList.map((item) => (
                    <div key={item.position} className="flex justify-between items-center bg-white p-md rounded-xl border border-outline-variant/50 hover:shadow-md transition-shadow">
                      <div>
                        <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">{item.position}</p>
                        <p className="font-headline-md text-headline-md text-on-surface font-bold">{item.name}</p>
                        <p className="font-label-md text-label-md text-secondary font-semibold">{item.party}</p>
                      </div>
                      <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: '"FILL" 1' }}>
                        verified
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Error Feedback */}
            {error && (
              <div className="p-md rounded-xl bg-error/10 text-error border border-error/20 text-center font-medium mb-lg">
                {error}
              </div>
            )}

            {/* Warning Banner */}
            <div className="flex items-start space-x-sm p-md bg-error-container/20 border border-error-container rounded-xl mb-lg">
              <span className="material-symbols-outlined text-error">warning</span>
              <div>
                <p className="font-label-md text-label-md text-on-error-container font-bold">Critical Confirmation Required</p>
                <p className="font-body-md text-body-md text-on-error-container leading-relaxed">
                  This action is final and cannot be undone. Once submitted, your cryptographic signature will be securely locked and cannot be modified.
                </p>
              </div>
            </div>

            {/* Call to Actions */}
            <div className="flex flex-col space-y-md">
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting || selectedCandidatesList.length === 0}
                className="group relative w-full h-16 bg-primary text-on-primary rounded-xl font-headline-md flex items-center justify-center space-x-sm hover:bg-primary-container transition-all active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-75 disabled:cursor-not-allowed font-bold" 
                id="submitBallot"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing Encryption...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">how_to_vote</span>
                    <span>Submit Official Ballot</span>
                  </>
                )}
              </button>
              
              <button 
                onClick={() => onNavigate('ballot')}
                disabled={isSubmitting}
                className="w-full py-md font-label-md text-label-md text-primary flex items-center justify-center space-x-xs hover:bg-surface-container rounded-xl transition-colors font-bold disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">edit</span>
                <span>Edit Selections</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VoteReview;
