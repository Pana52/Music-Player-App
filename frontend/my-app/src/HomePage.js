import React, { useRef, useEffect, useState } from 'react';
import './styles/Home.css';
import './styles/AudioPlayer.css';

const API_BASE_URL = 'http://localhost:8000'; // Backend server URL

function Home({ songs, currentIndex, setCurrentIndex }) {
  const albumImageRef = useRef(null);
  const [albumImage, setAlbumImage] = useState('/default-album-cover.png');

  useEffect(() => {
    const fetchAlbumImage = async () => {
      const currentSong = songs[currentIndex];
      if (!currentSong || !currentSong.title) {
        console.error('Current song or title is missing');
        return;
      }

      const fetchUrl = `${API_BASE_URL}/api/album-image/${encodeURIComponent(currentSong.title)}/`;

      try {
        const response = await fetch(fetchUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch album image');
        }
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setAlbumImage(imageUrl);
      } catch (error) {
        console.error('Error fetching album image:', error);
        setAlbumImage('/default-album-cover.png');
      }
    };

    fetchAlbumImage();
  }, [currentIndex, songs]);

  const handleMouseMove = (event) => {
    const { clientX, clientY } = event;
    const rect = albumImageRef.current.getBoundingClientRect();
    const offsetX = (clientX - rect.left) / rect.width - 0.5;
    const offsetY = (clientY - rect.top) / rect.height - 0.5;
    albumImageRef.current.style.transform = `rotateX(${-offsetY * 25}deg) rotateY(${offsetX * 25}deg)`;
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

  return (
    <div className="background-container">
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
      </div>
      <h3 className="song-info">{currentSong.title} - {currentSong.artist}</h3>
    </div>
  );
}

export default Home;
