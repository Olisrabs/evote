import React, { useState } from 'react';

export default function CommissionerLogin({ onNavigate, onLoginSuccess }) {
  const [matricNo, setMatricNo] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!matricNo || !accessCode) {
      setError('Please fill in both fields.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',   // ← required so browser stores the session cookie
        body: JSON.stringify({ matricNo, accessCode }),
      });

      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error('Unable to reach the server. Please check your connection.');
      }

      if (!res.ok) {
        throw new Error(data.message || 'Failed to authenticate.');
      }

      onLoginSuccess(data.admin.fullName, 'admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <div className="inline-flex bg-primary/10 text-primary p-4 rounded-2xl mb-4 border border-primary/20">
            <span className="material-symbols-outlined text-4xl">admin_panel_settings</span>
          </div>
          <h1 className="text-3xl font-bold text-on-surface tracking-tight">Commissioner Portal</h1>
          <p className="text-outline mt-2">Secure access for electoral officials</p>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-outline/20 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}
            
            <div>
              <label className="block text-xs font-semibold text-outline mb-1.5 uppercase tracking-wide">Admin ID / Matric No</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">badge</span>
                <input
                  type="text"
                  value={matricNo}
                  onChange={(e) => setMatricNo(e.target.value)}
                  className="w-full bg-surface-container border border-outline/20 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface"
                  placeholder="Enter your admin ID"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-outline mb-1.5 uppercase tracking-wide">Access Code</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">lock</span>
                <input
                  type="password"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full bg-surface-container border border-outline/20 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface"
                  placeholder="Enter secure access code"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-primary text-on-primary py-3.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin">refresh</span>
              ) : (
                <>
                  Authenticate <span className="material-symbols-outlined text-[18px]">login</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-outline/10 pt-6">
            <button
              onClick={() => onNavigate('landing')}
              className="text-sm font-medium text-outline hover:text-primary transition-colors flex items-center justify-center gap-1 mx-auto"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span> Return to Student Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
