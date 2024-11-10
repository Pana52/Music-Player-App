import React, { useEffect, useState } from 'react';
import './styles/App.css';
import './styles/backgrounds/Waves.css';
import MusicLibrary from './MusicLibrary'; // Ensure this import is correct
import MusicSideBar from './MusicSideBar'; // Import the sidebar component

function App() {
  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch('http://localhost:8000/api/songs/')
      .then(response => response.json())
      .then(data => setSongs(data.files))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className="App">
      {/* You can add a header or navbar here if needed */}
      <div className="wave"></div>
      <div className="wave"></div>

      {/* Render the MusicSideBar and pass props */}
      <MusicSideBar
        songs={songs}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
      />

      {/* Render the MusicLibrary and pass props */}
      <MusicLibrary
        songs={songs}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
      />
    </div>
  );
}

export default App;
