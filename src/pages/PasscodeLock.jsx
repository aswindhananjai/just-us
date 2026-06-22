import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyPasscode, setAuthenticated } from '../utils/auth';
import '../styles/PasscodeLock.css';

export default function PasscodeLock() {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleNumberClick = (num) => {
    if (passcode.length < 6) {
      setPasscode(passcode + num);
    }
  };

  const handleDelete = () => {
    setPasscode(passcode.slice(0, -1));
    setError('');
  };

  useEffect(() => {
    if (passcode.length === 6) {
      handlePasscodeEntry();
    }
  }, [passcode]);

  const handlePasscodeEntry = async () => {
    const userName = await verifyPasscode(passcode);

    if (userName) {
      setAuthenticated(true, userName);
      navigate('/');
    } else {
      setError('Try again.');
      setTimeout(() => {
        setPasscode('');
        setError('');
      }, 500);
    }
  };

  return (
    <div className="passcode-lock">
      <div className="passcode-content">
        <div className="logo-placeholder">
          <div className="logo-image">
            <img src="/logo.png" alt="Just Us Logo" />
          </div>
        </div>

        <p className="subtitle">Enter your passcode</p>

        <div className="passcode-dots">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`dot ${passcode.length > i ? 'filled' : ''} ${error ? 'error' : ''}`}
            />
          ))}
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="keypad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              className="key"
              onClick={() => handleNumberClick(num.toString())}
            >
              {num}
            </button>
          ))}
          <div className="key-spacer"></div>
          <button className="key" onClick={() => handleNumberClick('0')}>
            0
          </button>
          <button className="key delete-key" onClick={handleDelete}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9AA7BD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 5H8.5L3 12l5.5 7H21a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1Z"></path>
              <path d="m12 9 5 6m0-6-5 6"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
