import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getActivities,
  markActivityAsRead,
  markAllActivitiesAsRead,
  isActivityReadByCurrentUser,
  getActivityActionText,
  getUnreadActivityCount
} from '../utils/activities.js';
import '../styles/Activity.css';

const ACTIVITIES_PER_PAGE = 50;

function Activity() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [displayedActivities, setDisplayedActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    // Update displayed activities when page changes
    const startIndex = 0;
    const endIndex = currentPage * ACTIVITIES_PER_PAGE;
    setDisplayedActivities(activities.slice(startIndex, endIndex));
    setHasMore(endIndex < activities.length);
  }, [currentPage, activities]);

  async function loadActivities() {
    setLoading(true);
    const data = await getActivities();
    setActivities(data);
    setDisplayedActivities(data.slice(0, ACTIVITIES_PER_PAGE));
    setHasMore(data.length > ACTIVITIES_PER_PAGE);
    setLoading(false);
  }

  async function handleActivityClick(activity) {
    // Mark as read for current user
    if (!isActivityReadByCurrentUser(activity)) {
      await markActivityAsRead(activity.id);
    }

    // Navigate to memory detail page
    if (activity.memory_id) {
      navigate(`/memory/${activity.memory_id}`, { state: { from: '/activity' } });
    }
  }

  async function handleMarkAllAsRead() {
    setMarkingAllRead(true);
    const success = await markAllActivitiesAsRead();
    if (success) {
      // Reload activities to reflect the change
      await loadActivities();
    }
    setMarkingAllRead(false);
  }

  function handleLoadMore() {
    setCurrentPage(prev => prev + 1);
  }

  function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  if (loading) {
    return (
      <div className="activity-page">
        <div className="activity-header">
          <button className="back-button" onClick={() => navigate('/settings')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1>Activity</h1>
          <div style={{ width: '80px' }}></div>
        </div>
        <div className="activity-loading">Loading activities...</div>
      </div>
    );
  }

  return (
    <div className="activity-page">
      <div className="activity-header">
        <button className="back-button" onClick={() => navigate('/settings')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1>Activity</h1>
        <button
          className="mark-all-read-button"
          onClick={handleMarkAllAsRead}
          disabled={markingAllRead || activities.every(isActivityReadByCurrentUser)}
        >
          {markingAllRead ? '...' : 'Mark all read'}
        </button>
      </div>

      <div className="activity-list">
        {displayedActivities.length === 0 ? (
          <div className="no-activities">
            <div className="no-activities-icon">📋</div>
            <p>No activities yet</p>
          </div>
        ) : (
          <>
            {displayedActivities.map((activity) => {
              const isRead = isActivityReadByCurrentUser(activity);
              return (
                <div
                  key={activity.id}
                  className={`activity-item ${isRead ? 'read' : 'unread'}`}
                  onClick={() => handleActivityClick(activity)}
                >
                  <div className="activity-icon">
                    {activity.memory_icon || '💖'}
                  </div>
                  <div className="activity-content">
                    <div className="activity-text">
                      {getActivityActionText(activity)}
                    </div>
                    <div className="activity-memory-title">
                      {activity.memory_title}
                    </div>
                    <div className="activity-time">
                      {formatRelativeTime(activity.created_at)}
                    </div>
                  </div>
                  {!isRead && <div className="unread-dot"></div>}
                </div>
              );
            })}

            {hasMore && (
              <button
                className="load-more-button"
                onClick={handleLoadMore}
              >
                Load More
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Activity;
