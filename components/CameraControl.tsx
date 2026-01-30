'use client';

import { useRef, useEffect, useState } from 'react';
import { HandTracker } from '@/lib/hand-tracking/HandTracker';
import { useGestureStore } from '@/store/useGestureStore';
import { WebGLUtils } from '@/lib/webgl-utils';

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
            let errorMessage = 'Failed to access camera';
            
            if (err instanceof Error) {
                errorMessage = err.message;
                
                if (err.message.includes('WebGL')) {
                    errorMessage += '\n\nTry:\n• Closing other browser tabs\n• Restarting your browser\n• Updating your graphics drivers';
                } else if (err.message.includes('permission')) {
                    errorMessage += '\n\nPlease allow camera access in your browser settings.';
                }
            }
            
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

    const runDiagnostics = () => {
        const webglInfo = WebGLUtils.getInfo();
        const hasWebGL = WebGLUtils.checkSupport();
        
        let diagnosticMessage = `WebGL Support: ${hasWebGL ? 'Yes' : 'No'}\n`;
        
        if (webglInfo) {
            diagnosticMessage += `Version: ${webglInfo.version}\n`;
            diagnosticMessage += `Renderer: ${webglInfo.renderer}\n`;
            diagnosticMessage += `Vendor: ${webglInfo.vendor}\n`;
            diagnosticMessage += `Max Texture Size: ${webglInfo.maxTextureSize}\n`;
        }
        
        const recommendations = WebGLUtils.getRecommendations();
        if (recommendations.length > 0) {
            diagnosticMessage += `\nRecommendations:\n${recommendations.join('\n')}`;
        }
        
        setError(diagnosticMessage);
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
                <div className="bg-red-500/90 text-white px-4 py-3 rounded-lg max-w-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium">
                                {error.includes('WebGL Support:') ? 'System Diagnostics' : 'Error'}
                            </p>
                            <pre className="text-xs mt-1 whitespace-pre-line font-sans">{error}</pre>
                        </div>
                        <button
                            onClick={() => setError(null)}
                            className="ml-2 text-white/70 hover:text-white"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Diagnostic button - only show if there's an error or camera is disabled */}
            {(!cameraEnabled || error) && (
                <button
                    onClick={runDiagnostics}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                >
                    Run Diagnostics
                </button>
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
