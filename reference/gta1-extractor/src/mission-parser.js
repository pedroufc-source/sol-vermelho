/**
 * GTA 1 Mission File Parser (MISSION.INI)
 * Based on WebGL-GTA by Niklas von Hertzen (hertzen.com)
 *
 * MISSION.INI contains:
 * - Level definitions
 * - Object placements (telephones, doors, vehicles, etc.)
 * - Mission triggers and actions
 */

// Command types that use block coordinates (multiplied by 64)
const BLOCK_COORD_COMMANDS = [
    'TELEPHONE', 'DUMMY', 'SPRAY', 'TRIGGER', 'COUNTER', 'FUTURE', 'FUTUREPED',
    'DOOR', 'FUTURECAR', 'BOMBSHOP', 'POWERUP', 'CARTRIGGER', 'HELLS', 'PARKED',
    'GUN_TRIG', 'PLAYER', 'PHONE_TOGG', 'OBJECT', 'BARRIER', 'BLOCK_INFO',
    'MIDPOINT_MULTI', 'FINAL_MULTI', 'MID_MULTI_SETUP', 'CANNON_START',
    'CORRECT_CAR_TRIG', 'SPECIFIC_DOOR', 'CARWAIT_TRIG', 'CARDESTROY_TRIG',
    'DUM_PED_BLOCK_TRIG', 'CORRECT_MOD_TRIG', 'BASIC_BARRIER', 'DAMAGE_TRIG',
    'SPECIFIC_BARR', 'MODEL_BARRIER', 'ALT_DAMAGE_TRIG', 'CARSTUCK_TRIG',
    'DUM_MISSION_TRIG'
];

// Command types that use pixel coordinates (raw values)
const PIXEL_COORD_COMMANDS = [
    'TARGET', 'CRANE', 'PED', 'PARKED_PIXELS', 'CHOPPER_ENDPOINT'
];

// Command types that don't use coordinates
const NO_COORD_COMMANDS = [
    'GTA_DEMAND', 'MISSION_COUNTER', 'MISSION_TOTAL', 'SECRET_MISSION_COUNTER',
    'MPHONES', 'BOMBSHOP_COST', 'TARGET_SCORE', 'MOVING_TRIG', 'MOVING_TRIG_HIRED',
    'CARBOMB_TRIG', 'GUN_SCREEN_TRIG', 'PEDCAR_TRIG'
];

export class MissionParser {
    constructor(text) {
        this.text = text;
        this.missions = {};
    }

