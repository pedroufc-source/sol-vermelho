/**
 * Sol Vermelho - Fortaleza Map Generator
 * Gera geometria 3D procedural baseada nas zonas
 */

var SV = SV || {};

// ============================================================================
// SV.FortalezaMap - Map Generator
// ============================================================================
SV.FortalezaMap = function(game) {
    this.game = game;

    // Map dimensions
    this.width = SV.Config.WORLD.WIDTH;
    this.height = SV.Config.WORLD.HEIGHT;
    this.blockSize = SV.Config.WORLD.BLOCK_SIZE;

    // Three.js objects
    this.ground = null;
    this.buildings = [];
    this.roads = [];
    this.zoneLabels = [];

    // Grid for collision
    this.grid = [];

    console.log('[SV] FortalezaMap created');
};

// ============================================================================
// MAP GENERATION
// ============================================================================
SV.FortalezaMap.prototype.generate = function() {
    console.log('[SV] Generating Fortaleza map...');

    // Create ground plane
    this.createGround();

    // Create zone areas
    this.createZones();

    // Create road grid
    this.createRoads();

    // Create buildings
    this.createBuildings();

    // Create zone markers
    this.createZoneMarkers();

    console.log('[SV] Map generation complete');
};

// ============================================================================
// GROUND
// ============================================================================
SV.FortalezaMap.prototype.createGround = function() {
    // Large ground plane
    var geometry = new THREE.PlaneGeometry(this.width, this.height);
    var material = new THREE.MeshLambertMaterial({
        color: 0x3a5f0b,  // Dark green (grass)
        side: THREE.DoubleSide
    });

    this.ground = new THREE.Mesh(geometry, material);
    this.ground.position.set(this.width / 2, -this.height / 2, 0);
    this.ground.receiveShadow = true;

    this.game.scene.add(this.ground);
};

// ============================================================================
// ZONES
// ============================================================================
SV.FortalezaMap.prototype.createZones = function() {
    var zones = SV.Config.ZONAS;

    for (var i = 0; i < zones.length; i++) {
        var zone = zones[i];
        this.createZoneGround(zone);
    }
};

SV.FortalezaMap.prototype.createZoneGround = function(zone) {
    // Zone ground color based on class
    var color;
    switch (zone.classe) {
        case 'alta':
            color = 0x555555;  // Dark gray (paved)
            break;
        case 'media':
            color = 0x666655;  // Gray-brown
            break;
        case 'periferia':
            color = 0x553322;  // Brown (dirt)
            break;
        default:
            color = 0x444444;
    }

    var geometry = new THREE.PlaneGeometry(zone.w, zone.h);
    var material = new THREE.MeshLambertMaterial({
        color: color,
        side: THREE.DoubleSide
    });

    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
        zone.x + zone.w / 2,
        -(zone.y + zone.h / 2),
        0.5  // Slightly above ground
    );

    this.game.scene.add(mesh);
};

// ============================================================================
// ROADS
// ============================================================================
SV.FortalezaMap.prototype.createRoads = function() {
    var roadMaterial = new THREE.MeshLambertMaterial({
        color: 0x333333,
        side: THREE.DoubleSide
    });

    // Main horizontal roads
    var hRoads = [400, 800, 1200, 1600, 2000, 2400, 2800, 3200];
    for (var i = 0; i < hRoads.length; i++) {
        this.createRoad(0, hRoads[i], this.width, 40, roadMaterial);
    }

    // Main vertical roads
    var vRoads = [600, 1200, 1800, 2400, 3000, 3600];
    for (var j = 0; j < vRoads.length; j++) {
        this.createRoadVertical(vRoads[j], 0, 40, this.height, roadMaterial);
    }
};

SV.FortalezaMap.prototype.createRoad = function(x, y, width, height, material) {
    var geometry = new THREE.PlaneGeometry(width, height);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x + width / 2, -(y + height / 2), 1);
    this.game.scene.add(mesh);
    this.roads.push(mesh);
};

SV.FortalezaMap.prototype.createRoadVertical = function(x, y, width, height, material) {
    var geometry = new THREE.PlaneGeometry(width, height);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x + width / 2, -(y + height / 2), 1);
    this.game.scene.add(mesh);
    this.roads.push(mesh);
};

// ============================================================================
// BUILDINGS
// ============================================================================
SV.FortalezaMap.prototype.createBuildings = function() {
    var zones = SV.Config.ZONAS;

    for (var i = 0; i < zones.length; i++) {
        var zone = zones[i];
        this.createZoneBuildings(zone);
    }
};

