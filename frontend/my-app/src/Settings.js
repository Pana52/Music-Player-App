import React from 'react';
import './styles/Settings.css';

function Settings({
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
  equalizerPreset,
  setEqualizerPreset,
  normalization,
  setNormalization,
  spatialAudio,
  setSpatialAudio,
  playbackQuality,
  setPlaybackQuality,
}) {
  const handleCrossfadeChange = (e) => {
    setCrossfade(e.target.checked);
    if (e.target.checked) {
      setGaplessPlayback(false);
    }
  };

  const handleGaplessChange = (e) => {
    setGaplessPlayback(e.target.checked);
    if (e.target.checked) {
      setCrossfade(false);
    }
  };

  return (
    <div className="settings-container">
      <h1>Settings</h1>
      <p>Experimental.</p>

      <h2>Playback Preferences</h2>
      <ul className="settings-row">
        <li>
          <label>
            Seek Interval:
            <select value={seekInterval} onChange={(e) => setSeekInterval(Number(e.target.value))}>
              <option value={5}>5s</option>
              <option value={10}>10s</option>
              <option value={15}>15s</option>
            </select>
          </label>
        </li>
        <li>
          <label>
            Crossfade:
            <input
              type="checkbox"
              checked={crossfade}
              onChange={handleCrossfadeChange}
            />
            {crossfade && (
              <input
                type="number"
                value={crossfadeDuration}
                onChange={(e) => setCrossfadeDuration(Number(e.target.value))}
                min="1"
                max="10"
              />
            )}
          </label>
        </li>
        <li>
          <label>
            Gapless Playback:
            <input
              type="checkbox"
              checked={gaplessPlayback}
              onChange={handleGaplessChange}
            />
          </label>
        </li>
      </ul>

      <h2>Volume Control</h2>
      <ul className="settings-row">
        <li>
          <label>
            Default Volume Level:
            <input
              type="range"
              value={defaultVolume * 100}
              onChange={(e) => setDefaultVolume(Number(e.target.value) / 100)}
              min="0"
              max="100"
            />
          </label>
        </li>
        <li>
          <label>
            Volume Scale Preference:
            <select value={volumeScale} onChange={(e) => setVolumeScale(e.target.value)}>
              <option value="linear">Linear</option>
              <option value="logarithmic">Logarithmic</option>
            </select>
          </label>
        </li>
      </ul>

      <h2>Audio Effects</h2>
      <ul className="settings-row">
        <li>
          <label>
            Equalizer Presets:
            <select value={equalizerPreset} onChange={(e) => setEqualizerPreset(e.target.value)}>
              <option value="Bass Boost">Bass Boost</option>
              <option value="Treble Boost">Treble Boost</option>
              <option value="Flat">Flat</option>
            </select>
          </label>
        </li>
        <li>
          <label>
            Enable Normalization:
            <input
              type="checkbox"
              checked={normalization}
              onChange={(e) => setNormalization(e.target.checked)}
            />
          </label>
        </li>
        <li>
          <label>
            Spatial Audio:
            <input
              type="checkbox"
              checked={spatialAudio}
              onChange={(e) => setSpatialAudio(e.target.checked)}
            />
          </label>
        </li>
      </ul>

      <h2>Playback Quality</h2>
      <ul className="settings-row">
        <li>
          <label>
            Local Playback Quality:
            <select value={playbackQuality} onChange={(e) => setPlaybackQuality(e.target.value)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </label>
        </li>
      </ul>
    </div>
  );
}

export default Settings;
