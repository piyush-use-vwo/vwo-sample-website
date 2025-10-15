import { v4 as uuidv4 } from 'uuid';

// Mock authentication service
class AuthService {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.sessionToken = null;
  }

  // Mock user database
  mockUsers = [
    { id: '1', email: 'admin@example.com', password: 'admin123', name: 'Admin User', role: 'admin' },
    { id: '2', email: 'user@example.com', password: 'user123', name: 'Regular User', role: 'user' },
    { id: '3', email: 'demo@example.com', password: 'demo123', name: 'Demo User', role: 'demo' }
  ];

  // Generate a mock session token
  generateSessionToken() {
    return `mock_token_${uuidv4()}`;
  }

  // Mock login function
  async login(email, password) {
    return new Promise((resolve, reject) => {
      // Simulate API delay
      setTimeout(() => {
        const user = this.mockUsers.find(u => u.email === email && u.password === password);
        
        if (user) {
          this.currentUser = { ...user };
          this.isAuthenticated = true;
          this.sessionToken = this.generateSessionToken();
          
          // Store in localStorage for persistence
          localStorage.setItem('mockUser', JSON.stringify(this.currentUser));
          localStorage.setItem('mockSessionToken', this.sessionToken);
          localStorage.setItem('mockIsAuthenticated', 'true');
          
          resolve({
            success: true,
            user: this.currentUser,
            token: this.sessionToken
          });
        } else {
          reject({
            success: false,
            message: 'Invalid email or password'
          });
        }
      }, 1000); // 1 second delay to simulate API call
    });
  }

  // Mock logout function
  logout() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.sessionToken = null;
    
    // Clear localStorage
    localStorage.removeItem('mockUser');
    localStorage.removeItem('mockSessionToken');
    localStorage.removeItem('mockIsAuthenticated');
  }

  // Check if user is authenticated
  isLoggedIn() {
    return this.isAuthenticated;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Get session token
  getSessionToken() {
    return this.sessionToken;
  }

  // Restore session from localStorage
  restoreSession() {
    const storedUser = localStorage.getItem('mockUser');
    const storedToken = localStorage.getItem('mockSessionToken');
    const storedAuth = localStorage.getItem('mockIsAuthenticated');

    if (storedUser && storedToken && storedAuth === 'true') {
      this.currentUser = JSON.parse(storedUser);
      this.sessionToken = storedToken;
      this.isAuthenticated = true;
      return true;
    }
    return false;
  }

  // Mock user registration
  async register(userData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const { email, password, name } = userData;
        
        // Check if user already exists
        const existingUser = this.mockUsers.find(u => u.email === email);
        if (existingUser) {
          reject({
            success: false,
            message: 'User already exists'
          });
          return;
        }

        // Create new user
        const newUser = {
          id: (this.mockUsers.length + 1).toString(),
          email,
          password,
          name,
          role: 'user'
        };

        this.mockUsers.push(newUser);
        
        resolve({
          success: true,
          message: 'User registered successfully',
          user: { ...newUser, password: undefined } // Don't return password
        });
      }, 1000);
    });
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
