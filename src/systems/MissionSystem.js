/**
 * SOL VERMELHO - Mission System
 * Sistema de missões do jogo
 */

// Array de missões carregado dos JSONs
let MISSIONS = [];

/**
 * Carrega missões dos arquivos JSON
 */
async function loadMissions() {
    try {
        const ch1 = await fetch('src/data/missions/chapter1.json').then(r => r.json());
        const ch2 = await fetch('src/data/missions/chapter2.json').then(r => r.json());

        MISSIONS = [...ch1.missions, ...ch2.missions];
        console.log('Missões carregadas:', MISSIONS.length);
    } catch (e) {
        console.warn('Erro ao carregar missões, usando fallback:', e);
        // Fallback com missões inline se o JSON falhar
        MISSIONS = getMissionsFallback();
    }
}

/**
 * Inicia uma missão
 */
function startMission(idx) {
    if (idx >= MISSIONS.length) {
        showMsg('PARABENS!\nVoce completou todas as missoes disponiveis.\nContinue explorando Fortaleza...', true);
        G.mission = null;
        return;
    }

    // Mensagens de transição de capítulo
    if (idx === 6) {
        showMsg('CAPITULO 2: CENTRO DE FORTALEZA\n\nA DHPP abriu inquerito. O RAIO esta rondando.\nA Tropa manda voce sumir. Procure Tio Lau.', true);
    }

    const m = MISSIONS[idx];
    G.mission = { ...m, phase: 0, progress: 0, timer: 0, briefing: true };
    G.missionIdx = idx;

    // Toca diálogo de início da missão se existir
    const dialogKey = 'mission_' + idx + '_start';
    if (typeof playDialog === 'function' && typeof DIALOGS !== 'undefined' && DIALOGS[dialogKey]) {
        playDialog(dialogKey, () => {
            showMsg(m.title + '\n' + m.desc, true);
        });
    } else {
        showMsg(m.title + '\n' + m.desc, true);
    }

    // Atualiza HUD de missão
    document.getElementById('mission-hud').style.display = 'block';
    document.getElementById('mission-hud').textContent = m.title;
}

/**
 * Termina o briefing e inicia a primeira fase
 */
function endBriefing() {
    if (G.mission?.briefing) {
        G.mission.briefing = false;
        const p = G.mission.phases[0];
        if (p.wanted) {
            increaseWanted(p.wanted);
        }
        showMsg(p.desc);
    }
}

/**
 * Inicia uma fase específica
 */
function startPhase(phaseIdx) {
    if (!G.mission || phaseIdx >= G.mission.phases.length) {
        completeMission();
        return;
    }

    G.mission.phase = phaseIdx;
    G.mission.progress = 0;
    G.mission.timer = 0;

    const p = G.mission.phases[phaseIdx];

    // Verifica se tem diálogo pra essa fase
    const dialogKey = 'mission_' + G.missionIdx + '_phase_' + phaseIdx;
    const hasDialog = typeof playDialog === 'function' && typeof DIALOGS !== 'undefined' && DIALOGS[dialogKey];

    if (hasDialog) {
        playDialog(dialogKey, () => {
            showMsg(p.desc);
            if (p.wanted) increaseWanted(p.wanted);
        });
    } else {
        showMsg(p.desc);
        if (p.wanted) {
            increaseWanted(p.wanted);
            showMsg('⚠ PROCURADO! ' + p.desc);
        }
    }

    // Spawna alvos para missões de kill
    if (p.type === 'kill') {
        spawnMissionTargets(p);
    }
}

/**
 * Spawna alvos de missão
 */
function spawnMissionTargets(phase) {
    G.targets = [];
    const names = ['CAPANGA', 'TRAFICANTE', 'SOLDADO', 'PISTOLEIRO'];

    for (let i = 0; i < phase.target; i++) {
        const ang = Math.random() * Math.PI * 2;
        const dist = 100 + Math.random() * 100;
        const tx = (phase.x || G.player.x) + Math.cos(ang) * dist;
        const ty = (phase.y || G.player.y) + Math.sin(ang) * dist;
        G.targets.push(new Target(tx, ty, names[i % names.length]));
    }

    showMsg(phase.desc + '\n' + phase.target + ' alvos marcados!');
}

