import { GestureEvent, GestureType } from './GestureClassifier';

export type ParticleAction =
    | 'explode'
    | 'gather_sphere'
    | 'form_heart'
    | 'form_apology_spiral'
    | 'form_love_hearts';

export interface ParticleCommand {
    action: ParticleAction;
    parameters?: {
        intensity?: number;
        speed?: number;
        angle?: number;
        scale?: number;
    };
}

export interface GestureMapping {
    gesture: GestureType;
    action: ParticleAction;
    objectType?: string;
}

export class GestureMapper {
    private mappings: Map<GestureType, ParticleAction>;
    private currentObjectIndex = 0;
    private objectTypes = ['sphere', 'cube', 'torus'];

    constructor(customMappings?: GestureMapping[]) {
        // Default mappings - 4 core gestures only
        this.mappings = new Map([
            ['open_palm', 'explode'],
            ['fist', 'gather_sphere'],
            ['ok_sign', 'form_heart'],
            ['peace_sign', 'form_apology_spiral'],
        ]);

        // Apply custom mappings if provided
        if (customMappings) {
            customMappings.forEach((mapping) => {
                this.mappings.set(mapping.gesture, mapping.action);
            });
        }
    }

    mapGesture(event: GestureEvent): ParticleCommand | null {
        if (event.type === 'none') return null;

        const action = this.mappings.get(event.type);
        if (!action) return null;

        const command: ParticleCommand = { action };

        // Add parameters based on gesture metadata
        switch (event.type) {
            case 'open_palm':
            case 'fist':
            case 'ok_sign':
            case 'peace_sign':
                command.parameters = {
                    intensity: event.confidence,
                    speed: 1.0,
                };
                break;
        }

        return command;
    }

    getCurrentObjectType(): string {
        return this.objectTypes[this.currentObjectIndex];
    }

    setObjectTypes(types: string[]) {
        this.objectTypes = types;
        this.currentObjectIndex = 0;
    }

    updateMapping(gesture: GestureType, action: ParticleAction) {
        this.mappings.set(gesture, action);
    }

    getMappings(): Map<GestureType, ParticleAction> {
        return new Map(this.mappings);
    }
}
