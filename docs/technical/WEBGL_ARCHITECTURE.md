# Arquitetura WebGL - Sol Vermelho

> Documentação técnica da engine WebGL baseada em análise do WebGL-GTA

---

## Stack Tecnológica

| Componente | Biblioteca | Versão |
|------------|-----------|--------|
| Rendering 3D | Three.js | r45+ |
| Física 2D | Box2D Web | 2.1.a.3 |
| Debug | Stats.js | - |

---

## Sistema de Coordenadas

### Unidades

```
1 bloco = 64 unidades
Escala física = 10 (Box2D usa unidades / 10)

Exemplo:
- Posição do player: (6400, -7680) = bloco (100, 120)
- Posição física Box2D: (640, 768)
```

### Coordenadas

```
Three.js:
  X → direita (positivo)
  Y → cima (NEGATIVO no WebGL-GTA, invertido!)
  Z → altura/profundidade

Box2D:
  X = Three.X / PhysicsScale
  Y = -Three.Y / PhysicsScale (note o negativo)
```

---

## Arquitetura de Classes

### Hierarquia Principal

```
GTA.Game (core.js)
├── scene: THREE.Scene
├── camera: THREE.PerspectiveCamera
├── renderer: THREE.WebGLRenderer
├── map: GTA.Map
├── physics: GTA.Physics
├── player: GTA.Player
├── activeObjects: GTA.GameObjectPosition[]
└── methods: { animate(), render() }
```

### Entidades

```
THREE.Object3D
└── GTA.Pedestrian
    ├── position: { x, y, z }
    ├── sprite: THREE.Mesh
    ├── physics: b2Body (círculo)
    ├── speed: number
    ├── rotationSpeed: number
    ├── weapon: number
    ├── animationSprites: array
    └── GTA.Player extends Pedestrian
        ├── moveForward/Backward: boolean
        ├── turnLeft/Right: boolean
        └── onKeyDown/Up()
```

### Física

```
GTA.Physics
├── world: b2World (sem gravidade)
├── bodies: { "x-y": b2Body }
├── blockFixture: b2FixtureDef (64x64 blocos)
├── addBlock(x, y): cria bloco estático
└── updateWorld(): gerencia corpos dinamicamente
    - Cria blocos ao redor do player (radius ~12x10)
    - Destrói blocos fora do range
```

### Mapa

```
GTA.Map
├── sections: THREE.Object3D[16][16]
├── base: GTA.Column[256][256]
├── gameobjects: GTA.GameObjectPosition[]
└── addObject(obj): adiciona à seção correta
```

---

## Loop Principal

```javascript
animate() {
    requestAnimationFrame(animate);

    // 1. Atualiza física
    physics.updateWorld(game, playerBlock);
    physics.world.Step(1/60, 10, 10);
    physics.world.ClearForces();

    // 2. Render
    render();
}

render() {
    // Atualiza player (movimento, animação)
    player.update(delta);

    // Câmera segue player
    camera.position.x = player.position.x;
    camera.position.y = player.position.y;

    // Carrega/descarrega seções do mapa
    updateSections();

    // Renderiza
    renderer.render(scene, camera);
}
```

---

## Física Box2D

### Configuração do Mundo

```javascript
// Sem gravidade (top-down 2D)
world = new b2World(new b2Vec2(0, 0), false);
```

### Pedestres/Players

```javascript
bodyDef.type = b2_dynamicBody;
bodyDef.linearDamping = 0.15;
bodyDef.angularDamping = 0.3;
bodyDef.fixedRotation = true;  // não gira com colisões

fixDef.shape = new b2CircleShape(0.3);  // raio pequeno
fixDef.density = 1.0;
fixDef.friction = 0.3;
fixDef.restitution = 0.4;
```

### Veículos

```javascript
bodyDef.type = b2_dynamicBody;
bodyDef.linearDamping = 0.15;
bodyDef.angularDamping = 0.3;

fixDef.shape = new b2PolygonShape();
fixDef.shape.SetAsBox(width/scale/2, height/scale/2);
fixDef.density = 8*10000;  // bem pesado
```

### Blocos de Colisão

```javascript
bodyDef.type = b2_staticBody;
fixDef.shape.SetAsBox(32/scale, 32/scale);  // 64x64 / 2

// Só cria bloco se tipo === 5 (sólido)
if (block.type === 5) {
    physics.addBlock(x, y);
}
```

---

## Conversões Úteis

```javascript
// GTA → Three.js position
function gtaToThree(x, y, z) {
    return {
        x: x - 32,           // center offset
        y: -y + 32,          // Y invertido
        z: 2 + z - 2 * 64    // Z offset
    };
}

// Three.js → Box2D
function threeToBox2D(x, y) {
    return {
        x: x / GTA.PhysicsScale,
        y: -y / GTA.PhysicsScale
    };
}

// Box2D → Three.js
function box2DToThree(physPos) {
    return {
        x: physPos.x * GTA.PhysicsScale,
        y: -physPos.y * GTA.PhysicsScale
    };
}

// Coordenada → bloco
function getBlock(x, y, z) {
    return [
        Math.round(x / 64),
        -Math.round(y / 64),
        Math.round(z / 64)
    ];
}

// Ângulo GTA → radianos
function gtaRotation(gtaAngle) {
    return ((gtaAngle / 256) * 90) * (Math.PI / 180);
}
```

---

## Constantes Importantes

```javascript
GTA.PhysicsScale = 10;    // Escala física
GTA.SectionSize = 16;     // Blocos por seção
TILE_SIZE = 64;           // Unidades por bloco
```

---

## Adaptações para Sol Vermelho

### Diferenças do Original

| Aspecto | WebGL-GTA | Sol Vermelho |
|---------|-----------|--------------|
| Mapa | Carregado de .gmp | Procedural/JSON |
| Sprites | GTA1 assets | Nossos sprites |
| Câmera | Primeira pessoa | Top-down 45° |
| Escala | 256x256 blocos | ~64x64 blocos |

### Simplificações

1. **Mapa**: JSON com polígonos em vez de formato binário
2. **Sprites**: Planos coloridos inicialmente, depois sprites
3. **Seções**: Podem ser menores (8x8) já que mapa é menor
4. **Colisões**: Carregadas do JSON, não calculadas

---

## Referências

- [WebGL-GTA Original](https://github.com/nickvh/WebGL-GTA)
- [Three.js Docs](https://threejs.org/docs/)
- [Box2D Manual](https://box2d.org/documentation/)
