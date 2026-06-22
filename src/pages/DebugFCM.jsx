import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { requestNotificationPermission } from '../utils/notifications';
import { getCurrentUser } from '../utils/auth';

export default function DebugFCM() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('name, fcm_token, created_at, updated_at')
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPermission = async () => {
    console.log('Requesting notification permission...');
    const token = await requestNotificationPermission();
    console.log('Result:', token);
    // Reload users to see updated token
    setTimeout(loadUsers, 1000);
  };

  const currentUser = getCurrentUser();

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>FCM Debug Page</h1>

      <div style={{ marginBottom: '20px' }}>
        <p><strong>Current User:</strong> {currentUser}</p>
        <p><strong>Notification Permission:</strong> {typeof Notification !== 'undefined' ? Notification.permission : 'Not supported'}</p>
      </div>

      <button
        onClick={handleRequestPermission}
        style={{
          padding: '10px 20px',
          background: '#2D6FE0',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Request Notification Permission
      </button>

      <button
        onClick={loadUsers}
        style={{
          padding: '10px 20px',
          background: '#666',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: '20px',
          marginLeft: '10px'
        }}
      >
        Refresh Data
      </button>

      <h2>Users Table</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          background: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>FCM Token</th>
              <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.name} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {user.name}
                  {user.name === currentUser && ' (You)'}
                </td>
                <td style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  fontSize: '11px',
                  maxWidth: '400px',
                  wordBreak: 'break-all'
                }}>
                  {user.fcm_token ? (
                    <span style={{ color: 'green' }}>
                      {user.fcm_token.substring(0, 50)}...
                    </span>
                  ) : (
                    <span style={{ color: 'red' }}>No token</span>
                  )}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd', fontSize: '12px' }}>
                  {user.updated_at ? new Date(user.updated_at).toLocaleString() : 'Never'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>Open browser console to see detailed FCM logs</p>
      </div>
    </div>
  );
}
