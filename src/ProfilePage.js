import React, { useState, useEffect, useCallback } from 'react';
import { getUrl } from 'aws-amplify/storage'; // AWS Amplify storage method to fetch URLs
import { Image, View } from '@aws-amplify/ui-react'; // UI components from AWS Amplify
import { useNavigate } from 'react-router-dom'; // Hook for navigation

import '@aws-amplify/ui-react/styles.css';
import './styles.css'; // Custom styles

const ProfilePage = ({ user, onProfileImageChange }) => {
  const [imageUrl, setImageUrl] = useState(null); // State for storing the profile image URL
  const navigate = useNavigate(); // Hook for routing/navigation
  const defaultImagePath = 'default-pictures/user.PNG'; // Path to the default image if the profile picture is not found

  // Function to fetch the user's profile image from S3
  const fetchProfileImage = useCallback(async () => {
    try {
      // Attempt to get the profile image URL from S3
      const result = await getUrl({
        path: `profile-pictures/${user.username}`, // Path to the user's profile image in S3
        options: { validateObjectExistence: true, expiresIn: 900 } // Options to check existence and set URL expiration
      });
      setImageUrl(result.url); // Set the fetched image URL in state
      onProfileImageChange(result.url); // Notify parent component of the image change
    } catch (error) {
      // If the image is not found, use the default image
      if (error.code === 'NotFound') {
        console.log('Profile image not found, using default image.');
        const defaultResult = await getUrl({
          path: defaultImagePath, // Path to the default image
          options: { validateObjectExistence: true, expiresIn: 900 } // Options to validate and set URL expiration
        });
        setImageUrl(defaultResult.url); // Set the default image URL
        onProfileImageChange(defaultResult.url); // Notify parent component of the image change
      } else {
        // Log any other errors
        console.error('Error fetching profile image: ', error);
      }
    }
  }, [user.username, onProfileImageChange, defaultImagePath]);

  // Fetch the profile image when the component mounts
  useEffect(() => {
    fetchProfileImage(); // Fetch the profile image on component mount
  }, [fetchProfileImage]); // Only run once on mount

  // Function to navigate to the manage account page
  const toggleOptions = () => {
    navigate('/manage-account'); // Navigate to the account management page
  };

  return (
    <View>
      <div className="page-container">
        <View margin="3rem 0" alignItems="center" justifyContent="center">
          {imageUrl ? (
            <>
              {/* Profile Image */}
              <Image
                src={imageUrl}
                alt="Profile Picture" // Descriptive alt text for accessibility
                className="profile-image" // Use a CSS class for styling
                onClick={toggleOptions} // Navigate to manage account when the image is clicked
                onMouseEnter={(e) => (e.target.style.transform = 'scale(1.1)')} // Slight zoom effect on hover
                onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')} // Revert zoom effect when hover ends
              />
              {/* Username Display */}
              <h2 style={{ marginTop: '1rem' }}>{user.username}</h2> {/* Display the username */}
            </>
          ) : (
            // Message displayed if no profile image is available
            <p>No profile picture uploaded.</p>
          )}
        </View>
      </div>
    </View>
  );
};

export default ProfilePage;
