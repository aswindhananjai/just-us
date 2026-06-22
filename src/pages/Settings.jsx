import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { logout } from '../utils/auth';
import BottomNav from '../components/BottomNav';
import '../styles/Settings.css';

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    partner_one_name: '',
    partner_two_name: '',
    relationship_start_date: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error) throw error;

      setSettings({
        partner_one_name: data.partner_one_name || '',
        partner_two_name: data.partner_two_name || '',
        relationship_start_date: data.relationship_start_date || '',
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('settings')
        .update(settings)
        .neq('passcode_hash', 'invalid'); // Update any row (we only have one)

      if (error) throw error;

      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to lock the app?')) {
      logout();
      navigate('/lock');
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
    <div className="settings-page">
      <header className="settings-header">
        <h1>Settings</h1>
      </header>

      <form className="settings-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <label className="form-label">Partner One Name</label>
          <input
            type="text"
            name="partner_one_name"
            value={settings.partner_one_name}
            onChange={handleChange}
            placeholder="Aswin"
          />
        </div>

        <div className="form-section">
          <label className="form-label">Partner Two Name</label>
          <input
            type="text"
            name="partner_two_name"
            value={settings.partner_two_name}
            onChange={handleChange}
            placeholder="Anu"
          />
        </div>

        <div className="form-section">
          <label className="form-label">Relationship Start Date</label>
          <input
            type="date"
            name="relationship_start_date"
            value={settings.relationship_start_date}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="btn-primary save-btn"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <div className="settings-actions">
        <button className="btn-secondary logout-btn" onClick={handleLogout}>
          Lock App
        </button>
      </div>

      <div className="settings-footer">
        <p className="app-version">Just us v1.0.0</p>
        <p className="app-tagline">A space that's ours.</p>
      </div>

      <BottomNav />
    </div>
  );
}
