# Sol Vermelho - Contexto para Claude

## O QUE E ESTE JOGO

**Sol Vermelho** e um jogo de acao/crime **inspirado no GTA 1** (1997), com visao **top-down** e estetica de **maquete/diorama**.

### Referencia Principal: GTA 1
- Camera de cima (bird's eye view)
- Cidades abertas para explorar
- Missoes de crime (roubo, fuga, assassinato)
- Veiculos que voce pode roubar e dirigir
- Sistema de procurado (wanted level)
- Pedestres que voce pode atropelar
- Fisica arcade (carros driftam, explosoes)

### Nosso Diferencial
- **Ambientacao**: Fortaleza, Ceara, Brasil (2026)
- **Critica social**: Policia demora mais na periferia
- **Narrativa brasileira**: Faccoes ficticias, girias cearenses
- **Sistema CAPS**: Saude mental afeta gameplay

### Estilo Visual
- Top-down (como GTA 1/2, nao GTA 3+)
- Cores saturadas, ceu azul nordestino
- Predios em estilo maquete/diorama
- HUD minimalista

---

## ESTADO ATUAL DO PROJETO (Fev/2026)

### O que funciona (v6 - o jogo jogavel)
O jogo esta no `index.html` na raiz. E um arquivo unico com ~2090 linhas.
Atualmente usa Canvas 2D (mas a decisao de engine final esta em aberto).

Funcionalidades:
- Player andando pelo mapa com visao 2.5D obliqua
- Veiculos (entrar, dirigir, sair) com fisica de drift
- NPCs e atropelamento
- HUD (vida, armadura, dinheiro, wanted level, minimapa)
- 8 armas (punhos, faca, pistola, UZI, shotgun, rifle, molotov, granada)
- 12 missoes (Capitulos 1 e 2)
- Wanted level (1-6 estrelas: PM, RAIO, PF)
- Sistema CAPS (saude mental)
- Ciclo dia/noite, clima
- Save/load, pause menu
- Tela de morte ("WASTED")
- Intro narrativa

**Para jogar:** abrir `index.html` no navegador.

### Arquivos do jogo (o que importa)
```
index.html          <- O JOGO PRINCIPAL (~2090 linhas, tudo junto)
expansion.js        <- Expansao: dia/noite, clima, radio, gangues
historia.js         <- Sistema de historia/narrativa/dialogos
sanidade.js         <- Sistema CAPS (saude mental)
mapbox.js           <- Integracao com mapa satelite
assets/             <- Sprites e tiles (~5 MB)
```

### Coisas que existem localmente mas NAO estao no git
```
_archive/           <- Versoes antigas v1-v6 (2.1 GB). Historico de tentativas.
gta1_assets/        <- GTA1 original extraido (650 MB). Arquivos binarios do jogo de 1997.
reference/          <- Parser do Niklas (WebGL-GTA) + extrator. Codigo de referencia.
v7/                 <- Pipeline Python/OSM que gera mapa real de Fortaleza. Nunca conectou ao jogo.
gta1-viewer.html    <- Viewer WebGL2 dos mapas GTA1 originais.
tools/              <- Scripts de geracao de sprites com IA.
docs/art-bible/     <- Concept art e referencias visuais (33 MB).
docs/gamedev-101/   <- Material de estudo sobre gamedev (34 MB).
```

---

## HISTORICO DE VERSOES (pra nao repetir erros)

O projeto passou por 8 tentativas diferentes:
1. **v1** - Godot 4.2 (export web 50+ MB, lento pra prototipar)
2. **v2** - Canvas 2D puro (funcionou, mas monolitico)
3. **v3** - HTML modular com src/ (organizar nao resolveu limitacoes)
4. **v4** - WebGL (complexo demais pra prototipar)
5. **v5** - WebGL com sprites GTA1 (problemas de escala)
6. **v6** - Canvas 2D single-file <- **VERSAO ATUAL E FUNCIONAL**
7. **sv/** - Canvas 2D modular (tentativa de reescrever v6 com arquitetura limpa, nunca terminou)
8. **v7** - Pipeline OSM em Python (so gera dados, nunca virou jogo)

**Licao:** single-file Canvas 2D (v6) foi o que permitiu prototipar rapido. Decisao de engine final esta em aberto.

---

## DECISOES TECNICAS EM ABERTO

Estas decisoes precisam ser tomadas pela equipe:
- **Engine**: Canvas 2D e suficiente? WebGL? Godot? Outra?
- **Arquitetura**: Manter single-file ou modularizar?
- **Mapa**: Usar dados OSM do v7 ou mapa procedural/artistico?
- **Assets**: Sprites do GTA1 original como base ou criar proprios?
- **Rendering**: Manter 2.5D obliquo ou mudar pra isometrico/3D?

---

## TRABALHO EM EQUIPE

### Pedro (vibe coding, criativo, NAO e dev)
- Usa Claude Code pra tudo
- Mexe em: roteiro, missoes, gameplay, balanceamento
- Se der erro: cola pro Claude resolver

### Saulo (programador)
- Engine, arquitetura, sistemas complexos

### Yuri Alexander (programador)
- Programacao

### Workflow
```bash
# 1. ANTES DE COMECAR (sempre!)
git checkout main
git pull origin main
git checkout -b feature/[nome]-[o-que-vai-fazer]

# 2. TRABALHAR (Claude faz o codigo pro Pedro; devs usam o que preferirem)

# 3. QUANDO TERMINAR
# Commitar, fazer push e criar PR pro main
```

### Convencao de Branches
```
feature/[nome]-[tarefa]     -> Nova funcionalidade
fix/[nome]-[bug]            -> Correcao de bug
chore/[nome]-[tarefa]       -> Manutencao, limpeza, docs
```

### Convencao de Commits
```
feat: descricao     -> Nova funcionalidade
fix: descricao      -> Correcao de bug
docs: descricao     -> Documentacao
refactor: descricao -> Refatoracao
chore: descricao    -> Manutencao
```

---

## Equipe

- **Pedro Rocha de Oliveira** - Criacao, roteiro, gameplay (vibe coding)
- **Saulo** - Programacao, engine, arquitetura
- **Yuri Alexander** - Programacao
- **GitHub**: @pedroufc-source
