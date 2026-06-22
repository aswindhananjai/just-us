import CryptoJS from 'crypto-js';

const PASSCODE_KEY = 'justus_passcode';

export const hashPasscode = (passcode) => {
  return CryptoJS.SHA256(passcode).toString();
};

export const savePasscodeHash = (hash) => {
  localStorage.setItem(PASSCODE_KEY, hash);
};

export const getPasscodeHash = () => {
  return localStorage.getItem(PASSCODE_KEY);
};

export const verifyPasscode = (passcode, hash) => {
  return hashPasscode(passcode) === hash;
};

export const isAuthenticated = () => {
  return localStorage.getItem('justus_authenticated') === 'true';
};

export const setAuthenticated = (value) => {
  localStorage.setItem('justus_authenticated', value ? 'true' : 'false');
};

export const logout = () => {
  setAuthenticated(false);
};
