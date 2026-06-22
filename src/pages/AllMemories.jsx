import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { MEMORY_CATEGORIES } from '../utils/constants';
import '../styles/AllMemories.css';

export default function AllMemories() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setMemories(data || []);
    } catch (err) {
      console.error('Error fetching memories:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryInfo = (categoryId) => {
    return MEMORY_CATEGORIES.find(c => c.id === categoryId) || MEMORY_CATEGORIES[0];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Helper to format year abbreviation, e.g. 2025 -> '25
  const getYearAbbr = (yearStr) => {
    return `'${yearStr.toString().slice(-2)}`;
  };

  // Filter memories based on selected category pill
  const filteredMemories = selectedCategory === 'all'
    ? memories
    : memories.filter(m => m.category === selectedCategory);

  // Group filtered memories by year (descending)
  const grouped = filteredMemories.reduce((acc, memory) => {
    const year = new Date(memory.date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(memory);
    return acc;
  }, {});

  const sortedYears = Object.keys(grouped).sort((a, b) => b - a);

  // Calculate stats for subtitle
  const momentsCount = filteredMemories.length;
  const uniqueYears = Array.from(new Set(filteredMemories.map(m => new Date(m.date).getFullYear())));
  const yearsRange = uniqueYears.length > 0
    ? Math.max(1, Math.max(...uniqueYears) - Math.min(...uniqueYears) + 1)
    : 0;

  const subtitleText = `${momentsCount} ${momentsCount === 1 ? 'moment' : 'moments'} · ${yearsRange} ${yearsRange === 1 ? 'year' : 'years'}`;

  // Smooth scroll to a year group
  const scrollToYear = (year) => {
    const el = document.getElementById(`year-group-${year}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
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
          onClick={() => setSelectedCategory('all')}
        >
          All
        </button>
        {MEMORY_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`filter-pill ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <span className="pill-emoji-span">{cat.emoji}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      <div className="list-layout-wrapper">
        {/* Main List Column */}
        <div className="memories-list-column">
          {sortedYears.length === 0 ? (
            <div className="empty-search-state">
              <span className="empty-search-icon">🔍</span>
              <h3>No memories found</h3>
              <p>Try selecting a different memory type filter.</p>
            </div>
          ) : (
            sortedYears.map(year => (
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
                          {memory.image_url ? (
                            <img src={memory.image_url} alt="" className="compact-card-img" />
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
            ))
          )}
        </div>

        {/* Scroll Timeline Sidebar (right side index) */}
        {sortedYears.length > 0 && (
          <div className="timeline-sidebar-container">
            <div className="timeline-sidebar-track">
              {sortedYears.map((year, idx) => (
                <div key={year} className="timeline-sidebar-item" onClick={() => scrollToYear(year)}>
                  <span className="timeline-sidebar-label">{getYearAbbr(year)}</span>
                  {/* Blue active highlights or circle dots */}
                  <div className={`timeline-sidebar-dot ${idx === 0 ? 'active' : ''}`}></div>
                  {idx < sortedYears.length - 1 && (
                    <div className="timeline-sidebar-dot-spacer"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
