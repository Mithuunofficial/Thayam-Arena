import React, { useEffect, useState } from 'react';
import { useRouter } from '../Router';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { navigate } = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Check for an active admin session in localStorage
    const sessionStr = localStorage.getItem('thayam_admin_session');
    
    if (!sessionStr) {
      setIsAuthorized(false);
      navigate('/admin/login', true);
      return;
    }

    try {
      const session = JSON.parse(sessionStr);
      // Validate session timestamp (e.g., sessions expire after 2 hours)
      const sessionAge = Date.now() - session.timestamp;
      const twoHours = 2 * 60 * 60 * 1000;

      if (session.token === 'thayam-admin-cyber-token' && sessionAge < twoHours) {
        setIsAuthorized(true);
      } else {
        // Session expired or invalid token
        localStorage.removeItem('thayam_admin_session');
        setIsAuthorized(false);
        navigate('/admin/login', true);
      }
    } catch {
      localStorage.removeItem('thayam_admin_session');
      setIsAuthorized(false);
      navigate('/admin/login', true);
    }
  }, [navigate]);

  if (isAuthorized === null) {
    // Cinematic glassmorphic loader while validating authorization token
    return (
      <div className="fixed inset-0 bg-[#0B0F1A] flex flex-col items-center justify-center z-50">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-t-2 border-r-2 border-cyberGold animate-spin-slow"></div>
          <div className="absolute w-12 h-12 rounded-full border-b-2 border-l-2 border-cyberBlue animate-spin"></div>
          <div className="absolute font-orbitron text-xs text-cyberGold animate-pulse">SYS</div>
        </div>
        <p className="mt-4 font-orbitron text-xs tracking-widest text-gray-500 uppercase animate-pulse">
          Decrypting Security Matrix...
        </p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect shortly in useEffect
  }

  return <>{children}</>;
};
