/**
 * SOL VERMELHO - Wanted System
 * Sistema de procurado/polícia
 */

/**
 * Aumenta nível de procurado
 */
function increaseWanted(amt, tipoCrime = CRIME_TYPES.patrimonio, localX = null, localY = null) {
    G.wanted = Math.min(6, G.wanted + amt);
    G.wantedTimer = CONFIG.WANTED_DECAY_TIME;
    updateUI();

    // Usa posição do player se não especificada
    const x = localX ?? G.player.x;
    const y = localY ?? G.player.y;
    const zona = getZona(x, y);
    const delay = calcularTempoResposta(tipoCrime, zona);

    // Debug
    console.log(`Crime (${tipoCrime}) em ${zona.name} [${zona.classe}] - Resposta em ${delay > 0 ? Math.round(delay / 60) + 's' : 'NUNCA'}`);

    if (delay < 0) {
        // Polícia não vem - periferia sendo ignorada
        showMsg('...');
        return;
    }

    // Adiciona na fila com delay
    policeSpawnQueue.push({ delay: delay, amount: amt * 2 });
}

/**
 * Atualiza timer de wanted
 */
function updateWanted() {
    if (G.wanted > 0) {
        G.wantedTimer--;
        if (G.wantedTimer <= 0) {
            G.wanted = Math.max(0, G.wanted - 1);
            G.wantedTimer = CONFIG.WANTED_DECAY_TIME;
            updateUI();
        }
    }
}

/**
 * Processa fila de spawn de polícia
 */
function processPoliceQueue() {
    for (let i = policeSpawnQueue.length - 1; i >= 0; i--) {
        policeSpawnQueue[i].delay--;
        if (policeSpawnQueue[i].delay <= 0) {
            const item = policeSpawnQueue.splice(i, 1)[0];
            actuallySpawnCops(item.amount);
        }
    }
}

/**
 * Spawna policiais (chamado quando delay acaba)
 */
function actuallySpawnCops(amount) {
    for (let i = 0; i < amount; i++) {
        const ang = Math.random() * Math.PI * 2;
        const dist = 350 + Math.random() * 150;
        const x = G.player.x + Math.cos(ang) * dist;
        const y = G.player.y + Math.sin(ang) * dist;

        if (x > 0 && x < CONFIG.WORLD_W && y > 0 && y < CONFIG.WORLD_H) {
            G.cops.push(new Cop(x, y));
        }
    }
}

/**
 * Mantém número de policiais baseado no wanted
 */
function spawnCops() {
    const target = G.wanted * 2;
    while (G.cops.length < target) {
        const ang = Math.random() * Math.PI * 2;
        const dist = 350 + Math.random() * 150;
        const x = G.player.x + Math.cos(ang) * dist;
        const y = G.player.y + Math.sin(ang) * dist;

        if (x > 0 && x < CONFIG.WORLD_W && y > 0 && y < CONFIG.WORLD_H) {
            G.cops.push(new Cop(x, y));
        }
    }
}
