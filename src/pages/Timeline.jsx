import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { MEMORY_CATEGORIES } from '../utils/constants';
import BottomNav from '../components/BottomNav';
import FloatingActionButton from '../components/FloatingActionButton';
import '../styles/Timeline.css';

export default function Timeline() {
  const [memories, setMemories] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [groupedMemories, setGroupedMemories] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [memoriesResult, settingsResult] = await Promise.all([
        supabase.from('memories').select('*').order('date', { ascending: false }),
        supabase.from('settings').select('*').single()
      ]);

      if (memoriesResult.error) throw memoriesResult.error;
      if (settingsResult.error) throw settingsResult.error;

      setMemories(memoriesResult.data || []);
      setSettings(settingsResult.data);

      // Group memories by year
      const grouped = (memoriesResult.data || []).reduce((acc, memory) => {
        const year = new Date(memory.date).getFullYear();
        if (!acc[year]) acc[year] = [];
        acc[year].push(memory);
        return acc;
      }, {});

      setGroupedMemories(grouped);
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
    if (!settings?.relationship_start_date) return 0;
    const start = new Date(settings.relationship_start_date);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
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
      {/* Header */}
      <header className="timeline-header">
        <h1 className="relationship-names">
          {settings?.partner_one_name || 'Aswin'} & {settings?.partner_two_name || 'Anu'}
        </h1>
        <p className="days-together">{calculateDaysTogether()} Days Together</p>
      </header>

      {/* Timeline */}
      <div className="timeline-content">
        {memories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration">📖</div>
            <h2>Start Our Story</h2>
            <p>Add your first memory to begin building your timeline.</p>
            <button className="btn-primary" onClick={() => navigate('/add')}>
              Add First Memory
            </button>
          </div>
        ) : (
          years.map(year => (
            <div key={year} className="year-group">
              <div className="year-label">{year}</div>
              <div className="memories-list">
                {groupedMemories[year].map(memory => {
                  const category = getCategoryInfo(memory.category);
                  return (
                    <div
                      key={memory.id}
                      className="memory-card"
                      onClick={() => navigate(`/memory/${memory.id}`)}
                    >
                      {memory.image_url && (
                        <div className="memory-image">
                          <img src={memory.image_url} alt={memory.title} />
                        </div>
                      )}
                      <div className="memory-content">
                        <div className="memory-category">
                          {category.emoji} {category.label}
                        </div>
                        <h3 className="memory-title">{memory.title}</h3>
                        <p className="memory-date">{formatDate(memory.date)}</p>
                        {memory.description && (
                          <p className="memory-description">
                            {memory.description.length > 120
                              ? memory.description.substring(0, 120) + '...'
                              : memory.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <FloatingActionButton />
      <BottomNav />
    </div>
  );
}
