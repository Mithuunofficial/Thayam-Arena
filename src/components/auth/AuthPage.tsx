import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../supabase/AuthContext';
import { useRouter } from '../Router';
import { AuthBackground } from './AuthBackground';
import { AuthCinematicBoard } from './AuthCinematicBoard';
import { AuthInput } from './AuthInput';
import { PasswordField } from './PasswordField';
import { AuthLoadingOverlay } from './AuthLoadingOverlay';

export const AuthPage: React.FC = () => {
  const { signUp, signIn, error, clearError } = useAuth();
  const { pathname, navigate } = useRouter();

  const handlePlayAsGuest = () => {
    // 1. Force local mock mode
    localStorage.setItem('thayam_force_local_mode', 'true');

    // 2. Setup guest session details
    const sessionUser = {
      uid: 'guest-' + Math.random().toString(36).substring(2, 11),
      email: 'guest@thayam.local',
      displayName: 'Guest Warrior',
      coins: 1000,
      rank: 'Bronze V',
      xp: 0
    };
    localStorage.setItem('thayam_current_user', JSON.stringify(sessionUser));
    localStorage.setItem('thayam_player_name', 'Guest Warrior');

    // 3. Force navigate and reload
    window.location.href = '/play';
  };

  // Mode state based on current URL path
  const isSignUpView = pathname === '/auth/signup';

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  
  // Validation tracking states
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [shakeFields, setShakeFields] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  // Clear errors when switching tabs
  useEffect(() => {
    setFormErrors({});
    clearError();
  }, [pathname, clearError]);

  // Real-time validations
  const validateEmail = (val: string) => {
    if (!val) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) return 'Invalid email formatting';
    return '';
  };

  const validatePassword = (val: string) => {
    if (!val) return 'Password is required';
    if (val.length < 8) return 'Passcode must be at least 8 characters';
    return '';
  };

  const validateUsername = (val: string) => {
    if (!val) return 'Warrior name is required';
    if (val.length < 3) return 'Name must be at least 3 characters';
    if (val.length > 15) return 'Name must not exceed 15 characters';
    if (!/^[a-zA-Z0-9_\s]+$/.test(val)) return 'Name contains invalid characters';
    return '';
  };

  // Submit hander
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFormErrors({});

    const errors: Record<string, string> = {};

    if (isSignUpView) {
      const uErr = validateUsername(username);
      if (uErr) errors.username = uErr;
    }

    const eErr = validateEmail(email);
    if (eErr) errors.email = eErr;

    const pErr = validatePassword(password);
    if (pErr) errors.password = pErr;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setShakeFields(true);
      setTimeout(() => setShakeFields(false), 500);
      return;
    }

    setAuthLoading(true);
    try {
      if (isSignUpView) {
        const res = await signUp(email, password, username);
        if (res && res.confirmationRequired) {
          setAuthLoading(false);
          setVerificationSent(true);
          return;
        }
      } else {
        await signIn(email, password);
      }
      setAuthSuccess(true);
      // Let success check animation linger for a second
      setTimeout(() => {
        setAuthLoading(false);
        navigate('/play');
      }, 1000);
    } catch (err) {
      setAuthLoading(false);
      setShakeFields(true);
      setTimeout(() => setShakeFields(false), 500);
    }
  };

  return (
    <div className="min-h-screen w-full text-white flex items-center justify-center font-sans overflow-y-auto relative select-none bg-[#0B0F1A]">
      
      {/* 1. Animated Cyber Environment Background */}
      <AuthBackground />

      {/* Auth Loading screen triggers on request submit */}
      {authLoading && (
        <AuthLoadingOverlay 
          status={
            authSuccess 
              ? "Access Granted!" 
              : isSignUpView 
                ? "Recruiting Warrior..." 
                : "Checking Credentials..."
          } 
        />
      )}

      {/* 2. Primary layout grid container */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-screen lg:min-h-[680px] z-10 p-4 sm:p-8 relative">
        
        {/* LEFT SIDE: Cinematic board preview (Hidden on mobile/tablet) */}
        <div className="hidden lg:col-span-7 lg:flex flex-col items-center justify-center border-r border-white/5 pr-4 relative">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-full h-full flex flex-col items-center justify-center"
          >
            {/* Holographic Arena Board */}
            <AuthCinematicBoard />
            
            {/* Gameplay lore label */}
            <div className="text-center max-w-md mt-4 space-y-2 relative z-20">
              <span className="font-orbitron text-[10px] tracking-[0.25em] text-[#00C2FF] font-bold block uppercase">
                Dayakattai Hologram Simulator
              </span>
              <p className="text-[11px] text-white/45 leading-relaxed">
                Experience the ancient spiral matrix gameplay where tactical cuts, blockades, and rolling 1s determine the true sovereign of the board.
              </p>
            </div>
          </motion.div>
        </div>

        {/* RIGHT SIDE: Interactive Authorization form */}
        <div className="col-span-1 lg:col-span-5 flex items-center justify-center p-2 sm:p-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={shakeFields ? { x: [-10, 10, -10, 10, -5, 5, 0] } : { opacity: 1, y: 0 }}
            transition={shakeFields ? { duration: 0.4 } : { duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="w-full max-w-[420px] bg-[#111827]/75 border border-[#F5B041]/20 rounded-2xl p-6 sm:p-8 backdrop-blur-xl relative flex flex-col items-stretch space-y-6"
            style={{
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 0 24px rgba(245, 176, 65, 0.03)',
            }}
          >
            {/* Temple-style brass lines */}
            <div className="absolute top-0 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-[#F5B041]/40 to-transparent" />
            <div className="absolute bottom-0 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-[#F5B041]/40 to-transparent" />

            {/* TOP HEADER */}
            <div className="text-center space-y-2">
              {/* Spinning Logo Symbol */}
              <div className="flex justify-center mb-1">
                <motion.div
                  className="w-14 h-14 bg-gradient-to-b from-[#FFF0C2] to-[#F5B041] rounded-full p-2 flex items-center justify-center shadow-[0_0_15px_rgba(245,176,65,0.4)]"
                  animate={{ rotateY: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <img src="/Thayam-logo.png" alt="Emblem" className="w-full h-full object-contain filter brightness-110" />
                </motion.div>
              </div>

              <h1 className="font-serif text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#FFF8E0] via-[#F5B041] to-[#C38012]">
                THAYAM
              </h1>
              <p className="font-orbitron text-[9px] tracking-[0.25em] text-[#FF6B00] font-bold block uppercase leading-none">
                Enter The Ancient Battlefield
              </p>
            </div>

            {verificationSent ? (
              <div className="text-center space-y-6 py-4">
                <div className="flex justify-center">
                  <motion.div
                    className="w-16 h-16 bg-[#00C2FF]/10 rounded-full border border-[#00C2FF]/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,194,255,0.2)]"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <svg className="w-8 h-8 text-[#00C2FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </motion.div>
                </div>
                <div className="space-y-2">
                  <h2 className="font-serif text-xl font-bold text-white tracking-wide">Verify Your Sigil</h2>
                  <p className="text-xs text-white/60 leading-relaxed">
                    A confirmation email has been dispatched to:<br />
                    <span className="text-[#00C2FF] font-mono font-bold">{email}</span>
                  </p>
                  <p className="text-[10px] text-white/40 leading-relaxed">
                    Please activate your account before proceeding to the ancient battlefield.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationSent(false);
                      navigate('/auth/signin');
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-[#FFF0C2] via-[#F5B041] to-[#FF6B00] hover:from-[#FFF6DF] hover:via-[#FFA91F] hover:to-[#E05300] text-black font-orbitron font-extrabold tracking-widest text-[10px] rounded-xl transition-all cursor-pointer shadow-md uppercase"
                  >
                    Proceed to Sign In
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* AUTH VIEW TABS */}
                <div className="grid grid-cols-2 border-b border-white/5 relative">
                  <button
                    type="button"
                    onClick={() => navigate('/auth/signin')}
                    className={`pb-2.5 text-xs font-bold tracking-widest uppercase transition-colors duration-300 relative z-10 ${
                      !isSignUpView ? 'text-white' : 'text-white/35 hover:text-white/70'
                    }`}
                  >
                    Sign In
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => navigate('/auth/signup')}
                    className={`pb-2.5 text-xs font-bold tracking-widest uppercase transition-colors duration-300 relative z-10 ${
                      isSignUpView ? 'text-white' : 'text-white/35 hover:text-white/70'
                    }`}
                  >
                    Sign Up
                  </button>

                  {/* Tab Slider Indicator */}
                  <motion.div 
                    className="absolute bottom-0 h-[2px] bg-gradient-to-r from-[#F5B041] to-[#FF6B00] shadow-[0_0_8px_#F5B041]"
                    style={{ width: '50%' }}
                    animate={{ x: isSignUpView ? '100%' : '0%' }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  />
                </div>

                {/* SUBMIT FORM */}
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  
                  {/* Recieved Server Auth Errors */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 bg-red-950/20 border border-red-500/30 rounded-xl text-center"
                    >
                      <p className="text-[10px] font-bold text-red-400 font-mono tracking-wide leading-relaxed">
                        ERROR // {error}
                      </p>
                    </motion.div>
                  )}

                  {/* INPUT FIELDS (Animated Transition) */}
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {isSignUpView && (
                        <motion.div
                          key="username-field"
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: 'auto', y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-visible"
                        >
                          <AuthInput
                            label="Warrior Name"
                            iconType="username"
                            placeholder="Enter Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            error={formErrors.username}
                            success={username.length >= 3 && !formErrors.username}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AuthInput
                      label="Email Matrix"
                      iconType="mail"
                      type="email"
                      placeholder="warrior@battlefield.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      error={formErrors.email}
                      success={email.includes('@') && !formErrors.email}
                    />

                    <PasswordField
                      label="Passcode Sigil"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      error={formErrors.password}
                      success={password.length >= 8 && !formErrors.password}
                    />
                  </div>

                  {/* ACTION CALL TO ACTION BUTTON */}
                  <div className="pt-2">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(245, 176, 65, 0.4)' }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3.5 bg-gradient-to-r from-[#FFF0C2] via-[#F5B041] to-[#FF6B00] hover:from-[#FFF6DF] hover:via-[#FFA91F] hover:to-[#E05300] text-black font-orbitron font-extrabold tracking-widest text-[11px] rounded-xl shadow-lg border border-[#FFE8A3]/30 transition-all duration-300 cursor-pointer relative overflow-hidden group uppercase"
                    >
                      {/* Subtle inner metallic glare effect */}
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                      
                      <span>
                        {isSignUpView ? "Recruit Warrior" : "Enter Battlefield"}
                      </span>
                    </motion.button>
                  </div>
                </form>

                {/* SWITCH TOGGLE BELOW */}
                <div className="text-center pt-2 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={handlePlayAsGuest}
                    className="w-full py-2.5 border border-[#F5B041]/40 hover:border-[#F5B041] hover:bg-[#F5B041]/10 text-[#F5B041] font-orbitron font-bold text-[10px] tracking-widest uppercase rounded-xl transition-all cursor-pointer shadow-md select-none"
                  >
                    Play Offline as Guest (Local Mode)
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(isSignUpView ? '/auth/signin' : '/auth/signup')}
                    className="text-[10px] font-bold tracking-widest text-white/40 hover:text-[#00C2FF] transition-colors uppercase cursor-pointer"
                  >
                    {isSignUpView ? (
                      <>Already have an account? <span className="underline">Sign In</span></>
                    ) : (
                      <>New warrior? <span className="underline">Create Account</span></>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* DECORATIVE SOVEREIGN SIGN-IN / SSO (AAA Details) */}
            <div className="pt-4 border-t border-white/5 space-y-3">
              <span className="text-[7.5px] font-bold text-white/30 tracking-widest text-center block uppercase">
                Authorized Gaming Protocols Only
              </span>
              <div className="flex justify-center space-x-4">
                {['Google', 'Discord', 'Apple'].map((sso) => (
                  <button
                    key={sso}
                    type="button"
                    onClick={() => alert(`SSO via ${sso} is simulated! Please use the form to Sign In or Create Account.`)}
                    className="px-3.5 py-1.5 bg-white/[0.03] border border-white/5 rounded-lg text-[9px] font-bold text-white/45 hover:text-white hover:border-[#F5B041]/40 hover:bg-white/[0.06] hover:shadow-[0_0_8px_rgba(245,176,65,0.1)] transition-all uppercase cursor-pointer"
                  >
                    {sso}
                  </button>
                ))}
              </div>
            </div>

          </motion.div>
        </div>

      </div>
    </div>
  );
};
