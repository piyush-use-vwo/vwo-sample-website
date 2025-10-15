import React, { useState, useEffect } from 'react';
import authService from '../services/auth';
import analyticsService from '../services/analytics';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Track page view
    analyticsService.trackPageView('Login Page');
    
    // Check if user is already logged in
    if (authService.restoreSession()) {
      onLoginSuccess(authService.getCurrentUser());
    }
  }, [onLoginSuccess]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await authService.login(email, password);
      
      if (result.success) {
        // Track successful login
        analyticsService.identifyUser(result.user.id, {
          email: result.user.email,
          name: result.user.name,
          role: result.user.role
        });
        
        analyticsService.trackEvent('User Login', {
          userId: result.user.id,
          userEmail: result.user.email,
          userRole: result.user.role,
          loginMethod: 'email_password'
        });

        onLoginSuccess(result.user);
      }
    } catch (err) {
      setError(err.message);
      
      // Track failed login
      analyticsService.trackEvent('Login Failed', {
        email: email,
        error: err.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const result = await authService.register(registerData);
      
      if (result.success) {
        // Track successful registration
        analyticsService.trackEvent('User Registration', {
          email: registerData.email,
          name: registerData.name,
          timestamp: new Date().toISOString()
        });

        setError('');
        setShowRegister(false);
        setRegisterData({ name: '', email: '', password: '', confirmPassword: '' });
        
        // Auto-login after registration
        const loginResult = await authService.login(registerData.email, registerData.password);
        if (loginResult.success) {
          analyticsService.identifyUser(loginResult.user.id, {
            email: loginResult.user.email,
            name: loginResult.user.name,
            role: loginResult.user.role
          });
          
          onLoginSuccess(loginResult.user);
        }
      }
    } catch (err) {
      setError(err.message);
      
      // Track failed registration
      analyticsService.trackEvent('Registration Failed', {
        email: registerData.email,
        error: err.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('demo@example.com');
    setPassword('demo123');
  };

  return (
    <div className="container">
      <div style={{ maxWidth: '400px', margin: '50px auto' }}>
        <div className="card">
          <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
            {showRegister ? 'Create Account' : 'Welcome Back'}
          </h2>

          {error && (
            <div style={{ 
              background: '#f8d7da', 
              color: '#721c24', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              border: '1px solid #f5c6cb'
            }}>
              {error}
            </div>
          )}

          {!showRegister ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>

              <button 
                type="submit" 
                className="btn" 
                disabled={isLoading}
                style={{ width: '100%', margin: '8px 0' }}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>

              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleDemoLogin}
                style={{ width: '100%', margin: '8px 0' }}
              >
                Demo Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label htmlFor="regName">Full Name</label>
                <input
                  type="text"
                  id="regName"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="regEmail">Email</label>
                <input
                  type="email"
                  id="regEmail"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="regPassword">Password</label>
                <input
                  type="password"
                  id="regPassword"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  required
                  placeholder="Enter your password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="regConfirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="regConfirmPassword"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                  required
                  placeholder="Confirm your password"
                />
              </div>

              <button 
                type="submit" 
                className="btn" 
                disabled={isLoading}
                style={{ width: '100%', margin: '8px 0' }}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => setShowRegister(!showRegister)}
              style={{ background: 'transparent', color: '#667eea', border: '1px solid #667eea' }}
            >
              {showRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>

          <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#495057' }}>Demo Credentials:</h4>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>
              <div><strong>Admin:</strong> admin@example.com / admin123</div>
              <div style={{ fontSize: '12px', color: '#999', marginLeft: '10px' }}>User ID: admin_user_001</div>
              <div><strong>User:</strong> user@example.com / user123</div>
              <div style={{ fontSize: '12px', color: '#999', marginLeft: '10px' }}>User ID: regular_user_002</div>
              <div><strong>Demo:</strong> demo@example.com / demo123</div>
              <div style={{ fontSize: '12px', color: '#999', marginLeft: '10px' }}>User ID: demo_user_003</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
