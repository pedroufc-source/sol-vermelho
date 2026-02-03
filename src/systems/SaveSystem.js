/**
 * SOL VERMELHO - Save System
 * Sistema de salvar e carregar jogo
 */

/**
 * Salva o jogo no localStorage
 */
function saveGame() {
    if (!G.player) return;

    const saveData = {
        version: CONFIG.SAVE_VERSION,
        timestamp: Date.now(),
        money: G.money,
        score: G.score,
        kills: G.kills,
        missionIdx: G.missionIdx,
        wanted: G.wanted,
        player: {
            x: G.player.x,
            y: G.player.y,
            health: G.player.health,
            armor: G.player.armor,
            weapons: G.player.weapons,
            ammo: G.player.ammo
        }
    };

    try {
        localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(saveData));
        showSaveIndicator();
        console.log('Jogo salvo!', saveData);
    } catch (e) {
        console.error('Erro ao salvar:', e);
    }
}

/**
 * Carrega o jogo do localStorage
 */
function loadGame() {
    try {
        const data = localStorage.getItem(CONFIG.SAVE_KEY);
        if (!data) return null;
        return JSON.parse(data);
    } catch (e) {
        console.error('Erro ao carregar save:', e);
        return null;
    }
}

/**
 * Verifica se existe save
 */
function hasSaveGame() {
    return localStorage.getItem(CONFIG.SAVE_KEY) !== null;
}

/**
 * Deleta o save
 */
function deleteSave() {
    localStorage.removeItem(CONFIG.SAVE_KEY);
}

/**
 * Aplica dados do save ao jogo
 */
function applySaveData(saveData) {
    if (!saveData || !G.player) return;

    G.money = saveData.money || 0;
    G.score = saveData.score || 0;
    G.kills = saveData.kills || 0;
    G.missionIdx = saveData.missionIdx || 0;
    G.wanted = saveData.wanted || 0;

    if (saveData.player) {
        G.player.x = saveData.player.x || CONFIG.WORLD_W / 2;
        G.player.y = saveData.player.y || CONFIG.WORLD_H / 2;
        G.player.health = saveData.player.health || 100;
        G.player.armor = saveData.player.armor || 0;
        G.player.weapons = saveData.player.weapons || ['fists'];
        G.player.ammo = saveData.player.ammo || {};
    }

    updateUI();
}

/**
 * Carrega save e inicia jogo
 */
function loadAndStart() {
    const saveData = loadGame();
    if (saveData) {
        document.getElementById('start-screen').style.display = 'none';
        G.running = true;
        Audio.init();

        applySaveData(saveData);

        // Continua da missão salva
        if (G.missionIdx < MISSIONS.length) {
            G.mission = { ...MISSIONS[G.missionIdx], phase: 0, progress: 0, started: true };
            document.getElementById('mission-hud').style.display = 'block';
            document.getElementById('mission-hud').textContent = G.mission.title;
        }

        showMsg('Jogo carregado!');
    }
}

/**
 * Verifica se tem save e mostra botão continuar
 */
function checkSaveOnLoad() {
    if (hasSaveGame()) {
        document.getElementById('continue-btn').style.display = 'block';
    }
}
