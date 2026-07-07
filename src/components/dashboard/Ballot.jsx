import { useState } from 'react';
import DashboardLayout from './DashboardLayout';

const Ballot = ({ user, election, selections, onNavigate, onSelectCandidate, onSelectCandidateProfile }) => {
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);

  // Group candidates from the election by position
  const positionsMap = {};
  if (election && Array.isArray(election.candidates)) {
    election.candidates.forEach(c => {
      if (!positionsMap[c.position]) {
        positionsMap[c.position] = {
          id: c.position,
          title: c.position,
          description: `Please select one candidate for the position of ${c.position}.`,
          candidates: []
        };
      }
      positionsMap[c.position].candidates.push({
        id: c.id,
        name: c.fullName,
        party: c.studentId, // We can use student ID / matric no
        description: c.manifestoSummary || (c.manifesto ? c.manifesto.substring(0, 150) : '') || 'No manifesto summary provided.',
        manifesto: c.manifesto || 'No manifesto details provided.',
        photo: c.photoUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfanzHlxQeDE6xlggtBFZFNy6hM3HA-tdNN0CZlD5gJIlj960Jhdvu74LEOuyQ5lvtV1GIkQ7pbnxjoopsVe_5wrJn2Dg6cDUzVMlCGuELEFr47CQj0proqr_Lr_668EPzxtgKlMXDeY-7uI-LtMk_-rPWCgqP7prHvVnyfvZ_M3UQ83sRHILXUSdcK9xUx05EzjJxC8tLWVYw8hbrvUhkxMpb0_-3huLvvoctPz4w05E9KwRZ0lK1vjp9po5IKlmGT8ZGyc7Cv536',
      });
    });
  }
  const positions = Object.values(positionsMap);

  if (!election || positions.length === 0) {
    return (
      <DashboardLayout user={user} onNavigate={onNavigate} activeTab="active-elections">
        <div className="w-full max-w-[640px] mx-auto text-center py-12 bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
          <span className="material-symbols-outlined text-[48px] text-outline mb-2">how_to_vote</span>
          <h2 className="font-headline-lg font-bold text-on-surface mb-2">No Candidates Available</h2>
          <p className="font-body-md text-on-surface-variant mb-6">This election has no candidates registered yet.</p>
          <button 
            onClick={() => onNavigate('active-elections')}
            className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-label-md font-bold hover:brightness-110 transition-all active:scale-95 shadow-sm"
          >
            Back to Active Elections
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const currentPosition = positions[currentPositionIndex];
  const candidates = currentPosition.candidates;
  const selectedCandidate = selections[currentPosition.id] ? selections[currentPosition.id].id : null;

  const handleSelectCandidateLocal = (e, candidate) => {
    e.stopPropagation();
    onSelectCandidate(currentPosition.id, candidate);
    
    // Simulate haptic feedback if API is supported
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  };

  const handleKeyDown = (e, candidate) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelectCandidateLocal(e, candidate);
    }
  };

  const handleNext = () => {
    if (currentPositionIndex < positions.length - 1) {
      setCurrentPositionIndex(prev => prev + 1);
    } else {
      onNavigate('vote-review');
    }
  };

  const handlePrevious = () => {
    if (currentPositionIndex > 0) {
      setCurrentPositionIndex(prev => prev - 1);
    } else {
      onNavigate('active-elections');
    }
  };

  const getClosesIn = () => {
    const diffMs = new Date(election.endsAt) - new Date();
    if (diffMs <= 0) return 'Closed';
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h remaining`;
    if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m remaining`;
    return `${diffMins}m remaining`;
  };

  return (
    <DashboardLayout user={user} onNavigate={onNavigate} activeTab="active-elections">
      <div className="w-full max-w-[640px] mx-auto flex flex-col justify-start">
        
        {/* Closing Alert Moved to Top and Height Reduced */}
        <div className="mb-sm p-sm bg-tertiary-fixed text-on-tertiary-fixed rounded-xl flex items-center space-x-sm border border-tertiary-container/20 shadow-sm">
          <span className="material-symbols-outlined text-tertiary text-xl">schedule</span>
          <div className="flex-grow flex justify-between items-center">
            <p className="font-label-md text-label-md text-tertiary font-bold">Closing Soon</p>
            <p className="font-body-sm text-[13px] text-on-tertiary-fixed font-medium">
              Closes in {getClosesIn()}
            </p>
          </div>
        </div>

        <div className="text-center mb-xl mt-4">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs font-bold">{election.title}</h2>
          <h3 className="font-headline-md text-primary font-bold">{currentPosition.title}</h3>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">{currentPosition.description}</p>
        </div>

        {/* Candidate List (Vertical Bento Style) */}
        <div className="space-y-4 mb-8" id="candidate-list">
          {candidates.map((candidate) => {
            const isSelected = selectedCandidate === candidate.id;
            return (
              <div 
                key={candidate.id}
                onClick={(e) => handleSelectCandidateLocal(e, candidate)}
                onKeyDown={(e) => handleKeyDown(e, candidate)}
                className={`candidate-card group relative cursor-pointer bg-white border-2 rounded-2xl p-4 md:p-6 flex items-start space-x-4 md:space-x-6 transition-all duration-300 shadow-sm hover:shadow-md active:scale-[0.99] ${
                  isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-outline-variant hover:border-primary/50'
                }`}
                tabIndex={0}
              >
                {/* Radio Marker placed on the left */}
                <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected ? 'border-primary bg-primary' : 'border-outline-variant group-hover:border-primary/50'
                }`}>
                  {isSelected && (
                    <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                      check
                    </span>
                  )}
                </div>

                <div 
                  className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden flex-shrink-0 border border-outline-variant/30 cursor-pointer hover:border-primary transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCandidateProfile(candidate);
                    onNavigate('candidate');
                  }}
                  title="View Candidate Details"
                >
                  <img 
                    className="w-full h-full object-cover" 
                    alt={candidate.name}
                    src={candidate.photo} 
                  />
                </div>
                
                <div className="flex-grow pt-1">
                  <h3 
                    className={`font-headline-md text-[18px] font-bold cursor-pointer hover:underline decoration-primary transition-colors inline-block ${isSelected ? 'text-primary' : 'text-on-surface'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCandidateProfile(candidate);
                      onNavigate('candidate');
                    }}
                    title="View Candidate Details"
                  >
                    {candidate.name}
                  </h3>
                  <p className="font-label-md text-label-md text-secondary mb-1 font-semibold">{candidate.party}</p>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{candidate.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-8 bg-surface-container-low p-4 rounded-xl border border-outline-variant">
          <button 
            onClick={handlePrevious}
            className="flex items-center space-x-xs font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors py-2 px-4 rounded-lg active:scale-95"
          >
            <span className="material-symbols-outlined">chevron_left</span>
            <span className="font-semibold">{currentPositionIndex === 0 ? 'Back' : 'Previous'}</span>
          </button>
          <button 
            onClick={handleNext}
            disabled={selectedCandidate === null}
            className="flex items-center space-x-xs font-label-md text-label-md bg-primary text-on-primary py-2 px-6 rounded-lg shadow-sm hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed font-semibold"
            id="next-button"
          >
            <span>{currentPositionIndex < positions.length - 1 ? 'Next Position' : 'Submit Ballot'}</span>
            {currentPositionIndex < positions.length - 1 ? (
              <span className="material-symbols-outlined">chevron_right</span>
            ) : (
              <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Ballot;
