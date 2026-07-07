import { useEffect, useState } from 'react';
import DashboardLayout from './DashboardLayout';

const VoteSubmitted = ({ user, selections, onNavigate, onResetBallot }) => {
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    // Generate mock confetti particles
    const colors = ['#006d41', '#93f7ba', '#00429d', '#b0c6ff', '#7f2b00'];
    const particles = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        id: i,
        left: Math.random() * 100 + 'vw',
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        width: Math.random() * 8 + 6 + 'px',
        height: Math.random() * 8 + 6 + 'px',
        animationDelay: Math.random() * 2 + 's',
        animationDuration: Math.random() * 2 + 3 + 's'
      });
    }
    setConfetti(particles);
  }, []);

  const handleFinish = () => {
    onResetBallot();
    onNavigate('dashboard');
  };

  return (
    <DashboardLayout user={user} onNavigate={onNavigate} activeTab="active-elections">
      {/* Confetti Particles Container */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-50" id="confetti-container">
        {confetti.map((particle) => (
          <div
            key={particle.id}
            className="absolute top-[-20px] rounded-sm opacity-70 animate-confettiFall"
            style={{
              left: particle.left,
              backgroundColor: particle.backgroundColor,
              width: particle.width,
              height: particle.height,
              animationDelay: particle.animationDelay,
              animationDuration: particle.animationDuration,
              animationFillMode: 'both',
              animationIterationCount: 'infinite'
            }}
          />
        ))}
      </div>

      <div className="max-w-[640px] w-full mx-auto flex flex-col items-center text-center mt-12 mb-12">
        {/* Success Icon Animation Container */}
        <div className="relative mb-lg">
          <div className="absolute -inset-4 bg-secondary-fixed-dim blur-3xl opacity-20 rounded-full animate-pulse-soft"></div>
          <div className="w-24 h-24 md:w-32 md:h-32 bg-secondary rounded-full flex items-center justify-center shadow-lg relative z-10 hover:scale-105 transition-transform duration-300">
            <span className="material-symbols-outlined text-white !text-6xl md:!text-7xl" style={{ fontVariationSettings: '"FILL" 1' }}>
              check_circle
            </span>
          </div>
        </div>

        <h1 className="font-headline-lg text-headline-lg mb-4 text-on-surface font-bold">Vote Submitted Successfully</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl max-w-md">
          Your vote has been securely cast and encrypted. Thank you for participating in the university election process.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-lg">
          <button 
            onClick={handleFinish}
            className="flex items-center justify-center gap-2 border border-outline text-on-surface-variant px-5 py-2 rounded-lg font-label-sm text-label-sm hover:bg-surface-container active:scale-95 transition-all font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            <span>Return to Dashboard</span>
          </button>

          <button 
            onClick={() => onNavigate('live-results')}
            className="flex items-center justify-center gap-2 bg-primary text-on-primary px-5 py-2 rounded-lg font-label-sm text-label-sm hover:shadow-md active:scale-95 transition-all font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>query_stats</span>
            <span>View Live Result</span>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VoteSubmitted;
