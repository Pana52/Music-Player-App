import React, { useState, useEffect } from 'react';
import './styles/Music.css'; // Custom styling for the full-page layout

function Music({ songs, currentIndex, setCurrentIndex }) {
  const [selectedArtist, setSelectedArtist] = useState('All Songs'); // Track the selected artist
  const defaultImage = '/default-album-cover.png'; // Path to default image

  // Get unique artists and include "All Songs"
  const artists = ['All Songs', ...new Set(songs.map((song) => song.artist))];

  // Filter songs based on the selected artist
  const filteredSongs =
    selectedArtist === 'All Songs'
      ? songs
      : songs.filter((song) => song.artist === selectedArtist);

  const handleSongClick = (index) => {
    setCurrentIndex(index);
  };

  const handleArtistClick = (artist) => {
    setSelectedArtist(artist);
  };

  // Utility to check if an element is overflowing
  const isOverflowing = (element) => {
    return element.scrollWidth > element.clientWidth;
  };

  useEffect(() => {
    // Check for overflow on page load and update classes accordingly
    const songTitles = document.querySelectorAll('.song-title, .song-artist');
    songTitles.forEach((element) => {
      if (isOverflowing(element)) {
        element.classList.add('overflow');
      } else {
        element.classList.remove('overflow');
      }
    });
  }, [filteredSongs]); // Re-run whenever the filtered songs change

  return (
    <div className="music-page">
      {/* Artist Side Panel */}
      <div className="artist-panel">
        {artists.map((artist, index) => (
          <button
            key={index}
            className={`artist-button ${
              artist === selectedArtist ? 'active' : ''
            }`}
            onClick={() => handleArtistClick(artist)}
          >
            {artist}
          </button>
        ))}
      </div>

      {/* Song Grid */}
      <div className="song-grid-container">
        <header className="music-header">
          <h1>{selectedArtist === 'All Songs' ? 'All Songs' : `${selectedArtist}'s Songs`}</h1>
        </header>
        <div className="song-grid">
          {filteredSongs.length > 0 ? (
            filteredSongs.map((song, index) => (
              <div
                key={index}
                className={`song-card ${
                  songs.indexOf(song) === currentIndex ? 'active' : ''
                }`}
                onClick={() => handleSongClick(songs.indexOf(song))} // Map back to original index
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
            ))
          ) : (
            <p className="no-songs-message">No songs available for this artist.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Music;
