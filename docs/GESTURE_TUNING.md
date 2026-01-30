# Gesture Recognition Tuning Guide

## How to Improve Gesture Recognition Accuracy

MediaPipe Hands provides pre-trained hand landmark detection, but gesture recognition accuracy depends on the **threshold values** and **algorithms** in `GestureClassifier.ts`. Here's how to tune them:

---

## 1. Adjusting Detection Thresholds

### Current Thresholds (in GestureClassifier.ts)

| Gesture | Parameter | Current Value | Description |
|---------|-----------|---------------|-------------|
| **Pinch** | Distance threshold | `0.05` | Max distance between thumb & index tip |
| **Open Palm** | Finger count | `3` | Min extended fingers required |
| **Fist** | Distance to palm | `0.15` | Max distance from fingertips to palm |
| **Swipe** | Velocity threshold | `0.02` | Min hand movement speed |
| **Rotation** | Angle threshold | `0.1` radians | Min wrist rotation angle |
| **Two-Hand Spread** | Distance threshold | `0.3` | Min distance between hands |

### How to Tune Thresholds

1. **Open** [`GestureClassifier.ts`](file:///Users/ridwansiddique/Desktop/Projects/ldr-3d/lib/hand-tracking/GestureClassifier.ts)

2. **Test gestures** and observe confidence scores in the UI

3. **Adjust values** based on results:
   - **Too sensitive** (false positives) → Increase threshold
   - **Not sensitive enough** (missed gestures) → Decrease threshold

#### Example: Making Pinch More Sensitive
```typescript
// Line ~80 in GestureClassifier.ts
private detectPinch(landmarks: any, handIndex: number): GestureEvent | null {
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  
  const distance = this.calculateDistance(thumbTip, indexTip);
  const threshold = 0.05; // DECREASE to 0.03 for more sensitivity
  
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
```

---

## 2. MediaPipe Model Configuration

### Adjusting Hand Tracking Settings

In [`HandTracker.ts`](file:///Users/ridwansiddique/Desktop/Projects/ldr-3d/lib/hand-tracking/HandTracker.ts), you can tune MediaPipe's detection:

```typescript
this.hands.setOptions({
  maxNumHands: 2,              // Max hands to detect (1-2)
  modelComplexity: 1,          // 0=lite, 1=full (higher = more accurate but slower)
  minDetectionConfidence: 0.7, // DECREASE for easier detection (0.5-0.9)
  minTrackingConfidence: 0.5,  // DECREASE for smoother tracking (0.3-0.8)
});
```

**Recommendations:**
- **Better accuracy**: `modelComplexity: 1`, `minDetectionConfidence: 0.8`
- **Better performance**: `modelComplexity: 0`, `minDetectionConfidence: 0.6`
- **Smoother tracking**: `minTrackingConfidence: 0.3`

---

## 3. Adding Gesture Smoothing

To reduce jitter and false positives, add temporal smoothing:

```typescript
export class GestureClassifier {
  private gestureHistory: GestureType[] = [];
  private readonly historySize = 5; // Track last 5 frames
  
  classify(results: Results): GestureEvent[] {
    // ... existing detection code ...
    
    // Add detected gesture to history
    this.gestureHistory.push(detectedGesture);
    if (this.gestureHistory.length > this.historySize) {
      this.gestureHistory.shift();
    }
    
    // Only return gesture if it appears in majority of recent frames
    const gestureCount = this.gestureHistory.filter(g => g === detectedGesture).length;
    if (gestureCount >= Math.ceil(this.historySize / 2)) {
      return [gestureEvent];
    }
    
    return [{ type: 'none', confidence: 1.0, handIndex: -1 }];
  }
}
```

---

## 4. Custom Gesture Training (Advanced)

MediaPipe Hands **cannot be retrained** directly, but you can:

### Option A: Collect Your Own Gesture Data

1. **Record landmark data** for each gesture:
```typescript
// Add to GestureClassifier
recordGestureData(gestureName: string, landmarks: any) {
  const data = {
    gesture: gestureName,
    landmarks: landmarks.map((l: any) => ({ x: l.x, y: l.y, z: l.z })),
    timestamp: Date.now(),
  };
  
  // Save to localStorage or send to backend
  localStorage.setItem(
    `gesture_${gestureName}_${Date.now()}`,
    JSON.stringify(data)
  );
}
```

2. **Analyze patterns** in your recorded data to find optimal thresholds

3. **Update thresholds** based on your specific hand size and gesture style

### Option B: Machine Learning Classifier

For advanced users, train a custom ML model:

1. **Collect training data** (100+ samples per gesture)
2. **Use TensorFlow.js** to train a classifier on landmark positions
3. **Replace rule-based detection** with ML predictions

Example structure:
```typescript
// Pseudo-code
const model = await tf.loadLayersModel('path/to/model.json');
const prediction = model.predict(landmarkTensor);
const gesture = gestures[prediction.argMax()];
```

---

## 5. Debugging Tools

### Enable Debug Mode

Add this to `CameraPreview.tsx` to show landmark indices and distances:

```typescript
// Already implemented! The camera preview shows:
// - Hand landmark points (numbered)
// - Connections between landmarks
// - Left/Right hand labels
```

### Add Confidence Logging

In `GestureClassifier.ts`:
```typescript
classify(results: Results): GestureEvent[] {
  const events = // ... detection logic ...
  
  // Log for debugging
  events.forEach(event => {
    if (event.type !== 'none') {
      console.log(`Gesture: ${event.type}, Confidence: ${event.confidence.toFixed(2)}`);
    }
  });
  
  return events;
}
```

---

## 6. Recommended Tuning Process

1. **Enable camera preview** (now available in bottom-right)
2. **Perform each gesture** multiple times
3. **Observe**:
   - Hand landmark positions
   - Gesture confidence scores
   - False positives/negatives
4. **Adjust thresholds** incrementally (±0.01 at a time)
5. **Test again** until satisfied

---

## 7. Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Pinch not detected | Threshold too strict | Decrease from 0.05 to 0.03 |
| False pinch triggers | Threshold too loose | Increase from 0.05 to 0.07 |
| Swipe too sensitive | Low velocity threshold | Increase from 0.02 to 0.04 |
| Rotation not working | Angle threshold too high | Decrease from 0.1 to 0.05 |
| Jittery gestures | No smoothing | Add gesture history filtering |
| Poor lighting | MediaPipe struggles | Increase room lighting |

---

## Summary

**Quick Wins:**
1. ✅ Camera preview now shows hand landmarks for debugging
2. ✅ Adjust thresholds in `GestureClassifier.ts` (lines 80-200)
3. ✅ Tune MediaPipe settings in `HandTracker.ts` (line 26)
4. ✅ Add gesture smoothing to reduce false positives

**For Perfect Recognition:**
- Collect your own gesture data
- Calculate optimal thresholds from your data
- Consider ML-based classifier for complex gestures

The current rule-based system works well for most users, but personal tuning will give you the best results!
