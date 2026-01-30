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
            case 'random':
            default:
                return this.generateRandom(count);
        }
    }
}
