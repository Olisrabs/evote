import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const CTASection = ({ onNavigate }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section className="py-xl relative bg-on-primary-fixed overflow-hidden">
      {/* Dot pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div
        ref={ref}
        className={`max-w-4xl mx-auto px-4 text-center relative z-10 space-y-md transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <h2 className="text-display font-bold text-on-primary">
          The future of collective decision-making is here.
        </h2>
        <p className="text-body-lg text-primary-fixed opacity-90">
          Ready to transform your university or organization? Join over 40 campuses worldwide
          using e-vote to empower their students.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-base pt-base">
          <button
            onClick={() => onNavigate('signin')}
            className="w-full sm:w-auto bg-primary-fixed text-on-primary-fixed px-xl py-4 rounded-lg text-headline-md font-bold shadow-xl hover:bg-primary hover:text-on-primary transition-all active:scale-95"
          >
            Sign In To Vote
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
