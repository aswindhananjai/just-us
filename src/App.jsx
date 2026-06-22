import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { isAuthenticated } from './utils/auth';

// Pages
import PasscodeLock from './pages/PasscodeLock';
import Timeline from './pages/Timeline';
import Settings from './pages/Settings';
import AddMemory from './pages/AddMemory';
import MemoryDetail from './pages/MemoryDetail';

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/lock" element={<PasscodeLock />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Timeline />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
