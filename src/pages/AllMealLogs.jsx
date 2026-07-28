import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import '../styles/AllMealLogs.css';

const LOGS_PER_PAGE = 10;

export default function AllMealLogs() {
  const { id: challengeId } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchChallenge();
    fetchLogs(0);
  }, [challengeId]);

  const fetchChallenge = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', challengeId)
        .single();

      if (error) throw error;
      setChallenge(data);
    } catch (error) {
      console.error('Error fetching challenge:', error);
    }
  };

  const fetchLogs = async (page, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const offset = page * LOGS_PER_PAGE;

      // Get total count
      const { count } = await supabase
        .from('meal_logs')
        .select('*', { count: 'exact', head: true })
        .eq('challenge_id', challengeId);

      setTotalCount(count || 0);

      // Get logs with pagination
      const { data, error } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('challenge_id', challengeId)
        .order('log_date', { ascending: false })
        .order('log_time', { ascending: false })
        .range(offset, offset + LOGS_PER_PAGE - 1);

      if (error) throw error;

      if (append) {
        setLogs(prev => [...prev, ...(data || [])]);
      } else {
        setLogs(data || []);
      }

      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    const nextPage = currentPage + 1;
    fetchLogs(nextPage, true);
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
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
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

  const groupLogsByDate = () => {
    const grouped = {};
    logs.forEach(log => {
      const date = log.log_date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(log);
    });
    return grouped;
  };

  const hasMore = logs.length < totalCount;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  const groupedLogs = groupLogsByDate();
  const dates = Object.keys(groupedLogs).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="all-meal-logs-page">
      {/* Header */}
      <div className="all-logs-header">
        <button className="back-button" onClick={() => navigate(`/challenge/${challengeId}`)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="header-text">
          <div className="header-title">All logs</div>
          <div className="header-subtitle">{totalCount} meals logged</div>
        </div>
      </div>

      <div className="all-logs-content">
        {logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-emoji">🍽️</div>
            <div className="empty-title">No logs yet</div>
            <div className="empty-subtitle">Start logging your meals!</div>
          </div>
        ) : (
          <>
            {dates.map(date => (
              <div key={date} className="log-date-group">
                <div className="log-date-header">{formatLogDate(date)}</div>
                {groupedLogs[date].map(log => (
                  <div
                    key={log.id}
                    className="log-item-card"
                    onClick={() => navigate(`/challenge/${challengeId}/log-detail/${log.id}`)}
                  >
                    {log.photo_url && (
                      <img src={log.photo_url} alt={log.meal_name} className="log-item-photo" />
                    )}
                    <div className="log-item-content">
                      <div className="log-item-title">
                        {getMealEmoji(log.meal_type)} {getMealLabel(log.meal_type)}
                      </div>
                      <div className="log-item-name">{log.meal_name}</div>
                      <div className="log-item-time">{formatLogTime(log.log_time)}</div>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 6 6 6-6 6"/>
                    </svg>
                  </div>
                ))}
              </div>
            ))}

            {hasMore && (
              <div className="load-more-container">
                <button
                  className="load-more-btn"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <div className="spinner-small"></div>
                      Loading...
                    </>
                  ) : (
                    `Load more (${logs.length}/${totalCount})`
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
