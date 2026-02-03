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

        // Câmera segue player
        this.updateCamera();

        // Atualiza HUD
        this.updateHUD();

        // Render
        this.renderer.render(this.scene, this.camera);

        // FPS counter
        this.updateFPS();
    }

    updateCamera() {
        // Câmera top-down com ângulo
        const targetX = this.player.position.x;
        const targetZ = this.player.position.y;

        // Posição da câmera: acima e atrás do player
        this.camera.position.x = targetX;
        this.camera.position.y = CONFIG.CAMERA_HEIGHT;
        this.camera.position.z = targetZ + 200; // Um pouco atrás

        // Olha para o player
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
            // TODO: Sistema de veículos
        }

        // ESC = Pause
        if (e.code === 'Escape') {
            this.togglePause();
        }
    }

    togglePause() {
        this.paused = !this.paused;
        // TODO: Menu de pause
    }
}

// Instância global
let game = null;
