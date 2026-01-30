export type Results = any;
export type NormalizedLandmark = any;

export type GestureType =
    | 'open_palm'
    | 'fist'
    | 'ok_sign'
    | 'peace_sign'
    | 'thumbs'
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
    private previousHandPositions: Map<string, NormalizedLandmark> = new Map();
    private gestureHistory: GestureType[] = [];
    private readonly historySize = 5;

    classify(results: Results): GestureEvent[] {
        const events: GestureEvent[] = [];

        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
            return [{ type: 'none', confidence: 1.0, handIndex: -1 }];
        }

        for (let handIndex = 0; handIndex < results.multiHandLandmarks.length; handIndex++) {
            const landmarks = results.multiHandLandmarks[handIndex];

            // Try to detect each gesture in order of reliability
            const openPalm = this.detectOpenPalm(landmarks, handIndex);
            if (openPalm) {
                events.push(openPalm);
                continue;
            }

            const fist = this.detectFist(landmarks, handIndex);
            if (fist) {
                events.push(fist);
                continue;
            }

            const okSign = this.detectOkSign(landmarks, handIndex);
            if (okSign) {
                events.push(okSign);
                continue;
            }

            const peaceSign = this.detectPeaceSign(landmarks, handIndex);
            if (peaceSign) {
                events.push(peaceSign);
                continue;
            }

            const thumbs = this.detectThumbs(landmarks, handIndex);
            if (thumbs) {
                events.push(thumbs);
                continue;
            }
        }

        return events.length > 0 ? events : [{ type: 'none', confidence: 1.0, handIndex: -1 }];
    }

    private detectOpenPalm(landmarks: NormalizedLandmark[], handIndex: number): GestureEvent | null {
        // Check if all fingers are extended
        const fingersExtended = [
            landmarks[8].y < landmarks[5].y - 0.02,  // Index
            landmarks[12].y < landmarks[9].y - 0.02, // Middle
            landmarks[16].y < landmarks[13].y - 0.02, // Ring
            landmarks[20].y < landmarks[17].y - 0.02, // Pinky
        ];

        const thumbExtended = landmarks[4].x > landmarks[3].x + 0.02 || landmarks[4].x < landmarks[3].x - 0.02;
        const allFingersExtended = fingersExtended.every(extended => extended) && thumbExtended;

        if (allFingersExtended) {
            // Check finger spread to distinguish from other gestures
            const fingerSpread = this.calculateFingerSpread(landmarks);
            
            return {
                type: 'open_palm',
                confidence: Math.min(0.9, fingerSpread * 2),
                handIndex,
            };
        }

        return null;
    }

    private detectFist(landmarks: NormalizedLandmark[], handIndex: number): GestureEvent | null {
        // Check if all fingers are curled into the palm
        const fingersCurled = [
            landmarks[8].y > landmarks[5].y,   // Index
            landmarks[12].y > landmarks[9].y,  // Middle
            landmarks[16].y > landmarks[13].y, // Ring
            landmarks[20].y > landmarks[17].y, // Pinky
        ];

        const thumbCurled = landmarks[4].y > landmarks[3].y - 0.01;
        const allFingersCurled = fingersCurled.every(curled => curled) && thumbCurled;

        if (allFingersCurled) {
            return {
                type: 'fist',
                confidence: 0.8,
                handIndex,
            };
        }

        return null;
    }

    private detectThumbs(landmarks: NormalizedLandmark[], handIndex: number): GestureEvent | null {
        const thumbTip = landmarks[4];
        const thumbMcp = landmarks[2];
        const indexMcp = landmarks[5];
        const middleMcp = landmarks[9];
        const ringMcp = landmarks[13];
        const pinkyMcp = landmarks[17];

        // Check if thumb is extended vertically
        const thumbExtended = Math.abs(thumbTip.y - thumbMcp.y) > 0.03;
        
        // Check if other fingers are curled
        const indexCurled = landmarks[8].y > indexMcp.y;
        const middleCurled = landmarks[12].y > middleMcp.y;
        const ringCurled = landmarks[16].y > ringMcp.y;
        const pinkyCurled = landmarks[20].y > pinkyMcp.y;

        if (thumbExtended && indexCurled && middleCurled && ringCurled && pinkyCurled) {
            return {
                type: 'thumbs',
                confidence: 0.8,
                handIndex,
            };
        }

        return null;
    }

    private detectPeaceSign(landmarks: NormalizedLandmark[], handIndex: number): GestureEvent | null {
        // Index and middle fingers extended, ring and pinky curled, thumb curled
        const indexExtended = landmarks[8].y < landmarks[5].y - 0.02;
        const middleExtended = landmarks[12].y < landmarks[9].y - 0.02;
        const ringCurled = landmarks[16].y > landmarks[13].y;
        const pinkyCurled = landmarks[20].y > landmarks[17].y;

        if (indexExtended && middleExtended && ringCurled && pinkyCurled) {
            return {
                type: 'peace_sign',
                confidence: 0.8,
                handIndex,
            };
        }

        return null;
    }

    private detectOkSign(landmarks: NormalizedLandmark[], handIndex: number): GestureEvent | null {
        // Thumb and index finger touching, other fingers extended
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const middleExtended = landmarks[12].y < landmarks[9].y - 0.02;
        const ringExtended = landmarks[16].y < landmarks[13].y - 0.02;
        const pinkyExtended = landmarks[20].y < landmarks[17].y - 0.02;

        const thumbIndexDistance = this.calculateDistance(thumbTip, indexTip);
        const touching = thumbIndexDistance < 0.03;

        if (touching && middleExtended && ringExtended && pinkyExtended) {
            return {
                type: 'ok_sign',
                confidence: 0.8,
                handIndex,
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

    private calculateFingerSpread(landmarks: NormalizedLandmark[]): number {
        // Calculate the average distance between adjacent fingertips
        const tips = [8, 12, 16, 20]; // Index, middle, ring, pinky tips
        let totalSpread = 0;

        for (let i = 0; i < tips.length - 1; i++) {
            totalSpread += this.calculateDistance(landmarks[tips[i]], landmarks[tips[i + 1]]);
        }

        return totalSpread / (tips.length - 1);
    }

    reset() {
        this.previousHandPositions.clear();
        this.gestureHistory = [];
    }
}