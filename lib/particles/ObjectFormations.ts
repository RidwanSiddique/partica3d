import * as THREE from 'three';

export interface Formation {
    name: string;
    positions: THREE.Vector3[];
}

export class ObjectFormations {
    static generateSphere(count: number, radius: number = 2): THREE.Vector3[] {
        const positions: THREE.Vector3[] = [];
        const goldenRatio = (1 + Math.sqrt(5)) / 2;
        const angleIncrement = Math.PI * 2 * goldenRatio;

        for (let i = 0; i < count; i++) {
            const t = i / count;
            const inclination = Math.acos(1 - 2 * t);
            const azimuth = angleIncrement * i;

            const x = radius * Math.sin(inclination) * Math.cos(azimuth);
            const y = radius * Math.sin(inclination) * Math.sin(azimuth);
            const z = radius * Math.cos(inclination);

            positions.push(new THREE.Vector3(x, y, z));
        }

        return positions;
    }

    static generateCube(count: number, size: number = 3): THREE.Vector3[] {
        const positions: THREE.Vector3[] = [];
        const pointsPerEdge = Math.ceil(Math.cbrt(count));
        const step = size / (pointsPerEdge - 1);
        const offset = size / 2;

        let added = 0;
        for (let x = 0; x < pointsPerEdge && added < count; x++) {
            for (let y = 0; y < pointsPerEdge && added < count; y++) {
                for (let z = 0; z < pointsPerEdge && added < count; z++) {
                    positions.push(
                        new THREE.Vector3(
                            x * step - offset,
                            y * step - offset,
                            z * step - offset
                        )
                    );
                    added++;
                }
            }
        }

        return positions;
    }

    static generateTorus(
        count: number,
        majorRadius: number = 2,
        minorRadius: number = 0.8
    ): THREE.Vector3[] {
        const positions: THREE.Vector3[] = [];
        const goldenRatio = (1 + Math.sqrt(5)) / 2;

        for (let i = 0; i < count; i++) {
            const u = (i / count) * Math.PI * 2;
            const v = ((i * goldenRatio) % 1) * Math.PI * 2;

            const x = (majorRadius + minorRadius * Math.cos(v)) * Math.cos(u);
            const y = (majorRadius + minorRadius * Math.cos(v)) * Math.sin(u);
            const z = minorRadius * Math.sin(v);

            positions.push(new THREE.Vector3(x, y, z));
        }

        return positions;
    }

    static generateHelix(
        count: number,
        radius: number = 2,
        height: number = 4,
        turns: number = 3
    ): THREE.Vector3[] {
        const positions: THREE.Vector3[] = [];

        for (let i = 0; i < count; i++) {
            const t = i / count;
            const angle = t * Math.PI * 2 * turns;
            const y = t * height - height / 2;

            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);

            positions.push(new THREE.Vector3(x, y, z));
        }

