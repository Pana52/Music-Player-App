import React, { useState } from 'react';
import './styles/Explore.css';

const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing Spotify API credentials');
}

function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [artistResults, setArtistResults] = useState([]);
  const [songResults, setSongResults] = useState([]);

  const getAccessToken = async () => {
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET)
        },
        body: 'grant_type=client_credentials'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch access token');
      }
      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error fetching access token:', error);
      return null;
    }
  };

  const handleSearch = async () => {
    const token = await getAccessToken();
    if (!token) {
      console.error('No access token available');
      return;
    }
    try {
      const response = await fetch(`https://api.spotify.com/v1/search?q=${searchQuery}&type=artist,track`, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      const data = await response.json();
      const artists = data.artists ? data.artists.items.slice(0, 5) : [];
      const songs = data.tracks ? data.tracks.items.slice(0, 5) : [];

      setArtistResults(artists);
      setSongResults(songs);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  return (
    <div className="explore-container">
      {/* Search bar section */}
      <div className="search-bar">
        <input 
          type="text" 
          className="search-input" 
          placeholder="Search for music or artists..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="search-button" onClick={handleSearch}>Search</button>
      </div>
      <h1 className="explore-title">Explore</h1>
      <p className="explore-description">Discover new music and artists here.</p>
      
      <section className="explore-section">
        <h2 className="explore-subtitle">Artists</h2>
        <div className="explore-cards">
          {artistResults.map((artist, index) => (
            <div
              key={index}
              className="explore-card"
            >
              <a href={artist.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                <img 
                  src={artist.images[0]?.url || 'default-album-cover.png'} 
                  alt={artist.name} 
                  className="explore-image" 
                />
                <p>{artist.name}</p>
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="explore-section">
        <h2 className="explore-subtitle">Songs</h2>
        <div className="explore-cards">
          {songResults.map((song, index) => (
            <div
              key={index}
              className="explore-card"
            >
              <a href={song.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                <img 
                  src={song.album.images[0]?.url || 'default-album-cover.png'} 
                  alt={song.name} 
                  className="explore-image" 
                />
                <p>{song.name}</p>
                <p>{song.artists[0].name}</p>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ...existing code... */}
    </div>
  );
}

export default Explore;
