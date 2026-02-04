/**
 * SOL VERMELHO - EXPANSION PACK
 * Sistemas adicionais: dia/noite, clima, rádio, gangues, lojas, etc.
 */

// ==================== CICLO DIA/NOITE ====================
const DayNight = {
    time: 8 * 60,  // Começa às 8:00 (minutos do dia)
    speed: 0.5,    // 1 = tempo real, 0.5 = 2x mais rápido

    update() {
        this.time += this.speed / 60;
        if (this.time >= 24 * 60) this.time = 0;
    },

    getHour() {
        return Math.floor(this.time / 60);
    },

    getMinute() {
        return Math.floor(this.time % 60);
    },

    getTimeString() {
        return `${String(this.getHour()).padStart(2, '0')}:${String(this.getMinute()).padStart(2, '0')}`;
    },

    // Retorna opacidade do overlay de escuridão (0 = dia, 0.7 = noite)
    getDarkness() {
        const h = this.time / 60;
        if (h >= 6 && h < 7) return 0.6 - (h - 6) * 0.6;      // Amanhecer
        if (h >= 7 && h < 18) return 0;                        // Dia
        if (h >= 18 && h < 19) return (h - 18) * 0.3;         // Entardecer
        if (h >= 19 && h < 20) return 0.3 + (h - 19) * 0.3;   // Anoitecer
        return 0.6;                                            // Noite
    },

    // Cor do céu/overlay
    getSkyColor() {
        const h = this.time / 60;
        if (h >= 5 && h < 6) return 'rgba(255, 100, 50, 0.3)';   // Aurora
        if (h >= 6 && h < 7) return 'rgba(255, 200, 100, 0.2)';  // Amanhecer
        if (h >= 17 && h < 18) return 'rgba(255, 150, 50, 0.2)'; // Pôr do sol
        if (h >= 18 && h < 19) return 'rgba(255, 100, 50, 0.3)'; // Crepúsculo
        if (h >= 19 || h < 5) return 'rgba(0, 0, 30, 0.6)';      // Noite
        return null;  // Dia claro
    },

    render(ctx, width, height) {
        const color = this.getSkyColor();
        if (color) {
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, width, height);
        }

        // Luzes da cidade à noite
        if (this.getDarkness() > 0.3) {
            this.renderCityLights(ctx);
        }
    },

    renderCityLights(ctx) {
        // Luzes aleatórias baseadas em seed
        const brightness = this.getDarkness();
        ctx.fillStyle = `rgba(255, 220, 150, ${brightness * 0.8})`;

        for (let i = 0; i < 100; i++) {
            const x = ((i * 137 + 50) % 3500) - G.cam.x;
            const y = ((i * 251 + 100) % 3800) - G.cam.y;
            if (x > -10 && x < 810 && y > -10 && y < 610) {
                const flicker = Math.sin(G.time * 0.1 + i) > 0.8 ? 0.5 : 1;
                ctx.globalAlpha = brightness * flicker;
                ctx.beginPath();
                ctx.arc(x, y, 3 + Math.random(), 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
    }
};

// ==================== SISTEMA DE CLIMA ====================
const Weather = {
    current: 'clear',  // clear, cloudy, rain, storm
    intensity: 0,
    raindrops: [],
    thunder: 0,

    types: ['clear', 'clear', 'clear', 'cloudy', 'rain', 'storm'],

    change() {
        this.current = this.types[Math.floor(Math.random() * this.types.length)];
        this.intensity = this.current === 'storm' ? 1 : this.current === 'rain' ? 0.6 : 0;
        console.log('Clima:', this.current);
    },

    update() {
        // Chance de mudar clima a cada ~5 minutos de jogo
        if (Math.random() < 0.0001) this.change();

        // Atualizar gotas de chuva
        if (this.current === 'rain' || this.current === 'storm') {
            // Adicionar novas gotas
            const dropCount = this.current === 'storm' ? 15 : 8;
            for (let i = 0; i < dropCount; i++) {
                if (this.raindrops.length < 500) {
                    this.raindrops.push({
                        x: Math.random() * 900 - 50,
                        y: -10,
                        speed: 8 + Math.random() * 4,
                        length: 10 + Math.random() * 10
                    });
                }
            }

            // Mover gotas
            for (let i = this.raindrops.length - 1; i >= 0; i--) {
                this.raindrops[i].y += this.raindrops[i].speed;
                this.raindrops[i].x += 2;  // Vento
                if (this.raindrops[i].y > 650) {
                    this.raindrops.splice(i, 1);
                }
            }

            // Trovões durante tempestade
            if (this.current === 'storm' && this.thunder <= 0 && Math.random() < 0.002) {
                this.thunder = 5;
                // Som do trovão
                if (typeof Audio !== 'undefined' && Audio.ctx) {
                    const osc = Audio.ctx.createOscillator();
                    const gain = Audio.ctx.createGain();
                    osc.connect(gain);
                    gain.connect(Audio.ctx.destination);
                    osc.frequency.setValueAtTime(80, Audio.ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(30, Audio.ctx.currentTime + 0.5);
                    gain.gain.setValueAtTime(0.3, Audio.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, Audio.ctx.currentTime + 0.5);
                    osc.start();
                    osc.stop(Audio.ctx.currentTime + 0.5);
                }
            }
            if (this.thunder > 0) this.thunder--;
        }
    },

    render(ctx, width, height) {
        // Nuvens
        if (this.current !== 'clear') {
            ctx.fillStyle = this.current === 'storm' ? 'rgba(30, 30, 40, 0.4)' : 'rgba(100, 100, 110, 0.2)';
            ctx.fillRect(0, 0, width, height);
        }

        // Chuva
        if (this.current === 'rain' || this.current === 'storm') {
            ctx.strokeStyle = 'rgba(150, 180, 255, 0.5)';
            ctx.lineWidth = 1;
            for (const drop of this.raindrops) {
                ctx.beginPath();
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x + 2, drop.y + drop.length);
                ctx.stroke();
            }
        }

        // Flash de trovão
        if (this.thunder > 3) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(0, 0, width, height);
        }
    }
};

// ==================== SISTEMA DE RÁDIO ====================
const Radio = {
    stations: [
        {
            name: 'FORTAL FM',
            genre: 'Forró',
            songs: [
                { title: 'Esperando na Janela', artist: 'Gilberto Gil' },
                { title: 'Asa Branca', artist: 'Luiz Gonzaga' },
                { title: 'Xote das Meninas', artist: 'Luiz Gonzaga' },
                { title: 'Pagode Russo', artist: 'Luiz Gonzaga' },
                { title: 'Qui Nem Jiló', artist: 'Luiz Gonzaga' },
            ]
        },
        {
            name: 'CIDADE 102',
            genre: 'MPB/Pop',
            songs: [
                { title: 'Epitáfio', artist: 'Titãs' },
                { title: 'Ainda Lembro', artist: 'Marisa Monte' },
                { title: 'Velha Infância', artist: 'Tribalistas' },
                { title: 'Amor I Love You', artist: 'Marisa Monte' },
                { title: 'Pais e Filhos', artist: 'Legião Urbana' },
            ]
        },
        {
            name: 'BEAT 98',
            genre: 'Hip Hop/Funk',
            songs: [
                { title: 'Vida Loka Pt.2', artist: 'Racionais MCs' },
                { title: 'Negro Drama', artist: 'Racionais MCs' },
                { title: 'Eu Só Quero É Ser Feliz', artist: 'Rap Brasil' },
                { title: 'Rap do Silva', artist: 'MC Bob Rum' },
                { title: 'Soldado do Morro', artist: 'MV Bill' },
            ]
        },
        {
            name: 'NOTÍCIAS CE',
            genre: 'Notícias',
            news: [
                'Bom dia ouvinte! Trânsito intenso na Washington Soares.',
                'Previsão: sol forte, máxima de 32°C em Fortaleza.',
                'Ceará joga hoje às 16h no Castelão.',
                'Operação policial no Conjunto Ceará.',
                'Beach Park anuncia novo toboágua para o verão.',
            ]
        }
    ],

    currentStation: 0,
    currentSong: 0,
    songTimer: 0,
    visible: false,

    init() {
        this.currentSong = Math.floor(Math.random() * 5);
    },

    nextStation() {
        this.currentStation = (this.currentStation + 1) % this.stations.length;
        this.currentSong = Math.floor(Math.random() * 5);
        this.songTimer = 0;
        this.show();
    },

    update() {
        this.songTimer++;
        // Troca música a cada ~2 minutos de jogo
        if (this.songTimer > 7200) {
            this.songTimer = 0;
            const station = this.stations[this.currentStation];
            if (station.songs) {
                this.currentSong = (this.currentSong + 1) % station.songs.length;
            } else if (station.news) {
                this.currentSong = (this.currentSong + 1) % station.news.length;
            }
        }
    },

    getCurrentInfo() {
        const station = this.stations[this.currentStation];
        if (station.songs) {
            const song = station.songs[this.currentSong % station.songs.length];
            return { station: station.name, text: `${song.title} - ${song.artist}`, genre: station.genre };
        } else {
            return { station: station.name, text: station.news[this.currentSong % station.news.length], genre: 'Notícias' };
        }
    },

    show() {
        this.visible = true;
        setTimeout(() => this.visible = false, 4000);
    },

    hide() {
        this.visible = false;
    },

    render() {
        if (!this.visible || !G.player?.inVehicle) return;

        const info = this.getCurrentInfo();
        const el = document.getElementById('radio-display');
        if (el) {
            el.innerHTML = `<div style="color:#fc0;font-weight:bold">📻 ${info.station}</div><div style="color:#0f0;font-size:10px">${info.text}</div>`;
            el.style.display = 'block';
        }
    }
};

// ==================== GANGUES ====================
const Gangs = {
    list: [
        {
            id: 'cdl',
            name: 'Comando da Liberdade',
            color: '#f00',
            territory: [
                { x: 800, y: 3000, w: 800, h: 800 },  // Messejana
                { x: 300, y: 2300, w: 700, h: 600 },  // Montese
            ],
            hostile: ['gdl']
        },
        {
            id: 'gdl',
            name: 'Guardiões da Liberdade',
            color: '#00f',
            territory: [
                { x: 3000, y: 1000, w: 600, h: 600 },  // Praia
                { x: 2800, y: 1600, w: 500, h: 500 },
            ],
            hostile: ['cdl']
        },
        {
            id: 'cv',
            name: 'Comando Vermelho',
            color: '#a00',
            territory: [
                { x: 500, y: 700, w: 600, h: 700 },  // Fátima/Benfica
            ],
            hostile: ['cdl', 'gdl']
        }
    ],

    members: [],

    init() {
        // Spawn membros de gangue nos territórios
        for (const gang of this.list) {
            for (const t of gang.territory) {
                for (let i = 0; i < 5; i++) {
                    this.members.push({
                        gang: gang.id,
                        x: t.x + Math.random() * t.w,
                        y: t.y + Math.random() * t.h,
                        health: 80,
                        rot: Math.random() * Math.PI * 2,
                        cooldown: 0,
                        flash: 0,
                        color: gang.color
                    });
                }
            }
        }
    },

    getGangAt(x, y) {
        for (const gang of this.list) {
            for (const t of gang.territory) {
                if (x >= t.x && x < t.x + t.w && y >= t.y && y < t.y + t.h) {
                    return gang;
                }
            }
        }
        return null;
    },

    update() {
        for (const m of this.members) {
            if (m.cooldown > 0) m.cooldown--;
            if (m.flash > 0) m.flash--;

            // Verificar se player está no território e é hostil
            const dist = Math.hypot(G.player.x - m.x, G.player.y - m.y);

            // Ataca se player muito perto ou tem wanted alto
            if (dist < 200 && (G.wanted > 2 || dist < 80)) {
                const ang = Math.atan2(G.player.y - m.y, G.player.x - m.x);
                m.rot = ang;

                if (dist > 60) {
                    m.x += Math.cos(ang) * 1.5;
                    m.y += Math.sin(ang) * 1.5;
                }

                if (dist < 150 && m.cooldown === 0) {
                    m.cooldown = 25;
                    G.bullets.push(new Bullet(
                        m.x + Math.cos(ang) * 15,
                        m.y + Math.sin(ang) * 15,
                        ang + (Math.random() - 0.5) * 0.3,
                        10, 15, m
                    ));
                    if (typeof Audio !== 'undefined') Audio.play('shot', m.x, m.y);
                }
            }
        }
    },

    render(ctx) {
        for (const m of this.members) {
            const px = m.x - G.cam.x, py = m.y - G.cam.y;
            if (px < -50 || px > 850 || py < -50 || py > 650) continue;

            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(m.rot + Math.PI/2);
            ctx.fillStyle = m.flash > 0 ? '#fff' : m.color;
            ctx.fillRect(-8, -10, 16, 20);
            ctx.fillStyle = '#fca';
            ctx.beginPath();
            ctx.arc(0, -12, 5, 0, Math.PI * 2);
            ctx.fill();
            // Bandana
            ctx.fillStyle = m.color;
            ctx.fillRect(-6, -14, 12, 3);
            ctx.restore();
        }
    }
};

// ==================== LOJAS ====================
const Shops = {
    list: [
        {
            type: 'ammu',
            name: 'ARMAMENTOS NORDESTE',
            x: 2500, y: 1600,
            icon: '🔫',
            items: [
                { id: 'pistol', name: 'Pistola', price: 500, ammo: 24 },
                { id: 'uzi', name: 'Uzi', price: 1500, ammo: 60 },
                { id: 'shotgun', name: 'Shotgun', price: 2000, ammo: 16 },
                { id: 'armor', name: 'Colete', price: 800 },
            ]
        },
        {
            type: 'ammu',
            name: 'ARMAS DO SERTÃO',
            x: 1100, y: 3400,
            icon: '🔫',
            items: [
                { id: 'pistol', name: 'Pistola', price: 400, ammo: 24 },
                { id: 'shotgun', name: 'Shotgun', price: 1800, ammo: 16 },
            ]
        },
        {
            type: 'health',
            name: 'FARMÁCIA PAGUE MENOS',
            x: 2200, y: 1200,
            icon: '💊',
            items: [
                { id: 'health', name: 'Kit Médico', price: 200, value: 50 },
                { id: 'health_full', name: 'Kit Completo', price: 500, value: 100 },
            ]
        },
        {
            type: 'garage',
            name: 'OFICINA DO ZÉ',
            x: 1600, y: 2800,
            icon: '🔧',
            items: [
                { id: 'repair', name: 'Reparar Veículo', price: 300 },
                { id: 'paint', name: 'Pintura Nova', price: 500 },
            ]
        }
    ],

    activeShop: null,

    checkProximity() {
        for (const shop of this.list) {
            const dist = Math.hypot(G.player.x - shop.x, G.player.y - shop.y);
            if (dist < 60 && !G.player.inVehicle) {
                return shop;
            }
        }
        return null;
    },

    enter(shop) {
        this.activeShop = shop;
        G.paused = true;
        this.renderMenu();
    },

    exit() {
        this.activeShop = null;
        G.paused = false;
        const menu = document.getElementById('shop-menu');
        if (menu) menu.style.display = 'none';
    },

    buy(item) {
        if (G.money < item.price) {
            showMsg('Dinheiro insuficiente!');
            return;
        }

        G.money -= item.price;

        if (item.id === 'health') {
            G.player.health = Math.min(100, G.player.health + item.value);
        } else if (item.id === 'health_full') {
            G.player.health = 100;
        } else if (item.id === 'armor') {
            G.player.armor = 100;
        } else if (item.id === 'repair' && G.player.inVehicle) {
            G.player.inVehicle.health = G.player.inVehicle.maxHealth;
        } else if (WEAPONS[item.id]) {
            G.player.giveWeapon(item.id, item.ammo);
        }

        showMsg(`Comprou ${item.name}!`);
        updateUI();
    },

    renderMenu() {
        let menu = document.getElementById('shop-menu');
        if (!menu) {
            menu = document.createElement('div');
            menu.id = 'shop-menu';
            menu.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.9);border:2px solid #f33;padding:20px;color:#fff;font-family:Arial;z-index:200;min-width:300px;';
            document.getElementById('gameContainer').appendChild(menu);
        }

        const shop = this.activeShop;
        let html = `<h2 style="color:#f33;margin-bottom:15px">${shop.icon} ${shop.name}</h2>`;
        html += `<p style="color:#0f0;margin-bottom:15px">Seu dinheiro: $${G.money}</p>`;

        for (const item of shop.items) {
            const canBuy = G.money >= item.price;
            html += `<div style="display:flex;justify-content:space-between;padding:8px;margin:5px 0;background:${canBuy ? '#222' : '#111'};cursor:${canBuy ? 'pointer' : 'not-allowed'}"
                onclick="${canBuy ? `Shops.buy(Shops.activeShop.items[${shop.items.indexOf(item)}])` : ''}">
                <span>${item.name}</span>
                <span style="color:${canBuy ? '#0f0' : '#f00'}">$${item.price}</span>
            </div>`;
        }

        html += `<button onclick="Shops.exit()" style="margin-top:15px;padding:10px 20px;background:#f33;border:none;color:#fff;cursor:pointer;width:100%">SAIR [ESC]</button>`;

        menu.innerHTML = html;
        menu.style.display = 'block';
    },

    render(ctx) {
        for (const shop of this.list) {
            const px = shop.x - G.cam.x, py = shop.y - G.cam.y;
            if (px < -50 || px > 850 || py < -50 || py > 650) continue;

            // Marcador da loja
            ctx.fillStyle = 'rgba(0, 200, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(px, py, 40, 0, Math.PI * 2);
            ctx.fill();

            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(shop.icon, px, py + 7);

            // Se perto, mostrar nome
            const dist = Math.hypot(G.player.x - shop.x, G.player.y - shop.y);
            if (dist < 100) {
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 10px Arial';
                ctx.fillText(shop.name, px, py - 50);
                ctx.fillStyle = '#0f0';
                ctx.font = '9px Arial';
                ctx.fillText('[F] Entrar', px, py - 38);
            }
        }
    }
};

