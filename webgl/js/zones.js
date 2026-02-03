/**
 * SOL VERMELHO WebGL - Zonas de Fortaleza
 * Sistema de bairros com classes sociais que afetam gameplay
 */

const ZONES = [
    // Periferia (classe E) - resposta policial lenta
    { name: 'Barra do Ceará', x: 0, y: 0, w: 1024, h: 1024, class: 'E', policeDelay: 60 },
    { name: 'Pirambu', x: 1024, y: 0, w: 1024, h: 512, class: 'E', policeDelay: 55 },
    { name: 'Conjunto Ceará', x: 0, y: 1024, w: 1024, h: 1024, class: 'E', policeDelay: 65 },

    // Classe média-baixa (classe D)
    { name: 'Centro', x: 1024, y: 512, w: 1024, h: 1024, class: 'D', policeDelay: 30 },
    { name: 'Benfica', x: 1024, y: 1536, w: 512, h: 512, class: 'D', policeDelay: 35 },
    { name: 'Parquelândia', x: 1536, y: 1536, w: 512, h: 512, class: 'D', policeDelay: 32 },

    // Classe média (classe C)
    { name: 'Fátima', x: 2048, y: 0, w: 512, h: 512, class: 'C', policeDelay: 20 },
    { name: 'Jacarecanga', x: 2048, y: 512, w: 512, h: 512, class: 'C', policeDelay: 22 },

    // Classe média-alta (classe B)
    { name: 'Aldeota', x: 2560, y: 0, w: 1024, h: 1024, class: 'B', policeDelay: 10 },
    { name: 'Meireles', x: 2560, y: 1024, w: 1024, h: 512, class: 'B', policeDelay: 8 },

    // Classe alta (classe A) - resposta policial imediata
    { name: 'Mucuripe', x: 3584, y: 0, w: 512, h: 512, class: 'A', policeDelay: 3 },
    { name: 'Praia de Iracema', x: 2048, y: 1024, w: 512, h: 512, class: 'B', policeDelay: 12 },

    // Áreas especiais
    { name: 'Porto do Mucuripe', x: 3584, y: 512, w: 512, h: 512, class: 'industrial', policeDelay: 25 },
    { name: 'Aeroporto', x: 3072, y: 2048, w: 1024, h: 1024, class: 'restricted', policeDelay: 5 }
];

/**
 * Encontra a zona baseada nas coordenadas
 */
function getZone(x, y) {
    for (const zone of ZONES) {
        if (x >= zone.x && x < zone.x + zone.w &&
            y >= zone.y && y < zone.y + zone.h) {
            return zone;
        }
    }
    return { name: 'Desconhecido', class: 'E', policeDelay: 60 };
}

/**
 * Calcula tempo de resposta policial baseado na zona
 * Crítica social: polícia chega mais rápido em bairros ricos
 */
function getPoliceResponseTime(x, y, wantedLevel) {
    const zone = getZone(x, y);
    const baseDelay = zone.policeDelay || 30;

    // Quanto maior o nível de procurado, mais rápido
    const urgencyMultiplier = Math.max(0.2, 1 - (wantedLevel * 0.15));

    return Math.floor(baseDelay * urgencyMultiplier);
}

/**
 * Retorna cor da zona para o minimapa
 */
function getZoneColor(zone) {
    const colors = {
        'A': 0x00ff00,  // Verde - rico
        'B': 0x88ff00,  // Verde-amarelo
        'C': 0xffff00,  // Amarelo
        'D': 0xff8800,  // Laranja
        'E': 0xff0000,  // Vermelho - pobre
        'industrial': 0x888888,
        'restricted': 0x0000ff
    };
    return colors[zone.class] || 0xffffff;
}
