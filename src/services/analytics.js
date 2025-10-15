import * as amplitude from '@amplitude/analytics-browser';
// import mixpanel from 'mixpanel-browser'; // Uncomment when you have a Mixpanel token

// Analytics service to manage all three SDKs
class AnalyticsService {
  constructor() {
    this.isInitialized = false;
    this.sessionId = this.generateSessionId();
    this.logs = [];
    
    // Configuration for each service
    this.config = {
      amplitude: {
        apiKey: process.env.REACT_APP_AMPLITUDE_API_KEY || '43f7b07dcb7fcfe58a8091a289990c30',
        enabled: true
      },
      mixpanel: {
        token: process.env.REACT_APP_MIXPANEL_TOKEN || 'YOUR_MIXPANEL_TOKEN',
        enabled: false // Disabled until you provide a real token
      },
      blitzllama: {
        apiKey: process.env.REACT_APP_BLITZLLAMA_API_KEY || 'key_BJMzppuLgKVPseZ',
        enabled: true
      },
      vwo: {
        accountId: process.env.REACT_APP_VWO_ACCOUNT_ID || '3000655',
        enabled: true
      }
    };
  }

  generateSessionId() {
    // Generate a unique session ID for frontend-only storage
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `session_${timestamp}_${random}`;
  }

