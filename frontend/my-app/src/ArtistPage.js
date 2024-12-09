import './styles/Artist.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useEffect } from 'react';

function ArtistPage({ currentSong }) {

  const defaultImage = '/default-album-cover.png'; // Path to default image

  useEffect(() => {
    if (!currentSong) {
      // Redirect to home or another page if currentSong is not set
      window.location.href = '/';
    }
  }, [currentSong]);

  if (!currentSong) {
    return <div>Loading...</div>; // Fallback UI
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
        {/* Placeholder Content */}
        <section className="section">
          <h2>About the Artist</h2>
          <p>Artist details will be available soon.</p>
        </section>
        <section className="section discography">
          <h2>Discography</h2>
          <p>Discography details will be available soon.</p>
        </section>
        <section className="section">
          <h2>Follow</h2>
          <p>Social media links will be available soon.</p>
        </section>
      </div>
    </div>
  );
}

export default ArtistPage;
