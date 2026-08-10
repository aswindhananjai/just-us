import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { uploadImage } from '../utils/cloudinary';
import { getCurrentUser } from '../utils/auth';
import ChallengeCompleteModal from '../components/ChallengeCompleteModal';
import '../styles/AddMealLog.css';

export default function AddMealLog() {
  const { id: challengeId, logId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const suggestedMeal = searchParams.get('meal');
  const currentUser = getCurrentUser();

  const [formData, setFormData] = useState({
    meal_type: suggestedMeal || 'dinner',
    meal_name: '',
    photo_url: '',
    log_date: new Date().toISOString().split('T')[0],
    log_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    note: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [challengeTitle, setChallengeTitle] = useState('');
  const [errors, setErrors] = useState({
    mealName: '',
    photo: '',
    submit: ''
  });

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    if (logId) {
      fetchLogData();
    }
  }, [logId]);

  const fetchLogData = async () => {
    try {
      const { data, error } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('id', logId)
        .single();

      if (error) throw error;

      setFormData({
        meal_type: data.meal_type,
        meal_name: data.meal_name,
        photo_url: data.photo_url || '',
        log_date: data.log_date,
        log_time: data.log_time,
        note: data.note || ''
      });
      setPhotoPreview(data.photo_url || '');
      setIsEditMode(true);
    } catch (error) {
      console.error('Error fetching log:', error);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setShowPhotoOptions(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoOptionClick = () => {
    if (photoPreview) {
      // If photo already exists, show options to change or remove
      setShowPhotoOptions(true);
    } else {
      // If no photo, show options to add
      setShowPhotoOptions(true);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    setFormData({ ...formData, photo_url: '' });
    setShowPhotoOptions(false);
  };

  const uploadPhoto = async () => {
    if (!photoFile) return formData.photo_url;

    try {
      setUploading(true);
      setErrors(prev => ({ ...prev, photo: '' })); // Clear previous errors

      // Upload to Cloudinary
      const url = await uploadImage(photoFile);
      return url;
    } catch (error) {
      console.error('Error uploading photo:', error);
      setErrors(prev => ({ ...prev, photo: 'Failed to upload photo. Please try again.' }));
      throw error; // Re-throw to stop the save flow
    } finally {
      setUploading(false);
    }
  };

  const checkChallengeCompletion = async () => {
    try {
      // Fetch challenge details
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .select('title, duration_days, start_date')
        .eq('id', challengeId)
        .single();

      if (challengeError) throw challengeError;

      // Check if we're on day 30 (or the final day)
      const [year, month, day] = challenge.start_date.split('-').map(Number);
      const startDate = new Date(year, month - 1, day);
      startDate.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - startDate.getTime();
      const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const currentDay = Math.max(1, Math.min(daysPassed, challenge.duration_days));

      // Only check if we're at or past day 30
      if (currentDay < challenge.duration_days) {
        return false;
      }

      // Count total meal logs for this challenge
      const { data: logs, error: logsError } = await supabase
        .from('meal_logs')
        .select('id')
        .eq('challenge_id', challengeId);

      if (logsError) throw logsError;

      // Check if all meals are logged (30 days × 3 meals = 90)
      const totalMealsNeeded = challenge.duration_days * 3;
      const isComplete = logs && logs.length >= totalMealsNeeded;

      if (isComplete) {
        setChallengeTitle(challenge.title);
        setShowCompleteModal(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking challenge completion:', error);
      return false;
    }
  };

  const handleCompleteModalClose = () => {
    setShowCompleteModal(false);
    navigate(`/challenge/${challengeId}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({ mealName: '', photo: '', submit: '' });

    // Validate meal name
    if (!formData.meal_name.trim()) {
      setErrors(prev => ({ ...prev, mealName: 'Meal name is mandatory' }));
      return;
    }

    try {
      setSaving(true);

      // Check for duplicate meal entry (only when creating new log, not editing)
      if (!isEditMode) {
        const { data: existingLogs, error: checkError } = await supabase
          .from('meal_logs')
          .select('id')
          .eq('challenge_id', challengeId)
          .eq('meal_type', formData.meal_type)
          .eq('log_date', formData.log_date);

        if (checkError) throw checkError;

        if (existingLogs && existingLogs.length > 0) {
          alert(`You already logged ${formData.meal_type} for this date. Please choose a different meal type or date.`);
          setSaving(false);
          return;
        }
      }

      // Upload photo if new one selected
      const photoUrl = await uploadPhoto();

      // Get user ID
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('name', currentUser)
        .single();

      const logData = {
        challenge_id: challengeId,
        user_id: userData?.id,
        meal_type: formData.meal_type,
        meal_name: formData.meal_name,
        photo_url: photoUrl,
        log_date: formData.log_date,
        log_time: formData.log_time,
        note: formData.note.trim() || null,
        updated_by: userData?.id,
        updated_at: new Date().toISOString()
      };

      if (isEditMode) {
        // Update existing log
        const { error } = await supabase
          .from('meal_logs')
          .update(logData)
          .eq('id', logId);

        if (error) throw error;
      } else {
        // Create new log
        const { error } = await supabase
          .from('meal_logs')
          .insert([{
            ...logData,
            created_by: userData?.id,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      // Check if challenge is now complete (only for new logs, not edits)
      if (!isEditMode) {
        const isComplete = await checkChallengeCompletion();
        if (isComplete) {
          // Modal will handle navigation
          return;
        }
      }

      navigate(`/challenge/${challengeId}`);
    } catch (error) {
      console.error('Error saving log:', error);

      // Display user-friendly error message
      let errorMessage = 'Failed to save meal log. Please try again.';

      if (error.message) {
        // Check for common database errors
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
          errorMessage = `You already logged ${formData.meal_type} for this date and time. Please use a different time or edit the existing log.`;
        } else if (error.message.includes('foreign key') || error.message.includes('does not exist')) {
          errorMessage = 'Challenge not found. Please return to the home page and try again.';
        } else if (error.message.includes('invalid') || error.message.includes('violates')) {
          errorMessage = 'Invalid data provided. Please check your entries and try again.';
        }
      }

      setErrors(prev => ({ ...prev, submit: errorMessage }));
    } finally {
      setSaving(false);
    }
  };

  const getMealEmoji = (mealType) => {
    switch (mealType) {
      case 'breakfast': return '🍳';
      case 'lunch': return '🥗';
      case 'dinner': return '🍝';
      default: return '🍽️';
    }
  };

  const getMealLabel = (mealType) => {
    return mealType.charAt(0).toUpperCase() + mealType.slice(1);
  };

  return (
    <div className="add-meal-log-page">
      {/* Header */}
      <div className="add-log-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="header-title">Log a meal</div>
      </div>

      <form onSubmit={handleSubmit} className="add-log-form">
        {/* Photo Upload */}
        <div className="photo-upload-section">
          <input
            type="file"
            id="photo-upload-input"
            accept="image/*"
            onChange={handlePhotoChange}
            style={{ display: 'none' }}
          />
          <input
            type="file"
            id="photo-camera-input"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoChange}
            style={{ display: 'none' }}
          />
          <div
            className={`photo-upload-area ${photoPreview ? 'has-photo' : ''}`}
            onClick={handlePhotoOptionClick}
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="photo-preview" />
            ) : (
              <>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                <span className="photo-upload-text">Add a photo of your meal</span>
              </>
            )}
          </div>
          {errors.photo && <div className="error-message">{errors.photo}</div>}
        </div>

        {/* Meal Type Selector */}
        <div className="form-section">
          <div className="form-label">Which meal?</div>
          <div className="meal-type-selector">
            {['breakfast', 'lunch', 'dinner'].map((type) => (
              <button
                key={type}
                type="button"
                className={`meal-type-btn ${formData.meal_type === type ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, meal_type: type })}
              >
                {getMealEmoji(type)} {getMealLabel(type)}
              </button>
            ))}
          </div>
        </div>

        {/* Meal Name */}
        <div className="form-section">
          <div className="form-label">Meal name</div>
          <input
            type="text"
            className={`form-input ${errors.mealName ? 'error' : ''}`}
            placeholder="e.g., Grilled chicken salad"
            value={formData.meal_name}
            onChange={(e) => {
              setFormData({ ...formData, meal_name: e.target.value });
              if (errors.mealName) {
                setErrors(prev => ({ ...prev, mealName: '' }));
              }
            }}
          />
          {errors.mealName && <div className="error-message">{errors.mealName}</div>}
        </div>

        {/* Date & Time */}
        <div className="form-row">
          <div className="form-section flex-1">
            <div className="form-label">Date</div>
            <div className="form-input-with-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4.5" width="18" height="17" rx="3"/>
                <path d="M3 9h18M8 2.5v4M16 2.5v4"/>
              </svg>
              <input
                type="date"
                className="form-input icon-input"
                value={formData.log_date}
                onChange={(e) => setFormData({ ...formData, log_date: e.target.value })}
              />
            </div>
          </div>
          <div className="form-section flex-1">
            <div className="form-label">Time</div>
            <div className="form-input-with-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 7v5l3.2 2"/>
              </svg>
              <input
                type="time"
                className="form-input icon-input"
                value={formData.log_time}
                onChange={(e) => setFormData({ ...formData, log_time: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="form-section">
          <div className="form-label">
            Note <span className="optional-label">· optional</span>
          </div>
          <textarea
            className="form-textarea"
            placeholder="How did it go?"
            rows="3"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          />
        </div>

        {/* Submit Error Message */}
        {errors.submit && (
          <div className="error-message submit-error">
            {errors.submit}
          </div>
        )}

        {/* Submit Button */}
        <div className="form-submit-container">
          <button
            type="submit"
            className="submit-button"
            disabled={saving || uploading}
          >
            {saving || uploading ? (
              <>
                <div className="spinner-small"></div>
                {uploading ? 'Uploading...' : 'Saving...'}
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
                Save log
              </>
            )}
          </button>
        </div>
      </form>

      {/* Photo Options Modal */}
      {showPhotoOptions && (
        <div className="photo-options-overlay" onClick={() => setShowPhotoOptions(false)}>
          <div className="photo-options-modal" onClick={(e) => e.stopPropagation()}>
            <div className="photo-options-header">
              {photoPreview ? 'Change Photo' : 'Add Photo'}
            </div>
            <div className="photo-options-buttons">
              <label htmlFor="photo-camera-input" className="photo-option-btn camera-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <span>Take Photo</span>
              </label>
              <label htmlFor="photo-upload-input" className="photo-option-btn upload-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="m21 15-5-5L5 21"/>
                </svg>
                <span>Choose from Gallery</span>
              </label>
              {photoPreview && (
                <button
                  type="button"
                  className="photo-option-btn remove-btn"
                  onClick={handleRemovePhoto}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M8 6V4.5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2V6m2 0v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                  </svg>
                  <span>Remove Photo</span>
                </button>
              )}
            </div>
            <button
              type="button"
              className="photo-options-cancel"
              onClick={() => setShowPhotoOptions(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Challenge Complete Modal */}
      <ChallengeCompleteModal
        isOpen={showCompleteModal}
        onClose={handleCompleteModalClose}
        challengeTitle={challengeTitle}
      />
    </div>
  );
}
