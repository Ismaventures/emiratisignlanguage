'use client';

import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
  color?: string;
  barCount?: number;
  height?: number;
}

export function AudioVisualizer({
  isActive,
  color = '#16a34a',
  barCount = 48,
  height = 48,
}: AudioVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !isActive) return;

    const bars = containerRef.current.querySelectorAll<HTMLDivElement>('.wave-bar');

    let frame = 0;
    const animate = () => {
      frame++;
      bars.forEach((bar, i) => {
        const scale = isActive
          ? 0.15 + Math.abs(Math.sin((frame * 0.05) + (i * 0.3))) * 0.85
          : 0.1;
        bar.style.transform = `scaleY(${scale})`;
      });
      animRef = requestAnimationFrame(animate);
    };

    let animRef = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef);
  }, [isActive]);

  return (
    <div
      ref={containerRef}
      className="flex items-center gap-[2px]"
      style={{ height }}
      aria-hidden="true"
    >
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className="wave-bar w-[3px] rounded-full transition-all duration-100"
          style={{
            height: '100%',
            backgroundColor: color,
            opacity: isActive ? 0.9 : 0.15,
            transform: 'scaleY(0.1)',
            transformOrigin: 'center',
          }}
        />
      ))}
    </div>
  );
}
