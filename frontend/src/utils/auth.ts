import { UserAuth } from "@/types";
import api from "./api";
import { transformMongoId } from "./transformers";

// Auth functions
export const registerUser = async (email: string, password: string): Promise<UserAuth> => {
  try {
    const response = await api.post('/users/register', { email, password });
    console.log("Register response:", response.data);
    
    // Store JWT token in localStorage
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    
    // Create a standardized user object
    let userData: UserAuth;
    
    // Handle different response formats
    if (response.data.user) {
      // Format 1: { user: { id/._id, email, ... }, token: ... }
      userData = transformMongoId(response.data.user);
    } else if (response.data.username) {
      // Format 2: { username: ..., token: ... }
      // Extract user ID from token if possible
      try {
        const tokenParts = response.data.token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log("Token payload:", payload);
          
          userData = {
            id: payload.id || payload.userId || response.data.username,
            email: response.data.username || email,
            password: ''
          };
        } else {
          userData = {
            id: response.data.username,
            email: response.data.username || email,
            password: ''
          };
        }
      } catch (error) {
        userData = {
          id: response.data.username,
          email: response.data.username || email,
          password: ''
        };
      }
    } else {
      // Unknown format, create minimal user object
      userData = {
        id: email, // Use email as ID as fallback
        email: email,
        password: ''
      };
    }
    
    console.log("Standardized user data:", userData);
    
    // Store user in local storage for persistent client-side auth state
    localStorage.setItem("currentUser", JSON.stringify(userData));
    
    return userData;
  } catch (error: any) {
    if (error.response && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Registration failed");
  }
};

export const loginUser = async (email: string, password: string): Promise<UserAuth> => {
  try {
    console.log(`Attempting to login user: ${email}`);
    
    // CRITICAL FIX: Add more detailed logging and error handling
    console.log('Auth token before login:', localStorage.getItem('token'));
    
    // Ensure we're sending the correct data format
    const loginData = { email, password };
    console.log('Sending login data:', loginData);
    
    const response = await api.post('/users/login', loginData);
    console.log("Login response:", response.data);
    
    // Store JWT token in localStorage
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      console.log("Token stored in localStorage");
    }
    
    // Create a standardized user object
    let userData: UserAuth;
    
    // Handle different response formats
    if (response.data.user) {
      // Format 1: { user: { id/._id, email, ... }, token: ... }
      userData = transformMongoId(response.data.user);
      console.log("User data from response.data.user:", userData);
    } else if (response.data.username) {
      // Format 2: { username: ..., token: ... }
      // Extract user ID from token if possible
      try {
        const tokenParts = response.data.token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log("Token payload:", payload);
          
          userData = {
            id: payload.id || payload.userId || response.data.username,
            email: response.data.username || email,
            password: ''
          };
        } else {
          userData = {
            id: response.data.username,
            email: response.data.username || email,
            password: ''
          };
        }
      } catch (error) {
        userData = {
          id: response.data.username,
          email: response.data.username || email,
          password: ''
        };
      }
      console.log("User data from username format:", userData);
    } else {
      // Extract user ID from token
      try {
        const tokenParts = response.data.token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log("Token payload for unknown format:", payload);
          
          userData = {
            id: payload.id || payload._id || email,
            email: email,
            password: ''
          };
        } else {
          userData = {
            id: email, // Use email as ID as fallback
            email: email,
            password: ''
          };
        }
      } catch (error) {
        userData = {
          id: email, // Use email as ID as fallback
          email: email,
          password: ''
        };
      }
      console.log("User data from token extraction:", userData);
    }
    
    console.log("Standardized user data:", userData);
    
    // Store user in local storage for persistent client-side auth state
    localStorage.setItem("currentUser", JSON.stringify(userData));
    
    // Also store the full user data from the response if available
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
      console.log("Full user data stored in 'user' key");
    }
    
    return userData;
  } catch (error: any) {
    console.error("Login error:", error);
    
    // CRITICAL FIX: Better error handling and logging
    if (error.response) {
      console.error('Response error status:', error.response.status);
      console.error('Response error data:', error.response.data);
      
      // Handle specific status codes
      if (error.response.status === 400) {
        // For 400 Bad Request, usually means invalid credentials
        throw new Error(error.response.data?.message || 'Invalid email or password');
      } else if (error.response.status === 401) {
        // For 401 Unauthorized
        throw new Error('Authentication failed. Please check your credentials.');
      } else if (error.response.status === 404) {
        // For 404 Not Found
        throw new Error('Login service not found. Please try again later.');
      } else if (error.response.status >= 500) {
        // For server errors
        throw new Error('Server error. Please try again later.');
      }
      
      // For any other error with a message
      if (error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
    }
    
    // Generic error if we can't determine a more specific one
    throw new Error("Login failed. Please try again.");
  }
};

export const logoutUser = (): void => {
  // Remove all authentication and user data from localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("user");
  
  // Remove any other potential auth-related data
  localStorage.removeItem("authToken");
  localStorage.removeItem("userData");
  
  console.log("User logged out - all auth data cleared from localStorage");
};