/**
 * Verifica progresso da missão atual
 */
function checkMission() {
    if (!G.mission || !G.mission.phases) return;

    const p = G.mission.phases[G.mission.phase];
    if (!p) return;

    if (p.type === 'goto' || p.type === 'flee') {
        const dist = Math.hypot(G.player.x - p.x, G.player.y - p.y);
        if (dist < p.radius) {
            advancePhase();
        }
    } else if (p.type === 'wait') {
        G.mission.timer++;
        if (G.mission.timer >= p.time) {
            advancePhase();
        }
    }
    // kill e carnage são tratados em onKill() e onVehicleDestroy()
}

/**
 * Avança para próxima fase
 */
function advancePhase() {
    if (!G.mission) return;

    const nextPhase = G.mission.phase + 1;
    if (nextPhase >= G.mission.phases.length) {
        completeMission();
    } else {
        startPhase(nextPhase);
    }
}

/**
 * Completa a missão atual
 */
function completeMission() {
    if (!G.mission) return;

    G.money += G.mission.reward;
    G.score += G.mission.reward;
    updateUI();

    const nextIdx = G.missionIdx + 1;
    G.missionIdx = nextIdx;
    saveGame(); // Autosave

    const dialogKey = 'mission_' + (nextIdx - 1) + '_complete';
    const hasDialog = typeof playDialog === 'function' && typeof DIALOGS !== 'undefined' && DIALOGS[dialogKey];

    G.mission = null;
    G.wanted = Math.max(0, G.wanted - 1);

    if (hasDialog) {
        playDialog(dialogKey, () => {
            showMsg('MISSAO COMPLETA!\n+$' + G.money, true);
            setTimeout(() => startMission(nextIdx), 3000);
        });
    } else {
        showMsg('MISSAO COMPLETA!\n+$' + G.money, true);
        setTimeout(() => startMission(nextIdx), 3000);
    }
}

/**
 * Callback quando mata alguém
 */
function onKill(isTarget = false) {
    // Afeta sanidade
    if (typeof onKillSanidade === 'function') onKillSanidade();

    if (!G.mission?.phases) return;

    const p = G.mission.phases[G.mission.phase];
    if (p?.type === 'kill' && isTarget) {
        G.mission.progress++;
        if (G.mission.progress >= p.target) {
            showMsg('TODOS ELIMINADOS!');
            setTimeout(() => advancePhase(), 1000);
        } else {
            showMsg(G.mission.progress + '/' + p.target + ' eliminados');
        }
    }
}

/**
 * Callback quando destrói veículo
 */
function onVehicleDestroy() {
    if (!G.mission?.phases) return;

    const p = G.mission.phases[G.mission.phase];
    if (p?.type === 'carnage') {
        G.mission.progress++;
        if (G.mission.progress >= p.target) {
            advancePhase();
        } else {
            showMsg(G.mission.progress + '/' + p.target + ' veiculos');
        }
    }
}

/**
 * Missões fallback (caso o JSON não carregue)
 */
function getMissionsFallback() {
    return [
        {
            type: 'getaway',
            title: 'O SERVICINHO',
            desc: 'Cicero: "Raio, preciso de um motorista. R$500, sem perguntas."',
            phases: [
                { type: 'goto', desc: 'Va ate o ponto de encontro', x: 2600, y: 1400, radius: 60 },
                { type: 'wait', desc: 'Esperando os rapazes...', time: 90 },
                { type: 'flee', desc: 'FUJA! Leve os caras pro esconderijo!', x: 800, y: 2600, radius: 80, wanted: 3 }
            ],
            reward: 500
        }
    ];
}
