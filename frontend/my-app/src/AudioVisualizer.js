import React, { useRef, useEffect, useContext } from 'react';
import AudioMotionAnalyzer from 'audiomotion-analyzer';
import './styles/AudioVisualizer.css';
import { AudioPlayerContext } from './AudioContext';

const AudioVisualizer = ({
    audioRef,
    fftSize = 2048,
    barWidth = 16,
    barSpacing = 8,
    gradientColors = [
        { pos: 0, color: 'rgba(255, 255, 255, 0.5)' }, // Light reflection at the top
        { pos: 0.3, color: 'rgba(255, 255, 255, 0.3)' }, // Glossy fade
        { pos: 0.5, color: 'rgba(255, 255, 255, 0.2)' }, // Transparent glassy midsection
        { pos: 0.8, color: 'rgba(255, 255, 255, 0.1)' }, // Lighter bottom
        { pos: 1, color: 'rgba(255, 255, 255, 0.05)' }, // Transparent bottom
    ],
    isVisible
}) => {
    const leftVisualizerRef = useRef(null);
    const rightVisualizerRef = useRef(null);
    const audioMotionLeftRef = useRef(null);
    const audioMotionRightRef = useRef(null);
    const { initializeAudioContext } = useContext(AudioPlayerContext);

    useEffect(() => {
        if (isVisible) {
            try {
                initializeAudioContext();
                const initializeVisualizer = (containerRef, audioMotionRef) => {
                    if (containerRef.current && audioRef?.current?.audio.current) {
                        if (audioMotionRef.current) {
                            audioMotionRef.current.destroy();
                        }

                        // Create the visualizer instance
                        audioMotionRef.current = new AudioMotionAnalyzer(containerRef.current, {
                            source: audioRef.current.audio.current,
                            connectSpeakers: false,
                            fftSize: fftSize,
                            barWidth: barWidth,
                            barSpacing: barSpacing,
                            mode: 5, // Centered bars
                            showScaleX: false,
                            showScaleY: false,
                            showBgColor: false, // Disable background color
                            bgAlpha: 0,
                            overlay: true,
                            fsWidth: window.innerWidth / 2,
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
                    initializeVisualizer(leftVisualizerRef, audioMotionLeftRef);
                    initializeVisualizer(rightVisualizerRef, audioMotionRightRef);
                }

                const leftAudioMotion = audioMotionLeftRef.current;
                const rightAudioMotion = audioMotionRightRef.current;

                return () => {
                    if (leftAudioMotion) {
                        console.log('[DEBUG]: Destroying left visualizer instance.');
                        leftAudioMotion.destroy();
                    }
                    if (rightAudioMotion) {
                        console.log('[DEBUG]: Destroying right visualizer instance.');
                        rightAudioMotion.destroy();
                    }
                };
            } catch (error) {
                console.error('Error initializing visualizer:', error);
            }
        }
    }, [isVisible, initializeAudioContext, audioRef, fftSize, barWidth, barSpacing, gradientColors]);

    return (
        <>
            <div
                ref={leftVisualizerRef}
                className="visualizer-container left"
            />
            <div
                ref={rightVisualizerRef}
                className="visualizer-container right"
            />
        </>
    );
};

export default AudioVisualizer;