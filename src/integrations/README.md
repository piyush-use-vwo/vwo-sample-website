# Analytics Integrations

This folder contains individual integration files for each analytics service. Each integration is self-contained and follows a consistent interface.

## Structure

```
src/integrations/
├── index.js              # Centralized exports
├── amplitude.js          # Amplitude Analytics integration
├── blitzllama.js         # Blitzllama user feedback integration
├── vwo.js               # VWO A/B testing integration
├── mixpanel.js          # Mixpanel analytics integration
└── README.md            # This documentation
```

## Integration Interface

Each integration class implements the following interface:

### Methods

- `initialize()` - Initialize the integration
- `identifyUser(userId, userProperties)` - Identify a user
- `trackEvent(eventName, properties)` - Track an event
- `trackPageView(pageName, properties)` - Track a page view
- `getStatus()` - Get connection status

### Constructor

Each integration takes two parameters:
- `config` - Configuration object with API keys and settings
- `logger` - Logging function for debugging

## Integrations

### 1. Amplitude (`amplitude.js`)
- **Type**: Real SDK integration
- **SDK**: `@amplitude/analytics-browser`
- **API Key**: `43f7b07dcb7fcfe58a8091a289990c30`
- **Features**: User identification, event tracking, page views
- **Status**: ✅ Fully functional

### 2. Blitzllama (`blitzllama.js`)
- **Type**: Mock implementation (API endpoints not documented)
- **API**: Would use RESTful API calls to `https://api.blitzllama.com`
- **API Key**: `key_BJMzppuLgKVPseZ`
- **Features**: User identification, event tracking, page views, user creation
- **Status**: ⚠️ Mock implementation (actual API endpoints not publicly documented)

### 3. VWO (`vwo.js`)
- **Type**: SmartCode integration
- **Loading**: Via SmartCode in HTML head
- **Account ID**: `3000655`
- **Features**: A/B testing, custom variables, experiment data
- **Status**: ✅ Fully functional

### 4. Mixpanel (`mixpanel.js`)
- **Type**: Mock implementation (ready for real SDK)
- **SDK**: `mixpanel-browser` (when token provided)
- **Token**: Not configured
- **Features**: User identification, event tracking, revenue tracking
- **Status**: ⚠️ Mock implementation (needs real token)

## Usage

```javascript
import { AmplitudeIntegration } from '../integrations';

const integration = new AmplitudeIntegration(config, logger);
await integration.initialize();
integration.identifyUser('user123', { plan: 'pro' });
integration.trackEvent('button_click', { button: 'signup' });
```

## Configuration

Each integration is configured via environment variables:

```bash
REACT_APP_AMPLITUDE_API_KEY=43f7b07dcb7fcfe58a8091a289990c30
REACT_APP_BLITZLLAMA_API_KEY=key_BJMzppuLgKVPseZ
REACT_APP_VWO_ACCOUNT_ID=3000655
REACT_APP_MIXPANEL_TOKEN=your_mixpanel_token_here
```

## Adding New Integrations

1. Create a new integration file following the interface
2. Add the integration to `index.js`
3. Update the main analytics service to include the new integration
4. Add configuration to the analytics service constructor
5. Update the dashboard to display the new integration status

## Error Handling

All integrations include comprehensive error handling:
- Initialization failures are logged and the integration is disabled
- API call failures are logged but don't break the application
- Network errors are caught and logged appropriately

## Logging

Each integration uses the provided logger function to log:
- Initialization status
- API calls and responses
- Errors and failures
- User actions and events

This provides a unified logging experience across all integrations.
