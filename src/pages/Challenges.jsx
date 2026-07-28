import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import '../styles/Challenges.css';

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*, meal_logs(id)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate progress for each challenge
      const challengesWithProgress = data?.map(challenge => {
        const startDate = new Date(challenge.start_date);
        const today = new Date();
        const diffTime = today.getTime() - startDate.getTime();
        const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const currentDay = Math.min(daysPassed, challenge.duration_days);
        const logsCount = challenge.meal_logs?.length || 0;

        // Calculate streak (simplified - counts consecutive days with logs)
        const streak = currentDay; // TODO: Implement actual streak logic

        return {
          ...challenge,
          currentDay,
          percentage: Math.round((currentDay / challenge.duration_days) * 100),
          logsCount,
          streak
        };
      }) || [];

      setChallenges(challengesWithProgress);
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="challenges-page">
      {/* Header */}
      <div className="challenges-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="header-text">
          <div className="header-title">Challenges</div>
          <div className="header-subtitle">{challenges.length} active</div>
        </div>
      </div>

      <div className="challenges-content">
        {challenges.length === 0 ? (
          <div className="empty-state">
            <div className="empty-emoji">🔥</div>
            <div className="empty-title">No Active Challenges</div>
            <div className="empty-subtitle">More challenges will show up here 💙</div>
          </div>
        ) : (
          <>
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="challenge-card-large"
                onClick={() => navigate(`/challenge/${challenge.id}`)}
              >
                <svg className="challenge-card-bg-icon" width="130" height="130" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2c1 3-1 4.5-2 6-1.3 2-1 4 .5 5 .3-1.4 1-2 1-2 .6 1.4 2.5 2 2.5 4.2A5 5 0 0 1 9 20a6 6 0 0 1-3-11c1.3.4 1.5 1.3 1.5 1.3C6.8 7 8.5 4 12 2Z"/>
                </svg>

                <div className="challenge-card-header">
                  <div className="challenge-badge">🔥 Active</div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 6 6 6-6 6"/>
                  </svg>
                </div>

                <div className="challenge-card-main">
                  <div className="challenge-card-title">{challenge.title}</div>
                  <div className="challenge-card-subtitle">
                    {challenge.duration_days} days · {challenge.description}
                  </div>
                </div>

                <div className="challenge-progress-bar">
                  <div className="challenge-progress-fill" style={{ width: `${challenge.percentage}%` }}></div>
                </div>

                <div className="challenge-card-stats">
                  <div className="challenge-stat-text">
                    Day {challenge.currentDay} of {challenge.duration_days}
                  </div>
                  <div className="challenge-streak-text">
                    🔥 {challenge.streak} day streak
                  </div>
                </div>

                <div className="challenge-card-footer">
                  <img
                    src={`/${challenge.participant_name.toLowerCase()}.png`}
                    alt={challenge.participant_name}
                    className="challenge-avatar"
                  />
                  <span className="challenge-participant">
                    {challenge.participant_name} · started {formatStartDate(challenge.start_date)}
                  </span>
                </div>
              </div>
            ))}

            <div className="challenges-footer-text">
              More challenges will show up here 💙
            </div>
          </>
        )}
      </div>
    </div>
  );
}
