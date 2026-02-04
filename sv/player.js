/**
 * Sol Vermelho - Player System
 * Jogador com movimento, armas, vida, armor
 */

var SV = SV || {};

// ============================================================================
// KEY CODES
// ============================================================================
SV.Keys = {
    W: 87, A: 65, S: 83, D: 68,
    UP: 38, LEFT: 37, DOWN: 40, RIGHT: 39,
    SHIFT: 16,
    SPACE: 32,
    E: 69,  // Enter vehicle
    Q: 81,  // Switch weapon
    R: 82,  // Radio / Reload
    F: 70,  // Interact
    P: 80   // Pause
};

// ============================================================================
// SV.Player - Main Player Class
// ============================================================================
SV.Player = function(game, x, y) {
    this.game = game;

    // Position
    this.x = x;
    this.y = y;
    this.rotation = 0;

    // Stats
    this.health = SV.Config.PLAYER.MAX_HEALTH;
    this.armor = 0;

    // Weapons
    this.weapons = ['fists'];
    this.curWeaponIdx = 0;
    this.ammo = {};
    this.cooldown = 0;

    // Vehicle state
    this.inVehicle = null;

    // Animation
    this.anim = 0;
    this.animTimer = 0;
    this.isMoving = false;
    this.isRunning = false;

    // Create visual mesh (simple colored box for now)
    this.createMesh();

    // Create physics body
    this.createPhysics();

    console.log('[SV] Player created at', x, y);
};

// ============================================================================
// MESH CREATION
// ============================================================================
SV.Player.prototype.createMesh = function() {
    // Player body (green box)
    var bodyGeom = new THREE.CubeGeometry(20, 20, 40);
    var bodyMat = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
    this.mesh = new THREE.Mesh(bodyGeom, bodyMat);

    // Head (smaller box on top)
    var headGeom = new THREE.CubeGeometry(12, 12, 12);
    var headMat = new THREE.MeshLambertMaterial({ color: 0xffcc99 });
    var head = new THREE.Mesh(headGeom, headMat);
    head.position.z = 26;
    this.mesh.add(head);

    // Direction indicator (small red box in front)
    var indicatorGeom = new THREE.CubeGeometry(6, 15, 6);
    var indicatorMat = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    var indicator = new THREE.Mesh(indicatorGeom, indicatorMat);
    indicator.position.y = -15;
    indicator.position.z = 10;
    this.mesh.add(indicator);

    // Position mesh
    this.mesh.position.set(this.x, -this.y, 20);
};

// ============================================================================
// PHYSICS
// ============================================================================
SV.Player.prototype.createPhysics = function() {
    this.body = this.game.physics.createCircleBody(this.x, this.y, 10, true);
    this.body.SetFixedRotation(true);
};

// ============================================================================
// UPDATE
// ============================================================================
SV.Player.prototype.update = function(delta, keys) {
    if (this.inVehicle) {
        this.updateInVehicle(delta, keys);
    } else {
        this.updateOnFoot(delta, keys);
    }

    // Update cooldown
    if (this.cooldown > 0) {
        this.cooldown -= delta;
    }

    // Sync mesh with physics
    this.syncMesh();
};

SV.Player.prototype.updateOnFoot = function(delta, keys) {
    var speed = SV.Config.PLAYER.WALK_SPEED;
    var rotSpeed = SV.Config.PLAYER.ROTATION_SPEED;

    // Running
    this.isRunning = keys[SV.Keys.SHIFT];
    if (this.isRunning) {
        speed = SV.Config.PLAYER.RUN_SPEED;
    }

    // Movement direction
    var moveX = 0;
    var moveY = 0;
    this.isMoving = false;

    // WASD / Arrow keys
    if (keys[SV.Keys.W] || keys[SV.Keys.UP]) {
        moveY = -1;
        this.isMoving = true;
    }
    if (keys[SV.Keys.S] || keys[SV.Keys.DOWN]) {
        moveY = 1;
        this.isMoving = true;
    }
    if (keys[SV.Keys.A] || keys[SV.Keys.LEFT]) {
        moveX = -1;
        this.isMoving = true;
    }
    if (keys[SV.Keys.D] || keys[SV.Keys.RIGHT]) {
        moveX = 1;
        this.isMoving = true;
    }

    // Normalize diagonal movement
    if (moveX !== 0 && moveY !== 0) {
        var diag = Math.sqrt(2) / 2;
        moveX *= diag;
        moveY *= diag;
    }

    // Apply velocity to physics body
    var b2Vec2 = Box2D.Common.Math.b2Vec2;
    var scale = this.game.physics.scale;

    if (this.isMoving) {
        var velX = moveX * speed / scale;
        var velY = moveY * speed / scale;
        this.body.SetLinearVelocity(new b2Vec2(velX, velY));

        // Update rotation to face movement direction
        if (moveX !== 0 || moveY !== 0) {
            this.rotation = Math.atan2(moveY, moveX) - Math.PI / 2;
        }
    } else {
        // Stop
        this.body.SetLinearVelocity(new b2Vec2(0, 0));
    }

    // Update position from physics
    var pos = this.body.GetPosition();
    this.x = pos.x * scale;
    this.y = pos.y * scale;

    // Animation
    this.updateAnimation(delta);

    // Attack on mouse down
    if (this.game.mouse.down) {
        this.attack();
    }
};

