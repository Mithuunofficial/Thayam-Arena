import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { AuthInput } from './AuthInput';
import type { AuthInputProps } from './AuthInput';

interface PasswordFieldProps extends Omit<AuthInputProps, 'iconType' | 'type'> {
  value: string;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  value,
  error,
  success,
  onChange,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0); // 0 to 4
  const [strengthLabel, setStrengthLabel] = useState('');

  // Calculate password strength
  useEffect(() => {
    if (!value) {
      setStrength(0);
      setStrengthLabel('');
      return;
    }

    let score = 0;
    
    // 1. Min 8 characters
    if (value.length >= 8) score += 1;
    // 2. Contains numbers
    if (/\d/.test(value)) score += 1;
    // 3. Contains mixed case letters (upper & lower)
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
    // 4. Contains special characters
    if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) score += 1;

    setStrength(score);

    // Setup visual labeling
    if (value.length < 8) {
      setStrengthLabel('too short (min 8 chars)');
    } else {
      switch (score) {
        case 1:
        case 2:
          setStrengthLabel('weak');
          break;
        case 3:
          setStrengthLabel('fairly secure');
          break;
        case 4:
          setStrengthLabel('legendary strength');
          break;
        default:
          setStrengthLabel('');
      }
    }
  }, [value]);

  const toggleVisibility = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  // Determine strength meter colors
  const getStrengthColor = () => {
    if (value.length < 8) return 'bg-red-500';
    switch (strength) {
      case 1:
      case 2:
        return 'bg-amber-500'; // Weak/Fair
      case 3:
        return 'bg-[#00C2FF]'; // Good
      case 4:
        return 'bg-[#10B981]'; // Strong
      default:
        return 'bg-white/10';
    }
  };

  return (
    <div className="flex flex-col space-y-2 w-full text-left font-sans">
      {/* Container holding input and hide/show overlay */}
      <div className="relative">
        <AuthInput
          label={label}
          iconType="lock"
          type={showPassword ? 'text' : 'password'}
          value={value}
          error={error}
          success={success && strength >= 3}
          onChange={onChange}
          {...props}
        />
        
        {/* Toggle Button */}
        {value && (
          <button
            type="button"
            onClick={toggleVisibility}
            className="absolute right-3.5 top-[29px] p-1 text-white/30 hover:text-white/60 hover:bg-white/5 rounded-md transition-colors"
            title={showPassword ? "Hide passcode" : "Reveal passcode"}
            aria-label={showPassword ? "Hide passcode" : "Reveal passcode"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Password Strength Meter Segment */}
      {value && (
        <motion.div 
          className="flex flex-col space-y-1 pt-0.5"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-wider text-white/40">
            <span>Passcode Safety</span>
            <span className={
              value.length < 8 ? 'text-red-400' :
              strength === 3 ? 'text-[#00C2FF]' :
              strength === 4 ? 'text-green-400' : 'text-amber-400'
            }>
              {strengthLabel}
            </span>
          </div>

          {/* 4 Segmented color blocks */}
          <div className="grid grid-cols-4 gap-1 w-full h-1">
            {Array.from({ length: 4 }).map((_, idx) => {
              const active = idx < (value.length < 8 ? 1 : strength);
              return (
                <div
                  key={idx}
                  className={`h-full rounded-full transition-all duration-300 ${
                    active ? getStrengthColor() : 'bg-white/5 border border-white/5'
                  }`}
                />
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};
