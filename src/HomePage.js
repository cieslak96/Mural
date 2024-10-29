
import '@aws-amplify/ui-react/styles.css'; // Import Amplify UI styles

import './styles.css'; // Import CSS for styling

const HomePage = () => {
  return (
    <div className="home-page">
      <h1>Welcome to My Mural App</h1>
      <p>This is your space to share and explore amazing content!</p>
      <div className="features">
        <div className="feature">
          <h2>Photo and Video Albums</h2>
          <p>Upload and share your favorite photos and video albums with your friends and followers.</p>
        </div>
        <div className="feature">
          <h2>Movies and TV Shows</h2>
          <p>Share recommendations for movies and TV shows you love watching!</p>
        </div>
        <div className="feature">
          <h2>Books and Songs</h2>
          <p>Let the world know what books and songs inspire you the most.</p>
        </div>
        <div className="feature">
          <h2>Your Lists</h2>
          <p>Create and organize lists of your favorite things and share them with your community.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
