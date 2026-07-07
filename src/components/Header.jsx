import { useState } from 'react';

const Header = ({ onNavigate, user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="w-full top-0 sticky z-50 bg-surface-container-lowest border-b border-outline-variant shadow-sm relative">
      <div className="flex justify-between items-center px-4 md:px-6 lg:px-md h-16 w-full max-w-container-max mx-auto">
        {/* Logo */}
        <button onClick={() => onNavigate(user ? 'dashboard' : 'landing')} className="flex items-center space-x-2 hover:opacity-85 transition-opacity">
          <span className="text-headline-md font-bold text-primary">e-vote</span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-2">
          <button onClick={() => onNavigate('landing')} className="px-3 py-2 text-primary font-bold border-b-2 border-primary text-label-md">
            Home
          </button>
          <a href="#how-it-works" className="px-3 py-2 text-on-surface-variant hover:bg-surface-container transition-colors text-label-md rounded-lg">
            How it works
          </a>
          <a href="#features" className="px-3 py-2 text-on-surface-variant hover:bg-surface-container transition-colors text-label-md rounded-lg">
            Security
          </a>
          {user && (
            <button onClick={() => onNavigate('dashboard')} className="px-3 py-2 text-on-surface-variant hover:bg-surface-container transition-colors text-label-md rounded-lg">
              Dashboard
            </button>
          )}
          <button onClick={() => onNavigate('commissioner')} className="px-3 py-2 text-error font-semibold hover:bg-error/10 transition-colors text-label-md rounded-lg flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
            Commissioner Portal
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="material-symbols-outlined p-2 text-primary active:scale-95 transition-transform">
            verified_user
          </button>
          
          <div className="hidden md:block">
            {user ? (
              <button
                onClick={() => onNavigate('dashboard')}
                className="bg-primary text-on-primary px-4 py-2 rounded-lg text-label-md shadow-sm hover:bg-on-primary-fixed-variant active:scale-95 transition-all"
              >
                Go to Dashboard
              </button>
            ) : (
              <button
                onClick={() => onNavigate('signin')}
                className="bg-primary text-on-primary px-4 py-2 rounded-lg text-label-md shadow-sm hover:bg-on-primary-fixed-variant active:scale-95 transition-all"
              >
                Sign In
              </button>
            )}
          </div>
          
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden material-symbols-outlined p-2 text-on-surface-variant active:scale-95 transition-transform"
          >
            {isMobileMenuOpen ? 'close' : 'menu'}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-surface-container-lowest border-b border-outline-variant shadow-md py-4 px-4 flex flex-col space-y-4 animate-fadeIn">
          <button onClick={() => { setIsMobileMenuOpen(false); onNavigate('landing'); }} className="text-left py-2 font-bold text-primary">
            Home
          </button>
          <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-on-surface-variant font-medium">
            How it works
          </a>
          <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-on-surface-variant font-medium">
            Security
          </a>
          {user ? (
            <button
              onClick={() => { setIsMobileMenuOpen(false); onNavigate('dashboard'); }}
              className="w-full bg-primary text-on-primary px-4 py-3 rounded-lg text-label-md shadow-sm font-bold"
            >
              Go to Dashboard
            </button>
          ) : (
            <button
              onClick={() => { setIsMobileMenuOpen(false); onNavigate('signin'); }}
              className="w-full bg-primary text-on-primary px-4 py-3 rounded-lg text-label-md shadow-sm font-bold"
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
