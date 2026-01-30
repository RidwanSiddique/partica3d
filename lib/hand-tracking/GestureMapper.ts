import { GestureEvent, GestureType } from './GestureClassifier';

export type ParticleAction =
    | 'gather_sphere'
    | 'gather_cube'
    | 'gather_torus'
    | 'explode'
    | 'drift'
    | 'rotate_object'
    | 'scale_up'
    | 'switch_object';

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
        // Default mappings
        this.mappings = new Map([
            ['pinch', 'gather_sphere'],
            ['open_palm', 'explode'],
            ['fist', 'gather_cube'],
            ['swipe_left', 'switch_object'],
            ['swipe_right', 'switch_object'],
            ['rotate_cw', 'rotate_object'],
            ['rotate_ccw', 'rotate_object'],
            ['two_hand_spread', 'scale_up'],
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
            case 'rotate_cw':
            case 'rotate_ccw':
                command.parameters = {
                    angle: event.metadata?.angle || 0,
                    speed: event.confidence,
                };
                break;

            case 'two_hand_spread':
                command.parameters = {
                    scale: 1 + (event.metadata?.distance || 0),
                    intensity: event.confidence,
                };
                break;

            case 'swipe_left':
                this.currentObjectIndex =
                    (this.currentObjectIndex - 1 + this.objectTypes.length) % this.objectTypes.length;
                command.parameters = {
                    intensity: event.confidence,
                };
                break;

            case 'swipe_right':
                this.currentObjectIndex = (this.currentObjectIndex + 1) % this.objectTypes.length;
                command.parameters = {
                    intensity: event.confidence,
                };
                break;

            case 'pinch':
            case 'open_palm':
            case 'fist':
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
