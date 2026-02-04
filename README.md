# Sol Vermelho

**Jogo de ação/crime estilo GTA 1 ambientado em Fortaleza, Ceará (2003)**

![WebGL](https://img.shields.io/badge/Engine-WebGL%2FThree.js-orange)
![Box2D](https://img.shields.io/badge/Physics-Box2D-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)

> **🚧 Versão Atual: v6** - Trabalhando em colisão e integração com mapa OSM de Fortaleza

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
# http://localhost:8000/index.html
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
├── index.html              # Entry point principal (v6)
├── sv/                     # Nova versão modular
│   ├── core.js             # Engine principal
│   ├── player.js           # Sistema do jogador
│   ├── fortaleza-map.js    # Mapa OSM de Fortaleza
│   └── data/               # Dados do jogo
├── assets/                 # Sprites e tiles do GTA1
├── gta1_assets/            # Assets extraídos do GTA1
├── reference/              # Código de referência (WebGL-GTA)
├── docs/                   # Documentação
│   ├── gdd/                # Game Design Document
│   └── research/           # Pesquisa de referência
├── _archive/               # Versões anteriores (v1-v5)
└── CLAUDE.md               # Contexto para IA
```

## Histórico de Versões

| Versão | Descrição | Status |
|--------|-----------|--------|
| **v6** | Colisão + Mapa OSM de Fortaleza | 🚧 Em desenvolvimento |
| v5 | WebGL com sprites GTA1 | Arquivado |
| v4 | Primeira tentativa WebGL | Arquivado |
| v3 | HTML estruturado com src/ | Arquivado |
| v2 | Canvas 2D puro | Arquivado |
| v1 | Godot 4.2 | Pausado |

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
