import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import '../styles/Challenges.css';

export default function Challenges() {
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'completed'
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      // Fetch all challenges
      const { data, error } = await supabase
        .from('challenges')
        .select('*, challenge_logs(meal_type, log_type, log_date)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate progress for each challenge
      const challengesWithProgress = data?.map(challenge => {
        // Parse date string correctly to avoid timezone issues
        const [year, month, day] = challenge.start_date.split('-').map(Number);
        const startDate = new Date(year, month - 1, day);
        startDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffTime = today.getTime() - startDate.getTime();
        const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const currentDay = Math.max(1, Math.min(daysPassed, challenge.duration_days));
        const logsCount = challenge.challenge_logs?.length || 0;

        // Calculate streak and completed days based on challenge type
        let streak = 0;
        let completedDays = 0;

        // Group logs by date
        const logsByDate = (challenge.challenge_logs || []).reduce((acc, log) => {
          if (!acc[log.log_date]) acc[log.log_date] = [];
          if (challenge.challenge_type === 'meal') {
            acc[log.log_date].push(log.meal_type);
          } else {
            // For exercise and fruit, we just need one log per day
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
          ...challenge,
          currentDay,
          percentage: Math.round((completedDays / challenge.duration_days) * 100),
          logsCount,
          streak
        };
      }) || [];

      // Separate active and completed challenges
      const active = challengesWithProgress.filter(c => c.status === 'active');
      const completed = challengesWithProgress.filter(c => c.status === 'completed');

      setActiveChallenges(active);
      setCompletedChallenges(completed);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatStartDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDateRange = (startDate) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 29); // 30 days total (0-29)
    return `${start.getDate()} ${start.toLocaleDateString('en-US', { month: 'short' })} – ${end.getDate()} ${end.toLocaleDateString('en-US', { month: 'short' })} ${end.getFullYear()}`;
  };

  const getChallengeGradient = (challengeType) => {
    switch (challengeType) {
      case 'exercise':
        return 'linear-gradient(155deg, #4D8BF0 0%, #1B4FA8 100%)';
      case 'fruit':
        return 'linear-gradient(155deg, #4ADE80 0%, #15803D 100%)';
      case 'meal':
      default:
        return 'linear-gradient(155deg, #F59E0B 0%, #EA580C 100%)';
    }
  };

  const getChallengeEmoji = (challengeType, title) => {
    if (title) {
      if (title.includes('Exercise')) return '🏃';
      if (title.includes('Fruit')) return '🍎';
      if (title.includes('Meal')) return '🍽️';
    }
    switch (challengeType) {
      case 'exercise':
        return '🏃';
      case 'fruit':
        return '🍎';
      case 'meal':
      default:
        return '🍽️';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  const currentChallenges = activeTab === 'active' ? activeChallenges : completedChallenges;

  return (
    <div className="challenges-page">
      {/* Header */}
      <div className="challenges-header">
        <button className="back-button" onClick={() => navigate('/')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="header-text">
          <div className="header-title">Challenges</div>
          <div className="header-subtitle">{activeChallenges.length} active · {completedChallenges.length} completed</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="challenges-tabs">
        <button
          className={`tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active · {activeChallenges.length}
        </button>
        <button
          className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed · {completedChallenges.length}
        </button>
      </div>

      <div className="challenges-content">
        {currentChallenges.length === 0 ? (
          <div className="empty-state">
            <div className="empty-emoji">🔥</div>
            <div className="empty-title">No {activeTab === 'active' ? 'Active' : 'Completed'} Challenges</div>
            <div className="empty-subtitle">
              {activeTab === 'active' ? 'More challenges will show up here 💙' : 'Complete a challenge to see it here'}
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'active' ? (
              <>
                {currentChallenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="challenge-card-large"
                    style={{ background: getChallengeGradient(challenge.challenge_type) }}
                    onClick={() => navigate(`/challenge/${challenge.id}`)}
                  >
                    <div className="challenge-card-header">
                      <div className="challenge-badge">Starts tomorrow</div>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 6 6 6-6 6"/>
                      </svg>
                    </div>

                    <div className="challenge-card-main">
                      <div className="challenge-card-title">
                        {getChallengeEmoji(challenge.challenge_type, challenge.title)} {challenge.title}
                      </div>
                      <div className="challenge-card-subtitle">
                        {challenge.description}
                      </div>
                    </div>

                    <div className="challenge-progress-bar">
                      <div className="challenge-progress-fill" style={{ width: `${challenge.percentage}%` }}></div>
                    </div>

                    <div className="challenge-card-stats">
                      <div className="challenge-stat-text">
                        Day {challenge.currentDay} of {challenge.duration_days}
                      </div>
                      <div className="challenge-date-range">
                        {formatDateRange(challenge.start_date)}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                {currentChallenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="challenge-card-completed"
                    onClick={() => navigate(`/challenge/${challenge.id}`)}
                  >
                    <div className="completed-badge">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5"/>
                      </svg>
                      Completed
                    </div>
                    <div className="completed-title">
                      {getChallengeEmoji(challenge.challenge_type, challenge.title)} {challenge.title}
                    </div>
                    <div className="completed-subtitle">
                      {challenge.logsCount} logs · {formatDateRange(challenge.start_date)}
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
