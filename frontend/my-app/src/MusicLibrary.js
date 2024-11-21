import React, { useRef } from 'react';
import './styles/MusicLibrary.css';
import './styles/AudioPlayer.css';

function MusicLibrary({ songs, currentIndex, setCurrentIndex }) {
  const albumImageRef = useRef(null);

  const handleMouseMove = (event) => {
    const { clientX, clientY } = event;
    const rect = albumImageRef.current.getBoundingClientRect();
    const offsetX = (clientX - rect.left) / rect.width - 0.5;
    const offsetY = (clientY - rect.top) / rect.height - 0.5;
    albumImageRef.current.style.transform = `rotateX(${-offsetY * 10}deg) rotateY(${offsetX * 10}deg)`;
  };

  const handleMouseLeave = () => {
    if (albumImageRef.current) {
      albumImageRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)';
    }
  };

  const handleNext = () => {
    setCurrentIndex((currentIndex + 1) % songs.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((currentIndex - 1 + songs.length) % songs.length);
  };

  if (songs.length === 0) {
    return <p>Loading songs...</p>;
  }

  const currentSong = songs[currentIndex];
  const defaultImage = '/default-album-cover.png';
  const albumImage = currentSong.albumImage || defaultImage;

  return (
    <div className="music-library-container">
      <div className="album-image-container">
        <button onClick={handlePrevious} className="nav-button previous-button">&larr;</button>
        <img
          ref={albumImageRef}
          src={albumImage}
          alt={currentSong.album || 'Unknown Album'}
          className="album-image"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
        <button onClick={handleNext} className="nav-button next-button">&rarr;</button>
      </div>

      <h3 className="song-info">{currentSong.title} - {currentSong.artist}</h3>
    </div>
  );
}

export default MusicLibrary;