    parse() {
        console.log('Parsing MISSION.INI...');

        // Fix formatting issues
        let data = this.text
            .replace(/-1\[/g, "-1\n[")
            .replace(/, /g, ",")
            .replace(/1\(/g, "1 (")
            .replace(/\t/g, ' ')
            .replace(/(^[\r\n]*|[\r\n]+)[\s\t]*[\r\n]+/g, "\n")
            .trim();

        const lines = data.split("\n");
        let currentMission = null;
        let definingSection = 'objects';
        let i = 0;

        while (i < lines.length) {
            const line = lines[i].trim();

            // Check for EOF character
            if (line.charCodeAt(0) === 26) break;

            // Check for mission start [number]
            const missionMatch = line.match(/^\[(\d+)\]$/);
            if (missionMatch) {
                const missionId = parseInt(missionMatch[1], 10);

                // Next line has mission info
                i++;
                const infoLine = lines[i];
                const info = infoLine.split(',');

                currentMission = {
                    id: missionId,
                    name: info[0]?.trim() || '',
                    unknown1: info[1]?.trim() || '',
                    mapFile: (info[2]?.trim() || '').toUpperCase(),
                    unknown2: info[3]?.trim() || '',
                    unknown3: info[4]?.trim() || '',
                    objects: {},
                    actions: {}
                };

                this.missions[missionId] = currentMission;
                definingSection = 'objects';

                // Skip the next line (some other data)
                i += 2;
                continue;
            }

            if (currentMission === null) {
                i++;
                continue;
            }

            // Check for section end
            if (line === '-1') {
                if (definingSection === 'actions') {
                    currentMission = null;
                } else {
                    definingSection = 'actions';
                }
                i++;
                continue;
            }

            // Parse command
            if (definingSection === 'objects') {
                const command = this.parseObjectCommand(line);
                if (command) {
                    currentMission.objects[command.id] = command;
                }
            } else if (definingSection === 'actions') {
                const action = this.parseActionCommand(line);
                if (action) {
                    currentMission.actions[action.id] = action;
                }
            }

            i++;
        }

        console.log(`Parsed ${Object.keys(this.missions).length} missions`);
        return this.missions;
    }

    parseObjectCommand(line) {
        const fields = line.split(/\s+/);
        if (fields.length < 2) return null;

        const id = parseInt(fields[0], 10);
        let commandInfo;
        let hasFlag = false;

        // Check if second field is "1" (flag)
        if (fields[1] === '1') {
            hasFlag = true;
            commandInfo = fields.slice(2);
        } else {
            commandInfo = fields.slice(1);
        }

        if (commandInfo.length < 2) return null;

        const position = commandInfo[0];
        const type = commandInfo[1].toUpperCase();
        const args = commandInfo.slice(2);

        const command = {
            id,
            type,
            hasFlag
        };

        // Parse position
        const coords = this.parsePosition(position);
        if (coords) {
            command.x = coords.x;
            command.y = coords.y;
            command.z = coords.z;

            // Convert to world coordinates if block-based
            if (BLOCK_COORD_COMMANDS.includes(type)) {
                command.worldX = coords.x * 64 + 32;
                command.worldY = coords.y * 64 + 32;
                command.worldZ = coords.z * 64;
            } else if (PIXEL_COORD_COMMANDS.includes(type)) {
                command.worldX = coords.x;
                command.worldY = coords.y;
                command.worldZ = coords.z;
            }
        }

        // Parse type-specific arguments
        this.parseCommandArgs(command, args);

        return command;
    }

    parseActionCommand(line) {
        const fields = line.split(/\s+/);
        if (fields.length < 2) return null;

        return {
            id: parseInt(fields[0], 10),
            type: fields[1],
            args: fields.slice(2)
        };
    }

    parsePosition(pos) {
        // Handle decimal separators
        pos = pos.replace(/\./g, ',');
        const match = pos.match(/^\((\d+),(\d+),(\d+)\)$/);
        if (!match) return null;

        return {
            x: parseInt(match[1], 10),
            y: parseInt(match[2], 10),
            z: parseInt(match[3], 10)
        };
    }

    parseCommandArgs(command, args) {
        switch (command.type) {
            case 'TELEPHONE':
                command.means = parseInt(args[0], 10) || 0;
                command.angle = parseInt(args[1], 10) || 0;
                break;

            case 'SPRAY':
                command.color = parseInt(args[0], 10) || 0;
                command.radius = parseInt(args[1], 10) || 0;
                break;

            case 'TRIGGER':
                command.line = parseInt(args[0], 10) || 0;
                command.radius = parseInt(args[1], 10) || 0;
                break;

            case 'TARGET':
                // No additional args
                break;

            case 'COUNTER':
                command.count = parseInt(args[0], 10) || 0;
                break;

            case 'FUTURE':
            case 'FUTUREPED':
            case 'FUTURECAR':
            case 'PARKED':
            case 'PARKED_PIXELS':
            case 'HELLS':
                command.model = parseInt(args[0], 10) || 0;
                command.angle = parseInt(args[1], 10) || 0;
                break;

            case 'DOOR':
                command.face = parseInt(args[0], 10) || 0;
                command.doorType = parseInt(args[1], 10) || 0;
                command.interior = parseInt(args[2], 10) || 0;
                break;

            case 'BOMBSHOP':
                // No additional args
                break;

            case 'POWERUP':
                command.powerupType = parseInt(args[0], 10) || 0;
                command.timer = parseInt(args[1], 10) || 0;
                break;

            case 'CARTRIGGER':
                command.line = parseInt(args[0], 10) || 0;
                command.car = parseInt(args[1], 10) || 0;
                break;

            case 'GUN_TRIG':
                command.line = parseInt(args[0], 10) || 0;
                command.range = parseInt(args[1], 10) || 0;
                break;

            case 'PLAYER':
                command.car = parseInt(args[0], 10) || 0;
                command.angle = parseInt(args[1], 10) || 0;
                break;

            case 'GTA_DEMAND':
                command.craneNumber = parseInt(args[0], 10) || 0;
                command.model = parseInt(args[1], 10) || 0;
                command.remap = parseInt(args[2], 10) || 0;
                command.totalGet = parseInt(args[3], 10) || 0;
                break;

            case 'MISSION_COUNTER':
            case 'MISSION_TOTAL':
            case 'SECRET_MISSION_COUNTER':
                command.total = parseInt(args[0], 10) || 0;
                break;

            case 'MPHONES':
                command.phone = parseInt(args[0], 10) || 0;
                command.radius = parseInt(args[1], 10) || 0;
                break;

            case 'PHONE_TOGG':
                command.mphoneLine = parseInt(args[0], 10) || 0;
                command.range = parseInt(args[1], 10) || 0;
                break;

            case 'OBJECT':
                command.objectType = parseInt(args[0], 10) || 0;
                command.angle = parseInt(args[1], 10) || 0;
                break;

            case 'CRANE':
                command.variable1 = parseInt(args[0], 10) || 0;
                command.variable2 = parseInt(args[1], 10) || 0;
                break;

            case 'BARRIER':
            case 'BASIC_BARRIER':
                command.face = parseInt(args[0], 10) || 0;
                command.numFrames = parseInt(args[1], 10) || 0;
                command.interiorType = parseInt(args[2], 10) || 0;
                break;

            case 'BLOCK_INFO':
                command.info1 = parseInt(args[0], 10) || 0;
                command.info2 = parseInt(args[1], 10) || 0;
                break;

            case 'BOMBSHOP_COST':
                command.cost = parseInt(args[0], 10) || 0;
                break;

            case 'PED':
                command.pedType = parseInt(args[0], 10) || 0;
                command.angle = parseInt(args[1], 10) || 0;
                command.remap = parseInt(args[2], 10) || 0;
                command.enemy = parseInt(args[3], 10) || 0;
                break;

            case 'SPECIFIC_DOOR':
                command.face = parseInt(args[0], 10) || 0;
                command.doorType = parseInt(args[1], 10) || 0;
                command.interior = parseInt(args[2], 10) || 0;
                command.carLineNum = parseInt(args[3], 10) || 0;
                break;

            case 'DUMMY':
            default:
                // Store raw args
                command.args = args.map(a => parseInt(a, 10) || a);
                break;
        }
    }

    // Get summary statistics
    getStats() {
        const stats = {
            totalMissions: Object.keys(this.missions).length,
            totalObjects: 0,
            totalActions: 0,
            objectTypes: {},
            missionList: []
        };

        for (const [id, mission] of Object.entries(this.missions)) {
            const objectCount = Object.keys(mission.objects).length;
            const actionCount = Object.keys(mission.actions).length;

            stats.totalObjects += objectCount;
            stats.totalActions += actionCount;

            stats.missionList.push({
                id: mission.id,
                name: mission.name,
                mapFile: mission.mapFile,
                objects: objectCount,
                actions: actionCount
            });

            // Count object types
            for (const obj of Object.values(mission.objects)) {
                stats.objectTypes[obj.type] = (stats.objectTypes[obj.type] || 0) + 1;
            }
        }

        return stats;
    }

    // Extract all telephones
    getAllTelephones() {
        const telephones = [];
        for (const mission of Object.values(this.missions)) {
            for (const obj of Object.values(mission.objects)) {
                if (obj.type === 'TELEPHONE') {
                    telephones.push({
                        missionId: mission.id,
                        missionName: mission.name,
                        ...obj
                    });
                }
            }
        }
        return telephones;
    }

    // Extract all parked vehicles
    getAllParkedVehicles() {
        const vehicles = [];
        for (const mission of Object.values(this.missions)) {
            for (const obj of Object.values(mission.objects)) {
                if (obj.type === 'PARKED' || obj.type === 'PARKED_PIXELS') {
                    vehicles.push({
                        missionId: mission.id,
                        missionName: mission.name,
                        ...obj
                    });
                }
            }
        }
        return vehicles;
    }

    // Extract all spray shops
    getAllSprayShops() {
        const shops = [];
        for (const mission of Object.values(this.missions)) {
            for (const obj of Object.values(mission.objects)) {
                if (obj.type === 'SPRAY') {
                    shops.push({
                        missionId: mission.id,
                        missionName: mission.name,
                        ...obj
                    });
                }
            }
        }
        return shops;
    }

    // Extract all bomb shops
    getAllBombShops() {
        const shops = [];
        for (const mission of Object.values(this.missions)) {
            for (const obj of Object.values(mission.objects)) {
                if (obj.type === 'BOMBSHOP') {
                    shops.push({
                        missionId: mission.id,
                        missionName: mission.name,
                        ...obj
                    });
                }
            }
        }
        return shops;
    }
}
