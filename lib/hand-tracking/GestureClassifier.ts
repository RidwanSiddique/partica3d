export type Results = any;
export type NormalizedLandmark = any;

export type GestureType =
    | 'pinch'
    | 'open_palm'
    | 'fist'
    | 'swipe_left'
    | 'swipe_right'
    | 'rotate_cw'
    | 'rotate_ccw'
    | 'two_hand_spread'
    | 'none';

export interface GestureEvent {
    type: GestureType;
    confidence: number;
    handIndex: number;
    metadata?: {
        distance?: number;
        angle?: number;
        velocity?: { x: number; y: number };
    };
}

export class GestureClassifier {
    private previousHandPositions: Map<number, NormalizedLandmark[]> = new Map();
    private gestureHistory: GestureType[] = [];
    private readonly historySize = 5;

    classify(results: Results): GestureEvent[] {
        const events: GestureEvent[] = [];

        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
            return [{ type: 'none', confidence: 1.0, handIndex: -1 }];
        }

        // Check for two-hand gestures first
        if (results.multiHandLandmarks.length === 2) {
            const twoHandGesture = this.detectTwoHandSpread(results.multiHandLandmarks);
            if (twoHandGesture) {
                events.push(twoHandGesture);
            }
        }

        // Check single-hand gestures
        results.multiHandLandmarks.forEach((landmarks: NormalizedLandmark[], handIndex: number) => {
            const pinch = this.detectPinch(landmarks, handIndex);
            if (pinch) {
                events.push(pinch);
                return;
            }

            const openPalm = this.detectOpenPalm(landmarks, handIndex);
            if (openPalm) {
                events.push(openPalm);
                return;
            }

            const fist = this.detectFist(landmarks, handIndex);
            if (fist) {
                events.push(fist);
                return;
            }

            const swipe = this.detectSwipe(landmarks, handIndex);
            if (swipe) {
                events.push(swipe);
                return;
            }

            const rotation = this.detectRotation(landmarks, handIndex);
            if (rotation) {
                events.push(rotation);
            }

            // Store current position for next frame
            this.previousHandPositions.set(handIndex, landmarks);
        });

        return events.length > 0 ? events : [{ type: 'none', confidence: 1.0, handIndex: -1 }];
    }

    private detectPinch(landmarks: NormalizedLandmark[], handIndex: number): GestureEvent | null {
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];

        const distance = this.calculateDistance(thumbTip, indexTip);
        const threshold = 0.05;

        if (distance < threshold) {
            return {
                type: 'pinch',
                confidence: Math.max(0, 1 - distance / threshold),
                handIndex,
                metadata: { distance },
            };
        }

        return null;
    }

    private detectOpenPalm(landmarks: NormalizedLandmark[], handIndex: number): GestureEvent | null {
        // Check if all fingers are extended
        const fingerTips = [8, 12, 16, 20]; // Index, middle, ring, pinky
        const fingerBases = [5, 9, 13, 17];

        let extendedCount = 0;
        for (let i = 0; i < fingerTips.length; i++) {
            const tip = landmarks[fingerTips[i]];
            const base = landmarks[fingerBases[i]];

            if (tip.y < base.y) {
                extendedCount++;
            }
        }

        // Check thumb extension
        const thumbTip = landmarks[4];
        const thumbBase = landmarks[2];
        const thumbExtended = Math.abs(thumbTip.x - thumbBase.x) > 0.05;

        if (extendedCount >= 3 && thumbExtended) {
            return {
                type: 'open_palm',
                confidence: extendedCount / 4,
                handIndex,
            };
        }

        return null;
    }

    private detectFist(landmarks: NormalizedLandmark[], handIndex: number): GestureEvent | null {
        const palm = landmarks[0];
        const fingerTips = [4, 8, 12, 16, 20];

        let closedCount = 0;
        for (const tipIndex of fingerTips) {
            const tip = landmarks[tipIndex];
            const distance = this.calculateDistance(palm, tip);

            if (distance < 0.15) {
                closedCount++;
            }
        }

        if (closedCount >= 4) {
            return {
                type: 'fist',
                confidence: closedCount / 5,
                handIndex,
            };
        }

        return null;
    }

    private detectSwipe(landmarks: NormalizedLandmark[], handIndex: number): GestureEvent | null {
        const previous = this.previousHandPositions.get(handIndex);
        if (!previous) return null;

        const currentWrist = landmarks[0];
        const previousWrist = previous[0];

        const deltaX = currentWrist.x - previousWrist.x;
        const deltaY = currentWrist.y - previousWrist.y;

        const velocityThreshold = 0.02;

        if (Math.abs(deltaX) > velocityThreshold && Math.abs(deltaX) > Math.abs(deltaY) * 2) {
            return {
                type: deltaX > 0 ? 'swipe_right' : 'swipe_left',
                confidence: Math.min(1, Math.abs(deltaX) / (velocityThreshold * 2)),
                handIndex,
                metadata: { velocity: { x: deltaX, y: deltaY } },
            };
        }

        return null;
    }

    private detectRotation(landmarks: NormalizedLandmark[], handIndex: number): GestureEvent | null {
        const previous = this.previousHandPositions.get(handIndex);
        if (!previous) return null;

        const currentWrist = landmarks[0];
        const currentMiddle = landmarks[9];
        const previousWrist = previous[0];
        const previousMiddle = previous[9];

        const currentAngle = Math.atan2(
            currentMiddle.y - currentWrist.y,
            currentMiddle.x - currentWrist.x
        );
        const previousAngle = Math.atan2(
            previousMiddle.y - previousWrist.y,
            previousMiddle.x - previousWrist.x
        );

        let deltaAngle = currentAngle - previousAngle;

        // Normalize to [-PI, PI]
        if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
        if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;

        const rotationThreshold = 0.1;

        if (Math.abs(deltaAngle) > rotationThreshold) {
            return {
                type: deltaAngle > 0 ? 'rotate_ccw' : 'rotate_cw',
                confidence: Math.min(1, Math.abs(deltaAngle) / (rotationThreshold * 2)),
                handIndex,
                metadata: { angle: deltaAngle },
            };
        }

        return null;
    }

    private detectTwoHandSpread(
        multiHandLandmarks: NormalizedLandmark[][]
    ): GestureEvent | null {
        if (multiHandLandmarks.length !== 2) return null;

        const hand1Wrist = multiHandLandmarks[0][0];
        const hand2Wrist = multiHandLandmarks[1][0];

        const distance = this.calculateDistance(hand1Wrist, hand2Wrist);

        // Check if hands are spreading apart
        const spreadThreshold = 0.3;

        if (distance > spreadThreshold) {
            return {
                type: 'two_hand_spread',
                confidence: Math.min(1, distance / (spreadThreshold * 2)),
                handIndex: -1,
                metadata: { distance },
            };
        }

        return null;
    }

    private calculateDistance(p1: NormalizedLandmark, p2: NormalizedLandmark): number {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dz = (p1.z || 0) - (p2.z || 0);
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    reset() {
        this.previousHandPositions.clear();
        this.gestureHistory = [];
    }
}
