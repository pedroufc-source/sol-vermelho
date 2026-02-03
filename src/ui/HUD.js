/**
 * SOL VERMELHO - HUD & UI
 * Interface do usuário e elementos visuais
 */

// Referências do canvas
let canvas, ctx, minimapCanvas, minimapCtx;

/**
 * Inicializa elementos do canvas
 */
function initCanvas() {
    canvas = document.getElementById('game');
    ctx = canvas.getContext('2d');
    minimapCanvas = document.getElementById('minimap');
    minimapCtx = minimapCanvas.getContext('2d');

    ctx.imageSmoothingEnabled = false;
    minimapCtx.imageSmoothingEnabled = false;
}

/**
 * Atualiza elementos da HUD
 */
function updateUI() {
    if (!G.player) return;

    // Barras de vida e armadura
    document.getElementById('health-fill').style.width = G.player.health + '%';
    document.getElementById('armor-fill').style.width = G.player.armor + '%';

    // Estrelas de procurado
    let stars = '';
    for (let i = 0; i < 6; i++) {
        stars += i < G.wanted ? '★' : '☆';
    }
    document.getElementById('wanted').textContent = stars;

    // Dinheiro e score
    document.getElementById('money').textContent = '$' + G.money.toLocaleString();
    document.getElementById('score').textContent = G.score.toLocaleString();

    // Arma atual
    const w = G.player.weapon;
    const wid = G.player.weaponId;
    document.getElementById('weapon').textContent =
        w.name + (wid !== 'fists' ? ' [' + (G.player.ammo[wid] || 0) + ']' : '');

    // Indicador de zona
    const zona = getZona(G.player.x, G.player.y);
    const zonaEl = document.getElementById('zona');
    zonaEl.textContent = zona.name;

    // Cor baseada na classe social
    if (zona.classe === 'alta') {
        zonaEl.style.color = '#8f8';
    } else if (zona.classe === 'media') {
        zonaEl.style.color = '#ff8';
    } else {
        zonaEl.style.color = '#f88';
    }
}

/**
 * Mostra mensagem na tela
 */
function showMsg(text, persist = false) {
    const el = document.getElementById('message');
    el.textContent = text + (persist ? '\n[CLIQUE PARA CONTINUAR]' : '');
    el.style.opacity = 1;
    G.msgTimer = persist ? 999999 : 150;
    G.msgPersist = persist;
}

/**
 * Fecha mensagem persistente
 */
function dismissMsg() {
    if (G.msgPersist) {
        document.getElementById('message').style.opacity = 0;
        G.msgPersist = false;
        G.msgTimer = 0;
        endBriefing();
    }
}

/**
 * Mostra indicador de save
 */
function showSaveIndicator() {
    const indicator = document.getElementById('save-indicator');
    indicator.style.opacity = '1';
    setTimeout(() => { indicator.style.opacity = '0'; }, 2000);
}

// ===== SISTEMA DE PAUSA =====

function togglePause() {
    if (!G.running) return;
    G.paused = !G.paused;
    document.getElementById('pause-menu').style.display = G.paused ? 'flex' : 'none';
}

function resumeGame() {
    G.paused = false;
    document.getElementById('pause-menu').style.display = 'none';
}

function quitToMenu() {
    G.running = false;
    G.paused = false;
    document.getElementById('pause-menu').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';
    checkSaveOnLoad();
}

// ===== TELA DE MORTE =====

function respawn() {
    G.player.health = 100;
    G.player.x = CONFIG.WORLD_W / 2;
    G.player.y = CONFIG.WORLD_H / 2;
    G.wanted = Math.max(0, G.wanted - 2);
    G.money = Math.floor(G.money * 0.9); // Perde 10%
    G.paused = false;
    document.getElementById('death-screen').style.display = 'none';
    updateUI();
}
