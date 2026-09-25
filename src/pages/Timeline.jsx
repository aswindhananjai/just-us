import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { MEMORY_CATEGORIES } from '../utils/constants';
import { getCurrentUser, getUserData } from '../utils/auth';
import { getUnreadActivityCount } from '../utils/activities';
import BottomNav from '../components/BottomNav';
import FloatingActionButton from '../components/FloatingActionButton';
import '../styles/Timeline.css';

export default function Timeline() {
  const [memories, setMemories] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupedMemories, setGroupedMemories] = useState({});
  const [relationshipStartDate, setRelationshipStartDate] = useState('2026-05-21');
  const [profilePictures, setProfilePictures] = useState({});
  const [unreadActivityCount, setUnreadActivityCount] = useState(0);
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const partnerName = currentUser === 'Aswin' ? 'Anu' : 'Aswin';

  // Days counter easter egg state
  const [daysTapCount, setDaysTapCount] = useState(0);
  const [daysTapLastTime, setDaysTapLastTime] = useState(0);
  const [showDaysOverlay, setShowDaysOverlay] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(0);

  // Get profile picture from state
  const getProfilePicture = (user) => {
    return profilePictures[user] || `/${user.toLowerCase()}.png`;
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update seconds counter every second when overlay is visible
  useEffect(() => {
    if (!showDaysOverlay) return;

    // Calculate initial seconds
    const start = new Date(relationshipStartDate);
    const updateSeconds = () => {
      const now = new Date();
      const diffTime = now.getTime() - start.getTime();
      const totalSeconds = Math.floor(diffTime / 1000);
      setCurrentSeconds(totalSeconds);
    };

    // Update immediately
    updateSeconds();

    // Then update every second
    const interval = setInterval(updateSeconds, 1000);

    return () => clearInterval(interval);
  }, [showDaysOverlay, relationshipStartDate]);

  const fetchData = async () => {
    try {
      // Fetch active memories only (soft delete filter)
      const { data: memoriesData, error: memoriesError } = await supabase
        .from('memories')
        .select('*')
        .eq('is_active', true)
        .order('date', { ascending: false })
        .order('sort_order', { ascending: true });

      if (memoriesError) throw memoriesError;

      setMemories(memoriesData || []);

      // Group memories by year
      const grouped = (memoriesData || []).reduce((acc, memory) => {
        const year = new Date(memory.date).getFullYear();
        if (!acc[year]) acc[year] = [];
        acc[year].push(memory);
        return acc;
      }, {});

      setGroupedMemories(grouped);

      // Fetch active challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from('challenges')
        .select('*, challenge_logs(log_type, log_date)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (!challengesError) {
        setChallenges(challengesData || []);
      }

      // Fetch relationship start date
      const { data: configData } = await supabase
        .from('relationship_config')
        .select('start_date')
        .single();

      if (configData) {
        setRelationshipStartDate(configData.start_date);
      }

      // Fetch profile pictures and unread count
      const [currentUserData, partnerData, unreadCount] = await Promise.all([
        getUserData(currentUser),
        getUserData(partnerName),
        getUnreadActivityCount()
      ]);

      setProfilePictures({
        [currentUser]: currentUserData?.profile_picture_url || `/${currentUser.toLowerCase()}.png`,
        [partnerName]: partnerData?.profile_picture_url || `/${partnerName.toLowerCase()}.png`
      });
      setUnreadActivityCount(unreadCount);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryInfo = (categoryId) => {
    return MEMORY_CATEGORIES.find(c => c.id === categoryId) || MEMORY_CATEGORIES[0];
  };

  const calculateDaysTogether = () => {
    const start = new Date(relationshipStartDate);
    const now = new Date();
    const diffTime = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const calculateTotalSeconds = () => {
    const start = new Date(relationshipStartDate);
    const now = new Date();
    const diffTime = now.getTime() - start.getTime();
    const totalSeconds = Math.floor(diffTime / 1000);
    return totalSeconds.toLocaleString();
  };

  const handleDaysTap = () => {
    const now = Date.now();
    const newCount = now - daysTapLastTime > 2000 ? 1 : daysTapCount + 1;

    if (newCount >= 5) {
      setDaysTapCount(0);
      setDaysTapLastTime(now);
      setShowDaysOverlay(true);
    } else {
      setDaysTapCount(newCount);
      setDaysTapLastTime(now);
    }
  };

  const closeDaysOverlay = () => {
    setShowDaysOverlay(false);
  };

  const formatRelationshipDate = () => {
    const date = new Date(relationshipStartDate);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata'
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getFirstImageUrl = (imageUrlString) => {
    if (!imageUrlString) return null;
    try {
      if (imageUrlString.startsWith('[')) {
        const arr = JSON.parse(imageUrlString);
        return arr.length > 0 ? arr[0] : null;
      }
      return imageUrlString;
    } catch (e) {
      return imageUrlString;
    }
  };

  const calculateChallengeProgress = (challenge) => {
    // Parse date string correctly to avoid timezone issues
    const [year, month, day] = challenge.start_date.split('-').map(Number);
    const startDate = new Date(year, month - 1, day);
    startDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - startDate.getTime();
    const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const currentDay = Math.max(1, Math.min(daysPassed, challenge.duration_days));

    // Calculate completed days based on challenge type
    let completedDays = 0;

    // Group logs by date
    const logsByDate = (challenge.challenge_logs || []).reduce((acc, log) => {
      if (!acc[log.log_date]) acc[log.log_date] = [];
      acc[log.log_date].push(log.log_type);
      return acc;
    }, {});

    // Count completed days
    for (let i = 0; i < currentDay; i++) {
      const checkDate = new Date(startDate);
      checkDate.setDate(startDate.getDate() + i);
      const dateStr = checkDate.toISOString().split('T')[0];

      const logsForDay = logsByDate[dateStr] || [];

      let dayComplete = false;
      if (challenge.challenge_type === 'meal') {
        // Need all 3 meals for meal challenge
        dayComplete = logsForDay.length >= 3;
      } else {
        // Just need 1 log for exercise/fruit
        dayComplete = logsForDay.length > 0;
      }

      if (dayComplete) {
        completedDays++;
      }
    }

    return {
      currentDay,
      totalDays: challenge.duration_days,
      percentage: Math.round((completedDays / challenge.duration_days) * 100)
    };
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  const years = Object.keys(groupedMemories).sort((a, b) => b - a);

  return (
    <div className="timeline-page">
      {/* Gradient Hero */}
      <div className="gradient-hero">
        {/* Floating decorative icons */}
        <svg className="float-icon float-heart" width="38" height="38" viewBox="0 0 24 24" fill="none">
          <path d="M12 21s-7.5-4.6-7.5-10A4.5 4.5 0 0 1 12 7.6 4.5 4.5 0 0 1 19.5 11c0 5.4-7.5 10-7.5 10Z" fill="currentColor" />
        </svg>
        <svg className="float-icon float-heart-small" width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M12 21s-7.5-4.6-7.5-10A4.5 4.5 0 0 1 12 7.6 4.5 4.5 0 0 1 19.5 11c0 5.4-7.5 10-7.5 10Z" fill="currentColor" />
        </svg>

        {/* Stethoscope icon */}
        <svg className="float-icon float-stethoscope" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
          <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
          <circle cx="20" cy="10" r="2" />
        </svg>

        {/* Car icon */}
        <svg className="float-icon float-car" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <path d="M9 17h6" />
          <circle cx="17" cy="17" r="2" />
        </svg>

        {/* Travel suitcase icon */}
        <svg className="float-icon float-suitcase" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M3 12h18" />
          <path d="M8 12v7" />
          <path d="M16 12v7" />
        </svg>

        {/* Movie clapperboard icon */}
        <svg className="float-icon float-movie" width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z" />
          <path d="m6.2 5.3 3.1 3.9" />
          <path d="m12.4 3.4 3.1 4" />
          <path d="m3 11 18.5-5.6c1 -.3 2 .4 2 1.5V21a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-9c0-.6.4-1 1-1Z" />
        </svg>

        {/* Music note icon */}
        <svg className="float-icon float-music" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>

        {/* Duo photos - rotated */}
        <div className="duo-photos">
          <div className="photo-frame left">
            <img src={getProfilePicture(partnerName)} alt={partnerName} />
          </div>
          <div className="heart-divider">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 21s-7.5-4.6-7.5-10A4.5 4.5 0 0 1 12 7.6 4.5 4.5 0 0 1 19.5 11c0 5.4-7.5 10-7.5 10Z" fill="#FF7A93" />
            </svg>
          </div>
          <div className="photo-frame right">
            <img src={getProfilePicture(currentUser)} alt={currentUser} />
          </div>
        </div>

        {/* Counter */}
        <div className="days-counter" onClick={handleDaysTap} style={{ cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
          <div className="days-number-large">{calculateDaysTogether()}</div>
          <div className="days-label-upper">days together</div>
          <div className="relationship-meta">{partnerName} & {currentUser} · since {formatRelationshipDate()}</div>
        </div>
      </div>

      {/* Days counter easter egg overlay */}
      {showDaysOverlay && (
        <div className="days-overlay">
          <div className="days-overlay-confetti">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={`confetti-piece ${i % 3 === 0 ? 'circle' : 'rect'}`}
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.7}s`,
                  animationDuration: `${2.5 + Math.random() * 0.5}s`,
                  background: ['#FFD166', '#2D6FE0', '#FF7A93', '#06D6A0', '#B5838D'][Math.floor(Math.random() * 5)]
                }}
              />
            ))}
          </div>
          <button className="days-overlay-close" onClick={closeDaysOverlay}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6l12 12M18 6 6 18"/>
            </svg>
          </button>
          <div className="days-overlay-card">
            <div className="days-overlay-label">together for</div>
            <div className="days-overlay-number">{calculateDaysTogether()}</div>
            <div className="days-overlay-unit">days</div>
            <div className="days-overlay-divider"></div>
            <div className="days-overlay-sublabel">that's</div>
            <div className="days-overlay-seconds">{currentSeconds.toLocaleString()}</div>
            <div className="days-overlay-seconds-label">seconds ↑</div>
            <div className="days-overlay-message">Still my favourite person ❤️</div>
          </div>
        </div>
      )}

      {/* For You Section - Bento Box Layout */}
      <div className="for-you-section">
        <h2 className="for-you-title">For you</h2>

        <div className="bento-grid">
          {/* First Memory - Full Width */}
          {memories.length > 0 && (() => {
            const memory = memories[0];
            const categoryIds = memory.category ? memory.category.split(',').filter(Boolean) : ['first'];
            const categories = categoryIds.map(id => getCategoryInfo(id));
            const displayCategory = categories.find(c => c.id !== 'first') || categories[0];
            const previewUrl = getFirstImageUrl(memory.image_url);

            return (
              <div
                key={memory.id}
                className="bento-item bento-memory-large"
                onClick={() => navigate(`/memory/${memory.id}`, { state: { from: '/' } })}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt={memory.title} className="bento-memory-img" />
                ) : (
                  <div className="bento-memory-default-bg" style={{ background: `linear-gradient(145deg, ${displayCategory.color} 0%, ${displayCategory.color}dd 100%)` }}>
                    <span className="bento-memory-emoji">{displayCategory.emoji}</span>
                  </div>
                )}
                <div className="bento-memory-gradient"></div>
                <div className="bento-memory-badge" style={{ background: 'rgba(255,255,255,0.92)', color: displayCategory.textColor }}>
                  <span>{displayCategory.icon}</span> {displayCategory.name}
                </div>
                <div className="bento-memory-content">
                  <div className="bento-memory-title">{memory.title}</div>
                  <div className="bento-memory-meta">
                    {formatDate(memory.date)}
                    {memory.created_by && <span> · added by {memory.created_by}</span>}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Challenge Card - Left */}
          {challenges.length > 0 && (() => {
            const challenge = challenges[0];
            const progress = calculateChallengeProgress(challenge);

            return (
              <div
                key={challenge.id}
                className="bento-item bento-challenge"
                onClick={() => navigate('/challenges')}
              >
                <svg className="bento-challenge-bg-icon" width="130" height="130" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2c1 3-1 4.5-2 6-1.3 2-1 4 .5 5 .3-1.4 1-2 1-2 .6 1.4 2.5 2 2.5 4.2A5 5 0 0 1 9 20a6 6 0 0 1-3-11c1.3.4 1.5 1.3 1.5 1.3C6.8 7 8.5 4 12 2Z"/>
                </svg>
                <div className="bento-challenge-badge">🔥 Challenges</div>
                <div className="bento-challenge-content">
                  <div className="bento-challenge-title">{challenge.title}</div>
                  <div className="bento-challenge-subtitle">
                    Day {progress.currentDay} of {challenge.duration_days}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Memories Count Card - Right */}
          <div
            className="bento-item bento-memories-count"
            onClick={() => navigate('/memories')}
          >
            <div className="bento-memories-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2D6FE0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="8" y="3" width="13" height="13" rx="2.5"/>
                <rect x="3" y="8" width="13" height="13" rx="2.5" fill="#fff"/>
                <circle cx="6.7" cy="11.6" r="1.1"/>
                <path d="M3.4 19.5 6.8 16a1.4 1.4 0 0 1 1.9 0l2.9 2.6"/>
              </svg>
            </div>
            <div className="bento-memories-content">
              <div className="bento-memories-number">{memories.length} memories</div>
              <div className="bento-memories-link">See all →</div>
            </div>
          </div>

          {/* Second Memory - Full Width */}
          {memories.length > 1 && (() => {
            const memory = memories[1];
            const categoryIds = memory.category ? memory.category.split(',').filter(Boolean) : ['first'];
            const categories = categoryIds.map(id => getCategoryInfo(id));
            const displayCategory = categories.find(c => c.id !== 'first') || categories[0];
            const previewUrl = getFirstImageUrl(memory.image_url);

            return (
              <div
                key={memory.id}
                className="bento-item bento-memory-medium"
                onClick={() => navigate(`/memory/${memory.id}`, { state: { from: '/' } })}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt={memory.title} className="bento-memory-img" />
                ) : (
                  <div className="bento-memory-default-bg" style={{ background: `linear-gradient(145deg, ${displayCategory.color} 0%, ${displayCategory.color}dd 100%)` }}>
                    <span className="bento-memory-emoji">{displayCategory.emoji}</span>
                  </div>
                )}
                <div className="bento-memory-gradient"></div>
                <div className="bento-memory-badge" style={{ background: 'rgba(255,255,255,0.94)', color: displayCategory.textColor }}>
                  <span>{displayCategory.icon}</span> {displayCategory.name}
                </div>
                <div className="bento-memory-content">
                  <div className="bento-memory-title-small">{memory.title}</div>
                  <div className="bento-memory-meta-small">
                    {formatDate(memory.date)}
                    {memory.created_by && <span> · added by {memory.created_by}</span>}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Bottom navigation - always 3 items: Memories | + | Settings */}
      <div className="bottom-nav-timeline">
        <button className="nav-item-timeline active" onClick={() => navigate('/')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
          <span>Memories</span>
        </button>

        {/* Center FAB */}
        <button className="nav-fab" onClick={() => navigate('/add')}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14 M5 12h14" />
          </svg>
        </button>

        <button className="nav-item-timeline inactive" onClick={() => navigate('/settings')}>
          <div className="nav-icon-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
            </svg>
            {unreadActivityCount > 0 && <div className="notification-dot"></div>}
          </div>
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
}
