'use client';

import { useRef, useEffect, useState } from 'react';
import { HandTracker } from '@/lib/hand-tracking/HandTracker';
import { useGestureStore } from '@/store/useGestureStore';

export default function CameraControl() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const handTrackerRef = useRef<HandTracker | null>(null);
    const [isInitializing, setIsInitializing] = useState(false);

    const {
        cameraEnabled,
        setCameraEnabled,
        setHandLandmarks,
        setIsTracking,
        setError,
        error,
    } = useGestureStore();

    useEffect(() => {
        handTrackerRef.current = new HandTracker();

        return () => {
            if (handTrackerRef.current) {
                handTrackerRef.current.dispose();
            }
        };
    }, []);

    const handleEnableCamera = async () => {
        if (!videoRef.current || !handTrackerRef.current) return;

        setIsInitializing(true);
        setError(null);

        try {
            await handTrackerRef.current.startTracking(videoRef.current, (results) => {
                setHandLandmarks(results);
                setIsTracking(true);
            });

            setCameraEnabled(true);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Failed to access camera';
            setError(errorMessage);
            console.error('Camera error:', err);
        } finally {
            setIsInitializing(false);
        }
    };

    const handleDisableCamera = () => {
        if (handTrackerRef.current) {
            handTrackerRef.current.stopTracking();
            setCameraEnabled(false);
            setIsTracking(false);
            setHandLandmarks(null);
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-4">
            {/* Hidden video element for hand tracking */}
            <video
                ref={videoRef}
                className="hidden"
                playsInline
                muted
            />

            {/* Camera control button */}
            <button
                onClick={cameraEnabled ? handleDisableCamera : handleEnableCamera}
                disabled={isInitializing}
                className={`px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 ${cameraEnabled
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-blue-500 hover:bg-blue-600'
                    } ${isInitializing ? 'opacity-50 cursor-not-allowed' : ''} shadow-lg`}
            >
                {isInitializing
                    ? 'Initializing...'
                    : cameraEnabled
                        ? 'Disable Camera'
                        : 'Enable Camera'}
            </button>

            {/* Error message */}
            {error && (
                <div className="bg-red-500/90 text-white px-4 py-3 rounded-lg max-w-xs">
                    <p className="text-sm font-medium">Error</p>
                    <p className="text-xs mt-1">{error}</p>
                </div>
            )}

            {/* Camera status indicator */}
            {cameraEnabled && (
                <div className="bg-green-500/90 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Camera Active</span>
                </div>
            )}
        </div>
    );
}