// ==================== ESCONDERIJOS ====================
const SafeHouses = {
    list: [
        {
            name: 'BARRACO (Montese)',
            x: 500, y: 2500,
            unlocked: true,
            saves: true
        },
        {
            name: 'APARTAMENTO (Centro)',
            x: 1400, y: 2000,
            unlocked: false,
            price: 5000,
            saves: true
        },
        {
            name: 'COBERTURA (Meireles)',
            x: 3100, y: 700,
            unlocked: false,
            price: 25000,
            saves: true,
            garage: true
        },
    ],

    current: null,

    checkProximity() {
        for (const h of this.list) {
            if (!h.unlocked) continue;
            const dist = Math.hypot(G.player.x - h.x, G.player.y - h.y);
            if (dist < 40 && !G.player.inVehicle) {
                return h;
            }
        }
        return null;
    },

    enter(house) {
        this.current = house;
        G.player.health = 100;
        G.wanted = 0;
        G.cops = [];
        showMsg(`${house.name}\nVida restaurada!\nJogo salvo.`);
        this.save();
    },

    buy(house) {
        if (G.money < house.price) {
            showMsg('Dinheiro insuficiente!');
            return false;
        }
        G.money -= house.price;
        house.unlocked = true;
        showMsg(`Comprou: ${house.name}`);
        updateUI();
        return true;
    },

    save() {
        const data = {
            money: G.money,
            score: G.score,
            kills: G.kills,
            mission: G.missionIdx,
            weapons: G.player.weapons,
            ammo: G.player.ammo,
            houses: this.list.map(h => h.unlocked)
        };
        localStorage.setItem('sol_vermelho_save', JSON.stringify(data));
        console.log('Jogo salvo!');
    },

    load() {
        const data = JSON.parse(localStorage.getItem('sol_vermelho_save'));
        if (data) {
            G.money = data.money || 0;
            G.score = data.score || 0;
            G.kills = data.kills || 0;
            G.missionIdx = data.mission || 0;
            if (data.weapons) G.player.weapons = data.weapons;
            if (data.ammo) G.player.ammo = data.ammo;
            if (data.houses) {
                data.houses.forEach((u, i) => {
                    if (this.list[i]) this.list[i].unlocked = u;
                });
            }
            updateUI();
            return true;
        }
        return false;
    },

    render(ctx) {
        for (const h of this.list) {
            const px = h.x - G.cam.x, py = h.y - G.cam.y;
            if (px < -50 || px > 850 || py < -50 || py > 650) continue;

            // Casa
            ctx.fillStyle = h.unlocked ? 'rgba(0, 150, 255, 0.5)' : 'rgba(150, 150, 150, 0.3)';
            ctx.fillRect(px - 20, py - 20, 40, 40);

            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(h.unlocked ? '🏠' : '🔒', px, py + 5);

            const dist = Math.hypot(G.player.x - h.x, G.player.y - h.y);
            if (dist < 80) {
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 9px Arial';
                ctx.fillText(h.name, px, py - 30);

                if (h.unlocked) {
                    ctx.fillStyle = '#0f0';
                    ctx.fillText('[F] Entrar e Salvar', px, py - 18);
                } else {
                    ctx.fillStyle = '#fc0';
                    ctx.fillText(`$${h.price} para comprar`, px, py - 18);
                }
            }
        }
    }
};

