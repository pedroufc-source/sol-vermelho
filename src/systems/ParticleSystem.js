/**
 * SOL VERMELHO - Particle System
 * Sistema de partículas e efeitos visuais
 */

/**
 * Cria explosão
 */
function createExplosion(x, y, radius, damage) {
    Audio.play('explosion', x, y);

    // Partículas de fogo
    for (let i = 0; i < 25; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 3 + Math.random() * 6;
        G.particles.push({
            x, y,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            life: 30 + Math.random() * 20,
            maxLife: 50,
            color: 'hsl(' + (Math.random() * 40 + 10) + ', 100%, 50%)',
            size: 5 + Math.random() * 10,
            type: 'fire'
        });
    }

    // Fumaça
    for (let i = 0; i < 10; i++) {
        G.particles.push({
            x: x + (Math.random() - 0.5) * 30,
            y: y + (Math.random() - 0.5) * 30,
            vx: (Math.random() - 0.5) * 2,
            vy: -1 - Math.random() * 2,
            life: 60,
            maxLife: 60,
            color: '#444',
            size: 15 + Math.random() * 20,
            type: 'smoke'
        });
    }

    // Dano em área
    for (const ped of G.peds) {
        const d = Math.hypot(ped.x - x, ped.y - y);
        if (d < radius) {
            ped.takeDamage(damage * (1 - d / radius), G.player);
        }
    }

    for (const cop of G.cops) {
        const d = Math.hypot(cop.x - x, cop.y - y);
        if (d < radius) {
            cop.takeDamage(damage * (1 - d / radius), G.player);
        }
    }

    for (const v of G.vehicles) {
        const d = Math.hypot(v.x - x, v.y - y);
        if (d < radius) {
            v.takeDamage(damage * (1 - d / radius));
        }
    }

    // Dano no jogador
    const pd = Math.hypot(G.player.x - x, G.player.y - y);
    if (pd < radius && !G.player.inVehicle) {
        G.player.takeDamage(damage * 0.4 * (1 - pd / radius));
    }

    increaseWanted(3, CRIME_TYPES.patrimonio, x, y);
}

/**
 * Cria partículas de sangue
 */
function spawnBlood(x, y, amt = 5) {
    for (let i = 0; i < amt; i++) {
        G.particles.push({
            x: x + (Math.random() - 0.5) * 15,
            y: y + (Math.random() - 0.5) * 15,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 20,
            maxLife: 20,
            color: '#800',
            size: 3 + Math.random() * 4,
            type: 'blood'
        });
    }
}

/**
 * Cria faíscas de metal
 */
function spawnSparks(x, y) {
    for (let i = 0; i < 5; i++) {
        const ang = Math.random() * Math.PI * 2;
        G.particles.push({
            x, y,
            vx: Math.cos(ang) * (2 + Math.random() * 3),
            vy: Math.sin(ang) * (2 + Math.random() * 3),
            life: 10,
            maxLife: 10,
            color: '#ff0',
            size: 2,
            type: 'spark'
        });
    }
}

/**
 * Cria flash de tiro
 */
function spawnFlash(x, y) {
    G.particles.push({
        x, y,
        vx: 0,
        vy: 0,
        life: 3,
        maxLife: 3,
        color: '#ff0',
        size: 12,
        type: 'flash'
    });
}

/**
 * Cria partícula de fogo
 */
function spawnFire(x, y) {
    G.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 2,
        vy: -2 - Math.random() * 2,
        life: 25,
        maxLife: 25,
        color: 'hsl(' + Math.random() * 30 + ', 100%, 50%)',
        size: 8 + Math.random() * 8,
        type: 'fire'
    });
}

/**
 * Atualiza todas as partículas
 */
function updateParticles() {
    for (let i = G.particles.length - 1; i >= 0; i--) {
        const p = G.particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        // Comportamentos por tipo
        if (p.type === 'smoke') {
            p.vx *= 0.98;
            p.vy *= 0.98;
            p.size += 0.3;
        }

        if (p.type === 'fire') {
            p.vy -= 0.1;
            p.size *= 0.96;
        }

        // Remove partículas mortas
        if (p.life <= 0) {
            G.particles.splice(i, 1);
        }
    }
}
