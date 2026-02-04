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

## ESTRUTURA DO PROJETO (v6 - Atual)

```
sol-vermelho/
│
├── index.html                  # ENTRY POINT PRINCIPAL (v6)
│
├── sv/                         # NOVA VERSÃO MODULAR
│   ├── index.html              # Versão standalone
│   ├── core.js                 # Engine principal
│   ├── player.js               # Sistema do jogador
│   ├── fortaleza-map.js        # Mapa OSM de Fortaleza
│   └── data/                   # Dados do jogo
│
├── assets/                     # ASSETS
│   ├── sprites_gta.png         # Spritesheet do GTA1
│   ├── tiles_gta.png           # Tiles do GTA1
│   └── sprite_data.json        # Metadados dos sprites
│
├── gta1_assets/                # ASSETS EXTRAÍDOS DO GTA1
│   ├── extracted_nyc/          # Sprites de NYC
│   └── extract_sprites.js      # Script de extração
│
├── reference/                  # CÓDIGO DE REFERÊNCIA
│   └── WebGL-GTA-niklasvh/     # Engine base (não editar)
│
├── docs/                       # DOCUMENTAÇÃO
│   ├── gdd/                    # Game Design Document
│   │   ├── ROTEIRO.md          # História e missões
│   │   └── BRIEFING.txt        # Notas do projeto
│   ├── research/               # Pesquisa
│   └── technical/              # Docs técnicos
│
├── _archive/                   # VERSÕES ANTERIORES
│   ├── v1_godot/               # Godot 4.2 (pausado)
│   ├── v2_canvas_2d/           # Canvas 2D puro
│   ├── v3_game_html_src/       # HTML com src/ modular
│   ├── v4_webgl/               # Primeira tentativa WebGL
│   ├── v5_sol_vermelho_webgl/  # WebGL com sprites GTA1
│   └── v6_colisao_osm/         # Backup da v6
│
├── CLAUDE.md                   # Este arquivo
├── CHANGELOG.md                # Histórico de versões
└── README.md
```

## Arquivos Principais (v6)

### Entry Point:
```
index.html                        # Arquivo principal do jogo
```

### Para mexer na ENGINE (Saulo):
```
sv/core.js                        # Engine principal
sv/player.js                      # Sistema do jogador
sv/fortaleza-map.js               # Mapa OSM
```

### Assets:
```
assets/sprites_gta.png            # Spritesheet
assets/tiles_gta.png              # Tiles do mapa
gta1_assets/                      # Sprites extraídos
```

### Referência (não editar):
```
reference/WebGL-GTA-niklasvh/     # Código base original
```

---

## Objetivo Imediato
**Deadline: Quinta-feira à noite (06/02/2025)**

Criar versão jogável para usar como convite de recrutamento de equipe.

### Critério de Sucesso (Mínimo)

- [x] Player andando no mapa
- [x] Veículos funcionando
- [x] NPCs e colisão (atropelar)
- [ ] Mapa de Fortaleza com dados OSM
- [ ] 1 missão funcionando

## Decisão Técnica (v6)

Usar **WebGL** baseado no projeto [WebGL-GTA](https://github.com/niklasvh/WebGL-GTA) + dados **OpenStreetMap** de Fortaleza.

### Abordagem Atual
- Geometria real da cidade via OSM
- Sprites e tiles extraídos do GTA1
- Física simplificada (sem Box2D por enquanto)
- Prototipagem rápida em single-file

### Histórico de Tentativas
Passamos por 6 versões diferentes (v1-v6). Veja `_archive/` e `CHANGELOG.md` para detalhes.

---

## Equipe

- **Pedro Rocha de Oliveira** - Criação, roteiro, gameplay (vibe coding)
- **Saulo** - Programação, engine, arquitetura
- **GitHub**: @pedroufc-source
