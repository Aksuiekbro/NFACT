import React, { useState, useEffect, useContext } from 'react'; // Import useState, useEffect
import { AppBar, Toolbar, Typography, Button, Box, IconButton, useTheme, Badge, Menu, MenuItem, CircularProgress } from '@mui/material'; // Import Badge, Menu, MenuItem, CircularProgress
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import NotificationsIcon from '@mui/icons-material/Notifications'; // Import NotificationsIcon
import { ThemeContext } from '../App';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../api/notificationApi'; // Import notification API helpers

function Navbar() {
  const theme = useTheme();
  const { toggleTheme } = useContext(ThemeContext);
  const { token, logout, user } = useAuth(); // Add user
  const navigate = useNavigate(); // For potential navigation on notification click

  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const open = Boolean(anchorEl);

  // Fetch notifications
  useEffect(() => {
    if (!token) {
      setNotifications([]); // Clear notifications if logged out
      return;
    }

    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getNotifications(token);
        setNotifications(data || []); // Ensure data is an array
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        setError("Failed to load notifications.");
        setNotifications([]); // Clear notifications on error
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    // Optional: Add polling interval here if needed
    // const intervalId = setInterval(fetchNotifications, 30000); // Fetch every 30 seconds
    // return () => clearInterval(intervalId); // Cleanup interval on unmount

  }, [token]); // Re-fetch when token changes (login/logout)

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMarkRead = async (id) => {
    const notification = notifications.find(n => n._id === id);
    if (!notification || notification.isRead) {
      handleMenuClose(); // Close menu even if already read or not found
      return; // Don't call API if already read
    }

    try {
      await markNotificationAsRead(id, token);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
      // Optional: Navigate to the related content
      // if (notification.link) navigate(notification.link);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      // Optionally show an error to the user
    } finally {
      handleMenuClose();
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return; // Don't call API if nothing is unread

    // Optimistic UI update
    const previousNotifications = [...notifications];
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    handleMenuClose(); // Close menu immediately

    try {
      await markAllNotificationsAsRead(token);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      setNotifications(previousNotifications); // Revert on error
      // Optionally show an error to the user
    }
  };


  return (
    <AppBar position="sticky">
      <Toolbar>
        {/* App Title */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Bailanysta
        </Typography>

        {/* Navigation Links */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}> {/* Align items */}
          {token ? (
            <>
              {/* Links for logged-in users */}
              <Button color="inherit" component={Link} to="/" sx={{ textDecoration: 'none', mr: 1 }}>
                Feed
              </Button>
              {/* Use user._id for the profile link */}
              <Button color="inherit" component={Link} to={user ? `/profile/${user._id}` : '/login'} sx={{ textDecoration: 'none', mr: 1 }}>
                Profile
              </Button>
              <Button color="inherit" onClick={logout} sx={{ mr: 1 }}> {/* Logout Button */}
                Logout
              </Button>
            </>
          ) : (
            <>
              {/* Links for logged-out users */}
              <Button color="inherit" component={Link} to="/login" sx={{ textDecoration: 'none', mr: 1 }}>
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register" sx={{ textDecoration: 'none', mr: 1 }}>
                Register
              </Button>
            </>
          )}

          {/* Notification Icon (Visible when logged in) */}
          {token && (
            <IconButton
              size="large"
              aria-label={`show ${unreadCount} new notifications`}
              color="inherit"
              onClick={handleMenuOpen}
              sx={{ ml: 1 }} // Add margin like other buttons
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          )}

          {/* Theme Toggle Button (Always Visible) */}
          <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
      </Toolbar>

      {/* Notifications Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          style: {
            maxHeight: 400, // Limit height
            width: '35ch',  // Set a reasonable width
          },
        }}
      >
        {loading && <MenuItem disabled><CircularProgress size={20} sx={{ mr: 1 }}/> Loading...</MenuItem>}
        {error && <MenuItem disabled sx={{ color: 'error.main' }}>{error}</MenuItem>}
        {!loading && !error && notifications.length === 0 && (
          <MenuItem disabled>No new notifications</MenuItem>
        )}
        {!loading && !error && notifications.length > 0 &&
          notifications.map((notification) => (
            <MenuItem
              key={notification._id}
              onClick={() => handleMarkRead(notification._id)}
              sx={{
                whiteSpace: 'normal', // Allow text wrapping
                fontWeight: notification.isRead ? 'normal' : 'bold', // Bold unread
                backgroundColor: !notification.isRead ? theme.palette.action.hover : 'inherit', // Subtle background for unread
                '&:hover': {
                   backgroundColor: !notification.isRead ? theme.palette.action.selected : theme.palette.action.hover, // Adjust hover for unread
                }
              }}
            >
              {notification.message || 'Notification message missing'} {/* Fallback message */}
            </MenuItem>
          ))
        }
        {!loading && !error && unreadCount > 0 && (
           <MenuItem onClick={handleMarkAllRead} sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 1 }}>
             Mark all as read
           </MenuItem>
        )}
      </Menu>
    </AppBar>
  );
}

export default Navbar;