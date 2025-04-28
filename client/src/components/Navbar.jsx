import React, { useContext } from 'react'; // Import useContext
import { AppBar, Toolbar, Typography, Button, Box, IconButton, useTheme } from '@mui/material'; // Import IconButton, useTheme
import { Link } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Dark mode icon
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Light mode icon
import { ThemeContext } from '../App'; // Import the context from App.jsx

function Navbar() {
  const theme = useTheme(); // Get the current theme
  const { toggleTheme } = useContext(ThemeContext); // Get the toggle function from context

  return (
    <AppBar position="sticky">
      <Toolbar>
        {/* App Title */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Bailanysta
        </Typography>

        {/* Navigation Links */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}> {/* Align items */}
          <Button color="inherit" component={Link} to="/" sx={{ textDecoration: 'none', mr: 1 }}>
            Feed
          </Button>
          <Button color="inherit" component={Link} to="/profile" sx={{ textDecoration: 'none', mr: 1 }}> {/* Add margin right */}
            Profile
          </Button>

          {/* Theme Toggle Button */}
          <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          {/* Add other links/buttons later */}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;