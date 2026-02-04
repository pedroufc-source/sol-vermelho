/**
 * Vehicle Data Extractor
 * Exports GTA 1 vehicle physics data as JSON
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

// Vehicle type names (based on sprite type)
const VEHICLE_TYPE_NAMES = {
    0: 'bus',
    1: 'car',
    2: 'bike',
    3: 'boat',
    // Add more as discovered
};

export class VehicleExtractor {
    constructor(parsedData) {
        this.vehicles = parsedData.vehicles;
        this.spriteOffsets = parsedData.spriteOffsets;
    }

    extract() {
        const result = {
            meta: {
                source: 'GTA 1',
                extractor: 'Sol Vermelho GTA1 Extractor',
                count: this.vehicles.length
            },
            vehicles: []
        };

        for (let i = 0; i < this.vehicles.length; i++) {
            const v = this.vehicles[i];

            result.vehicles.push({
                index: i,
                model: v.model,
                type: VEHICLE_TYPE_NAMES[v.type] || `type_${v.type}`,

                // Dimensions (in game units)
                dimensions: {
                    width: v.width,
                    height: v.height,
                    depth: v.depth
                },

                // Speed values
                speed: {
                    max: v.maxSpeed,
                    min: v.minSpeed
                },

                // Basic physics
                physics: {
                    weight: v.weight,
                    acceleration: v.acceleration,
                    braking: v.braking,
                    grip: v.grip,
                    handling: v.handling
                },

                // Advanced physics
                advancedPhysics: {
                    mass: v.mass,
                    thrust: v.thrust,
                    tyreAdhesionX: v.tyreAdhesionX,
                    tyreAdhesionY: v.tyreAdhesionY,
                    handbrakeFriction: v.handbrakeFriction,
                    footbrakeFriction: v.footbrakeFriction,
                    frontBrakeBias: v.frontBrakeBias,
                    backEndSlideValue: v.backEndSlideValue,
                    handbrakeSlideValue: v.handbrakeSlideValue
                },

                // Steering
                steering: {
                    turning: v.turning,
                    turnRatio: v.turnRatio,
                    driveWheelOffset: v.driveWheelOffset,
                    steeringWheelOffset: v.steeringWheelOffset
                },

                // Properties
                properties: {
                    convertible: v.convertible === 1,
                    damagable: v.damagable === 1,
                    engine: v.engine,
                    radio: v.radio,
                    horn: v.horn
                },

                // Prices at cranes
                prices: v.prices,

                // Doors
                doors: v.doors,

                // Color remaps (for variety)
                colorRemaps: v.remaps.filter(r => r.h !== 0 || r.l !== 0 || r.s !== 0)
            });
        }

        return result;
    }

    save(outputPath) {
        const data = this.extract();

        // Ensure directory exists
        mkdirSync(dirname(outputPath), { recursive: true });

        // Write JSON
        writeFileSync(outputPath, JSON.stringify(data, null, 2));

        console.log(`Saved ${data.vehicles.length} vehicles to ${outputPath}`);
        return data;
    }

    // Generate a summary for quick reference
    generateSummary() {
        const summary = [];

        for (let i = 0; i < this.vehicles.length; i++) {
            const v = this.vehicles[i];
            summary.push({
                index: i,
                model: v.model,
                maxSpeed: v.maxSpeed,
                acceleration: v.acceleration,
                handling: v.handling,
                mass: Math.round(v.mass * 100) / 100
            });
        }

        // Sort by max speed
        summary.sort((a, b) => b.maxSpeed - a.maxSpeed);

        return summary;
    }

    // Print comparison table
    printComparison() {
        console.log('\n=== GTA 1 Vehicle Comparison ===\n');
        console.log('Model | MaxSpeed | Accel | Handling | Mass');
        console.log('------|----------|-------|----------|------');

        const summary = this.generateSummary();
        for (const v of summary) {
            console.log(
                `${String(v.model).padEnd(5)} | ` +
                `${String(v.maxSpeed).padEnd(8)} | ` +
                `${String(v.acceleration).padEnd(5)} | ` +
                `${String(v.handling).padEnd(8)} | ` +
                `${v.mass}`
            );
        }
    }
}
