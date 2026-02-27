# Contribuindo para Sol Vermelho

## Como Rodar

Abrir `index.html` no navegador. Nao precisa instalar nada.
Opcionalmente: `python3 -m http.server 8000` e acessar `http://localhost:8000`.

## Workflow

```bash
# 1. Criar branch a partir da main
git checkout main
git pull origin main
git checkout -b feature/[seu-nome]-[o-que-vai-fazer]

# 2. Trabalhar

# 3. Commitar e criar PR
git add [arquivos]
git commit -m "feat: descricao do que fez"
git push -u origin feature/[seu-nome]-[o-que-vai-fazer]
# Criar PR pro main
```

### Convencao de Branches
```
feature/[nome]-[tarefa]     Nova funcionalidade
fix/[nome]-[bug]            Correcao de bug
chore/[nome]-[tarefa]       Manutencao, limpeza
```

### Convencao de Commits
```
feat: descricao             Nova funcionalidade
fix: descricao              Correcao de bug
docs: descricao             Documentacao
refactor: descricao         Refatoracao
chore: descricao            Manutencao
```

## Padrao de Codigo (JavaScript)

- camelCase para variaveis e funcoes
- const/let (nunca var)
- O jogo e um arquivo unico (`index.html`), com 4 scripts auxiliares na raiz

```javascript
const playerHealth = 100;
function takeDamage(amount) {
    playerHealth -= amount;
}
```

## Reportando Bugs

Criar issue com:
- Passos para reproduzir
- Comportamento esperado vs atual
- Navegador e OS
- Screenshot se possivel

## Codigo de Conduta

- Seja respeitoso
- Aceite criticas construtivas
- Foque no que e melhor pro projeto
