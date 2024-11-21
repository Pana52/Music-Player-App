import React, { createContext, useRef, useState } from 'react';

export const AudioContext = createContext();

export function AudioProvider({ children }) {
  const audioRef = useRef(null); // Reference for the audio player
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <AudioContext.Provider
      value={{
        audioRef,
        currentSong,
        setCurrentSong,
        isPlaying,
        setIsPlaying,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}
