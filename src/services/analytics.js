import * as amplitude from '@amplitude/analytics-browser';
import mixpanel from 'mixpanel-browser';

// Analytics service to manage all three SDKs
class AnalyticsService {
  constructor() {
    this.isInitialized = false;
    this.sessionId = this.generateSessionId();
    this.logs = [];
    
    // Configuration for each service
    this.config = {
      amplitude: {
        apiKey: 'YOUR_AMPLITUDE_API_KEY', // Replace with your actual API key
        enabled: true
      },
      mixpanel: {
        token: 'YOUR_MIXPANEL_TOKEN', // Replace with your actual token
        enabled: true
      },
      blitzllama: {
        apiKey: 'YOUR_BLITZLLAMA_API_KEY', // Replace with your actual API key
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

      // Initialize Amplitude
      if (this.config.amplitude.enabled) {
        amplitude.init(this.config.amplitude.apiKey, {
          defaultTracking: {
            sessions: true,
            pageViews: true,
            formInteractions: true,
            fileDownloads: true
          }
        });
        this.log('Amplitude initialized successfully');
      }

      // Initialize Mixpanel
      if (this.config.mixpanel.enabled) {
        mixpanel.init(this.config.mixpanel.token, {
          debug: true,
          track_pageview: true,
          persistence: 'localStorage'
        });
        this.log('Mixpanel initialized successfully');
      }

      // Initialize Blitzllama (mock implementation since we don't have the actual SDK)
      if (this.config.blitzllama.enabled) {
        this.initializeBlitzllama();
        this.log('Blitzllama initialized successfully');
      }

      this.isInitialized = true;
      this.log('All analytics services initialized', {
        sessionId: this.sessionId,
        services: ['amplitude', 'mixpanel', 'blitzllama']
      });

    } catch (error) {
      this.log('Error initializing analytics services', { error: error.message });
    }
  }

  initializeBlitzllama() {
    // Mock Blitzllama initialization since we don't have the actual SDK
    // In a real implementation, you would use the actual Blitzllama SDK
    window.blitzllama = {
      track: (event, properties = {}) => {
        this.log('Blitzllama track event', { event, properties });
        // Mock API call to Blitzllama
        return Promise.resolve({ success: true, event, properties });
      },
      identify: (userId, properties = {}) => {
        this.log('Blitzllama identify user', { userId, properties });
        return Promise.resolve({ success: true, userId, properties });
      },
      page: (pageName, properties = {}) => {
        this.log('Blitzllama page view', { pageName, properties });
        return Promise.resolve({ success: true, pageName, properties });
      }
    };
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
      amplitude.setUserId(userId);
      amplitude.identify(amplitude.Identify().set('sessionId', this.sessionId));
    }

    // Mixpanel
    if (this.config.mixpanel.enabled) {
      mixpanel.identify(userId);
      mixpanel.people.set(properties);
    }

    // Blitzllama
    if (this.config.blitzllama.enabled && window.blitzllama) {
      window.blitzllama.identify(userId, properties);
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
      amplitude.track(eventName, eventProperties);
    }

    // Mixpanel
    if (this.config.mixpanel.enabled) {
      mixpanel.track(eventName, eventProperties);
    }

    // Blitzllama
    if (this.config.blitzllama.enabled && window.blitzllama) {
      window.blitzllama.track(eventName, eventProperties);
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
      amplitude.track('Page View', { page: pageName, ...pageProperties });
    }

    // Mixpanel
    if (this.config.mixpanel.enabled) {
      mixpanel.track('Page View', { page: pageName, ...pageProperties });
    }

    // Blitzllama
    if (this.config.blitzllama.enabled && window.blitzllama) {
      window.blitzllama.page(pageName, pageProperties);
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      amplitude: this.config.amplitude.enabled,
      mixpanel: this.config.mixpanel.enabled,
      blitzllama: this.config.blitzllama.enabled,
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
