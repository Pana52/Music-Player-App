import React, { createContext, useRef, useState, useEffect } from 'react';

export const AudioPlayerContext = createContext();

export function AudioProvider({ children }) {
  const audioRef = useRef(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1.0); // Default volume

  // Debugging helper
  const debugLog = (message, data) => {
    console.log(`[DEBUG]: ${message}`, data || '');
  };

  const playPauseAudio = () => {
    if (audioRef.current?.audio.current) {
      const audio = audioRef.current.audio.current;
      if (isPlaying) {
        debugLog('Pausing audio...');
        audio.pause();
      } else {
        debugLog('Playing audio...');
        audio.play().catch((error) => console.error('Error playing audio:', error));
      }
      setIsPlaying(!isPlaying);
    } else {
      debugLog('Audio element not available.');
    }
  };

  const adjustVolume = (sliderValue) => {
    // Convert sliderValue (0-1) to linear volume
    const linearVolume = Math.pow(sliderValue, 2);
    setVolume(linearVolume);
    if (audioRef.current?.audio.current) {
      audioRef.current.audio.current.volume = linearVolume;
      debugLog(`Volume adjusted: ${linearVolume}`);
    }
  };

  useEffect(() => {
    if (audioRef.current?.audio.current) {
      const audioElement = audioRef.current.audio.current;

      const forceDirectConnection = () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const mediaElementSource = audioContext.createMediaElementSource(audioElement);

        // Connect directly to the destination (speakers)
        mediaElementSource.connect(audioContext.destination);

        debugLog('Forced audio connection to destination.');

        if (audioContext.state === 'suspended') {
          audioContext.resume().catch((err) =>
            console.error('Error resuming AudioContext:', err)
          );
        }
      };

      forceDirectConnection();
    }
  }, [audioRef]);

  return (
    <AudioPlayerContext.Provider
      value={{
        audioRef,
        currentSong,
        setCurrentSong,
        isPlaying,
        setIsPlaying,
        playPauseAudio,
        adjustVolume,
        volume, // Expose volume state
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}
