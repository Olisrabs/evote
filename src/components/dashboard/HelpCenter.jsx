import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';

const HelpCenter = ({ user, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'agent', text: 'Hello! Welcome to e-vote 24/7 Support. How can we help you secure your student vote today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState({ name: user || '', email: '', category: 'general', message: '' });
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [generatedTicketId, setGeneratedTicketId] = useState('');

  const getInitials = (name) => {
    if (!name) return 'JD';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Predefined Help Articles
  const articles = [
    {
      id: 'verify-id',
      category: 'Registration & Identity',
      title: 'How to verify your Student ID',
      content: `Verifying your identity on e-vote is a straightforward two-step process designed to ensure that one unique student receives exactly one ballot. 
      
      1. Navigate to your Profile section and select "Verify Student ID".
      2. Upload a scan of your University ID card.
      3. Complete the brief 3D biometric face-scan verification via your smartphone or webcam.
      
      Our automated system cross-checks this metadata with official university registries to cryptographically confirm your eligibility. Your physical documents are immediately purged from our servers once verification is completed.`,
      tags: ['identity', 'verify', 'digital id', 'biometric']
    },
    {
      id: 'supported-docs',
      category: 'Registration & Identity',
      title: 'Supported documents for student verification',
      content: `e-vote supports the following documents for verifying student registration eligibility:
      - Valid University Student ID Card
      - Departmental Clearance Letter
      - Registration Printout
      
      Please ensure your document's text is legible and all four corners are visible in the photo upload. Expiration dates must be current at the time of verification.`,
      tags: ['documents', 'student id', 'id', 'license']
    },
    {
      id: 'update-address',
      category: 'Registration & Identity',
      title: 'Updating your departmental affiliation',
      content: `Your department determines your faculty voting jurisdiction and specific ballot. To update it:
      1. Go to Student Settings > Faculty Info.
      2. Enter your new department and click "Check Registry".
      3. Upload a recent course registration form to prove affiliation.
      
      Your department verification will be processed within 24 hours. If an election is currently active, updates must be submitted at least 48 hours before polls close.`,
      tags: ['address', 'residency', 'district', 'update']
    },
    {
      id: 'navigate-ballot',
      category: 'Voting Process',
      title: 'Navigating the digital ballot',
      content: `The e-vote digital ballot is designed for clarity and security.
      - Browse candidates by clicking on their profile cards to read platforms, statements, and endorsements.
      - Select a candidate to add them to your active ballot.
      - You can review and edit your selections at any time before final submission.
      - The progression tracker at the top of the screen shows your current step (Selection, Review, Cast).`,
      tags: ['ballot', 'navigation', 'selection', 'vote']
    },
    {
      id: 'correct-mistake',
      category: 'Voting Process',
      title: 'Correcting a mistake before submission',
      content: `You can change your candidate selections as many times as you like prior to final cast:
      1. From the Ballot or Review screen, click "Edit Selections" or the "Edit" pencil icon.
      2. Deselect the candidate and tap the checkbox for your preferred choice.
      3. Click "Save & Review" to see your updated summary.
      
      WARNING: Once you click "Submit Official Ballot" and confirm with your security PIN/biometrics, your ballot is encrypted and committed to the ledger. It cannot be altered under any circumstances.`,
      tags: ['mistake', 'change', 'edit', 'reset']
    },
    {
      id: 'write-in',
      category: 'Voting Process',
      title: 'Understanding write-in options',
      content: `If you wish to vote for a candidate not listed on the official ballot:
      1. Scroll to the bottom of the candidate list for the specific office.
      2. Select "Write-In Candidate".
      3. Type the candidate's legal name in the text field.
      4. Click "Confirm Write-In" to save the selection.
      
      Write-in votes are manually reviewed by local bi-partisan election boards during the final audit phase to verify candidate eligibility.`,
      tags: ['write-in', 'candidate', 'write', 'manual']
    },
    {
      id: 'login-errors',
      category: 'Technical Support',
      title: 'Login Errors & 2FA Troubleshooting',
      content: `If you are experiencing issues signing in:
      - Double-check that your Voter ID matches the format on your voter registration card.
      - If your 2FA token generator code is not accepted, synchronize your authenticator app's internal time clock in its settings menu.
      - Password resets require access to the email address or phone number registered during your digital ID validation.
      
      For immediate locked-out recovery, click the "Reset PIN" button on the login screen or start a Live Chat with our automated identity team.`,
      tags: ['login', '2fa', 'authenticator', 'reset', 'password', 'lock']
    },
    {
      id: 'app-compat',
      category: 'Technical Support',
      title: 'App Compatibility & requirements',
      content: `e-vote utilizes modern WebAssembly and cryptographic primitives. To ensure compatibility:
      - Chrome version 100+
      - Safari version 15.4+
      - Firefox version 98+
      - Edge version 100+
      
      JavaScript and WebCrypto APIs must be enabled in your browser settings. VPNs are supported but may prompt additional security verification steps if accessing from outside your home country.`,
      tags: ['compatibility', 'browser', 'safari', 'chrome', 'firefox', 'requirements']
    }
  ];

  // Filtering articles based on search query
  const filteredArticles = searchQuery.trim() === ''
    ? articles
    : articles.filter(art => 
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  const handlePopularClick = (query, e) => {
    e.preventDefault();
    setSearchQuery(query);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    const newMessages = [...chatMessages, { sender: 'user', text: userMsg }];
    setChatMessages(newMessages);
    setChatInput('');

    // Simulated responsive support chat replies
    setTimeout(() => {
      let reply = "I understand you need help with that. Could you please specify which section of e-vote you are trying to access? You can also check our FAQ guides in the category cards above.";
      
      const lowerMsg = userMsg.toLowerCase();
      if (lowerMsg.includes('verify') || lowerMsg.includes('id') || lowerMsg.includes('biometric')) {
        reply = "To verify your Digital ID, go to your profile page, click 'Verify ID', and upload your passport or license. A 3D selfie is required to complete the match.";
      } else if (lowerMsg.includes('ballot') || lowerMsg.includes('vote') || lowerMsg.includes('submit')) {
        reply = "Once you cast your ballot on e-vote, it is instantly encrypted using 4096-bit keys and committed to the ledger. This process cannot be undone.";
      } else if (lowerMsg.includes('receipt') || lowerMsg.includes('hash') || lowerMsg.includes('audit')) {
        reply = "Your cryptographic receipt contains a SHA-256 hash. You can search this hash in the public audit portal to confirm your vote was counted anonymously.";
      } else if (lowerMsg.includes('pin') || lowerMsg.includes('reset') || lowerMsg.includes('password')) {
        reply = "PIN and password resets can be requested via registered email. For biometric unlock, please use the mobile application.";
      } else if (lowerMsg.includes('error') || lowerMsg.includes('bug') || lowerMsg.includes('fail')) {
        reply = "Please clear your browser cache or try signing in using an incognito window. Make sure JavaScript and WebCrypto APIs are enabled.";
      }

      setChatMessages(prev => [...prev, { sender: 'agent', text: reply }]);
    }, 800);
  };

  const handleOpenTicket = (e) => {
    e.preventDefault();
    const ticketId = 'TK-' + Math.floor(100000 + Math.random() * 900000);
    setGeneratedTicketId(ticketId);
    setTicketSuccess(true);
    setTimeout(() => {
      setTicketSuccess(false);
      setIsTicketModalOpen(false);
      setTicketForm({ name: user || '', email: '', category: 'general', message: '' });
    }, 4000);
  };

  return (
    <DashboardLayout user={user} onNavigate={onNavigate} activeTab="help-center">
      <div className="w-full flex-grow flex flex-col min-h-screen">
        {/* Hero Search Section with beautiful blue gradient */}
        <section className="relative h-64 md:h-80 flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary-container to-secondary text-white rounded-b-3xl mx-4 md:mx-0 shadow-lg">
          <div className="absolute inset-0 bg-black/10 z-0"></div>
          <div className="relative z-10 w-full max-w-2xl px-margin-mobile text-center">
            <h1 className="font-headline-lg text-[28px] md:text-headline-lg text-white mb-md drop-shadow-md font-bold">
              How can we assist your vote?
            </h1>
            <div className="relative group max-w-xl mx-auto">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                search
              </span>
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border-none shadow-lg focus:ring-2 focus:ring-secondary text-on-surface bg-white text-body-md font-body-md placeholder-outline/80" 
                placeholder="Search for guides, security protocols, or tech help..." 
                type="text"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>
            
            <div className="mt-sm flex flex-wrap justify-center gap-base">
              <span className="text-white/80 text-label-sm font-label-sm">Popular: </span>
              <button 
                onClick={(e) => handlePopularClick('verify', e)}
                className="text-white underline font-label-sm hover:text-primary-fixed-dim transition-colors"
              >
                Digital ID Verification
              </button>
              <button 
                onClick={(e) => handlePopularClick('encrypt', e)}
                className="text-white underline font-label-sm hover:text-primary-fixed-dim transition-colors"
              >
                Encryption Proof
              </button>
              <button 
                onClick={(e) => handlePopularClick('reset pin', e)}
                className="text-white underline font-label-sm hover:text-primary-fixed-dim transition-colors"
              >
                Reset PIN
              </button>
            </div>
          </div>
        </section>

        {/* Bento FAQ Grid */}
        <section className="max-w-container-max mx-auto px-4 md:px-md py-lg w-full">
          <div className="flex flex-col md:flex-row justify-between items-end mb-md gap-base">
            <div>
              <h2 className="font-headline-md text-headline-md text-primary font-bold">Browse by Category</h2>
              <p className="text-on-surface-variant font-body-md">Comprehensive resources for every stage of the democratic process.</p>
            </div>
            <button 
              onClick={() => { setSearchQuery(''); alert('You are viewing the comprehensive e-vote documentation.'); }}
              className="flex items-center gap-xs text-primary font-label-md hover:underline font-bold"
            >
              View All Documentation <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-md">
            
            {/* Registration Card */}
            <div 
              onClick={() => setSelectedArticle(articles[0])}
              className="md:col-span-8 bg-surface-container-low border border-outline-variant p-md rounded-xl hover:shadow-md transition-all active:scale-[0.99] group cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-md">
                <div>
                  <span className="material-symbols-outlined text-primary text-4xl mb-base block transition-transform group-hover:-translate-y-1">
                    person_add
                  </span>
                  <h3 className="font-headline-md text-headline-md mb-base font-bold text-on-surface group-hover:text-primary transition-colors">
                    Registration &amp; Identity
                  </h3>
                  <ul className="space-y-sm text-on-surface-variant font-body-md">
                    {articles.filter(a => a.category === 'Registration & Identity').map((art) => (
                      <li 
                        key={art.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedArticle(art); }}
                        className="flex items-center gap-base hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                        <span>{art.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <img 
                  className="w-32 h-32 object-cover rounded-lg shadow-sm hidden lg:block" 
                  alt="Biometric Identity Scanner"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZ3sLJd-_w9KpdHNSrF1oWEcm4KywCRKa565DNSwsegsW_wBRu8EjhnNnYwyzdExmAtL27Xcc8V-H_xPQmd5suVs5wnWj5XpD232fGB_Yc1muha3Vb9DZg7ONUKylLr59MjYrwpTHs-9hoaTpT_6bzQtkmg4r8MYL6wrRIx5u-eRwk1anv67VWhQX0N-7qHHHMcAu1ewBHUt-7nd07pOrMcNscFwF15bg9Jqat8Ipc4Df8KC-z7N21XT8Ayv2ta-oE9rpuVfvCTORV"
                />
              </div>
            </div>

            {/* Security Card */}
            <div className="md:col-span-4 bg-primary text-on-primary p-md rounded-xl shadow-lg flex flex-col justify-between group hover:shadow-xl transition-all">
              <div>
                <span className="material-symbols-outlined text-4xl mb-base block transition-transform group-hover:-translate-y-1">
                  gpp_good
                </span>
                <h3 className="font-headline-md text-headline-md mb-base font-bold">Security &amp; Privacy</h3>
                <p className="font-body-md opacity-90 mb-md leading-relaxed text-sm">
                  Learn how e-vote protects your anonymity through end-to-end encryption and secure audit trails.
                </p>
              </div>
              <button 
                onClick={() => alert('e-vote Audit Protocol utilizes SHA-256 state matching and AES-4096 encryption.')}
                className="bg-white text-primary w-full py-2.5 rounded-lg font-label-md hover:bg-primary-fixed-dim transition-colors font-bold"
              >
                Audit Protocol
              </button>
            </div>

            {/* Voting Process */}
            <div className="md:col-span-4 bg-surface-container-high border border-outline-variant p-md rounded-xl hover:shadow-md transition-all group cursor-pointer">
              <span className="material-symbols-outlined text-secondary text-4xl mb-base block transition-transform group-hover:-translate-y-1">
                how_to_vote
              </span>
              <h3 className="font-headline-md text-headline-md mb-base font-bold text-on-surface">Voting Process</h3>
              <ul className="space-y-sm text-on-surface-variant font-body-md">
                {articles.filter(a => a.category === 'Voting Process').map((art) => (
                  <li 
                    key={art.id}
                    onClick={(e) => { e.stopPropagation(); setSelectedArticle(art); }}
                    className="flex items-center gap-base hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                    <span>{art.title}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technical Issues */}
            <div className="md:col-span-8 bg-surface-container-lowest border border-outline-variant p-md rounded-xl hover:shadow-md transition-all flex flex-col md:flex-row gap-md group">
              <div className="flex-1">
                <span className="material-symbols-outlined text-error text-4xl mb-base block transition-transform group-hover:-translate-y-1">
                  potted_plant
                </span>
                <h3 className="font-headline-md text-headline-md mb-base font-bold text-on-surface">Technical Support</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                  <div 
                    onClick={() => setSelectedArticle(articles[6])}
                    className="p-sm bg-surface rounded-lg border border-outline-variant hover:border-primary transition-colors cursor-pointer"
                  >
                    <p className="font-label-md text-primary mb-xs">Login Errors</p>
                    <p className="text-label-sm text-on-surface-variant leading-relaxed">Step-by-step troubleshooting for 2FA and password resets.</p>
                  </div>
                  <div 
                    onClick={() => setSelectedArticle(articles[7])}
                    className="p-sm bg-surface rounded-lg border border-outline-variant hover:border-primary transition-colors cursor-pointer"
                  >
                    <p className="font-label-md text-primary mb-xs">App Compatibility</p>
                    <p className="text-label-sm text-on-surface-variant leading-relaxed">Browser and OS requirements for secure voting.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Dynamic Search Results Section (Shown only if query active) */}
        {searchQuery.trim() !== '' && (
          <section className="bg-surface-container-low border-y border-outline-variant py-lg">
            <div className="max-w-container-max mx-auto px-4 md:px-md">
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold mb-md">
                Search Results ({filteredArticles.length})
              </h2>
              {filteredArticles.length === 0 ? (
                <div className="text-center py-lg bg-white rounded-xl border border-outline-variant">
                  <span className="material-symbols-outlined text-outline text-[48px] mb-base">search_off</span>
                  <p className="text-on-surface-variant font-body-md">No articles found matching "{searchQuery}".</p>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="mt-sm text-primary font-bold hover:underline"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  {filteredArticles.map((art) => (
                    <div 
                      key={art.id}
                      onClick={() => setSelectedArticle(art)}
                      className="bg-white border border-outline-variant rounded-xl p-md hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <span className="bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
                        {art.category}
                      </span>
                      <h4 className="font-headline-md text-[18px] text-on-surface font-bold mt-sm mb-xs hover:text-primary">
                        {art.title}
                      </h4>
                      <p className="text-on-surface-variant text-sm line-clamp-2 leading-relaxed">
                        {art.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Voter Guide Section */}
        <section className="bg-surface-container-highest/30 py-lg border-y border-outline-variant w-full">
          <div className="max-w-container-max mx-auto px-4 md:px-md">
            <div className="text-center mb-lg">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-base font-bold">The Voter Guide</h2>
              <p className="max-w-xl mx-auto text-on-surface-variant font-body-md">
                New to digital voting? Our step-by-step visual guides ensure your voice is heard securely and accurately.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
              
              {/* Step Card 1 */}
              <div className="flex flex-col gap-base">
                <div 
                  onClick={() => setSelectedArticle(articles[0])}
                  className="relative group rounded-xl overflow-hidden aspect-video shadow-md cursor-pointer"
                >
                  <img 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                    alt="Verifying Your Identity"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqgIFOfaZdSHvKCOJez1c8HipOsLD1BcYVH60CWTCD6UB6YXisjfWkWFTlQ9p_6eCdeeVFy1jZitL9IrZGaUuwZqpYZGtBwOSjzSKlc4yNB46aMwRPKu1hrThzQW3DSFuFHMcFPUBZ7RSGvLaw5Qa4KlulyR_K-ezIJiVm1i2b6p9bik0DIvqUV5C0EjNhNaEZsPDufIpInOFAIvgjCnLrhJDR20iW9IOF-haZkY5EBg8jbk4AP17wzdsqTgt7QbpFjVTDRrJJupyZ"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white text-5xl" style={{ fontVariationSettings: '"FILL" 1' }}>
                      play_circle
                    </span>
                  </div>
                </div>
                <h4 className="font-label-md text-label-md mt-base text-on-surface font-bold">1. Verifying Your Identity</h4>
                <p className="text-label-sm text-on-surface-variant leading-relaxed">
                  Learn the biometric and document-based verification steps required before your first vote.
                </p>
              </div>

              {/* Step Card 2 */}
              <div className="flex flex-col gap-base">
                <div 
                  onClick={() => setSelectedArticle(articles[3])}
                  className="relative group rounded-xl overflow-hidden aspect-video shadow-md cursor-pointer"
                >
                  <img 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                    alt="Casting Secret Ballot"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8UOWD8WLjt1_it-nYL8Zpy6HhkEkVVBrTSrvTlJajhmHV1olgmW85MDb7kTNLfIFSj9Wo061KEbe9SIi_T1mQwIEL_0vBPGD1wsJuV4WGnPDQLbeF8lozkHWqSnEOuNFhVnmKJJuoKom7yTjnaK_KjCa4AEfgP557sKH0hRAu8fRXtzE04EuImpOmBk4f1EkVQOJ-Z9cllK7EMYndOqTa-vW0MI1otmogp4OR1Og8JWpC54iXzUQ0nx0nlFJiwt42oQxAuHp97xyI"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white text-5xl" style={{ fontVariationSettings: '"FILL" 1' }}>
                      play_circle
                    </span>
                  </div>
                </div>
                <h4 className="font-label-md text-label-md mt-base text-on-surface font-bold">2. Casting Your Secret Ballot</h4>
                <p className="text-label-sm text-on-surface-variant leading-relaxed">
                  A walkthrough of the selection screen, review phase, and final encrypted submission.
                </p>
              </div>

              {/* Step Card 3 */}
              <div className="flex flex-col gap-base">
                <div 
                  onClick={() => alert('Voter Audit Receipt tutorial opens soon.')}
                  className="relative group rounded-xl overflow-hidden aspect-video shadow-md cursor-pointer"
                >
                  <img 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                    alt="Verifying Receipt"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaaUj6ZXo1CoQVPBzufbqBt7W9S-_4T-vbed4Iq6fJnTLLML3Mf73RSFbaP06oCn26_jkpC-UUwI9zcFD4fRS1idyXO9YYdrpJqQ9CrIBO9VyA_UN-Hy_ESj9AKM5jMX9hG6WY-KdB3VrtacLTLx5n5XHexENN3j-7Md4GIGuE_f_vjiRZp560XFAd4PpAP4uwP_PBjbnqSRrd6c_r4SNFFdewCa_jjIaWwF5XMEnOSuDktBKU0WJFSAnWS1uYPB7l97Sp0oiuIdCw"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white text-5xl" style={{ fontVariationSettings: '"FILL" 1' }}>
                      play_circle
                    </span>
                  </div>
                </div>
                <h4 className="font-label-md text-label-md mt-base text-on-surface font-bold">3. Verifying the Audit Receipt</h4>
                <p className="text-label-sm text-on-surface-variant leading-relaxed">
                  How to use your unique receipt ID to confirm your vote was counted without revealing your choice.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Support Options Section */}
        <section className="max-w-container-max mx-auto px-4 md:px-md py-lg w-full">
          <div className="bg-surface-container rounded-3xl p-md md:p-lg flex flex-col lg:flex-row items-center gap-md lg:gap-xl">
            <div className="flex-1">
              <h2 className="font-headline-lg text-headline-lg text-primary mb-base font-bold">Still need assistance?</h2>
              <p className="font-body-md text-on-surface-variant mb-lg">
                Our support team is available 24/7 during active election cycles to ensure every voter has access.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
                <button 
                  onClick={() => setIsChatOpen(true)}
                  className="flex flex-col items-center gap-base p-md bg-surface-container-lowest rounded-xl hover:shadow-lg transition-all group"
                >
                  <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">
                    forum
                  </span>
                  <span className="font-label-md text-on-surface font-bold">Live Chat</span>
                  <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">Online Now</span>
                </button>
                
                <button 
                  onClick={() => setIsTicketModalOpen(true)}
                  className="flex flex-col items-center gap-base p-md bg-surface-container-lowest rounded-xl hover:shadow-lg transition-all group"
                >
                  <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">
                    mail
                  </span>
                  <span className="font-label-md text-on-surface font-bold">Email Support</span>
                </button>
                
                <button 
                  onClick={() => setIsTicketModalOpen(true)}
                  className="flex flex-col items-center gap-base p-md bg-surface-container-lowest rounded-xl hover:shadow-lg transition-all group"
                >
                  <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">
                    confirmation_number
                  </span>
                  <span className="font-label-md text-on-surface font-bold">Open Ticket</span>
                </button>
              </div>
            </div>
            
            <div className="lg:w-1/3 w-full">
              <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-label-md text-label-md mb-md text-on-surface font-bold">System Health Status</h4>
                <div className="space-y-base">
                  <div className="flex justify-between items-center">
                    <span className="text-label-sm text-on-surface-variant font-medium">Ballot Infrastructure</span>
                    <span className="w-2.5 h-2.5 bg-secondary rounded-full animate-pulse"></span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-label-sm text-on-surface-variant font-medium">Identity Gateway</span>
                    <span className="w-2.5 h-2.5 bg-secondary rounded-full animate-pulse"></span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-label-sm text-on-surface-variant font-medium">Public Audit API</span>
                    <span className="w-2.5 h-2.5 bg-secondary rounded-full animate-pulse"></span>
                  </div>
                </div>
                <div className="mt-md pt-base border-t border-outline-variant">
                  <p className="text-label-sm text-center text-secondary font-bold">All Systems Operational</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Modal - FAQ Article Detail */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-outline-variant shadow-2xl overflow-hidden animate-scale-up">
            <div className="bg-primary text-on-primary p-md flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">{selectedArticle.category}</span>
                <h3 className="font-headline-md text-[20px] font-bold">{selectedArticle.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedArticle(null)}
                className="text-white hover:opacity-80 transition-opacity p-1"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>
            
            <div className="p-md text-on-surface-variant font-body-md leading-relaxed whitespace-pre-line max-h-[400px] overflow-y-auto scrolling-content">
              {selectedArticle.content}
            </div>
            
            <div className="p-md bg-surface-container-low border-t border-outline-variant flex justify-end gap-sm">
              <button 
                onClick={() => alert('Article marked as helpful. Thank you for your feedback!')}
                className="px-4 py-2 border border-outline text-on-surface-variant rounded-lg font-label-md hover:bg-surface-container active:scale-95 transition-all text-xs font-semibold"
              >
                Helpful
              </button>
              <button 
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary-container active:scale-95 transition-all text-xs font-semibold"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Chat Box Simulation */}
      {isChatOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-[100] w-[320px] md:w-[360px] bg-white rounded-2xl border border-outline-variant shadow-2xl flex flex-col overflow-hidden animate-scale-up">
          <div className="bg-primary text-on-primary p-sm flex justify-between items-center">
            <div className="flex items-center gap-xs">
              <span className="w-2.5 h-2.5 bg-secondary rounded-full animate-ping"></span>
              <span className="font-label-md font-bold">e-vote Live Support</span>
            </div>
            <button 
              onClick={() => setIsChatOpen(false)}
              className="text-white hover:opacity-80 transition-opacity"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
          
          <div className="flex-grow h-[260px] md:h-[300px] overflow-y-auto p-sm space-y-sm bg-surface-container-lowest scrolling-content">
            {chatMessages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'items-start'}`}
              >
                <div 
                  className={`p-base rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-surface-container-high text-on-surface rounded-tl-none border border-outline-variant/50'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-base border-t border-outline-variant flex gap-xs bg-white">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a support question..."
              className="flex-grow border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-primary text-on-surface"
            />
            <button 
              type="submit"
              className="bg-primary text-on-primary rounded-lg px-3 py-1.5 flex items-center justify-center hover:bg-primary-container active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-xs">send</span>
            </button>
          </form>
        </div>
      )}

      {/* Modal - Open Support Ticket Form */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md border border-outline-variant shadow-2xl overflow-hidden animate-scale-up">
            <div className="bg-primary text-on-primary p-md flex justify-between items-center">
              <h3 className="font-headline-md text-[20px] font-bold">Open Support Ticket</h3>
              <button 
                onClick={() => setIsTicketModalOpen(false)}
                className="text-white hover:opacity-85"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>
            
            <div className="p-md">
              {ticketSuccess ? (
                <div className="text-center py-md space-y-sm">
                  <span className="material-symbols-outlined text-secondary text-5xl animate-bounce">check_circle</span>
                  <h4 className="font-headline-md text-headline-md text-on-surface font-bold">Ticket Submitted!</h4>
                  <p className="text-on-surface-variant font-mono text-sm font-bold">Reference: {generatedTicketId}</p>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Our technical desk will reach out to your registered email address within 15 minutes.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleOpenTicket} className="space-y-sm">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Your Name</label>
                    <input 
                      type="text" 
                      required
                      value={ticketForm.name}
                      onChange={(e) => setTicketForm({...ticketForm, name: e.target.value})}
                      className="w-full border border-outline-variant rounded-lg p-2 text-sm text-on-surface"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="e.g. voter@example.com"
                      value={ticketForm.email}
                      onChange={(e) => setTicketForm({...ticketForm, email: e.target.value})}
                      className="w-full border border-outline-variant rounded-lg p-2 text-sm text-on-surface"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Category</label>
                    <select 
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                      className="w-full border border-outline-variant rounded-lg p-2 text-sm text-on-surface"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="identity">Digital ID Verification</option>
                      <option value="ballot">Ballot Navigation & Cast</option>
                      <option value="technical">Technical Lockout / Error</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">Detailed Description</label>
                    <textarea 
                      required
                      rows="3"
                      placeholder="Describe the issue you are experiencing..."
                      value={ticketForm.message}
                      onChange={(e) => setTicketForm({...ticketForm, message: e.target.value})}
                      className="w-full border border-outline-variant rounded-lg p-2 text-sm text-on-surface"
                    />
                  </div>
                  
                  <div className="pt-2 flex justify-end gap-sm">
                    <button 
                      type="button"
                      onClick={() => setIsTicketModalOpen(false)}
                      className="px-4 py-2 border border-outline text-on-surface-variant rounded-lg font-bold text-xs"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-xs hover:bg-primary-container"
                    >
                      Submit Ticket
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default HelpCenter;
