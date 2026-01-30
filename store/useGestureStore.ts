import { create } from 'zustand';
import { GestureType } from '@/lib/hand-tracking/GestureClassifier';

export type Results = any;

interface GestureState {
    cameraEnabled: boolean;
    currentGesture: GestureType;
    gestureConfidence: number;
    handLandmarks: Results | null;
    isTracking: boolean;
    error: string | null;
    setCameraEnabled: (enabled: boolean) => void;
    setCurrentGesture: (gesture: GestureType, confidence: number) => void;
    setHandLandmarks: (landmarks: Results | null) => void;
    setIsTracking: (tracking: boolean) => void;
    setError: (error: string | null) => void;
}

export const useGestureStore = create<GestureState>((set) => ({
    cameraEnabled: false,
    currentGesture: 'none',
    gestureConfidence: 0,
    handLandmarks: null,
    isTracking: false,
    error: null,
    setCameraEnabled: (enabled) => set({ cameraEnabled: enabled }),
    setCurrentGesture: (gesture, confidence) =>
        set({ currentGesture: gesture, gestureConfidence: confidence }),
    setHandLandmarks: (landmarks) => set({ handLandmarks: landmarks }),
    setIsTracking: (tracking) => set({ isTracking: tracking }),
    setError: (error) => set({ error }),
}));
