import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';
import { ObjectFormations } from './ObjectFormations';
import { MorphEngine } from './MorphEngine';

export type ParticleMode = 'drift' | 'formation' | 'exploding';

export interface ParticleSystemConfig {
    particleCount: number;
    particleSize: number;
    particleColor: THREE.Color;
    driftSpeed: number;
    noiseScale: number;
}

export class ParticleSystem {
    private particles: THREE.Points;
    private positions: Float32Array;
    private velocities: Float32Array;
    private colors: Float32Array;
    private particlePositions: THREE.Vector3[];
    private config: ParticleSystemConfig;
    private mode: ParticleMode = 'drift';
    private morphEngine: MorphEngine;
    private noise3D: ReturnType<typeof createNoise3D>;
    private time: number = 0;
    private currentFormation: string = 'random';
    private rotationSpeed: number = 0;
    private scale: number = 1;

    constructor(config: Partial<ParticleSystemConfig> = {}) {
        this.config = {
            particleCount: 20000,
            particleSize: 0.02,
            particleColor: new THREE.Color(0x00ffff),
            driftSpeed: 0.1,
            noiseScale: 0.5,
            ...config,
        };

        this.morphEngine = new MorphEngine();
        this.noise3D = createNoise3D();

        // Initialize arrays
        this.positions = new Float32Array(this.config.particleCount * 3);
        this.velocities = new Float32Array(this.config.particleCount * 3);
        this.colors = new Float32Array(this.config.particleCount * 3);
        this.particlePositions = [];

        // Initialize particle positions
        this.initializeParticles();

        // Create Three.js geometry and material
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

        const material = new THREE.PointsMaterial({
            size: this.config.particleSize,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true,
        });

        this.particles = new THREE.Points(geometry, material);
    }

    private initializeParticles(): void {
        const randomPositions = ObjectFormations.generateRandom(
            this.config.particleCount,
            10
        );

        for (let i = 0; i < this.config.particleCount; i++) {
            const pos = randomPositions[i];
            this.particlePositions.push(pos);

            this.positions[i * 3] = pos.x;
            this.positions[i * 3 + 1] = pos.y;
            this.positions[i * 3 + 2] = pos.z;

            // Initialize velocities
            this.velocities[i * 3] = (Math.random() - 0.5) * 0.02;
            this.velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
            this.velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

            // Initialize colors
            this.colors[i * 3] = this.config.particleColor.r;
            this.colors[i * 3 + 1] = this.config.particleColor.g;
            this.colors[i * 3 + 2] = this.config.particleColor.b;
        }
    }

    update(deltaTime: number): void {
        this.time += deltaTime;

        if (this.mode === 'drift') {
            this.updateDrift(deltaTime);
        } else if (this.mode === 'formation') {
            this.updateFormation(deltaTime);
        }

        // Update morph engine
        if (this.morphEngine.isActive()) {
            this.morphEngine.update(this.particlePositions);
        }

        // Apply rotation
        if (this.rotationSpeed !== 0) {
            this.particles.rotation.y += this.rotationSpeed * deltaTime;
        }

        // Apply scale
        this.particles.scale.setScalar(this.scale);

        // Update buffer
        this.updatePositionBuffer();
    }

    private updateDrift(deltaTime: number): void {
        for (let i = 0; i < this.config.particleCount; i++) {
            const pos = this.particlePositions[i];

            // Apply noise-based movement
            const noiseX = this.noise3D(
                pos.x * this.config.noiseScale,
                pos.y * this.config.noiseScale,
                this.time * 0.1
            );
            const noiseY = this.noise3D(
                pos.y * this.config.noiseScale,
                pos.z * this.config.noiseScale,
                this.time * 0.1 + 100
            );
            const noiseZ = this.noise3D(
                pos.z * this.config.noiseScale,
                pos.x * this.config.noiseScale,
                this.time * 0.1 + 200
            );

            this.velocities[i * 3] += noiseX * this.config.driftSpeed * deltaTime;
            this.velocities[i * 3 + 1] += noiseY * this.config.driftSpeed * deltaTime;
            this.velocities[i * 3 + 2] += noiseZ * this.config.driftSpeed * deltaTime;

            // Apply damping
            this.velocities[i * 3] *= 0.98;
            this.velocities[i * 3 + 1] *= 0.98;
            this.velocities[i * 3 + 2] *= 0.98;

            // Update position
            pos.x += this.velocities[i * 3];
            pos.y += this.velocities[i * 3 + 1];
            pos.z += this.velocities[i * 3 + 2];
        }
    }

    private updateFormation(deltaTime: number): void {
        // Formations are handled by morph engine
        // Add subtle floating motion
        for (let i = 0; i < this.config.particleCount; i++) {
            const pos = this.particlePositions[i];
            const offset = Math.sin(this.time + i * 0.1) * 0.01;
            pos.y += offset * deltaTime;
        }
    }

    private updatePositionBuffer(): void {
        for (let i = 0; i < this.config.particleCount; i++) {
            const pos = this.particlePositions[i];
            this.positions[i * 3] = pos.x;
            this.positions[i * 3 + 1] = pos.y;
            this.positions[i * 3 + 2] = pos.z;
        }

        const positionAttribute = this.particles.geometry.getAttribute('position');
        positionAttribute.needsUpdate = true;
    }

    morphToFormation(formationType: string, duration: number = 2000): void {
        this.currentFormation = formationType;
        const targetPositions = ObjectFormations.getFormation(
            formationType,
            this.config.particleCount
        );

        this.morphEngine.startMorph(this.particlePositions, targetPositions, duration);
        this.mode = 'formation';
    }

    explode(intensity: number = 5): void {
        this.morphEngine.explode(this.particlePositions, intensity);
        this.mode = 'exploding';

        // Return to drift after explosion
        setTimeout(() => {
            this.mode = 'drift';
        }, 2000);
    }

    setDriftMode(): void {
        this.mode = 'drift';
    }

    rotate(speed: number): void {
        this.rotationSpeed = speed;
    }

    setScale(newScale: number): void {
        this.scale = Math.max(0.1, Math.min(3, newScale));
    }

    getObject(): THREE.Points {
        return this.particles;
    }

    getMode(): ParticleMode {
        return this.mode;
    }

    getCurrentFormation(): string {
        return this.currentFormation;
    }

    dispose(): void {
        this.particles.geometry.dispose();
        (this.particles.material as THREE.Material).dispose();
    }
}
