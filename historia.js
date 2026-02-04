// ═══════════════════════════════════════════════════════════════
// SOL VERMELHO - HISTÓRIA E DIÁLOGOS
// A narrativa de Raimundo "Raio" Silva
// Baseado em pesquisa acadêmica sobre facções em Fortaleza
// ═══════════════════════════════════════════════════════════════

const INTRO_PAGES = [
    {
        text: `<div style="color:#f33; font-size:16px; margin-bottom:15px;">FORTALEZA, CEARÁ</div>
        <div style="color:#666; margin-bottom:20px;">Fevereiro de 2003</div>
        <p>A crise na construção civil já dura meses.</p>
        <p style="margin-top:10px;">Obras paradas. Empreiteiras quebrando. Trabalhadores na rua.</p>
        <p style="margin-top:10px; color:#888; font-size:12px;">"Aqui não tem gangue, tem facção."</p>`,
        btn: 'CONTINUAR'
    },
    {
        text: `<p>Meu nome é <span style="color:#0f0">Raimundo Silva</span>.</p>
        <p style="margin-top:10px;">Todo mundo me chama de <span style="color:#f33; font-weight:bold;">RAIO</span>.</p>
        <p style="margin-top:10px; color:#666; font-style:italic;">Ganhei esse apelido na infância. Era o mais rápido do Bom Jardim.</p>
        <p style="margin-top:15px;">Agora sou motoboy. R$25 por entrega.</p>`,
        btn: 'CONTINUAR'
    },
    {
        text: `<p>Três meses de aluguel atrasado. Geladeira vazia. Minha mãe doente.</p>
        <p style="margin-top:15px;">Hoje é mais um dia. Mais uma entrega.</p>
        <p style="margin-top:10px; color:#888; font-size:12px;">Pelo menos a pizzaria paga na hora.</p>
        <p style="margin-top:15px; color:#fc0;">"Raio! Tem entrega pro Meireles!"</p>`,
        btn: 'COMEÇAR'
    }
];

// ═══════════════════════════════════════════════════════════════
// DIÁLOGOS DAS MISSÕES
// Terminologia baseada em pesquisa acadêmica (LEV/UFC)
// ═══════════════════════════════════════════════════════════════