  log(message, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      message,
      data,
      sessionId: this.sessionId
    };
    this.logs.push(logEntry);
    console.log(`[Analytics] ${message}`, data);
  }

  async initialize() {
    try {
      this.log('Initializing analytics services...');

      // Initialize Amplitude (real SDK)
      if (this.config.amplitude.enabled) {
        try {
          await amplitude.init(this.config.amplitude.apiKey, {
            defaultTracking: {
              sessions: true,
              pageViews: true,
              formInteractions: true,
              fileDownloads: true
            }
          });
          this.log('Amplitude initialized successfully', { apiKey: this.config.amplitude.apiKey });
        } catch (error) {
          this.log('Amplitude initialization failed', { error: error.message });
          this.config.amplitude.enabled = false;
        }
      }

      // Initialize Mixpanel (mock implementation)
      if (this.config.mixpanel.enabled) {
        this.initializeMixpanel();
        this.log('Mixpanel initialized successfully (mock)');
      }

      // Initialize Blitzllama (mock implementation since we don't have the actual SDK)
      if (this.config.blitzllama.enabled) {
        this.initializeBlitzllama();
        this.log('Blitzllama initialized successfully (mock)');
      }

      // Initialize VWO (already loaded via SmartCode in HTML)
      if (this.config.vwo.enabled) {
        this.initializeVWO();
        this.log('VWO initialized successfully');
      }

      this.isInitialized = true;
      this.log('All analytics services initialized', {
        sessionId: this.sessionId,
        services: ['amplitude', 'blitzllama', 'vwo', 'mixpanel']
      });

    } catch (error) {
      this.log('Error initializing analytics services', { error: error.message });
    }
  }


  initializeMixpanel() {
    // Mock Mixpanel implementation
    window.mixpanel = {
      init: (token, options) => {
        this.log('Mixpanel init called', { token, options });
      },
      identify: (userId) => {
        this.log('Mixpanel identify called', { userId });
      },
      track: (eventName, properties) => {
        this.log('Mixpanel track called', { eventName, properties });
      },
      people: {
        set: (properties) => {
          this.log('Mixpanel people.set called', { properties });
        }
      }
    };
  }

  initializeBlitzllama() {
    // Web-based Blitzllama integration using their API
    const apiKey = this.config.blitzllama.apiKey;
    const baseUrl = 'https://api.blitzllama.com';
    
    window.blitzllama = {
      track: async (event, properties = {}) => {
        this.log('Blitzllama track event', { event, properties });
        try {
          const response = await fetch(`${baseUrl}/events`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              event,
              properties: {
                ...properties,
                timestamp: new Date().toISOString(),
                sessionId: this.sessionId
              }
            })
          });
          
          if (response.ok) {
            this.log('Blitzllama event tracked successfully', { event });
            return { success: true, event, properties };
          } else {
            this.log('Blitzllama event tracking failed', { status: response.status });
            return { success: false, error: 'API call failed' };
          }
        } catch (error) {
          this.log('Blitzllama event tracking error', { error: error.message });
          return { success: false, error: error.message };
        }
      },
      
      identify: async (userId, properties = {}) => {
        this.log('Blitzllama identify user', { userId, properties });
        try {
          const response = await fetch(`${baseUrl}/users/${userId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              userId,
              properties: {
                ...properties,
                sessionId: this.sessionId,
                lastSeen: new Date().toISOString()
              }
            })
          });
          
          if (response.ok) {
            this.log('Blitzllama user identified successfully', { userId });
            return { success: true, userId, properties };
          } else {
            this.log('Blitzllama user identification failed', { status: response.status });
            return { success: false, error: 'API call failed' };
          }
        } catch (error) {
          this.log('Blitzllama user identification error', { error: error.message });
          return { success: false, error: error.message };
        }
      },
      
      page: async (pageName, properties = {}) => {
        this.log('Blitzllama page view', { pageName, properties });
        try {
          const response = await fetch(`${baseUrl}/page-views`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              page: pageName,
              properties: {
                ...properties,
                timestamp: new Date().toISOString(),
                sessionId: this.sessionId
              }
            })
          });
          
          if (response.ok) {
            this.log('Blitzllama page view tracked successfully', { pageName });
            return { success: true, pageName, properties };
          } else {
            this.log('Blitzllama page view tracking failed', { status: response.status });
            return { success: false, error: 'API call failed' };
          }
        } catch (error) {
          this.log('Blitzllama page view tracking error', { error: error.message });
          return { success: false, error: error.message };
        }
      }
    };
  }

  initializeVWO() {
    // VWO is already loaded via SmartCode in HTML
    // We just need to wait for it to be available and set up tracking
    const checkVWO = () => {
      if (window.VWO) {
        this.log('VWO SDK detected', { 
          version: window.VWO.getVersion ? window.VWO.getVersion() : 'unknown',
          accountId: this.config.vwo.accountId 
        });
        
        // Set up VWO tracking methods
        window.vwoTracker = {
          track: (eventName, properties = {}) => {
            this.log('VWO track event', { eventName, properties });
            // VWO tracks events through their global object
            if (window.VWO && window.VWO.track) {
              window.VWO.track(eventName, properties);
            }
          },
          identify: (userId, properties = {}) => {
            this.log('VWO identify user', { userId, properties });
            // VWO user identification
            if (window.VWO && window.VWO.setCustomVariable) {
              window.VWO.setCustomVariable('userId', userId, 'user');
              Object.keys(properties).forEach(key => {
                window.VWO.setCustomVariable(key, properties[key], 'user');
              });
            }
          },
          page: (pageName, properties = {}) => {
            this.log('VWO page view', { pageName, properties });
            // VWO automatically tracks page views, but we can add custom data
            if (window.VWO && window.VWO.setCustomVariable) {
              window.VWO.setCustomVariable('pageName', pageName, 'page');
              Object.keys(properties).forEach(key => {
                window.VWO.setCustomVariable(key, properties[key], 'page');
              });
            }
          }
        };
      } else {
        // Retry after 100ms if VWO is not yet loaded
        setTimeout(checkVWO, 100);
      }
    };
    
    checkVWO();
  }

  // User identification
  identifyUser(userId, userProperties = {}) {
    const properties = {
      ...userProperties,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    };

    this.log('Identifying user across all services', { userId, properties });

    // Amplitude
    if (this.config.amplitude.enabled) {
      try {
        amplitude.setUserId(userId);
        // Use the correct Amplitude API for setting user properties
        const identify = new amplitude.Identify();
        identify.set('sessionId', this.sessionId);
        Object.keys(userProperties).forEach(key => {
          identify.set(key, userProperties[key]);
        });
        amplitude.identify(identify);
      } catch (error) {
        this.log('Amplitude identify failed', { error: error.message });
      }
    }

    // Mixpanel
    if (this.config.mixpanel.enabled && window.mixpanel) {
      try {
        window.mixpanel.identify(userId);
        window.mixpanel.people.set(properties);
      } catch (error) {
        this.log('Mixpanel identify failed', { error: error.message });
      }
    }

    // Blitzllama
    if (this.config.blitzllama.enabled && window.blitzllama) {
      window.blitzllama.identify(userId, properties);
    }

    // VWO
    if (this.config.vwo.enabled && window.vwoTracker) {
      window.vwoTracker.identify(userId, properties);
    }
  }

  // Track events
  trackEvent(eventName, properties = {}) {
    const eventProperties = {
      ...properties,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    };

    this.log('Tracking event across all services', { eventName, properties: eventProperties });

    // Amplitude
    if (this.config.amplitude.enabled) {
      try {
        amplitude.track(eventName, eventProperties);
      } catch (error) {
        this.log('Amplitude track failed', { error: error.message, eventName });
      }
    }

    // Mixpanel
    if (this.config.mixpanel.enabled && window.mixpanel) {
      try {
        window.mixpanel.track(eventName, eventProperties);
      } catch (error) {
        this.log('Mixpanel track failed', { error: error.message, eventName });
      }
    }

    // Blitzllama
    if (this.config.blitzllama.enabled && window.blitzllama) {
      window.blitzllama.track(eventName, eventProperties);
    }

    // VWO
    if (this.config.vwo.enabled && window.vwoTracker) {
      window.vwoTracker.track(eventName, eventProperties);
    }
  }

  // Track page views
  trackPageView(pageName, properties = {}) {
    const pageProperties = {
      ...properties,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    };

    this.log('Tracking page view across all services', { pageName, properties: pageProperties });

    // Amplitude
    if (this.config.amplitude.enabled) {
      try {
        amplitude.track('Page View', { page: pageName, ...pageProperties });
      } catch (error) {
        this.log('Amplitude page view failed', { error: error.message, pageName });
      }
    }

    // Mixpanel
    if (this.config.mixpanel.enabled && window.mixpanel) {
      try {
        window.mixpanel.track('Page View', { page: pageName, ...pageProperties });
      } catch (error) {
        this.log('Mixpanel page view failed', { error: error.message, pageName });
      }
    }

    // Blitzllama
    if (this.config.blitzllama.enabled && window.blitzllama) {
      window.blitzllama.page(pageName, pageProperties);
    }

    // VWO
    if (this.config.vwo.enabled && window.vwoTracker) {
      window.vwoTracker.page(pageName, pageProperties);
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      amplitude: this.config.amplitude.enabled,
      mixpanel: this.config.mixpanel.enabled,
      blitzllama: this.config.blitzllama.enabled,
      vwo: this.config.vwo.enabled,
      sessionId: this.sessionId,
      isInitialized: this.isInitialized
    };
  }

  // Get logs
  getLogs() {
    return this.logs;
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

export default analyticsService;
