import { useState, useEffect } from 'react';
import { validateWordCount } from '../utils/thoughts';
import '../styles/ReplyBottomSheet.css';

export default function ReplyBottomSheet({ thought, onClose, onSave }) {
  const [replyText, setReplyText] = useState('');
  const [replyError, setReplyError] = useState('');
  const [saving, setSaving] = useState(false);

  const hasExistingReply = Boolean(thought?.reply);

  useEffect(() => {
    // Prefill with existing reply if available
    if (thought?.reply) {
      setReplyText(thought.reply);
    }
  }, [thought]);

  const handleReplyChange = (e) => {
    const text = e.target.value;
    setReplyText(text);

    // Validate only when exceeding limit
    const { count, isValid } = validateWordCount(text);
    if (!isValid) {
      setReplyError(`Maximum 75 words allowed (currently ${count} words)`);
    } else {
      setReplyError('');
    }
  };

  const handleSave = async () => {
    if (!replyText.trim()) return;

    const { isValid } = validateWordCount(replyText);
    if (!isValid) {
      return;
    }

    setSaving(true);
    try {
      await onSave(replyText);
      onClose();
    } catch (error) {
      alert(error.message || 'Failed to save reply');
    } finally {
      setSaving(false);
    }
  };

  if (!thought) return null;

  return (
    <div className="reply-bottom-sheet-overlay" onClick={() => !saving && onClose()}>
      <div className="reply-bottom-sheet" onClick={e => e.stopPropagation()}>
        <div className="reply-sheet-header">
          <h3 className="reply-sheet-title">{hasExistingReply ? 'Edit your reply' : 'Reply to thought'}</h3>
          <button className="reply-sheet-close" onClick={onClose} disabled={saving}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Original thought */}
        <div className="reply-original-thought">
          <div className="reply-thought-label">Thought from {thought.created_by}</div>
          <div className="reply-thought-message">{thought.message}</div>
        </div>

        {/* Reply textarea */}
        <div className="reply-input-section">
          <label className="reply-input-label">Your reply</label>
          <textarea
            className={`reply-textarea ${replyError ? 'error' : ''}`}
            value={replyText}
            onChange={handleReplyChange}
            placeholder="Write your reply..."
            rows="4"
            maxLength="500"
            disabled={saving}
            autoFocus
          />
          {replyError && (
            <div className="reply-error-message">{replyError}</div>
          )}
        </div>

        <button
          className="reply-save-button"
          onClick={handleSave}
          disabled={saving || !replyText.trim() || !!replyError}
        >
          {saving ? 'Saving...' : hasExistingReply ? 'Update reply' : 'Send reply'}
        </button>
      </div>
    </div>
  );
}
