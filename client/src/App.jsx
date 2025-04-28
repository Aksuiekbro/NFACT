import React, { useState, useMemo, createContext, useContext } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'; // Added Navigate, Outlet
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage'; // Added LoginPage
import RegisterPage from './pages/RegisterPage'; // Added RegisterPage
import Navbar from './components/Navbar'; // Import Navbar
import { Container, CssBaseline, ThemeProvider, createTheme, CircularProgress, Box } from '@mui/material'; // Added CircularProgress, Box
import { useAuth } from './context/AuthContext'; // Added useAuth

// Create a context for the theme
export const ThemeContext = createContext({
  toggleTheme: () => {},
});

// Private Route Component
const PrivateRoute = () => {
  const { token, loading } = useAuth();

  if (loading) {
    // Show a loading indicator while checking auth status
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  // State to manage theme mode ('light' or 'dark')
  // Initialize state from localStorage or default to 'light'
  const [mode, setMode] = useState(() => {
    const storedMode = localStorage.getItem('themeMode');
    return (storedMode === 'light' || storedMode === 'dark') ? storedMode : 'light';
  });

  // Function to toggle theme and update localStorage
  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode); // Persist choice
      return newMode;
    });
  };

  // Create the theme based on the current mode
  // useMemo ensures the theme is only recreated when the mode changes
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: mode,
        },
      }),
    [mode],
  );

  return (
    // Provide the theme context value (the toggle function)
    <ThemeContext.Provider value={{ toggleTheme }}>
      {/* Apply the MUI theme */}
      <ThemeProvider theme={theme}>
        <CssBaseline /> {/* Ensures background matches theme */}
        <Navbar /> {/* Navbar now has access to context via useContext */}
        <Container maxWidth="lg" sx={{ mt: 2 }}> {/* Add margin top */}
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<FeedPage />} />
              <Route path="/profile/:identifier" element={<ProfilePage />} />
              {/* Add other protected routes here */}
            </Route>
            {/* Catch-all or 404 route could go here */}
          </Routes>
        </Container>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App;