// ==================== NOVAS ARMAS ====================
const NEW_WEAPONS = {
    knife: { name: 'FACA', dmg: 40, range: 50, rate: 10, ammo: Infinity },
    rifle: { name: 'RIFLE', dmg: 60, range: 800, rate: 40, ammo: 5, max: 30 },
    molotov: { name: 'MOLOTOV', dmg: 30, range: 300, rate: 60, ammo: 3, max: 10, explosive: true },
    grenade: { name: 'GRANADA', dmg: 80, range: 400, rate: 90, ammo: 1, max: 5, explosive: true },
};

// Adicionar ao sistema de armas
if (typeof WEAPONS !== 'undefined') {
    Object.assign(WEAPONS, NEW_WEAPONS);
}

// ==================== VEÍCULOS ADICIONAIS ====================
const VehicleTypes = {
    moto: { maxSpeed: 14, accel: 0.5, handling: 0.07, health: 50, width: 12, height: 28 },
    bus: { maxSpeed: 7, accel: 0.15, handling: 0.02, health: 300, width: 24, height: 70 },
    truck: { maxSpeed: 6, accel: 0.1, handling: 0.02, health: 400, width: 26, height: 60 },
    ambulance: { maxSpeed: 10, accel: 0.3, handling: 0.035, health: 150, width: 22, height: 50 },
};

