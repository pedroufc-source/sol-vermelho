/**
 * Sol Vermelho - Core Game Engine
 * Integra com WebGL-GTA (Three.js + Box2D)
 */

var SV = SV || {};

// ============================================================================
// GAME STATE - Estado global do jogo
// ============================================================================
SV.State = {
    running: false,
    paused: false,

    // Player stats
    money: 0,
    score: 0,
    kills: 0,
    wanted: 0,

    // Mission tracking
    missionIdx: 0,
    mission: null,
    chapter: 1,

    // Sanity system
    sanidade: 100,
    capsVisitas: 0,

    // Time
    gameTime: 8 * 60,  // 8:00 AM em minutos
    daySpeed: 0.5,

    // Weather
    weather: 'clear'
};

// ============================================================================
// SV.Game - Main Game Class
// ============================================================================
SV.Game = function() {
    var self = this;

    // Three.js setup
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();

    // Camera - isometric style
    this.camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        2000
    );
    this.camera.position.z = 500;
    this.scene.add(this.camera);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // Use setClearColorHex for older Three.js compatibility
    if (this.renderer.setClearColorHex) {
        this.renderer.setClearColorHex(0x87CEEB, 1);
    } else {
        this.renderer.setClearColor(0x87CEEB, 1);
    }  // Sky blue
    document.body.appendChild(this.renderer.domElement);

    // Physics (Box2D)
    this.physics = new SV.Physics();

    // Game objects
    this.player = null;
    this.vehicles = [];
    this.pedestrians = [];
    this.cops = [];
    this.bullets = [];
    this.particles = [];

    // Input
    this.keys = {};
    this.mouse = { x: 0, y: 0, down: false };

    // Map
    this.map = null;

    // Bind input handlers
    this.setupInput();

    // Animation loop reference
    this.animateRef = null;

    console.log('[SV] Game initialized');
};

// ============================================================================
// INITIALIZATION
// ============================================================================
SV.Game.prototype.init = function() {
    var self = this;

    // Create map
    this.map = new SV.FortalezaMap(this);
    this.map.generate();

    // Create player at starting position (Montese - periferia)
    var startX = 500;
    var startY = 2500;
    this.player = new SV.Player(this, startX, startY);
    this.scene.add(this.player.mesh);

    // Add ambient light
    var ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    // Add directional light (sun)
    this.sunLight = new THREE.DirectionalLight(0xffffff, 1);
    this.sunLight.position.set(100, 100, 100);
    this.scene.add(this.sunLight);

    // Position camera
    this.camera.position.x = startX;
    this.camera.position.y = -startY;

    // Mark as running
    SV.State.running = true;

    // Start game loop
    this.animate();

    console.log('[SV] Game started');
};

// ============================================================================
// INPUT HANDLING
// ============================================================================
SV.Game.prototype.setupInput = function() {
    var self = this;

    // Keyboard
    document.addEventListener('keydown', function(e) {
        self.keys[e.keyCode] = true;
        self.onKeyDown(e);
    });

    document.addEventListener('keyup', function(e) {
        self.keys[e.keyCode] = false;
    });

    // Mouse
    document.addEventListener('mousemove', function(e) {
        self.mouse.x = e.clientX;
        self.mouse.y = e.clientY;
    });

    document.addEventListener('mousedown', function(e) {
        self.mouse.down = true;
    });

    document.addEventListener('mouseup', function(e) {
        self.mouse.down = false;
    });

    // Prevent context menu
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    // Window resize
    window.addEventListener('resize', function() {
        self.camera.aspect = window.innerWidth / window.innerHeight;
        self.camera.updateProjectionMatrix();
        self.renderer.setSize(window.innerWidth, window.innerHeight);
    });
};

SV.Game.prototype.onKeyDown = function(e) {
    // P - Pause
    if (e.keyCode === 80) {
        SV.State.paused = !SV.State.paused;
        console.log('[SV] Paused:', SV.State.paused);
    }

    // Q - Switch weapon
    if (e.keyCode === 81 && this.player) {
        this.player.switchWeapon();
    }

    // E - Enter/Exit vehicle
    if (e.keyCode === 69 && this.player) {
        this.player.toggleVehicle();
    }
};

// ============================================================================
// GAME LOOP
// ============================================================================
SV.Game.prototype.animate = function() {
    var self = this;

    requestAnimationFrame(function() {
        self.animate();
    });

    if (SV.State.paused) {
        return;
    }

    var delta = this.clock.getDelta();

    // Update physics
    this.physics.step(delta);

    // Update player
    if (this.player) {
        this.player.update(delta, this.keys);

        // Camera follows player
        this.camera.position.x = this.player.x;
        this.camera.position.y = -this.player.y;
    }

    // Update game time
    this.updateTime(delta);

    // Render
    this.renderer.render(this.scene, this.camera);
};

