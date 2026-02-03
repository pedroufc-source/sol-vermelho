/**
 * SOL VERMELHO - Map Renderer
 * Renderiza o mapa de Fortaleza em estilo maquete
 */

/**
 * Desenha o mapa estilo maquete de papelão
 */
function drawMaquete() {
    const ox = -G.cam.x;
    const oy = -G.cam.y;

    // Base de papelão marrom
    ctx.fillStyle = '#c4a574';
    ctx.fillRect(ox, oy, CONFIG.WORLD_W, CONFIG.WORLD_H);

    // Textura de papelão
    ctx.strokeStyle = 'rgba(139,90,43,0.15)';
    ctx.lineWidth = 2;
    for (let i = 0; i < CONFIG.WORLD_H; i += 8) {
        ctx.beginPath();
        ctx.moveTo(ox, oy + i);
        ctx.lineTo(ox + CONFIG.WORLD_W, oy + i);
        ctx.stroke();
    }

    // Mar (lado direito = leste)
    const beiraMarX = CONFIG.WORLD_W - 600;
    ctx.fillStyle = '#4a9fd4';
    ctx.fillRect(ox + beiraMarX, oy, 600, CONFIG.WORLD_H);

    // Ondas
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 3;
    for (let y = 0; y < CONFIG.WORLD_H; y += 40) {
        ctx.beginPath();
        for (let x = beiraMarX; x < CONFIG.WORLD_W; x += 20) {
            ctx.lineTo(ox + x, oy + y + Math.sin((x + G.time * 2) * 0.05) * 8);
        }
        ctx.stroke();
    }

    // Praia
    ctx.fillStyle = '#f5e6c8';
    ctx.fillRect(ox + beiraMarX - 80, oy, 80, CONFIG.WORLD_H);

    // Av. Beira Mar
    ctx.fillStyle = '#707070';
    ctx.fillRect(ox + beiraMarX - 130, oy, 50, CONFIG.WORLD_H);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 20]);
    ctx.beginPath();
    ctx.moveTo(ox + beiraMarX - 105, oy);
    ctx.lineTo(ox + beiraMarX - 105, oy + CONFIG.WORLD_H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Bairros
    drawBairros(ox, oy);

    // Ruas principais
    drawRuas(ox, oy);

    // Prédios pequenos
    drawPredios(ox, oy, beiraMarX);

    // Árvores
    drawArvores(ox, oy, beiraMarX);

    // Landmarks
    drawLandmarks(ox, oy, beiraMarX);
}

function drawBairros(ox, oy) {
    const bairros = [
        { name: 'ALDEOTA', x: 2400, y: 1200, w: 800, h: 600, cor: '#e8d5b7' },
        { name: 'MEIRELES', x: 2800, y: 600, w: 600, h: 500, cor: '#dfc9a8' },
        { name: 'CENTRO', x: 1200, y: 1800, w: 700, h: 600, cor: '#d4c4a0' },
        { name: 'PRAIA DE IRACEMA', x: 2000, y: 400, w: 500, h: 400, cor: '#f0e0c0' },
        { name: 'BENFICA', x: 600, y: 1400, w: 500, h: 500, cor: '#cdb990' },
        { name: 'FATIMA', x: 1000, y: 800, w: 600, h: 500, cor: '#d8c8a5' },
        { name: 'MONTESE', x: 400, y: 2400, w: 600, h: 500, cor: '#c9b48a' },
        { name: 'MESSEJANA', x: 800, y: 3200, w: 700, h: 600, cor: '#d0bc92' },
    ];

    for (const b of bairros) {
        // Sombra
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(ox + b.x + 8, oy + b.y + 8, b.w, b.h);
        // Bloco
        ctx.fillStyle = b.cor;
        ctx.fillRect(ox + b.x, oy + b.y, b.w, b.h);
        // Borda
        ctx.strokeStyle = '#8b5a2b';
        ctx.lineWidth = 2;
        ctx.strokeRect(ox + b.x, oy + b.y, b.w, b.h);
        // Nome
        ctx.fillStyle = '#4a3520';
        ctx.font = 'italic 12px Georgia';
        ctx.textAlign = 'center';
        ctx.fillText(b.name, ox + b.x + b.w / 2, oy + b.y + b.h / 2);
    }
}

