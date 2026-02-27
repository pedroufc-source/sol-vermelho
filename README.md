# Sol Vermelho

**Jogo de acao/crime inspirado no GTA 1 (1997), ambientado em Fortaleza, Ceara (2026)**

Visao top-down, cidades abertas, veiculos que voce rouba, sistema de procurado, pedestres, fisica arcade. Com narrativa brasileira, critica social, e sistema de saude mental (CAPS).

---

## Como Jogar

```bash
git clone https://github.com/pedroufc-source/sol-vermelho.git
cd sol-vermelho

# Abrir index.html no navegador. So isso.
# Ou com servidor local:
python3 -m http.server 8000
# http://localhost:8000
```

### Controles

| Tecla | Acao |
|-------|------|
| `W A S D` | Movimento |
| `Shift` | Correr |
| `Mouse` | Mirar |
| `Click` | Atirar |
| `Q` | Trocar arma |
| `E` | Entrar/Sair do veiculo |
| `Space` | Freio de mao |
| `ESC` | Pausar |

---

## Estado Atual

O jogo funcional esta no `index.html` na raiz (~2090 linhas, Canvas 2D, zero dependencias externas).

**O que funciona:**
- Player andando pelo mapa com visao 2.5D obliqua
- 8 armas (punhos, faca, pistola, UZI, shotgun, rifle, molotov, granada)
- 8 veiculos (sedan, moto, viatura, etc.) com fisica de drift
- Wanted level (1-6 estrelas: PM, RAIO, PF)
- 12 missoes (Capitulos 1 e 2)
- NPCs e atropelamento
- Sistema CAPS (saude mental afeta gameplay)
- Resposta policial varia por bairro (periferia = policia demora mais)
- Save/Load, pause menu, HUD completo
- Ciclo dia/noite, clima

**Arquivos do jogo:**
```
index.html          <- O JOGO (tudo junto num arquivo)
expansion.js        <- Expansao: dia/noite, clima, radio, gangues
historia.js         <- Sistema de historia/narrativa/dialogos
sanidade.js         <- Sistema CAPS (saude mental)
mapbox.js           <- Integracao com mapa satelite
assets/             <- Sprites e tiles (~5 MB)
```

---

## Historico de Tentativas

Este projeto passou por varias iteracoes. A decisao tecnica final (engine, arquitetura) ainda esta **em aberto**.

| # | Tech | O que tentei | Por que mudei | Onde esta |
|---|------|-------------|---------------|-----------|
| v1 | Godot 4.2 | Engine completa em GDScript | Export web = 50+ MB, lento pra prototipar | `_archive/v1_godot/` |
| v2 | Canvas 2D | Primeiro prototipo web funcional | Funcionou! Mas ficou monolitico | `_archive/v2_canvas_2d/` |
| v3 | Canvas 2D + src/ | Tentar organizar com modulos | Modularizar nao resolveu as limitacoes | `_archive/v3_game_html_src/` |
| v4 | WebGL | Primeira tentativa 3D no browser | Complexo demais pra prototipar | `_archive/v4_webgl/` |
| v5 | WebGL + Three.js | Usar sprites extraidos do GTA1 original | Problemas de escala, assets pesados | `_archive/v5_sol_vermelho_webgl/` |
| **v6** | **Canvas 2D single-file** | **Voltar ao simples** | **Funcionou — e o jogo atual** | **`index.html` (raiz)** |
| sv/ | Canvas 2D modular | Reescrever v6 com arquitetura limpa | Nunca foi terminado | `sv/` (no git history) |
| v7 | Python + OSM | Pipeline pra gerar mapa real de Fortaleza | Gera dados mas nunca conectou ao jogo | `v7/` (local, nao no git) |

**Licao aprendida:** single-file Canvas 2D (v6) foi o que permitiu prototipar rapido. Mas a decisao de engine final depende do que queremos pro jogo.

---

## Referencia GTA1 Original

O projeto tem localmente os dados extraidos do GTA1 original (1997) para estudo e referencia. **Esses arquivos nao vao pro git** (sao pesados e proprietarios).

