import { create } from 'zustand';
import { ParticleMode } from '@/lib/particles/ParticleSystem';

interface ParticleState {
    mode: ParticleMode;
    currentFormation: string;
    particleCount: number;
    isAnimating: boolean;
    rotationSpeed: number;
    scale: number;
    setMode: (mode: ParticleMode) => void;
    setFormation: (formation: string) => void;
    setParticleCount: (count: number) => void;
    setIsAnimating: (animating: boolean) => void;
    setRotationSpeed: (speed: number) => void;
    setScale: (scale: number) => void;
}

export const useParticleStore = create<ParticleState>((set) => ({
    mode: 'drift',
    currentFormation: 'random',
    particleCount: 20000,
    isAnimating: false,
    rotationSpeed: 0,
    scale: 1,
    setMode: (mode) => set({ mode }),
    setFormation: (formation) => set({ currentFormation: formation }),
    setParticleCount: (count) => set({ particleCount: count }),
    setIsAnimating: (animating) => set({ isAnimating: animating }),
    setRotationSpeed: (speed) => set({ rotationSpeed: speed }),
    setScale: (scale) => set({ scale }),
}));
