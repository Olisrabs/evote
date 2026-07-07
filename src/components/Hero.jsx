import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const Hero = ({ onNavigate }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section className="relative overflow-hidden py-xl md:py-24 voter-gradient">
      <div
        ref={ref}
        className={`max-w-container-max mx-auto px-4 md:px-md flex flex-col lg:flex-row items-center gap-12 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Text block */}
        <div className="lg:w-1/2 space-y-md text-center lg:text-left z-10">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-label-md mb-xs">
            <span className="material-symbols-outlined mr-1" style={{ fontSize: '18px' }}>
              gpp_good
            </span>
            EAL Level 5 Certified Infrastructure
          </div>

          <h1 className="text-display font-bold text-on-surface leading-tight">
            Secure, Transparent{' '}
            <span className="text-primary">University Elections</span>
          </h1>

          <p className="text-body-lg text-on-surface-variant max-w-xl mx-auto lg:mx-0">
            e-vote provides the campus's most trusted digital voting infrastructure, combining
            secure auditability with student identity verification to ensure every voice is
            counted accurately and privately.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-base">
            <button
              onClick={() => onNavigate('signin')}
              className="bg-primary text-on-primary px-lg py-3 rounded-lg text-label-md shadow-md hover:bg-on-primary-fixed-variant active:scale-95 transition-all"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Image block */}
        <div className="lg:w-1/2 relative">
          <div className="relative z-10 w-full aspect-video rounded-xl overflow-hidden shadow-2xl border-4 border-surface-container-lowest">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfbxO5QNwpAleYZXO9y5VrHWkT0C7I6vmEAYLzw9bunVpYH1p1xJjnMIrmmimiMyM_rOdnSoGFn7FrO_56vR0i5eqhndYE2C5SkWtoMzGQ9-uLOb0_WJFZbJEhQp7DsD0iBOI-oTyCScl0D5yabR4GXkKRvbWnTCGgE92eyNGHknNtuXw0dsNh12aCzgLE4J_N8lJK_PdMI2oQ1yBpI8_h5gdZLyr0iCIJUuRDXuNLBaruR7Zj0yXw_j_Qjwg2xjIXBns0ZpK_XqQz"
              alt="A diverse group of university students looking at a secure digital voting interface"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary-fixed-dim rounded-full blur-2xl opacity-40"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-secondary-fixed-dim rounded-full blur-3xl opacity-30"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
