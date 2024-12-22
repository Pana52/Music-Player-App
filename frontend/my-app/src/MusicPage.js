import React, { useState, useEffect, useRef } from 'react';
import './styles/Music.css'; // Custom styling for the full-page layout
import './styles/Warning.css'; // Custom styling for warnings
import axios from 'axios'; // Import axios for making HTTP requests

const API_BASE_URL = 'http://localhost:8000'; // Backend server URL

function Music({ songs, currentIndex, setCurrentIndex }) {
  const [selectedArtist, setSelectedArtist] = useState('All Songs'); // Track the selected artist
  const defaultImage = '/default-album-cover.png'; // Path to default image
  const fileInputRef = useRef(null); // Reference to the file input
  const [showWarning, setShowWarning] = useState(false); // Track warning visibility
  const [warningMessage, setWarningMessage] = useState(''); // Track warning message
  const hoverTimeoutRef = useRef(null);
  const [albumImages, setAlbumImages] = useState({}); // Track album images

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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        await axios.post('http://localhost:8000/upload/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log(`File uploaded successfully - ${file.name}`);
        // Refresh the page to reflect the changes
        window.location.reload();
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  const handleDeleteSong = async (song) => {
    if (songs.indexOf(song) === currentIndex) {
      setWarningMessage('Cannot delete a song that is currently playing.');
      setShowWarning(true);
      return;
    }
    try {
      await axios.delete(`http://localhost:8000/delete/${song.filename}`);
      console.log(`File deleted successfully - ${song.filename}`);
      // Refresh the page to reflect the changes
      window.location.reload();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  // Utility to check if an element is overflowing
  const isOverflowing = (element) => {
    return element.scrollWidth > element.clientWidth;
  };

  const playSoundEffect = (src) => {
    const audio = new Audio(src);
    audio.currentTime = 0;
    audio.play().catch(error => {
        console.error('Error playing sound effect:', error);
    });
    setTimeout(() => {
        audio.pause();
        audio.src = '';
    }, 1000); // Destroy the audio instance after 1 second
  };

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => playSoundEffect('http://localhost:8000/media/sound effects/SFX_Hover.mp3'), 10); // 10ms delay
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
    }
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

  useEffect(() => {
    const fetchAlbumImages = async () => {
      const newAlbumImages = {};
      for (const song of songs) {
        const fetchUrl = `${API_BASE_URL}/api/album-image/${encodeURIComponent(song.title)}/`;
        try {
          const response = await fetch(fetchUrl);
          if (!response.ok) {
            throw new Error('Failed to fetch album image');
          }
          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);
          newAlbumImages[song.title] = imageUrl;
        } catch (error) {
          console.error('Error fetching album image:', error);
          newAlbumImages[song.title] = defaultImage;
        }
      }
      setAlbumImages(newAlbumImages);
    };

    fetchAlbumImages();
  }, [songs]);

  return (
    <div className="music-page">
      {/* Warning Popup */}
      {showWarning && (
        <div className="warning-popup">
          <p>{warningMessage}</p>
          <button onClick={() => setShowWarning(false)}>Close</button>
        </div>
      )}
      {/* Artist Side Panel */}
      <div className="artist-panel">
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileUpload}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className="import-button"
        >
          Import Song
        </button>
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
                onClick={() => {
                  handleSongClick(songs.indexOf(song)); // Map back to original index
                  playSoundEffect('http://localhost:8000/media/sound effects/SFX_Save.mp3');
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <img
                  src={albumImages[song.title] || defaultImage}
                  alt={`${song.title} album cover`}
                  className="background-image"
                />
                <img
                  src={albumImages[song.title] || defaultImage}
                  alt={`${song.title} album cover`}
                  className="song-thumbnail"
                />
                <div className="song-details">
                  <h3 className="song-title">{song.title}</h3>
                  <p className="song-artist">{song.artist}</p>
                </div>
                <button
                    className="delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSong(song);
                    }}
                  >
                    Delete
                  </button>
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
