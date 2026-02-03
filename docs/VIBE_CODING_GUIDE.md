# Guia de Vibe Coding para Sol Vermelho

> Boas práticas para desenvolvimento de games com IA (Claude Code, Cursor, etc.)

---

## O que é Vibe Coding?

Termo criado por Andrej Karpathy (2025): usar IA para gerar código a partir de linguagem natural. Você descreve o que quer, a IA implementa.

**Não é:** "faz um jogo completo pra mim"
**É:** usar IA como linguagem de programação de alto nível

---

## 8 Boas Práticas

### 1. Documente ANTES de codar

```
RUIM:  "faz um jogo de crime em Fortaleza"
BOM:   "Leia docs/gdd/ROTEIRO.md e implemente a missão 7"
```

O GDD (Game Design Document) é essencial. Neste projeto:
- `docs/gdd/ROTEIRO.md` - história e missões
- `docs/research/` - pesquisa de referência

---

### 2. Prompts em passos pequenos

```
RUIM:
"Faz o sistema de combate completo"

BOM:
1. "Cria a classe Weapon com dano e alcance"
2. "Adiciona método attack() no Player"
3. "Implementa detecção de colisão de balas"
4. "Adiciona feedback visual de hit"
```

Uma feature por vez. Teste. Commit. Próxima.

---

### 3. Commit frequente, contexto limpo

```bash
# A cada feature completa:
git add .
git commit -m "feat: adiciona sistema X"

# OU use o comando do Claude Code:
/commit-push-pr
```

**Por quê?** Performance do modelo degrada conforme o contexto enche.
Commits frequentes = histórico limpo + contexto renovado.

---

### 4. Use arquivos de spec para features

Para cada feature nova, crie um arquivo descrevendo o que precisa:

```markdown
# docs/specs/missao-13.md

## Missão 13: O Pastor

### Objetivo
Player deve escoltar Pastor Aécio até o culto

### Fases
1. Ir até a Igreja (x: 1400, y: 2100)
2. Eliminar 3 inimigos
3. Escoltar até destino

### Recompensa
$3000

### Diálogos
- Início: "O Senhor precisa de proteção..."
- Fim: "Deus te abençoe, irmão."
```

Depois peça: "Implemente a missão descrita em docs/specs/missao-13.md"

---

### 5. Web + Three.js = melhor para IA

| Engine | Performance IA | Motivo |
|--------|---------------|--------|
| **Web/Three.js** | ⭐⭐⭐⭐⭐ | Muito código de treino |
| Roblox | ⭐⭐⭐ | Abstração alta |
| Godot | ⭐⭐ | Comunidade menor |
| Unity | ⭐ | Pouco código público |

**Sol Vermelho usa Web** - escolha certa para vibe coding.

---

### 6. Estrutura que IA entende

```
src/
├── data/missions/chapter1.json    # DADOS separados de código
├── entities/Player.js             # CLASSES simples e focadas
├── systems/MissionSystem.js       # LÓGICA isolada por sistema
```

**Regras:**
- Arquivos pequenos (< 300 linhas)
- Uma responsabilidade por arquivo
- Dados em JSON, lógica em JS

---

### 7. Divisão de trabalho clara

| Pessoa | Área | Arquivos |
|--------|------|----------|
| **Pedro** (criativo) | Missões, diálogos, balanceamento | `src/data/`, `docs/gdd/` |
| **Saulo** (técnico) | Engine, física, sistemas | `src/core/`, `src/entities/`, `src/systems/` |

Cada um na sua branch. PRs para revisar.

---

### 8. Teste a cada mudança

```
1. Mudou código → abre game.html no browser
2. Funciona? → commit
3. Não funciona? → cola o erro pro Claude
4. Repita
```

Nunca acumule muitas mudanças sem testar.

---

## Comandos úteis no Claude Code

```bash
# Pesquisar no código
"onde está implementado o sistema de wanted?"

# Criar feature
"implemente a missão descrita em docs/specs/missao-X.md"

# Corrigir bug
"esse erro aparece quando atiro: [cola o erro]"

# Refatorar
"extraia a lógica de dano para uma função separada"

# Commitar
/commit-push-pr
```

---

## Quando NÃO usar vibe coding

- **Segurança crítica**: autenticação, pagamentos
- **Performance extrema**: loops de milhões de iterações
- **Código legado complexo**: sem documentação

Para esses casos, escreva manualmente ou revise linha por linha.

---

## Ferramentas recomendadas

| Ferramenta | Uso |
|------------|-----|
| **Claude Code** | Tarefas grandes, refatoração, multi-arquivo |
| **Cursor** | Edição dia-a-dia, autocomplete |
| **GitHub Copilot** | Sugestões inline no VS Code |

---

## Referências

- [8 Vibe Coding Best Practices - Softr](https://www.softr.io/blog/vibe-coding-best-practices)
- [VibeGame Engine - Hugging Face](https://huggingface.co/blog/vibegame)
- [Vibe Coding - Wikipedia](https://en.wikipedia.org/wiki/Vibe_coding)
- [Claude Code Workflow - InfoQ](https://www.infoq.com/news/2026/01/claude-code-creator-workflow/)
- [Google Cloud - Vibe Coding Explained](https://cloud.google.com/discover/what-is-vibe-coding)

---

## TL;DR

1. **Documente primeiro** (GDD pronto)
2. **Peça uma coisa por vez**
3. **Commit frequente**
4. **Teste sempre**
5. **Cada um na sua área**
