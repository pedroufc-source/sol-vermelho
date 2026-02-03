/**
 * SOL VERMELHO - Sistema de Zonas
 * Zonas de Fortaleza com classes sociais que afetam resposta policial
 */

const ZONAS = [
    // Zona rica - polícia chega rápido pra qualquer crime
    { name: 'ALDEOTA', x: 2400, y: 1200, w: 800, h: 600, classe: 'alta', tempoBase: 60 },
    { name: 'MEIRELES', x: 2800, y: 600, w: 600, h: 500, classe: 'alta', tempoBase: 60 },
    { name: 'PRAIA DE IRACEMA', x: 2000, y: 400, w: 500, h: 400, classe: 'alta', tempoBase: 90 },

    // Zona média - resposta moderada
    { name: 'CENTRO', x: 1200, y: 1800, w: 700, h: 600, classe: 'media', tempoBase: 120 },
    { name: 'FATIMA', x: 1000, y: 800, w: 600, h: 500, classe: 'media', tempoBase: 150 },
    { name: 'BENFICA', x: 600, y: 1400, w: 500, h: 500, classe: 'media', tempoBase: 150 },

    // Periferia - polícia demora pra crime contra vida, mas corre pra patrimônio
    { name: 'MONTESE', x: 400, y: 2400, w: 600, h: 500, classe: 'periferia', tempoBase: 300 },
    { name: 'MESSEJANA', x: 800, y: 3200, w: 700, h: 600, classe: 'periferia', tempoBase: 360 },
];

/**
 * Retorna a zona atual baseado nas coordenadas
 */
function getZona(x, y) {
    for (const z of ZONAS) {
        if (x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h) {
            return z;
        }
    }
    // Fora de qualquer bairro definido = terra de ninguém
    return { name: 'PERIFERIA', classe: 'periferia', tempoBase: 420 };
}

/**
 * Calcula tempo de resposta baseado no tipo de crime e zona
 * Crítica social: polícia protege patrimônio, não pessoas na periferia
 */
function calcularTempoResposta(tipoCrime, zona) {
    // Crime contra patrimônio = resposta rápida em qualquer lugar
    if (tipoCrime === CRIME_TYPES.patrimonio) {
        return 30 + Math.random() * 30; // 0.5-1 segundo
    }

    // Crime contra a vida
    if (tipoCrime === CRIME_TYPES.vida) {
        if (zona.classe === 'alta') {
            return 60 + Math.random() * 60; // 1-2 segundos
        } else if (zona.classe === 'media') {
            return zona.tempoBase + Math.random() * 60;
        } else {
            // Periferia: às vezes polícia nem vem
            if (Math.random() < 0.2) {
                return -1; // Não vem ninguém
            }
            return zona.tempoBase + Math.random() * 180; // 5-9 segundos
        }
    }

    return zona.tempoBase;
}
