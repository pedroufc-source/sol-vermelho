# GTA 1 Asset Extractor

Extrator de assets do GTA 1 original, baseado na engenharia reversa do projeto WebGL-GTA de Niklas von Hertzen (2011-2012).

## Créditos

- **Engenharia reversa original**: Niklas von Hertzen (hertzen.com)
- **Código original preservado em**: `_archive/sol_vermelho_web/gta1_assets/WebGL-GTA/`
- **Modernização**: Equipe Sol Vermelho

## Formatos suportados

- `.G24` - Arquivos de estilo (sprites, tiles, paletas de cor)
- `.CMP` - Arquivos de mapa comprimidos

## Uso

```bash
# Instalar dependências
npm install

# Extrair sprites do STYLE001.G24
node extract.js ../assets/gta1/STYLE001.G24 --output ./output/

# Extrair dados de veículos
node extract.js ../assets/gta1/STYLE001.G24 --vehicles --output ./output/vehicles.json
```

## Estrutura dos arquivos G24

```
Header (64 bytes)
├── versionCode (4 bytes)
├── sideSize (4 bytes) - tiles laterais
├── lidSize (4 bytes) - tiles de topo
├── auxSize (4 bytes) - tiles auxiliares
├── animSize (4 bytes) - animações
├── clutSize (4 bytes) - Color Look-Up Table
├── tileClutSize (4 bytes)
├── spriteClutSize (4 bytes)
├── newCarClutSize (4 bytes)
├── fontClutSize (4 bytes)
├── paletteIndexSize (4 bytes)
├── objectInfoSize (4 bytes)
├── carSize (4 bytes) - dados de veículos
├── spriteInfoSize (4 bytes)
├── spriteGraphicsSize (4 bytes)
└── spriteNumbersSize (4 bytes)

Tile Data
├── Side tiles (64x64 cada)
├── Lid tiles (64x64 cada)
└── Aux tiles (64x64 cada)

Animation Data
CLUT Data (paletas de cores)
Palette Index
Object Info
Car Data (física dos veículos)
Sprite Info
Sprite Graphics
Sprite Numbers (contagem por tipo)
```

## Tipos de Sprites

| Tipo | Descrição |
|------|-----------|
| ARROW | Setas de direção |
| DIGITS | Números |
| BOAT | Barcos |
| BOX | Caixas/objetos |
| BUS | Ônibus |
| CAR | Carros |
| OBJECT | Objetos genéricos |
| PED | Pedestres |
| SPEEDO | Velocímetro |
| TANK | Tanque |
| TRAFFIC_LIGHTS | Semáforos |
| TRAIN | Trem |
| BIKE | Motos |
| WCAR | Carros destruídos |
| EX | Explosões |

## Dados de Veículos

Cada veículo no GTA 1 tem:

```javascript
{
    width, height, depth,    // Dimensões
    maxSpeed, minSpeed,      // Velocidade
    acceleration, braking,   // Aceleração/Frenagem
    grip, handling,          // Aderência/Manuseio
    mass, thrust,            // Massa/Empuxo
    tyreAdhesionX/Y,         // Aderência dos pneus
    handbrakeFriction,       // Fricção do freio de mão
    footbrakeFriction,       // Fricção do freio normal
    turnRatio,               // Razão de curva
    model, type              // Identificadores
}
```
