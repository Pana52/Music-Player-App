import React, { useState, useEffect, useRef } from 'react';
import './styles/Queue.css'; // Custom styling for the full-page layout
import './styles/Warning.css'; // Custom styling for warnings
import axios from 'axios'; // Import axios for making HTTP requests

const API_BASE_URL = 'http://localhost:8000'; // Backend server URL

function Music({ songs, currentIndex, setCurrentIndex }) {
  const [selectedArtist, setSelectedArtist] = useState('All Songs'); // Track the selected artist
  const defaultImage = '/default-album-cover.png'; // Path to default image
  const fileInputRef = useRef(null); // Reference to the file input
  const hoverTimeoutRef = useRef(null);
  const [albumImages, setAlbumImages] = useState({}); // Track album images
  const [queue, setQueue] = useState([]); // Track the queue

  // Get unique artists and include "All Songs"
  const artists = ['All Songs', ...new Set(songs.map((song) => song.artist))];

  // Filter songs based on the selected artist
  const filteredSongs =
    selectedArtist === 'All Songs'
      ? songs
      : songs.filter((song) => song.artist === selectedArtist);

  const handleSongClick = async (song) => {
    try {
      await axios.post(`${API_BASE_URL}/api/add-to-queue/`, {
        artist: song.artist,
        title: song.title,
      });
      console.log(`Song added to queue - ${song.title} by ${song.artist}`);
      // Fetch the updated queue
      const response = await axios.get(`${API_BASE_URL}/api/queue/`);
      setQueue(response.data.queue);
    } catch (error) {
      console.error('Error adding song to queue:', error);
    }
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

  const fetchQueue = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/queue/`);
      setQueue(response.data.queue);
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleRemoveFromQueue = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/remove_from_queue/${id}/`);
      fetchQueue();
    } catch (error) {
      console.error('Error removing song from queue:', error);
    }
  };

  const saveQueue = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/save-queue/`);
      console.log('Queue saved successfully');
      fetchQueue();
    } catch (error) {
      console.error('Error saving queue:', error);
    }
  };

  const loadQueue = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/load-queue/`);
      console.log('Queue loaded successfully');
      fetchQueue();
    } catch (error) {
      console.error('Error loading queue:', error);
    }
  };

  return (
    <div className="queue-music-page">
      <header className="queue-music-header">
        <h1>{selectedArtist === 'All Songs' ? 'All Songs' : `${selectedArtist}'s Songs`}</h1>
      </header>
      <div className="queue-content-container">
        {/* Artist Side Panel */}
        <div className="queue-artist-panel">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          {artists.map((artist, index) => (
            <button
              key={index}
              className={`queue-artist-button ${
                artist === selectedArtist ? 'active' : ''
              }`}
              onClick={() => handleArtistClick(artist)}
            >
              {artist}
            </button>
          ))}
        </div>
        {/* Song Grid */}
        <div className="queue-song-grid-container">
          <div className="queue-song-grid">
            {filteredSongs.length > 0 ? (
              filteredSongs.map((song, index) => (
                <div
                  key={index}
                  className="queue-song-card"
                  onClick={() => {
                    handleSongClick(song);
                    playSoundEffect('http://localhost:8000/media/sound effects/SFX_Save.mp3');
                  }}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <img
                    src={albumImages[song.title] || defaultImage}
                    alt={`${song.title} album cover`}
                    className="queue-background-image"
                  />
                  <img
                    src={albumImages[song.title] || defaultImage}
                    alt={`${song.title} album cover`}
                    className="queue-song-thumbnail"
                  />
                  <div className="queue-song-details">
                    <h3 className="queue-song-title">{song.title}</h3>
                    <p className="queue-song-artist">{song.artist}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="queue-no-songs-message">No songs available for this artist.</p>
            )}
          </div>
        </div>
        {/* Right Side Panel */}
        <div className="queue-right-panel">
          <h2>Queue</h2>
          <ul>
            {queue.map((song, index) => (
              <li key={song.id}>
                <div className="queue-list">
                  <div className="queue-song-info">
                    <span className="queue-song-title">{song.title}</span>
                    <span className="queue-song-artist">{song.artist}</span>
                  </div>
                  {/* Remove song from queue */}
                  <button className="queue-remove-button"
                      onClick={() => handleRemoveFromQueue(song.id)}
                      >X</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="queue-save-load-buttons">
            <button className="queue-save-button" onClick={saveQueue}>SAVE</button>
            <button className="queue-load-button" onClick={loadQueue}>LOAD</button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Music;
