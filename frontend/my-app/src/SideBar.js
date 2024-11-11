import React from 'react';
import './styles/SideBar.css';

function SideBar({ currentSong }) {
  const defaultImage = '/default-album-cover.png'; // Path to default image

  if (!currentSong) {
    return <div className="sidebar">Select a song to view details</div>;
  }

  return (
    <div className="sidebar">
      <div className="section">
        <h2>Artist Details</h2>
        <h3>Artist Bio</h3>
        <p>{currentSong.artistBio || 'Biography not available.'}</p>

        <h3>Discography</h3>
        <div className="discography">
          {currentSong.discography?.map((album, index) => (
            <div key={index} className="album-cover">
              <img
                src={album.coverImage || defaultImage}
                alt={album.name}
              />
              <p>{album.name}</p>
            </div>
          )) || 'Discography not available.'}
        </div>

        <h3>Social Media Links</h3>
        <div className="social-media-buttons">
          <button className="social-button">YouTube</button>
          <button className="social-button">Spotify</button>
          <button className="social-button">Twitter</button>
        </div>
      </div>

      <div className="section">
        <h2>Song Information</h2>
        <p><strong>Title:</strong> {currentSong.title}</p>
        <p><strong>Artist:</strong> {currentSong.artist}</p>
        <p><strong>Album:</strong> {currentSong.album}</p>
        <img
          src={currentSong.albumImage || defaultImage}
          alt={`${currentSong.album} artwork`}
          className="album-artwork"
        />
        <p><strong>Release Date:</strong> {currentSong.release_date}</p>
        <p><strong>Duration:</strong> {Math.floor(currentSong.duration / 60)}:{Math.floor(currentSong.duration % 60).toString().padStart(2, '0')}</p>
        <p><strong>Genre:</strong> {currentSong.genre || 'N/A'}</p>
      </div>

      <div className="section">
        <h2>Song Insights</h2>
        <h3>Song Story</h3>
        <p>{currentSong.songStory || 'Story not available.'}</p>

        <h3>Inspirations & Songwriting Credits</h3>
        <p>{currentSong.inspirations || 'Inspirations not available.'}</p>

        <h3>Production Details</h3>
        <p>{currentSong.productionDetails || 'Production details not available.'}</p>

        <h3>Instrumental & Vocals Breakdown</h3>
        <p>{currentSong.instrumentalVocals || 'Instrumental and vocals breakdown not available.'}</p>
      </div>

      <div className="section">
        <h2>User Interaction Features</h2>
        <label><strong>User Rating:</strong></label>
        <div className="rating">
          {[...Array(5)].map((_, index) => (
            <span key={index} className="star">☆</span>
          ))}
        </div>
        <button className="favorite-button">Favorite</button>
        <button className="like-button">Like</button>
        <button className="queue-button">Add to Queue</button>
      </div>
    </div>
  );
}

export default SideBar;
