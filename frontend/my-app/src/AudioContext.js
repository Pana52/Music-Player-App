import React, { createContext, useRef, useState, useEffect, useCallback } from 'react';

export const AudioPlayerContext = createContext();

export function AudioProvider({ children }) {
    const audioRef = useRef(null);
    const audioContextRef = useRef(null);
    const mediaElementSourceRef = useRef(null);
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1.0);
    const [isVisualizerEnabled, setIsVisualizerEnabled] = useState(false);

    const debugLog = (message, data) => {
        console.log(`[DEBUG]: ${message}`, data || '');
    };

    const initializeAudioContext = useCallback(() => {
        try {
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
                debugLog('AudioContext initialized or re-initialized.');
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
        } catch (error) {
            console.error('Error initializing AudioContext:', error);
        }
    }, []);

    const adjustVolume = useCallback((newVolume) => {
        setVolume(newVolume);
        if (audioRef.current?.audio.current) {
            audioRef.current.audio.current.volume = newVolume;
            debugLog(`Volume adjusted: ${newVolume}`);
        }
    }, []);

    const toggleVisualizer = () => {
        setIsVisualizerEnabled((prev) => !prev);
    };

    useEffect(() => {
        if (audioRef.current?.audio.current) {
            audioRef.current.audio.current.volume = volume;
            debugLog(`Initial volume set: ${volume}`);
        }
    }, [volume]);

    useEffect(() => {
        const handleUserGesture = () => {
            initializeAudioContext();
            window.removeEventListener('click', handleUserGesture);
            window.removeEventListener('keydown', handleUserGesture);
        };

        window.addEventListener('click', handleUserGesture);
        window.addEventListener('keydown', handleUserGesture);

        return () => {
            window.removeEventListener('click', handleUserGesture);
            window.removeEventListener('keydown', handleUserGesture);
        };
    }, [initializeAudioContext]);

    const handlePlay = () => {
        if (audioContextRef.current?.state === 'suspended') {
            initializeAudioContext();
        }
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

    const handleNavigation = useCallback(() => {
        try {
            if (audioContextRef.current?.state === 'closed') {
                initializeAudioContext();
            }
        } catch (error) {
            console.error('Error during navigation:', error);
        }
    }, [initializeAudioContext]);

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
                handleNavigation,
                initializeAudioContext, // Expose initializeAudioContext
                isVisualizerEnabled,
                toggleVisualizer,
            }}
        >
            {children}
        </AudioPlayerContext.Provider>
    );
}
