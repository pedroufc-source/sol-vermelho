/**
 * SOL VERMELHO WebGL - Player
 */

class Player {
    constructor(scene, physics, x, y) {
        this.scene = scene;
        this.physics = physics;

        // Posição e movimento
        this.position = { x, y };
        this.velocity = { x: 0, y: 0 };
        this.rotation = 0;
        this.radius = CONFIG.PLAYER_SIZE;

        // Stats
        this.health = 100;
        this.armor = 0;
        this.money = 0;
        this.score = 0;

        // Armas
        this.weapons = ['fists'];
        this.currentWeapon = 0;
        this.ammo = { pistol: 0, uzi: 0, shotgun: 0 };

        // Controles
        this.keys = {};
        this.mouse = { x: 0, y: 0, down: false };
        this.running = false;

        // Estado
        this.inVehicle = null;
        this.lastShot = 0;

        // Cria mesh 3D
        this.createMesh();

        // Registra na física
        this.physics.addDynamic(this);

        // Setup controles
        this.setupControls();
    }

    createMesh() {
        // Corpo (cilindro pequeno)
        const bodyGeometry = new THREE.CylinderGeometry(
            this.radius, this.radius, 20, 8
        );
        const bodyMaterial = new THREE.MeshBasicMaterial({
            color: CONFIG.COLORS.PLAYER
        });
        this.mesh = new THREE.Mesh(bodyGeometry, bodyMaterial);

        // Cabeça
        const headGeometry = new THREE.SphereGeometry(5, 8, 8);
        const headMaterial = new THREE.MeshBasicMaterial({ color: 0xdeb887 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 14;
        this.mesh.add(head);

        // Indicador de direção (cone na frente)
        const dirGeometry = new THREE.ConeGeometry(4, 10, 4);
        const dirMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        this.dirIndicator = new THREE.Mesh(dirGeometry, dirMaterial);
        this.dirIndicator.rotation.x = Math.PI / 2;
        this.dirIndicator.position.z = this.radius + 6;
        this.mesh.add(this.dirIndicator);

        this.mesh.position.set(this.position.x, 10, this.position.y);
        this.scene.add(this.mesh);
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                this.running = true;
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                this.running = false;
            }
        });

        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        document.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.mouse.down = true;
                this.attack();
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.mouse.down = false;
            }
        });
    }

    update(delta, camera) {
        if (this.inVehicle) {
            this.updateInVehicle(delta);
            return;
        }

        // Movimento WASD
        const speed = this.running ? CONFIG.PLAYER_RUN_SPEED : CONFIG.PLAYER_SPEED;
        let dx = 0, dy = 0;

        if (this.keys['KeyW'] || this.keys['ArrowUp']) dy = -1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) dy = 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx = -1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) dx = 1;

        // Normaliza movimento diagonal
        if (dx !== 0 && dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            dx /= len;
            dy /= len;
        }

        this.velocity.x = dx * speed;
        this.velocity.y = dy * speed;

        // Rotação para o mouse (projetado no plano XZ)
        if (camera) {
            this.updateRotation(camera);
        }

        // Atualiza mesh
        this.mesh.position.x = this.position.x;
        this.mesh.position.y = 10;
        this.mesh.position.z = this.position.y;
        this.mesh.rotation.y = -this.rotation;
    }

    updateRotation(camera) {
        // Converte posição do mouse para coordenadas do mundo
        const vector = new THREE.Vector3(
            (this.mouse.x / window.innerWidth) * 2 - 1,
            -(this.mouse.y / window.innerHeight) * 2 + 1,
            0.5
        );

        vector.unproject(camera);
        const dir = vector.sub(camera.position).normalize();

        // Intersecção com plano Y=0
        const distance = -camera.position.y / dir.y;
        const worldPos = camera.position.clone().add(dir.multiplyScalar(distance));

        // Calcula ângulo
        const dx = worldPos.x - this.position.x;
        const dz = worldPos.z - this.position.y;
        this.rotation = Math.atan2(dx, dz);
    }

    updateInVehicle(delta) {
        const vehicle = this.inVehicle;
        if (!vehicle) return;

        // Aceleração (W/S)
        vehicle.throttle = 0;
        if (this.keys['KeyW'] || this.keys['ArrowUp']) {
            vehicle.throttle = 1;
        } else if (this.keys['KeyS'] || this.keys['ArrowDown']) {
            vehicle.throttle = -1;
        }

        // Direção (A/D)
        vehicle.steering = 0;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
            vehicle.steering = -1;
        } else if (this.keys['KeyD'] || this.keys['ArrowRight']) {
            vehicle.steering = 1;
        }

        // Freio de mão (Space)
        vehicle.handbrake = this.keys['Space'];

        // Atualiza posição do player para a do veículo
        this.position.x = vehicle.position.x;
        this.position.y = vehicle.position.y;
        this.rotation = vehicle.rotation;

        // Atualiza UI com velocidade
        this.updateVehicleUI();
    }

    updateVehicleUI() {
        const vehicle = this.inVehicle;
        if (!vehicle) return;

        // Mostra velocidade no HUD
        const zonaEl = document.getElementById('zona');
        if (zonaEl) {
            const speed = Math.abs(Math.floor(vehicle.speed));
            const zone = getZone(vehicle.position.x, vehicle.position.y);
            zonaEl.textContent = `${zone.name} | ${speed} km/h`;
        }
    }

    attack() {
        const weapon = WEAPONS[this.weapons[this.currentWeapon]];
        const now = Date.now();

        if (now - this.lastShot < weapon.rate) return;
        this.lastShot = now;

        // Verifica munição
        const weaponKey = this.weapons[this.currentWeapon];
        if (weaponKey !== 'fists') {
            if (this.ammo[weaponKey] <= 0) {
                // Sem munição, volta para punhos
                this.currentWeapon = 0;
                return;
            }
            this.ammo[weaponKey]--;
        }

        // Raycast para hit
        const dir = {
            x: Math.sin(this.rotation),
            y: Math.cos(this.rotation)
        };

        const hit = this.physics.raycast(
            { x: this.position.x, y: this.position.y, owner: this },
            dir,
            weapon.range
        );

        if (hit && hit.body && hit.body.takeDamage) {
            hit.body.takeDamage(weapon.damage, this);
        }

        // Visual do tiro
        this.createMuzzleFlash(dir, weapon.range);
    }

    createMuzzleFlash(dir, range) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array([
            this.position.x, 15, this.position.y,
            this.position.x + dir.x * range, 15, this.position.y + dir.y * range
        ]);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);

        // Remove após 50ms
        setTimeout(() => {
            this.scene.remove(line);
            geometry.dispose();
            material.dispose();
        }, 50);
    }

    cycleWeapon() {
        this.currentWeapon = (this.currentWeapon + 1) % this.weapons.length;
        this.updateUI();
    }

    addWeapon(weaponKey, ammo = 12) {
        if (!this.weapons.includes(weaponKey)) {
            this.weapons.push(weaponKey);
        }
        if (this.ammo[weaponKey] !== undefined) {
            this.ammo[weaponKey] += ammo;
        }
    }

    takeDamage(amount, attacker) {
        // Primeiro tira da armadura
        if (this.armor > 0) {
            const armorDamage = Math.min(this.armor, amount * 0.7);
            this.armor -= armorDamage;
            amount -= armorDamage;
        }

        this.health -= amount;

        if (this.health <= 0) {
            this.die();
        }

        this.updateUI();
    }

    die() {
        // TODO: Tela de morte, respawn
        this.health = 100;
        this.position.x = 500;
        this.position.y = 500;
        this.money = Math.floor(this.money * 0.9); // Perde 10% do dinheiro
    }

    updateUI() {
        const healthEl = document.querySelector('#health span');
        const moneyEl = document.querySelector('#money span');
        const weaponEl = document.getElementById('weapon');

        if (healthEl) healthEl.textContent = Math.max(0, Math.floor(this.health));
        if (moneyEl) moneyEl.textContent = this.money.toLocaleString('pt-BR');
        if (weaponEl) {
            const weapon = WEAPONS[this.weapons[this.currentWeapon]];
            const ammoText = this.weapons[this.currentWeapon] === 'fists'
                ? ''
                : ` (${this.ammo[this.weapons[this.currentWeapon]]})`;
            weaponEl.textContent = weapon.name + ammoText;
        }
    }
}
