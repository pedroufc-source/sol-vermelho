/**
 * SOL VERMELHO WebGL - Sistema de NPCs
 * Pedestres que andam pela cidade
 */

// Tipos de NPCs
const NPC_TYPES = {
    civil: {
        name: 'Civil',
        colors: [0x8b4513, 0x2f4f4f, 0x556b2f, 0x4a4a4a, 0x8b0000],
        speed: 50,
        hostile: false,
        health: 30
    },
    trabalhador: {
        name: 'Trabalhador',
        colors: [0xff8c00, 0xffd700, 0x00ff00],
        speed: 40,
        hostile: false,
        health: 40
    },
    gangster: {
        name: 'Gangster',
        colors: [0xff0000, 0x8b0000, 0x000000],
        speed: 70,
        hostile: true,
        health: 60,
        damage: 15
    },
    policia: {
        name: 'Policial',
        colors: [0x000080, 0x191970],
        speed: 80,
        hostile: false, // Só ataca com wanted
        health: 80,
        damage: 20
    }
};

class NPC {
    constructor(scene, physics, type, x, y) {
        this.scene = scene;
        this.physics = physics;

        // Dados do tipo
        const data = NPC_TYPES[type] || NPC_TYPES.civil;
        this.type = type;
        this.name = data.name;

        // Stats
        this.maxHealth = data.health;
        this.health = data.health;
        this.speed = data.speed;
        this.hostile = data.hostile;
        this.damage = data.damage || 10;

        // Posição e movimento
        this.position = { x, y };
        this.velocity = { x: 0, y: 0 };
        this.rotation = Math.random() * Math.PI * 2;
        this.radius = 6;  // Pessoas são finas

        // Estado
        this.state = 'idle'; // idle, walking, fleeing, attacking, dead
        this.target = null;
        this.stateTimer = 0;
        this.lastAttack = 0;

        // Pathfinding simples
        this.waypoint = null;
        this.waypointTimer = 0;

        // Criar mesh
        const color = data.colors[Math.floor(Math.random() * data.colors.length)];
        this.createMesh(color);

        // Registrar na física
        this.physics.addDynamic(this);
    }

    createMesh(color) {
        // Corpo (cilindro fino)
        const bodyGeometry = new THREE.CylinderGeometry(this.radius, this.radius, 18, 8);
        const bodyMaterial = new THREE.MeshBasicMaterial({ color });
        this.mesh = new THREE.Mesh(bodyGeometry, bodyMaterial);

        // Cabeça (esfera pequena)
        const headGeometry = new THREE.SphereGeometry(4, 8, 8);
        const headMaterial = new THREE.MeshBasicMaterial({ color: 0xdeb887 }); // Pele
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 12;
        this.mesh.add(head);

        // Posicionar
        this.mesh.position.set(this.position.x, 9, this.position.y);
        this.scene.add(this.mesh);
    }

    update(delta, player, npcs) {
        if (this.state === 'dead') return;

        this.stateTimer += delta;
        this.waypointTimer += delta;

        // Decide comportamento baseado no estado
        switch (this.state) {
            case 'idle':
                this.updateIdle(delta, player);
                break;
            case 'walking':
                this.updateWalking(delta);
                break;
            case 'fleeing':
                this.updateFleeing(delta, player);
                break;
            case 'attacking':
                this.updateAttacking(delta, player);
                break;
        }

        // Atualiza mesh
        this.mesh.position.x = this.position.x;
        this.mesh.position.z = this.position.y;
        this.mesh.rotation.y = -this.rotation;
    }

    updateIdle(delta, player) {
        // Verifica se deve reagir ao jogador
        const distToPlayer = this.distanceTo(player.position.x, player.position.y);

        if (this.hostile && distToPlayer < 200) {
            // Gangster ataca se player estiver perto
            this.state = 'attacking';
            this.target = player;
            return;
        }

        // Chance de começar a andar
        if (this.stateTimer > 2 + Math.random() * 3) {
            this.state = 'walking';
            this.stateTimer = 0;
            this.pickNewWaypoint();
        }
    }

