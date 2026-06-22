import { supabase } from './supabase';

const CURRENT_USER_KEY = 'justus_current_user';
const USERS_CACHE_KEY = 'justus_users_cache';
const CACHE_EXPIRY_KEY = 'justus_users_cache_expiry';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Cache users in localStorage to avoid repeated DB calls
const getCachedUsers = () => {
  const cached = localStorage.getItem(USERS_CACHE_KEY);
  const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);

  if (cached && expiry && Date.now() < parseInt(expiry)) {
    return JSON.parse(cached);
  }
  return null;
};

const setCachedUsers = (users) => {
  localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(users));
  localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
};

// Fetch all users from database
export const fetchUsers = async () => {
  try {
    // Check cache first
    const cached = getCachedUsers();
    if (cached) return cached;

    // Fetch from database
    const { data, error } = await supabase
      .from('users')
      .select('*');

    if (error) throw error;

    // Cache the results
    setCachedUsers(data);
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

// Verify passcode against database
export const verifyPasscode = async (passcode) => {
  try {
    const users = await fetchUsers();
    const user = users.find(u => u.passcode === passcode);
    return user ? user.name : null;
  } catch (error) {
    console.error('Error verifying passcode:', error);
    return null;
  }
};

// Get user data by name
export const getUserData = async (userName) => {
  try {
    const users = await fetchUsers();
    return users.find(u => u.name === userName) || null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Update user profile picture in database
export const updateUserProfilePicture = async (userName, imageUrl) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ profile_picture_url: imageUrl, updated_at: new Date() })
      .eq('name', userName);

    if (error) throw error;

    // Clear cache to force refresh
    localStorage.removeItem(USERS_CACHE_KEY);
    localStorage.removeItem(CACHE_EXPIRY_KEY);

    return true;
  } catch (error) {
    console.error('Error updating profile picture:', error);
    return false;
  }
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
