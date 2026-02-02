// ═══════════════════════════════════════════════════════════════
// SOL VERMELHO - HISTÓRIA E DIÁLOGOS
// A narrativa de Raimundo "Raio" Silva
// ═══════════════════════════════════════════════════════════════

const INTRO_PAGES = [
    {
        text: `<div style="color:#f33; font-size:16px; margin-bottom:15px;">PORTO DAS DUNAS, CEARÁ</div>
        <div style="color:#666; margin-bottom:20px;">Fevereiro de 2003</div>
        <p>A greve da construção civil já dura três meses.</p>
        <p style="margin-top:10px;">O Sindicato perdeu. As empreiteiras venceram. Os trabalhadores foram demitidos por "abandono de posto".</p>`,
        btn: 'CONTINUAR'
    },
    {
        text: `<p>Meu nome é <span style="color:#0f0">Raimundo Silva</span>.</p>
        <p style="margin-top:10px;">Todo mundo me chama de <span style="color:#f33; font-weight:bold;">RAIO</span>.</p>
        <p style="margin-top:10px; color:#666; font-style:italic;">Ganhei esse apelido na infância. Era o mais rápido do Bom Jardim.</p>
        <p style="margin-top:15px;">Irônico. Agora vou ser caçado por homens que carregam o mesmo nome.</p>`,
        btn: 'CONTINUAR'
    },
    {
        text: `<p>Três meses de aluguel atrasado. Geladeira vazia. Minha mãe doente.</p>
        <p style="margin-top:15px;">Ontem, Cícero apareceu. Amigo de infância. Crescemos juntos no Bom Jardim.</p>
        <p style="margin-top:15px; color:#fc0;">"Raio, tenho um servicinho. R$500. Só preciso de um motorista. Sem perguntas."</p>`,
        btn: 'CONTINUAR'
    },
    {
        text: `<p style="color:#888;">Eu sabia que não era entrega de pizza.</p>
        <p style="margin-top:10px;">Mas quando você tá desesperado, você não pergunta.</p>
        <p style="margin-top:10px;">Você só diz sim.</p>
        <p style="margin-top:20px; color:#f33; font-size:15px; text-align:center;">"Eu só queria construir alguma coisa.<br>Agora eu destruo."</p>`,
        btn: 'COMEÇAR'
    }
];

// ═══════════════════════════════════════════════════════════════
// DIÁLOGOS DAS MISSÕES
// ═══════════════════════════════════════════════════════════════

