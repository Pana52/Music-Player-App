import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './styles/App.css';
import './styles/backgrounds/Waves.css';
import ReactH5AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { AudioPlayerContext, AudioProvider } from './AudioContext';
import Home from './HomePage';
import Music from './MusicPage';
import SideBar from './ArtistPage';
import Settings from './Settings';
import Explore from './Explore';
import AudioVisualizer from './AudioVisualizer';

function AppContent() {
    const [songs, setSongs] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const {
        audioRef,
        currentSong,
        handlePlay, // Add handlePlay
        handlePause, // Add handlePause
        adjustVolume,
        setCurrentSong,
        volume,
    } = useContext(AudioPlayerContext);
    
    
    const location = useLocation();

    useEffect(() => {
        fetch('http://localhost:8000/api/songs/')
            .then((response) => response.json())
            .then((data) => {
                console.log('[DEBUG]: Fetched songs from API:', data);
                setSongs(data.files || []);
            })
            .catch((error) => console.error('Error fetching songs:', error));
    }, []);

    useEffect(() => {
        if (songs.length > 0 && currentIndex >= 0 && currentIndex < songs.length) {
            setCurrentSong(songs[currentIndex]);
            console.log('[DEBUG]: Current song updated:', songs[currentIndex]);
        } else {
            console.log('[DEBUG]: Invalid currentIndex or no songs available.');
        }
    }, [currentIndex, songs, setCurrentSong]);

    return (
        <div className="App">
            <div className='wave'></div>
            <div className='wave'></div>
            <Routes>
                <Route
                    path="/"
                    element={
                        <Home
                            songs={songs}
                            currentIndex={currentIndex}
                            setCurrentIndex={setCurrentIndex}
                            audioRef={audioRef}
                        />
                    }
                />
                <Route path="/artist" element={<SideBar currentSong={currentSong} />} />
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

            {/* Audio Visualizer */}
            <AudioVisualizer
                audioRef={audioRef}
                isVisible={location.pathname === '/'}
            />

            {/* Persistent Audio Player */}
            <ReactH5AudioPlayer
                ref={audioRef}
                src={
                    currentSong
                        ? `http://localhost:8000/api/songs/${encodeURIComponent(currentSong.filename)}`
                        : null
                }
                autoPlay={false}
                volume={volume} // Use the state value directly
                muted={false}
                controls
                className="persistent-audio-player"
                crossOrigin="anonymous"
                onPlay={handlePlay}
                onPause={handlePause}
                onVolumeChange={(e) => {
                    const sliderValue = e.target.volume; // Use the slider's linear value directly
                    adjustVolume(sliderValue); // Pass the slider value as-is
                    console.log('[DEBUG]: Slider Value:', sliderValue);
                }}
                onEnded={() => {
                    setCurrentIndex((prevIndex) => (prevIndex + 1) % songs.length);
                }}
            />

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
