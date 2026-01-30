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
        
        for (let i = 0; i < count; i++) {
            const t = (i / count) * Math.PI * 2;
            
            // Heart equation in parametric form
            const x = size * 16 * Math.pow(Math.sin(t), 3) / 16;
            const y = size * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16;
            const z = (Math.sin(t * 3) * 0.5); // Add some depth variation
            
            positions.push(new THREE.Vector3(x, y, z));
        }
        
        return positions;
    }

    static generateSorryText(count: number, scale: number = 1): THREE.Vector3[] {
        const positions: THREE.Vector3[] = [];
        const letters = ['S', 'O', 'R', 'R', 'Y'];
        const letterSpacing = 1.2 * scale;
        const totalWidth = (letters.length - 1) * letterSpacing;
        const startX = -totalWidth / 2;

        const pointsPerLetter = Math.floor(count / letters.length);
        let pointIndex = 0;

        letters.forEach((letter, letterIndex) => {
            const letterX = startX + letterIndex * letterSpacing;
            const letterPoints = this.getLetterPoints(letter, pointsPerLetter, scale);
            
            letterPoints.forEach(point => {
                if (pointIndex < count) {
                    positions.push(new THREE.Vector3(
                        point.x + letterX,
                        point.y,
                        point.z
                    ));
                    pointIndex++;
                }
            });
        });

        // Fill remaining points with random positions around the text
        while (pointIndex < count) {
            positions.push(new THREE.Vector3(
                (Math.random() - 0.5) * totalWidth * 1.5,
                (Math.random() - 0.5) * scale,
                (Math.random() - 0.5) * scale
            ));
            pointIndex++;
        }

        return positions;
    }

    static generateLoveText(count: number, scale: number = 1): THREE.Vector3[] {
        const positions: THREE.Vector3[] = [];
        const words = [
            ['I'],
            ['L', 'O', 'V', 'E'],
            ['Y', 'O', 'U']
        ];
        
        const lineSpacing = 1.5 * scale;
        const letterSpacing = 0.8 * scale;
        
        let pointIndex = 0;
        const pointsPerWord = Math.floor(count / 3);

        words.forEach((word, wordIndex) => {
            const wordY = (1 - wordIndex) * lineSpacing; // Top to bottom
            const wordWidth = (word.length - 1) * letterSpacing;
            const wordStartX = -wordWidth / 2;

            const pointsPerLetter = Math.floor(pointsPerWord / word.length);

            word.forEach((letter, letterIndex) => {
                const letterX = wordStartX + letterIndex * letterSpacing;
                const letterPoints = this.getLetterPoints(letter, pointsPerLetter, scale * 0.8);
                
                letterPoints.forEach(point => {
                    if (pointIndex < count) {
                        positions.push(new THREE.Vector3(
                            point.x + letterX,
                            point.y + wordY,
                            point.z
                        ));
                        pointIndex++;
                    }
                });
            });
        });

        // Fill remaining points
        while (pointIndex < count) {
            positions.push(new THREE.Vector3(
                (Math.random() - 0.5) * scale * 4,
                (Math.random() - 0.5) * scale * 3,
                (Math.random() - 0.5) * scale
            ));
            pointIndex++;
        }

        return positions;
    }

    private static getLetterPoints(letter: string, pointCount: number, scale: number): THREE.Vector3[] {
        const points: THREE.Vector3[] = [];
        
        // Simple letter shapes - using basic geometric patterns
        const patterns: Record<string, () => THREE.Vector3[]> = {
            'S': () => {
                const pts: THREE.Vector3[] = [];
                for (let i = 0; i < pointCount; i++) {
                    const t = i / pointCount;
                    const angle = t * Math.PI * 2;
                    const x = Math.sin(angle * 2) * scale * 0.3;
                    const y = (t - 0.5) * scale;
                    pts.push(new THREE.Vector3(x, y, 0));
                }
                return pts;
            },
            'O': () => {
                const pts: THREE.Vector3[] = [];
                for (let i = 0; i < pointCount; i++) {
                    const angle = (i / pointCount) * Math.PI * 2;
                    const x = Math.cos(angle) * scale * 0.3;
                    const y = Math.sin(angle) * scale * 0.4;
                    pts.push(new THREE.Vector3(x, y, 0));
                }
                return pts;
            },
            'R': () => {
                const pts: THREE.Vector3[] = [];
                const half = Math.floor(pointCount / 2);
                // Vertical line
                for (let i = 0; i < half; i++) {
                    const y = ((i / half) - 0.5) * scale;
                    pts.push(new THREE.Vector3(-scale * 0.2, y, 0));
                }
                // Curved part
                for (let i = 0; i < pointCount - half; i++) {
                    const angle = (i / (pointCount - half)) * Math.PI;
                    const x = Math.cos(angle) * scale * 0.2 - scale * 0.2;
                    const y = Math.sin(angle) * scale * 0.2 + scale * 0.2;
                    pts.push(new THREE.Vector3(x, y, 0));
                }
                return pts;
            },
            'Y': () => {
                const pts: THREE.Vector3[] = [];
                const third = Math.floor(pointCount / 3);
                // Left diagonal
                for (let i = 0; i < third; i++) {
                    const t = i / third;
                    pts.push(new THREE.Vector3(-scale * 0.3 * (1-t), scale * 0.5 - t * scale * 0.5, 0));
                }
                // Right diagonal  
                for (let i = 0; i < third; i++) {
                    const t = i / third;
                    pts.push(new THREE.Vector3(scale * 0.3 * (1-t), scale * 0.5 - t * scale * 0.5, 0));
                }
                // Vertical line
                for (let i = 0; i < pointCount - third * 2; i++) {
                    const t = i / (pointCount - third * 2);
                    pts.push(new THREE.Vector3(0, -t * scale * 0.5, 0));
                }
                return pts;
            },
            'I': () => {
                const pts: THREE.Vector3[] = [];
                for (let i = 0; i < pointCount; i++) {
                    const y = ((i / pointCount) - 0.5) * scale;
                    pts.push(new THREE.Vector3(0, y, 0));
                }
                return pts;
            },
            'L': () => {
                const pts: THREE.Vector3[] = [];
                const half = Math.floor(pointCount / 2);
                // Vertical line
                for (let i = 0; i < half; i++) {
                    const y = ((i / half) - 0.5) * scale;
                    pts.push(new THREE.Vector3(-scale * 0.2, y, 0));
                }
                // Horizontal line
                for (let i = 0; i < pointCount - half; i++) {
                    const x = (i / (pointCount - half)) * scale * 0.4 - scale * 0.2;
                    pts.push(new THREE.Vector3(x, -scale * 0.5, 0));
                }
                return pts;
            },
            'V': () => {
                const pts: THREE.Vector3[] = [];
                const half = Math.floor(pointCount / 2);
                // Left diagonal
                for (let i = 0; i < half; i++) {
                    const t = i / half;
                    pts.push(new THREE.Vector3(-scale * 0.3 + t * scale * 0.3, scale * 0.5 - t * scale, 0));
                }
                // Right diagonal
                for (let i = 0; i < pointCount - half; i++) {
                    const t = i / (pointCount - half);
                    pts.push(new THREE.Vector3(t * scale * 0.3, -scale * 0.5 + t * scale, 0));
                }
                return pts;
            },
            'E': () => {
                const pts: THREE.Vector3[] = [];
                const quarter = Math.floor(pointCount / 4);
                // Vertical line
                for (let i = 0; i < quarter * 2; i++) {
                    const y = ((i / (quarter * 2)) - 0.5) * scale;
                    pts.push(new THREE.Vector3(-scale * 0.2, y, 0));
                }
                // Top horizontal
                for (let i = 0; i < quarter; i++) {
                    const x = (i / quarter) * scale * 0.3 - scale * 0.2;
                    pts.push(new THREE.Vector3(x, scale * 0.5, 0));
                }
                // Bottom horizontal
                for (let i = 0; i < pointCount - quarter * 3; i++) {
                    const x = (i / (pointCount - quarter * 3)) * scale * 0.3 - scale * 0.2;
                    pts.push(new THREE.Vector3(x, -scale * 0.5, 0));
                }
                return pts;
            },
            'U': () => {
                const pts: THREE.Vector3[] = [];
                for (let i = 0; i < pointCount; i++) {
                    const angle = (i / pointCount) * Math.PI + Math.PI;
                    const x = Math.cos(angle) * scale * 0.3;
                    const y = Math.sin(angle) * scale * 0.3 + scale * 0.2;
                    pts.push(new THREE.Vector3(x, y, 0));
                }
                return pts;
            }
        };

        return patterns[letter] ? patterns[letter]() : 
            Array(pointCount).fill(0).map(() => new THREE.Vector3(
                (Math.random() - 0.5) * scale,
                (Math.random() - 0.5) * scale,
                0
            ));
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
            case 'sorry':
                return this.generateSorryText(count);
            case 'love':
                return this.generateLoveText(count);
            case 'random':
            default:
                return this.generateRandom(count);
        }
    }
}
