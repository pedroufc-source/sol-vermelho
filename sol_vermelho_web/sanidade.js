// ===== SISTEMA DE SAÚDE MENTAL / CAPS =====
// Raio tenta ser atendido no CAPS mas o sistema só atende 2 por dia

const CAPS = {
    x: 1400,        // Centro de Fortaleza
    y: 2000,
    radius: 60,
    filaDia: 2,     // Só atendem 2 pessoas por dia
    atendidosHoje: 0
};

// Limites para efeitos de sanidade baixa
const SANIDADE_EFEITOS = {
    tremor: 70,     // Abaixo: câmera treme
    visao: 50,      // Abaixo: vinheta vermelha
    vozes: 30,      // Abaixo: pensamentos intrusivos
    colapso: 10     // Abaixo: blackouts
};

// Pensamentos que aparecem com sanidade baixa
const PENSAMENTOS = [
    'A greve... os cassetetes...',
    'Minha mae nem sabe onde eu to.',
    'Isso nao era pra ser assim.',
    'So mais um servicinho.',
    '...',
    'O sangue nao sai da mao.',
    'Amanha eu paro.',
    'Nao consigo dormir.',
    'Cicero disse que ia ser facil.',
    'Sera que ela ainda pensa em mim?'
];

// Chamado quando o player mata alguém
function onKillSanidade() {
    // Primeiros kills pesam mais (dessensibilização)
    const perda = G.kills < 10 ? (5 + Math.random() * 5) : (1 + Math.random() * 2);
    G.sanidade = Math.max(0, G.sanidade - perda);
    G.ultimoKill = G.time;
}

// Atualiza sanidade a cada frame
function updateSanidade() {
    // Recupera lentamente se não matar ninguém por um tempo
    if (G.time - G.ultimoKill > 600 && G.sanidade < 100) {
        G.sanidade = Math.min(100, G.sanidade + 0.005);
    }

    // Pensamentos intrusivos com sanidade baixa
    if (G.sanidade < SANIDADE_EFEITOS.vozes && Math.random() < 0.001) {
        const pensamento = PENSAMENTOS[Math.floor(Math.random() * PENSAMENTOS.length)];
        showMsg(pensamento);
    }
}

// Verifica interação com o CAPS
function checkCAPS() {
    if (!G.player || G.mission) return; // Não funciona durante missão

    const dist = Math.hypot(G.player.x - CAPS.x, G.player.y - CAPS.y);

    // Chegou no CAPS
    if (dist < CAPS.radius && G.capsFilaTimer === 0) {
        G.capsVisitas++;

        if (CAPS.atendidosHoje >= CAPS.filaDia) {
            // Sem vaga - mandado embora
            G.capsRecusado++;
            const msgs = [
                'CAPS: "So atendemos 2 por dia. Volta amanha."',
                'CAPS: "A fila ja fechou. Tenta na segunda."',
                'CAPS: "Nao tem vaga. Procura a UPA."',
                'CAPS: "O doutor ja foi embora."',
                'CAPS: "Voce nao ta na lista."',
                'CAPS: "Sistema fora do ar. Volta depois."'
            ];
            showMsg(msgs[Math.min(G.capsRecusado - 1, msgs.length - 1)]);

            // Empurra o player pra fora
            const ang = Math.atan2(G.player.y - CAPS.y, G.player.x - CAPS.x);
            G.player.x += Math.cos(ang) * 100;
            G.player.y += Math.sin(ang) * 100;
        } else {
            // Entra na fila
            G.capsFilaTimer = 300; // 5 segundos de espera
            showMsg('Aguardando atendimento...');
        }
    }

    // Processando fila
    if (G.capsFilaTimer > 0) {
        G.capsFilaTimer--;

        // Saiu da área = desistiu
        if (dist > CAPS.radius + 50) {
            G.capsFilaTimer = 0;
            showMsg('Desistiu da fila.');
            return;
        }

        // Mensagens de espera
        if (G.capsFilaTimer === 200) showMsg('Ainda aguardando...');
        if (G.capsFilaTimer === 100) showMsg('Ja vai ser chamado...');

        // Fim da espera
        if (G.capsFilaTimer === 1) {
            // Chance aumenta a cada tentativa (persistência)
            const chance = Math.min(0.6, 0.1 + G.capsVisitas * 0.1);

            if (Math.random() < chance) {
                // FOI ATENDIDO
                CAPS.atendidosHoje++;
                G.capsAtendido = true;
                G.sanidade = Math.min(100, G.sanidade + 25);
                showMsg('Atendimento realizado. Volta em 15 dias.');
            } else {
                // Mandaram embora de novo
                G.capsRecusado++;
                const desculpas = [
                    '"Seu caso nao e urgente."',
                    '"Precisa de encaminhamento do posto."',
                    '"O sistema caiu."',
                    '"Falta documento."',
                    '"Vai ter que remarcar."',
                    '"O medico teve uma emergencia."'
                ];
                showMsg('CAPS: ' + desculpas[Math.floor(Math.random() * desculpas.length)]);
            }
        }
    }
}

// Aplica efeitos visuais de sanidade baixa
function aplicarEfeitosSanidade() {
    if (!G.player || G.sanidade >= SANIDADE_EFEITOS.tremor) return;

    // Tremor na câmera
    const tremor = (SANIDADE_EFEITOS.tremor - G.sanidade) / 70;
    G.cam.x += (Math.random() - 0.5) * tremor * 4;
    G.cam.y += (Math.random() - 0.5) * tremor * 4;

    // Vinheta vermelha pulsante
    if (G.sanidade < SANIDADE_EFEITOS.visao) {
        const intensidade = (SANIDADE_EFEITOS.visao - G.sanidade) / 50;
        const pulso = 0.12 + Math.sin(G.time * 0.08) * 0.08;
        ctx.fillStyle = `rgba(30, 0, 0, ${pulso * intensidade})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Blackout momentâneo (sanidade crítica)
    if (G.sanidade < SANIDADE_EFEITOS.colapso && Math.random() < 0.003) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// Desenha o CAPS no mapa
function drawCAPS() {
    const px = CAPS.x - G.cam.x;
    const py = CAPS.y - G.cam.y;

    // Só desenha se estiver na tela
    if (px < -100 || px > 900 || py < -100 || py > 700) return;

    // Prédio do CAPS
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(px - 40, py - 30, 80, 60);

    // Telhado
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.moveTo(px - 45, py - 30);
    ctx.lineTo(px, py - 50);
    ctx.lineTo(px + 45, py - 30);
    ctx.fill();

    // Cruz verde (saúde)
    ctx.fillStyle = '#0a0';
    ctx.fillRect(px - 3, py - 20, 6, 20);
    ctx.fillRect(px - 10, py - 13, 20, 6);

    // Placa
    ctx.fillStyle = '#fff';
    ctx.fillRect(px - 25, py + 35, 50, 15);
    ctx.fillStyle = '#000';
    ctx.font = '8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CAPS', px, py + 45);

    // Indicador de fila (se tiver gente esperando)
    if (G.capsFilaTimer > 0) {
        ctx.fillStyle = '#ff0';
        ctx.beginPath();
        ctx.arc(px, py - 60, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = 'bold 10px Arial';
        ctx.fillText('!', px, py - 57);
    }
}
