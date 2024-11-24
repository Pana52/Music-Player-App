import React, { useRef, useEffect } from 'react';
import AudioMotionAnalyzer from 'audiomotion-analyzer';
import './styles/AudioVisualizer.css';

const AudioVisualizer = ({
    audioRef,
    fftSize = 512,
    barWidth = 15,
    barSpacing = 4,
    gradientColors = [
        { pos: 0, color: 'rgba(255, 255, 255, 0.3)' }, // Light reflection at the top
        { pos: 0.3, color: 'rgba(255, 255, 255, 0.1)' }, // Glossy fade
        { pos: 0.5, color: 'rgba(0, 255, 255, 0.5)' }, // Transparent glassy midsection
        { pos: 0.8, color: 'rgba(0, 0, 255, 0.3)' }, // Darker bottom
        { pos: 1, color: 'rgba(0, 0, 0, 0.1)' }, // Transparent bottom
    ],
}) => {
    const visualizerContainerRef = useRef(null);
    const audioMotionRef = useRef(null);

    useEffect(() => {
        const initializeVisualizer = () => {
            if (visualizerContainerRef.current && audioRef?.current?.audio.current) {
                if (audioMotionRef.current) {
                    audioMotionRef.current.destroy();
                }

                // Create the visualizer instance
                audioMotionRef.current = new AudioMotionAnalyzer(visualizerContainerRef.current, {
                    source: audioRef.current.audio.current,
                    connectSpeakers: false,
                    fftSize: fftSize,
                    barWidth: barWidth,
                    barSpacing: barSpacing,
                    mode: 2, // Centered bars
                    showScaleX: false,
                    showScaleY: false,
                    showBgColor: true,
                    bgAlpha: 0,
                    overlay: true,
                    fsWidth: window.innerWidth,
                    fsHeight: window.innerHeight,
                    showPeaks: false
                });
                

                console.log('[DEBUG]: Visualizer initialized.');

                // Register and apply gradient
                audioMotionRef.current.registerGradient('glass-gradient', {
                    colorStops: gradientColors,
                    direction: 'vertical',
                });
                audioMotionRef.current.setOptions({ gradient: 'glass-gradient' });
            } else {
                console.log('[DEBUG]: Visualizer container or audio element not ready.');
            }
        };

        if (audioRef?.current?.audio.current) {
            initializeVisualizer();
        }

        return () => {
            if (audioMotionRef.current) {
                console.log('[DEBUG]: Destroying visualizer instance.');
                audioMotionRef.current.destroy();
            }
        };
    }, [audioRef, fftSize, barWidth, barSpacing, gradientColors]);

    return (
        <div
            ref={visualizerContainerRef}
            className="visualizer-container"
        />
    );
};

export default AudioVisualizer;
