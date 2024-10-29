import React, { useState, useEffect, useCallback } from 'react';
import { getUrl, uploadData, remove } from 'aws-amplify/storage';
import { deleteUser } from '@aws-amplify/auth';
import { Button, Flex, Heading, Image, TextField, View } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import './styles.css';

const ManageAccountPage = ({ user, onProfileImageChange }) => {
  const [profilePic, setProfilePic] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showFileInput, setShowFileInput] = useState(false); // State to toggle file input visibility
  const [errorMessage, setErrorMessage] = useState('');

  // Default image path for users without a profile picture
  const defaultImagePath = 'default-pictures/user.PNG';

  // Fetch existing profile picture on mount
  const fetchProfileImage = useCallback(async () => {
    try {
      const linkToStorageFile = await getUrl({
        path: `profile-pictures/${user.username}`,
        options: { validateObjectExistence: true, expiresIn: 900 }
      });
      setImageUrl(linkToStorageFile.url); // Update with the signed URL
      onProfileImageChange(linkToStorageFile.url);
    } catch (error) {
      console.log('No existing profile picture found, using default.');
      const defaultLinkToStorageFile = await getUrl({
        path: defaultImagePath,
        options: { validateObjectExistence: true, expiresIn: 900 }
      });
      setImageUrl(defaultLinkToStorageFile.url); // Use the signed URL for the default image
      onProfileImageChange(defaultLinkToStorageFile.url);
    }
  }, [user.username, onProfileImageChange, defaultImagePath]);

  useEffect(() => {
    fetchProfileImage();
  }, [fetchProfileImage]);

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePic(file); // Store the selected file
      setErrorMessage(''); // Clear any error messages
    }
  };

  // Upload the selected profile picture to S3
  const uploadProfilePic = async (event) => {
    event.preventDefault();
    if (!profilePic) {
      setErrorMessage('Please select a valid image file.');
      return;
    }

    setUploading(true);

    try {
      // Upload the file to S3
      await uploadData({
        path: `profile-pictures/${user.username}`,
        data: profilePic,
        options: { contentType: profilePic.type }
      });

      // Fetch the new URL of the uploaded image
      const linkToStorageFile = await getUrl({
        path: `profile-pictures/${user.username}`,
        options: { validateObjectExistence: true, expiresIn: 900 }
      });

      setImageUrl(linkToStorageFile.url); // Update the displayed image
      onProfileImageChange(linkToStorageFile.url); // Notify parent of profile picture change
      setProfilePic(null);
      setUploading(false);
      setShowFileInput(false); // Hide file input after successful upload

    } catch (error) {
      console.error('Upload error:', error);
      setErrorMessage(`Failed to upload the profile picture: ${error.message}`);
      setUploading(false);
    }
  };

  // Delete the profile picture from S3 and reset to default
  const deleteProfilePic = async () => {
    try {
      await remove({
        path: `profile-pictures/${user.username}`
      });
      const defaultLinkToStorageFile = await getUrl({
        path: defaultImagePath,
        options: { validateObjectExistence: true, expiresIn: 900 }
      });
      setImageUrl(defaultLinkToStorageFile.url); // Reset to default image
      onProfileImageChange(defaultLinkToStorageFile.url); // Notify parent of profile picture removal
    } catch (error) {
      console.error('Error deleting profile picture:', error);
    }
  };

  const handleDeleteUser = async () => {
    const confirmation = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
  
    if (confirmation) {
      try {
        await deleteUser(); // Use deleteUser function from Amplify Auth
        alert('Account deleted successfully.');
        // Optionally, redirect the user after account deletion
      } catch (error) {
        setErrorMessage(`Error deleting account: ${error.message}`);
      }
    }
  };

  return (
    <View>
         <div className='page-container'>
      <Heading level={1}>Manage Account</Heading>
      
      {/* Flex container to align profile picture and buttons */}
      <Flex direction="row" alignItems="center" margin="3rem 0">
        {/* Display Current Profile Picture */}
        {imageUrl ? (
          <Image src={imageUrl} alt="Profile Picture" style={{ width: 150, height: 150, borderRadius: '50%' }} />
        ) : (
          <p>No profile picture uploaded</p>
        )}

        {/* File Input and Buttons */}
        <Flex direction="column" marginLeft="2rem">
          {showFileInput && (
            <>
              <TextField
                name="profilePic"
                as="input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                labelHidden
                style={{ marginBottom: '1rem' }}
              />
              <Button onClick={uploadProfilePic} variation="primary" disabled={uploading} style={{ marginBottom: '1rem' }}>
                {uploading ? 'Uploading...' : 'Upload Profile Picture'}
              </Button>
            </>
          )}
          <Button onClick={() => setShowFileInput(!showFileInput)} variation="primary" style={{ marginBottom: '1rem' }}>
            {showFileInput ? 'Cancel' : 'Update Profile Picture'}
          </Button>
          <Button onClick={deleteProfilePic} variation="link">
            Delete Profile Picture
          </Button>
        </Flex>
      </Flex>

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      {/* Account Management */}
      <Heading level={2}>Account Actions</Heading>
      <Button onClick={handleDeleteUser}>Delete Account 😢</Button>
      </div>
    </View>
  );
};

export default ManageAccountPage;
