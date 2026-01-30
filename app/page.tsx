'use client';

import ParticleCanvas from '@/components/ParticleCanvas';
import CameraControl from '@/components/CameraControl';
import GestureOverlay from '@/components/GestureOverlay';
import CameraPreview from '@/components/CameraPreview';

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden">
      {/* 3D Particle Canvas */}
      <ParticleCanvas />

      {/* Camera Control */}
      <CameraControl />

      {/* Camera Preview */}
      <CameraPreview />

      {/* Gesture Overlay */}
      <GestureOverlay />

      {/* Welcome Text */}
      <div className="fixed top-8 left-8 z-40 max-w-md">
        <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
          Gesture-Controlled
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Particle System
          </span>
        </h1>
        <p className="text-white/80 text-lg drop-shadow-md">
          Enable your camera and use hand gestures to control the particles
        </p>
      </div>
    </main>
  );
}
