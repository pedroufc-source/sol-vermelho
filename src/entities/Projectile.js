/**
 * SOL VERMELHO - Projectiles & Pickups
 * Balas e itens coletáveis
 */

class Bullet {
    constructor(x, y, angle, speed, damage, owner) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.damage = damage;
        this.owner = owner;
        this.life = 40;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;

        // Colisão com pedestres
        for (const ped of G.peds) {
            if (Math.hypot(ped.x - this.x, ped.y - this.y) < 12) {
                ped.takeDamage(this.damage, this.owner);
                this.life = 0;
                return;
            }
        }

        // Colisão com alvos
        for (const t of G.targets) {
            if (Math.hypot(t.x - this.x, t.y - this.y) < 14) {
                t.takeDamage(this.damage, this.owner);
                this.life = 0;
                return;
            }
        }

        // Colisão com policiais
        for (const cop of G.cops) {
            if (Math.hypot(cop.x - this.x, cop.y - this.y) < 12) {
                cop.takeDamage(this.damage, this.owner);
                this.life = 0;
                return;
            }
        }

        // Colisão com veículos
        for (const v of G.vehicles) {
            if (this.x > v.x - 25 && this.x < v.x + 25 && this.y > v.y - 35 && this.y < v.y + 35) {
                v.takeDamage(this.damage);
                this.life = 0;
                spawnSparks(this.x, this.y);
                return;
            }
        }

        // Colisão com viaturas
        for (const pv of G.policeVehicles) {
            if (this.x > pv.x - 25 && this.x < pv.x + 25 && this.y > pv.y - 35 && this.y < pv.y + 35) {
                pv.takeDamage(this.damage);
                this.life = 0;
                spawnSparks(this.x, this.y);
                if (this.owner === G.player) {
                    increaseWanted(1, CRIME_TYPES.patrimonio, pv.x, pv.y);
                }
                return;
            }
        }

        // Colisão com jogador (se não for o dono)
        if (this.owner !== G.player && !G.player.inVehicle) {
            if (Math.hypot(G.player.x - this.x, G.player.y - this.y) < 12) {
                G.player.takeDamage(this.damage);
                this.life = 0;
            }
        }
    }

    draw() {
        ctx.fillStyle = '#ff0';
        ctx.beginPath();
        ctx.arc(this.x - G.cam.x, this.y - G.cam.y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}


class Pickup {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.bob = Math.random() * Math.PI * 2;

        // Configurações por tipo
        switch (type) {
            case 'health':
                this.color = '#f00';
                this.value = 25;
                break;
            case 'armor':
                this.color = '#00f';
                this.value = 25;
                break;
            case 'money':
                this.color = '#0f0';
                this.value = 50 + Math.floor(Math.random() * 150);
                break;
            case 'pistol':
                this.color = '#888';
                this.weapon = 'pistol';
                this.ammo = 12;
                break;
            case 'uzi':
                this.color = '#666';
                this.weapon = 'uzi';
                this.ammo = 30;
                break;
            case 'shotgun':
                this.color = '#642';
                this.weapon = 'shotgun';
                this.ammo = 8;
                break;
        }
    }

    update() {
        this.bob += 0.1;

        // Coleta automática quando perto
        if (Math.hypot(G.player.x - this.x, G.player.y - this.y) < 25) {
            this.collect();
        }
    }

    collect() {
        switch (this.type) {
            case 'health':
                G.player.health = Math.min(G.player.health + this.value, 100);
                showMsg('+' + this.value + ' VIDA');
                break;
            case 'armor':
                G.player.armor = Math.min(G.player.armor + this.value, 100);
                showMsg('+' + this.value + ' COLETE');
                break;
            case 'money':
                G.money += this.value;
                showMsg('+$' + this.value);
                break;
            default:
                if (this.weapon) {
                    G.player.giveWeapon(this.weapon, this.ammo);
                    showMsg(WEAPONS[this.weapon].name + ' +' + this.ammo);
                }
        }

        updateUI();

        // Remove da lista
        const idx = G.pickups.indexOf(this);
        if (idx > -1) G.pickups.splice(idx, 1);
    }

    draw() {
        const bob = Math.sin(this.bob) * 3;
        const px = this.x - G.cam.x;
        const py = this.y - G.cam.y + bob;

        // Halo
        ctx.fillStyle = this.color + '44';
        ctx.beginPath();
        ctx.arc(px, py, 16, 0, Math.PI * 2);
        ctx.fill();

        // Ícone
        ctx.fillStyle = this.color;

        if (this.type === 'health') {
            // Cruz
            ctx.fillRect(px - 6, py - 2, 12, 4);
            ctx.fillRect(px - 2, py - 6, 4, 12);
        } else if (this.type === 'money') {
            // Cifrão
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('$', px, py + 5);
        } else {
            // Arma genérica
            ctx.fillRect(px - 8, py - 3, 16, 6);
        }
    }
}
