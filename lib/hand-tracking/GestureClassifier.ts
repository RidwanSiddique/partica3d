export type Results = any;
export type NormalizedLandmark = any;

export type GestureType =
    | 'pinch'
    | 'open_palm'
    | 'fist'
    | 'point_up'
    | 'point_left'
    | 'point_right'
    | 'point_down'
    | 'thumbs_up'
    | 'thumbs_down'
    | 'peace_sign'
    | 'ok_sign'
    | 'rock_sign'
    | 'gun_sign'
    | 'call_sign'
    | 'swipe_left'
    | 'swipe_right'
    | 'swipe_up'
    | 'swipe_down'
    | 'rotate_cw'
    | 'rotate_ccw'
    | 'grab'
    | 'release'
    | 'two_hand_spread'
    | 'two_hand_clap'
    | 'wave'
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

        // Debug logging
        console.log('Detecting gestures for', results.multiHandLandmarks.length, 'hands');

        // Check for two-hand gestures first
        if (results.multiHandLandmarks.length === 2) {
            const twoHandSpread = this.detectTwoHandSpread(results.multiHandLandmarks);
            if (twoHandSpread) {
                console.log('Detected two-hand gesture:', twoHandSpread.type);
                events.push(twoHandSpread);
            }

            const twoHandClap = this.detectTwoHandClap(results.multiHandLandmarks);
            if (twoHandClap && !twoHandSpread) {
                console.log('Detected two-hand clap:', twoHandClap.type);
                events.push(twoHandClap);
            }
        }

        // Check single-hand gestures
        results.multiHandLandmarks.forEach((landmarks: NormalizedLandmark[], handIndex: number) => {
            const pinch = this.detectPinch(landmarks, handIndex);
            if (pinch) {
                events.push(pinch);
                return;
            }

            const pointGesture = this.detectPointing(landmarks, handIndex);
            if (pointGesture) {
                events.push(pointGesture);
                return;
            }

            const thumbsGesture = this.detectThumbs(landmarks, handIndex);
            if (thumbsGesture) {
                events.push(thumbsGesture);
                return;
            }

            const peaceSign = this.detectPeaceSign(landmarks, handIndex);
            if (peaceSign) {
                events.push(peaceSign);
                return;
            }

            const okSign = this.detectOkSign(landmarks, handIndex);
            if (okSign) {
                events.push(okSign);
                return;
            }

            const rockSign = this.detectRockSign(landmarks, handIndex);
            if (rockSign) {
                events.push(rockSign);
                return;
            }

            const gunSign = this.detectGunSign(landmarks, handIndex);
            if (gunSign) {
                events.push(gunSign);
                return;
            }

            const callSign = this.detectCallSign(landmarks, handIndex);
            if (callSign) {
                events.push(callSign);
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

            const grab = this.detectGrab(landmarks, handIndex);
            if (grab) {
                events.push(grab);
                return;
            }

            const wave = this.detectWave(landmarks, handIndex);
            if (wave) {
                events.push(wave);
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

        // Log detected events
        if (events.length > 0) {
            events.forEach(event => {
                if (event.type !== 'none') {
                    console.log(`Gesture detected: ${event.type} (confidence: ${event.confidence.toFixed(2)})`);
                }
            });
        }

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

    private detectPointing(landmarks: NormalizedLandmark[], handIndex: number): GestureEvent | null {
        // Check if only index finger is extended
        const indexTip = landmarks[8];
        const indexMcp = landmarks[5];
        const middleTip = landmarks[12];
        const middleMcp = landmarks[9];
        const ringTip = landmarks[16];
        const ringMcp = landmarks[13];
        const pinkyTip = landmarks[20];
        const pinkyMcp = landmarks[17];
        const thumbTip = landmarks[4];
        const thumbMcp = landmarks[2];

        // Index finger extended
        const indexExtended = indexTip.y < indexMcp.y - 0.03;
        // Other fingers curled
        const middleCurled = middleTip.y > middleMcp.y;
        const ringCurled = ringTip.y > ringMcp.y;
        const pinkyCurled = pinkyTip.y > pinkyMcp.y;
        const thumbCurled = this.calculateDistance(thumbTip, indexTip) > 0.05;

        if (indexExtended && middleCurled && ringCurled && pinkyCurled && thumbCurled) {
            // Determine pointing direction based on index finger orientation
            const wrist = landmarks[0];
            const deltaX = indexTip.x - wrist.x;
            const deltaY = indexTip.y - wrist.y;

            let pointType: GestureType = 'point_up';
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                pointType = deltaX > 0 ? 'point_right' : 'point_left';
            } else {
                pointType = deltaY > 0 ? 'point_down' : 'point_up';
            }

            return {
                type: pointType,
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

        // Check if thumb is extended upward and other fingers are curled
        const thumbExtended = thumbTip.y < thumbMcp.y - 0.05;
        const fingersDown = landmarks[8].y > indexMcp.y &&
                           landmarks[12].y > middleMcp.y &&
                           landmarks[16].y > ringMcp.y &&
                           landmarks[20].y > pinkyMcp.y;

        if (thumbExtended && fingersDown) {
            return {
                type: 'thumbs_up',
                confidence: 0.9,
                handIndex,
            };
        }

        // Check for thumbs down (thumb pointing down)
        const thumbDown = thumbTip.y > thumbMcp.y + 0.05;
        if (thumbDown && fingersDown) {
            return {
                type: 'thumbs_down',
                confidence: 0.9,
                handIndex,
            };
        }

        return null;
    }

    private detectPeaceSign(landmarks: NormalizedLandmark[], handIndex: number): GestureEvent | null {
        // Check if only index and middle fingers are extended
        const indexExtended = landmarks[8].y < landmarks[5].y - 0.02;
        const middleExtended = landmarks[12].y < landmarks[9].y - 0.02;
        const ringCurled = landmarks[16].y > landmarks[13].y;
        const pinkyCurled = landmarks[20].y > landmarks[17].y;
        const thumbCurled = this.calculateDistance(landmarks[4], landmarks[8]) > 0.05;

        // Check if fingers are spread (V shape)
        const fingerSpread = Math.abs(landmarks[8].x - landmarks[12].x) > 0.03;

        if (indexExtended && middleExtended && ringCurled && pinkyCurled && thumbCurled && fingerSpread) {
            return {
                type: 'peace_sign',
                confidence: 0.8,
                handIndex,
            };
        }

        return null;
    }

    private detectOkSign(landmarks: NormalizedLandmark[], handIndex: number): GestureEvent | null {
        // Thumb tip touching index finger tip, other fingers extended
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

    private detectRockSign(landmarks: NormalizedLandmark[], handIndex: number): GestureEvent | null {
        // Index and pinky extended, middle and ring curled, thumb can be extended or curled
        const indexExtended = landmarks[8].y < landmarks[5].y - 0.02;
        const middleCurled = landmarks[12].y > landmarks[9].y;
        const ringCurled = landmarks[16].y > landmarks[13].y;
        const pinkyExtended = landmarks[20].y < landmarks[17].y - 0.02;

        if (indexExtended && middleCurled && ringCurled && pinkyExtended) {
            return {
                type: 'rock_sign',
                confidence: 0.8,
                handIndex,
            };
        }

        return null;
    }

    private detectGunSign(landmarks: NormalizedLandmark[], handIndex: number): GestureEvent | null {
        // Index extended, thumb up, other fingers curled
        const indexExtended = landmarks[8].y < landmarks[5].y - 0.02;
        const thumbExtended = landmarks[4].y < landmarks[2].y;
        const middleCurled = landmarks[12].y > landmarks[9].y;
        const ringCurled = landmarks[16].y > landmarks[13].y;
        const pinkyCurled = landmarks[20].y > landmarks[17].y;

        if (indexExtended && thumbExtended && middleCurled && ringCurled && pinkyCurled) {
            return {
                type: 'gun_sign',
                confidence: 0.7,
                handIndex,
            };
        }

        return null;
    }

    private detectCallSign(landmarks: NormalizedLandmark[], handIndex: number): GestureEvent | null {
        // Thumb and pinky extended, other fingers curled (call me gesture)
        const thumbExtended = landmarks[4].y < landmarks[2].y;
        const indexCurled = landmarks[8].y > landmarks[5].y;
        const middleCurled = landmarks[12].y > landmarks[9].y;
        const ringCurled = landmarks[16].y > landmarks[13].y;
        const pinkyExtended = landmarks[20].y < landmarks[17].y - 0.02;

        if (thumbExtended && indexCurled && middleCurled && ringCurled && pinkyExtended) {
            return {
                type: 'call_sign',
                confidence: 0.7,
                handIndex,
            };
        }

        return null;
    }

    private detectGrab(landmarks: NormalizedLandmark[], handIndex: number): GestureEvent | null {
        // Similar to fist but with slightly more relaxed curl
        const palm = landmarks[0];
        const fingerTips = [4, 8, 12, 16, 20];

        let closedCount = 0;
        for (const tipIndex of fingerTips) {
            const tip = landmarks[tipIndex];
            const distance = this.calculateDistance(palm, tip);

            if (distance < 0.12) { // Slightly more relaxed than fist
                closedCount++;
            }
        }

        if (closedCount >= 4) {
            return {
                type: 'grab',
                confidence: closedCount / 5,
                handIndex,
            };
        }

        return null;
    }

    private detectWave(landmarks: NormalizedLandmark[], handIndex: number): GestureEvent | null {
        const previous = this.previousHandPositions.get(handIndex);
        if (!previous) return null;

        // Check for rapid horizontal movement of the hand with open palm
        const currentWrist = landmarks[0];
        const previousWrist = previous[0];

        const deltaX = Math.abs(currentWrist.x - previousWrist.x);
        const deltaY = Math.abs(currentWrist.y - previousWrist.y);

        // Check if hand is open (similar to open palm but more lenient)
        const fingersExtended = landmarks[8].y < landmarks[5].y &&
                               landmarks[12].y < landmarks[9].y &&
                               landmarks[16].y < landmarks[13].y;

        if (deltaX > 0.03 && deltaX > deltaY * 2 && fingersExtended) {
            return {
                type: 'wave',
                confidence: Math.min(1, deltaX / 0.05),
                handIndex,
                metadata: { velocity: { x: deltaX, y: deltaY } },
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

        // Horizontal swipes
        if (Math.abs(deltaX) > velocityThreshold && Math.abs(deltaX) > Math.abs(deltaY) * 2) {
            return {
                type: deltaX > 0 ? 'swipe_right' : 'swipe_left',
                confidence: Math.min(1, Math.abs(deltaX) / (velocityThreshold * 2)),
                handIndex,
                metadata: { velocity: { x: deltaX, y: deltaY } },
            };
        }

        // Vertical swipes
        if (Math.abs(deltaY) > velocityThreshold && Math.abs(deltaY) > Math.abs(deltaX) * 2) {
            return {
                type: deltaY > 0 ? 'swipe_down' : 'swipe_up',
                confidence: Math.min(1, Math.abs(deltaY) / (velocityThreshold * 2)),
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

    private detectTwoHandClap(
        multiHandLandmarks: NormalizedLandmark[][]
    ): GestureEvent | null {
        if (multiHandLandmarks.length !== 2) return null;

        const hand1Wrist = multiHandLandmarks[0][0];
        const hand2Wrist = multiHandLandmarks[1][0];

        const distance = this.calculateDistance(hand1Wrist, hand2Wrist);

        // Check if hands are close together (clapping motion)
        const clapThreshold = 0.15;

        if (distance < clapThreshold) {
            return {
                type: 'two_hand_clap',
                confidence: Math.max(0.2, 1 - distance / clapThreshold),
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
