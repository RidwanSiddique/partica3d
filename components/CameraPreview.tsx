'use client';

import { useEffect, useRef } from 'react';
import { useGestureStore } from '@/store/useGestureStore';

export default function CameraPreview() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { cameraEnabled, handLandmarks } = useGestureStore();

    useEffect(() => {
        if (!canvasRef.current || !handLandmarks) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw hand landmarks if available
        if (handLandmarks.multiHandLandmarks) {
            handLandmarks.multiHandLandmarks.forEach((landmarks: any, handIndex: number) => {
                // Draw connections between landmarks
                const connections = [
                    // Thumb
                    [0, 1], [1, 2], [2, 3], [3, 4],
                    // Index finger
                    [0, 5], [5, 6], [6, 7], [7, 8],
                    // Middle finger
                    [0, 9], [9, 10], [10, 11], [11, 12],
                    // Ring finger
                    [0, 13], [13, 14], [14, 15], [15, 16],
                    // Pinky
                    [0, 17], [17, 18], [18, 19], [19, 20],
                    // Palm
                    [5, 9], [9, 13], [13, 17],
                ];

                // Draw connections
                ctx.strokeStyle = handIndex === 0 ? '#00ffff' : '#ff00ff';
                ctx.lineWidth = 2;
                connections.forEach(([start, end]) => {
                    const startPoint = landmarks[start];
                    const endPoint = landmarks[end];

                    ctx.beginPath();
                    ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
                    ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
                    ctx.stroke();
                });

                // Draw landmark points
                landmarks.forEach((landmark: any, index: number) => {
                    const x = landmark.x * canvas.width;
                    const y = landmark.y * canvas.height;

                    // Different colors for different finger parts
                    if (index === 0) {
                        ctx.fillStyle = '#ff0000'; // Wrist - red
                    } else if ([4, 8, 12, 16, 20].includes(index)) {
                        ctx.fillStyle = '#00ff00'; // Fingertips - green
                    } else {
                        ctx.fillStyle = handIndex === 0 ? '#00ffff' : '#ff00ff';
                    }

                    ctx.beginPath();
                    ctx.arc(x, y, 4, 0, 2 * Math.PI);
                    ctx.fill();

                    // Draw landmark index for debugging
                    ctx.fillStyle = '#ffffff';
                    ctx.font = '10px Arial';
                    ctx.fillText(index.toString(), x + 6, y - 6);
                });
            });
        }

        // Draw hand labels
        if (handLandmarks.multiHandedness) {
            handLandmarks.multiHandedness.forEach((handedness: any, index: number) => {
                const label = handedness.label; // "Left" or "Right"
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 16px Arial';
                ctx.fillText(
                    `${label} Hand`,
                    20,
                    30 + index * 25
                );
            });
        }
    }, [handLandmarks]);

    if (!cameraEnabled) {
        return null;
    }

    return (
        <div className="fixed bottom-8 right-8 z-50">
            <div className="bg-black/80 backdrop-blur-md rounded-lg p-3 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white text-sm font-semibold">Camera Preview</h3>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </div>
                <canvas
                    ref={canvasRef}
                    width={320}
                    height={240}
                    className="rounded-md bg-gray-900"
                />
                <div className="mt-2 text-xs text-white/60">
                    Hand landmarks visualized
                </div>
            </div>
        </div>
    );
}
