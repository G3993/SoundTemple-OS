'use client';

import { useEffect, useRef, useState } from 'react';
import { audioService } from '../services/audioService';

export default function AudioVisualizer() {
  const shaderCanvasRef = useRef<HTMLCanvasElement>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const shaderAnimationRef = useRef<number>();
  const waveformAnimationRef = useRef<number>();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Vibration channels corresponding to the 5 zones
  const channels = [
    { name: 'HEAD', color: '#60A5FA' },        // Blue
    { name: 'SHOULDERS', color: '#A78BFA' },   // Purple
    { name: 'HEART', color: '#F87171' },       // Red
    { name: 'BELLY', color: '#FB923C' },       // Orange
    { name: 'LOWER BACK', color: '#4ADE80' },  // Green
  ];

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Shader visualization (left side)
  useEffect(() => {
    const canvas = shaderCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    let time = 0;

    const render = () => {
      if (!ctx || !canvas) return;

      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Get audio data
      const audioData = audioService.getAnalysisData();

      if (audioData) {
        const bass = audioData.bass;
        const mid = audioData.mid;
        const treble = audioData.treble;

        const centerX = width / 2;
        const centerY = height / 2;

        // Background pulse based on bass
        const pulseSize = 100 + bass * 200;
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${bass * 0.2})`);
        gradient.addColorStop(0.5, `rgba(100, 100, 200, ${bass * 0.15})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Draw wave rings
        const numRings = 6;
        for (let i = 0; i < numRings; i++) {
          const ringProgress = (time * 0.3 + i * 0.4) % 1;
          const ringRadius = ringProgress * Math.min(width, height) * 0.4;
          const ringOpacity = (1 - ringProgress) * bass * 0.6;

          ctx.strokeStyle = `rgba(255, 255, 255, ${ringOpacity})`;
          ctx.lineWidth = 2 + bass * 6;
          ctx.beginPath();
          ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw frequency bars around center
        const numBars = 48;
        const barData = audioData.frequencyData;
        const barStep = Math.floor(barData.length / numBars);

        for (let i = 0; i < numBars; i++) {
          const angle = (i / numBars) * Math.PI * 2;
          const barIndex = Math.min(i * barStep, barData.length - 1);
          const barHeight = (barData[barIndex] / 255) * 80;

          const isLowFreq = i < numBars * 0.2;
          const barIntensity = isLowFreq ? barHeight * 1.3 : barHeight;

          const innerRadius = 60 + bass * 30;
          const outerRadius = innerRadius + barIntensity;

          const x1 = centerX + Math.cos(angle) * innerRadius;
          const y1 = centerY + Math.sin(angle) * innerRadius;
          const x2 = centerX + Math.cos(angle) * outerRadius;
          const y2 = centerY + Math.sin(angle) * outerRadius;

          ctx.strokeStyle = isLowFreq
            ? `rgba(255, 255, 255, ${0.5 + barHeight / 200})`
            : `rgba(150, 150, 200, ${0.3 + barHeight / 250})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        // Central pulse
        const centralPulse = 20 + bass * 40;
        const pulseGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, centralPulse);
        pulseGradient.addColorStop(0, `rgba(255, 255, 255, ${bass * 0.8})`);
        pulseGradient.addColorStop(0.6, `rgba(200, 200, 255, ${bass * 0.4})`);
        pulseGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = pulseGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, centralPulse, 0, Math.PI * 2);
        ctx.fill();

        time += 0.016;
      } else {
        // Idle state
        const centerX = width / 2;
        const centerY = height / 2;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
        ctx.stroke();
      }

      shaderAnimationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', updateSize);
      if (shaderAnimationRef.current) {
        cancelAnimationFrame(shaderAnimationRef.current);
      }
    };
  }, []);

  // Waveform visualization (right side)
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    let time = 0;
    const numPoints = 150;
    const waveHistory: number[][] = channels.map(() => new Array(numPoints).fill(0));

    const render = () => {
      if (!ctx || !canvas) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      const audioData = audioService.getAnalysisData();

      if (audioData) {
        const frequencyData = audioData.frequencyData;
        const rangeSize = Math.floor(frequencyData.length / 5);

        channels.forEach((channel, channelIndex) => {
          const startIdx = channelIndex * rangeSize;
          const endIdx = startIdx + rangeSize;

          let sum = 0;
          for (let i = startIdx; i < endIdx; i++) {
            sum += frequencyData[i] || 0;
          }
          const avgIntensity = sum / rangeSize / 255;

          waveHistory[channelIndex].shift();
          waveHistory[channelIndex].push(avgIntensity);
        });

        const layerHeight = height / 6;
        const baselineY = (index: number) => (index + 1) * layerHeight;

        channels.forEach((channel, channelIndex) => {
          const y = baselineY(channelIndex);
          const waveData = waveHistory[channelIndex];

          ctx.beginPath();
          ctx.strokeStyle = channel.color;
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          for (let i = 0; i < numPoints; i++) {
            const x = (i / numPoints) * width;
            const intensity = waveData[i] || 0;

            const timeOffset = time * 1.5 + channelIndex * 0.3;
            const wave1 = Math.sin(i * 0.08 + timeOffset) * 12;
            const wave2 = Math.sin(i * 0.05 + timeOffset * 0.6) * 8;
            const wave3 = Math.sin(i * 0.12 + timeOffset * 1.2) * 6;

            const waveY = y + wave1 + wave2 + wave3 + (intensity * 60 - 30);

            if (i === 0) {
              ctx.moveTo(x, waveY);
            } else {
              ctx.lineTo(x, waveY);
            }
          }

          ctx.stroke();

          // Glow effect
          ctx.shadowBlur = 15;
          ctx.shadowColor = channel.color;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Channel label
          ctx.fillStyle = channel.color;
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(channel.name, 15, y - 5);
        });

        time += 0.016;
      } else {
        // Idle state
        const layerHeight = height / 6;

        channels.forEach((channel, channelIndex) => {
          const y = (channelIndex + 1) * layerHeight;

          ctx.beginPath();
          ctx.strokeStyle = channel.color + '40';
          ctx.lineWidth = 2;

          for (let i = 0; i < numPoints; i++) {
            const x = (i / numPoints) * width;
            const waveY = y + Math.sin(i * 0.08) * 8;

            if (i === 0) {
              ctx.moveTo(x, waveY);
            } else {
              ctx.lineTo(x, waveY);
            }
          }

          ctx.stroke();

          ctx.fillStyle = channel.color + '60';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(channel.name, 15, y - 5);
        });
      }

      waveformAnimationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', updateSize);
      if (waveformAnimationRef.current) {
        cancelAnimationFrame(waveformAnimationRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-black rounded-3xl p-6" ref={containerRef}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Audio Visualizer</h2>
        <button
          onClick={toggleFullscreen}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          )}
        </button>
      </div>

      <div className={`grid grid-cols-2 gap-4 ${isFullscreen ? 'h-[calc(100vh-120px)]' : ''}`}>
        {/* Shader Visualization - Left */}
        <div className={`relative rounded-2xl overflow-hidden bg-black ${isFullscreen ? 'h-full' : 'aspect-square'}`}>
          <canvas
            ref={shaderCanvasRef}
            className="w-full h-full"
          />
        </div>

        {/* Waveform Visualization - Right */}
        <div className={`relative rounded-2xl overflow-hidden bg-black ${isFullscreen ? 'h-full' : 'aspect-square'}`}>
          <canvas
            ref={waveformCanvasRef}
            className="w-full h-full"
          />
        </div>
      </div>

      <div className="mt-6 p-4 bg-[#1a1a1a] rounded-2xl">
        <div className="text-xs text-gray-400 mb-2">5-CHANNEL VISUALIZATION</div>
        <div className="text-sm mb-3">Real-time frequency response per vibration zone</div>
        <div className="grid grid-cols-5 gap-2 text-xs">
          {channels.map((channel) => (
            <div key={channel.name} className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: channel.color }}
              />
              <span className="text-gray-400 truncate">{channel.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
