import React, { useState } from "react";
import Introduction from "./Introduction"; // Import the Introduction component
import "./styles.css";


const ReelPage = () => {
  const [videos, setVideos] = useState([]); // State to store uploaded videos

  // Function to handle video upload
  const handleVideoUpload = (event) => {
    const file = event.target.files[0]; // Get the selected file from the input
    if (file) {
      const videoURL = URL.createObjectURL(file); // Create a temporary URL for the video
      setVideos([...videos, { url: videoURL, name: file.name }]); // Add the new video to the list of videos
    }
  };

  return (
    <>
      {/* Introduction Component */}
      <Introduction />

      {/* Main Reel Page Content */}
      <div className="reel-page">
        <h2>Reel</h2>
        <p>Upload and view your video reels here.</p>

        {/* Video Upload Section */}
        <div className="upload-section">
          <h3>Upload Your Video Reel</h3>
          <input type="file" accept="video/*" onChange={handleVideoUpload} /> {/* Input for video upload */}
        </div>

        {/* Video Gallery */}
        <div className="video-gallery">
          {videos.length > 0 ? (
            // Map through the videos array and display each video
            videos.map((video, index) => (
              <div key={index} className="video-card">
                <video controls>
                  <source src={video.url} type="video/mp4" /> {/* Video source */}
                  Your browser does not support the video tag.
                </video>
                <h4>{video.name}</h4> {/* Display the video name */}
              </div>
            ))
          ) : (
            // Message displayed when no videos have been uploaded
            <p>No videos uploaded yet. Upload a video to get started!</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ReelPage;
