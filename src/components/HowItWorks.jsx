import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const steps = [
  {
    icon: 'fingerprint',
    title: '1. Identity Verification',
    description:
      'Securely authenticate using University Student ID and advanced biometric matching to ensure one student, one vote.',
  },
  {
    icon: 'how_to_vote',
    title: '2. Cast Your Ballot',
    description:
      'Navigate a clear, intuitive interface. Your choices are encrypted locally before being transmitted to the digital ballot box.',
  },
  {
    icon: 'receipt_long',
    title: '3. Verify & Confirm',
    description:
      'Receive a cryptographic receipt to verify your vote was counted correctly without revealing your specific choice to anyone else.',
  },
];

const HowItWorks = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section id="how-it-works" className="py-xl bg-surface-container-lowest">
      <div
        ref={ref}
        className={`max-w-container-max mx-auto px-4 md:px-md transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="text-center mb-16 space-y-xs">
          <h2 className="text-headline-lg font-bold text-on-surface">
            The Journey to a Valid Vote
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Simple, fast, and mathematically verifiable steps for every voter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {steps.map((step) => (
            <div
              key={step.title}
              className="flex flex-col items-center text-center p-md border border-outline-variant rounded-xl hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mb-base">
                <span className="material-symbols-outlined text-on-primary text-3xl">
                  {step.icon}
                </span>
              </div>
              <h3 className="text-headline-md font-semibold mb-base">{step.title}</h3>
              <p className="text-body-md text-on-surface-variant">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
