import React from 'react';
import './styles/Music.css'; // Custom styling for the full-page layout

function Music({ songs, currentIndex, setCurrentIndex }) {
  const defaultImage = '/default-album-cover.png'; // Path to default image

  if (songs.length === 0) {
    return <p className="no-songs-message">No songs available</p>;
  }

  const handleSongClick = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="music-page">
      <header className="music-header">
        <h1>Song List</h1>
      </header>
      <div className="song-grid">
        {songs.map((song, index) => (
          <div
            key={index}
            className={`song-card ${index === currentIndex ? 'active' : ''}`}
            onClick={() => handleSongClick(index)} // Make the entire card clickable
          >
            <img
              src={song.albumImage || defaultImage}
              alt={`${song.title} album cover`}
              className="song-thumbnail"
            />
            <div className="song-details">
              <h3 className="song-title">{song.title}</h3>
              <p className="song-artist">{song.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Music;
