import React, { useState, useEffect, useCallback } from 'react';
import { getUrl } from 'aws-amplify/storage'; // Ensure correct API method
import { Image, View } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';

import '@aws-amplify/ui-react/styles.css';
import './styles.css';

const ProfilePage = ({ user, onProfileImageChange }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const navigate = useNavigate();
  const defaultImagePath = 'default-pictures/user.PNG'; // Default image in case of 404 error

  

  const fetchProfileImage = useCallback(async () => {
    try {
      const result = await getUrl({
        path: `profile-pictures/${user.username}`,
        options: { validateObjectExistence: true, expiresIn: 900 }
      });
      setImageUrl(result.url); // Correctly access URL from result
      onProfileImageChange(result.url);
    } catch (error) {
      if (error.code === 'NotFound') {
        console.log('Profile image not found, using default image.');
        const defaultResult = await getUrl({
          path: defaultImagePath,
          options: { validateObjectExistence: true, expiresIn: 900 }
        });
        setImageUrl(defaultResult.url);
        onProfileImageChange(defaultResult.url);
      } else {
        console.error('Error fetching profile image: ', error);
      }
    }
  }, [user.username, onProfileImageChange, defaultImagePath]);

  useEffect(() => {
    fetchProfileImage();
  }, [fetchProfileImage]); // Ensure this runs only once on mount

  const toggleOptions = () => {
    navigate('/manage-account');
  };

  return (
    <View>
      <div className="page-container">
        <View margin="3rem 0" alignItems="center" justifyContent="center">
          {imageUrl ? (
            <>
              <Image
                src={imageUrl}
                alt="Profile Picture"
                className="profile-image" // Move style to CSS file
                onClick={toggleOptions}
                onMouseEnter={(e) => (e.target.style.transform = 'scale(1.1)')}
                onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
              />
              <h2 style={{ marginTop: '1rem' }}>{user.getAttributes.name}</h2>
            </>
          ) : (
            <p>No profile picture uploaded .</p>
          )}
        </View>
      </div>
    </View>
  );
};

export default ProfilePage;
