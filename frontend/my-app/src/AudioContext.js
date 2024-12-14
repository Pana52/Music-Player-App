import React, { createContext, useRef, useState, useEffect, useCallback } from 'react';

export const AudioPlayerContext = createContext();

export function AudioProvider({ children }) {
    const audioRef = useRef(null);
    const audioContextRef = useRef(null);
    const mediaElementSourceRef = useRef(null);
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [isVisualizerEnabled, setIsVisualizerEnabled] = useState(false);
    const [equalizerPreset, setEqualizerPreset] = useState('flat');
    const [playbackSpeedState, setPlaybackSpeedState] = useState(1);
    const [autoplay, setAutoplay] = useState(true); // Add autoplay state
    const [keybinds, setKeybinds] = useState({
        playPause: ' ',
        rewind: 'ArrowLeft',
        forward: 'ArrowRight',
        volumeUp: 'ArrowUp',
        volumeDown: 'ArrowDown',
        toggleLoop: 'L',
        toggleMute: 'M'
    });
    const [jumpSteps, setJumpSteps] = useState({ backward: 5000, forward: 5000 });
    const equalizerBandsRef = useRef([]);

    const debugLog = (message, data) => {
        console.log(`[DEBUG]: ${message}`, data || '');
    };

    const applyEqualizerPreset = useCallback((preset) => {
        setEqualizerPreset(preset);
        fetch('http://localhost:8000/api/settings/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ equalizerPreset: preset }),
        }).catch(error => console.error('Error saving equalizer preset:', error));

        const bands = equalizerBandsRef.current;
        if (bands.length === 0) return;

        const presets = {
            flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            bass: [5, 4, 3, 2, 1, 0, -1, -2, -3, -4],
            treble: [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
            vocal: [0, 1, 2, 3, 4, 3, 2, 1, 0, -1],
        };

        const gains = presets[preset] || presets.flat;
        bands.forEach((band, index) => {
            band.gain.setValueAtTime(gains[index], audioContextRef.current.currentTime);
        });

        debugLog(`Equalizer preset applied: ${preset}`);
    }, []);

    useEffect(() => {
        fetch('http://localhost:8000/api/settings/')
            .then(response => response.json())
            .then(config => {
                setVolume(config.volume);
                setEqualizerPreset(config.equalizerPreset);
                setPlaybackSpeedState(config.playbackSpeed || 1); // Ensure default value
                setAutoplay(config.autoplay);
                setKeybinds(ensureUniqueKeybinds(config.keybinds || {
                    playPause: ' ',
                    rewind: 'ArrowLeft',
                    forward: 'ArrowRight',
                    volumeUp: 'ArrowUp',
                    volumeDown: 'ArrowDown',
                    toggleLoop: 'L',
                    toggleMute: 'M'
                }));
                setJumpSteps(config.jumpSteps || { backward: 5000, forward: 5000 });

                // Apply settings immediately
                if (audioRef.current?.audio.current) {
                    audioRef.current.audio.current.volume = config.volume;
                    audioRef.current.audio.current.playbackRate = config.playbackSpeed || 1;
                }
                applyEqualizerPreset(config.equalizerPreset);
            })
            .catch(error => console.error('Error loading config:', error));
    }, [applyEqualizerPreset]);

    const ensureUniqueKeybinds = (keybinds) => {
        const usedKeys = new Set();
        const uniqueKeybinds = {};
        for (const [action, key] of Object.entries(keybinds)) {
            if (!usedKeys.has(key)) {
                uniqueKeybinds[action] = key;
                usedKeys.add(key);
            } else {
                uniqueKeybinds[action] = null; // Set to null if duplicate
            }
        }
        return uniqueKeybinds;
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
        const roundedVolume = Math.round(newVolume * 10) / 10; // Round to nearest 0.1
        setVolume(roundedVolume);
        fetch('http://localhost:8000/api/settings/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ volume: roundedVolume }),
        }).catch(error => console.error('Error saving volume:', error));
        if (audioRef.current?.audio.current) {
            audioRef.current.audio.current.volume = roundedVolume;
            debugLog(`Volume adjusted: ${roundedVolume}`);
        }
    }, []);

    const setPlaybackSpeed = useCallback((newSpeed) => {
        setPlaybackSpeedState(newSpeed);
        fetch('http://localhost:8000/api/settings/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playbackSpeed: newSpeed }),
        }).catch(error => console.error('Error saving playback speed:', error));
        if (audioRef.current?.audio.current && isFinite(newSpeed)) {
            audioRef.current.audio.current.playbackRate = newSpeed;
            debugLog(`Playback speed adjusted: ${newSpeed}`);
        }
    }, []);

    const toggleVisualizer = () => {
        setIsVisualizerEnabled((prev) => !prev);
    };

    useEffect(() => {
        if (audioRef.current?.audio.current) {
            audioRef.current.audio.current.volume = volume;
            audioRef.current.audio.current.playbackRate = playbackSpeedState;
            debugLog(`Initial volume set: ${volume}`);
            debugLog(`Initial playback speed set: ${playbackSpeedState}`);
        }
    }, [volume, playbackSpeedState]);

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

    useEffect(() => {
        if (audioContextRef.current && mediaElementSourceRef.current) {
            const frequencies = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];
            const bands = frequencies.map((freq) => {
                const filter = audioContextRef.current.createBiquadFilter();
                filter.type = 'peaking';
                filter.frequency.value = freq;
                filter.Q.value = 1;
                filter.gain.value = 0;
                return filter;
            });

            bands.reduce((prev, curr) => {
                prev.connect(curr);
                return curr;
            }, mediaElementSourceRef.current).connect(audioContextRef.current.destination);

            equalizerBandsRef.current = bands;
            applyEqualizerPreset(equalizerPreset);
        }
    }, [applyEqualizerPreset, equalizerPreset]);

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
                equalizerPreset,
                applyEqualizerPreset,
                playbackSpeed: playbackSpeedState,
                setPlaybackSpeed,
                autoplay,
                setAutoplay, // Provide setAutoplay function
                keybinds,
                setKeybinds, // Provide setKeybinds function
                jumpSteps,
                setJumpSteps,
            }}
        >
            {children}
        </AudioPlayerContext.Provider>
    );
}