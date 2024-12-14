import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import './styles/Settings.css';
import './styles/Warning.css'; // Import warning styles
import { AudioPlayerContext } from './AudioContext';

const defaultConfig = {
    volume: 0.5,
    equalizerPreset: 'flat',
    playbackSpeed: 1,
    autoplay: true, // Add default autoplay setting
    keybinds: {
        playPause: 'Space',
        rewind: 'ArrowLeft',
        forward: 'ArrowRight',
        volumeUp: 'ArrowUp',
        volumeDown: 'ArrowDown',
        toggleLoop: 'KeyL',
        toggleMute: 'KeyM'
    },
    jumpSteps: {
        backward: 5000,
        forward: 5000
    },
    // ...other default settings...
};

function Settings() {
    const { volume, adjustVolume, equalizerPreset, applyEqualizerPreset, playbackSpeed, setPlaybackSpeed, autoplay, setAutoplay, keybinds, setKeybinds, jumpSteps, setJumpSteps } = useContext(AudioPlayerContext);
    const [localVolume, setLocalVolume] = useState(volume);
    const [localEqualizerPreset, setLocalEqualizerPreset] = useState(equalizerPreset);
    const [localPlaybackSpeed, setLocalPlaybackSpeed] = useState(playbackSpeed || 1); // Ensure default value
    const [localAutoplay, setLocalAutoplay] = useState(autoplay);
    const [localKeybinds, setLocalKeybinds] = useState(keybinds);
    const [localJumpSteps, setLocalJumpSteps] = useState(jumpSteps);
    const [editingKeybind, setEditingKeybind] = useState(null);
    const [keyDisplayNames, setKeyDisplayNames] = useState({});
    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const hoverTimeoutRef = useRef(null);

    const playSoundEffect = (src) => {
        const audio = new Audio(src);
        audio.currentTime = 0;
        audio.play().catch(error => {
            console.error('Error playing sound effect:', error);
        });
        setTimeout(() => {
            audio.pause();
            audio.src = '';
        }, 1000); // Destroy the audio instance after 1 second
    };

    const playHoverSound = () => {
        const audio = new Audio('http://localhost:8000/media/sound effects/SFX_Hover.mp3');
        audio.currentTime = 0;
        audio.play().catch(error => {
            console.error('Error playing hover sound:', error);
        });
        setTimeout(() => {
            audio.pause();
            audio.src = '';
        }, 200); // Destroy the audio instance after 1 second
    };

    const handleMouseEnter = () => {
        hoverTimeoutRef.current = setTimeout(playHoverSound, 10); // 10ms delay
    };

    const handleMouseLeave = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
    };

    useEffect(() => {
        fetch('http://localhost:8000/api/settings/')
            .then(response => {
                if (!response.ok) {
                    console.error('Network response was not ok:', response.statusText);
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(config => {
                setLocalVolume(config.volume);
                setLocalEqualizerPreset(config.equalizerPreset);
                setLocalPlaybackSpeed(config.playbackSpeed || 1); // Ensure default value
                setLocalAutoplay(config.autoplay);
                setLocalKeybinds(config.keybinds || defaultConfig.keybinds);
                setLocalJumpSteps(config.jumpSteps || defaultConfig.jumpSteps);
                adjustVolume(config.volume);
                applyEqualizerPreset(config.equalizerPreset);
                setPlaybackSpeed(config.playbackSpeed || 1);
                setAutoplay(config.autoplay);
                setKeybinds(config.keybinds || defaultConfig.keybinds);
                setJumpSteps(config.jumpSteps || defaultConfig.jumpSteps);
            })
            .catch(error => console.error('Error loading config:', error));
    }, [adjustVolume, applyEqualizerPreset, setPlaybackSpeed, setAutoplay, setKeybinds, setJumpSteps]);

    useEffect(() => {
        fetch('http://localhost:8000/media/settings/keyBindings.json')
            .then(response => {
                if (!response.ok) {
                    console.error('Network response was not ok:', response.statusText);
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => setKeyDisplayNames(data))
            .catch(error => console.error('Error loading key bindings:', error));
    }, []);

    const handleVolumeChange = (event) => {
        const newVolume = parseFloat(event.target.value);
        setLocalVolume(newVolume);
        // Remove the immediate call to adjustVolume
        // adjustVolume(newVolume);
    };

    const handleEqualizerPresetChange = (event) => {
        const newPreset = event.target.value;
        setLocalEqualizerPreset(newPreset);
        applyEqualizerPreset(newPreset);
    };

    const handlePlaybackSpeedChange = (event) => {
        const newSpeed = parseFloat(event.target.value);
        setLocalPlaybackSpeed(newSpeed);
        setPlaybackSpeed(newSpeed);
    };

    const handleAutoplayChange = (event) => {
        const newAutoplay = event.target.checked;
        setLocalAutoplay(newAutoplay);
        setAutoplay(newAutoplay);
    };

    const handleKeybindChange = useCallback((action, newCode) => {
        const duplicateAction = Object.keys(localKeybinds).find(key => localKeybinds[key] === newCode);
        if (duplicateAction && duplicateAction !== action) {
            setWarningMessage(`Keybind conflict: ${newCode} is already assigned to ${duplicateAction}`);
            setShowWarning(true);
        } else {
            setLocalKeybinds(prevKeybinds => ({
                ...prevKeybinds,
                [action]: newCode
            }));
            setKeybinds(prevKeybinds => ({
                ...prevKeybinds,
                [action]: newCode
            }));
            setShowWarning(false);
        }
    }, [localKeybinds, setKeybinds]);

    const handleKeyDown = useCallback((event) => {
        if (editingKeybind) {
            handleKeybindChange(editingKeybind, event.code);
            setEditingKeybind(null);
        }
    }, [editingKeybind, handleKeybindChange]);

    useEffect(() => {
        if (editingKeybind) {
            window.addEventListener('keydown', handleKeyDown);
        } else {
            window.removeEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [editingKeybind, handleKeyDown]);

    const increasePlaybackSpeed = () => {
        const newSpeed = Math.min(localPlaybackSpeed + 0.1, 4);
        setLocalPlaybackSpeed(newSpeed);
        setPlaybackSpeed(newSpeed);
    };

    const decreasePlaybackSpeed = () => {
        const newSpeed = Math.max(localPlaybackSpeed - 0.1, 0.1);
        setLocalPlaybackSpeed(newSpeed);
        setPlaybackSpeed(newSpeed);
    };

    const handleJumpStepChange = (event) => {
        const { name, value } = event.target;
        setLocalJumpSteps(prevSteps => ({
            ...prevSteps,
            [name]: parseInt(value, 10) * 1000 // Convert seconds to milliseconds
        }));
    };

    const handleSaveSettings = () => {
        const newConfig = {
            volume: localVolume,
            equalizerPreset: localEqualizerPreset,
            playbackSpeed: localPlaybackSpeed,
            autoplay: localAutoplay,
            keybinds: localKeybinds,
            jumpSteps: localJumpSteps,
            // ...other settings...
        };
        fetch('http://localhost:8000/api/settings/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newConfig),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Settings saved:', data);
            setJumpSteps(localJumpSteps); // Apply the new jump steps immediately
            // Apply the new volume immediately
            adjustVolume(localVolume);
        })
        .catch(error => console.error('Error saving settings:', error));
        playSoundEffect('http://localhost:8000/media/sound effects/SFX_Save.mp3');
    };

    const handleResetSettings = () => {
        fetch('http://localhost:8000/api/settings/reset/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Settings reset to default:', data);
            setLocalVolume(data.volume);
            setLocalEqualizerPreset(data.equalizerPreset);
            setLocalPlaybackSpeed(data.playbackSpeed);
            setLocalAutoplay(data.autoplay);
            setLocalKeybinds(data.keybinds);
            setLocalJumpSteps(data.jumpSteps);
            adjustVolume(data.volume);
            applyEqualizerPreset(data.equalizerPreset);
            setPlaybackSpeed(data.playbackSpeed);
            setAutoplay(data.autoplay);
            setKeybinds(data.keybinds);
            setJumpSteps(data.jumpSteps);
        })
        .catch(error => console.error('Error resetting settings:', error));
        playSoundEffect('http://localhost:8000/media/sound effects/SFX_Reset.mp3');
    };

    return (
        <div className="settings-container">
            {showWarning && (
                <div className="warning-popup">
                    <p className="error">{warningMessage}</p>
                    <button onClick={() => setShowWarning(false)}>Close</button>
                </div>
            )}
            <h1>SETTINGS</h1>
            <div className="settings-row" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <div className="line"></div>
                <div className="line"></div>
                <label className="settings-label">Default Volume Level:</label>
                <div className="settings-input">
                    <div className="range-container">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={localVolume}
                            onChange={handleVolumeChange}
                        />
                        <span>{(localVolume * 100).toFixed(0)}%</span>
                    </div>
                </div>
            </div>
            <div className="settings-row" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <div className="line"></div>
                <div className="line"></div>
                <label className="settings-label">Equalizer Presets:</label>
                <div className="settings-input">
                    <div className="radio-container">
                        <input
                            type="radio"
                            id="flat"
                            name="equalizerPreset"
                            value="flat"
                            checked={localEqualizerPreset === 'flat'}
                            onChange={handleEqualizerPresetChange}
                        />
                        <label htmlFor="flat">Flat</label>
                        <input
                            type="radio"
                            id="bass"
                            name="equalizerPreset"
                            value="bass"
                            checked={localEqualizerPreset === 'bass'}
                            onChange={handleEqualizerPresetChange}
                        />
                        <label htmlFor="bass">Bass Boost</label>
                        <input
                            type="radio"
                            id="treble"
                            name="equalizerPreset"
                            value="treble"
                            checked={localEqualizerPreset === 'treble'}
                            onChange={handleEqualizerPresetChange}
                        />
                        <label htmlFor="treble">Treble Boost</label>
                        <input
                            type="radio"
                            id="vocal"
                            name="equalizerPreset"
                            value="vocal"
                            checked={localEqualizerPreset === 'vocal'}
                            onChange={handleEqualizerPresetChange}
                        />
                        <label htmlFor="vocal">Vocal Boost</label>
                    </div>
                </div>
            </div>
            <div className="settings-row" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <div className="line"></div>
                <div className="line"></div>
                <label className="settings-label">Playback Speed:</label>
                <div className="playback-speed-container">
                    <span className="playback-speed-arrow" onClick={decreasePlaybackSpeed}>&lt;</span>
                    <input
                        type="range"
                        className="playback-speed-slider"
                        min="0.1"
                        max="4"
                        step="0.1"
                        value={localPlaybackSpeed}
                        onChange={handlePlaybackSpeedChange}
                    />
                    <span className="playback-speed-arrow" onClick={increasePlaybackSpeed}>&gt;</span>
                    <span className="playback-speed-value">{localPlaybackSpeed.toFixed(1)}x</span>
                </div>
            </div>
            <div className="settings-row checkbox-row" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <div className="line"></div>
                <div className="line"></div>
                <label className="settings-label">Autoplay:</label>
                <label className="settings-input">
                    <input
                        type="checkbox"
                        checked={localAutoplay}
                        onChange={handleAutoplayChange}
                    />
                    <span className="checkbox-text">{localAutoplay ? 'Enabled' : 'Disabled'}</span>
                </label>
            </div>
            <div className="settings-row" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <div className="line"></div>
                <div className="line"></div>
                <label className="settings-label">Rewind Jump Step (seconds):</label>
                <div className="settings-input">
                    <div className="range-container">
                        <input
                            type="range"
                            name="backward"
                            min="1"
                            max="10"
                            step="1"
                            value={localJumpSteps.backward / 1000} // Convert milliseconds to seconds
                            onChange={handleJumpStepChange}
                        />
                        <span>{localJumpSteps.backward / 1000}s</span>
                    </div>
                </div>
            </div>
            <div className="settings-row" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <div className="line"></div>
                <div className="line"></div>
                <label className="settings-label">Forward Jump Step (seconds):</label>
                <div className="settings-input">
                    <div className="range-container">
                        <input
                            type="range"
                            name="forward"
                            min="1"
                            max="10"
                            step="1"
                            value={localJumpSteps.forward / 1000} // Convert milliseconds to seconds
                            onChange={handleJumpStepChange}
                        />
                        <span>{localJumpSteps.forward / 1000}s</span>
                    </div>
                </div>
            </div>
            <div className="settings-row keyboard-shortcuts-row" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <div className="line"></div>
                <div className="line"></div>
                <label className="settings-label">Keyboard Shortcuts:</label>
                <div className="settings-input" style={{ height: 'auto' }}>
                    {Object.entries(localKeybinds).map(([action, code]) => (
                        <button
                            className={`keybind-row ${editingKeybind === action ? 'editing' : ''}`}
                            key={action}
                            onDoubleClick={() => setEditingKeybind(action)}
                        >
                            <>
                                <div className="keybind-action">
                                    {action.replace(/([A-Z])/g, ' $1').toUpperCase()}
                                </div>
                                <div className="keybind-label">
                                    {editingKeybind === action ? <span className="blinking-underscore">_</span> : (keyDisplayNames[code] || code)}
                                </div>
                            </>
                        </button>
                    ))}
                </div>
            </div>
            <div className="button-container" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button className="save-button" onClick={handleSaveSettings}>SAVE</button>
                <button className="reset-button" onClick={handleResetSettings}>RESET</button>
            </div>
        </div>
    );
}

export default Settings;
