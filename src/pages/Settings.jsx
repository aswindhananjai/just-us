import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser, getUserData, updateUserProfilePicture } from '../utils/auth';
import { uploadImage } from '../utils/cloudinary';
import BottomNav from '../components/BottomNav';
import '../styles/Settings.css';

export default function Settings() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [uploading, setUploading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(`/${currentUser.toLowerCase()}.png`);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const userData = await getUserData(currentUser);
    if (userData?.profile_picture_url) {
      setProfilePicture(userData.profile_picture_url);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to lock the app?')) {
      logout();
      navigate('/lock');
    }
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    try {
      setUploading(true);

      // Upload to Cloudinary
      const imageUrl = await uploadImage(file);

      // Update in database
      const success = await updateUserProfilePicture(currentUser, imageUrl);

      if (success) {
        // Update local state
        setProfilePicture(imageUrl);
        alert('Profile picture updated successfully!');
      } else {
        throw new Error('Failed to update database');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="settings-page">
      {/* Profile Hero Card */}
      <div className="profile-hero-card">
        <div className="profile-hero-content">
          <div className="profile-hero-image">
            <img src={profilePicture} alt={currentUser} />
          </div>
          <div className="profile-hero-info">
            <div className="profile-hero-greeting">Your profile</div>
            <div className="profile-hero-name">{currentUser}</div>
            <div className="profile-hero-meta">Logged in</div>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="settings-content">
        {/* Profile Picture Section */}
        <h2 className="settings-section-title">Profile Picture</h2>

        <div className="profile-picture-card">
          <div className="profile-picture-header">
            <img
              src={profilePicture}
              alt={currentUser}
              className="profile-preview"
            />
            <div className="profile-text">
              <h3>Your Picture</h3>
              <p className="profile-hint">Square images work best</p>
            </div>
          </div>
          <label className="upload-btn">
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
            {uploading ? 'Uploading...' : 'Change Picture'}
          </label>
        </div>

        {/* Lock Button */}
        <button className="lock-btn" onClick={handleLogout}>
          Lock App
        </button>

        {/* App Footer */}
        <div className="app-footer">
          <p className="app-version">Just us v1.0.0</p>
          <p className="app-tagline">A space that's ours.</p>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="bottom-nav-settings">
        <button className="nav-item-settings inactive" onClick={() => navigate('/')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
          <span>Memories</span>
        </button>
        <button className="nav-item-settings active">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
          </svg>
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
}
