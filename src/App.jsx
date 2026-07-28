import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { isAuthenticated, logout } from './utils/auth';
import { requestNotificationPermission, setupForegroundMessageListener } from './utils/notifications';

// Pages
import PasscodeLock from './pages/PasscodeLock';
import Timeline from './pages/Timeline';
import Settings from './pages/Settings';
import AddMemory from './pages/AddMemory';
import MemoryDetail from './pages/MemoryDetail';
import AllMemories from './pages/AllMemories';
import Activity from './pages/Activity';
import ManageThoughts from './pages/ManageThoughts';
import Timer from './pages/Timer';
import HitRoshanHari from './pages/HitRoshanHari';
import Challenges from './pages/Challenges';
import ChallengeDetail from './pages/ChallengeDetail';
import AddMealLog from './pages/AddMealLog';
import AllMealLogs from './pages/AllMealLogs';
import LogDetail from './pages/LogDetail';

function ProtectedRoute({ children }) {
  const [authenticated, setAuthenticated] = useState(null);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
  }, []);

  if (authenticated === null) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return authenticated ? children : <Navigate to="/lock" replace />;
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLocked, setIsLocked] = useState(!isAuthenticated());

  // Re-run whenever the app is unlocked (isLocked goes false)
  // This ensures the FCM token is refreshed after every passcode entry,
  // even when switching between accounts.
  useEffect(() => {
    if (!isLocked && isAuthenticated()) {
      setupForegroundMessageListener();
      const timer = setTimeout(() => {
        requestNotificationPermission();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isLocked]);

  useEffect(() => {
    // Keep isLocked state in sync with authentication status
    const checkAuth = () => {
      if (!isAuthenticated()) {
        setIsLocked(true);
      }
    };
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Auto-lock when app goes to background
    const handleVisibilityChange = () => {
      // When page becomes hidden (app goes to background)
      if (document.hidden) {
        // Mark the time when app was backgrounded
        localStorage.setItem('justus_backgrounded_at', Date.now().toString());
      } else {
        // When page becomes visible again (app comes to foreground)
        const backgroundedAt = localStorage.getItem('justus_backgrounded_at');
        const timeSinceBackground = Date.now() - parseInt(backgroundedAt || '0');

        // Don't lock if returning quickly (within 3 seconds) - likely from camera/file picker
        // This prevents the annoying re-lock when taking photos or selecting files
        if (backgroundedAt && isAuthenticated() && location.pathname !== '/lock' && timeSinceBackground > 3000) {
          // Lock the app immediately, setting isLocked to true and calling logout
          logout();
          setIsLocked(true);
          localStorage.removeItem('justus_backgrounded_at');
        } else if (timeSinceBackground <= 3000) {
          // Clear the background time without locking
          localStorage.removeItem('justus_backgrounded_at');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [location.pathname]);

  return (
    <>
      <Routes>
        <Route path="/lock" element={<PasscodeLock onSuccess={() => { setIsLocked(false); navigate('/'); }} />} />
        <Route path="/timer" element={<Timer />} />
        <Route path="/hit-roshan-hari" element={<HitRoshanHari />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Timeline />
            </ProtectedRoute>
          }
        />
        <Route
          path="/memories"
          element={
            <ProtectedRoute>
              <AllMemories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add"
          element={
            <ProtectedRoute>
              <AddMemory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/memory/:id"
          element={
            <ProtectedRoute>
              <MemoryDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activity"
          element={
            <ProtectedRoute>
              <Activity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-thoughts"
          element={
            <ProtectedRoute>
              <ManageThoughts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/challenges"
          element={
            <ProtectedRoute>
              <Challenges />
            </ProtectedRoute>
          }
        />
        <Route
          path="/challenge/:id"
          element={
            <ProtectedRoute>
              <ChallengeDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/challenge/:id/log"
          element={
            <ProtectedRoute>
              <AddMealLog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/challenge/:id/log/:logId"
          element={
            <ProtectedRoute>
              <AddMealLog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/challenge/:id/logs"
          element={
            <ProtectedRoute>
              <AllMealLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/challenge/:id/log-detail/:logId"
          element={
            <ProtectedRoute>
              <LogDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute>
              <AddMemory />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global screen overlay lock */}
      {isLocked && location.pathname !== '/lock' && (
        <div className="global-lock-overlay">
          <PasscodeLock onSuccess={() => setIsLocked(false)} />
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
