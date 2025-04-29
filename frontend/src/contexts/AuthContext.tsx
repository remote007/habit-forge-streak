import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, isAuthenticated, loginUser, logoutUser, registerUser, verifyToken } from '@/utils/auth';
import { UserAuth } from '@/types';
import { toast } from 'sonner';
import api from '@/utils/api'; // Assuming you have an api instance defined elsewhere
import { transformMongoId } from '@/utils/transformers'; // Import from the correct module

interface AuthContextType {
  user: UserAuth | null;
  isAuth: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAuth | null>(null); 
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false); 
  const [isUserLoading, setIsUserLoading] = useState<boolean>(true); 
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsUserLoading(true);
        console.log("Checking authentication status...");
        
        // First check if we have a token
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found, user is not authenticated");
          setUser(null);
          setIsAuth(false);
          setIsUserLoading(false);
          return;
        }
        
        console.log("Token found, checking validity...");
        
        // Check if the token is valid
        try {
          // Try to get user data from localStorage first
          const currentUser = getCurrentUser();
          
          if (currentUser) {
            console.log("User data found in localStorage:", currentUser);
            setUser(currentUser);
            setIsAuth(true);
          } else {
            console.log("No valid user data found in localStorage");
            // If no valid user data, try to verify the token with the backend
            const isValid = await verifyToken();
            
            if (isValid) {
              console.log("Token is valid but no user data, this is unusual");
              // This is unusual - we have a valid token but no user data
              // Try to fetch user data from the backend
              try {
                const response = await api.get('/users/me');
                const userData = transformMongoId(response.data);
                localStorage.setItem("currentUser", JSON.stringify(userData));
                setUser(userData);
                setIsAuth(true);
              } catch (error) {
                console.error("Failed to fetch user data:", error);
                logoutUser();
                setUser(null);
                setIsAuth(false);
              }
            } else {
              console.log("Token is invalid, logging out");
              logoutUser();
              setUser(null);
              setIsAuth(false);
            }
          }
        } catch (error) {
          console.error("Error during authentication check:", error);
          logoutUser();
          setUser(null);
          setIsAuth(false);
        }
      } finally {
        setIsUserLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await loginUser(email, password);
      setUser(user);
      setIsAuth(true);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Login failed: ' + (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await registerUser(email, password);
      setUser(user);
      setIsAuth(true);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Registration failed: ' + (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    setIsAuth(false);
    navigate('/login');
    toast.info('You have been logged out');
  };

  return (
    <AuthContext.Provider value={{ user, isAuth, login, register, logout, isLoading: isLoading || isUserLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