// ============================================================================
// TIME SYSTEM
// ============================================================================
SV.Game.prototype.updateTime = function(delta) {
    SV.State.gameTime += delta * SV.State.daySpeed;

    // Reset at midnight
    if (SV.State.gameTime >= 24 * 60) {
        SV.State.gameTime = 0;
    }

    // Update lighting based on time
    var hour = Math.floor(SV.State.gameTime / 60);
    var darkness = 0;

    if (hour >= 18 || hour < 6) {
        // Night time
        if (hour >= 18) {
            darkness = Math.min(1, (hour - 18) / 3);
        } else {
            darkness = Math.max(0, 1 - hour / 6);
        }
    }

    // Adjust lighting
    var lightIntensity = 1 - (darkness * 0.7);
    this.sunLight.intensity = lightIntensity;

    // Adjust sky color
    var skyColor = this.lerpColor(0x87CEEB, 0x001122, darkness);
    if (this.renderer.setClearColorHex) {
        this.renderer.setClearColorHex(skyColor, 1);
    } else {
        this.renderer.setClearColor(skyColor, 1);
    }
};

SV.Game.prototype.lerpColor = function(a, b, t) {
    var ar = (a >> 16) & 0xff;
    var ag = (a >> 8) & 0xff;
    var ab = a & 0xff;

    var br = (b >> 16) & 0xff;
    var bg = (b >> 8) & 0xff;
    var bb = b & 0xff;

    var rr = Math.round(ar + (br - ar) * t);
    var rg = Math.round(ag + (bg - ag) * t);
    var rb = Math.round(ab + (bb - ab) * t);

    return (rr << 16) | (rg << 8) | rb;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
SV.Game.prototype.getZoneAt = function(x, y) {
    for (var i = 0; i < SV.Config.ZONAS.length; i++) {
        var z = SV.Config.ZONAS[i];
        if (x >= z.x && x < z.x + z.w && y >= z.y && y < z.y + z.h) {
            return z;
        }
    }
    return { name: 'DESCONHECIDO', classe: 'periferia', tempoBase: 999 };
};

SV.Game.prototype.worldToScreen = function(x, y) {
    var vector = new THREE.Vector3(x, -y, 0);
    vector.project(this.camera);

    return {
        x: (vector.x + 1) / 2 * window.innerWidth,
        y: -(vector.y - 1) / 2 * window.innerHeight
    };
};

// ============================================================================
// SV.Physics - Box2D Wrapper
// ============================================================================
SV.Physics = function() {
    var b2Vec2 = Box2D.Common.Math.b2Vec2;
    var b2World = Box2D.Dynamics.b2World;

    // Create world with no gravity (top-down)
    this.world = new b2World(new b2Vec2(0, 0), false);

    this.scale = SV.Config.WORLD.PHYSICS_SCALE;
    this.bodies = {};

    console.log('[SV] Physics initialized');
};

SV.Physics.prototype.step = function(delta) {
    this.world.Step(
        1 / 60,  // time step
        10,      // velocity iterations
        10       // position iterations
    );
    this.world.ClearForces();
};

SV.Physics.prototype.createCircleBody = function(x, y, radius, isDynamic) {
    var b2BodyDef = Box2D.Dynamics.b2BodyDef;
    var b2Body = Box2D.Dynamics.b2Body;
    var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
    var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;

    var bodyDef = new b2BodyDef();
    bodyDef.type = isDynamic ? b2Body.b2_dynamicBody : b2Body.b2_staticBody;
    bodyDef.position.x = x / this.scale;
    bodyDef.position.y = y / this.scale;
    bodyDef.linearDamping = 0.5;
    bodyDef.angularDamping = 0.5;

    var fixDef = new b2FixtureDef();
    fixDef.density = 1.0;
    fixDef.friction = 0.3;
    fixDef.restitution = 0.2;
    fixDef.shape = new b2CircleShape(radius / this.scale);

    var body = this.world.CreateBody(bodyDef);
    body.CreateFixture(fixDef);

    return body;
};

SV.Physics.prototype.createBoxBody = function(x, y, width, height, isDynamic) {
    var b2BodyDef = Box2D.Dynamics.b2BodyDef;
    var b2Body = Box2D.Dynamics.b2Body;
    var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
    var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;

    var bodyDef = new b2BodyDef();
    bodyDef.type = isDynamic ? b2Body.b2_dynamicBody : b2Body.b2_staticBody;
    bodyDef.position.x = x / this.scale;
    bodyDef.position.y = y / this.scale;

    var fixDef = new b2FixtureDef();
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;
    fixDef.shape = new b2PolygonShape();
    fixDef.shape.SetAsBox(width / 2 / this.scale, height / 2 / this.scale);

    var body = this.world.CreateBody(bodyDef);
    body.CreateFixture(fixDef);

    return body;
};

SV.Physics.prototype.destroyBody = function(body) {
    this.world.DestroyBody(body);
};

// ============================================================================
// STARTUP
// ============================================================================
SV.start = function() {
    console.log('[SV] Sol Vermelho - Starting...');

    var game = new SV.Game();
    window.SVGame = game;  // Global reference for debugging

    game.init();

    return game;
};
