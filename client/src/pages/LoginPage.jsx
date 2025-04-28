 import React, { useState } from 'react'; // Removed unused useContext
import { useNavigate, Link as RouterLink } from 'react-router-dom'; // Added Link
// import axios from 'axios'; // No longer needed for the login call itself
import { useAuth } from '../context/AuthContext'; // Import useAuth
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link, // Added MUI Link
  Grid, // Added Grid
} from '@mui/material';
// Import AuthContext later when it's created
// Removed incorrect import of AuthContext

const LoginPage = () => {
  const [formData, setFormData] = useState({
    identifier: '', // Changed from email to identifier
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Keep navigate if needed for other purposes, otherwise context handles login redirect
  const { login } = useAuth(); // Get login function from context

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
        // Check identifier instead of email
        if (!formData.identifier || !formData.password) {
          setError('Email/Username and Password are required.');
          return;
    }

    try {
      // Use the login function from AuthContext
      // Context handles setting token, user, headers, and navigation on success
      await login(formData);

      // No need for manual navigation or state clearing here if context handles it
      // setError(''); // Context's login throws error, handled below

    } catch (err) {
      // Error object is already processed and re-thrown by the context's login function
      console.error('Login error (from context):', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
            // Clear password field on error, keep identifier
            setFormData({ ...formData, password: '' });
          }
        };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="identifier" // Changed id
                        label="Email Address or Username"
                        name="identifier" // Changed name from email to identifier
                        autoComplete="username email" // Allow browser to suggest either
                        autoFocus
                        value={formData.identifier} // Use identifier value
            onChange={handleChange}
            error={!!error} // Highlight both fields on error
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            error={!!error} // Highlight both fields on error
          />
          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Login
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link component={RouterLink} to="/register" variant="body2">
                {"Don't have an account? Register"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;