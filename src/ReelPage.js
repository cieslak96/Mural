import React, { useState } from "react";
import './styles.css'; // Import the CSS file for styling
import "./Introduction";
import Introduction from "./Introduction";


const ReelPage = () => {
  const [videos, setVideos] = useState([]);

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const videoURL = URL.createObjectURL(file);
      setVideos([...videos, { url: videoURL, name: file.name }]);
    }
  };

  return (
    <><Introduction></Introduction><div className="reel-page">
      <h2>Reel</h2>
      <p>Upload and view your video reels here.</p>

      <div className="upload-section">
        <h3>Upload Your Video Reel</h3>
        <input type="file" accept="video/*" onChange={handleVideoUpload} />
      </div>

      {/* Video Gallery */}
      <div className="video-gallery">
        {videos.length > 0 ? (
          videos.map((video, index) => (
            <div key={index} className="video-card">
              <video controls>
                <source src={video.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <h4>{video.name}</h4>
            </div>
          ))
        ) : (
          <p>No videos uploaded yet. Upload a video to get started!</p>
        )}
      </div>
    </div></>
  );
};

export default ReelPage;

