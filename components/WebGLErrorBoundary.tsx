'use client';

import { Component, ReactNode } from 'react';

interface WebGLErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

interface WebGLErrorBoundaryProps {
    children: ReactNode;
}

export class WebGLErrorBoundary extends Component<WebGLErrorBoundaryProps, WebGLErrorBoundaryState> {
    constructor(props: WebGLErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): WebGLErrorBoundaryState {
        // Check if error is WebGL related
        const isWebGLError = error.message.toLowerCase().includes('webgl') ||
                           error.message.toLowerCase().includes('context') ||
                           error.name === 'WebGLContextLostError';
        
        if (isWebGLError) {
            return { hasError: true, error };
        }
        
        // Re-throw non-WebGL errors
        throw error;
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('WebGL Error Boundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
                    <div className="max-w-md mx-auto bg-black/80 backdrop-blur-md rounded-lg p-8 border border-white/20 text-center">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        
                        <h2 className="text-2xl font-bold text-white mb-4">WebGL Error</h2>
                        
                        <p className="text-gray-300 mb-6">
                            There was an issue with WebGL context creation. This is required for 3D rendering and hand tracking.
                        </p>

                        <div className="text-left bg-gray-800/50 rounded-lg p-4 mb-6">
                            <h3 className="text-white font-semibold mb-2">Try these solutions:</h3>
                            <ul className="text-sm text-gray-300 space-y-2">
                                <li>• Close other browser tabs using 3D graphics</li>
                                <li>• Restart your browser</li>
                                <li>• Enable hardware acceleration in browser settings</li>
                                <li>• Update your graphics drivers</li>
                                <li>• Use a different browser (Chrome recommended)</li>
                            </ul>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                        >
                            Reload Page
                        </button>

                        {this.state.error && (
                            <details className="mt-4 text-xs text-gray-400">
                                <summary className="cursor-pointer mb-2">Technical Details</summary>
                                <pre className="text-left bg-gray-900/50 p-2 rounded overflow-auto max-h-20">
                                    {this.state.error.message}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}