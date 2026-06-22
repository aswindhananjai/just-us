import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../utils/auth';
import { uploadImage } from '../utils/cloudinary';
import BottomNav from '../components/BottomNav';
import '../styles/Settings.css';

export default function Settings() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [uploading, setUploading] = useState({ aswin: false, anu: false });

  // Get profile pictures from localStorage or use defaults
  const getProfilePicture = (user) => {
    return localStorage.getItem(`profile_picture_${user.toLowerCase()}`) || `/${user.toLowerCase()}.png`;
  };

  const [profilePictures, setProfilePictures] = useState({
    aswin: getProfilePicture('Aswin'),
    anu: getProfilePicture('Anu'),
  });

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
      setUploading({ ...uploading, [currentUser.toLowerCase()]: true });

      const imageUrl = await uploadImage(file);

      // Store in localStorage
      localStorage.setItem(`profile_picture_${currentUser.toLowerCase()}`, imageUrl);

      // Update state
      setProfilePictures({
        ...profilePictures,
        [currentUser.toLowerCase()]: imageUrl,
      });

      alert('Profile picture updated successfully!');

      // Reload the page to update the header
      window.location.reload();
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setUploading({ ...uploading, [currentUser.toLowerCase()]: false });
    }
  };

  return (
    <div className="settings-page">
      <header className="settings-header">
        <h1>Settings</h1>
      </header>

      <div className="settings-content">
        <div className="settings-info">
          <div className="info-card">
            <h3>Logged in as</h3>
            <p className="current-user">{currentUser}</p>
          </div>
        </div>

        {/* Profile Picture Section - Only current user */}
        <div className="profile-pictures-section">
          <h2 className="section-title">Profile Picture</h2>

          <div className="profile-picture-card">
            <div className="profile-picture-header">
              <div className="profile-info">
                <img
                  src={profilePictures[currentUser.toLowerCase()]}
                  alt={currentUser}
                  className="profile-preview"
                />
                <div>
                  <h3>Your Picture</h3>
                  <p className="profile-hint">Square images work best</p>
                </div>
              </div>
            </div>
            <label className="upload-btn">
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                disabled={uploading[currentUser.toLowerCase()]}
                style={{ display: 'none' }}
              />
              {uploading[currentUser.toLowerCase()] ? 'Uploading...' : 'Change Picture'}
            </label>
          </div>
        </div>

        <div className="settings-actions">
          <button className="btn-secondary logout-btn" onClick={handleLogout}>
            Lock App
          </button>
        </div>
      </div>

      <div className="settings-footer">
        <p className="app-version">Just us v1.0.0</p>
        <p className="app-tagline">A space that's ours.</p>
      </div>

      <BottomNav />
    </div>
  );
}
