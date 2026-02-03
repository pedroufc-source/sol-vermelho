# Sol Vermelho

**Jogo de ação/crime estilo GTA 1 ambientado em Fortaleza, Ceará (2003)**

![WebGL](https://img.shields.io/badge/Engine-WebGL%2FThree.js-orange)
![Box2D](https://img.shields.io/badge/Physics-Box2D-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)

---

## Sobre

**Sol Vermelho** é um jogo de ação sandbox com narrativa noir brasileira. Você assume o papel de **Raimundo "Raio" Silva**, um ex-pedreiro que, após a greve brutal da construção civil de 2003, é forçado a entrar no submundo criminoso de Fortaleza para sobreviver.

### Diferenciais

- **Mapa real** - Imagem de satélite de Fortaleza via Mapbox
- **Crítica social** - Resposta policial varia por classe social do bairro
- **Saúde mental** - Sistema CAPS com efeitos de sanidade baixa
- **Narrativa autêntica** - Gírias cearenses, facções fictícias, órgãos reais (PM-CE, RAIO, PF)

---

## Como Jogar

### Versão Web

```bash
# Clone o repositório
git clone https://github.com/pedroufc-source/sol-vermelho.git
cd sol-vermelho/sol_vermelho_web

# Inicie um servidor local
python3 -m http.server 8000

# Acesse no navegador
# http://localhost:8000
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
| `P` | Pausar |
| `ESC` | Menu |

---

## Tecnologias

- **Rendering**: Three.js (WebGL)
- **Física**: Box2D
- **Mapa**: Mapbox Satellite API
- **Base**: [WebGL-GTA](https://github.com/niklasvh/WebGL-GTA) por Niklas von Hertzen

---

## Estrutura

```
sol-vermelho/
├── sol_vermelho_web/       # Versão Canvas 2D (jogável)
├── sol_vermelho_webgl/     # Versão WebGL (em desenvolvimento)
├── CLAUDE.md               # Contexto para desenvolvimento com IA
└── README.md
```

---

## Features

### Implementadas
- [x] Movimento e combate
- [x] 8 armas (punhos, faca, pistola, UZI, shotgun, rifle, molotov, granada)
- [x] 8 tipos de veículos
- [x] 12 missões (Capítulos 1 e 2)
- [x] Sistema de wanted level (6 estrelas)
- [x] Resposta policial por zona
- [x] Sistema CAPS (saúde mental)
- [x] Save/Load
- [x] Ciclo dia/noite

### Em Desenvolvimento
- [ ] Engine WebGL com escalas corretas
- [ ] Capítulos 3 e 4
- [ ] Trilha sonora
- [ ] Efeitos sonoros

---

## Facções

| Facção | Líder | Território |
|--------|-------|------------|
| Comando do Litoral | Bubba Serafim | Porto das Dunas → Praia do Futuro |
| Filhos do Dragão | Tio Fung | Centro, Mucuripe |
| Igreja Renascer | Pastor Marcos | Aldeota (fachada) |

---

## Contribuindo

Estamos recrutando! Se você manja de:
- JavaScript / WebGL / Three.js
- Game design
- Pixel art / Sprites
- Sound design
- Narrativa

Entre em contato!

---

## Licença

MIT License - veja [LICENSE](LICENSE)

---

## Créditos

- **Desenvolvimento**: Pedro Rocha de Oliveira
- **Engine base**: [WebGL-GTA](https://github.com/niklasvh/WebGL-GTA) por Niklas von Hertzen
- **Inspirações**: GTA 1, Tropa de Elite, Cidade de Deus, Bacurau

---

*"No sol vermelho de Fortaleza, todo mundo tem um preço."*
