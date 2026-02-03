# Sol Vermelho - Contexto para Claude

## O QUE É ESTE JOGO

**Sol Vermelho** é um jogo de ação/crime **inspirado no GTA 1** (1997), com visão **top-down** e estética de **maquete/diorama**.

### Referência Principal: GTA 1
- Câmera de cima (bird's eye view)
- Cidades abertas para explorar
- Missões de crime (roubo, fuga, assassinato)
- Veículos que você pode roubar e dirigir
- Sistema de procurado (wanted level)
- Pedestres que você pode atropelar
- Física arcade (carros driftam, explosões)

### Nosso Diferencial
- **Ambientação**: Fortaleza, Ceará, Brasil (2003)
- **Crítica social**: Polícia demora mais na periferia
- **Narrativa brasileira**: Facções fictícias, gírias cearenses
- **Sistema CAPS**: Saúde mental afeta gameplay

### Estilo Visual
- Top-down 3D (como GTA 1/2, não GTA 3+)
- Cores saturadas, céu azul nordestino
- Prédios em estilo maquete/diorama
- HUD minimalista

---

## TRABALHO EM EQUIPE (Pedro + Saulo)

### Como Funciona (Assíncrono)

Vocês dois trabalham **sem precisar se falar em tempo real**. O Git é a comunicação.

```
REGRA DE OURO: Cada um trabalha na sua branch.
               Nunca mexer direto na main.
               O código conta a história.
```

### Divisão de Áreas (Para Evitar Conflitos)

```
PEDRO (vibe coding, criativo):
├── docs/gdd/                   # Roteiro, personagens, história
├── src/data/missions/          # JSONs das missões
├── src/ui/HUD.js               # Interface (textos, cores)
└── Ajustes de gameplay         # Balanceamento (dano, velocidade)

SAULO (programador):
├── src/core/                   # Engine, loop principal
├── src/entities/               # Física, movimento
├── src/systems/                # Lógica complexa
├── vendor/                     # Libs externas
└── Arquitetura do código
```

### Workflow Diário

```bash
# 1. ANTES DE COMEÇAR (sempre!)
git checkout main
git pull origin main
git checkout -b feature/pedro-[o-que-vai-fazer]

# 2. TRABALHAR
# ... faz as mudanças ...

# 3. QUANDO TERMINAR (Claude faz tudo)
/commit-push-pr

# 4. AVISAR (opcional)
# "Criei PR #X - [descrição curta]"
```

### Para Pedro (Iniciante)

**Comandos que você vai usar 90% do tempo:**

```bash
git branch                                    # Ver em que branch você está
git checkout -b feature/pedro-nova-missao     # Criar sua branch
git status                                    # Ver o que mudou
/commit-push-pr                               # Salvar e criar PR
```

**Se der erro:** Copia e cola pro Claude resolver.

### Convenção de Branches

```
feature/[nome]-[tarefa]     → Nova funcionalidade
fix/[nome]-[bug]            → Correção de bug
refactor/[nome]-[area]      → Refatoração
```

---

## ESTRUTURA DO PROJETO (Profissional)

```
sol-vermelho/
│
├── docs/                       # DOCUMENTAÇÃO
│   ├── gdd/                    # Game Design Document
│   │   ├── ROTEIRO.md          # História e missões
│   │   └── BRIEFING.txt        # Notas do projeto
│   ├── research/               # Pesquisa
│   │   └── FACCOES_FORTALEZA.md
│   └── technical/              # Docs técnicos
│
├── src/                        # CÓDIGO FONTE
│   ├── core/                   # Engine
│   │   ├── Game.js             # Estado global e loop
│   │   └── Init.js             # Inicialização e eventos
│   │
│   ├── entities/               # Objetos do jogo
│   │   ├── Player.js           # Jogador (Raio)
│   │   ├── Vehicle.js          # Carros
│   │   ├── Ped.js              # Pedestres, Cops, Targets
│   │   └── Projectile.js       # Balas e pickups
│   │
│   ├── systems/                # Sistemas de gameplay
│   │   ├── MissionSystem.js    # Missões
│   │   ├── WantedSystem.js     # Polícia
│   │   ├── ParticleSystem.js   # Efeitos visuais
│   │   ├── AudioSystem.js      # Som
│   │   └── SaveSystem.js       # Salvar/carregar
│   │
│   ├── ui/                     # Interface
│   │   ├── HUD.js              # Barras, score, etc
│   │   ├── Map.js              # Mapa de Fortaleza
│   │   └── styles.css          # Estilos
│   │
│   └── data/                   # Dados do jogo
│       ├── config.js           # Constantes globais
│       ├── zones.js            # Zonas de Fortaleza
│       └── missions/           # Missões por capítulo
│           ├── chapter1.json
│           └── chapter2.json
│
├── assets/                     # ASSETS
│   ├── sprites/                # Imagens
│   ├── audio/                  # Sons
│   └── maps/                   # Mapas
│
├── vendor/                     # LIBS EXTERNAS (não editar)
│   ├── Three.js
│   ├── Box2dWeb-2.1.a.3.js
│   └── Stats.js
│
├── _archive/                   # VERSÕES ANTIGAS (ignorado pelo git)
│   ├── sol_vermelho/           # Godot pausado
│   ├── sol_vermelho_web/       # Canvas 2D
│   ├── sol_vermelho_webgl/     # Tentativa WebGL
│   └── sol-vermelho-(4.2)/     # Godot legado
│
├── game.html                   # JOGO (entry point)
├── index.html                  # Página inicial
├── CLAUDE.md                   # Este arquivo
└── README.md
```

## Arquivos Principais

### Para adicionar MISSÕES (Pedro):
```
src/data/missions/chapter1.json   # Missões do Cap 1
src/data/missions/chapter2.json   # Missões do Cap 2
```

### Para ajustar GAMEPLAY (Pedro):
```
src/data/config.js                # Velocidade, dano, etc
src/data/zones.js                 # Territórios das facções
```

### Para mexer na ENGINE (Saulo):
```
src/core/Game.js                  # Loop principal
src/entities/                     # Classes do jogo
src/systems/                      # Sistemas
```

---

## Objetivo Imediato
**Deadline: Quinta-feira à noite (06/02/2025)**

Criar versão jogável para usar como convite de recrutamento de equipe.

### Critério de Sucesso (Mínimo)

- [ ] Player andando no mapa de Fortaleza
- [ ] Entrar em carro e dirigir
- [ ] 1 missão funcionando

## Decisão Técnica

Usar **WebGL** baseado no projeto [WebGL-GTA](https://github.com/niklasvh/WebGL-GTA) como engine base.

### Por quê?
- Física já calibrada (Box2D)
- Escalas corretas
- Parser de assets do GTA1 funcionando
- Rendering 3D com Three.js

---

## Equipe

- **Pedro Rocha de Oliveira** - Criação, roteiro, gameplay (vibe coding)
- **Saulo** - Programação, engine, arquitetura
- **GitHub**: @pedroufc-source
