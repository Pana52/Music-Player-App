// SoundVisualizer.js
import React, { useRef, useEffect } from 'react';

function SoundVisualizer({ audioElement }) {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    const initAudioContext = () => {
      // Initialize AudioContext on user gesture (e.g., on play)
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;

        const source = audioContextRef.current.createMediaElementSource(audioElement);
        source.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      }
    };

    // Attach 'play' event listener to initialize AudioContext
    audioElement.addEventListener('play', initAudioContext, { once: true });

    // Set up drawing function for visualization
    const canvas = canvasRef.current;
    const canvasContext = canvas.getContext('2d');

    const draw = () => {
      requestAnimationFrame(draw);

      if (!analyserRef.current) return; // Safeguard in case analyser is not yet initialized

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      canvasContext.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];
        canvasContext.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
        canvasContext.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      audioElement.removeEventListener('play', initAudioContext);
    };
  }, [audioElement]);

  return <canvas ref={canvasRef} width={500} height={100} />;
}

export default SoundVisualizer;
