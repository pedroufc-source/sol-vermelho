/**
 * SOL VERMELHO WebGL - Sistema de Veículos
 */

// Tipos de veículos disponíveis
const VEHICLE_TYPES = {
    fusca: {
        name: 'Fusca',
        color: 0x3366cc,
        width: 30,
        length: 50,
        height: 25,
        maxSpeed: 300,
        acceleration: 150,
        handling: 0.04,
        braking: 200,
        mass: 800
    },
    gol: {
        name: 'Gol Quadrado',
        color: 0xcc3333,
        width: 28,
        length: 45,
        height: 22,
        maxSpeed: 350,
        acceleration: 180,
        handling: 0.05,
        braking: 220,
        mass: 750
    },
    kombi: {
        name: 'Kombi',
        color: 0xffffcc,
        width: 35,
        length: 60,
        height: 35,
        maxSpeed: 200,
        acceleration: 80,
        handling: 0.025,
        braking: 150,
        mass: 1200
    },
    chevette: {
        name: 'Chevette',
        color: 0x666666,
        width: 28,
        length: 48,
        height: 22,
        maxSpeed: 320,
        acceleration: 160,
        handling: 0.045,
        braking: 200,
        mass: 780
    },
    opala: {
        name: 'Opala',
        color: 0x111111,
        width: 32,
        length: 58,
        height: 24,
        maxSpeed: 400,
        acceleration: 200,
        handling: 0.035,
        braking: 180,
        mass: 1100
    },
    moto: {
        name: 'Moto',
        color: 0xff6600,
        width: 12,
        length: 30,
        height: 18,
        maxSpeed: 450,
        acceleration: 250,
        handling: 0.08,
        braking: 300,
        mass: 200
    }
};

class Vehicle {
    constructor(scene, physics, type, x, y, rotation = 0) {
        this.scene = scene;
        this.physics = physics;

        // Dados do tipo
        const data = VEHICLE_TYPES[type] || VEHICLE_TYPES.fusca;
        this.type = type;
        this.name = data.name;

        // Dimensões
        this.width = data.width;
        this.length = data.length;
        this.height = data.height;

        // Física
        this.maxSpeed = data.maxSpeed;
        this.acceleration = data.acceleration;
        this.handling = data.handling;
        this.braking = data.braking;
        this.mass = data.mass;

        // Posição e movimento
        this.position = { x, y };
        this.velocity = { x: 0, y: 0 };
        this.rotation = rotation;
        this.speed = 0;
        this.steerAngle = 0;

        // Estado
        this.driver = null;
        this.health = 100;
        this.fuel = 100;

        // Controles
        this.throttle = 0;  // -1 a 1
        this.steering = 0;  // -1 a 1
        this.handbrake = false;

        // Criar mesh
        this.createMesh(data.color);

        // Registrar na física
        this.radius = Math.max(this.width, this.length) / 2;
        this.physics.addDynamic(this);
    }

    createMesh(color) {
        // Corpo do carro
        const bodyGeometry = new THREE.BoxGeometry(this.width, this.height, this.length);
        const bodyMaterial = new THREE.MeshBasicMaterial({ color });
        this.mesh = new THREE.Mesh(bodyGeometry, bodyMaterial);

        // Teto (mais escuro)
        const roofGeometry = new THREE.BoxGeometry(this.width * 0.8, 8, this.length * 0.5);
        const roofMaterial = new THREE.MeshBasicMaterial({ color: 0x222222 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = this.height / 2 + 4;
        this.mesh.add(roof);

        // Rodas (4 cilindros)
        const wheelGeometry = new THREE.CylinderGeometry(6, 6, 4, 8);
        const wheelMaterial = new THREE.MeshBasicMaterial({ color: 0x111111 });

        const wheelPositions = [
            { x: -this.width / 2 - 2, z: this.length / 3 },
            { x: this.width / 2 + 2, z: this.length / 3 },
            { x: -this.width / 2 - 2, z: -this.length / 3 },
            { x: this.width / 2 + 2, z: -this.length / 3 }
        ];

        this.wheels = [];
        for (const pos of wheelPositions) {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos.x, -this.height / 2 + 6, pos.z);
            this.mesh.add(wheel);
            this.wheels.push(wheel);
        }

        // Faróis
        const lightGeometry = new THREE.BoxGeometry(6, 4, 2);
        const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffaa });
        const leftLight = new THREE.Mesh(lightGeometry, lightMaterial);
        leftLight.position.set(-this.width / 3, 0, this.length / 2 + 1);
        this.mesh.add(leftLight);