    updateWalking(delta) {
        if (!this.waypoint) {
            this.state = 'idle';
            return;
        }

        // Move em direção ao waypoint
        const dx = this.waypoint.x - this.position.x;
        const dy = this.waypoint.y - this.position.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 20 || this.waypointTimer > 10) {
            // Chegou ou demorou demais
            this.state = 'idle';
            this.stateTimer = 0;
            this.waypoint = null;
            return;
        }

        // Move
        this.rotation = Math.atan2(dx, dy);
        this.velocity.x = (dx / dist) * this.speed;
        this.velocity.y = (dy / dist) * this.speed;
    }

    updateFleeing(delta, player) {
        // Corre na direção oposta ao jogador
        const dx = this.position.x - player.position.x;
        const dy = this.position.y - player.position.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 400) {
            // Longe o suficiente
            this.state = 'idle';
            this.stateTimer = 0;
            return;
        }

        this.rotation = Math.atan2(dx, dy);
        this.velocity.x = (dx / dist) * this.speed * 1.5;
        this.velocity.y = (dy / dist) * this.speed * 1.5;
    }

    updateAttacking(delta, player) {
        if (!player || player.health <= 0) {
            this.state = 'idle';
            return;
        }

        const dx = player.position.x - this.position.x;
        const dy = player.position.y - this.position.y;
        const dist = Math.hypot(dx, dy);

        // Desiste se muito longe
        if (dist > 400) {
            this.state = 'idle';
            this.stateTimer = 0;
            return;
        }

        this.rotation = Math.atan2(dx, dy);

        if (dist > 40) {
            // Persegue
            this.velocity.x = (dx / dist) * this.speed;
            this.velocity.y = (dy / dist) * this.speed;
        } else {
            // Perto o suficiente para atacar
            this.velocity.x = 0;
            this.velocity.y = 0;

            const now = Date.now();
            if (now - this.lastAttack > 1000) {
                this.lastAttack = now;
                player.takeDamage(this.damage, this);
            }
        }
    }

    pickNewWaypoint() {
        // Escolhe ponto aleatório próximo
        const range = 200;
        this.waypoint = {
            x: this.position.x + (Math.random() - 0.5) * range * 2,
            y: this.position.y + (Math.random() - 0.5) * range * 2
        };

        // Mantém dentro do mundo
        this.waypoint.x = Math.max(50, Math.min(CONFIG.WORLD_W - 50, this.waypoint.x));
        this.waypoint.y = Math.max(50, Math.min(CONFIG.WORLD_H - 50, this.waypoint.y));

        this.waypointTimer = 0;
    }

    /**
     * NPC foge (ao ouvir tiros, etc)
     */
    flee(fromX, fromY) {
        if (this.type === 'gangster' || this.type === 'policia') return;

        this.state = 'fleeing';
        this.stateTimer = 0;
    }

    /**
     * Recebe dano
     */
    takeDamage(amount, attacker) {
        this.health -= amount;

        // Reage
        if (this.type === 'civil' || this.type === 'trabalhador') {
            this.flee(attacker.position.x, attacker.position.y);
        } else if (this.type === 'gangster') {
            this.state = 'attacking';
            this.target = attacker;
        }

        if (this.health <= 0) {
            this.die();
        }
    }

    /**
     * NPC morre
     */
    die() {
        this.state = 'dead';
        this.velocity.x = 0;
        this.velocity.y = 0;

        // Deita o mesh
        this.mesh.rotation.x = Math.PI / 2;
        this.mesh.position.y = 5;

        // Muda cor para cinza
        if (this.mesh.material) {
            this.mesh.material.color.setHex(0x444444);
        }

        // Remove da física
        this.physics.remove(this);

        // Remove depois de um tempo
        setTimeout(() => {
            this.scene.remove(this.mesh);
        }, 10000);
    }

    /**
     * Distância até um ponto
     */
    distanceTo(x, y) {
        return Math.hypot(this.position.x - x, this.position.y - y);
    }
}

