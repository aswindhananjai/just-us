import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { getCurrentUser } from '../utils/auth';
import '../styles/ChallengeDetail.css';

export default function ChallengeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [challengeLogs, setChallengeLogs] = useState([]);
  const [todayLogs, setTodayLogs] = useState({ breakfast: null, lunch: null, dinner: null, log: null });
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

      // Fetch challenge logs for this challenge
      const { data: logsData, error: logsError } = await supabase
        .from('challenge_logs')
        .select('*')
        .eq('challenge_id', id)
        .order('log_date', { ascending: false })
        .order('log_time', { ascending: false });

      if (logsError) throw logsError;

      setChallenge(challengeData);
      setChallengeLogs(logsData || []);

      // Get today's logs based on challenge type
      const today = new Date().toISOString().split('T')[0];
      const todayEntries = (logsData || []).filter(log => log.log_date === today);

      if (challengeData.challenge_type === 'meal') {
        const todayStatus = {
          breakfast: todayEntries.find(log => log.meal_type === 'breakfast'),
          lunch: todayEntries.find(log => log.meal_type === 'lunch'),
          dinner: todayEntries.find(log => log.meal_type === 'dinner'),
          log: null
        };
        setTodayLogs(todayStatus);
      } else {
        // For exercise and fruit, we just need one log per day
        setTodayLogs({
          breakfast: null,
          lunch: null,
          dinner: null,
          log: todayEntries[0] || null
        });
      }

    } catch (error) {
      console.error('Error fetching challenge data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (!challenge) return { currentDay: 0, totalDays: 30, percentage: 0, streak: 0, completedDays: 0, streakDates: [] };

    // Parse date string correctly to avoid timezone issues
    const [year, month, day] = challenge.start_date.split('-').map(Number);
    const startDate = new Date(year, month - 1, day);
    startDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - startDate.getTime();
    const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const currentDay = Math.max(1, Math.min(daysPassed, challenge.duration_days));

    // Calculate streak (consecutive days with ALL 3 meals logged)
    let streak = 0;
    let completedDays = 0;
    const streakDates = [];

    // Group logs by date
    const logsByDate = challengeLogs.reduce((acc, log) => {
      if (!acc[log.log_date]) acc[log.log_date] = [];
      if (challenge.challenge_type === 'meal') {
        acc[log.log_date].push(log.meal_type);
      } else {
        acc[log.log_date].push(log.log_type);
      }
      return acc;
    }, {});

    // Check streak from yesterday backwards (exclude today since it's ongoing)
    for (let i = 1; i < currentDay; i++) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      // Check if this date is before challenge start
      const checkDateTime = new Date(dateStr);
      if (checkDateTime < startDate) break;

      const logsForDay = logsByDate[dateStr] || [];

      let dayComplete = false;
      if (challenge.challenge_type === 'meal') {
        // All 3 meals must be logged for the streak to continue
        const hasBreakfast = logsForDay.includes('breakfast');
        const hasLunch = logsForDay.includes('lunch');
        const hasDinner = logsForDay.includes('dinner');
        dayComplete = hasBreakfast && hasLunch && hasDinner;
      } else {
        // For exercise and fruit, just need one log
        dayComplete = logsForDay.length > 0;
      }

      if (dayComplete) {
        streak++;
        streakDates.push(dateStr);
      } else {
        // Streak broken
        break;
      }
    }

    // Count total completed days
    for (let i = 0; i < currentDay; i++) {
      const checkDate = new Date(startDate);
      checkDate.setDate(startDate.getDate() + i);
      const year = checkDate.getFullYear();
      const month = String(checkDate.getMonth() + 1).padStart(2, '0');
      const day = String(checkDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const logsForDay = logsByDate[dateStr] || [];

      let dayComplete = false;
      if (challenge.challenge_type === 'meal') {
        const hasBreakfast = logsForDay.includes('breakfast');
        const hasLunch = logsForDay.includes('lunch');
        const hasDinner = logsForDay.includes('dinner');
        dayComplete = hasBreakfast && hasLunch && hasDinner;
      } else {
        dayComplete = logsForDay.length > 0;
      }

      if (dayComplete) {
        completedDays++;
      }
    }

    return {
      currentDay,
      totalDays: challenge.duration_days,
      percentage: Math.round((completedDays / challenge.duration_days) * 100),
      streak,
      completedDays,
      streakDates
    };
  };

  const getCalendarDays = () => {
    if (!challenge) return { days: [], startDayOfWeek: 0 };

    const days = [];
    // Parse date string correctly to avoid timezone issues
    const [year, month, day] = challenge.start_date.split('-').map(Number);
    const startDate = new Date(year, month - 1, day);
    startDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get the day of week for the start date (0 = Sunday, 1 = Monday, etc.)
    const startDayOfWeek = startDate.getDay();

    // Group logs by date
    const logsByDate = challengeLogs.reduce((acc, log) => {
      if (!acc[log.log_date]) acc[log.log_date] = [];
      if (challenge.challenge_type === 'meal') {
        acc[log.log_date].push(log.meal_type);
      } else {
        acc[log.log_date].push(log.log_type);
      }
      return acc;
    }, {});

    for (let i = 0; i < challenge.duration_days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      // Format date manually to avoid timezone issues with toISOString
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const isPast = currentDate < today;
      const isToday = currentDate.getTime() === today.getTime();
      const isFuture = currentDate > today;

      // Check completion for this day based on challenge type
      const logsForDay = logsByDate[dateStr] || [];

      let allLogsComplete = false;
      let someLogsComplete = false;

      if (challenge.challenge_type === 'meal') {
        const hasBreakfast = logsForDay.includes('breakfast');
        const hasLunch = logsForDay.includes('lunch');
        const hasDinner = logsForDay.includes('dinner');
        allLogsComplete = hasBreakfast && hasLunch && hasDinner;
        someLogsComplete = logsForDay.length > 0 && !allLogsComplete;
      } else {
        // For exercise and fruit, just need one log
        allLogsComplete = logsForDay.length > 0;
        someLogsComplete = false;
      }

      days.push({
        day: i + 1,
        date: dateStr,
        isPast,
        isToday,
        isFuture,
        allMealsLogged: allLogsComplete,
        someMealsLogged: someLogsComplete,
        mealsCount: logsForDay.length
      });
    }

    return { days, startDayOfWeek };
  };

  const getChallengeGradient = (challengeType) => {
    switch (challengeType) {
      case 'exercise':
        return { id: 'blueGradient', colors: ['#4D8BF0', '#1B4FA8'], bgColor: '#E3EDFC' };
      case 'fruit':
        return { id: 'greenGradient', colors: ['#4ADE80', '#15803D'], bgColor: '#DCFCE7' };
      case 'meal':
      default:
        return { id: 'orangeGradient', colors: ['#F59E0B', '#EA580C'], bgColor: '#FFF7ED' };
    }
  };

  const getChallengeEmoji = () => {
    if (!challenge) return '🍽️';
    if (challenge.title.includes('Exercise')) return '🏃';
    if (challenge.title.includes('Fruit')) return '🍎';
    return '🍽️';
  };

  const getChallengeLogLabel = () => {
    if (!challenge) return 'Logs';
    switch (challenge.challenge_type) {
      case 'exercise':
        return 'Workouts logged';
      case 'fruit':
        return 'Fruits logged';
      case 'meal':
      default:
        return 'Meals logged';
    }
  };

  const getTodaySectionTitle = () => {
    if (!challenge) return "Today's log";
    switch (challenge.challenge_type) {
      case 'exercise':
        return "Today's workout";
      case 'fruit':
        return "Today's fruit";
      case 'meal':
      default:
        return "Today's meals";
    }
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
    if (!mealType) return '';
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
    if (!activityType) return '';
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
      return log.fruit_name || 'Fruit';
    }
    return 'Log';
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
  const { days: calendarDays, startDayOfWeek } = getCalendarDays();
  const recentLogs = challengeLogs.slice(0, 3);
  const gradient = getChallengeGradient(challenge?.challenge_type);

  return (
    <div className="challenge-detail-page">
      {/* Header */}
      <div className="challenge-detail-header">
        <button className="back-button" onClick={() => navigate('/challenges')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="header-title">{getChallengeEmoji()} {challenge.title}</div>
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
              stroke={gradient.bgColor}
              strokeWidth="10"
            />
            <circle
              cx="70"
              cy="70"
              r="62"
              fill="none"
              stroke={`url(#${gradient.id})`}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 62}`}
              strokeDashoffset={`${2 * Math.PI * 62 * (1 - progress.percentage / 100)}`}
              transform="rotate(-90 70 70)"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
            <defs>
              <linearGradient id={gradient.id} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={gradient.colors[0]} />
                <stop offset="100%" stopColor={gradient.colors[1]} />
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
            <div className="stat-value">{challengeLogs.length}</div>
            <div className="stat-label">{getChallengeLogLabel()}</div>
          </div>
        </div>

        {/* Today's Logs Section */}
        <div className="todays-meals-section">
          <div className="section-title">{getTodaySectionTitle()}</div>

          {challenge.challenge_type === 'meal' ? (
            // 3-meal grid for meal challenges
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
          ) : (
            // Single log card for exercise/fruit challenges
            <div className="single-log-card" onClick={() => !todayLogs.log && navigate(`/challenge/${id}/log`)}>
              <div className="single-log-icon">
                {getChallengeEmoji()}
              </div>
              <div className="single-log-content">
                <div className="single-log-title">
                  {challenge.challenge_type === 'exercise' ? "Today's workout" : "Today's fruit"}
                </div>
                <div className="single-log-subtitle">
                  {todayLogs.log ? `Logged at ${formatLogTime(todayLogs.log.log_time)}` : 'Not logged yet'}
                </div>
              </div>
              {todayLogs.log ? (
                <div className="single-log-checkmark">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                </div>
              ) : (
                <div className="single-log-empty">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="2 2"/>
                  </svg>
                </div>
              )}
            </div>
          )}
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
                <span className="legend-dot partial"></span>not done
              </span>
            </div>
          </div>

          {/* Day headers */}
          <div className="calendar-day-headers">
            <div className="calendar-day-header">S</div>
            <div className="calendar-day-header">M</div>
            <div className="calendar-day-header">T</div>
            <div className="calendar-day-header">W</div>
            <div className="calendar-day-header">T</div>
            <div className="calendar-day-header">F</div>
            <div className="calendar-day-header">S</div>
          </div>

          <div className="calendar-grid">
            {/* Add empty cells for days before the start day */}
            {Array.from({ length: startDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="calendar-day empty"></div>
            ))}

            {/* Render actual challenge days */}
            {calendarDays.map((dayData) => {
              const isInStreak = progress.streakDates.includes(dayData.date);

              return (
                <div
                  key={dayData.day}
                  className={`calendar-day ${dayData.isToday && dayData.allMealsLogged ? 'today' : ''} ${dayData.allMealsLogged && !dayData.isToday ? 'done' : ''} ${dayData.someMealsLogged && !dayData.allMealsLogged ? 'partial' : ''} ${dayData.isFuture ? 'future' : ''}`}
                >
                  <span className="day-number">{dayData.day}</span>

                  {/* Show fire emoji ONLY if today AND all 3 meals logged */}
                  {dayData.isToday && dayData.allMealsLogged && (
                    <span className="today-emoji">🔥</span>
                  )}

                  {/* Show X/3 for today if not all meals logged */}
                  {dayData.isToday && !dayData.allMealsLogged && dayData.someMealsLogged && (
                    <span className="partial-indicator">{dayData.mealsCount}/3</span>
                  )}

                  {/* Show fire emoji for days in current streak, checkmark for other completed days */}
                  {!dayData.isToday && dayData.allMealsLogged && (
                    isInStreak ? (
                      <span className="streak-emoji">🔥</span>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5"/>
                      </svg>
                    )
                  )}

                  {/* Show X/3 for partial non-today days */}
                  {!dayData.isToday && !dayData.isFuture && dayData.someMealsLogged && !dayData.allMealsLogged && (
                    <span className="partial-indicator">{dayData.mealsCount}/3</span>
                  )}
                </div>
              );
            })}
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
                  onClick={() => navigate(`/challenge/${id}/log-detail/${log.id}`)}
                >
                  {log.photo_url && (
                    <img src={log.photo_url} alt={log.meal_name} className="log-photo" />
                  )}
                  <div className="log-content">
                    <div className="log-title">
                      {getLogEmoji(log)} {getLogLabel(log)}
                    </div>
                    <div className="log-meta">
                      {formatLogDate(log.log_date)}, {formatLogTime(log.log_time)}
                    </div>
                  </div>
                </div>
              ))}
              {challengeLogs.length > 3 && (
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
