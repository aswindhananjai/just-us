import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { MEMORY_CATEGORIES } from '../utils/constants';
import '../styles/AllMemories.css';

export default function AllMemories() {
  const [memories, setMemories] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return localStorage.getItem('all_memories_filter') || 'all';
  });
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [yearSpan, setYearSpan] = useState(0);

  // Custom draggable scroll handle states & refs
  const [activeYear, setActiveYear] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [draggedYear, setDraggedYear] = useState('');
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const trackRef = useRef(null);
  const isDraggingRef = useRef(false);
  
  const navigate = useNavigate();

  // Group current memories by year (descending)
  const grouped = memories.reduce((acc, memory) => {
    const year = new Date(memory.date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(memory);
    return acc;
  }, {});

  const sortedYears = Object.keys(grouped).sort((a, b) => b - a);

  // Track active year and scroll percentage on normal page scroll
  useEffect(() => {
    if (initialLoading || filtering || sortedYears.length === 0) return;

    const handlePageScroll = () => {
      // 1. Update active year based on visible year groups
      let currentActive = sortedYears[0] || '';
      for (const year of sortedYears) {
        const el = document.getElementById(`year-group-${year}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 250) {
            currentActive = year;
          }
        }
      }
      setActiveYear(currentActive);

      // 2. Sync scroll handle position if not currently dragging
      if (!isDraggingRef.current) {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
        setScrollPercentage(pct);
      }
    };

    window.addEventListener('scroll', handlePageScroll);
    handlePageScroll(); // run once initially

    return () => window.removeEventListener('scroll', handlePageScroll);
  }, [sortedYears, initialLoading, filtering]);

  const handlePointerDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);

    // Position the handle immediately to the click point on the track
    if (trackRef.current) {
      const rect = trackRef.current.getBoundingClientRect();
      let y = e.clientY - rect.top;
      let pct = y / rect.height;
      if (pct < 0) pct = 0;
      if (pct > 1) pct = 1;

      setScrollPercentage(pct);

      if (sortedYears.length > 0) {
        const idx = Math.min(
          Math.max(Math.round(pct * (sortedYears.length - 1)), 0),
          sortedYears.length - 1
        );
        const targetYear = sortedYears[idx];
        setDraggedYear(targetYear);
        setActiveYear(targetYear);

        const targetEl = document.getElementById(`year-group-${targetYear}`);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
      }
    }
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current || !trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    let y = e.clientY - rect.top;
    let pct = y / rect.height;
    if (pct < 0) pct = 0;
    if (pct > 1) pct = 1;

    setScrollPercentage(pct);

    if (sortedYears.length > 0) {
      const idx = Math.min(
        Math.max(Math.round(pct * (sortedYears.length - 1)), 0),
        sortedYears.length - 1
      );
      const targetYear = sortedYears[idx];
      setDraggedYear(targetYear);
      setActiveYear(targetYear);

      const targetEl = document.getElementById(`year-group-${targetYear}`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    }
  };

  const handlePointerUp = (e) => {
    if (isDraggingRef.current) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      isDraggingRef.current = false;
      setIsDragging(false);
    }
  };

  // Load stats and initial list of memories on mount
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        fetchStats(selectedCategory),
        fetchMemories(0, selectedCategory, true)
      ]);
      setInitialLoading(false);
    };
    loadInitialData();
  }, []);

  // Fetch count and year span dynamically from supabase
  const fetchStats = async (category) => {
    try {
      let query = supabase.from('memories').select('date');
      if (category !== 'all') {
        query = query.eq('category', category);
      }
      const { data, error } = await query;
      if (error) throw error;
      
      const count = data ? data.length : 0;
      setTotalCount(count);

      if (count > 0) {
        const years = data.map(d => new Date(d.date).getFullYear());
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);
        setYearSpan(maxYear - minYear + 1);
      } else {
        setYearSpan(0);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Fetch memories for a specific page and category
  const fetchMemories = async (pageNumber, category, isInitial = false) => {
    if (!isInitial) {
      setFetchingMore(true);
    }
    
    try {
      const from = pageNumber * 20;
      const to = (pageNumber + 1) * 20 - 1;
      
      let query = supabase
        .from('memories')
        .select('*')
        .order('date', { ascending: false });

      if (category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query.range(from, to);

      if (error) throw error;
      
      const newItems = data || [];
      
      if (isInitial) {
        setMemories(newItems);
      } else {
        setMemories(prev => {
          // Prevent duplicates by checking ID
          const existingIds = new Set(prev.map(item => item.id));
          const filteredNew = newItems.filter(item => !existingIds.has(item.id));
          return [...prev, ...filteredNew];
        });
      }
      
      // If we got fewer than 20 items, there are no more pages
      setHasMore(newItems.length === 20);
    } catch (err) {
      console.error('Error fetching memories:', err);
    } finally {
      setFetchingMore(false);
    }
  };

  // Handle scroll to bottom for infinite loading
  useEffect(() => {
    const handleScroll = () => {
      if (initialLoading || filtering || fetchingMore || !hasMore) return;
      
      // Trigger when user scrolls within 150px of the bottom
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 150) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchMemories(nextPage, selectedCategory, false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [page, selectedCategory, initialLoading, filtering, fetchingMore, hasMore]);

  const handleCategoryChange = async (category) => {
    setSelectedCategory(category);
    localStorage.setItem('all_memories_filter', category);
    setPage(0);
    setHasMore(true);
    setFiltering(true);
    
    // Reset list and reload stats + memories
    await Promise.all([
      fetchStats(category),
      fetchMemories(0, category, true)
    ]);
    setFiltering(false);
  };

  const getCategoryInfo = (categoryId) => {
    return MEMORY_CATEGORIES.find(c => c.id === categoryId) || MEMORY_CATEGORIES[0];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getYearAbbr = (yearStr) => {
    return `'${yearStr.toString().slice(-2)}`;
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

  // grouped and sortedYears are now defined early at the top of the component

  // Stats are precomputed and fetched from server
  const subtitleText = `${totalCount} ${totalCount === 1 ? 'moment' : 'moments'} · ${yearSpan} ${yearSpan === 1 ? 'year' : 'years'}`;

  const scrollToYear = (year) => {
    const el = document.getElementById(`year-group-${year}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (initialLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="all-memories-page">
      {/* Sticky Top Header */}
      <div className="all-memories-header">
        <button className="back-btn-circle" onClick={() => navigate('/')} aria-label="Go back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="header-info">
          <h1 className="header-title">All memories</h1>
          <p className="header-subtitle">{subtitleText}</p>
        </div>
      </div>

      {/* Horizontal Category Pills Selector */}
      <div className="filters-row">
        <button
          className={`filter-pill ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => handleCategoryChange('all')}
        >
          All
        </button>
        {MEMORY_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`filter-pill ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => handleCategoryChange(cat.id)}
          >
            <span className="pill-emoji-span">{cat.emoji}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      <div className="list-layout-wrapper">
        {/* Main List Column */}
        <div className="memories-list-column">
          {filtering ? (
            <div className="filtering-loading-container">
              <div className="spinner"></div>
            </div>
          ) : sortedYears.length === 0 ? (
            <div className="empty-search-state">
              <span className="empty-search-icon">🔍</span>
              <h3>No memories found</h3>
              <p>Try selecting a different memory type filter.</p>
            </div>
          ) : (
            <>
              {sortedYears.map(year => (
                <div key={year} id={`year-group-${year}`} className="year-group">
                  <div className="year-group-header">
                    <span className="year-group-title">{year}</span>
                    <span className="year-group-badge">{grouped[year].length}</span>
                    <div className="year-group-line"></div>
                  </div>

                  <div className="year-items-stack">
                    {grouped[year].map(memory => {
                      const category = getCategoryInfo(memory.category);
                      return (
                        <div
                          key={memory.id}
                          className="compact-memory-card"
                          onClick={() => navigate(`/memory/${memory.id}`)}
                        >
                          {/* Thumbnail / Placeholder */}
                          <div className="compact-card-media">
                            {getFirstImageUrl(memory.image_url) ? (
                              <img src={getFirstImageUrl(memory.image_url)} alt="" className="compact-card-img" />
                            ) : (
                              <div
                                className="compact-card-placeholder"
                                style={{ background: category.color, color: category.textColor }}
                              >
                                <span style={{ fontSize: '20px' }}>{category.emoji}</span>
                              </div>
                            )}
                          </div>

                          {/* Text Content */}
                          <div className="compact-card-content">
                            <span
                              className="compact-card-category"
                              style={{ background: category.color, color: category.textColor }}
                            >
                              <span>{category.emoji}</span>
                              <span>{category.name}</span>
                            </span>
                            <h4 className="compact-card-title">{memory.title}</h4>
                            <span className="compact-card-meta">
                              {formatDate(memory.date)} · by {memory.created_by || 'User'}
                            </span>
                          </div>

                          {/* Chevron */}
                          <div className="compact-card-chevron">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 18l6-6-6-6" />
                            </svg>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              
              {/* Mini Loading Spinner at bottom during pagination */}
              {fetchingMore && (
                <div className="fetching-more-spinner">
                  <div className="spinner mini"></div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Scroll Timeline Sidebar (right side index with draggable snap handle) */}
        {sortedYears.length > 0 && (
          <div className="timeline-sidebar-container">
            <div className="timeline-scrollbar-track" ref={trackRef}>
              {/* Year marks along the track for context */}
              {sortedYears.map((year, idx) => {
                const pct = sortedYears.length > 1 ? idx / (sortedYears.length - 1) : 0;
                // Distribute labels along the track height
                const positionY = `calc(${pct * 100}% - ${pct * 36}px + 18px)`;
                return (
                  <div
                    key={year}
                    className={`timeline-track-year-mark ${activeYear === year ? 'active' : ''}`}
                    style={{ top: positionY }}
                    onClick={() => scrollToYear(year)}
                  >
                    {getYearAbbr(year)}
                  </div>
                );
              })}

              {/* The Draggable Scroll Handle */}
              <div
                className={`timeline-scroll-handle ${isDragging ? 'dragging' : ''}`}
                style={{
                  top: `calc(${scrollPercentage * 100}% - ${scrollPercentage * 36}px)`
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerEnter={() => setIsHovered(true)}
                onPointerLeave={() => setIsHovered(false)}
              >
                {/* Chevrons/Arrows wrapper */}
                <div className="handle-arrows">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 15l-6-6-6 6" />
                  </svg>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>

                {/* Floating Preview Bubble on drag or hover */}
                {(isDragging || isHovered) && (
                  <div className="timeline-bubble-preview">
                    {draggedYear || activeYear || sortedYears[0]}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
