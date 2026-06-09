import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './supabase/AuthContext';
import { RouterProvider, Route, ProtectedRoute, PublicOnlyRoute, useRouter } from './components/Router';
import { AuthPage } from './components/auth/AuthPage';
import { LandingPage } from './components/LandingPage';
import { Lobby } from './components/Lobby';
import { GameClient } from './components/GameClient';
import type { Language } from './utils/i18n';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminRoute } from './components/admin/AdminRoute';
import { ProfilePage } from './components/ProfilePage';


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

      {/* User Profile Page */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />

      {/* Admin Login Route */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected Admin Routes */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard currentTab="dashboard" /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminDashboard currentTab="users" /></AdminRoute>} />
      <Route path="/admin/rooms" element={<AdminRoute><AdminDashboard currentTab="rooms" /></AdminRoute>} />
      <Route path="/admin/matches" element={<AdminRoute><AdminDashboard currentTab="matches" /></AdminRoute>} />
      <Route path="/admin/analytics" element={<AdminRoute><AdminDashboard currentTab="analytics" /></AdminRoute>} />
      <Route path="/admin/tournaments" element={<AdminRoute><AdminDashboard currentTab="tournaments" /></AdminRoute>} />
      <Route path="/admin/notifications" element={<AdminRoute><AdminDashboard currentTab="notifications" /></AdminRoute>} />
      <Route path="/admin/reports" element={<AdminRoute><AdminDashboard currentTab="reports" /></AdminRoute>} />
      <Route path="/admin/settings" element={<AdminRoute><AdminDashboard currentTab="settings" /></AdminRoute>} />
      <Route path="/admin/logs" element={<AdminRoute><AdminDashboard currentTab="logs" /></AdminRoute>} />
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
