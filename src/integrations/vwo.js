/**
 * VWO (Visual Website Optimizer) Integration
 * SmartCode integration for A/B testing and conversion optimization
 */
class VWOIntegration {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
    this.isInitialized = false;
    this.vwoTracker = null;
  }

  /**
   * Initialize VWO integration
   * VWO is loaded via SmartCode in HTML, we just need to wait for it
   */
  async initialize() {
    return new Promise((resolve) => {
      const checkVWO = () => {
        if (window.VWO) {
          this.isInitialized = true;
          
          // Set up VWO tracking methods
          this.vwoTracker = {
            track: (eventName, properties = {}) => {
              this.logger('VWO track event', { eventName, properties });
              try {
                if (window.VWO && window.VWO.track) {
                  window.VWO.track(eventName, properties);
                }
              } catch (error) {
                this.logger('VWO track error', { error: error.message, eventName });
              }
            },
            
            identify: (userId, properties = {}) => {
              this.logger('VWO identify user', { userId, properties });
              try {
                if (window.VWO && window.VWO.setCustomVariable) {
                  window.VWO.setCustomVariable('userId', userId, 'user');
                  Object.keys(properties).forEach(key => {
                    window.VWO.setCustomVariable(key, properties[key], 'user');
                  });
                }
              } catch (error) {
                this.logger('VWO identify error', { error: error.message, userId });
              }
            },
            
            page: (pageName, properties = {}) => {
              this.logger('VWO page view', { pageName, properties });
              try {
                if (window.VWO && window.VWO.setCustomVariable) {
                  window.VWO.setCustomVariable('pageName', pageName, 'page');
                  Object.keys(properties).forEach(key => {
                    window.VWO.setCustomVariable(key, properties[key], 'page');
                  });
                }
              } catch (error) {
                this.logger('VWO page view error', { error: error.message, pageName });
              }
            }
          };

          this.logger('VWO initialized successfully', { 
            accountId: this.config.accountId,
            version: window.VWO.getVersion ? window.VWO.getVersion() : 'unknown'
          });
          
          resolve({ success: true });
        } else {
          // Retry after 100ms if VWO is not yet loaded
          setTimeout(checkVWO, 100);
        }
      };
      
      checkVWO();
    });
  }

  /**
   * Identify a user with properties
   * @param {string} userId - Unique user identifier
   * @param {Object} userProperties - User properties to set
   */
  identifyUser(userId, userProperties = {}) {
    if (!this.isInitialized || !this.vwoTracker) {
      this.logger('VWO not initialized, skipping user identification');
      return { success: false, error: 'Not initialized' };
    }

    try {
      this.vwoTracker.identify(userId, userProperties);
      this.logger('VWO user identified', { userId, properties: userProperties });
      return { success: true };
    } catch (error) {
      this.logger('VWO identify failed', { error: error.message, userId });
      return { success: false, error: error.message };
    }
  }

  /**
   * Track an event with properties
   * @param {string} eventName - Name of the event
   * @param {Object} properties - Event properties
   */
  trackEvent(eventName, properties = {}) {
    if (!this.isInitialized || !this.vwoTracker) {
      this.logger('VWO not initialized, skipping event tracking');
      return { success: false, error: 'Not initialized' };
    }

    try {
      this.vwoTracker.track(eventName, properties);
      this.logger('VWO event tracked', { eventName, properties });
      return { success: true };
    } catch (error) {
      this.logger('VWO track failed', { error: error.message, eventName });
      return { success: false, error: error.message };
    }
  }

  /**
   * Track a page view
   * @param {string} pageName - Name of the page
   * @param {Object} properties - Page view properties
   */
  trackPageView(pageName, properties = {}) {
    if (!this.isInitialized || !this.vwoTracker) {
      this.logger('VWO not initialized, skipping page view tracking');
      return { success: false, error: 'Not initialized' };
    }

    try {
      this.vwoTracker.page(pageName, properties);
      this.logger('VWO page view tracked', { pageName, properties });
      return { success: true };
    } catch (error) {
      this.logger('VWO page view failed', { error: error.message, pageName });
      return { success: false, error: error.message };
    }
  }

  /**
   * Set custom variables for A/B testing
   * @param {string} key - Variable key
   * @param {*} value - Variable value
   * @param {string} type - Variable type ('user', 'page', 'session')
   */
  setCustomVariable(key, value, type = 'user') {
    if (!this.isInitialized) {
      this.logger('VWO not initialized, skipping custom variable');
      return { success: false, error: 'Not initialized' };
    }

    try {
      if (window.VWO && window.VWO.setCustomVariable) {
        window.VWO.setCustomVariable(key, value, type);
        this.logger('VWO custom variable set', { key, value, type });
        return { success: true };
      } else {
        this.logger('VWO setCustomVariable method not available');
        return { success: false, error: 'Method not available' };
      }
    } catch (error) {
      this.logger('VWO setCustomVariable failed', { error: error.message, key });
      return { success: false, error: error.message };
    }
  }

  /**
   * Get VWO experiment data
   * @param {string} experimentId - VWO experiment ID
   */
  getExperimentData(experimentId) {
    if (!this.isInitialized) {
      this.logger('VWO not initialized, cannot get experiment data');
      return { success: false, error: 'Not initialized' };
    }

    try {
      if (window.VWO && window.VWO.getExperimentData) {
        const data = window.VWO.getExperimentData(experimentId);
        this.logger('VWO experiment data retrieved', { experimentId, data });
        return { success: true, data };
      } else {
        this.logger('VWO getExperimentData method not available');
        return { success: false, error: 'Method not available' };
      }
    } catch (error) {
      this.logger('VWO getExperimentData failed', { error: error.message, experimentId });
      return { success: false, error: error.message };
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      name: 'VWO (Visual Website Optimizer)',
      enabled: this.config.enabled,
      initialized: this.isInitialized,
      accountId: this.config.accountId,
      version: window.VWO && window.VWO.getVersion ? window.VWO.getVersion() : 'unknown',
      hasTracker: !!this.vwoTracker
    };
  }
}

export default VWOIntegration;
