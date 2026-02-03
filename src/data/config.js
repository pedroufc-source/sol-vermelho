/**
 * SOL VERMELHO - Configurações Globais
 * Constantes e configurações do jogo
 */

const CONFIG = {
    // Dimensões do mundo
    WORLD_W: 4096,
    WORLD_H: 4096,
    TILE_SIZE: 64,

    // Canvas
    CANVAS_W: 800,
    CANVAS_H: 600,

    // Gameplay
    PLAYER_SPEED: 2.5,
    PLAYER_RUN_SPEED: 4,
    WANTED_DECAY_TIME: 1800, // frames até diminuir 1 estrela

    // Spawn
    MAX_PEDS: 50,
    MAX_VEHICLES: 30,
    MAX_COPS: 12,

    // Save
    SAVE_KEY: 'sol_vermelho_save',
    SAVE_VERSION: 1
};

// Armas disponíveis
const WEAPONS = {
    fists: {
        name: 'PUNHOS',
        dmg: 15,
        range: 40,
        rate: 20,
        ammo: Infinity
    },
    pistol: {
        name: 'PISTOLA',
        dmg: 25,
        range: 500,
        rate: 12,
        ammo: 12,
        max: 99
    },
    uzi: {
        name: 'UZI',
        dmg: 12,
        range: 350,
        rate: 3,
        ammo: 30,
        max: 150,
        auto: true
    },
    shotgun: {
        name: 'SHOTGUN',
        dmg: 10,
        range: 200,
        rate: 25,
        ammo: 8,
        max: 32,
        pellets: 6
    }
};

// Tipos de crime (afetam tempo de resposta policial)
const CRIME_TYPES = {
    patrimonio: 'patrimonio',  // Roubo de carro, explosão - resposta rápida
    vida: 'vida'               // Homicídio - depende da zona
};
