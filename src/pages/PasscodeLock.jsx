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

  const handlePasscodeEntry = () => {
    const userName = verifyPasscode(passcode);

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
          <div className="logo-circle">A</div>
        </div>

        <h1 className="app-name">Just us</h1>

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
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}
