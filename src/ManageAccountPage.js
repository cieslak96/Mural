import React, { useState, useEffect, useCallback } from 'react';
import { getUrl, uploadData, remove } from 'aws-amplify/storage';
import { deleteUser } from '@aws-amplify/auth';
import { Button, Flex, Heading, Image, TextField, View } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import "./styles.css";



const ManageAccountPage = ({ user, onProfileImageChange }) => {
  // State hooks for managing component data
  const [profilePic, setProfilePic] = useState(null); // Holds the selected image file for upload
  const [imageUrl, setImageUrl] = useState(null); // URL of the profile picture
  const [uploading, setUploading] = useState(false); // Flag to indicate if the image is being uploaded
  const [showFileInput, setShowFileInput] = useState(false); // Controls visibility of the file input field
  const [errorMessage, setErrorMessage] = useState(''); // Stores error messages

  // Default image path for users without a profile picture
  const defaultImagePath = 'default-pictures/user.PNG';

  // Function to fetch the user's existing profile picture from S3
  const fetchProfileImage = useCallback(async () => {
    try {
      // Try to get the URL of the user's profile picture from S3
      const linkToStorageFile = await getUrl({
        path: `profile-pictures/${user.username}`,
        options: { validateObjectExistence: true, expiresIn: 900 }
      });
      setImageUrl(linkToStorageFile.url); // Update the image URL state
      onProfileImageChange(linkToStorageFile.url); // Notify parent component of the image URL
    } catch (error) {
      // If no profile picture is found, use the default image
      console.log('No existing profile picture found, using default.');
      const defaultLinkToStorageFile = await getUrl({
        path: defaultImagePath,
        options: { validateObjectExistence: true, expiresIn: 900 }
      });
      setImageUrl(defaultLinkToStorageFile.url); // Set the default image URL
      onProfileImageChange(defaultLinkToStorageFile.url); // Notify parent component
    }
  }, [user.username, onProfileImageChange, defaultImagePath]);

  // Fetch the profile image when the component mounts
  useEffect(() => {
    fetchProfileImage();
  }, [fetchProfileImage]);

  // Handle file selection for uploading
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePic(file); // Store the selected file
      setErrorMessage(''); // Clear any previous error messages
    }
  };

  // Function to upload the selected profile picture to S3
  const uploadProfilePic = async (event) => {
    event.preventDefault();
    if (!profilePic) {
      setErrorMessage('Please select a valid image file.');
      return;
    }

    setUploading(true); // Set the uploading flag to true

    try {
      // Upload the file to S3
      await uploadData({
        path: `profile-pictures/${user.username}`,
        data: profilePic,
        options: { contentType: profilePic.type }
      });

      // Wait for a short delay before fetching the new image URL
      setTimeout(async () => {
        const linkToStorageFile = await getUrl({
          path: `profile-pictures/${user.username}`,
          options: { validateObjectExistence: true, expiresIn: 900 }
        });

        // Add a unique timestamp to the URL to bypass browser cache
        const updatedUrl = `${linkToStorageFile.url}?timestamp=${new Date().getTime()}`;
        setImageUrl(updatedUrl); // Update the image URL
        onProfileImageChange(updatedUrl); // Notify parent component
      }, 2000); // 2-second delay

      setProfilePic(null); // Clear the selected file
      setUploading(false); // Reset the uploading flag
      setShowFileInput(false); // Hide the file input field
    } catch (error) {
      // Handle any errors during the upload process
      console.error('Upload error:', error);
      setErrorMessage(`Failed to upload the profile picture: ${error.message}`);
      setUploading(false); // Reset the uploading flag
    }
  };

  // Function to delete the profile picture and reset to the default image
  const deleteProfilePic = async () => {
    try {
      await remove({
        path: `profile-pictures/${user.username}`
      });
      // Fetch and set the default image URL
      const defaultLinkToStorageFile = await getUrl({
        path: defaultImagePath,
        options: { validateObjectExistence: true, expiresIn: 900 }
      });
      setImageUrl(defaultLinkToStorageFile.url); // Update the image URL
      onProfileImageChange(defaultLinkToStorageFile.url); // Notify parent component
    } catch (error) {
      console.error('Error deleting profile picture:', error);
    }
  };

  // Function to delete the user account
  const handleDeleteUser = async () => {
    const confirmation = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');

    if (confirmation) {
      try {
        await deleteUser(); // Use Amplify Auth to delete the user account
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
          {imageUrl ? (
            <Image src={imageUrl} alt="Profile Picture" style={{ width: 150, height: 150, borderRadius: '50%' }} />
          ) : (
            <p>No profile picture uploaded</p>
          )}

          <Flex direction="column" marginLeft="2rem">
            {showFileInput && (
              <>
                {/* File input for selecting a profile picture */}
                <TextField
                  name="profilePic"
                  as="input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  labelHidden
                  style={{ marginBottom: '1rem' }}
                />
                {/* Button to upload the selected profile picture */}
                <Button onClick={uploadProfilePic} variation="primary" disabled={uploading} style={{ marginBottom: '1rem' }}>
                  {uploading ? 'Uploading...' : 'Upload Profile Picture'}
                </Button>
              </>
            )}
            {/* Button to toggle the file input visibility */}
            <Button onClick={() => setShowFileInput(!showFileInput)} variation="primary" style={{ marginBottom: '1rem' }}>
              {showFileInput ? 'Cancel' : 'Update Profile Picture'}
            </Button>
            {/* Button to delete the profile picture */}
            <Button onClick={deleteProfilePic} variation="link">
              Delete Profile Picture
            </Button>
          </Flex>
        </Flex>

        {/* Display error messages */}
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

        {/* Account management section */}
        <Heading level={2}>Account Actions</Heading>
        {/* Button to delete the user account */}
        <Button onClick={handleDeleteUser}>Delete Account 😢</Button>
      </div>
    </View>
  );
};

export default ManageAccountPage;
