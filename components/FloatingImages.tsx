'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

export default function FloatingImages() {
  const [jacketPos, setJacketPos] = useState({ x: 0, y: 0, rotate: 0 });
  const [dressPos, setDressPos] = useState({ x: 0, y: 0, rotate: 0 });
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [activeImage, setActiveImage] = useState<'jacket' | 'dress' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame: number;
    let time = 0;

    const animate = () => {
      time += 0.01;
      
      if (!dragState) {
        // Floating animation for jacket
        setJacketPos(prev => ({
          ...prev,
          y: prev.y + Math.sin(time) * 0.2,
          rotate: Math.sin(time * 0.5) * 2
        }));

        // Floating animation for dress (slightly out of phase)
        setDressPos(prev => ({
          ...prev,
          y: prev.y + Math.sin(time + Math.PI) * 0.2,
          rotate: Math.sin(time * 0.5 + Math.PI) * 2
        }));
      }

      frame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(frame);
  }, [dragState]);

  const handleMouseDown = (e: React.MouseEvent, image: 'jacket' | 'dress') => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragState({
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top
    });
    setActiveImage(image);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState || !activeImage || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newX = e.clientX - containerRect.left - dragState.offsetX;
    const newY = e.clientY - containerRect.top - dragState.offsetY;

    if (activeImage === 'jacket') {
      setJacketPos(prev => ({ ...prev, x: newX, y: newY }));
    } else {
      setDressPos(prev => ({ ...prev, x: newX, y: newY }));
    }
  };

  const handleMouseUp = () => {
    setDragState(null);
    setActiveImage(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[600px] overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="absolute cursor-grab active:cursor-grabbing"
        style={{
          transform: `translate(${jacketPos.x}px, ${jacketPos.y}px) rotate(${jacketPos.rotate}deg)`,
          left: '25%',
          top: '50%',
          transition: dragState ? 'none' : 'transform 0.1s linear'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'jacket')}
      >
        <Image
          src="/clo/jacket.png"
          alt="Floating Jacket"
          width={300}
          height={400}
          className="select-none hover:scale-105 transition-transform duration-200"
          draggable={false}
          priority
        />
      </div>

      <div
        className="absolute cursor-grab active:cursor-grabbing"
        style={{
          transform: `translate(${dressPos.x}px, ${dressPos.y}px) rotate(${dressPos.rotate}deg)`,
          right: '25%',
          top: '50%',
          transition: dragState ? 'none' : 'transform 0.1s linear'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'dress')}
      >
        <Image
          src="/clo/dress.png"
          alt="Floating Dress"
          width={300}
          height={400}
          className="select-none hover:scale-105 transition-transform duration-200"
          draggable={false}
          priority
        />
      </div>
    </div>
  );
} 