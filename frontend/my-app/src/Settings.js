import React, { useContext, useState, useEffect } from 'react';
import './styles/Settings.css';
import { AudioPlayerContext } from './AudioContext';

const defaultConfig = {
    volume: 0.5,
    equalizerPreset: 'flat',
    playbackSpeed: 1,
    // ...other default settings...
};

function Settings() {
    const { volume, adjustVolume, equalizerPreset, applyEqualizerPreset, playbackSpeed, setPlaybackSpeed } = useContext(AudioPlayerContext);
    const [localVolume, setLocalVolume] = useState(volume);
    const [localEqualizerPreset, setLocalEqualizerPreset] = useState(equalizerPreset);
    const [localPlaybackSpeed, setLocalPlaybackSpeed] = useState(playbackSpeed || 1); // Ensure default value

    useEffect(() => {
        fetch('http://localhost:8000/api/settings/')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(config => {
                setLocalVolume(config.volume);
                setLocalEqualizerPreset(config.equalizerPreset);
                setLocalPlaybackSpeed(config.playbackSpeed || 1); // Ensure default value
            })
            .catch(error => console.error('Error loading config:', error));
    }, []);

    const handleVolumeChange = (event) => {
        const newVolume = parseFloat(event.target.value);
        setLocalVolume(newVolume);
        adjustVolume(newVolume);
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

    const handleSaveSettings = () => {
        const newConfig = {
            volume: localVolume,
            equalizerPreset: localEqualizerPreset,
            playbackSpeed: localPlaybackSpeed,
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
        .then(data => console.log('Settings saved:', data))
        .catch(error => console.error('Error saving settings:', error));
    };

    const handleResetSettings = () => {
        setLocalVolume(defaultConfig.volume);
        setLocalEqualizerPreset(defaultConfig.equalizerPreset);
        setLocalPlaybackSpeed(defaultConfig.playbackSpeed);
        adjustVolume(defaultConfig.volume);
        applyEqualizerPreset(defaultConfig.equalizerPreset);
        setPlaybackSpeed(defaultConfig.playbackSpeed);

        fetch('http://localhost:8000/api/settings/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(defaultConfig),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => console.log('Settings reset to default:', data))
        .catch(error => console.error('Error resetting settings:', error));
    };

    return (
        <div className="settings-container">
            <h1>SETTINGS</h1>
            <div className="settings-row">
                <div className="line"></div>
                <div className="line"></div>
                <label className="settings-label">Default Volume Level:</label>
                <input
                    type="range"
                    className="settings-input"
                    min="0"
                    max="1"
                    step="0.1"
                    value={localVolume}
                    onChange={handleVolumeChange}
                />
            </div>
            <div className="settings-row">
                <div className="line"></div>
                <div className="line"></div>
                <label className="settings-label">Equalizer Presets:</label>
                <select
                    className="settings-input"
                    value={localEqualizerPreset}
                    onChange={handleEqualizerPresetChange}
                >
                    <option value="flat">Flat</option>
                    <option value="bass">Bass Boost</option>
                    <option value="treble">Treble Boost</option>
                    <option value="vocal">Vocal Boost</option>
                </select>
            </div>
            <div className="settings-row">
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
            <div className="settings-row">
                <div className="line"></div>
                <div className="line"></div>
                <label className="settings-label">Theme/Appearance:</label>
                <select className="settings-input">
                    <option value="light">Light Mode</option>
                    <option value="dark">Dark Mode</option>
                </select>
            </div>
            <div className="settings-row">
                <div className="line"></div>
                <div className="line"></div>
                <label className="settings-label">Autoplay:</label>
                <input type="checkbox" className="settings-input" defaultChecked />
            </div>
            <div className="settings-row">
                <div className="line"></div>
                <div className="line"></div>
                <label className="settings-label">Crossfade:</label>
                <input type="checkbox" className="settings-input" />
                <input type="number" className="settings-input" min="0" max="10" step="1" placeholder="Duration (s)" />
            </div>
            <div className="settings-row">
                <div className="line"></div>
                <div className="line"></div>
                <label className="settings-label">Notifications:</label>
                <input type="checkbox" className="settings-input" />
            </div>
            <div className="settings-row">
                <div className="line"></div>
                <div className="line"></div>
                <label className="settings-label">Keyboard Shortcuts:</label>
                <button className="settings-input">Customize</button>
            </div>
            <div className="settings-row">
                <div className="line"></div>
                <div className="line"></div>
                <label className="settings-label">Language/Localization:</label>
                <select className="settings-input">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                </select>
            </div>
            <div className="button-container" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button className="save-button" onClick={handleSaveSettings}>SAVE</button>
                <button className="reset-button" onClick={handleResetSettings}>RESET</button>
            </div>
        </div>
    );
}

export default Settings;
