import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import ProfilePage from "./ProfilePage";
import ReelPage from "./ReelPage";
import ManageAccountPage from "./ManageAccountPage"; // Import Manage Account page
import Introduction from "./Introduction";
import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import awsExports from "./aws-exports";
import { getUrl } from 'aws-amplify/storage'; // Import AWS storage helper
import "./styles.css";

// Configure Amplify with AWS exports
Amplify.configure(awsExports);

const App = () => {
  // Local state management
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication status
  const [profileImageUrl, setProfileImageUrl] = useState(localStorage.getItem('profileImageUrl') || null); // Persist profile image in localStorage
  const [user, setUser] = useState(null); // Store current user info

  // Function to fetch profile image from AWS storage
  const fetchProfileImage = async (username) => {
    try {
      // Try fetching the user's profile image from S3
      const linkToStorageFile = await getUrl({
        path: `profile-pictures/${username}`,
        options: { validateObjectExistence: true, expiresIn: 900 }
      });
      // Set and persist profile image in localStorage
      setProfileImageUrl(linkToStorageFile.url);
      localStorage.setItem('profileImageUrl', linkToStorageFile.url);
    } catch (error) {
      console.log("No profile picture found for the user, setting default image.");
      // If no profile picture, set a default image
      const defaultLinkToStorageFile = await getUrl({
        path: 'default-pictures/user.PNG', // Default image
        options: { validateObjectExistence: true, expiresIn: 900 }
      });
      setProfileImageUrl(defaultLinkToStorageFile.url);
      localStorage.setItem('profileImageUrl', defaultLinkToStorageFile.url);
    }
  };

  // useEffect hook to handle actions after user logs in
  useEffect(() => {
    if (user && !isAuthenticated) {
      setIsAuthenticated(true);
      fetchProfileImage(user.username); // Fetch the profile image once the user is authenticated
    }
  }, [user, isAuthenticated]);

  // Handler for changing profile image
  const handleProfileImageChange = (imageUrl) => {
    setProfileImageUrl(imageUrl);
    localStorage.setItem('profileImageUrl', imageUrl); // Persist updated image URL to localStorage
  };

  // Handler for signing out
  const handleSignOut = (signOut) => {
    signOut();
    setIsAuthenticated(false);
    localStorage.removeItem('profileImageUrl'); // Clear profile image on sign-out
    setTimeout(() => {
      window.location.reload(); // Reload page to reset app state
    }, 500); // Delay of 500ms before reloading
  };

  return (
    <div>
      {/* Show Introduction only when the user is not authenticated */}
      {!isAuthenticated && <Introduction />}
      
      {/* Amplify Authenticator Component */}
      <Authenticator
        formFields={{
          signUp: {
            name: {
              placeholder: "Name",
              label: "Name", // Name field in sign-up form
              required: true,
              order: 1
            },
            username: {
              placeholder: "Username",
              label: "Username", // Username field in sign-up form
              required: true,
              order: 2
            },
            email: {
              placeholder: "Email",
              label: "Email", // Email field in sign-up form
              required: true,
              order: 3
            },
            phone_number: {
              placeholder: "Phone Number (optional)",
              label: "Phone Number", // Optional phone number field in sign-up form
              required: false
            },
          },
        }}
      >
        {({ signOut, user: currentUser }) => {
          // Set current user after login
          if (currentUser && !user) {
            setUser(currentUser);
          }

          return (
            <>
              {/* If user is authenticated, show the main app */}
              {currentUser ? (
                <>
                  {/* Navbar Component with profile image and sign-out logic */}
                  <Navbar
                    isAuthenticated={!!currentUser}
                    signOut={() => handleSignOut(signOut)}
                    profileImageUrl={profileImageUrl} // Pass profile image URL to Navbar
                  />
                  
                  {/* App Routes */}
                  <Routes>
                    <Route path="/" 
                      element={
                        <ProfilePage
                          user={currentUser}
                          onProfileImageChange={handleProfileImageChange} // Pass profile image change handler to ProfilePage
                        />
                      }
                    />
                    <Route path="/reel" element={<ReelPage />} />
                    <Route
                      path="/manage-account"
                      element={
                        <ManageAccountPage
                          user={currentUser}
                          onProfileImageChange={handleProfileImageChange} // Pass profile image change handler to ManageAccountPage
                        />
                      }
                    />
                  </Routes>
                </>
              ) : (
                <>
                  {/* Show Introduction if not authenticated */}
                  {!isAuthenticated && <Introduction />}
                  <div className="auth-container">
                    <Authenticator />
                  </div>
                </>
              )}
            </>
          );
        }}
      </Authenticator>
    </div>
  );
};

export default App;