const DIALOGS = {
    // ─────────────────────────────────────────────────────────
    // MISSÃO 1 - O SERVICINHO
    // ─────────────────────────────────────────────────────────
    'mission_0_start': [
        { speaker: 'CÍCERO', color: '#fc0', text: 'Raio! Bom te ver, parceiro.' },
        { speaker: 'RAIO', color: '#0f0', text: 'Cícero. Qual é o trampo?' },
        { speaker: 'CÍCERO', color: '#fc0', text: 'Simples. Dirige até a Aldeota, espera uns caras, e leva pro esconderijo.' },
        { speaker: 'RAIO', color: '#0f0', text: 'Que caras?' },
        { speaker: 'CÍCERO', color: '#fc0', text: 'Sem perguntas, lembra? Pega o carro ali do lado. Vai.' }
    ],
    'mission_0_phase_1': [
        { speaker: 'RAIO', color: '#0f0', text: '...' },
        { speaker: 'RAIO', color: '#0f0', text: 'Pera. Isso é... um banco?' }
    ],
    'mission_0_phase_2': [
        { speaker: '???', color: '#f44', text: 'ENTRA ENTRA ENTRA!' },
        { speaker: 'CÍCERO', color: '#fc0', text: 'VAI RAIO! PISA NESSA MERDA!' },
        { speaker: 'RAIO', color: '#0f0', text: 'CARALHO CÍCERO! ASSALTO?!' },
        { speaker: 'CÍCERO', color: '#fc0', text: 'MENOS CONVERSA! MAIS GÁS!' }
    ],
    'mission_0_complete': [
        { speaker: 'CÍCERO', color: '#fc0', text: 'Bem-vindo ao time, Raio.' },
        { speaker: 'RAIO', color: '#0f0', text: 'Você me fodeu, Cícero.' },
        { speaker: 'CÍCERO', color: '#fc0', text: 'Te dei uma oportunidade. O Bubba quer te conhecer.' },
        { speaker: 'RAIO', color: '#0f0', text: 'Quem é Bubba?' },
        { speaker: 'CÍCERO', color: '#fc0', text: 'Você vai descobrir.' }
    ],

    // ─────────────────────────────────────────────────────────
    // MISSÃO 2 - ENTREGA ESPECIAL
    // ─────────────────────────────────────────────────────────
    'mission_1_start': [
        { speaker: 'BUBBA', color: '#f80', text: 'Então você é o Raio.' },
        { speaker: 'RAIO', color: '#0f0', text: 'Quem pergunta?' },
        { speaker: 'BUBBA', color: '#f80', text: 'Bubba Serafim. Comando do Litoral.' },
        { speaker: 'BUBBA', color: '#f80', text: 'Cícero falou bem de você. Que você é rápido.' },
        { speaker: 'RAIO', color: '#0f0', text: 'O que você quer?' },
        { speaker: 'BUBBA', color: '#f80', text: 'Tenho um pacote. Leva pro Beach Park. Não abre.' },
        { speaker: 'RAIO', color: '#0f0', text: 'O que tem dentro?' },
        { speaker: 'BUBBA', color: '#f80', text: '"Nessa terra, ou tu come a areia, ou a areia te come."' }
    ],
    'mission_1_complete': [
        { speaker: 'BUBBA', color: '#f80', text: 'Bom trabalho. Você é confiável.' },
        { speaker: 'RAIO', color: '#0f0', text: 'Tem mais?' },
        { speaker: 'BUBBA', color: '#f80', text: 'Sempre tem mais, Raio. Sempre tem mais.' }
    ],

    // ─────────────────────────────────────────────────────────
    // MISSÃO 3 - COBRANÇA
    // ─────────────────────────────────────────────────────────
    'mission_2_start': [
        { speaker: 'BUBBA', color: '#f80', text: 'Um comerciante no Eusébio tá devendo.' },
        { speaker: 'RAIO', color: '#0f0', text: 'Quanto?' },
        { speaker: 'BUBBA', color: '#f80', text: 'Não importa quanto. Importa que ele lembre quem manda.' },
        { speaker: 'BUBBA', color: '#f80', text: 'Dá um susto nele. O capanga dele é o problema.' }
    ],
    'mission_2_phase_2': [
        { speaker: 'RAIO', color: '#0f0', text: 'Sirene. Hora de vazar.' }
    ],
    'mission_2_complete': [
        { speaker: 'BUBBA', color: '#f80', text: 'Ele vai pagar agora.' },
        { speaker: 'RAIO', color: '#0f0', text: 'E se não pagar?' },
        { speaker: 'BUBBA', color: '#f80', text: 'Aí você volta. E não é pra assustar.' }
    ],

    // ─────────────────────────────────────────────────────────
    // MISSÃO 4 - LIMPEZA
    // ─────────────────────────────────────────────────────────
    'mission_3_start': [
        { speaker: 'BUBBA', color: '#f80', text: 'Tem um carro em Messejana. Com evidências.' },
        { speaker: 'RAIO', color: '#0f0', text: 'Evidências de quê?' },
        { speaker: 'BUBBA', color: '#f80', text: 'Você não quer saber.' },
        { speaker: 'BUBBA', color: '#f80', text: 'Destrói o carro antes que a PC-CE chegue.' }
    ],
    'mission_3_phase_1': [
        { speaker: 'RAIO', color: '#0f0', text: 'Achei. Vou queimar essa merda.' }
    ],
    'mission_3_complete': [
        { speaker: 'BUBBA', color: '#f80', text: 'Limpo. Como se nunca tivesse existido.' },
        { speaker: 'RAIO', color: '#0f0', text: 'O que tinha no porta-malas?' },
        { speaker: 'BUBBA', color: '#f80', text: 'Nada mais, agora.' }
    ],

    // ─────────────────────────────────────────────────────────
    // MISSÃO 5 - GUERRA NO CAÇA E PESCA
    // ─────────────────────────────────────────────────────────
    'mission_4_start': [
        { speaker: 'BUBBA', color: '#f80', text: 'Os GDL tão vendendo no meu território.' },
        { speaker: 'RAIO', color: '#0f0', text: 'GDL?' },
        { speaker: 'BUBBA', color: '#f80', text: 'Guardiões da Liberdade. Facção rival. Do interior.' },
        { speaker: 'BUBBA', color: '#f80', text: 'Manda a mensagem, Raio. Em vermelho.' }
    ],
    'mission_4_phase_2': [
        { speaker: 'RÁDIO PM', color: '#00f', text: '...COPOM, viatura do RAIO deslocando para o Caça e Pesca...' },
        { speaker: 'RAIO', color: '#0f0', text: 'Merda. O Batalhão RAIO.' },
        { speaker: 'RAIO', color: '#0f0', text: 'Irônico pra caralho.' }
    ],
    'mission_4_complete': [
        { speaker: 'BUBBA', color: '#f80', text: 'Mensagem entregue.' },
        { speaker: 'RAIO', color: '#0f0', text: 'Quantos mais?' },
        { speaker: 'BUBBA', color: '#f80', text: 'Só mais um. O mais importante.' }
    ],

    // ─────────────────────────────────────────────────────────
    // MISSÃO 6 - O X9 (Final do Capítulo 1)
    // ─────────────────────────────────────────────────────────
    'mission_5_start': [
        { speaker: 'BUBBA', color: '#f80', text: 'Descobri quem é o X9.' },
        { speaker: 'RAIO', color: '#0f0', text: 'O informante?' },
        { speaker: 'BUBBA', color: '#f80', text: 'Me segue. Vou te mostrar.' }
    ],
    'mission_5_phase_2': [
        { speaker: 'BUBBA', color: '#f80', text: 'É ele.' },
        { speaker: 'RAIO', color: '#0f0', text: '... Eu conheço ele.' },
        { speaker: 'BUBBA', color: '#f80', text: 'Todo mundo conhece alguém.' },
        { speaker: 'BUBBA', color: '#f80', text: 'Faz o que tem que fazer.' }
    ],
    'mission_5_phase_3': [
        { speaker: 'RAIO', color: '#0f0', text: '...' },
        { speaker: 'RAIO', color: '#0f0', text: 'Pedreiro. Eu era pedreiro.' }
    ],
    'mission_5_complete': [
        { speaker: 'BUBBA', color: '#f80', text: 'Agora você é dos meus, Raio.' },
        { speaker: 'BUBBA', color: '#f80', text: 'Não tem mais volta.' },
        { speaker: 'RAIO', color: '#0f0', text: 'Eu sei.' },
        { speaker: 'BUBBA', color: '#f80', text: 'Bem-vindo ao Comando do Litoral.' }
    ]
};

