import React, { useEffect, useState } from 'react';
import './styles/App.css';
import './styles/backgrounds/Waves.css';
import MusicLibrary from './MusicLibrary'; // Main music library component
import MusicSideBar from './MusicSideBar'; // Sidebar for song selection
import SideBar from './SideBar'; // Right sidebar for song and artist details

function App() {
  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch('http://localhost:8000/api/songs/')
      .then(response => response.json())
      .then(data => setSongs(data.files))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  // Get the currently selected song
  const currentSong = songs[currentIndex] || null;

  return (
    <div className="App">
      {/* Background wave elements */}
      <div className="wave"></div>
      <div className="wave"></div>

      {/* Render the left sidebar for song selection */}
      <MusicSideBar
        songs={songs}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
      />

      {/* Render the main music library */}
      <MusicLibrary
        songs={songs}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
      />

      {/* Render the right sidebar for song and artist details */}
      <SideBar currentSong={currentSong} />
    </div>
  );
}

export default App;
