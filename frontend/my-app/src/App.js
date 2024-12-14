import React, { useState, useEffect, useContext, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './styles/App.css';
import './styles/backgrounds/Waves.css';
import ReactH5AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { AudioPlayerContext, AudioProvider } from './AudioContext';
import Home from './HomePage';
import Music from './MusicPage';
import SideBar from './ArtistPage';
import Explore from './Explore';
import AudioVisualizer from './AudioVisualizer';
import Settings from './Settings';

function AppContent() {
    const [songs, setSongs] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [config, setConfig] = useState(null);
    const {
        audioRef,
        currentSong,
        handlePlay,
        handlePause,
        adjustVolume,
        setCurrentSong,
        volume,
        handleNavigation,
        isVisualizerEnabled,
        toggleVisualizer,
        applyEqualizerPreset,
        setPlaybackSpeed,
        autoplay,
        setAutoplay,
        keybinds,
        jumpSteps,
    } = useContext(AudioPlayerContext);

    const location = useLocation();
    const isHomePage = location.pathname === '/';

    useEffect(() => {
        fetch('http://localhost:8000/api/settings/')
            .then(response => response.json())
            .then(data => {
                setConfig(data);
                // Apply settings immediately
                if (audioRef.current?.audio.current) {
                    audioRef.current.audio.current.volume = data.volume;
                    audioRef.current.audio.current.playbackRate = data.playbackSpeed || 1;
                }
                adjustVolume(data.volume);
                applyEqualizerPreset(data.equalizerPreset);
                setPlaybackSpeed(data.playbackSpeed || 1);
                setAutoplay(data.autoplay);
            })
            .catch(error => console.error('Error loading config:', error));
    }, [adjustVolume, applyEqualizerPreset, setPlaybackSpeed, audioRef, setAutoplay]);

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

    useEffect(() => {
        handleNavigation();
    }, [location, handleNavigation]);

    const handleKeyDown = useCallback((event) => {
        if (!audioRef.current || !audioRef.current.audio.current) return;

        const keyActionMap = {
            [keybinds.playPause]: () => {
                if (audioRef.current.audio.current.paused) {
                    audioRef.current.audio.current.play();
                } else {
                    audioRef.current.audio.current.pause();
                }
            },
            [keybinds.rewind]: () => audioRef.current.audio.current.currentTime -= jumpSteps.backward / 1000,
            [keybinds.forward]: () => audioRef.current.audio.current.currentTime += jumpSteps.forward / 1000,
            [keybinds.volumeUp]: () => adjustVolume(Math.min(volume + 0.1, 1)),
            [keybinds.volumeDown]: () => adjustVolume(Math.max(volume - 0.1, 0)),
            [keybinds.toggleLoop]: () => audioRef.current.toggleLoop && audioRef.current.toggleLoop(),
            [keybinds.toggleMute]: () => audioRef.current.toggleMute && audioRef.current.toggleMute(),
        };

        const action = keyActionMap[event.code];
        if (action) {
            event.preventDefault();
            action();
        }
    }, [audioRef, keybinds, adjustVolume, volume, jumpSteps]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    if (!config) {
        return <div>Loading...</div>;
    }

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
                <Route path="/explore" element={<Explore />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>

            {/* Audio Visualizer */}
            <AudioVisualizer
                audioRef={audioRef}
                isVisible={isVisualizerEnabled}
            />

            {/* Persistent Audio Player */}
            <ReactH5AudioPlayer
                ref={audioRef}
                src={
                    currentSong
                        ? `http://localhost:8000/media/music/${encodeURIComponent(currentSong.filename)}`
                        : null
                }
                autoPlay={false}
                volume={volume}
                muted={false}
                controls
                className={`persistent-audio-player ${isHomePage ? '' : 'hidden'}`}
                crossOrigin="anonymous"
                onPlay={handlePlay}
                onPause={handlePause}
                onVolumeChange={(e) => {
                    const sliderValue = e.target.volume;
                    adjustVolume(sliderValue);
                    console.log('[DEBUG]: Slider Value:', sliderValue);
                }}
                onEnded={() => {
                    if (autoplay) {
                        setCurrentIndex((prevIndex) => (prevIndex + 1) % songs.length);
                    }
                }}
                hasDefaultKeyBindings={false} // Disable default key bindings
                customAdditionalControls={[
                    <button key="toggle-visualizer" onClick={toggleVisualizer}>
                        {isVisualizerEnabled ? 'Disable Visualizer' : 'Enable Visualizer'}
                    </button>
                ]}
                progressJumpSteps={jumpSteps}
            />

            <nav className="bottom-nav">
                <Link to="/" className="nav-item" onClick={handleNavigation}>
                    <div className="line"></div>
                    <div className="line"></div>
                    Home
                </Link>
                <Link to="/artist" className="nav-item" onClick={handleNavigation}>
                    <div className="line"></div>
                    <div className="line"></div>
                    Artist
                </Link>
                <Link to="/music" className="nav-item" onClick={handleNavigation}>
                    <div className="line"></div>
                    <div className="line"></div>
                    Music
                </Link>
                <Link to="/explore" className="nav-item" onClick={handleNavigation}>
                    <div className="line"></div>
                    <div className="line"></div>
                    Explore
                </Link>
                <Link to="/settings" className="nav-item" onClick={handleNavigation}>
                    <div className="line"></div>
                    <div className="line"></div>
                    Settings
                </Link>
            </nav>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AudioProvider>
                <AppContent />
            </AudioProvider>
        </Router>
    );
}

export default App;