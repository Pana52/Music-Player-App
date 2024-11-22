import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './styles/App.css';
import './styles/backgrounds/Waves.css';
import Home from './HomePage';
import Music from './MusicPage';
import SideBar from './ArtistPage';
import Settings from './Settings';
import Explore from './Explore';
import ReactH5AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { AudioPlayerContext, AudioProvider } from './AudioContext';

function AppContent() {
  const [songs, setSongs] = useState([]); // Songs data
  const [currentIndex, setCurrentIndex] = useState(0);
  const { currentSong, setCurrentSong, audioRef, isPlaying } = useContext(AudioPlayerContext);

  useEffect(() => {
    // Fetch songs from the API
    fetch('http://localhost:8000/api/songs/')
      .then((response) => response.json())
      .then((data) => setSongs(data.files || []))
      .catch((error) => console.error('Error fetching songs:', error));
  }, []);

  useEffect(() => {
    // Update current song in the global context whenever the index changes
    if (songs.length > 0) {
      setCurrentSong(songs[currentIndex]);
    }
  }, [currentIndex, songs, setCurrentSong]);

  return (
    <div className="App">
      {/* Main content routed based on the current path */}
      <Routes>
        <Route
          path="/"
          element={
            <Home
              songs={songs}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
            />
          }
        />
        <Route
          path="/artist"
          element={<SideBar currentSong={currentSong} />}
        />
        <Route
          path="/music"
          element={
            <Music
              songs={songs}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
            />
          }
        />
        <Route path="/settings" element={<Settings />} />
        <Route path="/explore" element={<Explore />} />
      </Routes>

      {/* Persistent Audio Player */}
      <ReactH5AudioPlayer
        ref={audioRef}
        src={currentSong ? `http://localhost:8000/api/songs/${currentSong.filename}` : null}
        autoPlay={isPlaying}
        controls
        className="persistent-audio-player"
      />

      {/* Bottom Navigation Bar */}
      <nav className="bottom-nav">
        <Link to="/" className="nav-item">Home</Link>
        <Link to="/artist" className="nav-item">Artist</Link>
        <Link to="/music" className="nav-item">Music</Link>
        <Link to="/settings" className="nav-item">Settings</Link>
        <Link to="/explore" className="nav-item">Explore</Link>
      </nav>
    </div>
  );
}

function App() {
  return (
    <AudioProvider>
      <Router>
        <AppContent />
      </Router>
    </AudioProvider>
  );
}

export default App;
