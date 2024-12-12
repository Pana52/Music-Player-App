import React from 'react';
import './styles/Settings.css';

function Settings() {
    return (
        <div className="settings-container">
            <h1>SETTINGS</h1>
            <div className="settings-row">
                <div className="line"></div>
                <div className="line"></div>
                <label className="settings-label">Default Volume Level:</label>
                <input type="range" className="settings-input" min="0" max="1" step="0.1" defaultValue="0.5" />
            </div>
            <div className="settings-row">
                <div className="line"></div>
                <div className="line"></div>
                <label className="settings-label">Playback Quality:</label>
                <select className="settings-input">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
            </div>
            <div className="settings-row">
                <div className="line"></div>
                <div className="line"></div>
                <label className="settings-label">Equalizer Presets:</label>
                <select className="settings-input">
                    <option value="bass">Bass Boost</option>
                    <option value="treble">Treble Boost</option>
                    <option value="vocal">Vocal Boost</option>
                </select>
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
                <label className="settings-label">Playback Speed Presets:</label>
                <input type="number" className="settings-input" min="0.5" max="2" step="0.1" defaultValue="1.0" />
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
        </div>
    );
}

export default Settings;