        return positions;
    }

    static generateRandom(count: number, spread: number = 5): THREE.Vector3[] {
        const positions: THREE.Vector3[] = [];

        for (let i = 0; i < count; i++) {
            positions.push(
                new THREE.Vector3(
                    (Math.random() - 0.5) * spread,
                    (Math.random() - 0.5) * spread,
                    (Math.random() - 0.5) * spread
                )
            );
        }

        return positions;
    }

    static generateHeart(count: number, size: number = 2): THREE.Vector3[] {
        const positions: THREE.Vector3[] = [];
        
        // Generate a filled 3D heart by creating layers of the classic heart shape
        for (let i = 0; i < count; i++) {
            // Create multiple layers from front to back
            const layers = 20;
            const layerIndex = Math.floor(Math.random() * layers);
            const zDepth = (layerIndex / layers - 0.5) * size * 0.8; // Z depth from -0.4*size to +0.4*size
            
            // Scale factor for each layer (smaller hearts towards the edges)
            const layerScale = 1 - Math.abs(layerIndex - layers/2) / (layers/2) * 0.3;
            
            // Generate point on heart curve
            const t = Math.random() * Math.PI * 2;
            
            // Classic heart equation (rotated to face up)
            let heartX = size * layerScale * 16 * Math.pow(Math.sin(t), 3) / 16;
            let heartY = size * layerScale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16;
            
            // For filled heart, add random points inside the heart boundary
            const radiusScale = Math.random() * Math.random(); // Bias towards center
            heartX *= radiusScale;
            heartY *= radiusScale;
            
            // Add some randomness for organic feel
            heartX += (Math.random() - 0.5) * size * 0.1;
            heartY += (Math.random() - 0.5) * size * 0.1;
            
            positions.push(new THREE.Vector3(heartX, heartY, zDepth));
        }
        
        return positions;
    }

    static generateApologySpiral(count: number, size: number = 2): THREE.Vector3[] {
        const positions: THREE.Vector3[] = [];
        
        // Create a 3D filled DNA double helix structure
        const height = size * 4; // Total height of DNA structure
        const radius = size * 0.8; // Radius of the helix
        const turns = 3; // Number of complete turns
        
        for (let i = 0; i < count; i++) {
            const random = Math.random();
            
            if (random < 0.4) {
                // Generate points for first helix strand
                const t = (Math.random()) * turns * Math.PI * 2;
                const y = (Math.random() - 0.5) * height;
                const helixRadius = radius + (Math.random() - 0.5) * size * 0.2;
                
                const x = helixRadius * Math.cos(t + y / height * turns * Math.PI * 2);
                const z = helixRadius * Math.sin(t + y / height * turns * Math.PI * 2);
                
                positions.push(new THREE.Vector3(x, y, z));
                
            } else if (random < 0.8) {
                // Generate points for second helix strand (offset by π)
                const t = (Math.random()) * turns * Math.PI * 2;
                const y = (Math.random() - 0.5) * height;
                const helixRadius = radius + (Math.random() - 0.5) * size * 0.2;
                
                const x = helixRadius * Math.cos(t + y / height * turns * Math.PI * 2 + Math.PI);
                const z = helixRadius * Math.sin(t + y / height * turns * Math.PI * 2 + Math.PI);
                
                positions.push(new THREE.Vector3(x, y, z));
                
            } else {
                // Generate connecting base pairs between the strands
                const y = (Math.random() - 0.5) * height;
                const angle = y / height * turns * Math.PI * 2;
                
                // Random point along the line connecting the two strands
                const connectionT = Math.random();
                const strand1X = radius * Math.cos(angle);
                const strand1Z = radius * Math.sin(angle);
                const strand2X = radius * Math.cos(angle + Math.PI);
                const strand2Z = radius * Math.sin(angle + Math.PI);
                
                const x = strand1X + (strand2X - strand1X) * connectionT;
                const z = strand1Z + (strand2Z - strand1Z) * connectionT;
                
                // Add some thickness to the base pairs
                const thickness = (Math.random() - 0.5) * size * 0.3;
                const perpX = -Math.sin(angle) * thickness;
                const perpZ = Math.cos(angle) * thickness;
                
                positions.push(new THREE.Vector3(x + perpX, y, z + perpZ));
            }
        }
        
        return positions;
    }

    static generateLoveHearts(count: number, size: number = 2): THREE.Vector3[] {
        const positions: THREE.Vector3[] = [];
        const heartsCount = 3; // Create 3 heart shapes
        const pointsPerHeart = Math.floor(count / heartsCount);
        let pointIndex = 0;

        for (let heartIndex = 0; heartIndex < heartsCount && pointIndex < count; heartIndex++) {
            // Position each heart in 3D space
            const heartOffset = {
                x: (heartIndex - 1) * size * 0.8,
                y: Math.sin(heartIndex * Math.PI * 2 / heartsCount) * size * 0.5,
                z: Math.cos(heartIndex * Math.PI * 2 / heartsCount) * size * 0.5
            };

            const heartSize = size * (0.6 + heartIndex * 0.2); // Varying sizes

            for (let i = 0; i < pointsPerHeart && pointIndex < count; i++) {
                const t = (i / pointsPerHeart) * Math.PI * 2;
                
                // 3D heart equation
                const baseX = heartSize * 16 * Math.pow(Math.sin(t), 3) / 16;
                const baseY = heartSize * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16;
                const baseZ = Math.sin(t * 2) * heartSize * 0.3;
                
                positions.push(new THREE.Vector3(
                    baseX + heartOffset.x,
                    baseY + heartOffset.y,
                    baseZ + heartOffset.z
                ));
                pointIndex++;
            }
        }

        // Fill remaining points with small hearts around the main ones
        while (pointIndex < count) {
            const angle = (pointIndex / count) * Math.PI * 4;
            const radius = size * 1.5;
            
            positions.push(new THREE.Vector3(
                Math.cos(angle) * radius + (Math.random() - 0.5) * size * 0.3,
                Math.sin(angle * 2) * radius * 0.5,
                Math.sin(angle) * radius + (Math.random() - 0.5) * size * 0.3
            ));
            pointIndex++;
        }

        return positions;
    }

    static getFormation(type: string, count: number): THREE.Vector3[] {
        switch (type.toLowerCase()) {
            case 'sphere':
                return this.generateSphere(count);
            case 'cube':
                return this.generateCube(count);
            case 'torus':
                return this.generateTorus(count);
            case 'helix':
                return this.generateHelix(count);
            case 'heart':
                return this.generateHeart(count);
            case 'apology_spiral':
                return this.generateApologySpiral(count);
            case 'love_hearts':
                return this.generateLoveHearts(count);
            case 'random':
            default:
                return this.generateRandom(count);
        }
    }
}
