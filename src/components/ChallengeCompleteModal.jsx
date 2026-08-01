import { useEffect, useState } from 'react';
import '../styles/ChallengeCompleteModal.css';

export default function ChallengeCompleteModal({ isOpen, onClose, challengeTitle }) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Delay content animation slightly after modal opens
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="challenge-complete-overlay">
      <div className={`challenge-complete-modal ${showContent ? 'show' : ''}`}>
        {/* Confetti elements */}
        <div className="confetti-container">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random() * 1}s`,
                backgroundColor: ['#F59E0B', '#EA580C', '#FF7A93', '#3B82F6', '#2D6FE0'][Math.floor(Math.random() * 5)]
              }}
            />
          ))}
        </div>

        {/* Success Icon */}
        <div className="success-icon">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <path d="M22 4 12 14.01l-3-3"/>
          </svg>
        </div>

        {/* Title */}
        <h2 className="complete-title">Challenge Complete!</h2>
        <p className="complete-subtitle">
          Congratulations on completing the<br />
          <strong>{challengeTitle || '30-day meal challenge'}</strong>
        </p>

        {/* Prize Section */}
        <div className="prize-section">
          <div className="prize-header">You've earned</div>

          <div className="prize-image-container">
            <img
              src="/long-mirror.webp"
              alt="Long Mirror Prize"
              className="prize-image"
            />
          </div>

          <div className="prize-title">Long Mirror</div>
          <div className="prize-description">
            A beautiful long mirror to celebrate your achievement and reflect on your journey!
          </div>
        </div>

        {/* Actions */}
        <div className="complete-actions">
          <button className="complete-close-btn" onClick={onClose}>
            Continue
          </button>
        </div>

        {/* Decorative elements */}
        <div className="celebration-emoji">🎉</div>
        <div className="celebration-emoji celebration-emoji-2">🎊</div>
        <div className="celebration-emoji celebration-emoji-3">✨</div>
      </div>
    </div>
  );
}