/**
 * Gerenciador de NPCs
 */
class NPCManager {
    constructor(scene, physics) {
        this.scene = scene;
        this.physics = physics;
        this.npcs = [];
        this.maxNPCs = 50;
    }

    /**
     * Spawna NPCs iniciais
     */
    spawnInitial(count = 30) {
        for (let i = 0; i < count; i++) {
            this.spawnRandom();
        }
    }

    /**
     * Spawna NPC aleatório
     */
    spawnRandom() {
        if (this.npcs.length >= this.maxNPCs) return;

        // Posição aleatória
        const x = 100 + Math.random() * (CONFIG.WORLD_W - 200);
        const y = 100 + Math.random() * (CONFIG.WORLD_H - 200);

        // Tipo baseado na zona
        const zone = getZone(x, y);
        const type = this.getTypeForZone(zone);

        const npc = new NPC(this.scene, this.physics, type, x, y);
        this.npcs.push(npc);

        return npc;
    }

    /**
     * Tipo de NPC baseado na zona
     */
    getTypeForZone(zone) {
        const rand = Math.random();

        if (zone.class === 'E') {
            // Periferia: mais gangsters
            if (rand < 0.2) return 'gangster';
            if (rand < 0.5) return 'trabalhador';
            return 'civil';
        } else if (zone.class === 'A' || zone.class === 'B') {
            // Bairros ricos: mais civis, alguns policiais
            if (rand < 0.1) return 'policia';
            return 'civil';
        } else {
            // Classe média
            if (rand < 0.05) return 'gangster';
            if (rand < 0.1) return 'policia';
            if (rand < 0.3) return 'trabalhador';
            return 'civil';
        }
    }

    /**
     * Spawna NPCs perto do jogador
     */
    spawnNearPlayer(player, radius = 500) {
        // Remove NPCs muito longe
        this.npcs = this.npcs.filter(npc => {
            const dist = npc.distanceTo(player.position.x, player.position.y);
            if (dist > 1000 && npc.state !== 'dead') {
                this.scene.remove(npc.mesh);
                this.physics.remove(npc);
                return false;
            }
            return true;
        });

        // Spawna novos se necessário
        while (this.npcs.filter(n => n.state !== 'dead').length < 20) {
            // Spawna em anel ao redor do jogador
            const angle = Math.random() * Math.PI * 2;
            const dist = radius + Math.random() * 200;
            const x = player.position.x + Math.cos(angle) * dist;
            const y = player.position.y + Math.sin(angle) * dist;

            // Verifica se está dentro do mundo
            if (x > 50 && x < CONFIG.WORLD_W - 50 && y > 50 && y < CONFIG.WORLD_H - 50) {
                const zone = getZone(x, y);
                const type = this.getTypeForZone(zone);
                const npc = new NPC(this.scene, this.physics, type, x, y);
                this.npcs.push(npc);
            }
        }
    }

    /**
     * Atualiza todos os NPCs
     */
    update(delta, player) {
        for (const npc of this.npcs) {
            npc.update(delta, player, this.npcs);
        }
    }

    /**
     * Faz NPCs fugirem de uma posição (explosão, tiro)
     */
    fleeFrom(x, y, radius = 200) {
        for (const npc of this.npcs) {
            if (npc.distanceTo(x, y) < radius) {
                npc.flee(x, y);
            }
        }
    }

    /**
     * Retorna NPCs próximos a uma posição
     */
    getNearby(x, y, radius) {
        return this.npcs.filter(npc =>
            npc.state !== 'dead' && npc.distanceTo(x, y) < radius
        );
    }
}
