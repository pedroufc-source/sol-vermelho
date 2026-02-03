/**
 * SOL VERMELHO - Game State
 * Estado global e loop principal do jogo
 */

// Estado global do jogo
const G = {
    running: false,
    paused: false,
    cam: { x: 0, y: 0 },
    keys: {},
    mouse: { x: 0, y: 0, down: false, wx: 0, wy: 0 },
    player: null,
    vehicles: [],
    peds: [],
    cops: [],
    policeVehicles: [],
    bullets: [],
    particles: [],
    pickups: [],
    targets: [],
    wanted: 0,
    wantedTimer: 0,
    money: 0,
    score: 0,
    kills: 0,
    msgTimer: 0,
    msgPersist: false,
    time: 0,
    mission: null,
    missionIdx: 0,

    // Sistema de sanidade (oculto do jogador)
    sanidade: 100,
    capsVisitas: 0,
    capsAtendido: false,
    capsFilaTimer: 0,
    capsRecusado: 0,
    ultimoKill: 0
};

// Assets do jogo
const assets = {
    sprites: null,
    tiles: null,
    spriteData: null,
    satellite: null,
    loaded: false
};

// Fila de spawn de polícia com delay
let policeSpawnQueue = [];

/**
 * Inicializa o jogo
 */
function init() {
    G.player = new Player(CONFIG.WORLD_W / 2, CONFIG.WORLD_H / 2);
    spawnWorld();
    updateUI();
    requestAnimationFrame(gameLoop);
}

/**
 * Loop principal
 */
function gameLoop() {
    if (G.running && !G.paused) {
        update();
        render();
    }
    requestAnimationFrame(gameLoop);
}

/**
 * Atualização lógica
 */
function update() {
    G.time++;

    // Atualiza entidades
    G.player.update();

    for (const v of G.vehicles) v.update();
    for (const ped of G.peds) ped.update();
    for (const cop of G.cops) cop.update();
    for (const t of G.targets) t.update();
    for (const b of G.bullets) b.update();
    for (const p of G.pickups) p.update();

    // Remove balas mortas
    G.bullets = G.bullets.filter(b => b.life > 0);

    // Atualiza partículas
    updateParticles();

    // Processa fila de spawn de polícia
    processPoliceQueue();

    // Atualiza wanted
    updateWanted();

    // Verifica missão
    checkMission();

    // Atualiza sistema de sanidade
    if (typeof updateSanidade === 'function') {
        updateSanidade();
    }

    // Câmera segue jogador
    G.cam.x = G.player.x - CONFIG.CANVAS_W / 2;
    G.cam.y = G.player.y - CONFIG.CANVAS_H / 2;

    // Atualiza posição do mouse no mundo
    G.mouse.wx = G.mouse.x + G.cam.x;
    G.mouse.wy = G.mouse.y + G.cam.y;

    // Timer de mensagem
    if (G.msgTimer > 0 && !G.msgPersist) {
        G.msgTimer--;
        if (G.msgTimer <= 0) {
            document.getElementById('message').style.opacity = 0;
        }
    }
}

/**
 * Renderização
 */
function render() {
    // Limpa canvas
    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);

    // Desenha mapa
    if (typeof drawMaquete === 'function') {
        drawMaquete();
    }

    // Desenha partículas de fundo (skid marks)
    for (const p of G.particles) {
        if (p.type === 'skid') drawParticle(p);
    }

    // Desenha pickups
    for (const p of G.pickups) p.draw();

    // Desenha veículos
    for (const v of G.vehicles) v.draw();

    // Desenha pedestres
    for (const ped of G.peds) ped.draw();

    // Desenha policiais
    for (const cop of G.cops) cop.draw();

    // Desenha alvos
    for (const t of G.targets) t.draw();

    // Desenha jogador
    G.player.draw();

    // Desenha balas
    for (const b of G.bullets) b.draw();

    // Desenha partículas de frente
    for (const p of G.particles) {
        if (p.type !== 'skid') drawParticle(p);
    }

    // Desenha indicadores de missão
    if (G.mission && G.mission.phases && !G.mission.briefing) {
        drawMissionIndicator();
    }

    // Atualiza velocímetro
    if (G.player.inVehicle) {
        document.getElementById('speed').textContent =
            Math.floor(Math.abs(G.player.inVehicle.speed) * 10) + ' km/h';
    }

    // Desenha minimapa
    drawMinimap();
}

/**
 * Desenha partícula individual
 */
