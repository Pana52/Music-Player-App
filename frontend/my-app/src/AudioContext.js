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
    const [defaultVolume, setDefaultVolume] = useState(0.5); // Default volume level
    const [volumeScale, setVolumeScale] = useState('linear'); // Volume scale preference
    const [seekInterval, setSeekInterval] = useState(5); // Default to 5 seconds
    const [crossfade, setCrossfade] = useState(false);
    const [crossfadeDuration, setCrossfadeDuration] = useState(5);
    const [gaplessPlayback, setGaplessPlayback] = useState(false);
    const [songs, setSongs] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const isCrossfading = useRef(false);
    const currentIndexRef = useRef(currentIndex);
    const songListRef = useRef(songs);

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
        if (audioRef.current?.audio.current) {
            audioRef.current.audio.current.volume = defaultVolume;
            debugLog(`Initial volume set: ${defaultVolume}`);
        }
    }, [defaultVolume]);

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

    const playNextWithCrossfade = useCallback(() => {
        const nextIndex = (currentIndexRef.current + 1) % songListRef.current.length;
        const nextSong = songListRef.current[nextIndex];

        const newAudio = new Audio();
        newAudio.src = `http://localhost:8000/media/music/${encodeURIComponent(nextSong.filename)}`;
        newAudio.crossOrigin = "anonymous";
        newAudio.volume = 0;

        const fadeDuration = crossfadeDuration;
        const fadeOutStep = volume / (fadeDuration * 10);
        const fadeInStep = volume / (fadeDuration * 10);

        newAudio.play();

        // Fade out current song
        const fadeOutInterval = setInterval(() => {
            if (audioRef.current.audio.current.volume > 0) {
                audioRef.current.audio.current.volume -= fadeOutStep;
            } else {
                clearInterval(fadeOutInterval);
                audioRef.current.audio.current.pause();
            }
        }, 100);

        // Fade in next song
        const fadeInInterval = setInterval(() => {
            if (newAudio.volume < volume) {
                newAudio.volume += fadeInStep;
            } else {
                clearInterval(fadeInInterval);
                audioRef.current.audio.current = newAudio;
                isCrossfading.current = false;
                setCurrentIndex(nextIndex); // Update currentIndex
                setCurrentSong(nextSong);   // Update currentSong
            }
        }, 100);
    }, [crossfadeDuration, volume]);

    const handleTimeUpdate = useCallback(() => {
        if (crossfade && audioRef.current && currentSong) {
            const audioElement = audioRef.current.audio.current;
            const remainingTime = audioElement.duration - audioElement.currentTime;
            if (remainingTime <= crossfadeDuration && !isCrossfading.current) {
                isCrossfading.current = true;
                playNextWithCrossfade();
            }
        }
    }, [crossfade, crossfadeDuration, currentSong, playNextWithCrossfade]);

    // Fetch songs and update state
    useEffect(() => {
        fetch('http://localhost:8000/api/songs/')
            .then((response) => response.json())
            .then((data) => {
                debugLog('Fetched songs from API:', data);
                setSongs(data.files || []);
            })
            .catch((error) => console.error('Error fetching songs:', error));
    }, []);

    // Update refs when currentIndex or songs change
    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    useEffect(() => {
        songListRef.current = songs;
    }, [songs]);

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
                defaultVolume,
                setDefaultVolume,
                volumeScale,
                setVolumeScale,
                seekInterval,
                setSeekInterval,
                crossfade,
                setCrossfade,
                crossfadeDuration,
                setCrossfadeDuration,
                gaplessPlayback,
                setGaplessPlayback,
                handleTimeUpdate,
                songs,
                setSongs,
                currentIndex,
                setCurrentIndex,
            }}
        >
            {children}
        </AudioPlayerContext.Provider>
    );
}