SV.FortalezaMap.prototype.createZoneBuildings = function(zone) {
    // Building density and height based on zone class
    var density, minHeight, maxHeight, buildingColor;

    switch (zone.classe) {
        case 'alta':
            density = 0.4;
            minHeight = 40;
            maxHeight = 120;
            buildingColor = 0x8899aa;  // Light blue-gray
            break;
        case 'media':
            density = 0.3;
            minHeight = 20;
            maxHeight = 60;
            buildingColor = 0x888877;  // Beige
            break;
        case 'periferia':
            density = 0.2;
            minHeight = 10;
            maxHeight = 30;
            buildingColor = 0x775544;  // Brown
            break;
        default:
            density = 0.2;
            minHeight = 15;
            maxHeight = 40;
            buildingColor = 0x666666;
    }

    // Grid-based building placement
    var gridSize = 80;
    var cols = Math.floor(zone.w / gridSize);
    var rows = Math.floor(zone.h / gridSize);

    for (var row = 0; row < rows; row++) {
        for (var col = 0; col < cols; col++) {
            // Skip roads (every 4th cell roughly)
            if (col % 4 === 0 || row % 4 === 0) continue;

            // Random placement based on density
            if (Math.random() > density) continue;

            var bx = zone.x + col * gridSize + 10;
            var by = zone.y + row * gridSize + 10;
            var bw = gridSize - 20 + (Math.random() - 0.5) * 20;
            var bh = gridSize - 20 + (Math.random() - 0.5) * 20;
            var height = minHeight + Math.random() * (maxHeight - minHeight);

            this.createBuilding(bx, by, bw, bh, height, buildingColor);
        }
    }
};

SV.FortalezaMap.prototype.createBuilding = function(x, y, width, depth, height, color) {
    // Building body
    var geometry = new THREE.CubeGeometry(width, depth, height);
    var material = new THREE.MeshLambertMaterial({ color: color });
    var mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(
        x + width / 2,
        -(y + depth / 2),
        height / 2
    );

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.game.scene.add(mesh);
    this.buildings.push(mesh);

    // Create physics body for collision
    this.game.physics.createBoxBody(
        x + width / 2,
        y + depth / 2,
        width,
        depth,
        false  // Static
    );

    return mesh;
};

// ============================================================================
// ZONE MARKERS
// ============================================================================
SV.FortalezaMap.prototype.createZoneMarkers = function() {
    var zones = SV.Config.ZONAS;

    for (var i = 0; i < zones.length; i++) {
        var zone = zones[i];

        // Create floating text sprite for zone name
        var canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        var ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, 256, 64);

        // Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(zone.name, 128, 40);

        // Create texture and sprite
        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;

        var spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });

        var sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(200, 50, 1);
        sprite.position.set(
            zone.x + zone.w / 2,
            -(zone.y + zone.h / 2),
            150
        );

        this.game.scene.add(sprite);
        this.zoneLabels.push(sprite);
    }
};

// ============================================================================
// SPECIAL LOCATIONS
// ============================================================================
SV.FortalezaMap.prototype.createSpecialLocations = function() {
    // Shops
    var shops = SV.Config.SHOPS;
    for (var i = 0; i < shops.length; i++) {
        var shop = shops[i];
        this.createShopMarker(shop);
    }

    // Safe houses
    var safeHouses = SV.Config.SAFE_HOUSES;
    for (var j = 0; j < safeHouses.length; j++) {
        var house = safeHouses[j];
        this.createSafeHouseMarker(house);
    }
};

SV.FortalezaMap.prototype.createShopMarker = function(shop) {
    // Create a colored marker above shop location
    // Using CylinderGeometry with radiusTop=0 to create a cone (old Three.js)
    var geometry = new THREE.CylinderGeometry(0, 10, 30, 4);
    var color = shop.type === 'ammu' ? 0xff0000 :
                shop.type === 'health' ? 0x00ff00 : 0x0000ff;
    var material = new THREE.MeshLambertMaterial({ color: color });

    var marker = new THREE.Mesh(geometry, material);
    marker.position.set(shop.x, -shop.y, 80);
    marker.rotation.x = Math.PI;

    this.game.scene.add(marker);
};

SV.FortalezaMap.prototype.createSafeHouseMarker = function(house) {
    // Create a house icon marker
    var geometry = new THREE.CubeGeometry(20, 20, 20);
    var material = new THREE.MeshLambertMaterial({
        color: house.unlocked ? 0x00ff00 : 0xff6600
    });

    var marker = new THREE.Mesh(geometry, material);
    marker.position.set(house.x, -house.y, 60);

    this.game.scene.add(marker);
};

// ============================================================================
// UTILITY
// ============================================================================
SV.FortalezaMap.prototype.isWalkable = function(x, y) {
    // Check if position is walkable (not inside a building)
    // This is a simple bounds check - could be improved with grid
    for (var i = 0; i < this.buildings.length; i++) {
        var b = this.buildings[i];
        var hw = b.geometry.parameters.width / 2;
        var hd = b.geometry.parameters.depth / 2;

        if (x >= b.position.x - hw && x <= b.position.x + hw &&
            -y >= b.position.y - hd && -y <= b.position.y + hd) {
            return false;
        }
    }
    return true;
};

SV.FortalezaMap.prototype.getRandomSpawnPoint = function(zoneName) {
    // Get random walkable point in a zone
    var zone = null;
    var zones = SV.Config.ZONAS;

    for (var i = 0; i < zones.length; i++) {
        if (zones[i].name === zoneName) {
            zone = zones[i];
            break;
        }
    }

    if (!zone) {
        // Random point in world
        return {
            x: Math.random() * this.width,
            y: Math.random() * this.height
        };
    }

    // Random point in zone
    var attempts = 0;
    while (attempts < 100) {
        var x = zone.x + Math.random() * zone.w;
        var y = zone.y + Math.random() * zone.h;

        if (this.isWalkable(x, y)) {
            return { x: x, y: y };
        }
        attempts++;
    }

    // Fallback to zone center
    return {
        x: zone.x + zone.w / 2,
        y: zone.y + zone.h / 2
    };
};
