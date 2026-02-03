/**
 * SOL VERMELHO - Pedestrians
 * Classes de pedestres, policiais e alvos de missão
 */

class Ped {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.rot = Math.random() * Math.PI * 2;
        this.health = 50;
        this.state = 'wander';
        this.targetX = x;
        this.targetY = y;
        this.timer = Math.random() * 100;
        this.flash = 0;
        this.anim = 0;
        this.spriteOff = Math.floor(Math.random() * 30);
    }

    update() {
        if (this.flash > 0) this.flash--;
        this.timer++;

        const dist = Math.hypot(G.player.x - this.x, G.player.y - this.y);

        if (this.state === 'flee') {
            // Fugindo do jogador
            const ang = Math.atan2(this.y - G.player.y, this.x - G.player.x);
            this.x += Math.cos(ang) * 3;
            this.y += Math.sin(ang) * 3;
            this.rot = ang;
            this.anim = (this.anim + 0.2) % 8;

            if (dist > 300) this.state = 'wander';
        } else {
            // Vagando
            if (this.timer > 100 + Math.random() * 100) {
                this.timer = 0;
                this.targetX = this.x + (Math.random() - 0.5) * 150;
                this.targetY = this.y + (Math.random() - 0.5) * 150;
            }

            const d = Math.hypot(this.targetX - this.x, this.targetY - this.y);
            if (d > 10) {
                const a = Math.atan2(this.targetY - this.y, this.targetX - this.x);
                this.x += Math.cos(a);
                this.y += Math.sin(a);
                this.rot = a;
                this.anim = (this.anim + 0.1) % 8;
            }

            // Foge se jogador está procurado
            if (dist < 120 && G.wanted > 0) {
                this.state = 'flee';
            }
        }

        // Limites do mundo
        this.x = Math.max(20, Math.min(CONFIG.WORLD_W - 20, this.x));
        this.y = Math.max(20, Math.min(CONFIG.WORLD_H - 20, this.y));
    }

    takeDamage(amt, attacker) {
        this.health -= amt;
        this.flash = 10;
        this.state = 'flee';
        spawnBlood(this.x, this.y);

        if (attacker === G.player) {
            increaseWanted(1, CRIME_TYPES.vida, this.x, this.y);
        }

        if (this.health <= 0) {
            this.die(attacker);
        }
    }

    die(killer) {
        const idx = G.peds.indexOf(this);
        if (idx > -1) G.peds.splice(idx, 1);

        // Drop de item
        if (Math.random() > 0.5) {
            G.pickups.push(new Pickup(this.x, this.y, 'money'));
        }

        if (killer === G.player) {
            G.kills++;
            G.score += 100;
            onKill();
        }

        spawnBlood(this.x, this.y, 10);

        // Respawn após delay
        setTimeout(() => {
            if (G.peds.length < CONFIG.MAX_PEDS) {
                G.peds.push(new Ped(
                    Math.random() * CONFIG.WORLD_W,
                    Math.random() * CONFIG.WORLD_H
                ));
            }
        }, 10000);
    }

    draw() {
        const px = this.x - G.cam.x;
        const py = this.y - G.cam.y;

        // Tenta usar sprite do GTA
        const pedSprites = assets.spriteData?.categories?.ped;
        if (pedSprites && pedSprites.length > 0) {
            let dir = Math.floor(((this.rot + Math.PI) / (Math.PI * 2)) * 8 + 0.5) % 8;
            const idx = Math.min(this.spriteOff + dir + Math.floor(this.anim), pedSprites.length - 1);
            const s = pedSprites[idx];

            if (s) {
                ctx.save();
                ctx.translate(px, py);
                if (this.flash > 0) ctx.filter = 'brightness(3)';
                ctx.drawImage(assets.sprites, s.x, s.y, s.w, s.h, -s.w / 2, -s.h / 2, s.w, s.h);
                ctx.restore();
                return;
            }
        }

        // Fallback
        ctx.fillStyle = this.flash > 0 ? '#fff' : '#88f';
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fill();
    }
}


/**
 * Target - Alvo de missão (inimigo marcado)
 */
class Target extends Ped {
    constructor(x, y, name = 'ALVO') {
        super(x, y);
        this.health = 100;
        this.name = name;
        this.cooldown = 0;
        this.state = 'guard';
    }

    update() {
        if (this.flash > 0) this.flash--;
        if (this.cooldown > 0) this.cooldown--;

        const dist = Math.hypot(G.player.x - this.x, G.player.y - this.y);

        // Comportamento agressivo
        if (dist < 300) {
            const ang = Math.atan2(G.player.y - this.y, G.player.x - this.x);
            this.rot = ang;

            if (dist > 60) {
                this.x += Math.cos(ang) * 2;
                this.y += Math.sin(ang) * 2;
                this.anim = (this.anim + 0.15) % 8;
            }

            // Atira no jogador
            if (dist < 200 && this.cooldown === 0 && !G.player.inVehicle) {
                this.cooldown = 30;
                G.bullets.push(new Bullet(
                    this.x + Math.cos(ang) * 15,
                    this.y + Math.sin(ang) * 15,
                    ang + (Math.random() - 0.5) * 0.4,
                    8, 15, this
                ));
                Audio.play('shot', this.x, this.y);
            }
        }

        // Limites
        this.x = Math.max(20, Math.min(CONFIG.WORLD_W - 20, this.x));
        this.y = Math.max(20, Math.min(CONFIG.WORLD_H - 20, this.y));
    }

