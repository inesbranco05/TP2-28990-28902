class CenaMenu extends Phaser.Scene {
  constructor() {
    super('CenaMenu');
  }

  create() {
    const melhor = localStorage.getItem('melhorPontuacao') || 0;

    this.cameras.main.setBackgroundColor('#0d0d0d'); // fundo escuro tipo pixel

    this.add.text(400, 120, 'NINJA FROG', {
      fontSize: '48px',
      fill: '#00ff88',
      fontFamily: 'Courier',
      stroke: '#000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(400, 200, `Melhor pontuação: ${melhor}`, {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Courier',
    }).setOrigin(0.5);

    this.add.text(400, 260, 'Pressiona [ESPAÇO] para jogar', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Courier',
    }).setOrigin(0.5);

    this.add.text(400, 320, 'Usa ← ↑ → para mover e saltar', {
      fontSize: '16px',
      fill: '#cccccc',
      fontFamily: 'Courier',
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('CenaJogo');
    });
  }
}