const DIALOGS = {
    // ─────────────────────────────────────────────────────────
    // MISSÃO 0 - ENTREGA DE PIZZA (Tutorial)
    // A vida antes do crime
    // ─────────────────────────────────────────────────────────
    'mission_0_start': [
        { speaker: 'SEU CHICO', color: '#f80', text: 'Raio! Entrega pro Meireles!' },
        { speaker: 'RAIO', color: '#0f0', text: 'Beleza, Seu Chico.' },
        { speaker: 'SEU CHICO', color: '#f80', text: 'Calabresa com catupiry. Não demora!' }
    ],
    'mission_0_complete': [
        { speaker: 'RAIO', color: '#0f0', text: 'R$25. Três meses de aluguel atrasado.' },
        { speaker: 'RAIO', color: '#0f0', text: 'Precisava de 200 entregas só pra pagar esse mês.' },
        { speaker: 'RAIO', color: '#0f0', text: '...' },
        { speaker: 'CÍCERO', color: '#fc0', text: 'E aí, Raio! Quanto tempo!' },
        { speaker: 'RAIO', color: '#0f0', text: 'Cícero? Tu sumiu, cara.' },
        { speaker: 'CÍCERO', color: '#fc0', text: 'Tô na correria. Escuta, tenho um servicinho. Paga bem.' },
        { speaker: 'RAIO', color: '#0f0', text: 'Que tipo de servicinho?' },
        { speaker: 'CÍCERO', color: '#fc0', text: 'R$500. Só precisa de um motorista. Sem perguntas.' }
    ],

    // ─────────────────────────────────────────────────────────
    // MISSÃO 1 - O SERVICINHO
    // Cícero é "sintonia" da Tropa Vermelha
    // ─────────────────────────────────────────────────────────
    'mission_1_start': [
        { speaker: 'CÍCERO', color: '#fc0', text: 'Raio! Bom te ver, parceiro.' },
        { speaker: 'RAIO', color: '#0f0', text: 'Cícero. Qual é o trampo?' },
        { speaker: 'CÍCERO', color: '#fc0', text: 'Simples. Dirige até a Aldeota, espera uns caras, e leva pro esconderijo.' },
        { speaker: 'RAIO', color: '#0f0', text: 'Que caras?' },
        { speaker: 'CÍCERO', color: '#fc0', text: 'Sem perguntas, lembra? A Tropa precisa de gente confiável.' },
        { speaker: 'CÍCERO', color: '#fc0', text: 'Pega o carro ali do lado. Vai.' }
    ],
    'mission_1_phase_1': [
        { speaker: 'RAIO', color: '#0f0', text: '...' },
        { speaker: 'RAIO', color: '#0f0', text: 'Pera. Isso é... um banco?' }
    ],
    'mission_1_phase_2': [
        { speaker: '???', color: '#f44', text: 'ENTRA ENTRA ENTRA!' },
        { speaker: 'CÍCERO', color: '#fc0', text: 'VAI RAIO! PISA NESSA MERDA!' },
        { speaker: 'RAIO', color: '#0f0', text: 'CARALHO CÍCERO! ASSALTO?!' },
        { speaker: 'CÍCERO', color: '#fc0', text: 'MENOS CONVERSA! MAIS GÁS!' }
    ],
    'mission_1_complete': [
        { speaker: 'CÍCERO', color: '#fc0', text: 'Bem-vindo à Tropa, Raio.' },
        { speaker: 'RAIO', color: '#0f0', text: 'Você me fodeu, Cícero.' },
        { speaker: 'CÍCERO', color: '#fc0', text: 'Te dei uma oportunidade. O Carioca quer te conhecer.' },
        { speaker: 'RAIO', color: '#0f0', text: 'Quem é Carioca?' },
        { speaker: 'CÍCERO', color: '#fc0', text: 'A sintonia final da Tropa Vermelha aqui no Ceará. Você vai descobrir.' }
    ],

    // ─────────────────────────────────────────────────────────
    // MISSÃO 2 - ENTREGA ESPECIAL
    // Raio conhece Carioca, chefe da Tropa Vermelha
    // ─────────────────────────────────────────────────────────
    'mission_2_start': [
        { speaker: 'CARIOCA', color: '#f80', text: 'Então você é o Raio.' },
        { speaker: 'RAIO', color: '#0f0', text: 'Quem pergunta?' },
        { speaker: 'CARIOCA', color: '#f80', text: 'Gervásio Monteiro. Todo mundo me chama de Carioca.' },
        { speaker: 'CARIOCA', color: '#f80', text: 'Comando a Tropa Vermelha aqui no Ceará. Cícero falou bem de você.' },
        { speaker: 'RAIO', color: '#0f0', text: 'O que você quer?' },
        { speaker: 'CARIOCA', color: '#f80', text: 'Tenho um pacote. Leva pra Praia do Futuro. Não abre.' },
        { speaker: 'RAIO', color: '#0f0', text: 'O que tem dentro?' },
        { speaker: 'CARIOCA', color: '#f80', text: '"Quem trai a Tropa, morre pela Tropa." Lembra disso.' }
    ],
    'mission_4_complete': [
        { speaker: 'CARIOCA', color: '#f80', text: 'Bom trabalho. Você é confiável.' },
        { speaker: 'RAIO', color: '#0f0', text: 'Tem mais?' },
        { speaker: 'CARIOCA', color: '#f80', text: 'Sempre tem mais, Raio. A Tropa cuida de quem é leal.' },
        { speaker: 'CARIOCA', color: '#f80', text: 'Tua caixinha já tá paga esse mês. Continua assim.' }
    ],

    // ─────────────────────────────────────────────────────────
    // MISSÃO 3 - COBRANÇA
    // Sistema de "mensalidade" dos comerciantes
    // ─────────────────────────────────────────────────────────
    'mission_4_start': [
        { speaker: 'CARIOCA', color: '#f80', text: 'Um comerciante tá devendo a mensalidade.' },
        { speaker: 'RAIO', color: '#0f0', text: 'Quanto?' },
        { speaker: 'CARIOCA', color: '#f80', text: 'Não importa quanto. Importa que ele lembre quem manda nessa rua.' },
        { speaker: 'CARIOCA', color: '#f80', text: 'Aqui é território da Tropa. Cada rua tem dono.' },
        { speaker: 'CARIOCA', color: '#f80', text: 'Dá um susto nele. O capanga dele é o problema.' }
    ],
    'mission_4_phase_2': [
        { speaker: 'RAIO', color: '#0f0', text: 'Sirene. Hora de vazar.' },
        { speaker: 'RÁDIO PM', color: '#00f', text: '...COPOM, viatura deslocando pro Eusébio...' }
    ],
    'mission_4_complete': [
        { speaker: 'CARIOCA', color: '#f80', text: 'Ele vai pagar agora.' },
        { speaker: 'RAIO', color: '#0f0', text: 'E se não pagar?' },
        { speaker: 'CARIOCA', color: '#f80', text: 'Aí ele é expulso. Sai só com a roupa do corpo.' },
        { speaker: 'CARIOCA', color: '#f80', text: 'Fronteira invisível, mano. Todo mundo sabe onde começa e termina.' }
    ],

    // ─────────────────────────────────────────────────────────
    // MISSÃO 4 - LIMPEZA
    // ─────────────────────────────────────────────────────────
    'mission_4_start': [
        { speaker: 'CARIOCA', color: '#f80', text: 'Tem um carro em Messejana. Com evidências.' },
        { speaker: 'RAIO', color: '#0f0', text: 'Evidências de quê?' },
        { speaker: 'CARIOCA', color: '#f80', text: 'Você não quer saber.' },
        { speaker: 'CARIOCA', color: '#f80', text: 'Destrói o carro antes que a DRACO chegue.' },
        { speaker: 'RAIO', color: '#0f0', text: 'DRACO?' },
        { speaker: 'CARIOCA', color: '#f80', text: 'Delegacia de Repressão às Ações Criminosas Organizadas. Eles tão de olho na gente.' }
    ],
    'mission_4_phase_1': [
        { speaker: 'RAIO', color: '#0f0', text: 'Achei. Vou queimar essa merda.' }
    ],
    'mission_4_complete': [
        { speaker: 'CARIOCA', color: '#f80', text: 'Limpo. Como se nunca tivesse existido.' },
        { speaker: 'RAIO', color: '#0f0', text: 'O que tinha no porta-malas?' },
        { speaker: 'CARIOCA', color: '#f80', text: 'Nada mais, agora.' }
    ],

    // ─────────────────────────────────────────────────────────
    // MISSÃO 5 - GUERRA NO CAÇA E PESCA
    // Conflito com os Guardiões do Sertão (GDS)
    // ─────────────────────────────────────────────────────────
    'mission_4_start': [
        { speaker: 'CARIOCA', color: '#f80', text: 'Os Guardiões tão vendendo no meu território.' },
        { speaker: 'RAIO', color: '#0f0', text: 'Guardiões?' },
        { speaker: 'CARIOCA', color: '#f80', text: 'Guardiões do Sertão. Facção cearense. Se acham os donos daqui.' },
        { speaker: 'CARIOCA', color: '#f80', text: 'Falam que são "anticolonialistas". Que a gente é de fora.' },
        { speaker: 'RAIO', color: '#0f0', text: 'E são?' },
        { speaker: 'CARIOCA', color: '#f80', text: 'São otários. Manda a mensagem, Raio. Em vermelho.' }
    ],
    'mission_4_phase_2': [
        { speaker: 'RÁDIO PM', color: '#00f', text: '...COPOM, viatura do RAIO deslocando pro Caça e Pesca...' },
        { speaker: 'RAIO', color: '#0f0', text: 'Merda. O Batalhão RAIO.' },
        { speaker: 'RAIO', color: '#0f0', text: 'Irônico pra caralho.' }
    ],
    'mission_4_complete': [
        { speaker: 'CARIOCA', color: '#f80', text: 'Mensagem entregue.' },
        { speaker: 'RAIO', color: '#0f0', text: 'Quantos mais?' },
        { speaker: 'CARIOCA', color: '#f80', text: 'Só mais um. O mais importante.' },
        { speaker: 'CARIOCA', color: '#f80', text: 'Tem um X9 na Tropa. Alguém tá passando informação pra DRACO.' }
    ],

    // ─────────────────────────────────────────────────────────
    // MISSÃO 6 - O X9 (Final do Capítulo 1)
    // ─────────────────────────────────────────────────────────
    'mission_5_start': [
        { speaker: 'CARIOCA', color: '#f80', text: 'Descobri quem é o X9.' },
        { speaker: 'RAIO', color: '#0f0', text: 'O informante da DRACO?' },
        { speaker: 'CARIOCA', color: '#f80', text: 'Me segue. Vou te mostrar.' },
        { speaker: 'CARIOCA', color: '#f80', text: 'O Tribunal já decidiu. Sentença de morte.' }
    ],
    'mission_5_phase_2': [
        { speaker: 'CARIOCA', color: '#f80', text: 'É ele.' },
        { speaker: 'RAIO', color: '#0f0', text: '... Eu conheço ele.' },
        { speaker: 'CARIOCA', color: '#f80', text: 'Todo mundo conhece alguém.' },
        { speaker: 'CARIOCA', color: '#f80', text: 'Quem trai a Tropa, morre pela Tropa. Faz o que tem que fazer.' }
    ],
    'mission_5_phase_3': [
        { speaker: 'RAIO', color: '#0f0', text: '...' },
        { speaker: 'RAIO', color: '#0f0', text: 'Pedreiro. Eu era pedreiro.' }
    ],
    'mission_5_complete': [
        { speaker: 'CARIOCA', color: '#f80', text: 'Agora você é dos nossos, Raio.' },
        { speaker: 'CARIOCA', color: '#f80', text: 'Não tem mais volta. Você foi batizado no sangue.' },
        { speaker: 'RAIO', color: '#0f0', text: 'Eu sei.' },
        { speaker: 'CARIOCA', color: '#f80', text: 'Bem-vindo à Tropa Vermelha.' },
        { speaker: 'CARIOCA', color: '#f80', text: 'Mas agora precisa sumir. A DHPP abriu inquérito. O RAIO tá rondando.' }
    ],

    // ═══════════════════════════════════════════════════════════════
    // CAPÍTULO 2 - CENTRO DE FORTALEZA
    // Raio trabalha para Tio Lau contra os Cargueiros
    // ═══════════════════════════════════════════════════════════════

    // ─────────────────────────────────────────────────────────────
    // MISSÃO 7 - OLHEIRO
    // ─────────────────────────────────────────────────────────────
    'mission_6_start': [
        { speaker: 'CARIOCA', color: '#f80', text: 'Raio, precisa sumir por um tempo.' },
        { speaker: 'RAIO', color: '#0f0', text: 'A DHPP?' },
        { speaker: 'CARIOCA', color: '#f80', text: 'E o Batalhão RAIO. Tão rondando pesado aqui na Barra.' },
        { speaker: 'CARIOCA', color: '#f80', text: 'Vai pro Centro. Procura o Tio Lau na Rua 24 de Maio.' },
        { speaker: 'RAIO', color: '#0f0', text: 'Quem é Tio Lau?' },
        { speaker: 'CARIOCA', color: '#f80', text: 'Um velho chinês. Dono de restaurante. Controla o bicho e a agiotagem no Centro.' },
        { speaker: 'CARIOCA', color: '#f80', text: 'Diz que a Tropa mandou. Ele vai te dar trabalho.' }
    ],
    'mission_6_phase_1': [
        { speaker: 'TIO LAU', color: '#8f8', text: '...' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Então você é o Raio.' },
        { speaker: 'RAIO', color: '#0f0', text: 'A Tropa Vermelha me mandou.' },
        { speaker: 'TIO LAU', color: '#8f8', text: '"Paciência é a arma do homem sábio. A pressa é do homem morto."' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Tenho um problema. Os Cargueiros.' }
    ],
    'mission_6_phase_2': [
        { speaker: 'TIO LAU', color: '#8f8', text: 'Eles roubam minhas mercadorias na BR-116.' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Gangue desorganizada. Mas violenta.' },
        { speaker: 'RAIO', color: '#0f0', text: 'O que você quer que eu faça?' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Primeiro, vigia. Fica de olho no galpão deles.' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Conta quantos são. Vê quando chegam. Observa.' }
    ],
    'mission_6_complete': [
        { speaker: 'RAIO', color: '#0f0', text: 'São uns 6, talvez 8. Revezam em turnos.' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Bom. Muito bom.' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Você é observador. Isso é raro.' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Diferente das facções. Eles só sabem atirar.' }
    ],

    // ─────────────────────────────────────────────────────────────
    // MISSÃO 8 - INTERCEPTAÇÃO
    // ─────────────────────────────────────────────────────────────
    'mission_7_start': [
        { speaker: 'TIO LAU', color: '#8f8', text: 'Eles pegaram outro caminhão meu.' },
        { speaker: 'RAIO', color: '#0f0', text: 'O que tinha dentro?' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Eletrônicos. Do Porto do Mucuripe.' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Traz de volta. O caminhão e a carga.' },
        { speaker: 'RAIO', color: '#0f0', text: 'E os Cargueiros?' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Faça o necessário. Mas com inteligência, não com pressa.' }
    ],
    'mission_7_phase_1': [
        { speaker: 'RAIO', color: '#0f0', text: 'Achei o caminhão. Tem uns caras de guarda.' }
    ],
    'mission_7_complete': [
        { speaker: 'TIO LAU', color: '#8f8', text: 'A carga está intacta?' },
        { speaker: 'RAIO', color: '#0f0', text: 'Sim.' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Você está subindo, Raio.' }
    ],

    // ─────────────────────────────────────────────────────────────
    // MISSÃO 9 - JOGO DO BICHO
    // ─────────────────────────────────────────────────────────────
    'mission_8_start': [
        { speaker: 'TIO LAU', color: '#8f8', text: 'Tenho outro negócio além do restaurante.' },
        { speaker: 'RAIO', color: '#0f0', text: 'Bicho?' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Há 40 anos. Antes do seu pai nascer.' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Meu bicheiro vai fazer a coleta na Praça do Ferreira.' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Protege ele. Os Cargueiros querem tomar o ponto.' }
    ],
    'mission_8_phase_1': [
        { speaker: 'BICHEIRO', color: '#ff0', text: 'Tu é o cara do Tio Lau?' },
        { speaker: 'RAIO', color: '#0f0', text: 'Sou. Vamos.' }
    ],
    'mission_8_phase_2': [
        { speaker: 'CARGUEIRO', color: '#f44', text: 'OLHA O BICHEIRO DO CHINÊS!' },
        { speaker: 'RAIO', color: '#0f0', text: 'Fica atrás de mim.' }
    ],
    'mission_8_complete': [
        { speaker: 'BICHEIRO', color: '#ff0', text: 'Caralho... tu é doido, Raio.' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'A coleta está segura?' },
        { speaker: 'RAIO', color: '#0f0', text: 'Ninguém tocou no dinheiro.' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Bom. Muito bom.' }
    ],

    // ─────────────────────────────────────────────────────────────
    // MISSÃO 10 - O AGIOTA
    // ─────────────────────────────────────────────────────────────
    'mission_9_start': [
        { speaker: 'TIO LAU', color: '#8f8', text: 'Tem um comerciante no Mercado Central.' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Deve três meses. R$15.000.' },
        { speaker: 'RAIO', color: '#0f0', text: 'E se ele não tiver?' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Ele tem. Mas prefere não pagar.' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Convence ele. Mas sem matar. Morto não paga dívida.' }
    ],
    'mission_9_phase_1': [
        { speaker: 'COMERCIANTE', color: '#ccc', text: 'Eu não tenho o dinheiro!' },
        { speaker: 'RAIO', color: '#0f0', text: 'O Tio Lau disse que você tem.' },
        { speaker: 'COMERCIANTE', color: '#ccc', text: 'Ele... ele vai ter que esperar!' }
    ],
    'mission_9_phase_2': [
        { speaker: 'RAIO', color: '#0f0', text: 'O Tio Lau não gosta de esperar.' },
        { speaker: 'RAIO', color: '#0f0', text: 'E eu não tenho paciência.' }
    ],
    'mission_9_complete': [
        { speaker: 'COMERCIANTE', color: '#ccc', text: 'TOMA! TOMA O DINHEIRO!' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Ele pagou?' },
        { speaker: 'RAIO', color: '#0f0', text: 'Com juros.' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Você entende como funciona.' }
    ],

    // ─────────────────────────────────────────────────────────────
    // MISSÃO 11 - EMBOSCADA
    // ─────────────────────────────────────────────────────────────
    'mission_10_start': [
        { speaker: 'TIO LAU', color: '#8f8', text: 'Chegou a hora de acabar com os Cargueiros.' },
        { speaker: 'RAIO', color: '#0f0', text: 'Como?' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Emboscada. Na BR-116.' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Vou mandar um caminhão falso. Eles vão tentar roubar.' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Você vai estar esperando.' },
        { speaker: 'RAIO', color: '#0f0', text: 'Quantos?' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Todos que aparecerem.' }
    ],
    'mission_10_phase_1': [
        { speaker: 'RAIO', color: '#0f0', text: 'Estou em posição.' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Espera eles virem. Não atira antes da hora.' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Paciência. A pressa é do homem morto.' }
    ],
    'mission_10_phase_2': [
        { speaker: 'CARGUEIRO', color: '#f44', text: 'PEGA O CAMINHÃO!' },
        { speaker: 'RAIO', color: '#0f0', text: 'Surpresa, filhos da puta.' }
    ],
    'mission_10_complete': [
        { speaker: 'TIO LAU', color: '#8f8', text: 'Quantos?' },
        { speaker: 'RAIO', color: '#0f0', text: 'Seis.' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Agora falta só o chefe.' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Elias Burro. Homem estúpido com nome apropriado.' }
    ],

    // ─────────────────────────────────────────────────────────────
    // MISSÃO 12 - ELIAS BURRO (Final do Capítulo 2)
    // ─────────────────────────────────────────────────────────────
    'mission_11_start': [
        { speaker: 'TIO LAU', color: '#8f8', text: 'Elias Burro. O chefe dos Cargueiros.' },
        { speaker: 'RAIO', color: '#0f0', text: 'Onde ele está?' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'No galpão principal. Distrito Industrial.' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Acaba com isso de uma vez.' },
        { speaker: 'RAIO', color: '#0f0', text: 'Sozinho?' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Você não está mais sozinho, Raio.' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Mas cuidado. A DRACO e o GAECO estão de olho.' }
    ],
    'mission_11_phase_1': [
        { speaker: 'RAIO', color: '#0f0', text: 'Chegando no galpão.' }
    ],
    'mission_11_phase_2': [
        { speaker: 'ELIAS BURRO', color: '#f44', text: 'QUEM É ESSE FILHO DA PUTA?!' },
        { speaker: 'RAIO', color: '#0f0', text: 'O cara que vai acabar com você.' }
    ],
    'mission_11_complete': [
        { speaker: 'TIO LAU', color: '#8f8', text: 'Acabou?' },
        { speaker: 'RAIO', color: '#0f0', text: 'Acabou.' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Os Cargueiros não existem mais.' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Você provou seu valor, Raio.' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Mas a DRACO está de olho. O GAECO também. A PF está planejando operação.' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Preciso te apresentar a alguém que pode ajudar...' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Conhece o Delegado Delvair? Da DRACO?' },
        { speaker: 'RAIO', color: '#0f0', text: 'Delegado? Ele é polícia.' },
        { speaker: 'TIO LAU', color: '#8f8', text: 'Ele é útil. E útil não tem lado.' }
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
