/**
 * SOL VERMELHO WebGL - Configuração
 */

const CONFIG = {
    // Mundo (em unidades Three.js)
    WORLD_W: 4096,          // Largura do mapa
    WORLD_H: 4096,          // Altura do mapa
    TILE_SIZE: 64,          // Tamanho de um bloco

    // Física
    PHYSICS_SCALE: 10,      // Escala Box2D (unidades / 10)

    // Câmera
    CAMERA_HEIGHT: 400,     // Altura da câmera
    CAMERA_FOV: 45,         // Field of view

    // Player
    PLAYER_SPEED: 200,      // Velocidade andando
    PLAYER_RUN_SPEED: 350,  // Velocidade correndo
    PLAYER_SIZE: 20,        // Raio do player

    // Cores
    COLORS: {
        GROUND: 0x1a1a1a,
        ROAD: 0x333333,
        BUILDING: 0x444444,
        WATER: 0x1a3a5a,
        PLAYER: 0xff3333,
        NPC: 0x33ff33,
        CAR: 0x3333ff
    },

    // Debug
    DEBUG: true
};

// Armas
const WEAPONS = {
    fists: { name: 'Punhos', damage: 10, range: 30, rate: 500, ammo: Infinity },
    pistol: { name: 'Pistola', damage: 25, range: 300, rate: 400, ammo: 12 },
    uzi: { name: 'UZI', damage: 15, range: 200, rate: 100, ammo: 30 },
    shotgun: { name: 'Escopeta', damage: 50, range: 150, rate: 800, ammo: 8 }
};
