import React, { useState, useEffect } from 'react';
import analyticsService from '../services/analytics';
import authService from '../services/auth';

const Dashboard = ({ user, onLogout }) => {
  const [connectionStatus, setConnectionStatus] = useState({});
  const [logs, setLogs] = useState([]);
  const [eventName, setEventName] = useState('');
  const [eventProperties, setEventProperties] = useState('');

  useEffect(() => {
    // Track page view
    analyticsService.trackPageView('Dashboard', {
      userId: user.id,
      userRole: user.role
    });

    // Get initial connection status
    setConnectionStatus(analyticsService.getConnectionStatus());
    setLogs(analyticsService.getLogs());

    // Set up log updates
    const interval = setInterval(() => {
      setLogs(analyticsService.getLogs());
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  const handleTrackEvent = () => {
    if (!eventName.trim()) {
      alert('Please enter an event name');
      return;
    }

    let properties = {};
    if (eventProperties.trim()) {
      try {
        properties = JSON.parse(eventProperties);
      } catch (e) {
        alert('Invalid JSON in event properties');
        return;
      }
    }

    analyticsService.trackEvent(eventName, {
      ...properties,
      triggeredBy: 'dashboard',
      userId: user.id
    });

    setEventName('');
    setEventProperties('');
  };

  const handleTrackPageView = (pageName) => {
    analyticsService.trackPageView(pageName, {
      userId: user.id,
      userRole: user.role,
      triggeredBy: 'dashboard'
    });
  };

  const handleUserAction = (action) => {
    analyticsService.trackEvent(action, {
      userId: user.id,
      userRole: user.role,
      timestamp: new Date().toISOString(),
      actionType: 'user_interaction'
    });
  };

  const clearLogs = () => {
    analyticsService.clearLogs();
    setLogs([]);
  };

  const getStatusIndicator = (status) => {
    return (
      <span className={`status-indicator ${status ? 'status-connected' : 'status-disconnected'}`}></span>
    );
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, color: 'white' }}>Analytics Dashboard</h1>
          <p style={{ margin: '5px 0 0 0', color: 'rgba(255,255,255,0.8)' }}>
            Welcome, {user.name} ({user.role})
          </p>
        </div>
        <button className="btn btn-danger" onClick={onLogout}>
          Logout
        </button>
      </div>

      {/* Connection Status */}
      <div className="card">
        <h2>Analytics Services Status</h2>
        <div className="grid">
          <div className="analytics-section">
            <h3>
              {getStatusIndicator(connectionStatus.amplitude)}
              Amplitude
            </h3>
            <p>Status: {connectionStatus.amplitude ? 'Connected' : 'Disconnected'}</p>
            <p>Session ID: {connectionStatus.sessionId}</p>
          </div>
          
          <div className="analytics-section">
            <h3>
              {getStatusIndicator(connectionStatus.mixpanel)}
              Mixpanel
            </h3>
            <p>Status: {connectionStatus.mixpanel ? 'Connected' : 'Disconnected'}</p>
            <p>Session ID: {connectionStatus.sessionId}</p>
          </div>
          
          <div className="analytics-section">
            <h3>
              {getStatusIndicator(connectionStatus.blitzllama)}
              Blitzllama
            </h3>
            <p>Status: {connectionStatus.blitzllama ? 'Connected' : 'Disconnected'}</p>
            <p>Session ID: {connectionStatus.sessionId}</p>
          </div>
        </div>
      </div>

      {/* Event Tracking */}
      <div className="card">
        <h2>Event Tracking</h2>
        
        <div className="form-group">
          <label htmlFor="eventName">Event Name</label>
          <input
            type="text"
            id="eventName"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="e.g., button_click, page_view, purchase"
          />
        </div>

        <div className="form-group">
          <label htmlFor="eventProperties">Event Properties (JSON)</label>
          <textarea
            id="eventProperties"
            value={eventProperties}
            onChange={(e) => setEventProperties(e.target.value)}
            placeholder='{"key": "value", "category": "test"}'
            style={{ 
              width: '100%', 
              padding: '12px', 
              border: '2px solid #e1e5e9', 
              borderRadius: '8px',
              fontFamily: 'monospace',
              minHeight: '100px'
            }}
          />
        </div>

        <button className="btn btn-success" onClick={handleTrackEvent}>
          Track Event
        </button>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2>Quick Actions</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button 
            className="btn" 
            onClick={() => handleUserAction('button_click')}
          >
            Track Button Click
          </button>
          
          <button 
            className="btn" 
            onClick={() => handleUserAction('feature_used')}
          >
            Track Feature Usage
          </button>
          
          <button 
            className="btn" 
            onClick={() => handleUserAction('search_performed')}
          >
            Track Search
          </button>
          
          <button 
            className="btn" 
            onClick={() => handleUserAction('purchase_completed')}
          >
            Track Purchase
          </button>
          
          <button 
            className="btn" 
            onClick={() => handleTrackPageView('Test Page')}
          >
            Track Page View
          </button>
          
          <button 
            className="btn" 
            onClick={() => handleUserAction('user_profile_updated')}
          >
            Track Profile Update
          </button>
        </div>
      </div>

      {/* User Information */}
      <div className="card">
        <h2>User Information</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <strong>User ID:</strong> {user.id}
          </div>
          <div>
            <strong>Email:</strong> {user.email}
          </div>
          <div>
            <strong>Name:</strong> {user.name}
          </div>
          <div>
            <strong>Role:</strong> {user.role}
          </div>
          <div>
            <strong>Session Token:</strong> {authService.getSessionToken()}
          </div>
          <div>
            <strong>Session ID:</strong> {connectionStatus.sessionId}
          </div>
        </div>
      </div>

      {/* Analytics Logs */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Analytics Logs</h2>
          <button className="btn btn-secondary" onClick={clearLogs}>
            Clear Logs
          </button>
        </div>
        
        <div className="log-section">
          {logs.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6c757d', margin: '20px 0' }}>
              No logs yet. Try tracking some events!
            </p>
          ) : (
            logs.slice(-20).reverse().map((log, index) => (
              <div key={index} className="log-entry">
                <div className="log-timestamp">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
                <div className="log-event">{log.message}</div>
                {Object.keys(log.data).length > 0 && (
                  <div className="log-details">
                    {JSON.stringify(log.data, null, 2)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* SDK Configuration */}
      <div className="card">
        <h2>SDK Configuration</h2>
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
          <h4>Setup Instructions:</h4>
          <ol>
            <li>
              <strong>Amplitude:</strong> Replace 'YOUR_AMPLITUDE_API_KEY' in src/services/analytics.js with your actual API key
            </li>
            <li>
              <strong>Mixpanel:</strong> Replace 'YOUR_MIXPANEL_TOKEN' in src/services/analytics.js with your actual project token
            </li>
            <li>
              <strong>Blitzllama:</strong> Replace 'YOUR_BLITZLLAMA_API_KEY' in src/services/analytics.js with your actual API key
            </li>
          </ol>
          <p style={{ marginTop: '15px', color: '#6c757d' }}>
            <strong>Note:</strong> Currently using mock implementations. Update the configuration to connect to real services.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