SV.Player.prototype.updateInVehicle = function(delta, keys) {
    // Vehicle controls handled by vehicle class
    // Player position follows vehicle
    if (this.inVehicle) {
        this.x = this.inVehicle.x;
        this.y = this.inVehicle.y;
        this.rotation = this.inVehicle.rotation;
    }
};

// ============================================================================
// MESH SYNC
// ============================================================================
SV.Player.prototype.syncMesh = function() {
    this.mesh.position.x = this.x;
    this.mesh.position.y = -this.y;
    this.mesh.rotation.z = -this.rotation;

    // Bobbing animation when moving
    if (this.isMoving) {
        this.mesh.position.z = 20 + Math.sin(this.animTimer * 10) * 2;
    } else {
        this.mesh.position.z = 20;
    }
};

// ============================================================================
// ANIMATION
// ============================================================================
SV.Player.prototype.updateAnimation = function(delta) {
    if (this.isMoving) {
        this.animTimer += delta * (this.isRunning ? 2 : 1);
        this.anim = Math.floor(this.animTimer * 8) % 8;
    } else {
        this.animTimer = 0;
        this.anim = 0;
    }
};

// ============================================================================
// COMBAT
// ============================================================================
SV.Player.prototype.attack = function() {
    if (this.cooldown > 0) return;

    var weapon = this.getCurrentWeapon();
    if (!weapon) return;

    // Check ammo
    if (!weapon.melee && weapon.ammo !== Infinity) {
        if (!this.ammo[this.weapons[this.curWeaponIdx]] ||
            this.ammo[this.weapons[this.curWeaponIdx]] <= 0) {
            return;
        }
        this.ammo[this.weapons[this.curWeaponIdx]]--;
    }

    // Set cooldown
    this.cooldown = weapon.rate / 60;

    // Create bullet or melee hit
    if (weapon.melee) {
        this.meleeAttack(weapon);
    } else {
        this.rangedAttack(weapon);
    }

    console.log('[SV] Attack with', weapon.name);
};

SV.Player.prototype.meleeAttack = function(weapon) {
    // TODO: Check for hits in front of player
    // Create hit effect
};

SV.Player.prototype.rangedAttack = function(weapon) {
    // Calculate direction
    var dirX = Math.sin(this.rotation);
    var dirY = -Math.cos(this.rotation);

    // Create bullet
    var bullet = new SV.Bullet(
        this.game,
        this.x + dirX * 20,
        this.y + dirY * 20,
        dirX, dirY,
        weapon
    );
    this.game.bullets.push(bullet);
};

SV.Player.prototype.getCurrentWeapon = function() {
    var weaponName = this.weapons[this.curWeaponIdx];
    return SV.Config.WEAPONS[weaponName];
};

SV.Player.prototype.switchWeapon = function() {
    this.curWeaponIdx = (this.curWeaponIdx + 1) % this.weapons.length;
    var weapon = this.getCurrentWeapon();
    console.log('[SV] Switched to', weapon.name);
};

// ============================================================================
// DAMAGE
// ============================================================================
SV.Player.prototype.takeDamage = function(amount) {
    // Armor absorbs 70% of damage
    if (this.armor > 0) {
        var armorDamage = Math.min(this.armor, amount * 0.7);
        this.armor -= armorDamage;
        amount -= armorDamage;
    }

    this.health -= amount;

    if (this.health <= 0) {
        this.health = 0;
        this.die();
    }

    console.log('[SV] Player took', amount, 'damage. Health:', this.health);
};

