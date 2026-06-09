import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from '../Router';
import { adminDb } from '../../supabase/adminDb';
import { Eye, EyeOff, ShieldAlert, Terminal, HelpCircle } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { navigate } = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if already logged in
  useEffect(() => {
    const session = localStorage.getItem('thayam_admin_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed.token === 'thayam-admin-cyber-token' && Date.now() - parsed.timestamp < 2 * 60 * 60 * 1000) {
          navigate('/admin');
        }
      } catch {
        localStorage.removeItem('thayam_admin_session');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Artificial terminal delay to feel futuristic and check security clearance
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Predefined admin credentials
    const expectedUsername = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
    const expectedPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin1234';

    if (username === expectedUsername && password === expectedPassword) {
      // Create session
      const adminSession = {
        token: 'thayam-admin-cyber-token',
        username: username,
        timestamp: Date.now()
      };
      localStorage.setItem('thayam_admin_session', JSON.stringify(adminSession));
      
      // Log successful login
      await adminDb.createSecurityLog('login_success', username, 'Console authentication succeeded.');
      await adminDb.createAdminLog('Login', null, 'Admin session initialized.');

      setLoading(false);
      navigate('/admin');
    } else {
      setError('ACCESS DENIED: Invalid administrator credentials.');
      // Log failed login
      await adminDb.createSecurityLog('login_failed', username || 'unknown', 'Console access rejected due to invalid passcode.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white font-inter flex flex-col items-center justify-center relative overflow-hidden p-4">
      {/* Cinematic Cyber Background Grid */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(245, 176, 65, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245, 176, 65, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Cyber Radial Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyberOrange/5 filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-cyberBlue/5 filter blur-[100px] pointer-events-none" />

      {/* Login Portal Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md bg-cyberPanel/80 border border-cyberGold/20 backdrop-blur-md rounded-lg overflow-hidden shadow-2xl relative"
      >
        {/* Top Accent Bar */}
        <div className="h-1 bg-gradient-to-r from-cyberGold via-cyberOrange to-cyberBlue w-full" />

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
              className="inline-flex items-center justify-center p-3 bg-cyberGold/10 rounded-full border border-cyberGold/30 text-cyberGold mb-3 glow-gold-subtle"
            >
              <Terminal size={32} />
            </motion.div>
            <h1 className="font-orbitron text-xl font-bold tracking-widest uppercase text-white">
              Control Center
            </h1>
            <p className="text-xs text-gray-400 tracking-wider font-orbitron uppercase mt-1">
              Thayam Gaming Platform Admin
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-orbitron text-gray-400 uppercase tracking-widest mb-2">
                Operator Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ENTER USERNAME"
                className="w-full px-4 py-3 bg-[#070A12] border border-gray-800 rounded text-sm text-white focus:outline-none focus:border-cyberGold focus:ring-1 focus:ring-cyberGold transition-all font-mono placeholder-gray-600"
              />
            </div>

            <div>
              <label className="block text-xs font-orbitron text-gray-400 uppercase tracking-widest mb-2">
                Access Passcode
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ENTER ACCESS PASSCODE"
                  className="w-full px-4 py-3 bg-[#070A12] border border-gray-800 rounded text-sm text-white focus:outline-none focus:border-cyberGold focus:ring-1 focus:ring-cyberGold transition-all font-mono placeholder-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-red-950/40 border border-red-500/30 rounded text-red-400 text-xs flex items-start gap-2.5 font-mono"
                >
                  <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-cyberGold hover:bg-cyberGold/90 active:bg-cyberGold/80 text-black font-orbitron font-bold text-sm tracking-widest uppercase rounded cursor-pointer transition-all flex items-center justify-center gap-2 relative overflow-hidden"
                style={{
                  clipPath: 'polygon(0 0, 95% 0, 100% 30%, 100% 100%, 5% 100%, 0 70%)'
                }}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <span>Initialize Link</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full py-2.5 border border-gray-800 hover:border-gray-700 active:bg-gray-950/40 text-gray-400 hover:text-white font-orbitron text-xs tracking-widest uppercase rounded cursor-pointer transition-all"
              >
                Abondon Control Room
              </button>
            </div>
          </form>
        </div>

        {/* Console info footer */}
        <div className="px-8 py-4 bg-[#070A12] border-t border-gray-900/50 flex items-center justify-between text-[10px] text-gray-500 font-mono">
          <span className="flex items-center gap-1">
            <Terminal size={10} /> SECURE PROTOCOL v1.8.2
          </span>
          <div className="flex items-center gap-1 tooltip relative group cursor-pointer hover:text-cyberGold transition-colors">
            <HelpCircle size={10} /> Credentials
            <span className="absolute bottom-full mb-1 right-0 w-48 bg-[#111827] text-white p-2 border border-cyberGold/20 rounded shadow-xl text-center hidden group-hover:block whitespace-normal select-none">
              Default is: <br />
              Username: <span className="text-cyberGold font-bold">admin</span> <br />
              Password: <span className="text-cyberGold font-bold">admin1234</span>
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
