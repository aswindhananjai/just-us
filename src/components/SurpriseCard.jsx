import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { incrementViewCount } from '../utils/thoughts';
import '../styles/SurpriseCard.css';

export default function SurpriseCard({ thought, onClose }) {
  const navigate = useNavigate();
  const [cardFlipped, setCardFlipped] = useState(false);
  const [hasIncrementedView, setHasIncrementedView] = useState(false);

  const handleCardClick = async () => {
    // Toggle flip state
    const willFlip = !cardFlipped;
    setCardFlipped(willFlip);

    // Increment view count only once when revealed for the first time
    if (willFlip && !hasIncrementedView && thought?.id) {
      await incrementViewCount(thought.id);
      setHasIncrementedView(true);
    }
  };

  const handleManageClick = (e) => {
    e.stopPropagation();
    navigate('/manage-thoughts');
  };

  const handleCloseClick = (e) => {
    e.stopPropagation();
    onClose();
  };

  if (!thought) return null;

  return (
    <div className="surprise-overlay">
      {/* Close button */}
      <button className="surprise-close-button" onClick={handleCloseClick}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>

      {/* Flip card container */}
      <div className="surprise-card-container" onClick={handleCardClick}>
        <div className={`surprise-card-flip ${cardFlipped ? 'flipped' : ''}`}>
          {/* Front face (face down) */}
          <div className="surprise-card-face surprise-card-front">
            <div className="surprise-card-emoji">💌</div>
            <div className="surprise-card-title">
              A surprise from {thought.created_by}
            </div>
            <div className="surprise-card-subtitle">
              Tap to reveal ✨
            </div>
          </div>

          {/* Back face (revealed) */}
          <div className="surprise-card-face surprise-card-back">
            <div className="surprise-card-message">
              {thought.message}
            </div>
            <div className="surprise-card-author">
              — {thought.created_by} 💙
            </div>
            <div className="surprise-card-hint">
              tap to hide
            </div>
          </div>
        </div>
      </div>

      {/* Manage thoughts button */}
      <button className="surprise-manage-button" onClick={handleManageClick}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/>
        </svg>
        Manage my thoughts
      </button>
    </div>
  );
}
