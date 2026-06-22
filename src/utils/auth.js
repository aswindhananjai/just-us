import CryptoJS from 'crypto-js';

// Hardcoded passcodes for Aswin and Anu
const ASWIN_PASSCODE = '140297';
const ANU_PASSCODE = '010195';

const CURRENT_USER_KEY = 'justus_current_user';

export const hashPasscode = (passcode) => {
  return CryptoJS.SHA256(passcode).toString();
};

export const verifyPasscode = (passcode) => {
  if (passcode === ASWIN_PASSCODE) {
    return 'Aswin';
  } else if (passcode === ANU_PASSCODE) {
    return 'Anu';
  }
  return null;
};

export const isAuthenticated = () => {
  return localStorage.getItem('justus_authenticated') === 'true';
};

export const setAuthenticated = (value, userName = null) => {
  localStorage.setItem('justus_authenticated', value ? 'true' : 'false');
  if (userName) {
    localStorage.setItem(CURRENT_USER_KEY, userName);
  }
};

export const getCurrentUser = () => {
  return localStorage.getItem(CURRENT_USER_KEY) || 'Aswin';
};

export const logout = () => {
  setAuthenticated(false);
  localStorage.removeItem(CURRENT_USER_KEY);
};
