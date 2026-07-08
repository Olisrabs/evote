import DashboardLayout from './DashboardLayout';

const CandidatesList = ({ user, onNavigate, election, onSelectCandidateProfile }) => {
  const candidates = [];
  if (election && Array.isArray(election.candidates)) {
    election.candidates.forEach(c => {
      const normalizedPosition = c.position
        ? c.position.trim().replace(/\s+/g, ' ').toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        : '';
      candidates.push({
        id: c.id,
        name: c.fullName,
        position: normalizedPosition,
        party: c.studentId,
        description: c.manifestoSummary || (c.manifesto ? c.manifesto.substring(0, 150) : '') || 'No manifesto summary provided.',
        manifesto: c.manifesto || 'No manifesto details provided.',
        photo: c.photoUrl || '/images.jpg',
      });
    });
  }

  return (
    <DashboardLayout user={user} onNavigate={onNavigate} activeTab="active-elections">
      <div className="mx-auto max-w-4xl w-full">
        {/* Header */}
        <div className="mb-lg flex justify-between items-center">
          <button 
            onClick={() => onNavigate('active-elections')}
            className="flex items-center space-x-2 text-primary font-label-md hover:underline active:scale-95 transition-transform font-semibold"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span>Back to Elections</span>
          </button>
        </div>

        <header className="mb-lg">
          <h1 className="font-headline-lg text-headline-lg md:text-display text-on-surface mb-xs font-bold">Candidates List</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl leading-relaxed">
            Review the profiles and manifestos of all candidates running in the {election?.title || 'this election'}.
          </p>
        </header>

        {/* Candidate Grid */}
        {candidates.length === 0 ? (
          <div className="p-xl rounded-xl bg-surface-container/30 border border-outline/10 text-center text-outline">
            <span className="material-symbols-outlined text-[48px] mb-2">groups</span>
            <p className="text-sm font-semibold">No candidates registered in this election.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {candidates.map((candidate) => (
              <div 
                key={candidate.id}
                onClick={() => {
                  onSelectCandidateProfile(candidate);
                  onNavigate('candidate');
                }}
                className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 flex flex-col items-center text-center cursor-pointer shadow-sm hover:shadow-md hover:border-primary/50 transition-all active:scale-[0.98] group"
              >
                <div className="w-24 h-24 rounded-full border-4 border-surface-container-lowest shadow-sm overflow-hidden mb-4 group-hover:scale-105 transition-transform">
                  <img src={candidate.photo} alt={candidate.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-headline-md text-[18px] text-on-surface font-bold group-hover:text-primary transition-colors">{candidate.name}</h3>
                <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-[10px] font-bold tracking-wider mt-2 mb-2 uppercase">
                  {candidate.position}
                </span>
                <p className="text-secondary font-label-sm font-semibold mb-2">{candidate.party}</p>
                <p className="text-on-surface-variant font-body-sm line-clamp-2">{candidate.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CandidatesList;
