export type HandLandmarks = any;

export class HandTracker {
    private hands: any | null = null;
    private camera: any | null = null;
    private videoElement: HTMLVideoElement | null = null;
    private onResultsCallback: ((results: any) => void) | null = null;
    private isInitialized: boolean = false;

    constructor() {
        // Initialization will happen asynchronously
    }

    private checkWebGLSupport(): boolean {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl2') || 
                      canvas.getContext('webgl') || 
                      canvas.getContext('experimental-webgl');
            
            if (!gl || !(gl instanceof WebGLRenderingContext || gl instanceof WebGL2RenderingContext)) {
                console.warn('WebGL not available, MediaPipe may use CPU fallback');
                return false;
            }

            const contextLost = (gl as WebGLRenderingContext).isContextLost();
            canvas.remove();
            
            return !contextLost;
        } catch (e) {
            console.warn('WebGL support check failed:', e);
            return false;
        }
    }

    private async initializeHands() {
        if (this.isInitialized) return;

        try {
            const hasWebGL = this.checkWebGLSupport();
            if (!hasWebGL) {
                console.warn('WebGL not detected, MediaPipe will attempt to use CPU processing');
            }

            const { Hands } = await import('@mediapipe/hands');

            this.hands = new Hands({
                locateFile: (file: string) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                },
            });

            this.hands.setOptions({
                maxNumHands: 2,
                modelComplexity: hasWebGL ? 1 : 0, // Use lighter model if no WebGL
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.5,
                selfieMode: true,
                staticImageMode: false,
            });

            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize MediaPipe Hands:', error);
            if (error instanceof Error) {
                if (error.message.includes('fetch') || error.message.includes('network')) {
                    throw new Error('Failed to load MediaPipe models. Please check your internet connection.');
                } else if (error.message.includes('wasm')) {
                    throw new Error('Failed to load WebAssembly modules. Your browser may not support MediaPipe.');
                }
            }
            throw error;
        }
    }

    async startTracking(
        videoElement: HTMLVideoElement,
        onResults: (results: any) => void
    ): Promise<void> {
        await this.initializeHands();

        if (!this.hands) {
            throw new Error('Hands not initialized');
        }

        this.videoElement = videoElement;
        this.onResultsCallback = onResults;

        this.hands.onResults((results: any) => {
            if (this.onResultsCallback) {
                this.onResultsCallback(results);
            }
        });

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user',
                },
            });

            videoElement.srcObject = stream;
            await videoElement.play();

            // Wait for video to stabilize
            await new Promise(resolve => setTimeout(resolve, 100));

            const { Camera } = await import('@mediapipe/camera_utils');

            this.camera = new Camera(videoElement, {
                onFrame: async () => {
                    try {
                        if (this.hands && videoElement && videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
                            await this.hands.send({ image: videoElement });
                        }
                    } catch (frameError) {
                        console.warn('Frame processing error:', frameError);
                    }
                },
                width: 1280,
                height: 720,
            });

            await this.camera.start();
        } catch (error) {
            console.error('Error accessing camera:', error);
            if (error instanceof Error) {
                if (error.name === 'NotAllowedError') {
                    throw new Error('Camera permission denied. Please allow camera access and try again.');
                } else if (error.name === 'NotFoundError') {
                    throw new Error('No camera found. Please connect a camera and try again.');
                } else if (error.message.includes('WebGL')) {
                    throw new Error('WebGL context error. Please close other browser tabs using 3D graphics and try again.');
                }
            }
            throw new Error('Failed to access camera. Please grant camera permissions.');
        }
    }

    stopTracking() {
        if (this.camera) {
            this.camera.stop();
            this.camera = null;
        }

        if (this.videoElement && this.videoElement.srcObject) {
            const stream = this.videoElement.srcObject as MediaStream;
            stream.getTracks().forEach((track) => track.stop());
            this.videoElement.srcObject = null;
        }

        this.onResultsCallback = null;
    }

    updateOptions(options: {
        maxNumHands?: number;
        modelComplexity?: number;
        minDetectionConfidence?: number;
        minTrackingConfidence?: number;
    }) {
        if (this.hands) {
            this.hands.setOptions(options);
        }
    }

    dispose() {
        this.stopTracking();
        if (this.hands) {
            this.hands.close();
            this.hands = null;
        }
        this.isInitialized = false;
    }
}
