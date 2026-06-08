import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Check, AlertCircle } from 'lucide-react';

export interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  iconType: 'username' | 'mail' | 'lock';
  error?: string | null;
  success?: boolean;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  iconType,
  error,
  success,
  className = '',
  id,
  ...props
}) => {
  // Select matching Lucide icon
  const getIcon = () => {
    switch (iconType) {
      case 'username':
        return <User className="w-4 h-4" />;
      case 'mail':
        return <Mail className="w-4 h-4" />;
      case 'lock':
        return <Lock className="w-4 h-4" />;
    }
  };

  // Define input ID dynamically if not provided
  const inputId = id || `auth-input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`flex flex-col space-y-1.5 w-full text-left font-sans ${className}`}>
      {/* Accessible Label with AAA Cyber styling */}
      <label 
        htmlFor={inputId}
        className="text-[10px] font-bold tracking-widest text-white/50 uppercase select-none flex justify-between items-center"
      >
        <span>{label}</span>
        {error && (
          <span className="text-red-500 font-mono text-[9px] lowercase tracking-normal animate-pulse">
            // {error}
          </span>
        )}
        {success && !error && (
          <span className="text-green-400 font-mono text-[9px] uppercase tracking-normal">
            ✓ secure
          </span>
        )}
      </label>

      {/* Field wrapper containing input and icons */}
      <motion.div
        className="relative flex items-center"
        animate={error ? { x: [-6, 6, -6, 6, 0] } : {}}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {/* Left Input Icon */}
        <div className={`absolute left-3.5 z-10 transition-colors duration-300 ${
          error ? 'text-red-500' : success ? 'text-green-400' : 'text-white/30 group-focus-within:text-[#F5B041]'
        }`}>
          {getIcon()}
        </div>

        {/* The HTML5 Input tag */}
        <input
          id={inputId}
          aria-invalid={!!error}
          className={`w-full bg-white/[0.04] text-stone-200 text-xs font-semibold rounded-xl pl-11 pr-10 py-3 border-2 transition-all duration-300 outline-none placeholder:text-white/20 hover:bg-white/[0.06] ${
            error 
              ? 'border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.25)] bg-red-950/5 text-red-200' 
              : success
                ? 'border-green-500/70 shadow-[0_0_12px_rgba(16,185,129,0.25)] bg-green-950/5 focus:border-green-400'
                : 'border-white/10 focus:border-[#F5B041] focus:bg-white/[0.07] focus:shadow-[0_0_12px_rgba(245,176,65,0.2)]'
          }`}
          {...props}
        />

        {/* Right Status Indicators */}
        <div className="absolute right-3.5 flex items-center pointer-events-none">
          {error && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-red-500"
            >
              <AlertCircle className="w-4 h-4" />
            </motion.div>
          )}
          {success && !error && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-green-400"
            >
              <Check className="w-4 h-4" />
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
