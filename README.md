# Sol Vermelho

**Um jogo de ação/crime estilo GTA ambientado em Fortaleza, Ceará (2003)**

![Godot Engine](https://img.shields.io/badge/Godot-4.6-blue?logo=godot-engine)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)

---

## Sobre

**Sol Vermelho** é um jogo de ação sandbox com narrativa noir brasileira. Você assume o papel de **Raimundo "Raio" Silva**, um ex-pedreiro que, após a greve brutal da construção civil de 2003, é forçado a entrar no submundo criminoso de Fortaleza para sobreviver.

### Características

- **Mundo Aberto** - Explore uma maquete de Fortaleza com bairros reconhecíveis
- **Sistema de Facções** - Reputação dinâmica com diferentes organizações criminosas
- **Combate** - Punhos, pistola, UZI e shotgun
- **Veículos** - Dirija carros com física realista
- **Wanted Levels** - Sistema de perseguição policial (PM-CE, RAIO, PF)
- **Narrativa** - 4 capítulos, 26 missões, 3 finais diferentes

### Facções

| Facção | Líder | Território |
|--------|-------|------------|
| Comando do Litoral | Bubba Serafim | Orla (Porto das Dunas → Praia do Futuro) |
| Filhos do Dragão | Tio Fung | Centro (Mucuripe, José Bonifácio) |
| Os Cargueiros | Elias Burro | BR-116 |
| Igreja Renascer em Glória | Pastor Marcos | Aldeota (fachada) |

---

## Screenshots

> *Em breve*

---

## Como Jogar

### Versão Web (Mais Fácil)

1. Acesse: **[Sol Vermelho Web](https://pedroufc-source.github.io/sol-vermelho/)**
2. Jogue direto no navegador!

### Versão Desktop (Godot)

#### Requisitos
- [Godot Engine 4.6+](https://godotengine.org/download)

#### Instalação

```bash
# Clone o repositório
git clone https://github.com/pedroufc-source/sol-vermelho.git

# Abra o projeto no Godot
# 1. Abra o Godot Engine
# 2. Clique em "Import"
# 3. Navegue até a pasta sol_vermelho/
# 4. Selecione project.godot
# 5. Clique em "Import & Edit"
# 6. Pressione F5 para jogar
```

---

## Controles

### A Pé

| Tecla | Ação |
|-------|------|
| `W A S D` | Movimento |
| `Shift` | Correr |
| `Mouse` | Mirar |
| `Clique Esquerdo` | Atacar / Atirar |
| `Tab` / `Scroll` | Trocar arma |
| `E` | Entrar/Sair do veículo |

### No Veículo

| Tecla | Ação |
|-------|------|
| `W` | Acelerar |
| `S` | Frear / Ré |
| `A D` | Virar |
| `E` | Sair do veículo |

---

## Estrutura do Projeto

```
sol-vermelho/
├── sol-vermelho-(4.2)/    # Versão Godot 4.2 (legado)
├── sol_vermelho/          # Versão Godot 4.6 (principal)
│   ├── scenes/            # Cenas (.tscn)
│   ├── scripts/           # Scripts GDScript
│   │   ├── player/        # Controle e combate do jogador
│   │   ├── npcs/          # IA dos NPCs e facções
│   │   ├── vehicles/      # Sistema de veículos
│   │   ├── systems/       # GameManager, FactionSystem
│   │   └── ui/            # HUD e interface
│   └── assets/            # Sprites, sons, fontes
└── sol_vermelho_web/      # Versão HTML5/JavaScript
    ├── index.html         # Jogo principal
    ├── historia.js        # Narrativa e missões
    └── ROTEIRO.md         # Roteiro completo
```

---

## Tecnologias

- **Engine:** [Godot 4.6](https://godotengine.org/) (Desktop/Mobile)
- **Linguagem:** GDScript, JavaScript
- **Web:** HTML5 Canvas 2D

---

## Roadmap

- [x] Sistema de movimento do jogador
- [x] Sistema de combate (melee + armas de fogo)
- [x] Sistema de veículos
- [x] Sistema de facções e reputação
- [x] Wanted levels
- [x] Versão web funcional
- [ ] Capítulo 1 completo com missões
- [ ] Sistema de save/load
- [ ] Trilha sonora original
- [ ] Efeitos sonoros
- [ ] Cutscenes narrativas
- [ ] Capítulos 2, 3 e 4
- [ ] Versão mobile

---

## Contribuindo

Contribuições são bem-vindas! Veja [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes.

---

## Licença

Este projeto está licenciado sob a **MIT License** - veja [LICENSE](LICENSE) para detalhes.

---

## Créditos

- **Desenvolvimento:** Pedro Rocha de Oliveira
- **Inspirações:** GTA 1, Tropa de Elite, Cidade de Deus, Bacurau

---

## Contato

- **GitHub:** [@pedroufc-source](https://github.com/pedroufc-source)

---

*"No sol vermelho de Fortaleza, todo mundo tem um preço."*
