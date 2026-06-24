import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/auth';
import {
  getAllMyThoughts,
  createThought,
  updateThought,
  deleteThought,
  validateWordCount
} from '../utils/thoughts';
import '../styles/ManageThoughts.css';

const THOUGHTS_PER_PAGE = 50;

export default function ManageThoughts() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const partnerName = currentUser === 'Aswin' ? 'Anu' : 'Aswin';

  const [allThoughts, setAllThoughts] = useState([]);
  const [displayedThoughts, setDisplayedThoughts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [newThought, setNewThought] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newThoughtError, setNewThoughtError] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editError, setEditError] = useState('');

  // Delete confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadThoughts();
  }, []);

  useEffect(() => {
    // Update displayed thoughts when page changes
    const startIndex = 0;
    const endIndex = currentPage * THOUGHTS_PER_PAGE;
    setDisplayedThoughts(allThoughts.slice(startIndex, endIndex));
    setHasMore(endIndex < allThoughts.length);
  }, [currentPage, allThoughts]);

  async function loadThoughts() {
    setLoading(true);
    const data = await getAllMyThoughts();
    setAllThoughts(data);
    setDisplayedThoughts(data.slice(0, THOUGHTS_PER_PAGE));
    setHasMore(data.length > THOUGHTS_PER_PAGE);
    setLoading(false);
  }

  function handleNewThoughtChange(e) {
    const text = e.target.value;
    setNewThought(text);

    // Validate only when exceeding limit
    const { count, isValid } = validateWordCount(text);
    if (!isValid) {
      setNewThoughtError(`Maximum 75 words allowed (currently ${count} words)`);
    } else {
      setNewThoughtError('');
    }
  }

  function handleEditTextChange(e) {
    const text = e.target.value;
    setEditText(text);

    // Validate only when exceeding limit
    const { count, isValid } = validateWordCount(text);
    if (!isValid) {
      setEditError(`Maximum 75 words allowed (currently ${count} words)`);
    } else {
      setEditError('');
    }
  }

  async function handleAddThought() {
    if (!newThought.trim()) return;

    const { isValid } = validateWordCount(newThought);
    if (!isValid) {
      return;
    }

    setSaving(true);
    try {
      await createThought(newThought);
      setNewThought('');
      setNewThoughtError('');
      await loadThoughts();
      // Reset to first page to show the newly added thought
      setCurrentPage(1);
    } catch (error) {
      alert(error.message || 'Failed to save thought');
    } finally {
      setSaving(false);
    }
  }

  function handleEditClick(thought) {
    setEditingId(thought.id);
    setEditText(thought.message);
    setEditError('');
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditText('');
    setEditError('');
  }

  async function handleSaveEdit(id) {
    const { isValid } = validateWordCount(editText);
    if (!isValid) {
      return;
    }

    try {
      await updateThought(id, editText);
      setEditingId(null);
      setEditText('');
      setEditError('');
      await loadThoughts();
    } catch (error) {
      alert(error.message || 'Failed to update thought');
    }
  }

  function handleDeleteClick(id) {
    setDeletingId(id);
    setShowDeleteModal(true);
  }

  async function handleDeleteConfirm() {
    if (!deletingId) return;

    setIsDeleting(true);
    try {
      await deleteThought(deletingId);
      await loadThoughts();
      setShowDeleteModal(false);
      setDeletingId(null);
    } catch (error) {
      alert('Failed to delete thought');
    } finally {
      setIsDeleting(false);
    }
  }

  function handleLoadMore() {
    setCurrentPage(prev => prev + 1);
  }

  return (
    <div className="manage-thoughts-page">
      {/* Header */}
      <div className="manage-thoughts-header">
        <button className="back-btn" onClick={() => navigate('/settings')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="header-info">
          <h1 className="header-title">My thoughts</h1>
          <div className="header-subtitle">saved for {partnerName} 💙</div>
        </div>
      </div>

      {/* Add new thought section */}
      <div className="add-thought-section">
        <textarea
          className={`add-thought-textarea ${newThoughtError ? 'error' : ''}`}
          placeholder="Write a sweet thought for your partner..."
          value={newThought}
          onChange={handleNewThoughtChange}
          rows="3"
          maxLength="500"
        />
        {newThoughtError && (
          <div className="error-message">{newThoughtError}</div>
        )}
        <div className="add-thought-footer">
          <button
            className="add-thought-button"
            onClick={handleAddThought}
            disabled={!newThought.trim() || !!newThoughtError || saving}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            {saving ? 'Saving...' : 'Add thought'}
          </button>
        </div>
      </div>

      {/* Thoughts list */}
      <div className="thoughts-list-container">
        {loading ? (
          <div className="thoughts-loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            {allThoughts.length > 0 && (
              <div className="thoughts-list-header">
                Your saved thoughts ({allThoughts.length})
              </div>
            )}

            {allThoughts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💭</div>
                <div className="empty-text">No thoughts yet</div>
                <div className="empty-subtext">Add your first sweet thought for {partnerName}</div>
              </div>
            ) : (
              <>
                {displayedThoughts.map((thought) => {
                  const isEditing = editingId === thought.id;

                  return (
                    <div
                      key={thought.id}
                      className={`thought-item ${isEditing ? 'editing' : ''}`}
                    >
                      {isEditing ? (
                        <>
                          <textarea
                            className={`edit-thought-textarea ${editError ? 'error' : ''}`}
                            value={editText}
                            onChange={handleEditTextChange}
                            rows="4"
                            maxLength="500"
                            autoFocus
                          />
                          {editError && (
                            <div className="error-message">{editError}</div>
                          )}
                          <div className="edit-thought-actions">
                            <button
                              className="cancel-edit-button"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </button>
                            <button
                              className="save-edit-button"
                              onClick={() => handleSaveEdit(thought.id)}
                              disabled={!!editError}
                            >
                              Save
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="thought-message">{thought.message}</div>
                          <div className="thought-actions">
                            <button
                              className="edit-thought-button"
                              onClick={() => handleEditClick(thought)}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9"/>
                                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/>
                              </svg>
                            </button>
                            <button
                              className="delete-thought-button"
                              onClick={() => handleDeleteClick(thought.id)}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18M8 6V4.5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2V6m2 0v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                              </svg>
                            </button>
                          </div>

                          {/* Reply thread */}
                          {thought.reply && (
                            <div className="thought-reply-thread">
                              <div className="thought-reply-connector"></div>
                              <div className="thought-reply-bubble">
                                <div className="thought-reply-author">{partnerName} replied</div>
                                <div className="thought-reply-message">{thought.reply}</div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}

                {hasMore && (
                  <div className="load-more-container">
                    <button
                      className="load-more-button"
                      onClick={handleLoadMore}
                    >
                      Load more thoughts
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="delete-modal-overlay" onClick={() => !isDeleting && setShowDeleteModal(false)}>
          <div className="delete-modal" onClick={e => e.stopPropagation()}>
            <div className="delete-modal-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E0556F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <h3 className="delete-modal-title">Delete thought?</h3>
            <p className="delete-modal-msg">This thought will be permanently deleted and cannot be recovered.</p>
            <div className="delete-modal-actions">
              <button
                className="delete-modal-cancel"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="delete-modal-confirm"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