function drawParticle(p) {
    const alpha = p.life / p.maxLife;
    const px = p.x - G.cam.x;
    const py = p.y - G.cam.y;

    if (p.type === 'skid') {
        ctx.fillStyle = `rgba(30, 30, 30, ${alpha * 0.3})`;
        ctx.fillRect(px - p.size / 2, py - p.size / 2, p.size, p.size);
    } else if (p.type === 'smoke') {
        ctx.fillStyle = `rgba(80, 80, 80, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(px, py, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

/**
 * Desenha indicador de objetivo da missão
 */
function drawMissionIndicator() {
    const phase = G.mission.phases[G.mission.phase];
    if (!phase || !phase.x) return;

    const px = phase.x - G.cam.x;
    const py = phase.y - G.cam.y;

    // Círculo amarelo pulsante
    ctx.strokeStyle = `rgba(255, 255, 0, ${0.5 + Math.sin(G.time * 0.1) * 0.3})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(px, py, phase.radius || 50, 0, Math.PI * 2);
    ctx.stroke();

    // Seta apontando se fora da tela
    if (px < 0 || px > CONFIG.CANVAS_W || py < 0 || py > CONFIG.CANVAS_H) {
        const ang = Math.atan2(phase.y - G.player.y, phase.x - G.player.x);
        const arrowX = CONFIG.CANVAS_W / 2 + Math.cos(ang) * 150;
        const arrowY = CONFIG.CANVAS_H / 2 + Math.sin(ang) * 150;

        ctx.fillStyle = '#ff0';
        ctx.save();
        ctx.translate(arrowX, arrowY);
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(-10, -8);
        ctx.lineTo(-10, 8);
        ctx.fill();
        ctx.restore();
    }
}

/**
 * Desenha minimapa
 */
function drawMinimap() {
    const scale = 120 / CONFIG.WORLD_W;

    minimapCtx.fillStyle = '#222';
    minimapCtx.fillRect(0, 0, 120, 120);

    // Mar
    minimapCtx.fillStyle = '#369';
    minimapCtx.fillRect(90, 0, 30, 120);

    // Zonas
    for (const z of ZONAS) {
        minimapCtx.fillStyle = z.classe === 'alta' ? '#484' : z.classe === 'media' ? '#664' : '#644';
        minimapCtx.fillRect(z.x * scale, z.y * scale, z.w * scale, z.h * scale);
    }

    // Jogador (verde)
    minimapCtx.fillStyle = '#0f0';
    minimapCtx.beginPath();
    minimapCtx.arc(G.player.x * scale, G.player.y * scale, 3, 0, Math.PI * 2);
    minimapCtx.fill();

    // Objetivo da missão (amarelo)
    if (G.mission && G.mission.phases && G.mission.phases[G.mission.phase]) {
        const p = G.mission.phases[G.mission.phase];
        if (p.x) {
            minimapCtx.fillStyle = '#ff0';
            minimapCtx.beginPath();
            minimapCtx.arc(p.x * scale, p.y * scale, 4, 0, Math.PI * 2);
            minimapCtx.fill();
        }
    }

    // Policiais (azul)
    minimapCtx.fillStyle = '#00f';
    for (const cop of G.cops) {
        minimapCtx.beginPath();
        minimapCtx.arc(cop.x * scale, cop.y * scale, 2, 0, Math.PI * 2);
        minimapCtx.fill();
    }
}

/**
 * Popula o mundo com entidades iniciais
 */
function spawnWorld() {
    const types = ['sedan', 'sport', 'taxi', 'truck'];

    // Carro inicial perto do player
    const startCar = new Vehicle(CONFIG.WORLD_W / 2 + 60, CONFIG.WORLD_H / 2, 'sport');
    startCar.rot = 0;
    G.vehicles.push(startCar);

    // Outros carros
    for (let i = 0; i < 25; i++) {
        G.vehicles.push(new Vehicle(
            200 + Math.random() * (CONFIG.WORLD_W - 800),
            200 + Math.random() * (CONFIG.WORLD_H - 400),
            types[Math.floor(Math.random() * types.length)]
        ));
    }

    // Viatura de polícia
    G.vehicles.push(new Vehicle(CONFIG.WORLD_W / 2 + 200, CONFIG.WORLD_H / 2 + 200, 'police'));

    // Pedestres
    for (let i = 0; i < 50; i++) {
        G.peds.push(new Ped(
            800 + Math.random() * 2500,
            400 + Math.random() * 3000
        ));
    }

    // Pickups
    const pickupTypes = ['health', 'armor', 'money', 'pistol', 'uzi', 'shotgun'];
    for (let i = 0; i < 30; i++) {
        G.pickups.push(new Pickup(
            100 + Math.random() * (CONFIG.WORLD_W - 800),
            100 + Math.random() * (CONFIG.WORLD_H - 200),
            pickupTypes[Math.floor(Math.random() * pickupTypes.length)]
        ));
    }
}
