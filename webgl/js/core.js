/**
 * SOL VERMELHO WebGL - Core Engine
 */

class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = null;

        this.physics = null;
        this.map = null;
        this.player = null;

        // Veículos e NPCs
        this.vehicles = [];
        this.npcManager = null;

        this.running = false;
        this.paused = false;

        // Stats
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.fps = 0;
    }

    init() {
        // Three.js setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb); // Céu azul

        // Câmera perspectiva (olhando de cima em ângulo)
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.CAMERA_FOV,
            window.innerWidth / window.innerHeight,
            1,
            5000
        );

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        // Clock para delta time
        this.clock = new THREE.Clock();

        // Física
        this.physics = new Physics();

        // Mapa
        this.map = new GameMap(this.scene, this.physics);

        // Player (começa na Barra do Ceará)
        this.player = new Player(this.scene, this.physics, 500, 500);

        // Veículos iniciais
        this.spawnInitialVehicles();

        // NPCs
        this.npcManager = new NPCManager(this.scene, this.physics);
        this.npcManager.spawnInitial(30);

        // Luz ambiente
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        // Luz direcional (sol)
        const sunLight = new THREE.DirectionalLight(0xffffff, 0.5);
        sunLight.position.set(1000, 1000, 1000);
        this.scene.add(sunLight);

        // Resize handler
        window.addEventListener('resize', () => this.onResize());

        // Keyboard handlers
        document.addEventListener('keydown', (e) => this.onKeyDown(e));

        console.log('Sol Vermelho WebGL inicializado!');
    }

    start() {
        this.running = true;
        document.getElementById('start-screen').classList.add('hidden');
        this.animate();
    }

    animate() {
        if (!this.running) return;

        requestAnimationFrame(() => this.animate());

        if (this.paused) return;

        const delta = this.clock.getDelta();

        // Atualiza física
        this.physics.update(delta);

        // Atualiza player
        this.player.update(delta, this.camera);

        // Atualiza veículos
        for (const vehicle of this.vehicles) {
            vehicle.update(delta);
        }

        // Verifica atropelamentos
        this.checkVehicleCollisions();

        // Atualiza NPCs
        this.npcManager.update(delta, this.player);
        this.npcManager.spawnNearPlayer(this.player);

        // Câmera segue player (ou veículo)
        this.updateCamera();

        // Atualiza HUD
        this.updateHUD();

        // Render
        this.renderer.render(this.scene, this.camera);

        // FPS counter
        this.updateFPS();
    }

    updateCamera() {
        // Pega posição do alvo (player ou veículo)
        let targetX, targetZ;

        if (this.player.inVehicle) {
            targetX = this.player.inVehicle.position.x;
            targetZ = this.player.inVehicle.position.y;
        } else {
            targetX = this.player.position.x;
            targetZ = this.player.position.y;
        }

        // Posição da câmera: acima e atrás do alvo
        this.camera.position.x = targetX;
        this.camera.position.y = CONFIG.CAMERA_HEIGHT;
        this.camera.position.z = targetZ + 200;

        // Olha para o alvo
        this.camera.lookAt(targetX, 0, targetZ);
    }

    updateHUD() {
        // Atualiza zona
        const zone = getZone(this.player.position.x, this.player.position.y);
        const zonaEl = document.getElementById('zona');
        if (zonaEl) zonaEl.textContent = zone.name;

        // Debug info
        if (CONFIG.DEBUG) {
            const posEl = document.getElementById('pos');
            const zoneDebugEl = document.getElementById('zone-debug');

            if (posEl) {
                posEl.textContent = `${Math.floor(this.player.position.x)}, ${Math.floor(this.player.position.y)}`;
            }
            if (zoneDebugEl) {
                zoneDebugEl.textContent = `${zone.name} (${zone.class}) - Police: ${zone.policeDelay}s`;
            }
        }
    }

    updateFPS() {
        this.frameCount++;
        const now = performance.now();

        if (now - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = now;

            const fpsEl = document.getElementById('fps');
            if (fpsEl) fpsEl.textContent = this.fps;
        }
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onKeyDown(e) {
        // Q = Trocar arma
        if (e.code === 'KeyQ') {
            this.player.cycleWeapon();
        }

        // E = Entrar/sair veículo
        if (e.code === 'KeyE') {
            this.handleVehicleInteraction();
        }

        // ESC = Pause
        if (e.code === 'Escape') {
            this.togglePause();
        }
    }

    /**
     * Entrar/sair de veículos
     */
    handleVehicleInteraction() {
        if (this.player.inVehicle) {
            // Sair do veículo
            this.player.inVehicle.exit();
        } else {
            // Procura veículo próximo
            const nearbyVehicle = this.findNearbyVehicle();
            if (nearbyVehicle) {
                nearbyVehicle.enter(this.player);
            }
        }
    }

    /**
     * Encontra veículo próximo ao player
     */
    findNearbyVehicle() {
        const maxDist = 60;
        let closest = null;
        let closestDist = maxDist;

        for (const vehicle of this.vehicles) {
            const dist = vehicle.distanceTo(this.player.position.x, this.player.position.y);
            if (dist < closestDist && !vehicle.driver) {
                closest = vehicle;
                closestDist = dist;
            }
        }

        return closest;
    }

    /**
     * Verifica colisões de veículos com NPCs (atropelamento)
     */
    checkVehicleCollisions() {
        for (const vehicle of this.vehicles) {
            // Só verifica se veículo está em movimento
            if (Math.abs(vehicle.speed) < 20) continue;

            // Verifica colisão com cada NPC
            for (const npc of this.npcManager.npcs) {
                if (npc.state === 'dead') continue;

                const dist = vehicle.distanceTo(npc.position.x, npc.position.y);
                const hitRadius = vehicle.length / 2 + npc.radius;

                if (dist < hitRadius) {
                    // Atropelamento!
                    const damage = Math.abs(vehicle.speed) * 0.5;
                    npc.takeDamage(damage, vehicle);

                    // Empurra o NPC na direção do veículo
                    const pushForce = vehicle.speed * 0.3;
                    npc.velocity.x = Math.sin(vehicle.rotation) * pushForce;
                    npc.velocity.y = Math.cos(vehicle.rotation) * pushForce;

                    // Faz outros NPCs fugirem
                    this.npcManager.fleeFrom(npc.position.x, npc.position.y, 150);
                }
            }

            // Verifica colisão com player (se não estiver no veículo)
            if (!this.player.inVehicle && vehicle.driver) {
                const dist = vehicle.distanceTo(this.player.position.x, this.player.position.y);
                const hitRadius = vehicle.length / 2 + this.player.radius;

                if (dist < hitRadius) {
                    const damage = Math.abs(vehicle.speed) * 0.3;
                    this.player.takeDamage(damage, vehicle);

                    // Empurra o player
                    const pushForce = vehicle.speed * 0.2;
                    this.player.velocity.x = Math.sin(vehicle.rotation) * pushForce;
                    this.player.velocity.y = Math.cos(vehicle.rotation) * pushForce;
                }
            }
        }
    }

    /**
     * Spawna veículos iniciais
     */
    spawnInitialVehicles() {
        // Veículos espalhados pelo mapa
        const spawns = [
            { type: 'fusca', x: 600, y: 500 },
            { type: 'gol', x: 400, y: 700 },
            { type: 'kombi', x: 800, y: 300 },
            { type: 'chevette', x: 1200, y: 600 },
            { type: 'opala', x: 1500, y: 800 },
            { type: 'moto', x: 550, y: 450 },
            // Mais veículos em outras zonas
            { type: 'fusca', x: 2000, y: 1000 },
            { type: 'gol', x: 2500, y: 500 },
            { type: 'opala', x: 2800, y: 800 },
            { type: 'kombi', x: 1000, y: 1500 },
            { type: 'chevette', x: 1800, y: 1200 },
            { type: 'moto', x: 2200, y: 700 },
        ];

        for (const spawn of spawns) {
            const vehicle = new Vehicle(
                this.scene,
                this.physics,
                spawn.type,
                spawn.x,
                spawn.y,
                Math.random() * Math.PI * 2
            );
            this.vehicles.push(vehicle);
        }
    }

    togglePause() {
        this.paused = !this.paused;
        // TODO: Menu de pause
    }
}

// Instância global
let game = null;
