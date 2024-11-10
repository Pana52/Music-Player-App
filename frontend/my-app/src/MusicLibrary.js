import React, { useEffect, useState } from 'react';
import ReactH5AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import './MusicLibrary.css'; // Custom styling
import './AudioPlayer.css';

function MusicLibrary() {
  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch('http://localhost:8000/api/songs/')
      .then(response => response.json())
      .then(data => setSongs(data.files))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const handleNext = () => {
    setCurrentIndex((currentIndex + 1) % songs.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((currentIndex - 1 + songs.length) % songs.length);
  };

  if (songs.length === 0) {
    return <p>Loading songs...</p>;
  }

  const currentSong = songs[currentIndex];
  const defaultImage = '/default-album-cover.png'; // Ensure this image is in the public directory

  return (
    <div className="music-library-container">
      <h3 className="song-title">{currentSong.title} by {currentSong.artist}</h3>
      <p className="song-info">Album: {currentSong.album}</p>
      <p className="song-info">Genre: {currentSong.genre || 'N/A'}</p>
      <p className="song-info">
        Duration: {Math.floor(currentSong.duration / 60)}:{Math.floor(currentSong.duration % 60).toString().padStart(2, '0')}
      </p>
      <p className="song-info">Release Date: {currentSong.release_date || 'N/A'}</p>

      <div className="album-image-container">
        <button onClick={handlePrevious} className="nav-button previous-button">&larr;</button>
        <img
          src={currentSong.albumImage || defaultImage}
          alt={currentSong.album || 'Unknown Album'}
          className="album-image"
        />
        <button onClick={handleNext} className="nav-button next-button">&rarr;</button>
      </div>

      <ReactH5AudioPlayer
        src={`http://localhost:8000/api/songs/${currentSong.filename}`}
        onPlay={() => console.log('Playing')}
        controls
        className="audio-player"
      />
    </div>
  );
}

export default MusicLibrary;
