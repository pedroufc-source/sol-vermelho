# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Em Desenvolvimento
- Sistema de save/load
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
