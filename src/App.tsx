import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './supabase/AuthContext';
import { RouterProvider, Route, ProtectedRoute, PublicOnlyRoute, useRouter } from './components/Router';
import { AuthPage } from './components/auth/AuthPage';
import { LandingPage } from './components/LandingPage';
import { Lobby } from './components/Lobby';
import { GameClient } from './components/GameClient';
import type { Language } from './utils/i18n';

const DashboardRedirect = () => {
  const { navigate } = useRouter();

  useEffect(() => {
    navigate('/', true);
  }, [navigate]);

  return null;
};

function ThayamApp() {
  const { pathname, navigate } = useRouter();
  const { user } = useAuth();
  const [lang, setLang] = useState<Language>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [matchConfig, setMatchConfig] = useState<any>(null);
  const [gameActive, setGameActive] = useState(false);

  const handleLanguageToggle = () => {
    setLang((l) => (l === 'en' ? 'ta' : 'en'));
  };

  const handleThemeToggle = () => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Reset gameplay active status if user navigates away from /play
  useEffect(() => {
    if (pathname !== '/play') {
      setGameActive(false);
      setMatchConfig(null);
    }
  }, [pathname]);

  return (
    <>
      {/* Route "/" renders the public LandingPage starting page */}
      <Route 
        path="/" 
        element={
          <LandingPage 
            onPlayNow={() => {
              if (user) {
                navigate('/play');
              } else {
                navigate('/auth/signin');
              }
            }} 
            lang={lang} 
            onLanguageToggle={handleLanguageToggle} 
            theme={theme}
            onThemeToggle={handleThemeToggle}
          />
        } 
      />

      {/* Public Authentication routes */}
      <Route 
        path="/auth/signin" 
        element={
          <PublicOnlyRoute>
            <AuthPage />
          </PublicOnlyRoute>
        } 
      />
      <Route 
        path="/auth/signup" 
        element={
          <PublicOnlyRoute>
            <AuthPage />
          </PublicOnlyRoute>
        } 
      />

      {/* Redirect /dashboard to public landing page at "/" */}
      <Route path="/dashboard" element={<DashboardRedirect />} />

      {/* Matchmaking Lobby and Active Game Arena */}
      <Route 
        path="/play" 
        element={
          <ProtectedRoute>
            {!gameActive ? (
              <Lobby 
                onGameStart={(config) => {
                  setMatchConfig(config);
                  setGameActive(true);
                }}
                lang={lang}
                onLanguageToggle={handleLanguageToggle}
                theme={theme}
                onThemeToggle={handleThemeToggle}
              />
            ) : (
              matchConfig && (
                <GameClient 
                  onBackToLanding={() => navigate('/')} 
                  config={matchConfig}
                  lang={lang}
                  onLanguageToggle={handleLanguageToggle}
                  theme={theme}
                  onThemeToggle={handleThemeToggle}
                />
              )
            )}
          </ProtectedRoute>
        } 
      />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <ThayamApp />
      </RouterProvider>
    </AuthProvider>
  );
}

export default App;
