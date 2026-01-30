'use client';

import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { ParticleSystem } from '@/lib/particles/ParticleSystem';
import { useParticleStore } from '@/store/useParticleStore';
import { useGestureStore } from '@/store/useGestureStore';
import { GestureClassifier } from '@/lib/hand-tracking/GestureClassifier';
import { GestureMapper, ParticleCommand } from '@/lib/hand-tracking/GestureMapper';

function ParticleScene() {
    const particleSystemRef = useRef<ParticleSystem | null>(null);
    const gestureClassifier = useRef(new GestureClassifier());
    const gestureMapper = useRef(new GestureMapper());
    const commandQueueRef = useRef<ParticleCommand[]>([]);
    const contextLostRef = useRef(false);

    const { mode, currentFormation, particleCount, rotationSpeed, scale } = useParticleStore();
    const { handLandmarks } = useGestureStore();

    // Handle WebGL context loss/restore
    useEffect(() => {
        const handleContextLost = (event: Event) => {
            console.warn('WebGL context lost, preventing default behavior');
            event.preventDefault();
            contextLostRef.current = true;
        };

        const handleContextRestored = () => {
            console.log('WebGL context restored, reinitializing particle system');
            contextLostRef.current = false;
            if (particleSystemRef.current) {
                particleSystemRef.current.dispose();
                particleSystemRef.current = new ParticleSystem({
                    particleCount,
                    particleSize: 0.02,
                    particleColor: new THREE.Color(0x00ffff),
                    driftSpeed: 0.1,
                    noiseScale: 0.5,
                });
            }
        };

        const canvas = document.querySelector('canvas');
        if (canvas) {
            canvas.addEventListener('webglcontextlost', handleContextLost);
            canvas.addEventListener('webglcontextrestored', handleContextRestored);

            return () => {
                canvas.removeEventListener('webglcontextlost', handleContextLost);
                canvas.removeEventListener('webglcontextrestored', handleContextRestored);
            };
        }
    }, [particleCount]);

    // Initialize particle system
    useEffect(() => {
        if (!particleSystemRef.current) {
            particleSystemRef.current = new ParticleSystem({
                particleCount,
                particleSize: 0.02,
                particleColor: new THREE.Color(0x00ffff),
                driftSpeed: 0.1,
                noiseScale: 0.5,
            });
        }

        return () => {
            if (particleSystemRef.current) {
                particleSystemRef.current.dispose();
            }
        };
    }, []);

    // Process hand landmarks and gestures
    useEffect(() => {
        if (handLandmarks && particleSystemRef.current && !contextLostRef.current) {
            const gestures = gestureClassifier.current.classify(handLandmarks);

            gestures.forEach((gesture) => {
                if (gesture.type !== 'none') {
                    const command = gestureMapper.current.mapGesture(gesture);
                    if (command) {
                        commandQueueRef.current.push(command);
                    }
                }
            });
        }
    }, [handLandmarks]);

    // Process gesture commands
    useEffect(() => {
        if (commandQueueRef.current.length > 0 && particleSystemRef.current) {
            const command = commandQueueRef.current.shift();
            if (command) {
                executeCommand(command);
            }
        }
    }, [handLandmarks]);

    const executeCommand = (command: ParticleCommand) => {
        if (!particleSystemRef.current) return;

        const intensity = command.parameters?.intensity || 1;
        const speed = command.parameters?.speed || 1;

        switch (command.action) {
            case 'gather_sphere':
                particleSystemRef.current.morphToFormation('sphere', 2000 / speed);
                useParticleStore.getState().setFormation('sphere');
                break;
            case 'gather_cube':
                particleSystemRef.current.morphToFormation('cube', 2000 / speed);
                useParticleStore.getState().setFormation('cube');
                break;
            case 'gather_torus':
                particleSystemRef.current.morphToFormation('torus', 2000 / speed);
                useParticleStore.getState().setFormation('torus');
                break;
            case 'explode':
                particleSystemRef.current.explode(intensity * 5);
                break;
            case 'drift':
                particleSystemRef.current.setDriftMode();
                useParticleStore.getState().setMode('drift');
                break;
            case 'rotate_object':
                const rotSpeed = (command.parameters?.angle || 0) * 2;
                particleSystemRef.current.rotate(rotSpeed);
                useParticleStore.getState().setRotationSpeed(rotSpeed);
                break;
            case 'scale_up':
                const newScale = command.parameters?.scale || 1;
                particleSystemRef.current.setScale(newScale);
                useParticleStore.getState().setScale(newScale);
                break;
            case 'switch_object':
                const nextFormation = gestureMapper.current.getCurrentObjectType();
                particleSystemRef.current.morphToFormation(nextFormation, 1500);
                useParticleStore.getState().setFormation(nextFormation);
                break;
        }
    };

    useFrame((state, delta) => {
        if (particleSystemRef.current) {
            particleSystemRef.current.update(delta);
        }
    });

    return (
        <>
            {particleSystemRef.current && (
                <primitive object={particleSystemRef.current.getObject()} />
            )}
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
        </>
    );
}

export default function ParticleCanvas() {
    return (
        <div className="fixed inset-0 w-full h-full bg-black">
            <Canvas
                camera={{ position: [0, 0, 8], fov: 75 }}
                gl={{ antialias: true, alpha: true }}
            >
                <ParticleScene />
                <OrbitControls
                    enableZoom={true}
                    enablePan={true}
                    enableRotate={true}
                    zoomSpeed={0.6}
                    panSpeed={0.5}
                    rotateSpeed={0.4}
                />
            </Canvas>
        </div>
    );
}
