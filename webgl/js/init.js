/**
 * SOL VERMELHO WebGL - Inicialização
 */

document.addEventListener('DOMContentLoaded', () => {
    // Cria instância do jogo
    game = new Game();

    // Inicializa Three.js e sistemas
    game.init();

    // Botão de início
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            game.start();
        });
    }

    // Também permite começar com Enter ou Space
    document.addEventListener('keydown', (e) => {
        if (!game.running && (e.code === 'Enter' || e.code === 'Space')) {
            game.start();
        }
    });

    console.log('Sol Vermelho WebGL pronto!');
    console.log('Clique em JOGAR para começar.');
});
