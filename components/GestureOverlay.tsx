'use client';

import { useGestureStore } from '@/store/useGestureStore';
import { useParticleStore } from '@/store/useParticleStore';

const gestureDescriptions: Record<string, string> = {
    pinch: '🤏 Pinch thumb and index finger',
    open_palm: '🖐️ Open palm with fingers spread',
    fist: '✊ Make a fist',
    point_up: '☝️ Point upward',
    point_left: '👈 Point left',
    point_right: '👉 Point right',
    point_down: '👇 Point downward',
    thumbs_up: '👍 Thumbs up',
    thumbs_down: '👎 Thumbs down',
    peace_sign: '✌️ Peace sign (V shape)',
    ok_sign: '👌 OK sign (thumb-index circle)',
    rock_sign: '🤘 Rock sign (index & pinky)',
    gun_sign: '👈 Finger gun',
    call_sign: '🤙 Call me (thumb & pinky)',
    swipe_left: '👈 Swipe left',
    swipe_right: '👉 Swipe right',
    swipe_up: '👆 Swipe up',
    swipe_down: '👇 Swipe down',
    rotate_cw: '🔄 Rotate clockwise',
    rotate_ccw: '🔄 Rotate counter-clockwise',
    grab: '🤏 Grab/grasp motion',
    release: '🖐️ Release/open',
    two_hand_spread: '🙌 Spread both hands apart',
    two_hand_clap: '👏 Clap hands together',
    wave: '👋 Wave hand',
    none: 'No gesture detected',
};

const gestureActions: Record<string, string> = {
    pinch: '→ Gather into sphere',
    open_palm: '→ Explode particles',
    fist: '→ Form cube',
    point_up: '→ Lift particles up',
    point_left: '→ Move left',
    point_right: '→ Move right',
    point_down: '→ Pull particles down',
    thumbs_up: '→ Increase intensity',
    thumbs_down: '→ Decrease intensity',
    peace_sign: '→ Form double helix',
    ok_sign: '→ Create ring formation',
    rock_sign: '→ Rock & roll effect',
    gun_sign: '→ Particle beam',
    call_sign: '→ Wave motion',
    swipe_left: '→ Previous shape',
    swipe_right: '→ Next shape',
    swipe_up: '→ Faster animation',
    swipe_down: '→ Slower animation',
    rotate_cw: '→ Rotate clockwise',
    rotate_ccw: '→ Rotate counter-clockwise',
    grab: '→ Grab particles',
    release: '→ Release particles',
    two_hand_spread: '→ Scale up',
    two_hand_clap: '→ Burst effect',
    wave: '→ Wave animation',
    none: '',
};

export default function GestureOverlay() {
    const { currentGesture, gestureConfidence, cameraEnabled } = useGestureStore();
    const { currentFormation, mode } = useParticleStore();

    if (!cameraEnabled) {
        return (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-white/10 backdrop-blur-md px-8 py-6 rounded-2xl border border-white/20 max-w-2xl">
                <h2 className="text-2xl font-bold text-white mb-4 text-center">
                    Gesture Controls
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    {Object.entries(gestureDescriptions)
                        .filter(([key]) => key !== 'none')
                        .map(([gesture, description]) => (
                            <div key={gesture} className="text-white/80">
                                <span className="font-semibold text-cyan-400">{description}</span>
                                <br />
                                <span className="text-xs text-white/60">
                                    {gestureActions[gesture]}
                                </span>
                            </div>
                        ))}
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-4">
            {/* Current gesture display */}
            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl border border-white/20">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-white/60 uppercase tracking-wide">
                            Current Gesture
                        </span>
                        <span className="text-xl font-bold text-white">
                            {currentGesture === 'none'
                                ? 'No gesture'
                                : gestureDescriptions[currentGesture]}
                        </span>
                    </div>

                    {currentGesture !== 'none' && (
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-white/60">Confidence</span>
                            <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                                        style={{ width: `${gestureConfidence * 100}%` }}
                                    />
                                </div>
                                <span className="text-sm font-semibold text-white">
                                    {Math.round(gestureConfidence * 100)}%
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Current formation display */}
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/20">
                <div className="flex items-center gap-4 text-sm">
                    <div>
                        <span className="text-white/60">Formation: </span>
                        <span className="text-white font-semibold capitalize">
                            {currentFormation}
                        </span>
                    </div>
                    <div className="w-px h-4 bg-white/20" />
                    <div>
                        <span className="text-white/60">Mode: </span>
                        <span className="text-white font-semibold capitalize">{mode}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
