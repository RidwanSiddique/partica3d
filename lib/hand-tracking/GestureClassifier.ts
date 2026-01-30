export type Results = any;
export type NormalizedLandmark = any;

export type GestureType =
    | 'open_palm'
    | 'fist'
    | 'ok_sign'
    | 'peace_sign'
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

    classify(results: Results): GestureEvent[] {
        const events: GestureEvent[] = [];

        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
            return [{ type: 'none', confidence: 1.0, handIndex: -1 }];
        }

        for (let handIndex = 0; handIndex < results.multiHandLandmarks.length; handIndex++) {
            const landmarks = results.multiHandLandmarks[handIndex];

            // Detect all possible gestures and pick the one with highest confidence
            const candidateGestures: GestureEvent[] = [];
            
            const openPalm = this.detectOpenPalm(landmarks, handIndex);
            if (openPalm) candidateGestures.push(openPalm);

            const fist = this.detectFist(landmarks, handIndex);
            if (fist) candidateGestures.push(fist);

            const okSign = this.detectOkSign(landmarks, handIndex);
            if (okSign) candidateGestures.push(okSign);

            const peaceSign = this.detectPeaceSign(landmarks, handIndex);
            if (peaceSign) candidateGestures.push(peaceSign);

            // Pick the gesture with highest confidence
            if (candidateGestures.length > 0) {
                const bestGesture = candidateGestures.reduce((best, current) => 
                    current.confidence > best.confidence ? current : best
                );
                events.push(bestGesture);
            }
        }

        return events.length > 0 ? events : [{ type: 'none', confidence: 1.0, handIndex: -1 }];
    }

    private detectOpenPalm(landmarks: NormalizedLandmark[], handIndex: number): GestureEvent | null {
        // Strict open palm detection - all fingers must be clearly extended
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];
        
        // MCP joints for reference
        const indexMcp = landmarks[5];
        const middleMcp = landmarks[9];
        const ringMcp = landmarks[13];
        const pinkyMcp = landmarks[17];
        
        // PIP joints
        const indexPip = landmarks[6];
        const middlePip = landmarks[10];
        const ringPip = landmarks[14];
        const pinkyPip = landmarks[18];

        // Check if all fingertips are significantly far from their MCP joints
        const tipToMcpDistances = [
            this.calculateDistance(indexTip, indexMcp),
            this.calculateDistance(middleTip, middleMcp),
            this.calculateDistance(ringTip, ringMcp),
            this.calculateDistance(pinkyTip, pinkyMcp),
        ];

        // Check if all fingertips are far from their PIP joints (indicating extension)
        const tipToPipDistances = [
            this.calculateDistance(indexTip, indexPip),
            this.calculateDistance(middleTip, middlePip),
            this.calculateDistance(ringTip, ringPip),
            this.calculateDistance(pinkyTip, pinkyPip),
        ];

        // All fingers must be extended (tips far from PIPs)
        const fingersExtended = tipToPipDistances.every(dist => dist > 0.06); // Stricter threshold
        
        // Check that fingers are spread out (not close together like in other gestures)
        const fingerSpread = this.calculateFingerSpread(landmarks);
        const wellSpread = fingerSpread > 0.15; // Must have good finger separation
        
        // Thumb must be extended away from palm
        const wrist = landmarks[0];
        const thumbToWristDist = this.calculateDistance(thumbTip, wrist);
        const thumbMcpToWristDist = this.calculateDistance(landmarks[1], wrist);
        const thumbExtended = thumbToWristDist > thumbMcpToWristDist * 1.4; // Stricter
        
        // Palm center check - tips should be far from palm center
        const palmCenter = middleMcp;
        const avgTipToPalmDist = tipToMcpDistances.reduce((sum, dist) => sum + dist, 0) / tipToMcpDistances.length;
        const palmClearance = avgTipToPalmDist > 0.12; // Minimum distance from palm center

        if (fingersExtended && wellSpread && thumbExtended && palmClearance) {
            const confidence = Math.min(0.9, 0.5 + (fingerSpread * 2) + (avgTipToPalmDist * 2));
            
            return {
                type: 'open_palm',
                confidence,
                handIndex,
            };
        }

        return null;
    }

    private detectFist(landmarks: NormalizedLandmark[], handIndex: number): GestureEvent | null {
        // Simplified fist detection - all fingertips should be close to palm center
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];
        
        // Palm center (middle MCP)
        const palmCenter = landmarks[9];
        
        // Calculate distances from all fingertips to palm center
        const tipToPalmDistances = [
            this.calculateDistance(indexTip, palmCenter),
            this.calculateDistance(middleTip, palmCenter),
            this.calculateDistance(ringTip, palmCenter),
            this.calculateDistance(pinkyTip, palmCenter),
        ];
        
        // Thumb distance to palm center
        const thumbToPalmDist = this.calculateDistance(thumbTip, palmCenter);
        
        // All fingertips should be close to palm (curled inward)
        const fingersCurled = tipToPalmDistances.every(dist => dist < 0.08); // Close to palm
        const thumbCurled = thumbToPalmDist < 0.09; // Thumb also close to palm
        
        // Additional check: fingertips should be close to their own PIP joints
        const tipToPipDistances = [
            this.calculateDistance(indexTip, landmarks[6]),
            this.calculateDistance(middleTip, landmarks[10]),
            this.calculateDistance(ringTip, landmarks[14]),
            this.calculateDistance(pinkyTip, landmarks[18]),
        ];
        
        const tightlyCurled = tipToPipDistances.every(dist => dist < 0.05);
        
        if (fingersCurled && thumbCurled && tightlyCurled) {
            // Calculate confidence based on how close fingers are to palm
            const avgTipToPalmDist = tipToPalmDistances.reduce((sum, dist) => sum + dist, 0) / tipToPalmDistances.length;
            const confidence = Math.min(0.95, Math.max(0.6, 1 - (avgTipToPalmDist * 10)));
            
            return {
                type: 'fist',
                confidence,
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
    }
}