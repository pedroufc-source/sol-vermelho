# Contribuindo para Sol Vermelho

Obrigado pelo interesse em contribuir! Este documento explica como você pode ajudar.

## Como Contribuir

### Reportando Bugs

1. Verifique se o bug já não foi reportado nas [Issues](https://github.com/pedroufc-source/sol-vermelho/issues)
2. Se não encontrar, crie uma nova issue com:
   - Título descritivo
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots (se aplicável)
   - Versão do Godot / navegador

### Sugerindo Features

1. Abra uma issue com a tag `feature`
2. Descreva a funcionalidade
3. Explique por que seria útil

### Contribuindo com Código

1. **Fork** o repositório
2. Crie uma **branch** para sua feature:
   ```bash
   git checkout -b feature/minha-feature
   ```
3. Faça suas alterações
4. **Commit** com mensagens claras:
   ```bash
   git commit -m "Add: sistema de inventário"
   ```
5. **Push** para seu fork:
   ```bash
   git push origin feature/minha-feature
   ```
6. Abra um **Pull Request**

## Padrões de Código

### GDScript (Godot)

- Use snake_case para variáveis e funções
- Use PascalCase para classes
- Comente código complexo
- Siga o [GDScript Style Guide](https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/gdscript_styleguide.html)

```gdscript
# Bom
var player_health: int = 100
func take_damage(amount: int) -> void:
    player_health -= amount

# Evite
var playerHealth = 100
func TakeDamage(amount):
    playerHealth -= amount
```

### JavaScript (Versão Web)

- Use camelCase para variáveis e funções
- Use const/let ao invés de var
- Comente funções públicas

```javascript
// Bom
const playerHealth = 100;
function takeDamage(amount) {
    playerHealth -= amount;
}
```

## Estrutura de Commits

Use prefixos nos commits:

| Prefixo | Uso |
|---------|-----|
| `Add:` | Nova funcionalidade |
| `Fix:` | Correção de bug |
| `Update:` | Atualização de funcionalidade existente |
| `Remove:` | Remoção de código/feature |
| `Refactor:` | Refatoração sem mudança de comportamento |
| `Docs:` | Apenas documentação |
| `Style:` | Formatação, sem mudança de código |

## Áreas que Precisam de Ajuda

- [ ] Arte/Sprites para personagens e veículos
- [ ] Efeitos sonoros e música
- [ ] Tradução (inglês)
- [ ] Testes e QA
- [ ] Design de missões
- [ ] Otimização de performance

## Código de Conduta

- Seja respeitoso
- Aceite críticas construtivas
- Foque no que é melhor para o projeto
- Mantenha discussões técnicas

## Dúvidas?

Abra uma issue com a tag `question` ou entre em contato.

---

Obrigado por contribuir! 🎮
