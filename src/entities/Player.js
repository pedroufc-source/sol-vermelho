/**
 * SOL VERMELHO - Player
 * Classe do jogador (Raimundo "Raio" Silva)
 */

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.rot = 0;
        this.health = 100;
        this.armor = 0;
        this.inVehicle = null;
        this.weapons = ['fists'];
        this.curWeapon = 0;
        this.ammo = {};
        this.cooldown = 0;
        this.flash = 0;
        this.invuln = 0;
        this.anim = 0;
    }

    get weapon() {
        return WEAPONS[this.weapons[this.curWeapon]];
    }

    get weaponId() {
        return this.weapons[this.curWeapon];
    }

    update() {
        if (this.cooldown > 0) this.cooldown--;
        if (this.flash > 0) this.flash--;
        if (this.invuln > 0) this.invuln--;

        // Se está em veículo, apenas atualiza posição
        if (this.inVehicle) {
            this.x = this.inVehicle.x;
            this.y = this.inVehicle.y;
            return;
        }

        // Movimento
        let dx = 0, dy = 0;
        const spd = G.keys['ShiftLeft'] ? CONFIG.PLAYER_RUN_SPEED : CONFIG.PLAYER_SPEED;

        if (G.keys['KeyW']) dy -= 1;
        if (G.keys['KeyS']) dy += 1;
        if (G.keys['KeyA']) dx -= 1;
        if (G.keys['KeyD']) dx += 1;

        if (dx || dy) {
            const len = Math.sqrt(dx * dx + dy * dy);
            this.x += (dx / len) * spd;
            this.y += (dy / len) * spd;
            this.x = Math.max(20, Math.min(CONFIG.WORLD_W - 20, this.x));
            this.y = Math.max(20, Math.min(CONFIG.WORLD_H - 20, this.y));
            this.anim = (this.anim + 0.15) % 8;
        }

        // Rotação segue o mouse
        this.rot = Math.atan2(G.mouse.wy - this.y, G.mouse.wx - this.x);

        // Auto-fire para armas automáticas
        if (G.mouse.down && this.weapon.auto) {
            this.attack();
        }
    }

    attack() {
        if (this.cooldown > 0 || this.inVehicle) return;

        const w = this.weapon;
        const wid = this.weaponId;
        this.cooldown = w.rate;

        if (wid === 'fists') {
            // Ataque corpo a corpo
            for (const t of [...G.peds, ...G.cops, ...G.targets]) {
                const dist = Math.hypot(t.x - this.x, t.y - this.y);
                if (dist < w.range) {
                    const ang = Math.atan2(t.y - this.y, t.x - this.x);
                    const diff = Math.abs(this.rot - ang);
                    if (diff < Math.PI / 2 || diff > Math.PI * 1.5) {
                        t.takeDamage(w.dmg, this);
                        G.score += 10;
                    }
                }
            }
        } else if (this.ammo[wid] > 0) {
            // Ataque com arma de fogo
            this.ammo[wid]--;
            updateUI();

            const pellets = w.pellets || 1;
            for (let i = 0; i < pellets; i++) {
                const spread = (Math.random() - 0.5) * (w.pellets ? 0.4 : 0.1);
                G.bullets.push(new Bullet(
                    this.x + Math.cos(this.rot) * 20,
                    this.y + Math.sin(this.rot) * 20,
                    this.rot + spread,
                    15,
                    w.dmg,
                    this
                ));
            }

            Audio.play('shot', this.x, this.y);
            spawnFlash(this.x + Math.cos(this.rot) * 25, this.y + Math.sin(this.rot) * 25);
        }
    }

    takeDamage(amt) {
        if (this.invuln > 0) return;

        // Armadura absorve parte do dano
        if (this.armor > 0) {
            const absorbed = Math.min(this.armor, amt * 0.7);
            this.armor -= absorbed;
            amt -= absorbed;
        }

        this.health -= amt;
        this.flash = 15;
        this.invuln = 30;
        spawnBlood(this.x, this.y);
        updateUI();

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        G.paused = true;
        document.getElementById('death-screen').style.display = 'flex';
        document.getElementById('death-stats').textContent =
            'Score: ' + G.score + ' | $' + G.money + ' | Kills: ' + G.kills;
    }

    giveWeapon(id, ammo) {
        if (!this.weapons.includes(id)) {
            this.weapons.push(id);
        }
        this.ammo[id] = Math.min((this.ammo[id] || 0) + ammo, WEAPONS[id].max);
        updateUI();
    }

    draw() {
        if (this.inVehicle) return;

        const px = this.x - G.cam.x;
        const py = this.y - G.cam.y;

        // Tenta usar sprite do GTA
        const pedSprites = assets.spriteData?.categories?.ped;
        if (pedSprites && pedSprites.length > 0) {
            let dir = Math.floor(((this.rot + Math.PI) / (Math.PI * 2)) * 8 + 0.5) % 8;
            const idx = Math.min(dir + Math.floor(this.anim), pedSprites.length - 1);
            const s = pedSprites[idx];

            if (s) {
                ctx.save();
                ctx.translate(px, py);
                if (this.flash > 0) ctx.filter = 'brightness(2) hue-rotate(-50deg)';
                ctx.drawImage(assets.sprites, s.x, s.y, s.w, s.h, -s.w / 2, -s.h / 2, s.w, s.h);
                ctx.restore();
                return;
            }
        }

        // Fallback: desenho simples
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(this.rot + Math.PI / 2);
        ctx.fillStyle = this.flash > 0 ? '#f00' : '#0f0';
        ctx.fillRect(-10, -10, 20, 20);
        ctx.fillStyle = '#080';
        ctx.beginPath();
        ctx.moveTo(-5, -15);
        ctx.lineTo(5, -15);
        ctx.lineTo(0, -22);
        ctx.fill();
        ctx.restore();
    }
}
