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
    { id: 'admin_user_001', email: 'admin@example.com', password: 'admin123', name: 'Admin User', role: 'admin' },
    { id: 'regular_user_002', email: 'user@example.com', password: 'user123', name: 'Regular User', role: 'user' },
    { id: 'demo_user_003', email: 'demo@example.com', password: 'demo123', name: 'Demo User', role: 'demo' }
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

  // Clear old localStorage data (for migration)
  clearOldData() {
    // Clear any old user data that might have short IDs
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.id && user.id.length < 5) {
          localStorage.removeItem('mockUser');
          localStorage.removeItem('mockSessionToken');
          localStorage.removeItem('mockIsAuthenticated');
          console.log('Cleared old user data with short ID format');
        }
      } catch (error) {
        // If parsing fails, clear the data
        localStorage.removeItem('mockUser');
        localStorage.removeItem('mockSessionToken');
        localStorage.removeItem('mockIsAuthenticated');
      }
    }
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
      const user = JSON.parse(storedUser);
      
      // Check if user has old short ID format and update it
      if (user.id && user.id.length < 5) {
        const updatedUser = this.updateUserToNewFormat(user);
        this.currentUser = updatedUser;
        // Update localStorage with new format
        localStorage.setItem('mockUser', JSON.stringify(updatedUser));
      } else {
        this.currentUser = user;
      }
      
      this.sessionToken = storedToken;
      this.isAuthenticated = true;
      return true;
    }
    return false;
  }

  // Update old user format to new format
  updateUserToNewFormat(oldUser) {
    const idMapping = {
      '1': 'admin_user_001',
      '2': 'regular_user_002', 
      '3': 'demo_user_003'
    };
    
    return {
      ...oldUser,
      id: idMapping[oldUser.id] || oldUser.id
    };
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
