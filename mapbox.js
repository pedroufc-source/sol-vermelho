/**
 * SOL VERMELHO - Integração Mapbox Satellite
 * Carrega imagens de satélite de Fortaleza via API
 */

// Token do Mapbox - pode ser sobrescrito via localStorage
const MAPBOX_TOKEN = localStorage.getItem('mapbox_token') || 'pk.eyJ1IjoicGVkaW1kb3N0ZWNsYWRvcyIsImEiOiJjbWw0dXdoN2YxYTg1M2dvaGs0M2syZ2lzIn0.IHZ2F4VQffFzz5XdUF3kHw';

// Log de status
if (MAPBOX_TOKEN) {
    console.log('%c=== SOL VERMELHO - MAPBOX ===', 'color: #f33; font-size: 12px; font-weight: bold');
    console.log('%cToken Mapbox configurado!', 'color: #0f0');
} else {
    console.log('%cSem token Mapbox. Use setMapboxToken("pk.xxx")', 'color: #f80');
}

// Função para configurar/trocar token via console
window.setMapboxToken = function(token) {
    if (!token || !token.startsWith('pk.')) {
        console.error('Token inválido! Deve começar com "pk."');
        return;
    }
    localStorage.setItem('mapbox_token', token);
    console.log('%cToken Mapbox atualizado! Recarregando...', 'color: #0f0');
    setTimeout(() => location.reload(), 500);
};

// Coordenadas de Fortaleza
const FORTALEZA_CENTER = {
    lat: -3.7319,
    lng: -38.5267,
};

// Carrega mosaico de satélite do Mapbox (4 tiles 2x2)
async function loadMapboxSatelliteImage(worldW, worldH) {
    if (!MAPBOX_TOKEN) {
        console.log('Sem token - usando mapa procedural');
        return null;
    }

    const zoom = 15;
    const size = '1280x1280';
    const offset = 0.012;

    const tiles = [
        { lat: FORTALEZA_CENTER.lat + offset, lng: FORTALEZA_CENTER.lng - offset },
        { lat: FORTALEZA_CENTER.lat + offset, lng: FORTALEZA_CENTER.lng + offset },
        { lat: FORTALEZA_CENTER.lat - offset, lng: FORTALEZA_CENTER.lng - offset },
        { lat: FORTALEZA_CENTER.lat - offset, lng: FORTALEZA_CENTER.lng + offset },
    ];

    console.log('%cBaixando mapa de satélite de Fortaleza...', 'color: #0af');

    try {
        const satCanvas = document.createElement('canvas');
        satCanvas.width = worldW;
        satCanvas.height = worldH;
        const satCtx = satCanvas.getContext('2d');

        const loadTile = async (tile, x, y) => {
            const url = `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/${tile.lng},${tile.lat},${zoom}/${size}@2x?access_token=${MAPBOX_TOKEN}`;
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = url;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = () => reject(new Error('Tile failed'));
            });
            satCtx.drawImage(img, x, y, worldW / 2, worldH / 2);
        };

        await Promise.all([
            loadTile(tiles[0], 0, 0),
            loadTile(tiles[1], worldW / 2, 0),
            loadTile(tiles[2], 0, worldH / 2),
            loadTile(tiles[3], worldW / 2, worldH / 2),
        ]);

        const satImg = new Image();
        satImg.src = satCanvas.toDataURL('image/jpeg', 0.9);
        await new Promise(resolve => satImg.onload = resolve);

        console.log('%cMapa de satélite carregado!', 'color: #0f0; font-weight: bold');
        return satImg;
    } catch(e) {
        console.error('Erro ao carregar Mapbox:', e);
        return null;
    }
}

// Exportar
window.loadMapboxSatelliteImage = loadMapboxSatelliteImage;
window.MAPBOX_TOKEN = MAPBOX_TOKEN;
