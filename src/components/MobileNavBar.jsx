const MobileNavBar = ({ onNavigate, user }) => {
  const navItems = [
    { icon: 'home', label: 'Home', action: () => onNavigate('landing'), active: true },
    { icon: 'how_to_vote', label: 'Vote', action: () => onNavigate(user ? 'active-elections' : 'signin'), active: false },
    { icon: 'analytics', label: 'Results', action: () => onNavigate(user ? 'dashboard' : 'signin'), active: false },
    { icon: 'person', label: 'Profile', action: () => onNavigate(user ? 'dashboard' : 'signin'), active: false },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center h-16 px-2 bg-surface-container border-t border-outline-variant shadow-lg">
      {navItems.map((item) => (
        <button
          key={item.label}
          onClick={item.action}
          className={`flex flex-col items-center justify-center rounded-xl px-4 py-1 active:scale-90 transition-all ${
            item.active
              ? 'bg-primary-container text-on-primary-container font-semibold'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          <span className="text-label-sm">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default MobileNavBar;
