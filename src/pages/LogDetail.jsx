import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import '../styles/LogDetail.css';

export default function LogDetail() {
  const { id: challengeId, logId } = useParams();
  const navigate = useNavigate();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchLog();
  }, [logId]);

  const fetchLog = async () => {
    try {
      const { data, error } = await supabase
        .from('challenge_logs')
        .select('*')
        .eq('id', logId)
        .single();

      if (error) throw error;
      setLog(data);
    } catch (error) {
      console.error('Error fetching log:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);

      const { error } = await supabase
        .from('challenge_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;

      // Navigate back to challenge detail
      navigate(`/challenge/${challengeId}`, { replace: true });
    } catch (error) {
      console.error('Error deleting log:', error);
      alert('Failed to delete log');
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    navigate(`/challenge/${challengeId}/log/${logId}`);
  };

  const formatLogTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatLogDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long'
    });
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

  const getActivityEmoji = (activityType) => {
    switch (activityType) {
      case 'walk': return '🚶';
      case 'run': return '🏃';
      case 'gym': return '🏋️';
      case 'yoga': return '🧘';
      case 'cycle': return '🚴';
      default: return '💪';
    }
  };

  const getActivityLabel = (activityType) => {
    return activityType.charAt(0).toUpperCase() + activityType.slice(1);
  };

  const getLogEmoji = (log) => {
    if (log.log_type === 'meal') {
      return getMealEmoji(log.meal_type);
    } else if (log.log_type === 'exercise') {
      return getActivityEmoji(log.activity_type);
    } else if (log.log_type === 'fruit') {
      return '🍎';
    }
    return '📝';
  };

  const getLogLabel = (log) => {
    if (log.log_type === 'meal') {
      return getMealLabel(log.meal_type);
    } else if (log.log_type === 'exercise') {
      return getActivityLabel(log.activity_type);
    } else if (log.log_type === 'fruit') {
      return 'Fruit';
    }
    return 'Log';
  };

  const getPageTitle = (log) => {
    if (log.log_type === 'meal') {
      return 'Meal Log';
    } else if (log.log_type === 'exercise') {
      return 'Exercise Log';
    } else if (log.log_type === 'fruit') {
      return 'Fruit Log';
    }
    return 'Log Details';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="error-container">
        <p>Log not found</p>
        <button onClick={() => navigate(`/challenge/${challengeId}`)}>Back to Challenge</button>
      </div>
    );
  }

  return (
    <div className="log-detail-page">
      {/* Header */}
      <div className="log-detail-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="header-title">{getPageTitle(log)}</div>
      </div>

      <div className="log-detail-content">
        {/* Photo */}
        {log.photo_url && (
          <div className="log-photo-container">
            <img src={log.photo_url} alt={log.meal_name} className="log-photo-full" />
          </div>
        )}

        {/* Log Type Badge */}
        <div className="log-meal-type-badge">
          <span className="meal-emoji">{getLogEmoji(log)}</span>
          <span className="meal-type-label">{getLogLabel(log)}</span>
        </div>

        {/* Log Name */}
        <div className="log-meal-name">{log.meal_name}</div>

        {/* Date, Time & Duration */}
        <div className="log-datetime-row">
          <div className="log-info-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4.5" width="18" height="17" rx="3"/>
              <path d="M3 9h18M8 2.5v4M16 2.5v4"/>
            </svg>
            <div className="log-info-text">
              <div className="log-info-label">Date</div>
              <div className="log-info-value">{formatLogDate(log.log_date)}</div>
            </div>
          </div>
          <div className="log-info-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 7v5l3.2 2"/>
            </svg>
            <div className="log-info-text">
              <div className="log-info-label">Time</div>
              <div className="log-info-value">{formatLogTime(log.log_time)}</div>
            </div>
          </div>
        </div>

        {/* Duration (for exercise logs) */}
        {log.log_type === 'exercise' && log.duration && (
          <div className="log-duration-section">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4D8BF0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 7v5l3.2 2"/>
            </svg>
            <div className="log-info-text">
              <div className="log-info-label">Duration</div>
              <div className="log-info-value">{log.duration} minutes</div>
            </div>
          </div>
        )}

        {/* Note */}
        {log.note && (
          <div className="log-note-section">
            <div className="log-note-label">Note</div>
            <div className="log-note-content">{log.note}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="log-actions">
          <button className="action-btn edit-btn" onClick={handleEdit}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/>
            </svg>
            Edit log
          </button>
          <button
            className="action-btn delete-btn"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4.5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2V6m2 0v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
            </svg>
            Delete log
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="delete-modal-overlay" onClick={() => !deleting && setShowDeleteConfirm(false)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E0556F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M8 6V4.5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2V6m2 0v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
              </svg>
            </div>
            <div className="delete-modal-title">Delete this log?</div>
            <div className="delete-modal-message">
              This will permanently delete this log. This action cannot be undone.
            </div>
            <div className="delete-modal-actions">
              <button
                className="modal-btn cancel-btn"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="modal-btn confirm-delete-btn"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <div className="spinner-small"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
