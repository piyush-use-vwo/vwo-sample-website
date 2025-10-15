# React Mock User Portal with Analytics Integration

A React application that demonstrates integration with three major analytics platforms: Amplitude, Mixpanel, and Blitzllama. The app includes mock authentication and comprehensive event tracking capabilities.

## Features

- **Mock Authentication System**: Login/register with persistent sessions
- **Session ID Generation**: Frontend-only session management
- **Multi-Platform Analytics**: Integrated with Amplitude, Mixpanel, and Blitzllama
- **Real-time Event Tracking**: Track custom events across all platforms
- **Analytics Dashboard**: Monitor connection status and view logs
- **User Management**: Mock user database with different roles

## Demo Credentials

- **Admin**: admin@example.com / admin123
- **User**: user@example.com / user123  
- **Demo**: demo@example.com / demo123

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Analytics Services**
   
   Edit `src/services/analytics.js` and replace the placeholder API keys:
   
   ```javascript
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
   ```

3. **Start the Application**
   ```bash
   npm start
   ```

4. **Open in Browser**
   Navigate to `http://localhost:3000`

## Analytics Integration

### Amplitude
- **SDK**: `@amplitude/analytics-browser`
- **Features**: User identification, event tracking, page views
- **Setup**: Get your API key from [Amplitude Dashboard](https://amplitude.com/)

### Mixpanel
- **SDK**: `mixpanel-browser`
- **Features**: Event tracking, user profiles, funnels
- **Setup**: Get your project token from [Mixpanel Dashboard](https://mixpanel.com/)

### Blitzllama
- **Implementation**: Mock implementation (replace with actual SDK)
- **Features**: Custom event tracking and user identification
- **Setup**: Get your API key from [Blitzllama Dashboard](https://dashboard.blitzllama.com/)

## Project Structure

```
src/
├── components/
│   ├── Login.js          # Authentication component
│   └── Dashboard.js      # Main analytics dashboard
├── services/
│   ├── analytics.js      # Analytics service (all SDKs)
│   └── auth.js          # Mock authentication service
├── App.js               # Main application component
├── index.js             # Application entry point
└── index.css            # Global styles
```

## Key Features

### Authentication
- Mock user database with different roles
- Session persistence using localStorage
- Automatic session restoration
- User registration and login

### Analytics Tracking
- **User Identification**: Track users across all platforms
- **Event Tracking**: Custom events with properties
- **Page Views**: Automatic and manual page tracking
- **Session Management**: Unique session IDs for each user

### Dashboard Features
- Real-time connection status for all services
- Event tracking interface
- Quick action buttons for common events
- Analytics logs viewer
- User information display

## Testing Analytics Integration

1. **Login** with any demo credentials
2. **Check Connection Status** in the dashboard
3. **Track Custom Events** using the event tracking form
4. **Use Quick Actions** to test common events
5. **View Logs** to see all tracked events
6. **Monitor Real-time Data** in your analytics dashboards

## Event Examples

The app tracks various events including:
- User login/logout
- Page views
- Button clicks
- Feature usage
- Search actions
- Profile updates
- Custom events

## Configuration

### Environment Variables
You can also use environment variables for API keys:

```bash
REACT_APP_AMPLITUDE_API_KEY=your_amplitude_key
REACT_APP_MIXPANEL_TOKEN=your_mixpanel_token
REACT_APP_BLITZLLAMA_API_KEY=your_blitzllama_key
```

### Disabling Services
To disable any analytics service, set `enabled: false` in the config:

```javascript
amplitude: {
  apiKey: 'YOUR_API_KEY',
  enabled: false  // Disable Amplitude
}
```

## Development

### Available Scripts
- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Adding New Events
To add new event tracking:

```javascript
analyticsService.trackEvent('your_event_name', {
  property1: 'value1',
  property2: 'value2'
});
```

## Troubleshooting

### Common Issues

1. **Analytics not working**: Check API keys in `analytics.js`
2. **Events not appearing**: Verify network requests in browser dev tools
3. **Login issues**: Clear localStorage and try again
4. **Build errors**: Ensure all dependencies are installed

### Debug Mode
Enable debug mode for Mixpanel by setting `debug: true` in the config.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for testing and learning purposes.

## Support

For issues related to:
- **Amplitude**: Check [Amplitude Documentation](https://docs.amplitude.com/)
- **Mixpanel**: Check [Mixpanel Documentation](https://developer.mixpanel.com/)
- **Blitzllama**: Check [Blitzllama Documentation](https://dashboard.blitzllama.com/)

---

**Note**: This is a mock application for testing analytics integrations. Replace mock implementations with actual SDKs and API keys for production use.
