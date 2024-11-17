// SoundVisualizer.js
import React, { useRef, useEffect } from 'react';

const FFT_SIZE = 256;
const BAR_HEIGHT_SCALE = 3;
const SIZE = 2;


function SoundVisualizer({ audioElement }) {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  let gradientOffset = 0;

  useEffect(() => {
    const initAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = FFT_SIZE;

        const source = audioContextRef.current.createMediaElementSource(audioElement);
        source.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      }
    };

    audioElement.addEventListener('play', initAudioContext, { once: true });

    const canvas = canvasRef.current;
    const canvasContext = canvas.getContext('2d');

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      requestAnimationFrame(draw);

      if (!analyserRef.current) return;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      canvasContext.clearRect(0, 0, canvas.width, canvas.height);

      // Create a looping background gradient
      const backgroundGradient = canvasContext.createLinearGradient(
        gradientOffset % (canvas.width * 2),
        0,
        (gradientOffset % (canvas.width * 2)) + canvas.width * 2,
        canvas.height
      );
      backgroundGradient.addColorStop(0, 'rgba(255, 0, 150, 0.3)');
      backgroundGradient.addColorStop(0.5, 'rgba(0, 255, 150, 0.3)');
      backgroundGradient.addColorStop(1, 'rgba(0, 150, 255, 0.3)');

      gradientOffset += SIZE; // Adjust for animation speed

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] * BAR_HEIGHT_SCALE;

        // Create a gradient for the glassy bar
        const barGradient = canvasContext.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        barGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)'); // Highlight at the top
        barGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.2)'); // Slight fade
        barGradient.addColorStop(1, `rgba(${barHeight + 100}, 50, 50, 0.5)`); // Main color with transparency

        // Draw the main bar with a shadow
        canvasContext.fillStyle = barGradient;
        canvasContext.shadowColor = 'rgba(255, 255, 255, 0.2)'; // Subtle white shadow for glow effect
        canvasContext.shadowBlur = 8;
        canvasContext.shadowOffsetY = -5;
        canvasContext.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        // Draw an overlay for glossy effect
        const glossGradient = canvasContext.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        glossGradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
        glossGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        canvasContext.fillStyle = glossGradient;
        canvasContext.fillRect(x, canvas.height - barHeight, barWidth, barHeight / 2); // Draw gloss on the upper half

        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      audioElement.removeEventListener('play', initAudioContext);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [audioElement]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
}

export default SoundVisualizer;
