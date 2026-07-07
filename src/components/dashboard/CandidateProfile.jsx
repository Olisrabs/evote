import DashboardLayout from './DashboardLayout';

const CandidateProfile = ({ user, onNavigate, candidate }) => {
  const handleBackClick = () => {
    onNavigate('ballot');
  };

  if (!candidate) {
    return (
      <DashboardLayout user={user} onNavigate={onNavigate} activeTab="active-elections">
        <div className="max-w-3xl w-full mx-auto p-md text-center">
          <p className="text-outline mb-4">No candidate selected.</p>
          <button onClick={handleBackClick} className="text-primary hover:underline font-semibold">Back to Ballot</button>
        </div>
      </DashboardLayout>
    );
  }

  const name = candidate.name || candidate.fullName || 'Unknown Candidate';
  const position = candidate.position || 'Candidate';
  const photo = candidate.photo || candidate.photoUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfanzHlxQeDE6xlggtBFZFNy6hM3HA-tdNN0CZlD5gJIlj960Jhdvu74LEOuyQ5lvtV1GIkQ7pbnxjoopsVe_5wrJn2Dg6cDUzVMlCGuELEFr47CQj0proqr_Lr_668EPzxtgKlMXDeY-7uI-LtMk_-rPWCgqP7prHvVnyfvZ_M3UQ83sRHILXUSdcK9xUx05EzjJxC8tLWVYw8hbrvUhkxMpb0_-3huLvvoctPz4w05E9KwRZ0lK1vjp9po5IKlmGT8ZGyc7Cv536';
  const manifesto = candidate.description || candidate.manifesto || 'No manifesto details provided by the candidate.';

  return (
    <DashboardLayout user={user} onNavigate={onNavigate} activeTab="active-elections">
      <div className="max-w-3xl w-full mx-auto space-y-8">
        
        <div className="flex justify-between items-center bg-white border border-outline-variant rounded-xl p-md shadow-sm mb-lg relative overflow-hidden">
          <button 
            onClick={handleBackClick}
            className="flex items-center space-x-2 text-primary font-label-md hover:underline active:scale-95 transition-transform font-semibold z-10"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span>Back to Ballot</span>
          </button>
        </div>

        {/* Hero Section: Header */}
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden ring-1 ring-outline-variant group-hover:scale-105 transition-transform duration-300">
              <img 
                alt={`${name} Portrait`} 
                className="w-full h-full object-cover" 
                src={photo}
              />
            </div>
            <div className="absolute bottom-2 right-2 bg-secondary text-white rounded-full p-1.5 shadow-lg ring-2 ring-white hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-lg block" style={{ fontVariationSettings: '"FILL" 1' }}>
                verified
              </span>
            </div>
          </div>
          
          <div className="space-y-1">
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">{name}</h2>
            <p className="font-headline-md text-headline-md text-primary font-semibold">{position}</p>
            
            <div className="flex items-center justify-center space-x-2 mt-2">
              <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold flex items-center space-x-1">
                <span className="material-symbols-outlined text-xs">shield</span>
                <span>Verified Candidate</span>
              </span>
              {candidate.party && (
                <span className="bg-surface-container-highest text-on-surface-variant px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold flex items-center space-x-1">
                  <span className="material-symbols-outlined text-xs">badge</span>
                  <span>{candidate.party}</span>
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Bio Section */}
        <section className="glass-card rounded-2xl p-6 md:p-8 space-y-4 shadow-sm hover:shadow-md transition-shadow bg-white border border-outline-variant">
          <h3 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant pb-2 flex items-center font-bold">
            <span className="material-symbols-outlined mr-2 text-primary">work</span>
            <span>Manifesto</span>
          </h3>
          <div className="space-y-4 text-on-surface-variant leading-relaxed font-body-md whitespace-pre-wrap">
            {manifesto}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default CandidateProfile;
