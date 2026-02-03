# Sol Vermelho

**Jogo de ação/crime estilo GTA 1 ambientado em Fortaleza, Ceará (2003)**

![WebGL](https://img.shields.io/badge/Engine-WebGL%2FThree.js-orange)
![Box2D](https://img.shields.io/badge/Physics-Box2D-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)

---

## Sobre

**Sol Vermelho** é um jogo de ação sandbox com narrativa noir brasileira. Você assume o papel de **Raimundo "Raio" Silva**, um ex-pedreiro que, após a crise da construção civil de 2003, é forçado a entrar no submundo criminoso de Fortaleza para sobreviver.

### Diferenciais

- **Mapa real** - Fortaleza renderizada em estilo maquete
- **Crítica social** - Resposta policial varia por classe social do bairro
- **Saúde mental** - Sistema CAPS com efeitos de sanidade baixa
- **Narrativa autêntica** - Gírias cearenses, facções fictícias, órgãos reais (PM-CE, RAIO, DRACO)

---

## Como Jogar

```bash
# Clone o repositório
git clone https://github.com/pedroufc-source/sol-vermelho.git
cd sol-vermelho

# Inicie um servidor local
python3 -m http.server 8000

# Acesse no navegador
# http://localhost:8000/game.html
```

### Controles

| Tecla | Ação |
|-------|------|
| `W A S D` | Movimento |
| `Shift` | Correr |
| `Mouse` | Mirar |
| `Click` | Atirar |
| `Q` | Trocar arma |
| `E` | Entrar/Sair do veículo |
| `Space` | Freio de mão |
| `ESC` | Pausar |

---

## Estrutura do Projeto

```
sol-vermelho/
├── src/                    # Código fonte modular
│   ├── core/               # Engine (Game.js, Init.js)
│   ├── entities/           # Player, Vehicle, Ped
│   ├── systems/            # Mission, Wanted, Audio, Save
│   ├── ui/                 # HUD, Map, styles.css
│   └── data/               # Config, zones, missions/
├── assets/                 # Sprites, áudio, mapas
├── docs/                   # Documentação
│   ├── gdd/                # Game Design Document
│   └── research/           # Pesquisa de referência
├── vendor/                 # Libs externas (Three.js, Box2D)
├── game.html               # Entry point do jogo
└── CLAUDE.md               # Contexto para IA
```

---

## Documentação

| Doc | Descrição |
|-----|-----------|
| [CLAUDE.md](CLAUDE.md) | Contexto para desenvolvimento com IA |
| [docs/gdd/ROTEIRO.md](docs/gdd/ROTEIRO.md) | História, personagens, missões |
| [docs/VIBE_CODING_GUIDE.md](docs/VIBE_CODING_GUIDE.md) | Boas práticas de vibe coding |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Como contribuir |
| [CHANGELOG.md](CHANGELOG.md) | Histórico de mudanças |

---

## Features

### Implementadas
- [x] Movimento e combate
- [x] 8 armas (punhos, pistola, UZI, shotgun)
- [x] Veículos com física de drift
- [x] 12 missões (Capítulos 1 e 2)
- [x] Sistema de wanted (6 estrelas)
- [x] Resposta policial por zona
- [x] Sistema CAPS (saúde mental)
- [x] Save/Load

### Em Desenvolvimento
- [ ] Integração WebGL com escalas corretas
- [ ] Capítulos 3 e 4
- [ ] Trilha sonora
- [ ] Multiplayer local

---

## Tecnologias

- **Rendering**: Canvas 2D / WebGL (Three.js)
- **Física**: Box2D
- **Base**: [WebGL-GTA](https://github.com/niklasvh/WebGL-GTA) por Niklas von Hertzen

---

## Equipe

- **Pedro Rocha de Oliveira** - Criação, roteiro, gameplay
- **Saulo** - Programação, engine

### Contribuindo

Estamos recrutando! Se você manja de:
- JavaScript / WebGL / Three.js
- Game design / Level design
- Pixel art / Sprites
- Sound design
- Narrativa

Veja [CONTRIBUTING.md](CONTRIBUTING.md) ou entre em contato!

---

## Licença

MIT License - veja [LICENSE](LICENSE)

---

## Créditos

- **Engine base**: [WebGL-GTA](https://github.com/niklasvh/WebGL-GTA) por Niklas von Hertzen
- **Inspirações**: GTA 1, Tropa de Elite, Cidade de Deus, Bacurau
- **Pesquisa**: LEV/UFC, trabalhos de Jania Aquino, Luiz Fábio Paiva

---

*"Eu só queria construir alguma coisa. Agora eu destruo."* — Raio