// ═══════════════════════════════════════════════════════════════
// SISTEMA DE INTRO
// ═══════════════════════════════════════════════════════════════

let introPage = 0;

function showIntro() {
    document.getElementById('start-screen').style.display = 'none';
    const introScreen = document.getElementById('intro-screen');
    if (introScreen) {
        introScreen.style.display = 'flex';
        introPage = 0;
        renderIntroPage();
    } else {
        // Fallback se não tiver tela de intro
        startGame();
    }
}

function renderIntroPage() {
    const page = INTRO_PAGES[introPage];
    const textEl = document.getElementById('intro-text');
    const btnEl = document.getElementById('intro-btn');
    if (textEl && btnEl) {
        textEl.innerHTML = page.text;
        btnEl.textContent = page.btn;
        btnEl.style.display = 'block';
    }
}

function advanceIntro() {
    introPage++;
    if (introPage >= INTRO_PAGES.length) {
        const introScreen = document.getElementById('intro-screen');
        if (introScreen) introScreen.style.display = 'none';
        startGame();
    } else {
        renderIntroPage();
    }
}

// ═══════════════════════════════════════════════════════════════
// SISTEMA DE DIÁLOGOS
// ═══════════════════════════════════════════════════════════════

let dialogQueue = [];
let dialogCallback = null;

function playDialog(key, callback) {
    if (!DIALOGS[key]) {
        if (callback) callback();
        return;
    }
    dialogQueue = [...DIALOGS[key]];
    dialogCallback = callback || null;
    showNextDialogLine();
}

function showNextDialogLine() {
    if (dialogQueue.length === 0) {
        if (dialogCallback) {
            const cb = dialogCallback;
            dialogCallback = null;
            cb();
        }
        return;
    }
    const d = dialogQueue.shift();
    const el = document.getElementById('message');
    if (el) {
        el.innerHTML = `<span style="color:${d.color};font-weight:bold;">${d.speaker}:</span> "${d.text}"` +
                       '<div style="font-size:10px;color:#666;margin-top:8px;">[CLIQUE]</div>';
        el.style.opacity = 1;
        G.msgPersist = true;
        G.msgTimer = 999999;
        G.dialogMode = true;
    }
}

// Override do dismissMsg para suportar diálogos
const originalDismissMsg = typeof dismissMsg === 'function' ? dismissMsg : null;

function dismissMsgWithDialog() {
    if (G.dialogMode && dialogQueue.length > 0) {
        showNextDialogLine();
        return;
    }
    G.dialogMode = false;
    if (G.msgPersist) {
        document.getElementById('message').style.opacity = 0;
        G.msgPersist = false;
        G.msgTimer = 0;
        if (dialogQueue.length === 0 && dialogCallback) {
            const cb = dialogCallback;
            dialogCallback = null;
            cb();
        }
        if (typeof endBriefing === 'function') {
            endBriefing();
        }
    }
}

// Substitui a função dismissMsg global
if (typeof window !== 'undefined') {
    window.dismissMsgOriginal = window.dismissMsg;
    window.dismissMsg = dismissMsgWithDialog;
}
