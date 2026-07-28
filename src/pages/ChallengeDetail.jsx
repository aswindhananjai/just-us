import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { getCurrentUser } from '../utils/auth';
import '../styles/ChallengeDetail.css';

export default function ChallengeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [mealLogs, setMealLogs] = useState([]);
  const [todayLogs, setTodayLogs] = useState({ breakfast: null, lunch: null, dinner: null });
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();

  useEffect(() => {
    fetchChallengeData();
  }, [id]);

  const fetchChallengeData = async () => {
    try {
      // Fetch challenge
      const { data: challengeData, error: challengeError } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', id)
        .single();

      if (challengeError) throw challengeError;

      // Fetch meal logs for this challenge
      const { data: logsData, error: logsError } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('challenge_id', id)
        .order('log_date', { ascending: false })
        .order('log_time', { ascending: false });

      if (logsError) throw logsError;

      setChallenge(challengeData);
      setMealLogs(logsData || []);

      // Get today's logs
      const today = new Date().toISOString().split('T')[0];
      const todayMeals = (logsData || []).filter(log => log.log_date === today);
      const todayStatus = {
        breakfast: todayMeals.find(log => log.meal_type === 'breakfast'),
        lunch: todayMeals.find(log => log.meal_type === 'lunch'),
        dinner: todayMeals.find(log => log.meal_type === 'dinner')
      };
      setTodayLogs(todayStatus);

    } catch (error) {
      console.error('Error fetching challenge data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (!challenge) return { currentDay: 0, totalDays: 30, percentage: 0, streak: 0 };

    const startDate = new Date(challenge.start_date);
    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const currentDay = Math.min(daysPassed, challenge.duration_days);

    // Calculate streak (consecutive days with at least one log)
    let streak = 0;
    const sortedDates = [...new Set(mealLogs.map(log => log.log_date))].sort().reverse();
    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 0; i < currentDay; i++) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      if (sortedDates.includes(dateStr)) {
        streak++;
      } else {
        break;
      }
    }

    return {
      currentDay,
      totalDays: challenge.duration_days,
      percentage: Math.round((currentDay / challenge.duration_days) * 100),
      streak
    };
  };

  const getCalendarDays = () => {
    if (!challenge) return [];

    const days = [];
    const startDate = new Date(challenge.start_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all log dates
    const logDates = new Set(mealLogs.map(log => log.log_date));

    for (let i = 0; i < challenge.duration_days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      currentDate.setHours(0, 0, 0, 0);

      const dateStr = currentDate.toISOString().split('T')[0];
      const isPast = currentDate < today;
      const isToday = currentDate.getTime() === today.getTime();
      const isFuture = currentDate > today;
      const hasLog = logDates.has(dateStr);

      days.push({
        day: i + 1,
        date: dateStr,
        isPast,
        isToday,
        isFuture,
        hasLog
      });
    }

    return days;
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
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="error-container">
        <p>Challenge not found</p>
        <button onClick={() => navigate('/challenges')}>Back to Challenges</button>
      </div>
    );
  }

  const progress = calculateProgress();
  const calendarDays = getCalendarDays();
  const recentLogs = mealLogs.slice(0, 3);

  return (
    <div className="challenge-detail-page">
      {/* Header */}
      <div className="challenge-detail-header">
        <button className="back-button" onClick={() => navigate('/challenges')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="header-title">{challenge.title}</div>
      </div>

      <div className="challenge-detail-content">
        {/* Progress Circle */}
        <div className="progress-circle-container">
          <svg className="progress-circle" width="140" height="140" viewBox="0 0 140 140">
            <circle
              cx="70"
              cy="70"
              r="62"
              fill="none"
              stroke="#FFF7ED"
              strokeWidth="10"
            />
            <circle
              cx="70"
              cy="70"
              r="62"
              fill="none"
              stroke="url(#orangeGradient)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 62}`}
              strokeDashoffset={`${2 * Math.PI * 62 * (1 - progress.percentage / 100)}`}
              transform="rotate(-90 70 70)"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
            <defs>
              <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>
            </defs>
          </svg>
          <div className="progress-circle-content">
            <div className="progress-percentage">{progress.percentage}%</div>
            <div className="progress-label">completed</div>
          </div>
        </div>

        {/* Stats */}
        <div className="challenge-stats-row">
          <div className="challenge-stat-item">
            <div className="stat-value">{progress.currentDay}/{progress.totalDays}</div>
            <div className="stat-label">Days</div>
          </div>
          <div className="challenge-stat-divider"></div>
          <div className="challenge-stat-item">
            <div className="stat-value">🔥 {progress.streak}</div>
            <div className="stat-label">Streak</div>
          </div>
          <div className="challenge-stat-divider"></div>
          <div className="challenge-stat-item">
            <div className="stat-value">{mealLogs.length}</div>
            <div className="stat-label">Meals logged</div>
          </div>
        </div>

        {/* Today's Meals */}
        <div className="todays-meals-section">
          <div className="section-title">Today's meals</div>
          <div className="meals-grid">
            {['breakfast', 'lunch', 'dinner'].map((mealType) => {
              const log = todayLogs[mealType];
              const isLogged = !!log;

              return (
                <div
                  key={mealType}
                  className={`meal-card ${isLogged ? 'logged' : 'not-logged'}`}
                  onClick={() => !isLogged && navigate(`/challenge/${id}/log?meal=${mealType}`)}
                >
                  <div className="meal-emoji">{getMealEmoji(mealType)}</div>
                  <div className="meal-name">{getMealLabel(mealType)}</div>
                  {isLogged ? (
                    <div className="meal-status logged">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5"/>
                      </svg>
                      {formatLogTime(log.log_time)}
                    </div>
                  ) : (
                    <div className="meal-status not-logged">Log now</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 30-day Calendar */}
        <div className="calendar-section">
          <div className="calendar-header">
            <div className="section-title">30-day calendar</div>
            <div className="calendar-legend">
              <span className="legend-item">
                <span className="legend-dot done"></span>done
              </span>
              <span className="legend-item">
                <span className="legend-emoji">🔥</span>today
              </span>
            </div>
          </div>
          <div className="calendar-grid">
            {calendarDays.map((dayData) => (
              <div
                key={dayData.day}
                className={`calendar-day ${dayData.isToday ? 'today' : ''} ${dayData.hasLog ? 'done' : ''} ${dayData.isFuture ? 'future' : ''}`}
              >
                <span className="day-number">{dayData.day}</span>
                {dayData.hasLog && !dayData.isToday && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                )}
                {dayData.isToday && <span className="today-emoji">🔥</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Logs */}
        <div className="recent-logs-section">
          <div className="section-title">Recent logs</div>
          {recentLogs.length === 0 ? (
            <div className="empty-logs">
              <p>No meals logged yet</p>
            </div>
          ) : (
            <>
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="log-card"
                  onClick={() => navigate(`/challenge/${id}/log/${log.id}`)}
                >
                  {log.photo_url && (
                    <img src={log.photo_url} alt={log.meal_name} className="log-photo" />
                  )}
                  <div className="log-content">
                    <div className="log-title">
                      {getMealEmoji(log.meal_type)} {getMealLabel(log.meal_type)}
                    </div>
                    <div className="log-meta">
                      {formatLogDate(log.log_date)}, {formatLogTime(log.log_time)}
                    </div>
                  </div>
                </div>
              ))}
              {mealLogs.length > 3 && (
                <button className="see-all-logs-btn" onClick={() => navigate(`/challenge/${id}/logs`)}>
                  See all logs
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Floating Log Button */}
      <button className="floating-log-button" onClick={() => navigate(`/challenge/${id}/log`)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Log a meal
      </button>
    </div>
  );
}