export const getCurrentUser = (): UserAuth | null => {
  try {
    // Check if we have a valid token first
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found in localStorage");
      return null;
    }
    
    // Try to get user data from different possible localStorage keys
    let userString = localStorage.getItem("currentUser");
    
    // If not found in currentUser, try the "user" key
    if (!userString) {
      userString = localStorage.getItem("user");
      console.log("Trying to get user data from 'user' key:", userString);
    }
    
    if (!userString) {
      console.log("No user data found in localStorage");
      // If no user data but we have a token, try to extract user info from token
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log("Extracted payload from token:", payload);
          
          if (payload.id) {
            const userAuth: UserAuth = {
              id: payload.id,
              email: payload.email || 'user@example.com',
              password: ''
            };
            
            // Save this extracted user data to localStorage
            localStorage.setItem("currentUser", JSON.stringify(userAuth));
            console.log("Created user data from token:", userAuth);
            return userAuth;
          }
        }
      } catch (error) {
        console.error("Error extracting user data from token:", error);
      }
      
      return null;
    }
    
    const userData = JSON.parse(userString);
    console.log("Retrieved user data:", userData);
    
    // Handle different user data formats
    // Format 1: { id, email, ... }
    // Format 2: { username, token, ... }
    // Format 3: { email } - Missing ID
    // Format 4: { _id, name, email, ... } - MongoDB format
    
    let userAuth: UserAuth = {
      id: '',
      email: '',
      password: ''
    };
    
    if (userData.id) {
      // Format 1: Already has id
      userAuth.id = userData.id;
      userAuth.email = userData.email || '';
    } else if (userData._id) {
      // MongoDB format: Has _id instead of id
      userAuth.id = userData._id;
      userAuth.email = userData.email || '';
      console.log("Converted _id to id:", userAuth.id);
    } else if (userData.username && userData.token) {
      // Format 2: Has username and token
      // Extract user ID from token if possible
      try {
        // JWT tokens have 3 parts separated by dots
        const tokenParts = userData.token.split('.');
        if (tokenParts.length === 3) {
          // The middle part is the payload, which we can decode
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log("Token payload:", payload);
          
          // Extract user ID from payload
          if (payload.id) {
            userAuth.id = payload.id;
          } else if (payload.userId) {
            userAuth.id = payload.userId;
          } else {
            // If no ID in token, use username as ID
            userAuth.id = userData.username;
          }
          
          userAuth.email = userData.username; // Use username as email
          console.log("Created user auth from token:", userAuth);
        } else {
          throw new Error("Invalid token format");
        }
      } catch (error) {
        console.error("Error parsing token:", error);
        // Fallback: Use username as ID
        userAuth.id = userData.username;
        userAuth.email = userData.username;
      }
    } else if (userData.email) {
      // Format 3: Only has email - Extract ID from token
      try {
        // Get token from localStorage
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          // JWT tokens have 3 parts separated by dots
          const tokenParts = storedToken.split('.');
          if (tokenParts.length === 3) {
            // The middle part is the payload, which we can decode
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log("Token payload for email-only user:", payload);
            
            // Extract user ID from payload
            if (payload.id) {
              userAuth.id = payload.id;
              userAuth.email = userData.email;
              console.log("Created user auth from token payload:", userAuth);
            } else if (payload.userId) {
              userAuth.id = payload.userId;
              userAuth.email = userData.email;
              console.log("Created user auth from token userId:", userAuth);
            } else {
              // If no ID in token, use email as ID (not ideal but prevents errors)
              userAuth.id = userData.email;
              userAuth.email = userData.email;
              console.log("Using email as ID (fallback):", userAuth);
            }
          } else {
            throw new Error("Invalid token format");
          }
        } else {
          // No token, use email as ID (not ideal but prevents errors)
          userAuth.id = userData.email;
          userAuth.email = userData.email;
          console.log("No token available, using email as ID:", userAuth);
        }
      } catch (error) {
        console.error("Error extracting ID from token:", error);
        // Fallback: Use email as ID
        userAuth.id = userData.email;
        userAuth.email = userData.email;
      }
    }
    
    // Validate that the user data has the required fields
    if (!userAuth.id) {
      console.error("Invalid user data in localStorage:", userData);
      
      // Try to extract user ID directly from token as last resort
      try {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          const tokenParts = storedToken.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log("Last resort - Token payload:", payload);
            
            if (payload.id) {
              userAuth.id = payload.id;
              userAuth.email = userData.email || payload.email || "user@example.com";
              console.log("Created user auth from token as last resort:", userAuth);
            }
          }
        }
      } catch (error) {
        console.error("Error in last resort token extraction:", error);
      }
      
      // If still no valid ID, clear localStorage and return null
      if (!userAuth.id) {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("token");
        return null;
      }
    }
    
    // Update the user data in localStorage with the correct format
    localStorage.setItem("currentUser", JSON.stringify(userAuth));
    console.log("Updated user data in localStorage:", userAuth);
    
    return userAuth;
  } catch (error) {
    console.error("Error retrieving current user:", error);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  try {
    // Check if we have a valid token
    const token = localStorage.getItem("token");
    if (!token) {
      return false;
    }
    
    // Check if we have user data
    const user = getCurrentUser();
    return !!user;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};

// Verify token validity with the backend
export const verifyToken = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found in localStorage");
      return false;
    }
    
    console.log("Verifying token with backend...");
    
    // Make a request to verify the token
    const response = await api.get('/users/verify-token');
    console.log("Token verification response:", response.status);
    return response.status === 200;
  } catch (error) {
    console.error("Token verification failed:", error);
    return false;
  }
};

// For testing purposes - create a test user
export const createTestUser = (): UserAuth => {
  const testUser = {
    id: "test-user-id-123",
    email: "test@example.com",
    password: ""
  };
  
  // Save to localStorage
  localStorage.setItem("currentUser", JSON.stringify(testUser));
  
  // Create a fake token
  localStorage.setItem("token", "test-jwt-token");
  
  return testUser;
};

// For development only - create a test user if none exists
export const ensureTestUser = (): UserAuth | null => {
  // Check if we already have a user
  const currentUser = getCurrentUser();
  
  if (currentUser) {
    return currentUser;
  }
  
  // Create a test user for development
  return createTestUser();
};
