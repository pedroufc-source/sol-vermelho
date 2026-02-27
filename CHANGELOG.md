# Changelog

## v6 (Fev 2026) - Versao Atual

O jogo funcional. Canvas 2D, single-file (`index.html`).

### O que funciona
- Movimento do jogador (andar/correr, WASD + mouse)
- 8 armas (punhos, faca, pistola, UZI, shotgun, rifle, molotov, granada)
- 8 veiculos com fisica de drift (entrar, dirigir, sair)
- Wanted level (1-6 estrelas: PM-CE, RAIO, PF)
- Resposta policial varia por zona social
- 12 missoes (Capitulos 1 e 2)
- IA de NPCs (patrulha, deteccao, perseguicao)
- Atropelamento
- Sistema CAPS (saude mental afeta gameplay)
- Ciclo dia/noite, clima
- Save/Load (F5, menu, autosave)
- Pause menu (ESC)
- HUD (vida, armadura, dinheiro, arma, wanted, minimapa)
- Tela de morte ("WASTED")
- Aviso de idade 18+ e disclaimer legal
- Intro narrativa
- Rendering 2.5D obliquo com landmarks de Fortaleza

### Historico de versoes anteriores

| Versao | Tech | Resultado |
|--------|------|-----------|
| v1 | Godot 4.2 | Export web 50+ MB, lento pra prototipar |
| v2 | Canvas 2D | Funcionou, mas monolitico |
| v3 | Canvas 2D modular (src/) | Modularizar nao resolveu limitacoes |
| v4 | WebGL | Complexo demais pra prototipar |
| v5 | WebGL + Three.js + sprites GTA1 | Problemas de escala |
| v6 | Canvas 2D single-file | **Versao atual** |
| sv/ | Canvas 2D modular | Tentativa de rewrite, nunca terminou |
| v7 | Python + OSM | Pipeline de dados, nunca conectou ao jogo |
