import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, followUser, unfollowUser } from '../api/userApi';
import { Box, Typography, Button, CircularProgress, Alert, Card, CardContent, CardHeader, Avatar } from '@mui/material';
// Removed CreatePostForm import as it's not specified for viewing other profiles

function ProfilePage() {
    const { identifier } = useParams(); // Get username or ID from URL
    const { user: loggedInUser, token, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    const fetchProfileData = useCallback(async () => {
        if (!identifier || !token) return; // Don't fetch if identifier or token is missing

        setLoading(true);
        setError('');
        try {
            const data = await getUserProfile(identifier);
            setProfile(data);
            // Check if the logged-in user is already following this profile
            // Assumes loggedInUser and data._id are available
            if (loggedInUser && data.followers) {
                setIsFollowing(data.followers.includes(loggedInUser.id));
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
            setError(err.message || 'Failed to load profile.');
            // Optional: Redirect if profile not found (e.g., 404)
            // if (err.response?.status === 404) navigate('/not-found');
        } finally {
            setLoading(false);
        }
    }, [identifier, token, loggedInUser]); // Add loggedInUser dependency

    useEffect(() => {
        // Only fetch if auth is not loading and token is present
        if (!authLoading && token) {
            fetchProfileData();
        } else if (!authLoading && !token) {
            // If auth check is done and there's no token, redirect to login
            navigate('/login');
        }
        // Add authLoading and navigate to dependency array
    }, [identifier, token, authLoading, fetchProfileData, navigate]);

    const handleFollow = async () => {
        if (!profile || !token) return;
        setFollowLoading(true);
        setError('');
        try {
            const updatedProfile = await followUser(profile._id, token);
            setIsFollowing(true);
            setProfile(updatedProfile); // Update profile state with new follower data
        } catch (err) {
            console.error("Error following user:", err);
            setError(err.message || 'Failed to follow user.');
        } finally {
            setFollowLoading(false);
        }
    };

    const handleUnfollow = async () => {
        if (!profile || !token) return;
        setFollowLoading(true);
        setError('');
        try {
            const updatedProfile = await unfollowUser(profile._id, token);
            setIsFollowing(false);
            setProfile(updatedProfile); // Update profile state with new follower data
        } catch (err) {
            console.error("Error unfollowing user:", err);
            setError(err.message || 'Failed to unfollow user.');
        } finally {
            setFollowLoading(false);
        }
    };

    // Display loading indicator while auth or profile data is loading
    if (loading || authLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    // Display error message if fetching failed
    if (error && !profile) { // Show main error only if profile couldn't be loaded at all
        return <Alert severity="error">{error}</Alert>;
    }

    // If profile data is not available after loading (and no major error)
    if (!profile) {
         return <Typography>Profile not found.</Typography>;
    }

    // Determine if the logged-in user is viewing their own profile
    const isOwnProfile = loggedInUser && loggedInUser.id === profile._id;

    return (
        <Box sx={{ padding: 2 }}>
            <Card>
                <CardHeader
                    avatar={
                        <Avatar sx={{ bgcolor: 'secondary.main' }} aria-label="recipe">
                            {profile.username ? profile.username[0].toUpperCase() : '?'}
                        </Avatar>
                    }
                    title={<Typography variant="h5">{profile.username}</Typography>}
                    subheader={`Joined: ${new Date(profile.createdAt).toLocaleDateString()}`} // Example: Display join date
                />
                <CardContent>
                    <Typography variant="body1" gutterBottom>
                        Bio: {profile.bio || 'No bio provided.'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Followers: {profile.followers?.length || 0} | Following: {profile.following?.length || 0}
                    </Typography>

                    {/* Display follow/unfollow button only if viewing another user's profile */}
                    {!isOwnProfile && token && (
                        <Button
                            variant="contained"
                            onClick={isFollowing ? handleUnfollow : handleFollow}
                            disabled={followLoading}
                            sx={{ mt: 2 }}
                        >
                            {followLoading ? <CircularProgress size={24} /> : (isFollowing ? 'Unfollow' : 'Follow')}
                        </Button>
                    )}

                     {/* Display specific follow/unfollow errors here */}
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

                    {/* Placeholder for user's posts - maybe add later */}
                    {/* <Typography variant="h6" sx={{ mt: 3 }}>Posts</Typography> */}
                    {/* Map through user's posts here */}

                </CardContent>
            </Card>
             {/* Maybe add CreatePostForm back if it's the user's own profile */}
             {/* {isOwnProfile && <CreatePostForm />} */}
        </Box>
    );
}

export default ProfilePage;