SV.Player.prototype.die = function() {
    console.log('[SV] Player died!');
    // TODO: Death screen, respawn
};

// ============================================================================
// VEHICLE INTERACTION
// ============================================================================
SV.Player.prototype.toggleVehicle = function() {
    if (this.inVehicle) {
        this.exitVehicle();
    } else {
        this.enterNearbyVehicle();
    }
};

SV.Player.prototype.enterNearbyVehicle = function() {
    // Find closest vehicle
    var closest = null;
    var closestDist = 60;  // Max distance to enter

    for (var i = 0; i < this.game.vehicles.length; i++) {
        var v = this.game.vehicles[i];
        var dist = Math.hypot(v.x - this.x, v.y - this.y);
        if (dist < closestDist) {
            closest = v;
            closestDist = dist;
        }
    }

    if (closest) {
        this.inVehicle = closest;
        closest.driver = this;
        this.mesh.visible = false;
        console.log('[SV] Entered vehicle');
    }
};

SV.Player.prototype.exitVehicle = function() {
    if (!this.inVehicle) return;

    // Exit to the left of vehicle
    var exitX = this.inVehicle.x + Math.cos(this.inVehicle.rotation) * 30;
    var exitY = this.inVehicle.y + Math.sin(this.inVehicle.rotation) * 30;

    this.x = exitX;
    this.y = exitY;

    // Update physics body position
    var scale = this.game.physics.scale;
    this.body.SetPosition(new Box2D.Common.Math.b2Vec2(this.x / scale, this.y / scale));

    this.inVehicle.driver = null;
    this.inVehicle = null;
    this.mesh.visible = true;

    console.log('[SV] Exited vehicle');
};

// ============================================================================
// INVENTORY
// ============================================================================
SV.Player.prototype.giveWeapon = function(weaponName, ammoAmount) {
    if (this.weapons.indexOf(weaponName) === -1) {
        this.weapons.push(weaponName);
    }

    var weapon = SV.Config.WEAPONS[weaponName];
    if (weapon && !weapon.melee) {
        this.ammo[weaponName] = (this.ammo[weaponName] || 0) + ammoAmount;
        if (weapon.max) {
            this.ammo[weaponName] = Math.min(this.ammo[weaponName], weapon.max);
        }
    }

    console.log('[SV] Gave weapon:', weaponName, ammoAmount);
};

SV.Player.prototype.giveMoney = function(amount) {
    SV.State.money += amount;
    console.log('[SV] Money:', SV.State.money);
};

SV.Player.prototype.giveArmor = function(amount) {
    this.armor = Math.min(this.armor + amount, SV.Config.PLAYER.MAX_ARMOR);
    console.log('[SV] Armor:', this.armor);
};

SV.Player.prototype.heal = function(amount) {
    this.health = Math.min(this.health + amount, SV.Config.PLAYER.MAX_HEALTH);
    console.log('[SV] Health:', this.health);
};

// ============================================================================
// SV.Bullet - Projectile Class
// ============================================================================
SV.Bullet = function(game, x, y, dirX, dirY, weapon) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.dirX = dirX;
    this.dirY = dirY;
    this.weapon = weapon;
    this.speed = 800;
    this.distance = 0;
    this.active = true;

    // Create visual
    var geom = new THREE.SphereGeometry(2, 4, 4);
    var mat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    this.mesh = new THREE.Mesh(geom, mat);
    this.mesh.position.set(x, -y, 25);
    game.scene.add(this.mesh);
};

SV.Bullet.prototype.update = function(delta) {
    if (!this.active) return;

    // Move
    var moveX = this.dirX * this.speed * delta;
    var moveY = this.dirY * this.speed * delta;

    this.x += moveX;
    this.y += moveY;
    this.distance += Math.hypot(moveX, moveY);

    // Update mesh
    this.mesh.position.x = this.x;
    this.mesh.position.y = -this.y;

    // Check range
    if (this.distance > this.weapon.range) {
        this.destroy();
    }

    // TODO: Check collisions with pedestrians, cops, vehicles
};

SV.Bullet.prototype.destroy = function() {
    this.active = false;
    this.game.scene.remove(this.mesh);
};
