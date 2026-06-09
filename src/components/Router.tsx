import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../supabase/AuthContext';
// Guard and layout elements
import { AuthLoadingOverlay } from './auth/AuthLoadingOverlay.tsx';

interface RouterContextType {
  pathname: string;
  navigate: (to: string, replace?: boolean) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const normalize = (p: string) => {
    const trimmed = p.trim();
    if (trimmed.length > 1 && trimmed.endsWith('/')) {
      return trimmed.slice(0, -1);
    }
    return trimmed;
  };

  const [pathname, setPathname] = useState(() => normalize(window.location.pathname));

  useEffect(() => {
    const handlePopState = () => {
      setPathname(normalize(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    
    // Custom event listener for programmatically triggered routing updates
    const handleLocationChange = () => {
      setPathname(normalize(window.location.pathname));
    };
    window.addEventListener('locationchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('locationchange', handleLocationChange);
    };
  }, []);

  const navigate = (to: string, replace = false) => {
    const normalizedTo = normalize(to);
    if (replace) {
      window.history.replaceState(null, '', normalizedTo);
    } else {
      window.history.pushState(null, '', normalizedTo);
    }
    // Dispatch custom event to notify all Router instances
    window.dispatchEvent(new Event('locationchange'));
  };

  return (
    <RouterContext.Provider value={{ pathname, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

// Route component to render elements matching paths
interface RouteProps {
  path: string;
  element: React.ReactNode;
}

export const Route: React.FC<RouteProps> = ({ path, element }) => {
  const { pathname } = useRouter();
  
  if (pathname === path) {
    return <>{element}</>;
  }
  
  return null;
};

// Route Guard for authenticated-only routes (e.g. /dashboard, /play)
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const { navigate } = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth/signin', true);
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <AuthLoadingOverlay status="Verifying authorization..." />;
  }

  if (!user) {
    return null; // Will redirect shortly
  }

  return <>{children}</>;
};

// Route Guard for unauthenticated-only routes (e.g. /auth/signin, /auth/signup)
export const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const { navigate } = useRouter();

  useEffect(() => {
    if (!loading && user) {
      navigate('/play', true);
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <AuthLoadingOverlay status="Synchronizing timeline..." />;
  }

  if (user) {
    return null; // Will redirect shortly
  }

  return <>{children}</>;
};

// Custom Link component for semantic keyboard-accessible navigation
interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
}

export const Link: React.FC<LinkProps> = ({ to, children, onClick, ...props }) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onClick) onClick(e);
    navigate(to);
  };

  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  );
};
