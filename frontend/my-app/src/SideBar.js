import React, { useState, useEffect } from 'react';
import './styles/SideBar.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function SideBar({ currentSong }) {
  const [artistDetails, setArtistDetails] = useState(null); // State to store artist details
  const defaultImage = '/default-album-cover.png'; // Path to default image

  useEffect(() => {
    const fetchArtistData = async () => {
      if (!currentSong?.artist) return;

      try {
        // Step 1: Process artist data
        const processResponse = await fetch('http://localhost:8000/api/process-artist/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ artist_name: currentSong.artist }),
        });

        if (!processResponse.ok) {
          throw new Error(`Failed to process artist data: ${processResponse.status}`);
        }

        // Step 2: Fetch updated artist details
        const detailsResponse = await fetch(
          `http://localhost:8000/api/artist/${encodeURIComponent(currentSong.artist)}/`
        );

        if (!detailsResponse.ok) {
          throw new Error(`Failed to fetch artist details: ${detailsResponse.status}`);
        }

        const details = await detailsResponse.json();
        setArtistDetails(details);
      } catch (error) {
        console.error('Error fetching artist data:', error);
        setArtistDetails({ error: 'Failed to fetch artist details.' });
      }
    };

    fetchArtistData();
  }, [currentSong]);

  if (!currentSong) {
    return <div className="sidebar">Select a song to view details</div>;
  }

  return (
    <div className="sidebar">
      {/* Artist Details Section */}
      <div className="section">
        <h2>Artist Details</h2>
        <h3>Artist Bio</h3>
        <p>
          {artistDetails?.error
            ? artistDetails.error
            : artistDetails?.artistBio || 'Biography not available.'}
        </p>

        <h3>Discography</h3>
        <div className="discography">
          {artistDetails?.discography?.length > 0
            ? artistDetails.discography.map((album, index) => (
                <div key={index} className="album-cover">
                  <img
                    src={
                      album.coverImage && album.coverImage.startsWith('http')
                        ? album.coverImage
                        : `${process.env.PUBLIC_URL}/default-album-cover.png`
                    }
                    alt={album.name}
                  />
                  <p>
                    {album.name} ({album.release_date})
                  </p>
                </div>
              ))
            : 'Discography not available.'}
        </div>

        <h3>Social Media Links</h3>
        <div className="social-media-buttons">
          <a
            href={artistDetails?.socialLinks?.spotify || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="social-button spotify"
          >
            <i className="fab fa-spotify"></i> Spotify
          </a>
          <a
            href={artistDetails?.socialLinks?.youtube || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="social-button youtube"
          >
            <i className="fab fa-youtube"></i> YouTube
          </a>
          <a
            href={artistDetails?.socialLinks?.twitter || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="social-button twitter"
          >
            <i className="fab fa-twitter"></i> Twitter
          </a>
        </div>
      </div>

      {/* Song Information Section */}
      <div className="section">
        <h2>Song Information</h2>
        <p>
          <strong>Title:</strong> {currentSong.title}
        </p>
        <p>
          <strong>Artist:</strong> {currentSong.artist}
        </p>
        <p>
          <strong>Album:</strong> {currentSong.album}
        </p>
        <img
          src={currentSong.albumImage || defaultImage}
          alt={`${currentSong.album} artwork`}
          className="album-artwork"
        />
        <p>
          <strong>Release Date:</strong> {currentSong.release_date}
        </p>
        <p>
          <strong>Duration:</strong> {Math.floor(currentSong.duration / 60)}:
          {Math.floor(currentSong.duration % 60)
            .toString()
            .padStart(2, '0')}
        </p>
        <p>
          <strong>Genre:</strong> {currentSong.genre || 'N/A'}
        </p>
      </div>
    </div>
  );
}

export default SideBar;
