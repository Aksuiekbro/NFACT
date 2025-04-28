import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// Create Context
const AuthContext = createContext();

// API Base URL (Consider moving to a config file or env variable)
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Provider Component
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null); // Store user details if needed
  const [loading, setLoading] = useState(true); // Indicate initial loading state
  const navigate = useNavigate(); // Hook for navigation

  // Effect to load user data based on token on initial load
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          // Optional: Fetch user data if you have an endpoint like /api/auth/me
          // const response = await axios.get(`${API_URL}/auth/me`);
          // setUser(response.data.user);
          // For now, just set loading to false if token exists
          setLoading(false);
        } catch (error) {
          console.error('Failed to fetch user data on load:', error);
          // Token might be invalid, clear it
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          delete axios.defaults.headers.common['Authorization'];
          setLoading(false);
        }
      } else {
        setLoading(false); // No token, finished loading
      }
    };
    initializeAuth();
  }, [token]); // Rerun if token changes externally (though unlikely here)

  // Register function
  const register = async (userData) => {
    // No need to handle state here, RegisterPage handles UI feedback
    // Just make the API call
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      return response; // Return response for RegisterPage to handle success/redirect
    } catch (error) {
      console.error('Registration error in context:', error.response?.data || error.message);
      throw error; // Re-throw error for RegisterPage to handle
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      const { token: receivedToken /*, user: receivedUser */ } = response.data; // Assuming backend sends token and optionally user

      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      // setUser(receivedUser); // Set user if backend provides it
      axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
      navigate('/'); // Navigate to home/feed after successful login
      return response; // Return response if needed elsewhere
    } catch (error) {
      console.error('Login error in context:', error.response?.data || error.message);
      // Clear any potential leftover invalid token
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
      throw error; // Re-throw error for LoginPage to handle
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login'); // Redirect to login page after logout
  };

  // Context value
  const value = {
    token,
    user,
    loading, // Provide loading state
    login,
    logout,
    register, // Provide register function
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use Auth Context
export const useAuth = () => {
  return useContext(AuthContext);
};