    die(killer) {
        const idx = G.targets.indexOf(this);
        if (idx > -1) G.targets.splice(idx, 1);

        // Drop de arma
        if (Math.random() > 0.3) {
            G.pickups.push(new Pickup(this.x, this.y, Math.random() > 0.5 ? 'uzi' : 'money'));
        }

        if (killer === G.player) {
            G.kills++;
            G.score += 500;
            onKill(true); // true = é alvo de missão
        }

        spawnBlood(this.x, this.y, 15);
    }

    takeDamage(amt, attacker) {
        this.health -= amt;
        this.flash = 10;
        spawnBlood(this.x, this.y);

        if (attacker === G.player) {
            increaseWanted(1);
        }

        if (this.health <= 0) {
            this.die(attacker);
        }
    }

    draw() {
        const px = this.x - G.cam.x;
        const py = this.y - G.cam.y;

        // Indicador vermelho pulsante
        ctx.strokeStyle = `rgba(255, 0, 0, ${0.5 + Math.sin(G.time * 0.2) * 0.3})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, 25 + Math.sin(G.time * 0.15) * 3, 0, Math.PI * 2);
        ctx.stroke();

        // Corpo
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(this.rot + Math.PI / 2);
        ctx.fillStyle = this.flash > 0 ? '#fff' : '#800';
        ctx.fillRect(-10, -10, 20, 20);
        ctx.fillStyle = '#fca';
        ctx.beginPath();
        ctx.arc(0, -12, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Nome e vida
        ctx.fillStyle = '#f00';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, px, py - 35);

        ctx.fillStyle = '#222';
        ctx.fillRect(px - 15, py - 28, 30, 4);
        ctx.fillStyle = '#f00';
        ctx.fillRect(px - 15, py - 28, 30 * (this.health / 100), 4);
    }
}


/**
 * Cop - Policial
 */
class Cop extends Ped {
    constructor(x, y) {
        super(x, y);
        this.health = 80;
        this.cooldown = 0;
    }

    update() {
        if (this.flash > 0) this.flash--;
        if (this.cooldown > 0) this.cooldown--;

        const dist = Math.hypot(G.player.x - this.x, G.player.y - this.y);

        if (G.wanted > 0 && dist < 400) {
            // Persegue jogador
            const ang = Math.atan2(G.player.y - this.y, G.player.x - this.x);
            this.rot = ang;

            if (dist > 80) {
                this.x += Math.cos(ang) * 2.5;
                this.y += Math.sin(ang) * 2.5;
                this.anim = (this.anim + 0.15) % 8;
            }

            // Atira
            if (dist < 250 && this.cooldown === 0 && !G.player.inVehicle) {
                this.cooldown = 40;
                G.bullets.push(new Bullet(
                    this.x + Math.cos(ang) * 15,
                    this.y + Math.sin(ang) * 15,
                    ang + (Math.random() - 0.5) * 0.3,
                    10, 12, this
                ));
                Audio.play('shot', this.x, this.y);
            }
        } else {
            // Patrulha
            this.timer++;
            if (this.timer > 120) {
                this.timer = 0;
                this.targetX = this.x + (Math.random() - 0.5) * 200;
                this.targetY = this.y + (Math.random() - 0.5) * 200;
            }

            const d = Math.hypot(this.targetX - this.x, this.targetY - this.y);
            if (d > 10) {
                const a = Math.atan2(this.targetY - this.y, this.targetX - this.x);
                this.x += Math.cos(a) * 1.5;
                this.y += Math.sin(a) * 1.5;
                this.rot = a;
            }
        }

        // Limites
        this.x = Math.max(20, Math.min(CONFIG.WORLD_W - 20, this.x));
        this.y = Math.max(20, Math.min(CONFIG.WORLD_H - 20, this.y));
    }

    die(killer) {
        const idx = G.cops.indexOf(this);
        if (idx > -1) G.cops.splice(idx, 1);

        // Drop de pistola
        if (Math.random() > 0.4) {
            G.pickups.push(new Pickup(this.x, this.y, 'pistol'));
        }

        if (killer === G.player) {
            G.kills++;
            G.score += 300;
            increaseWanted(2, CRIME_TYPES.vida, this.x, this.y);
            onKill();
        }

        spawnBlood(this.x, this.y, 15);
    }

    draw() {
        const px = this.x - G.cam.x;
        const py = this.y - G.cam.y;

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(this.rot + Math.PI / 2);

        // Uniforme azul
        ctx.fillStyle = this.flash > 0 ? '#fff' : '#006';
        ctx.fillRect(-8, -8, 16, 16);

        // Cabeça
        ctx.fillStyle = '#fca';
        ctx.beginPath();
        ctx.arc(0, -10, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Barra de vida
        ctx.fillStyle = '#222';
        ctx.fillRect(px - 12, py - 20, 24, 3);
        ctx.fillStyle = '#0f0';
        ctx.fillRect(px - 12, py - 20, 24 * (this.health / 80), 3);
    }
}
