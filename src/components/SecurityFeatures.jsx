import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const SecurityFeatures = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section id="features" className="py-xl bg-surface-container-low">
      <div
        ref={ref}
        className={`max-w-container-max mx-auto px-4 md:px-md transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-2">
          <div className="max-w-2xl">
            <h2 className="text-headline-lg font-bold text-on-surface mb-base">
              Built on Foundations of Immutable Trust
            </h2>
            <p className="text-body-md text-on-surface-variant">
              Our security protocol exceeds international standards for electronic voting systems,
              utilizing a multi-layered defense architecture.
            </p>
          </div>
          <div className="flex items-center gap-2 text-primary text-label-md cursor-pointer group">
            <span>Read Security Whitepaper</span>
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </div>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">

          {/* Feature 1: Encryption — spans 8 cols */}
          <div className="md:col-span-8 bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm flex flex-col md:flex-row items-center gap-md">
            <div className="md:w-1/2 space-y-base">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">lock</span>
              </div>
              <h4 className="text-headline-md font-semibold">End-to-End Encryption</h4>
              <p className="text-body-md text-on-surface-variant">
                Utilizing homomorphic encryption, e-vote allows for the tallying of votes while
                they remain fully encrypted, preserving student privacy perfectly.
              </p>
            </div>
            <div className="md:w-1/2 w-full h-48 bg-surface-container rounded-lg overflow-hidden">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBowqm3a86obpbnNZl7QFUT7NbABYJGvW_5OgqGk12XMLxNNpkCYEhJHhPg6YItGXKJreKdQ6piRA-d6ObFe3-IvChYJfixFcnE2sQ_nkNyKjjv3oqK7ZhQd7bGSYs0yMdlZSsRoD37kNhn69wzq2nsvT3FbPFaLa7-nKz5Bx098242DWy041UQysTABhejYQCn6c4svfHSeAS9mPouiYlYxh_NZ70_-8Q6EksEKbf-XRAKqVP4bTFfDEDWTChsNDMQKflFmtftiuMl"
                alt="High-tech server room representing cryptographic security"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Feature 2: Audit Trail — spans 4 cols */}
          <div className="md:col-span-4 bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm space-y-base">
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">analytics</span>
            </div>
            <h4 className="text-headline-md font-semibold">Real-time Audit Trail</h4>
            <p className="text-body-md text-on-surface-variant">
              A public, immutable ledger allows independent observers to verify the integrity of the
              election without compromising anonymity.
            </p>
          </div>

          {/* Feature 3: Identity Sovereignty — spans 4 cols, accent bg */}
          <div className="md:col-span-4 bg-primary text-on-primary p-md rounded-xl shadow-lg space-y-base">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container">
                person_check
              </span>
            </div>
            <h4 className="text-headline-md font-semibold">Identity Sovereignty</h4>
            <p className="text-body-md text-on-primary-container opacity-90">
              Decentralized identifiers (DIDs) put voters in control of their data, eliminating
              centralized points of failure for personal information.
            </p>
          </div>

          {/* Feature 4: Redundancy — spans 8 cols */}
          <div className="md:col-span-8 bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm flex flex-col-reverse md:flex-row items-center gap-md">
            <div className="md:w-1/2 w-full h-48 bg-surface-container rounded-lg overflow-hidden">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZcGPCmMIho5MKtHUt-XLtZcwOWtVZFq64dFU_pg23b3MQjD9FWFPi_YVkhIDNnha2anDiKiKcvGD3NkkS5uQUXuGoThLMXeyH3NjnrvdeAH_YuPRBzquszBW0U3UtmGVp09PsrR-zD0apKXktmmiOWJeVXNbaYD9i-bwCodx1eE8htB6HyS9Rwdts4TokrGG1n4Ao636xuqNvYWe0LikQq4GFN_lG2gOMXidI3dAylruKDJnVnwUF4oSkDvO4uT2FNmafDowNROqy"
                alt="Global digital network map representing distributed infrastructure"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 space-y-base">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">hub</span>
              </div>
              <h4 className="text-headline-md font-semibold">Distributed Redundancy</h4>
              <p className="text-body-md text-on-surface-variant">
                Our infrastructure is distributed across geographically redundant nodes, ensuring
                zero downtime even during massive cyber-attacks or outages.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default SecurityFeatures;
