import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, followUser, unfollowUser } from '../api/userApi';
import { getUserPosts } from '../api/postApi'; // Import getUserPosts
import { Box, Typography, Button, CircularProgress, Alert, Card, CardContent, CardHeader, Avatar, Grid } from '@mui/material'; // Added Grid
import PostCard from '../components/PostCard'; // Import PostCard

function ProfilePage() {
    const { identifier } = useParams(); // Get username or ID from URL
    const { user: loggedInUser, token, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [userPosts, setUserPosts] = useState([]); // State for user's posts
    const [postsLoading, setPostsLoading] = useState(false); // Loading state for posts
    const [postsError, setPostsError] = useState(''); // Error state for posts

    const fetchProfileData = useCallback(async () => {
        if (!identifier || !token) return; // Don't fetch if identifier or token is missing

        setLoading(true);
        setError('');
        try {
            const data = await getUserProfile(identifier);
            setProfile(data);
            // Check if the logged-in user is already following this profile
            // Check if loggedInUser's ID is in the fetched profile's followers list
            if (loggedInUser?._id && data?.followers) {
                 // Ensure IDs are compared as strings for reliable .includes() check
                setIsFollowing(data.followers.map(id => id.toString()).includes(loggedInUser._id.toString()));
            } else {
                 setIsFollowing(false); // Default if data is missing
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

    // Effect to fetch user's posts once profile data is available
    useEffect(() => {
        const fetchUserPosts = async () => {
            if (!profile?._id || !token) return; // Need profile ID and token

            setPostsLoading(true);
            setPostsError('');
            try {
                const postsData = await getUserPosts(profile._id, token);
                setUserPosts(postsData);
            } catch (err) {
                console.error("Error fetching user posts:", err);
                setPostsError(err.message || 'Failed to load posts.');
            } finally {
                setPostsLoading(false);
            }
        };

        fetchUserPosts();
    }, [profile?._id, token]); // Re-fetch if profile ID or token changes

    const handleFollow = async () => {
        if (!profile || !token) return;
        setFollowLoading(true);
        setError('');
        try {
            await followUser(profile._id, token); // Call API
            // Optimistically update button state immediately
            setIsFollowing(true);
            // Refetch profile data to update counts etc.
            await fetchProfileData();
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
            await unfollowUser(profile._id, token); // Call API
            // Optimistically update button state immediately
            setIsFollowing(false);
             // Refetch profile data to update counts etc.
            await fetchProfileData();
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

                </CardContent>
            </Card>

            {/* Display User's Posts */}
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                Posts by {profile.username}
            </Typography>
            {postsLoading && (
                 <Box display="flex" justifyContent="center" sx={{ my: 2 }}><CircularProgress /></Box>
            )}
            {postsError && <Alert severity="error" sx={{ mb: 2 }}>{postsError}</Alert>}
            {!postsLoading && !postsError && userPosts.length === 0 && (
                <Typography>This user hasn't posted anything yet.</Typography>
            )}
            {!postsLoading && !postsError && userPosts.length > 0 && (
                 <Grid container spacing={2}>
                    {userPosts.map((post) => (
                        <Grid item xs={12} sm={6} md={4} key={post._id}>
                             {/* Assuming PostCard takes post data as prop */}
                             {/* You might need to adjust PostCard props based on its definition */}
                            <PostCard post={post} />
                        </Grid>
                    ))}
                </Grid>
            )}

             {/* Maybe add CreatePostForm back if it's the user's own profile */}
             {/* {isOwnProfile && <CreatePostForm />} */}
        </Box>
    );
}

export default ProfilePage;