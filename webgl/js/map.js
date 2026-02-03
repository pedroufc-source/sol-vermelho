/**
 * SOL VERMELHO WebGL - Sistema de Mapa
 * Renderiza Fortaleza em estilo maquete
 */

class GameMap {
    constructor(scene, physics) {
        this.scene = scene;
        this.physics = physics;
        this.buildings = [];
        this.roads = [];

        this.init();
    }

    init() {
        // Cria chão base
        this.createGround();

        // Cria bairros
        this.createZones();

        // Cria ruas principais
        this.createRoads();

        // Cria prédios
        this.createBuildings();

        // Cria landmarks
        this.createLandmarks();
    }

    /**
     * Chão base do mapa
     */
    createGround() {
        const geometry = new THREE.PlaneGeometry(CONFIG.WORLD_W, CONFIG.WORLD_H);
        const material = new THREE.MeshBasicMaterial({
            color: CONFIG.COLORS.GROUND,
            side: THREE.DoubleSide
        });
        const ground = new THREE.Mesh(geometry, material);
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(CONFIG.WORLD_W / 2, 0, CONFIG.WORLD_H / 2);
        this.scene.add(ground);
    }

    /**
     * Cria zonas coloridas para cada bairro
     */
    createZones() {
        for (const zone of ZONES) {
            const geometry = new THREE.PlaneGeometry(zone.w, zone.h);
            const color = getZoneColor(zone);
            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.1,
                side: THREE.DoubleSide
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.rotation.x = -Math.PI / 2;
            mesh.position.set(zone.x + zone.w / 2, 0.1, zone.y + zone.h / 2);
            this.scene.add(mesh);
        }
    }

    /**
     * Cria ruas principais
     */
    createRoads() {
        const roadMaterial = new THREE.MeshBasicMaterial({ color: CONFIG.COLORS.ROAD });

        // Avenidas principais horizontais
        const mainRoads = [
            { x: 0, y: 512, w: CONFIG.WORLD_W, h: 60 },      // Av. Leste-Oeste
            { x: 0, y: 1536, w: CONFIG.WORLD_W, h: 60 },     // Av. Bezerra de Menezes
            { x: 0, y: 2560, w: CONFIG.WORLD_W, h: 60 },     // BR-116
        ];

        // Avenidas principais verticais
        const verticalRoads = [
            { x: 512, y: 0, w: 60, h: CONFIG.WORLD_H },      // Av. Francisco Sá
            { x: 1536, y: 0, w: 60, h: CONFIG.WORLD_H },     // Av. da Universidade
            { x: 2560, y: 0, w: 60, h: CONFIG.WORLD_H },     // Av. Santos Dumont
            { x: 3584, y: 0, w: 60, h: CONFIG.WORLD_H },     // Av. Beira Mar
        ];

        for (const road of [...mainRoads, ...verticalRoads]) {
            const geometry = new THREE.PlaneGeometry(road.w, road.h);
            const mesh = new THREE.Mesh(geometry, roadMaterial);
            mesh.rotation.x = -Math.PI / 2;
            mesh.position.set(road.x + road.w / 2, 0.2, road.y + road.h / 2);
            this.scene.add(mesh);
            this.roads.push(road);
        }
    }

    /**
     * Cria prédios procedurais
     */
    createBuildings() {
        // Prédios por zona
        for (const zone of ZONES) {
            const buildingCount = this.getBuildingCount(zone);
            const avgHeight = this.getAvgBuildingHeight(zone);

            for (let i = 0; i < buildingCount; i++) {
                this.createBuilding(zone, avgHeight);
            }
        }
    }

    /**
     * Cria um prédio individual
     */
    createBuilding(zone, avgHeight) {
        // Posição aleatória dentro da zona
        const margin = 80;
        const x = zone.x + margin + Math.random() * (zone.w - margin * 2);
        const y = zone.y + margin + Math.random() * (zone.h - margin * 2);

        // Tamanho aleatório
        const w = 40 + Math.random() * 80;
        const h = 40 + Math.random() * 80;
        const height = avgHeight * (0.5 + Math.random());

        // Verifica se não colide com ruas
        for (const road of this.roads) {
            if (this.rectsOverlap(x, y, w, h, road.x, road.y, road.w, road.h)) {
                return; // Não cria prédio aqui
            }
        }

        // Cor varia com altura (mais alto = mais claro)
        const brightness = 0.3 + (height / 200) * 0.4;
        const color = new THREE.Color(brightness, brightness, brightness);

        const geometry = new THREE.BoxGeometry(w, height, h);
        const material = new THREE.MeshBasicMaterial({ color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, height / 2, y);
        this.scene.add(mesh);

        // Adiciona colisão
        this.physics.addStatic({ x: x - w / 2, y: y - h / 2, w, h });
        this.buildings.push({ x, y, w, h, height });
    }

    /**
     * Quantidade de prédios baseada na classe social
     */
    getBuildingCount(zone) {
        const counts = { 'A': 15, 'B': 20, 'C': 25, 'D': 20, 'E': 10, 'industrial': 8, 'restricted': 5 };
        const base = counts[zone.class] || 15;
        return Math.floor(base * (zone.w * zone.h) / (1024 * 1024));
    }

    /**
     * Altura média de prédios baseada na classe social
     */
    getAvgBuildingHeight(zone) {
        const heights = { 'A': 120, 'B': 100, 'C': 60, 'D': 40, 'E': 25, 'industrial': 30, 'restricted': 20 };
        return heights[zone.class] || 40;
    }

    /**
     * Cria landmarks de Fortaleza
     */
    createLandmarks() {
        // Catedral (Centro)
        this.createLandmark(1400, 800, 100, 80, 80, 0xffcc00, 'Catedral');

        // Mercado Central
        this.createLandmark(1200, 600, 150, 100, 30, 0x8b4513, 'Mercado Central');

        // Dragão do Mar (Praia de Iracema)
        this.createLandmark(2200, 1100, 200, 150, 25, 0x4169e1, 'Dragão do Mar');

        // Shopping Aldeota
        this.createLandmark(2800, 400, 200, 200, 40, 0xc0c0c0, 'Shopping');

        // Estádio Castelão (aproximado)
        this.createLandmark(1000, 3000, 300, 300, 50, 0x228b22, 'Castelão');

        // Porto
        this.createLandmark(3700, 600, 400, 200, 15, 0x696969, 'Porto');

        // Praia - água
        const waterGeometry = new THREE.PlaneGeometry(512, CONFIG.WORLD_H);
        const waterMaterial = new THREE.MeshBasicMaterial({
            color: CONFIG.COLORS.WATER,
            side: THREE.DoubleSide
        });
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2;
        water.position.set(CONFIG.WORLD_W - 128, 0.1, CONFIG.WORLD_H / 2);
        this.scene.add(water);
    }

    createLandmark(x, y, w, h, height, color, name) {
        const geometry = new THREE.BoxGeometry(w, height, h);
        const material = new THREE.MeshBasicMaterial({ color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, height / 2, y);
        mesh.name = name;
        this.scene.add(mesh);

        this.physics.addStatic({ x: x - w / 2, y: y - h / 2, w, h });
    }

    /**
     * Verifica overlap de retângulos
     */
    rectsOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
        return !(x1 + w1 < x2 || x1 > x2 + w2 || y1 + h1 < y2 || y1 > y2 + h2);
    }
}
