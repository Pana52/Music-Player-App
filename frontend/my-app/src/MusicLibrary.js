import React, { useState } from 'react';
import ReactH5AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import './styles/MusicLibrary.css'; // Custom styling
import './styles/AudioPlayer.css';

function MusicLibrary({ songs, currentIndex, setCurrentIndex }) {
  const [volume, setVolume] = useState(0.7); // Initial volume (70%)

  const handleNext = () => {
    setCurrentIndex((currentIndex + 1) % songs.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((currentIndex - 1 + songs.length) % songs.length);
  };

  const handleVolumeChange = (event) => {
    const linearVolume = event.target.volume;
    const logarithmicVolume = Math.pow(linearVolume, 2); // Logarithmic adjustment for volume
    setVolume(logarithmicVolume);
  };

  if (songs.length === 0) {
    return <p>Loading songs...</p>;
  }

  const currentSong = songs[currentIndex];
  const defaultImage = '/default-album-cover.png'; // Ensure this image is in the public directory

  return (
    <div className="music-library-container">
      <div className="album-image-container">
        <button onClick={handlePrevious} className="nav-button previous-button">&larr;</button>
        <img
          src={currentSong.albumImage || defaultImage}
          alt={currentSong.album || 'Unknown Album'}
          className="album-image"
        />
        <button onClick={handleNext} className="nav-button next-button">&rarr;</button>
      </div>

      <h3 className="song-info">{currentSong.title} - {currentSong.artist}</h3>
      <p className="song-info">Album: {currentSong.album}</p>
      <p className="song-info">Genre: {currentSong.genre || 'N/A'}</p>
      <p className="song-info">
        Duration: {Math.floor(currentSong.duration / 60)}:{Math.floor(currentSong.duration % 60).toString().padStart(2, '0')}
      </p>
      <p className="song-info">Release Date: {currentSong.release_date || 'N/A'}</p>

      <ReactH5AudioPlayer
        src={`http://localhost:8000/api/songs/${currentSong.filename}`}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        onPlay={() => console.log('Playing')}
        onEnded={handleNext} // Trigger next song when the current one ends
        controls
        className="audio-player"
      />
    </div>
  );
}

export default MusicLibrary;
