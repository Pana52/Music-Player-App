import React, { useState, useEffect } from 'react';
import './styles/Artist.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function ArtistPage({ currentSong }) {
  const [artistDetails, setArtistDetails] = useState(null);
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
    return <div className="artist-page">Select a song to view details</div>;
  }

  return (
    <div className="artist-page">
      {/* Header Section */}
      <header className="artist-header">
        <img
          src={currentSong.albumImage || defaultImage}
          alt={`${currentSong.album} artwork`}
          className="artist-image"
        />
        <h1 className="artist-name">{currentSong.artist}</h1>
      </header>

      {/* Main Content */}
      <div className="artist-grid">
        {/* Artist Bio Section */}
        <section className="section">
          <h2>About the Artist</h2>
          <p>
            {artistDetails?.error
              ? artistDetails.error
              : artistDetails?.artistBio || 'Biography not available.'}
          </p>
        </section>

        {/* Discography Section */}
        <section className="section discography">
          <h2>Discography</h2>
          <div className="discography-grid">
            {artistDetails?.discography?.length > 0
              ? artistDetails.discography.map((album, index) => (
                  <div key={index} className="album-cover">
                    <img
                      src={
                        album.coverImage && album.coverImage.startsWith('http')
                          ? album.coverImage
                          : defaultImage
                      }
                      alt={album.name}
                    />
                    <p className="album-name">{album.name}</p>
                    <p className="album-year">{album.release_date}</p>
                  </div>
                ))
              : 'No discography available.'}
          </div>
        </section>

        {/* Social Media Links */}
        <section className="section">
          <h2>Follow</h2>
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
        </section>
      </div>
    </div>
  );
}

export default ArtistPage;