// ==================== INTEGRAÇÃO ====================
// Inicializar sistemas quando o jogo carregar
window.addEventListener('load', () => {
    setTimeout(() => {
        if (typeof G !== 'undefined') {
            // Inicializar gangues
            if (Gangs.members.length === 0) {
                Gangs.init();
            }

            // Inicializar rádio
            Radio.init();

            // Tentar carregar save
            SafeHouses.load();

            console.log('%c=== EXPANSION PACK LOADED ===', 'color: #0f0; font-size: 14px');
            console.log('Sistemas: Dia/Noite, Clima, Rádio, Gangues, Lojas, Esconderijos');
        }
    }, 1000);
});

// Adicionar controles extras
window.addEventListener('keydown', e => {
    if (typeof G === 'undefined' || !G.running) return;

    // [R] Trocar rádio no veículo
    if (e.code === 'KeyR' && G.player?.inVehicle) {
        Radio.nextStation();
    }

    // [F] Interagir com lojas e esconderijos
    if (e.code === 'KeyF' && !G.player?.inVehicle) {
        const shop = Shops.checkProximity();
        if (shop) { Shops.enter(shop); return; }

        const house = SafeHouses.checkProximity();
        if (house) { SafeHouses.enter(house); return; }
    }

    // [ESC] Fechar menu de loja
    if (e.code === 'Escape' && Shops.activeShop) {
        Shops.exit();
        e.preventDefault();
    }
});

// Exportar para uso global
window.DayNight = DayNight;
window.Weather = Weather;
window.Radio = Radio;
window.Gangs = Gangs;
window.Shops = Shops;
window.SafeHouses = SafeHouses;
