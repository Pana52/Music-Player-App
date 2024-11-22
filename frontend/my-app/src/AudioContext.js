import React, { createContext, useRef, useState } from 'react';

export const AudioPlayerContext = createContext(); // Renamed to avoid conflicts

export function AudioProvider({ children }) {
  const audioRef = useRef(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playPauseAudio = () => {
    if (audioRef.current?.audio.current) {
      const audio = audioRef.current.audio.current;
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        audioRef,
        currentSong,
        setCurrentSong,
        isPlaying,
        setIsPlaying,
        playPauseAudio,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}
