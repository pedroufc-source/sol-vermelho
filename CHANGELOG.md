# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [v6] - Em Desenvolvimento (Fev 2025)

**Foco atual: Colisão e Mapa OSM de Fortaleza**

### Adicionado
- Integração com dados **OpenStreetMap** de Fortaleza
- Sistema de colisão baseado em geometria real da cidade
- Nova arquitetura modular em `sv/`
- Extração completa de sprites do GTA1 (`gta1_assets/`)
- Pasta `reference/` com código do WebGL-GTA original

### Mudado
- Entry point movido para `index.html`
- Estrutura simplificada para prototipagem rápida

### Histórico de Tentativas (v1-v5)

| Versão | Abordagem | Por que mudamos |
|--------|-----------|-----------------|
| v5 | WebGL + sprites GTA1 | Escalas inconsistentes |
| v4 | WebGL inicial | Complexidade de integração |
| v3 | HTML com src/ modular | Canvas 2D limitado |
| v2 | Canvas 2D puro | Código monolítico |
| v1 | Godot 4.2 | Export web pesado (~50MB) |

---

## [Unreleased]

### Adicionado
- **Sistema de Save/Load**
  - Salvar progresso com F5 ou menu de pausa
  - Autosave ao completar missões
  - Carregar jogo salvo do menu principal
  - Dados salvos: dinheiro, score, missão, posição, armas
- **Menu de Pausa** (tecla ESC)
  - Continuar, Salvar, Voltar ao Menu
- **Aviso de Idade (18+)**
  - Tela de verificação de idade obrigatória
  - Disclaimer legal sobre conteúdo fictício

### Em Desenvolvimento
- Cutscenes narrativas
- Trilha sonora original
- Capítulos 2, 3 e 4

---

## [0.1.0] - 2026-02-02

### Adicionado
- **Projeto inicial** com estrutura base
- **Sistema de movimento** do jogador (andar/correr)
- **Sistema de combate**
  - Combate corpo-a-corpo (punhos)
  - Armas de fogo (pistola, UZI, shotgun)
  - Sistema de munição
- **Sistema de veículos**
  - Entrada/saída de veículos
  - Física de direção realista
  - Atropelamento com dano
- **Sistema de facções**
  - 4 facções principais
  - Sistema de reputação (-100 a +100)
  - NPCs hostis baseado em reputação
- **Sistema de Wanted Levels**
  - 6 níveis de perseguição
  - Escalada progressiva (PM-CE → RAIO → PF)
- **IA de NPCs**
  - Patrulha
  - Detecção de ameaças
  - Perseguição e ataque
- **HUD**
  - Barra de vida
  - Contador de dinheiro
  - Arma atual e munição
  - Estrelas de wanted level
- **Versão Web**
  - Implementação completa em HTML5/Canvas
  - 6 missões do Capítulo 1
  - Sistema de diálogos
- **Mapa de Fortaleza**
  - Bairros principais (Aldeota, Centro, Meireles, etc.)
  - Pontos de referência (Castelão, Catedral, Beach Park)
- **Narrativa**
  - Roteiro completo dos 4 capítulos
  - 26 missões planejadas
  - 3 finais diferentes

### Técnico
- Suporte a Godot 4.2 e 4.6
- Versão legado (4.2) e principal (4.6)
- Exportação para múltiplas plataformas

---

## Tipos de Mudanças

- `Adicionado` para novas funcionalidades
- `Modificado` para mudanças em funcionalidades existentes
- `Obsoleto` para funcionalidades que serão removidas
- `Removido` para funcionalidades removidas
- `Corrigido` para correções de bugs
- `Segurança` para vulnerabilidades

---

[Unreleased]: https://github.com/pedroufc-source/sol-vermelho/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/pedroufc-source/sol-vermelho/releases/tag/v0.1.0
