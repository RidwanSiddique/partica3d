import * as THREE from 'three';

export type EasingFunction = (t: number) => number;

export class Easing {
    static linear(t: number): number {
        return t;
    }

    static easeInOutCubic(t: number): number {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    static easeOutElastic(t: number): number {
        const c4 = (2 * Math.PI) / 3;
        return t === 0
            ? 0
            : t === 1
                ? 1
                : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }

    static easeOutBounce(t: number): number {
        const n1 = 7.5625;
        const d1 = 2.75;

        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    }
}

export interface MorphState {
    startPositions: THREE.Vector3[];
    targetPositions: THREE.Vector3[];
    currentProgress: number;
    duration: number;
    easingFunction: EasingFunction;
}

export class MorphEngine {
    private morphState: MorphState | null = null;
    private startTime: number = 0;
    private isAnimating: boolean = false;

    startMorph(
        currentPositions: THREE.Vector3[],
        targetPositions: THREE.Vector3[],
        duration: number = 2000,
        easingFunction: EasingFunction = Easing.easeInOutCubic
    ): void {
        this.morphState = {
            startPositions: currentPositions.map((p) => p.clone()),
            targetPositions,
            currentProgress: 0,
            duration,
            easingFunction,
        };
        this.startTime = Date.now();
        this.isAnimating = true;
    }

    update(positions: THREE.Vector3[]): boolean {
        if (!this.isAnimating || !this.morphState) {
            return false;
        }

        const elapsed = Date.now() - this.startTime;
        const rawProgress = Math.min(elapsed / this.morphState.duration, 1);
        const easedProgress = this.morphState.easingFunction(rawProgress);

        this.morphState.currentProgress = easedProgress;

        // Interpolate positions
        for (let i = 0; i < positions.length; i++) {
            const start = this.morphState.startPositions[i];
            const target = this.morphState.targetPositions[i] || start;

            positions[i].lerpVectors(start, target, easedProgress);
        }

        if (rawProgress >= 1) {
            this.isAnimating = false;
            return false;
        }

        return true;
    }

    explode(
        positions: THREE.Vector3[],
        intensity: number = 5,
        duration: number = 1000
    ): void {
        const explosionTargets = positions.map((pos) => {
            const direction = pos.clone().normalize();
            return pos.clone().add(direction.multiplyScalar(intensity));
        });

        this.startMorph(positions, explosionTargets, duration, Easing.easeOutElastic);
    }

    isActive(): boolean {
        return this.isAnimating;
    }

    getProgress(): number {
        return this.morphState?.currentProgress || 0;
    }

    stop(): void {
        this.isAnimating = false;
        this.morphState = null;
    }
}
