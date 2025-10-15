import * as amplitude from '@amplitude/analytics-browser';

/**
 * Amplitude Analytics Integration
 * Real SDK integration for web analytics
 */
class AmplitudeIntegration {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
    this.isInitialized = false;
  }

  /**
   * Initialize Amplitude SDK
   */
  async initialize() {
    try {
      await amplitude.init(this.config.apiKey, {
        defaultTracking: {
          sessions: true,
          pageViews: true,
          formInteractions: true,
          fileDownloads: true
        }
      });
      
      // Set a device ID if not already set
      if (!amplitude.getDeviceId()) {
        amplitude.setDeviceId(this.generateDeviceId());
      }
      
      this.isInitialized = true;
      this.logger('Amplitude initialized successfully', { 
        apiKey: this.config.apiKey.substring(0, 8) + '...', // Log partial key for security
        deviceId: amplitude.getDeviceId()
      });
      
      return { success: true };
    } catch (error) {
      this.logger('Amplitude initialization failed', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Identify a user with properties
   * @param {string} userId - Unique user identifier
   * @param {Object} userProperties - User properties to set
   */
  identifyUser(userId, userProperties = {}) {
    if (!this.isInitialized) {
      this.logger('Amplitude not initialized, skipping user identification');
      return { success: false, error: 'Not initialized' };
    }

    try {
      // Validate and format user ID (Amplitude requires at least 5 characters)
      const validUserId = this.validateUserId(userId);
      
      // Set user ID
      amplitude.setUserId(validUserId);
      
      // Set device ID if not already set
      if (!amplitude.getDeviceId()) {
        amplitude.setDeviceId(this.generateDeviceId());
      }
      
      // Create identify object and set properties
      const identify = new amplitude.Identify();
      Object.keys(userProperties).forEach(key => {
        identify.set(key, userProperties[key]);
      });
      
      // Apply identification
      amplitude.identify(identify);
      
      this.logger('Amplitude user identified', { 
        originalUserId: userId, 
        validUserId, 
        deviceId: amplitude.getDeviceId(),
        properties: userProperties 
      });
      return { success: true };
    } catch (error) {
      this.logger('Amplitude identify failed', { error: error.message, userId });
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate and format user ID for Amplitude
   * @param {string} userId - Original user ID
   * @returns {string} - Valid user ID
   */
  validateUserId(userId) {
    if (!userId || typeof userId !== 'string') {
      return `anonymous_${Date.now()}`;
    }
    
    // Amplitude requires user ID to be at least 5 characters
    if (userId.length < 5) {
      return `user_${userId}_${Date.now()}`;
    }
    
    return userId;
  }

  /**
   * Generate a device ID
   * @returns {string} - Device ID
   */
  generateDeviceId() {
    return `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Track an event with properties
   * @param {string} eventName - Name of the event
   * @param {Object} properties - Event properties
   */
  trackEvent(eventName, properties = {}) {
    if (!this.isInitialized) {
      this.logger('Amplitude not initialized, skipping event tracking');
      return { success: false, error: 'Not initialized' };
    }

    try {
      amplitude.track(eventName, properties);
      this.logger('Amplitude event tracked', { eventName, properties });
      return { success: true };
    } catch (error) {
      this.logger('Amplitude track failed', { error: error.message, eventName });
      return { success: false, error: error.message };
    }
  }

  /**
   * Track a page view
   * @param {string} pageName - Name of the page
   * @param {Object} properties - Page view properties
   */
  trackPageView(pageName, properties = {}) {
    if (!this.isInitialized) {
      this.logger('Amplitude not initialized, skipping page view tracking');
      return { success: false, error: 'Not initialized' };
    }

    try {
      amplitude.track('Page View', { page: pageName, ...properties });
      this.logger('Amplitude page view tracked', { pageName, properties });
      return { success: true };
    } catch (error) {
      this.logger('Amplitude page view failed', { error: error.message, pageName });
      return { success: false, error: error.message };
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      name: 'Amplitude',
      enabled: this.config.enabled,
      initialized: this.isInitialized,
      apiKey: this.config.apiKey ? 'Configured' : 'Not configured'
    };
  }
}

export default AmplitudeIntegration;
