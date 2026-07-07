import { useState } from 'react';

const SignIn = ({ onNavigate, onLoginSuccess }) => {
  // Track which step of the flow we're on
  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'
  
  // Step 1 fields
  const [matricNo, setMatricNo] = useState('');
  const [email, setEmail] = useState('');
  
  // Step 2 field
  const [otp, setOtp] = useState('');
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // ─── Step 1: Submit matric number + email ───────────────────
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    if (!matricNo || !email) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ matricNo, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Backend will return specific messages:
        // "Student not found" — matric number not in eligible list
        // "Email does not match our records" — wrong email for that matric
        // "Your account is not active" — status != active
        setError(data.message || 'Something went wrong. Please try again.');
        return;
      }

      // OTP sent — move to step 2
      setStep('otp');
      startResendCooldown();

    } catch (err) {
      setError('Unable to reach the server. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step 2: Submit OTP ─────────────────────────────────────
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ matricNo, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Invalid or expired OTP. Please try again.');
        return;
      }

      // Verified — pass student data up to parent
      if (onLoginSuccess) {
        onLoginSuccess(data.student);
      }

    } catch (err) {
      setError('Unable to reach the server. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Resend OTP ─────────────────────────────────────────────
  // Prevents students from spamming the resend button
  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError('');

    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ matricNo, email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Could not resend OTP.');
        return;
      }
      startResendCooldown();
    } catch {
      setError('Unable to reach the server.');
    }
  };

  // ─── Go back to step 1 ──────────────────────────────────────
  const handleBack = () => {
    setStep('credentials');
    setOtp('');
    setError('');
  };

  // ─── Mask email for display ─────────────────────────────────
  // Shows "jo***@gmail.com" instead of full email for privacy
  const maskEmail = (e) => {
    const [user, domain] = e.split('@');
    return `${user.slice(0, 2)}***@${domain}`;
  };

  return (
    <div className="min-h-screen flex flex-col voter-gradient text-on-surface">
      {/* Header */}
      <header className="w-full top-0 sticky bg-surface-container-lowest shadow-sm border-b border-outline-variant z-50">
        <div className="flex justify-between items-center px-4 md:px-margin-mobile lg:px-md h-16 w-full max-w-container-max mx-auto">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 hover:opacity-85 transition-opacity"
          >
            <span className="text-headline-md font-bold text-primary">e-vote</span>
          </button>
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full">
            <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>
              verified_user
            </span>
            <span className="text-label-sm text-on-surface-variant font-medium">Secure Session</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white rounded-xl shadow-lg border border-outline-variant overflow-hidden">

            {/* ── STEP 1: Matric + Email ── */}
            {step === 'credentials' && (
              <>
                <div className="p-8 pb-6 border-b border-outline-variant bg-surface-container-lowest">
                  <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-lg flex items-center justify-center mb-4 border border-outline-variant/50 shadow-sm">
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>how_to_reg</span>
                  </div>
                  <h1 className="text-headline-md font-bold text-on-surface mb-2">University Voter Portal</h1>
                  <p className="text-body-md text-on-surface-variant">
                    Enter your matric number and your institution registered email (the email used to register for admission) to receive a verification code.
                  </p>
                </div>

                <form onSubmit={handleCredentialsSubmit} className="p-8 pt-6">
                  <div className="space-y-6">

                    {/* Error message */}
                    {error && (
                      <div className="flex items-start gap-2 p-3 bg-error-container rounded-lg">
                        <span className="material-symbols-outlined text-error text-sm mt-0.5">error</span>
                        <span className="text-body-sm text-on-error-container">{error}</span>
                      </div>
                    )}

                    {/* Matric Number */}
                    <div>
                      <label htmlFor="matricNo" className="block text-label-md font-bold text-on-surface mb-2">
                        Matric Number
                      </label>
                      <div className="relative flex items-center rounded-lg border border-outline transition-all duration-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                        <span className="material-symbols-outlined absolute left-3 text-outline">badge</span>
                        <input
                          id="matricNo"
                          type="text"
                          placeholder="e.g. CSC/2021/001"
                          required
                          value={matricNo}
                          onChange={(e) => setMatricNo(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-transparent border-none focus:outline-none focus:ring-0 text-body-md rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-label-md font-bold text-on-surface mb-2">
                        Institution Registered Email
                      </label>
                      <div className="relative flex items-center rounded-lg border border-outline transition-all duration-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                        <span className="material-symbols-outlined absolute left-3 text-outline">mail</span>
                        <input
                          id="email"
                          type="email"
                          placeholder="Enter your institution registered email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-transparent border-none focus:outline-none focus:ring-0 text-body-md rounded-lg"
                        />
                      </div>
                      <p className="text-label-sm text-on-surface-variant mt-1">
                        This must match the email you used to register for admission.
                      </p>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-primary text-on-primary font-semibold text-label-md rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Verifying...' : 'Send Verification Code'}
                      {!isLoading && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* ── STEP 2: OTP Verification ── */}
            {step === 'otp' && (
              <>
                <div className="p-8 pb-6 border-b border-outline-variant bg-surface-container-lowest">
                  <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-lg flex items-center justify-center mb-4 border border-outline-variant/50 shadow-sm">
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>mark_email_read</span>
                  </div>
                  <h1 className="text-headline-md font-bold text-on-surface mb-2">Check Your Email</h1>
                  <p className="text-body-md text-on-surface-variant">
                    We sent a 6-digit verification code to{' '}
                    <span className="font-semibold text-on-surface">{maskEmail(email)}</span>.
                    It expires in 10 minutes.
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit} className="p-8 pt-6">
                  <div className="space-y-6">

                    {/* Error message */}
                    {error && (
                      <div className="flex items-start gap-2 p-3 bg-error-container rounded-lg">
                        <span className="material-symbols-outlined text-error text-sm mt-0.5">error</span>
                        <span className="text-body-sm text-on-error-container">{error}</span>
                      </div>
                    )}

                    {/* OTP Input */}
                    <div>
                      <label htmlFor="otp" className="block text-label-md font-bold text-on-surface mb-2">
                        Verification Code
                      </label>
                      <div className="relative flex items-center rounded-lg border border-outline transition-all duration-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                        <span className="material-symbols-outlined absolute left-3 text-outline">pin</span>
                        <input
                          id="otp"
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="Enter 6-digit code"
                          required
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          className="w-full pl-10 pr-4 py-3 bg-transparent border-none focus:outline-none focus:ring-0 text-body-md rounded-lg tracking-widest"
                        />
                      </div>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isLoading || otp.length !== 6}
                      className="w-full h-12 bg-primary text-on-primary font-semibold text-label-md rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                      {!isLoading && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
                    </button>

                    {/* Resend + Back */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="text-label-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Change details
                      </button>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resendCooldown > 0}
                        className="text-label-sm text-primary hover:underline disabled:text-on-surface-variant disabled:no-underline disabled:cursor-not-allowed transition-colors"
                      >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Footer badges */}
          <div className="mt-6 flex items-center justify-center gap-4 text-on-surface-variant opacity-70">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>gpp_good</span>
              <span className="text-[11px] font-bold tracking-wider uppercase">End-to-End Encrypted</span>
            </div>
            <div className="h-1 w-1 bg-outline rounded-full"></div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">public</span>
              <span className="text-[11px] font-bold tracking-wider uppercase">Public Audit Ready</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-base mt-auto bg-surface-dim border-t border-outline-variant">
        <div className="max-w-container-max mx-auto px-4 md:px-md flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 h-12">
          <span className="text-label-sm text-on-surface-variant">© 2024 e-vote. Secure Digital University Infrastructure.</span>
          <div className="flex gap-4">
            <a className="text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Security Protocol</a>
            <a className="text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SignIn;