import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { incrementViewCount, addReplyToThought } from '../utils/thoughts';
import { getCurrentUser } from '../utils/auth';
import ReplyBottomSheet from './ReplyBottomSheet';
import '../styles/SurpriseCard.css';

export default function SurpriseCard({ thought, onClose, onReplyAdded }) {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [cardFlipped, setCardFlipped] = useState(false);
  const [hasIncrementedView, setHasIncrementedView] = useState(false);
  const [showReplySheet, setShowReplySheet] = useState(false);
  const [localThought, setLocalThought] = useState(thought);

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

  const handleReplyClick = (e) => {
    e.stopPropagation();
    setShowReplySheet(true);
  };

  const handleSaveReply = async (replyText) => {
    await addReplyToThought(localThought.id, replyText);
    // Update local thought with new reply
    setLocalThought({
      ...localThought,
      reply: replyText,
      reply_at: new Date().toISOString()
    });
    if (onReplyAdded) {
      onReplyAdded();
    }
  };

  if (!thought) return null;

  const hasReply = Boolean(localThought.reply);

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
              {localThought.message}
            </div>
            <div className="surprise-card-author">
              — {localThought.created_by} 💙
            </div>
            <div className="surprise-card-hint">
              tap to hide
            </div>
            {/* Reply button */}
            <button className="surprise-reply-button" onClick={handleReplyClick}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
              {hasReply ? 'Edit reply' : 'Reply'}
            </button>
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

      {/* Reply bottom sheet */}
      {showReplySheet && (
        <ReplyBottomSheet
          thought={localThought}
          onClose={() => setShowReplySheet(false)}
          onSave={handleSaveReply}
        />
      )}
    </div>
  );
}
