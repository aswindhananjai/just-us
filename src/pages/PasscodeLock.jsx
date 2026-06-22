import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import {
  hashPasscode,
  verifyPasscode,
  setAuthenticated,
  getPasscodeHash
} from '../utils/auth';
import '../styles/PasscodeLock.css';

export default function PasscodeLock() {
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('enter'); // 'enter' | 'confirm'
  const navigate = useNavigate();

  useEffect(() => {
    checkFirstTime();
  }, []);

  const checkFirstTime = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('passcode_hash')
        .single();

      if (error || !data || data.passcode_hash === 'temp') {
        setIsFirstTime(true);
      }
    } catch (err) {
      console.error('Error checking settings:', err);
      setIsFirstTime(true);
    }
  };

  const handleNumberClick = (num) => {
    if (step === 'enter' && passcode.length < 6) {
      setPasscode(passcode + num);
    } else if (step === 'confirm' && confirmPasscode.length < 6) {
      setConfirmPasscode(confirmPasscode + num);
    }
  };

  const handleDelete = () => {
    if (step === 'enter') {
      setPasscode(passcode.slice(0, -1));
    } else {
      setConfirmPasscode(confirmPasscode.slice(0, -1));
    }
    setError('');
  };

  useEffect(() => {
    if (passcode.length === 6) {
      if (isFirstTime) {
        setStep('confirm');
      } else {
        verifyExistingPasscode();
      }
    }
  }, [passcode]);

  useEffect(() => {
    if (confirmPasscode.length === 6) {
      handleFirstTimeSetup();
    }
  }, [confirmPasscode]);

  const verifyExistingPasscode = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('passcode_hash')
        .single();

      if (error) throw error;

      if (verifyPasscode(passcode, data.passcode_hash)) {
        setAuthenticated(true);
        navigate('/');
      } else {
        setError('Try again.');
        setTimeout(() => {
          setPasscode('');
          setError('');
        }, 500);
      }
    } catch (err) {
      console.error('Error verifying passcode:', err);
      setError('Error verifying passcode');
    }
  };

  const handleFirstTimeSetup = async () => {
    if (passcode !== confirmPasscode) {
      setError('Passcodes do not match');
      setTimeout(() => {
        setPasscode('');
        setConfirmPasscode('');
        setStep('enter');
        setError('');
      }, 1000);
      return;
    }

    try {
      const hash = hashPasscode(passcode);

      const { error } = await supabase
        .from('settings')
        .update({ passcode_hash: hash })
        .eq('passcode_hash', 'temp');

      if (error) throw error;

      setAuthenticated(true);
      navigate('/');
    } catch (err) {
      console.error('Error setting passcode:', err);
      setError('Error setting passcode');
    }
  };

  return (
    <div className="passcode-lock">
      <div className="passcode-content">
        <div className="logo-placeholder">
          <div className="logo-circle">A</div>
        </div>

        <h1 className="app-name">Just us</h1>

        <p className="subtitle">
          {isFirstTime
            ? (step === 'enter'
                ? 'Protect your space with a 6-digit passcode.'
                : 'Confirm your passcode.')
            : 'Enter your passcode'}
        </p>

        <div className="passcode-dots">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`dot ${
                (step === 'enter' ? passcode.length : confirmPasscode.length) > i
                  ? 'filled'
                  : ''
              } ${error ? 'error' : ''}`}
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
