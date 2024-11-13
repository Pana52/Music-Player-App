import React, { useState, useRef } from 'react';
import ReactH5AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import './styles/MusicLibrary.css';
import './styles/AudioPlayer.css';
import SoundVisualizer from './SoundVisualizer';

function MusicLibrary({ songs, currentIndex, setCurrentIndex }) {
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef(null); // Reference to the audio player
  const albumImageRef = useRef(null);

  const handlePlay = () => {
    // Resume the audio context here
    if (audioRef.current && audioRef.current.audio.current) {
      const audioElement = audioRef.current.audio.current;
      if (audioElement.audioContext && audioElement.audioContext.state === 'suspended') {
        audioElement.audioContext.resume();
      }
    }
  };

  const handleMouseMove = (event) => {
    const { clientX, clientY } = event;
    const rect = albumImageRef.current.getBoundingClientRect();
    const offsetX = (clientX - rect.left) / rect.width - 0.5;
    const offsetY = (clientY - rect.top) / rect.height - 0.5;
    albumImageRef.current.style.transform = `rotateX(${-offsetY * 10}deg) rotateY(${offsetX * 10}deg)`;
  };

  const handleMouseLeave = () => {
    if (albumImageRef.current) {
      albumImageRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)';
    }
  };

  const handleNext = () => {
    setCurrentIndex((currentIndex + 1) % songs.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((currentIndex - 1 + songs.length) % songs.length);
  };

  const handleVolumeChange = (event) => {
    const linearVolume = event.target.volume;
    const logarithmicVolume = Math.pow(linearVolume, 2);
    setVolume(logarithmicVolume);
  };

  if (songs.length === 0) {
    return <p>Loading songs...</p>;
  }

  const currentSong = songs[currentIndex];
  const defaultImage = '/default-album-cover.png';
  const albumImage = currentSong.albumImage || defaultImage;

  return (
    <div className="music-library-container">
      <div className="album-image-container">
        <button onClick={handlePrevious} className="nav-button previous-button">&larr;</button>
        <img
          ref={albumImageRef}
          src={albumImage}
          alt={currentSong.album || 'Unknown Album'}
          className="album-image"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
        <button onClick={handleNext} className="nav-button next-button">&rarr;</button>
      </div>

      <h3 className="song-info">{currentSong.title} - {currentSong.artist}</h3>

      <ReactH5AudioPlayer
        ref={audioRef}
        src={`http://localhost:8000/api/songs/${currentSong.filename}`}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        onPlay={handlePlay} // Trigger context resume on play
        onEnded={handleNext}
        controls
        className="audio-player"
        crossOrigin="anonymous"
      />

      {audioRef.current && audioRef.current.audio.current && (
        <SoundVisualizer audioElement={audioRef.current.audio.current} />
      )}
    </div>
  );
}

export default MusicLibrary;
