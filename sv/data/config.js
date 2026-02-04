/**
 * Sol Vermelho - Configuration Data
 * Dados de configuracao do jogo
 */

var SV = SV || {};
SV.Config = {};

// ============================================================================
// ZONAS DE FORTALEZA
// Sistema de resposta policial baseado em classe socioeconomica
// ============================================================================
SV.Config.ZONAS = [
    // AREAS NOBRES - Resposta rapida
    { name: 'ALDEOTA', x: 2400, y: 1200, w: 800, h: 600, classe: 'alta', tempoBase: 60, color: 0x4a90d9 },
    { name: 'MEIRELES', x: 2800, y: 600, w: 600, h: 500, classe: 'alta', tempoBase: 60, color: 0x5ba3ec },
    { name: 'PRAIA DE IRACEMA', x: 2000, y: 400, w: 500, h: 400, classe: 'alta', tempoBase: 90, color: 0x6bb6ff },

    // CLASSE MEDIA - Resposta moderada
    { name: 'CENTRO', x: 1200, y: 1800, w: 700, h: 600, classe: 'media', tempoBase: 120, color: 0x808080 },
    { name: 'FATIMA', x: 1000, y: 800, w: 600, h: 500, classe: 'media', tempoBase: 150, color: 0x707070 },
    { name: 'BENFICA', x: 600, y: 1400, w: 500, h: 500, classe: 'media', tempoBase: 150, color: 0x606060 },

    // PERIFERIA - Resposta lenta (exceto crimes patrimoniais)
    { name: 'MONTESE', x: 400, y: 2400, w: 600, h: 500, classe: 'periferia', tempoBase: 300, color: 0x8b4513 },
    { name: 'MESSEJANA', x: 800, y: 3200, w: 700, h: 600, classe: 'periferia', tempoBase: 360, color: 0x7a3d10 },
    { name: 'BOM JARDIM', x: 200, y: 3000, w: 500, h: 500, classe: 'periferia', tempoBase: 400, color: 0x6b340e },
    { name: 'PIRAMBU', x: 1500, y: 200, w: 400, h: 300, classe: 'periferia', tempoBase: 350, color: 0x5c2b0c }
];

// ============================================================================
// ARMAS
// ============================================================================
SV.Config.WEAPONS = {
    fists:   { id: 0, name: 'PUNHOS',   dmg: 15, range: 40,  rate: 20, ammo: Infinity, melee: true },
    knife:   { id: 1, name: 'FACA',     dmg: 40, range: 50,  rate: 10, ammo: Infinity, melee: true },
    pistol:  { id: 2, name: 'PISTOLA',  dmg: 25, range: 500, rate: 12, ammo: 12, max: 99 },
    uzi:     { id: 3, name: 'UZI',      dmg: 12, range: 350, rate: 3,  ammo: 30, max: 150, auto: true },
    shotgun: { id: 4, name: 'SHOTGUN',  dmg: 10, range: 200, rate: 25, ammo: 8,  max: 32, pellets: 6 },
    rifle:   { id: 5, name: 'RIFLE',    dmg: 60, range: 800, rate: 40, ammo: 5,  max: 30 },
    molotov: { id: 6, name: 'MOLOTOV',  dmg: 30, range: 300, rate: 60, ammo: 3,  max: 10, explosive: true },
    grenade: { id: 7, name: 'GRANADA',  dmg: 80, range: 400, rate: 90, ammo: 1,  max: 5,  explosive: true }
};

// ============================================================================
// VEICULOS
// ============================================================================
SV.Config.VEHICLES = {
    sedan:     { name: 'SEDAN',     maxSpeed: 9,  accel: 0.25, handling: 0.045, health: 100, color: 0x333333 },
    sport:     { name: 'ESPORTIVO', maxSpeed: 12, accel: 0.4,  handling: 0.05,  health: 80,  color: 0xff0000 },
    truck:     { name: 'CAMINHAO',  maxSpeed: 6,  accel: 0.15, handling: 0.03,  health: 200, color: 0x0000aa },
    taxi:      { name: 'TAXI',      maxSpeed: 8,  accel: 0.25, handling: 0.045, health: 100, color: 0xffff00 },
    police:    { name: 'VIATURA',   maxSpeed: 10, accel: 0.35, handling: 0.05,  health: 150, color: 0x0000ff },
    motorcycle:{ name: 'MOTO',      maxSpeed: 11, accel: 0.5,  handling: 0.07,  health: 50,  color: 0x222222 },
    bus:       { name: 'ONIBUS',    maxSpeed: 5,  accel: 0.1,  handling: 0.02,  health: 250, color: 0x00aa00 },
    ambulance: { name: 'AMBULANCIA',maxSpeed: 9,  accel: 0.3,  handling: 0.04,  health: 120, color: 0xffffff }
};

// ============================================================================
// CONSTANTES DO JOGO
// ============================================================================
SV.Config.WORLD = {
    WIDTH: 4096,
    HEIGHT: 4096,
    BLOCK_SIZE: 64,
    PHYSICS_SCALE: 10
};

SV.Config.PLAYER = {
    MAX_HEALTH: 100,
    MAX_ARMOR: 100,
    WALK_SPEED: 150,
    RUN_SPEED: 300,
    ROTATION_SPEED: 0.08
};

SV.Config.WANTED = {
    MAX_LEVEL: 6,
    DECAY_TIME: 30,  // segundos para decair 1 estrela
    CRIME_PATRIMONIO: 'patrimonio',
    CRIME_VIDA: 'vida'
};

// ============================================================================
// LOJAS
// ============================================================================
SV.Config.SHOPS = [
    { type: 'ammu',   name: 'ARMAMENTOS NORDESTE', x: 2500, y: 1600 },
    { type: 'health', name: 'FARMACIA PAGUE MENOS', x: 2200, y: 1200 },
    { type: 'garage', name: 'OFICINA DO ZE', x: 1600, y: 2800 }
];

// ============================================================================
// SAFE HOUSES
// ============================================================================
SV.Config.SAFE_HOUSES = [
    { name: 'BARRACO (Montese)', x: 500, y: 2500, unlocked: true, price: 0 },
    { name: 'APARTAMENTO (Centro)', x: 1400, y: 2000, unlocked: false, price: 5000 },
    { name: 'COBERTURA (Meireles)', x: 3100, y: 700, unlocked: false, price: 25000 }
];

// ============================================================================
// GANGUES
// ============================================================================
SV.Config.GANGS = [
    { id: 'cdl', name: 'Comando da Liberdade', color: 0xff0000, hostile: false },
    { id: 'gdl', name: 'Guardioes da Liberdade', color: 0x00ff00, hostile: true },
    { id: 'cv',  name: 'Comando Vermelho', color: 0x0000ff, hostile: true }
];
