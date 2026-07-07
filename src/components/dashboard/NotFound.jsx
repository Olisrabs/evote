const NotFound = ({ onNavigate }) => {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full">
        <span className="material-symbols-outlined text-[100px] text-primary mb-4" style={{ fontVariationSettings: '"FILL" 1' }}>error</span>
        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-2">404 - Page Not Found</h1>
        <p className="font-body-md text-on-surface-variant mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <button 
          onClick={() => onNavigate('dashboard')}
          className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold hover:bg-primary-container transition-colors shadow-sm w-full sm:w-auto"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFound;