function drawRuas(ox, oy) {
    ctx.fillStyle = '#3a3a3a';

    // Av. Washington Soares (diagonal)
    ctx.save();
    ctx.translate(ox + 500, oy + 3800);
    ctx.rotate(-0.4);
    ctx.fillRect(0, 0, 3000, 35);
    ctx.restore();

    // Av. Santos Dumont
    ctx.fillRect(ox + 1800, oy, 35, CONFIG.WORLD_H);

    // Av. Aguanambi
    ctx.fillRect(ox + 1200, oy + 1500, 35, 2000);

    // Av. Bezerra de Menezes
    ctx.fillRect(ox, oy + 1000, 1500, 35);
}

function drawPredios(ox, oy, beiraMarX) {
    for (let i = 0; i < 200; i++) {
        const px = (i * 137) % (CONFIG.WORLD_W - 700);
        const py = (i * 251) % CONFIG.WORLD_H;
        const pw = 15 + (i % 20);
        const ph = 15 + (i % 15);

        if (px < beiraMarX - 200) {
            ctx.fillStyle = `hsl(35, ${20 + i % 30}%, ${85 + i % 10}%)`;
            ctx.fillRect(ox + px, oy + py, pw, ph);
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.strokeRect(ox + px, oy + py, pw, ph);
        }
    }
}

function drawArvores(ox, oy, beiraMarX) {
    for (let i = 0; i < 80; i++) {
        const tx = (i * 197 + 100) % (beiraMarX - 200);
        const ty = (i * 283 + 50) % CONFIG.WORLD_H;
        const size = 8 + i % 8;

        ctx.fillStyle = `hsl(${100 + i % 40}, ${50 + i % 30}%, ${35 + i % 20}%)`;
        ctx.beginPath();
        ctx.arc(ox + tx, oy + ty, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawLandmarks(ox, oy, beiraMarX) {
    // Ponte dos Ingleses
    ctx.fillStyle = '#d4a574';
    ctx.fillRect(ox + beiraMarX - 80, oy + 500, 150, 15);
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(ox + beiraMarX - 80, oy + 500, 150, 3);
    ctx.fillStyle = '#4a3520';
    ctx.font = 'bold 8px Arial';
    ctx.fillText('PONTE DOS INGLESES', ox + beiraMarX, oy + 495);

    // Farol do Mucuripe
    ctx.fillStyle = '#fff';
    ctx.fillRect(ox + beiraMarX - 50, oy + 200, 12, 40);
    ctx.fillStyle = '#c00';
    ctx.fillRect(ox + beiraMarX - 50, oy + 200, 12, 8);
    ctx.fillRect(ox + beiraMarX - 50, oy + 216, 12, 8);
    ctx.beginPath();
    ctx.arc(ox + beiraMarX - 44, oy + 195, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#ff0';
    ctx.fill();

    // Dragão do Mar
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(ox + 2100, oy + 600, 120, 80);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('DRAGAO DO MAR', ox + 2160, oy + 645);

    // Mercado Central
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(ox + 1300, oy + 1900, 100, 70);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 8px Arial';
    ctx.fillText('MERCADO', ox + 1350, oy + 1940);

    // Beach Park
    ctx.fillStyle = '#3498db';
    ctx.fillRect(ox + 3550, oy + 3150, 100, 100);
    ctx.fillStyle = '#fff';
    ctx.fillText('BEACH PARK', ox + 3600, oy + 3200);

    // Catedral
    ctx.fillStyle = '#95a5a6';
    ctx.fillRect(ox + 1400, oy + 2100, 80, 100);
    ctx.fillStyle = '#7f8c8d';
    ctx.beginPath();
    ctx.moveTo(ox + 1400, oy + 2100);
    ctx.lineTo(ox + 1440, oy + 2050);
    ctx.lineTo(ox + 1480, oy + 2100);
    ctx.fill();
    ctx.fillStyle = '#4a3520';
    ctx.font = 'bold 7px Arial';
    ctx.fillText('CATEDRAL', ox + 1440, oy + 2160);

    // Castelão
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(ox + 600, oy + 3000, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2d3436';
    ctx.beginPath();
    ctx.arc(ox + 600, oy + 3000, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#27ae60';
    ctx.beginPath();
    ctx.arc(ox + 600, oy + 3000, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 8px Arial';
    ctx.fillText('CASTELAO', ox + 600, oy + 3080);
}
