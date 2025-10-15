import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import analyticsService from './services/analytics';
import authService from './services/auth';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize analytics service
    const initializeApp = async () => {
      try {
        // Clear any old localStorage data first
        authService.clearOldData();
        
        await analyticsService.initialize();
        
        // Check if user is already logged in
        if (authService.restoreSession()) {
          const currentUser = authService.getCurrentUser();
          setUser(currentUser);
          
          // Identify user in analytics
          analyticsService.identifyUser(currentUser.id, {
            email: currentUser.email,
            name: currentUser.name,
            role: currentUser.role
          });
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    
    // Track successful login
    analyticsService.trackEvent('App Login Success', {
      userId: userData.id,
      userEmail: userData.email,
      userRole: userData.role,
      timestamp: new Date().toISOString()
    });
  };

  const handleLogout = () => {
    // Track logout event
    if (user) {
      analyticsService.trackEvent('User Logout', {
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        timestamp: new Date().toISOString()
      });
    }
    
    authService.logout();
    setUser(null);
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h3 style={{ margin: 0, color: '#333' }}>Initializing Analytics...</h3>
          <p style={{ margin: '10px 0 0 0', color: '#6c757d' }}>
            Setting up Amplitude, Mixpanel, and Blitzllama
          </p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="App">
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
