import React from 'react';
import './styles/MusicSideBar.css'; // Custom styling for the sidebar

function MusicSideBar({ songs, currentIndex, setCurrentIndex }) {
  const defaultImage = '/default-album-cover.png'; // Path to default image

  if (songs.length === 0) {
    return <p>No songs available</p>;
  }

  const handleSongClick = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="music-sidebar">
      <h2>Song List</h2>
      <ul className="song-list">
        {songs.map((song, index) => (
          <li
            key={index}
            className={`song-item ${index === currentIndex ? 'active' : ''}`}
            onClick={() => handleSongClick(index)} // Ensure the entire item is clickable
          >
            <img
              src={song.albumImage || defaultImage}
              alt={`${song.title} album cover`}
              className="song-thumbnail"
            />
            <span className="song-title">{song.title} - {song.artist}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MusicSideBar;
