import {
  AmplitudeIntegration,
  BlitzllamaIntegration,
  VWOIntegration,
  MixpanelIntegration
} from '../integrations';

// Analytics service to manage all analytics integrations
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

    // Initialize integration instances
    this.integrations = {
      amplitude: new AmplitudeIntegration(this.config.amplitude, this.log.bind(this)),
      blitzllama: new BlitzllamaIntegration(this.config.blitzllama, this.log.bind(this)),
      vwo: new VWOIntegration(this.config.vwo, this.log.bind(this)),
      mixpanel: new MixpanelIntegration(this.config.mixpanel, this.log.bind(this))
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

      // Initialize all enabled integrations
      const initPromises = [];
      
      if (this.config.amplitude.enabled) {
        initPromises.push(
          this.integrations.amplitude.initialize()
            .then(result => {
              if (!result.success) {
                this.config.amplitude.enabled = false;
              }
              return result;
            })
        );
      }

      if (this.config.blitzllama.enabled) {
        initPromises.push(
          this.integrations.blitzllama.initialize()
            .then(result => {
              if (!result.success) {
                this.config.blitzllama.enabled = false;
              }
              return result;
            })
        );
      }

      if (this.config.vwo.enabled) {
        initPromises.push(
          this.integrations.vwo.initialize()
            .then(result => {
              if (!result.success) {
                this.config.vwo.enabled = false;
              }
              return result;
            })
        );
      }

      if (this.config.mixpanel.enabled) {
        initPromises.push(
          this.integrations.mixpanel.initialize()
            .then(result => {
              if (!result.success) {
                this.config.mixpanel.enabled = false;
              }
              return result;
            })
        );
      }

      // Wait for all initializations to complete
      const results = await Promise.all(initPromises);
      
      this.isInitialized = true;
      this.log('All analytics services initialized', {
        sessionId: this.sessionId,
        services: ['amplitude', 'blitzllama', 'vwo', 'mixpanel'],
        results: results.map(r => r.success ? 'success' : 'failed')
      });

    } catch (error) {
      this.log('Error initializing analytics services', { error: error.message });
    }
  }



  // User identification
  identifyUser(userId, userProperties = {}) {
    const properties = {
      ...userProperties,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    };

    this.log('Identifying user across all services', { userId, properties });

    // Call identify on all enabled integrations
    Object.keys(this.integrations).forEach(serviceName => {
      const integration = this.integrations[serviceName];
      const config = this.config[serviceName];
      
      if (config.enabled) {
        integration.identifyUser(userId, properties);
      }
    });
  }

  // Track events
  trackEvent(eventName, properties = {}) {
    const eventProperties = {
      ...properties,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    };

    this.log('Tracking event across all services', { eventName, properties: eventProperties });

    // Call trackEvent on all enabled integrations
    Object.keys(this.integrations).forEach(serviceName => {
      const integration = this.integrations[serviceName];
      const config = this.config[serviceName];
      
      if (config.enabled) {
        integration.trackEvent(eventName, eventProperties);
      }
    });
  }

  // Track page views
  trackPageView(pageName, properties = {}) {
    const pageProperties = {
      ...properties,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    };

    this.log('Tracking page view across all services', { pageName, properties: pageProperties });

    // Call trackPageView on all enabled integrations
    Object.keys(this.integrations).forEach(serviceName => {
      const integration = this.integrations[serviceName];
      const config = this.config[serviceName];
      
      if (config.enabled) {
        integration.trackPageView(pageName, pageProperties);
      }
    });
  }

  // Get connection status
  getConnectionStatus() {
    const status = {
      sessionId: this.sessionId,
      isInitialized: this.isInitialized,
      services: {}
    };

    // Get status from each integration
    Object.keys(this.integrations).forEach(serviceName => {
      const integration = this.integrations[serviceName];
      status.services[serviceName] = integration.getStatus();
    });

    return status;
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
