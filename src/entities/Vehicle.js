/**
 * SOL VERMELHO - Vehicle
 * Classe de veículos (carros, motos, caminhões)
 */

class Vehicle {
    constructor(x, y, type = 'sedan') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.rot = Math.random() * Math.PI * 2;
        this.speed = 0;

        // Configurações por tipo
        this.maxSpeed = type === 'sport' ? 12 : type === 'truck' ? 6 : 9;
        this.accel = type === 'sport' ? 0.4 : 0.25;
        this.handling = type === 'truck' ? 0.03 : 0.045;
        this.health = type === 'truck' ? 200 : 100;
        this.maxHealth = this.health;

        this.driver = null;
        this.lateralV = 0;
        this.onFire = false;

        // Sprite index por tipo
        this.spriteIdx = type === 'sport' ? 5 : type === 'taxi' ? 10 : type === 'police' ? 15 : 0;
    }

    update() {
        // Fogo causa dano contínuo
        if (this.onFire && Math.random() > 0.9) {
            this.takeDamage(1);
            spawnFire(this.x + (Math.random() - 0.5) * 30, this.y + (Math.random() - 0.5) * 30);
        }

        // Fumaça quando danificado
        if (this.health < this.maxHealth * 0.5 && Math.random() > 0.85) {
            G.particles.push({
                x: this.x + (Math.random() - 0.5) * 20,
                y: this.y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 0.5,
                vy: -0.5 - Math.random(),
                life: 40,
                maxLife: 40,
                color: '#444',
                size: 6 + Math.random() * 8,
                type: 'smoke'
            });
        }

        // Sem motorista = desacelera sozinho
        if (!this.driver) {
            this.speed *= 0.98;
            this.x += Math.cos(this.rot - Math.PI / 2) * this.speed;
            this.y += Math.sin(this.rot - Math.PI / 2) * this.speed;
            return;
        }

        // Aceleração e frenagem
        if (G.keys['KeyW']) {
            this.speed = Math.min(this.speed + this.accel, this.maxSpeed);
        } else if (G.keys['KeyS']) {
            this.speed = Math.max(this.speed - this.accel * 1.5, -this.maxSpeed * 0.4);
        } else {
            this.speed *= 0.98;
        }

        // Drift com freio de mão
        if (G.keys['Space']) {
            this.speed *= 0.95;
            this.lateralV += this.speed * 0.1 * (G.keys['KeyA'] ? 1 : G.keys['KeyD'] ? -1 : 0);
        }

        // Direção
        if (Math.abs(this.speed) > 0.5) {
            const turn = this.handling * (this.speed > 0 ? 1 : -1);
            if (G.keys['KeyA']) {
                this.rot -= turn;
                this.lateralV -= this.speed * 0.02;
            }
            if (G.keys['KeyD']) {
                this.rot += turn;
                this.lateralV += this.speed * 0.02;
            }
        }

        // Rastro de derrapagem
        const isDrifting = Math.abs(this.lateralV) > 0.5 || (G.keys['Space'] && Math.abs(this.speed) > 3);
        if (isDrifting && Math.random() > 0.5) {
            const backOffset = 20;
            const wheelOffsetX = 12;
            for (let side = -1; side <= 1; side += 2) {
                const wx = this.x + Math.cos(this.rot - Math.PI / 2) * -backOffset + Math.cos(this.rot) * wheelOffsetX * side;
                const wy = this.y + Math.sin(this.rot - Math.PI / 2) * -backOffset + Math.sin(this.rot) * wheelOffsetX * side;
                G.particles.push({
                    x: wx, y: wy,
                    vx: 0, vy: 0,
                    life: 120, maxLife: 120,
                    color: '#222', size: 4,
                    type: 'skid'
                });
            }
        }

        // Movimento final
        this.lateralV *= 0.92;
        const moveAngle = this.rot + this.lateralV * 0.15;
        this.x += Math.cos(moveAngle - Math.PI / 2) * this.speed;
        this.y += Math.sin(moveAngle - Math.PI / 2) * this.speed;

        // Limites do mundo
        this.x = Math.max(40, Math.min(CONFIG.WORLD_W - 40, this.x));
        this.y = Math.max(40, Math.min(CONFIG.WORLD_H - 40, this.y));
        this.driver.x = this.x;
        this.driver.y = this.y;

        // Atropelamento
        if (Math.abs(this.speed) > 3) {
            this.checkPedCollision();
        }
    }

    checkPedCollision() {
        // Atropela pedestres
        for (const ped of G.peds) {
            if (Math.hypot(ped.x - this.x, ped.y - this.y) < 35) {
                ped.takeDamage(Math.abs(this.speed) * 12, this.driver);
                this.speed *= 0.8;
                increaseWanted(1, CRIME_TYPES.vida, ped.x, ped.y);
            }
        }
        // Atropela policiais
        for (const cop of G.cops) {
            if (Math.hypot(cop.x - this.x, cop.y - this.y) < 35) {
                cop.takeDamage(Math.abs(this.speed) * 12, this.driver);
                this.speed *= 0.8;
                increaseWanted(2, CRIME_TYPES.vida, cop.x, cop.y);
            }
        }
    }

    takeDamage(amt) {
        this.health -= amt;
        if (this.health < this.maxHealth * 0.2 && !this.onFire) {
            this.onFire = true;
        }
        if (this.health <= 0) {
            this.explode();
        }
    }

    explode() {
        createExplosion(this.x, this.y, 100, 60);

        if (this.driver) {
            this.driver.inVehicle = null;
            this.driver.x = this.x + 50;
            this.driver.takeDamage(30);
            this.driver = null;
        }

        const idx = G.vehicles.indexOf(this);
        if (idx > -1) G.vehicles.splice(idx, 1);

        G.score += 200;
        onVehicleDestroy();
    }

    draw() {
        const vx = this.x - G.cam.x;
        const vy = this.y - G.cam.y;

        // Tenta usar sprite do GTA
        const carSprites = assets.spriteData?.categories?.car;
        if (carSprites && carSprites.length > 0) {
            const idx = Math.min(this.spriteIdx, carSprites.length - 1);
            const s = carSprites[idx];

            if (s) {
                ctx.save();
                ctx.translate(vx, vy);
                ctx.rotate(this.rot);
                if (this.health < this.maxHealth * 0.5) ctx.filter = 'brightness(0.6)';
                ctx.drawImage(assets.sprites, s.x, s.y, s.w, s.h, -s.w / 2, -s.h / 2, s.w, s.h);
                ctx.restore();

                // Barra de vida
                if (this.health < this.maxHealth) {
                    this.drawHealthBar(vx, vy - 45);
                }
                return;
            }
        }

        // Fallback: desenho simples
        ctx.save();
        ctx.translate(vx, vy);
        ctx.rotate(this.rot);

        // Cor por tipo
        const colors = {
            police: '#008',
            taxi: '#fc0',
            sport: '#c44',
            sedan: '#48c',
            truck: '#666'
        };
        ctx.fillStyle = colors[this.type] || '#48c';
        ctx.fillRect(-16, -28, 32, 56);

        // Vidro
        ctx.fillStyle = 'rgba(100,150,200,0.7)';
        ctx.fillRect(-12, -20, 24, 12);

        // Rodas
        ctx.fillStyle = '#111';
        ctx.fillRect(-20, -22, 6, 10);
        ctx.fillRect(14, -22, 6, 10);
        ctx.fillRect(-20, 12, 6, 10);
        ctx.fillRect(14, 12, 6, 10);

        ctx.restore();

        // Barra de vida
        if (this.health < this.maxHealth) {
            this.drawHealthBar(vx, vy - 40);
        }
    }

    drawHealthBar(x, y) {
        ctx.fillStyle = '#222';
        ctx.fillRect(x - 20, y, 40, 4);
        ctx.fillStyle = this.health > this.maxHealth * 0.3 ? '#0f0' : '#f00';
        ctx.fillRect(x - 20, y, 40 * (this.health / this.maxHealth), 4);
    }
}