### Assets extraidos (`gta1_assets/`, ~650 MB)
Installer do GTA1 original extraido com os binarios do jogo:
- **`.CMP`** — Mapas das 3 cidades (NYC.CMP, MIAMI.CMP, SANB.CMP). Formato colunar: 256x256 celulas, cada coluna tem blocos de 8 bytes com tipo/rotacao/slope
- **`.G24`** — Tilesets e sprites (side tiles, lid tiles, aux tiles). Atlas de 256px de largura com CLUTs (paletas de 256 cores BGRA)
- **`.GRY`** — Versao grayscale dos tilesets
- **`.FXT`** — Textos do jogo em 4 idiomas
- **`MISSION.INI`** — Definicao das missoes originais
- **`AUDIO/`** — Efeitos sonoros

### Parser do Niklas (`reference/WebGL-GTA-niklasvh/`, 22 MB)
Fork do [WebGL-GTA](https://github.com/niklasvh/WebGL-GTA) por Niklas von Hertzen. Le os formatos `.CMP` e `.G24` e renderiza o mapa no browser com Three.js (versao antiga r45).

**Bugs conhecidos no parser:**
- `offset || pos` falha quando offset=0 (fix: `offset !== undefined ? offset : pos`)
- `tileClutSize > clutSize` — le alem da secao CLUT mas funciona porque os dados extras nao sao referenciados

### Extrator (`reference/gta1-extractor/`, 7 MB)
Ferramenta Node.js pra extrair assets dos arquivos binarios do GTA1.

### Viewer (`gta1-viewer.html`, local)
Visualizador WebGL2 dos mapas originais, feito durante o desenvolvimento. Renderiza os `.CMP` com tiles do `.G24`.

---

## Decisoes em Aberto

Estas sao decisoes tecnicas que precisam ser tomadas em conjunto:

- **Engine**: Canvas 2D e suficiente pro jogo final? WebGL? Godot? Outra coisa?
- **Arquitetura**: Manter single-file ou modularizar? (sv/ foi uma tentativa que nao vingou)
- **Mapa**: Usar dados OSM do v7 (mapa real de Fortaleza) ou mapa procedural/artistico?
- **Assets**: Usar sprites/formatos do GTA1 original como base ou criar assets proprios?
- **Rendering**: Manter 2.5D obliquo atual ou ir pra perspectiva isometrica/3D?

---

## Estrutura do Repo

### No git (o que voce clona)
```
index.html              <- O JOGO
expansion.js            <- Sistemas extras (dia/noite, clima, gangues)
historia.js             <- Narrativa e dialogos
sanidade.js             <- Sistema CAPS (saude mental)
mapbox.js               <- Mapa satelite (Mapbox)
assets/                 <- Sprites e tiles do jogo
docs/
  gdd/ROTEIRO.md        <- Historia, personagens, missoes
  gdd/BRIEFING.txt      <- Briefing do projeto
  research/             <- Pesquisa sobre faccoes de Fortaleza
  VIBE_CODING_GUIDE.md  <- Guia de vibe coding
  briefing_sol_vermelho.md
CLAUDE.md               <- Contexto para IA (Claude Code)
CONTRIBUTING.md         <- Como contribuir
CHANGELOG.md            <- Historico de mudancas
LICENSE                 <- MIT
```

### Local (nao vai pro git — pesado/proprietario)
```
_archive/               <- Versoes anteriores v1-v6 (2.1 GB)
gta1_assets/            <- GTA1 original extraido (650 MB)
reference/              <- Parser do Niklas + extrator (29 MB)
v7/                     <- Pipeline Python/OSM (337 MB)
gta1-viewer.html        <- Viewer dos mapas GTA1
tools/                  <- Scripts de geracao de sprites
docs/art-bible/         <- Concept art (33 MB)
docs/gamedev-101/       <- Material de estudo gamedev (34 MB)
```

---

## Equipe

- **Pedro Rocha de Oliveira** — Criacao, roteiro, gameplay (vibe coding com Claude Code)
- **Saulo** — Programacao, engine, arquitetura
- **Yuri Alexander** — Programacao

GitHub: [@pedroufc-source](https://github.com/pedroufc-source)

---

## Licenca

MIT License — veja [LICENSE](LICENSE)

---

*"Eu so queria construir alguma coisa. Agora eu destruo."* — Raio