        const rightLight = new THREE.Mesh(lightGeometry, lightMaterial);
        rightLight.position.set(this.width / 3, 0, this.length / 2 + 1);
        this.mesh.add(rightLight);

        // Posicionar
        this.mesh.position.set(this.position.x, this.height / 2 + 2, this.position.y);
        this.mesh.rotation.y = -this.rotation;
        this.scene.add(this.mesh);
    }

    update(delta) {
        if (!this.driver) {
            // Sem motorista, apenas aplica fricção
            this.speed *= 0.98;
            this.applyMovement(delta);
            return;
        }

        // Aceleração/freio
        if (this.throttle > 0) {
            this.speed += this.acceleration * this.throttle * delta;
        } else if (this.throttle < 0) {
            if (this.speed > 0) {
                this.speed -= this.braking * delta;
            } else {
                this.speed += this.acceleration * 0.5 * this.throttle * delta; // Ré
            }
        }

        // Limita velocidade
        this.speed = Math.max(-this.maxSpeed * 0.3, Math.min(this.maxSpeed, this.speed));

        // Fricção natural
        if (this.throttle === 0) {
            this.speed *= 0.99;
        }

        // Freio de mão
        if (this.handbrake) {
            this.speed *= 0.95;
            // Drift!
            this.steerAngle *= 1.5;
        }

        // Direção (só funciona em movimento)
        if (Math.abs(this.speed) > 10) {
            const turnAmount = this.handling * this.steering * (this.speed / this.maxSpeed);
            this.rotation += turnAmount * Math.sign(this.speed);
        }

        this.applyMovement(delta);
    }

    applyMovement(delta) {
        // Converte velocidade para componentes X/Y
        this.velocity.x = Math.sin(this.rotation) * this.speed;
        this.velocity.y = Math.cos(this.rotation) * this.speed;

        // Atualiza mesh
        this.mesh.position.x = this.position.x;
        this.mesh.position.z = this.position.y;
        this.mesh.rotation.y = -this.rotation;

        // Gira rodas baseado na velocidade
        const wheelRotation = this.speed * delta * 0.1;
        for (const wheel of this.wheels) {
            wheel.rotation.x += wheelRotation;
        }
    }

    /**
     * Jogador entra no veículo
     */
    enter(player) {
        if (this.driver) return false;

        this.driver = player;
        player.inVehicle = this;
        player.mesh.visible = false;

        return true;
    }

    /**
     * Jogador sai do veículo
     */
    exit() {
        if (!this.driver) return null;

        const player = this.driver;
        this.driver = null;
        player.inVehicle = null;
        player.mesh.visible = true;

        // Posiciona jogador ao lado do carro
        player.position.x = this.position.x + Math.cos(this.rotation) * (this.width + 20);
        player.position.y = this.position.y - Math.sin(this.rotation) * (this.width + 20);

        // Para o carro
        this.throttle = 0;
        this.steering = 0;

        return player;
    }

    /**
     * Recebe dano
     */
    takeDamage(amount) {
        this.health -= amount;

        // Muda cor para mostrar dano
        if (this.health < 30) {
            this.mesh.children[0]?.material?.color?.setHex(0x333333);
        }

        if (this.health <= 0) {
            this.explode();
        }
    }

    /**
     * Veículo explode
     */
    explode() {
        // Ejeta motorista
        if (this.driver) {
            const player = this.exit();
            if (player) {
                player.takeDamage(50);
            }
        }

        // Visual de explosão (esfera laranja temporária)
        const explosionGeometry = new THREE.SphereGeometry(this.length, 8, 8);
        const explosionMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.8
        });
        const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
        explosion.position.copy(this.mesh.position);
        this.scene.add(explosion);

        // Anima explosão
        let scale = 1;
        const animate = () => {
            scale += 0.1;
            explosion.scale.set(scale, scale, scale);
            explosion.material.opacity -= 0.05;

            if (explosion.material.opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(explosion);
                explosionGeometry.dispose();
                explosionMaterial.dispose();
            }
        };
        animate();

        // Remove veículo
        this.scene.remove(this.mesh);
        this.physics.remove(this);
    }

    /**
     * Distância até um ponto
     */
    distanceTo(x, y) {
        return Math.hypot(this.position.x - x, this.position.y - y);
    }
}
