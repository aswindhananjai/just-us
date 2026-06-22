import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/BottomNav.css';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${isActive('/') ? 'active' : ''}`}
        onClick={() => navigate('/')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span>Timeline</span>
      </button>

      <button
        className={`nav-item ${isActive('/settings') ? 'active' : ''}`}
        onClick={() => navigate('/settings')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6m0 6v6m0-18a9 9 0 1 0 0 18 9 9 0 0 0 0-18z"></path>
          <path d="M16.2 7.8l-4.2 4.2m0 0L7.8 16.2M12 12l4.2 4.2M12 12L7.8 7.8"></path>
        </svg>
        <span>Settings</span>
      </button>
    </nav>
  );
}
