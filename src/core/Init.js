/**
 * SOL VERMELHO - Inicialização
 * Setup inicial e event listeners
 */

// Intro do jogo
const INTRO_TEXTS = [
    "Fortaleza, Ceará. Fevereiro de 2003.",
    "A crise da construção civil destruiu tudo.\nPedreiro, carpinteiro, servente - todos na rua.",
    "Raimundo 'Raio' Silva. 28 anos.\nTrês meses de aluguel atrasado.\nMãe doente. Irmãos pra criar.",
    "Cícero, amigo de infância, apareceu com uma proposta:\n'Raio, preciso de um motorista. R$500, sem perguntas.'",
    "Ele não perguntou pra quê.\nDeveria ter perguntado.",
    "A Tropa Vermelha controla a Barra do Ceará.\nOs Guardiões do Sertão querem o território.\nE o RAIO da PM caça os dois.",
    "Nessa guerra, não existe neutralidade.\nCada rua tem dono. Cada esquina cobra pedágio.",
    "Raio só queria construir alguma coisa.\nAgora ele destrói."
];

let introIdx = 0;

/**
 * Confirma idade e inicia carregamento
 */
function confirmAge() {
    document.getElementById('age-warning').style.display = 'none';
    document.getElementById('loading').style.display = 'flex';
    loadAssets().then(() => {
        loadMissions();
        init();
    }).catch(err => {
        console.error('Assets error:', err);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('start-screen').style.display = 'flex';
        init();
    });
}

/**
 * Carrega assets do jogo
 */
async function loadAssets() {
    const fill = document.getElementById('loading-fill');

    try {
        fill.style.width = '20%';
        assets.sprites = await loadImage('assets/sprites/sprites_gta.png');

        fill.style.width = '40%';
        assets.tiles = await loadImage('assets/sprites/tiles_gta.png');

        fill.style.width = '60%';
        const resp = await fetch('assets/sprites/sprite_data.json');
        assets.spriteData = await resp.json();

        fill.style.width = '100%';
        assets.loaded = true;
        console.log('Assets carregados!');
    } catch (e) {
        console.log('Assets not found, using fallback:', e);
    }

    await new Promise(r => setTimeout(r, 300));
    document.getElementById('loading').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';
    checkSaveOnLoad();
}

/**
 * Helper para carregar imagem
 */
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

/**
 * Mostra tela de intro
 */
function showIntro() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('intro-screen').style.display = 'flex';
    introIdx = 0;
    document.getElementById('intro-text').innerHTML = `<p>${INTRO_TEXTS[0]}</p>`;
    document.getElementById('intro-btn').textContent = '...';
}

/**
 * Avança texto da intro
 */
function advanceIntro() {
    introIdx++;
    if (introIdx < INTRO_TEXTS.length) {
        const el = document.getElementById('intro-text');
        el.innerHTML += `<p style="margin-top:15px;">${INTRO_TEXTS[introIdx]}</p>`;
        el.scrollTop = el.scrollHeight;

        if (introIdx === INTRO_TEXTS.length - 1) {
            document.getElementById('intro-btn').textContent = 'COMEÇAR';
        }
    } else {
        startGame();
    }
}

/**
 * Inicia o jogo
 */
function startGame() {
    document.getElementById('intro-screen').style.display = 'none';
    G.running = true;
    Audio.init();
    startMission(0);
}

/**
 * Entra/sai de veículo
 */
function handleVehicle() {
    if (G.player.inVehicle) {
        const v = G.player.inVehicle;
        v.driver = null;
        G.player.inVehicle = null;
        G.player.x = v.x + 40;
        G.player.y = v.y;
        document.getElementById('speed').style.opacity = 0;
        showMsg('Saiu do veiculo');
    } else {
        for (const v of G.vehicles) {
            if (Math.hypot(v.x - G.player.x, v.y - G.player.y) < 50 && !v.driver) {
                v.driver = G.player;
                G.player.inVehicle = v;
                document.getElementById('speed').style.opacity = 1;
                showMsg('Entrou no veiculo');
                break;
            }
        }
    }
}

/**
 * Troca de arma
 */
function cycleWeapon() {
    G.player.curWeapon = (G.player.curWeapon + 1) % G.player.weapons.length;
    updateUI();
}

// ===== EVENT LISTENERS =====

document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
});

document.addEventListener('keydown', e => {
    G.keys[e.code] = true;

    if (e.code === 'KeyE') handleVehicle();
    if (e.code === 'KeyQ') cycleWeapon();
    if (e.code === 'Escape') togglePause();
});

document.addEventListener('keyup', e => {
    G.keys[e.code] = false;
});

document.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    G.mouse.x = e.clientX - rect.left;
    G.mouse.y = e.clientY - rect.top;
});

document.addEventListener('mousedown', e => {
    if (e.button === 0) {
        G.mouse.down = true;
        if (G.player && !G.player.inVehicle) {
            G.player.attack();
        }
        dismissMsg();
    }
});

document.addEventListener('mouseup', e => {
    if (e.button === 0) G.mouse.down = false;
});

// Previne menu de contexto
document.addEventListener('contextmenu', e => e.preventDefault());
