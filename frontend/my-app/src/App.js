import React, { useEffect, useContext } from 'react';
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
        defaultVolume,
        setDefaultVolume,
        volumeScale,
        setVolumeScale,
        seekInterval,
        setSeekInterval,
        crossfade,
        setCrossfade,
        crossfadeDuration,
        setCrossfadeDuration,
        gaplessPlayback,
        setGaplessPlayback,
        handleTimeUpdate,
        songs,
        currentIndex,
        setCurrentIndex,
    } = useContext(AudioPlayerContext);

    const location = useLocation();

    useEffect(() => {
        handleNavigation();
    }, [location, handleNavigation]);

    useEffect(() => {
        if (songs.length > 0 && currentIndex >= 0 && currentIndex < songs.length) {
            setCurrentSong(songs[currentIndex]);
            console.log('[DEBUG]: Current song updated:', songs[currentIndex]);
        } else {
            console.log('[DEBUG]: Invalid currentIndex or no songs available.');
        }
    }, [currentIndex, songs, setCurrentSong]);

    useEffect(() => {
        if (audioRef.current) {
            const audioElement = audioRef.current.audio.current;
            audioElement.addEventListener('timeupdate', handleTimeUpdate);

            return () => {
                audioElement.removeEventListener('timeupdate', handleTimeUpdate);
            };
        }
    }, [handleTimeUpdate, audioRef]);

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
                <Route path="/settings" element={<Settings
                    defaultVolume={defaultVolume}
                    setDefaultVolume={setDefaultVolume}
                    volumeScale={volumeScale}
                    setVolumeScale={setVolumeScale}
                    seekInterval={seekInterval}
                    setSeekInterval={setSeekInterval}
                    crossfade={crossfade}
                    setCrossfade={setCrossfade}
                    crossfadeDuration={crossfadeDuration}
                    setCrossfadeDuration={setCrossfadeDuration}
                    gaplessPlayback={gaplessPlayback}
                    setGaplessPlayback={setGaplessPlayback}
                />} />
                <Route path="/explore" element={<Explore />} />
            </Routes>

            {/* Audio Visualizer */}
            <AudioVisualizer
                audioRef={audioRef}
                isVisible={isVisualizerEnabled}
            />

            {/* Persistent Audio Player */}
            <ReactH5AudioPlayer
                key={currentSong ? currentSong.filename : 'default'}
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
                className="persistent-audio-player"
                crossOrigin="anonymous"
                onPlay={handlePlay}
                onPause={handlePause}
                onVolumeChange={(e) => {
                    const sliderValue = e.target.volume;
                    adjustVolume(sliderValue);
                    console.log('[DEBUG]: Slider Value:', sliderValue);
                }}
                onEnded={() => {
                    if (!crossfade) {
                        if (gaplessPlayback) {
                            setCurrentIndex((prevIndex) => (prevIndex + 1) % songs.length);
                        }
                    }
                }}
                customAdditionalControls={[
                    <button key="toggle-visualizer" onClick={toggleVisualizer}>
                        {isVisualizerEnabled ? 'Disable Visualizer' : 'Enable Visualizer'}
                    </button>
                ]}
                progressJumpSteps={{
                    backward: seekInterval * 1000,
                    forward: seekInterval * 1000,
                }}
            />

            <nav className="bottom-nav">
                <Link to="/" className="nav-item" onClick={handleNavigation}>Home</Link>
                <Link to="/artist" className="nav-item" onClick={handleNavigation}>Artist</Link>
                <Link to="/music" className="nav-item" onClick={handleNavigation}>Music</Link>
                <Link to="/settings" className="nav-item" onClick={handleNavigation}>Settings</Link>
                <Link to="/explore" className="nav-item" onClick={handleNavigation}>Explore</Link>
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
