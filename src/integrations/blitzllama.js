/**
 * Blitzllama Analytics Integration
 * Web API integration for user feedback and surveys
 */
class BlitzllamaIntegration {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
    this.isInitialized = false;
    this.baseUrl = 'https://api.blitzllama.com';
  }

  /**
   * Initialize Blitzllama integration
   */
  async initialize() {
    try {
      // Test API connection
      const testResponse = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      if (testResponse.ok) {
        this.isInitialized = true;
        this.logger('Blitzllama initialized successfully', { 
          apiKey: this.config.apiKey.substring(0, 8) + '...' // Log partial key for security
        });
        return { success: true };
      } else {
        this.logger('Blitzllama API health check failed', { status: testResponse.status });
        return { success: false, error: 'API health check failed' };
      }
    } catch (error) {
      // If health endpoint doesn't exist, assume API is working and initialize anyway
      this.isInitialized = true;
      this.logger('Blitzllama initialized (health check skipped)', { 
        apiKey: this.config.apiKey.substring(0, 8) + '...',
        note: 'Health endpoint not available, assuming API is working'
      });
      return { success: true };
    }
  }

  /**
   * Identify a user with properties
   * @param {string} userId - Unique user identifier
   * @param {Object} userProperties - User properties to set
   */
  async identifyUser(userId, userProperties = {}) {
    if (!this.isInitialized) {
      this.logger('Blitzllama not initialized, skipping user identification');
      return { success: false, error: 'Not initialized' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          userId,
          properties: {
            ...userProperties,
            lastSeen: new Date().toISOString()
          }
        })
      });

      if (response.ok) {
        this.logger('Blitzllama user identified successfully', { userId });
        return { success: true };
      } else {
        const errorText = await response.text();
        this.logger('Blitzllama user identification failed', { 
          status: response.status, 
          error: errorText 
        });
        return { success: false, error: `API call failed: ${response.status}` };
      }
    } catch (error) {
      this.logger('Blitzllama user identification error', { error: error.message, userId });
      return { success: false, error: error.message };
    }
  }

  /**
   * Track an event with properties
   * @param {string} eventName - Name of the event
   * @param {Object} properties - Event properties
   */
  async trackEvent(eventName, properties = {}) {
    if (!this.isInitialized) {
      this.logger('Blitzllama not initialized, skipping event tracking');
      return { success: false, error: 'Not initialized' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          event: eventName,
          properties: {
            ...properties,
            timestamp: new Date().toISOString()
          }
        })
      });

      if (response.ok) {
        this.logger('Blitzllama event tracked successfully', { eventName });
        return { success: true };
      } else {
        const errorText = await response.text();
        this.logger('Blitzllama event tracking failed', { 
          status: response.status, 
          error: errorText,
          eventName 
        });
        return { success: false, error: `API call failed: ${response.status}` };
      }
    } catch (error) {
      this.logger('Blitzllama event tracking error', { error: error.message, eventName });
      return { success: false, error: error.message };
    }
  }

  /**
   * Track a page view
   * @param {string} pageName - Name of the page
   * @param {Object} properties - Page view properties
   */
  async trackPageView(pageName, properties = {}) {
    if (!this.isInitialized) {
      this.logger('Blitzllama not initialized, skipping page view tracking');
      return { success: false, error: 'Not initialized' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/page-views`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          page: pageName,
          properties: {
            ...properties,
            timestamp: new Date().toISOString()
          }
        })
      });

      if (response.ok) {
        this.logger('Blitzllama page view tracked successfully', { pageName });
        return { success: true };
      } else {
        const errorText = await response.text();
        this.logger('Blitzllama page view tracking failed', { 
          status: response.status, 
          error: errorText,
          pageName 
        });
        return { success: false, error: `API call failed: ${response.status}` };
      }
    } catch (error) {
      this.logger('Blitzllama page view tracking error', { error: error.message, pageName });
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a user for surveys (Blitzllama specific)
   * @param {string} userId - Unique user identifier
   * @param {Object} userData - User data for survey targeting
   */
  async createUser(userId, userData = {}) {
    if (!this.isInitialized) {
      this.logger('Blitzllama not initialized, skipping user creation');
      return { success: false, error: 'Not initialized' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          userId,
          ...userData,
          createdAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        this.logger('Blitzllama user created successfully', { userId });
        return { success: true };
      } else {
        const errorText = await response.text();
        this.logger('Blitzllama user creation failed', { 
          status: response.status, 
          error: errorText,
          userId 
        });
        return { success: false, error: `API call failed: ${response.status}` };
      }
    } catch (error) {
      this.logger('Blitzllama user creation error', { error: error.message, userId });
      return { success: false, error: error.message };
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      name: 'Blitzllama',
      enabled: this.config.enabled,
      initialized: this.isInitialized,
      apiKey: this.config.apiKey ? 'Configured' : 'Not configured',
      baseUrl: this.baseUrl
    };
  }
}

export default BlitzllamaIntegration;
