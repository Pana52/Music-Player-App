import React, { createContext, useRef, useState, useEffect, useCallback } from 'react';

export const AudioPlayerContext = createContext();

export function AudioProvider({ children }) {
    const audioRef = useRef(null);
    const audioContextRef = useRef(null);
    const mediaElementSourceRef = useRef(null);
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1.0);
    const [hasInitialized, setHasInitialized] = useState(false);

    const debugLog = (message, data) => {
        console.log(`[DEBUG]: ${message}`, data || '');
    };

    // Debounce utility to prevent rapid function execution
    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    };

    const initializeAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            debugLog('AudioContext initialized.');
        }

        const audioElement = audioRef.current?.audio.current;
        if (audioElement && !mediaElementSourceRef.current) {
            mediaElementSourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
            mediaElementSourceRef.current.connect(audioContextRef.current.destination);
            debugLog('MediaElementSource connected to destination.');
        }

        if (audioContextRef.current?.state === 'suspended') {
            audioContextRef.current.resume().catch((err) => {
                console.error('Error resuming AudioContext:', err);
                if (audioContextRef.current?.state === 'closed') {
                    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
                    mediaElementSourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
                    mediaElementSourceRef.current.connect(audioContextRef.current.destination);
                    debugLog('AudioContext re-initialized after being closed.');
                }
            });
        }
    }, []);

    const adjustVolume = debounce((newVolume) => {
      setVolume(newVolume); // Update the state directly
      if (audioRef.current?.audio.current) {
          audioRef.current.audio.current.volume = newVolume; // Sync the audio element's volume
          debugLog(`Volume adjusted: ${newVolume}`);
      }
    }, 100); // Debounce delay of 100ms
  
    useEffect(() => {
      if (audioRef.current?.audio.current) {
          audioRef.current.audio.current.volume = volume; // Sync with initial state
          debugLog(`Initial volume set: ${volume}`);
      }
    }, [volume]);
  
    useEffect(() => {
        if (!hasInitialized && audioRef.current?.audio.current) {
            const audioElement = audioRef.current.audio.current;

            // Unpause and immediately pause to initialize the context
            audioElement.play()
                .then(() => {
                    audioElement.pause();
                    setHasInitialized(true);
                    debugLog('Audio player initialized (unpaused and paused).');
                })
                .catch((err) => {
                    console.warn('Failed to initialize audio player:', err);
                });
        }
    }, [hasInitialized]);

    // Ensure volume is synced with the initial state
    useEffect(() => {
        if (audioRef.current?.audio.current) {
            audioRef.current.audio.current.volume = volume;
            debugLog(`Initial volume set: ${volume}`);
        }
    }, [volume]);

    const handlePlay = () => {
        initializeAudioContext();
        setIsPlaying(true);
        debugLog('Audio started.');
    };

    const handlePause = () => {
        if (audioContextRef.current?.state !== 'closed') {
            setIsPlaying(false);
            debugLog('Audio paused.');
        } else {
            debugLog('AudioContext is already closed. Skipping pause handling.');
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
                handlePlay,
                handlePause,
                adjustVolume,
                volume,
            }}
        >
            {children}
        </AudioPlayerContext.Provider>
    );
}
