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

    private async initializeHands() {
        if (this.isInitialized) return;

        try {
            // Dynamic import for MediaPipe Hands
            const { Hands } = await import('@mediapipe/hands');

            this.hands = new Hands({
                locateFile: (file: string) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                },
            });

            this.hands.setOptions({
                maxNumHands: 2,
                modelComplexity: 1,
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.5,
            });

            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize MediaPipe Hands:', error);
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

            // Dynamic import for Camera
            const { Camera } = await import('@mediapipe/camera_utils');

            this.camera = new Camera(videoElement, {
                onFrame: async () => {
                    if (this.hands && videoElement) {
                        await this.hands.send({ image: videoElement });
                    }
                },
                width: 1280,
                height: 720,
            });

            await this.camera.start();
        } catch (error) {
            console.error('Error accessing camera:', error);
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
