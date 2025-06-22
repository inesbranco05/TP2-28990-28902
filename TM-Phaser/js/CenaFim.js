class CenaFim extends Phaser.Scene {
  constructor() {
    super('CenaFim');
  }

  create() {
    const pontuacao = localStorage.getItem('ultimaPontuacao') || 0;
    const melhor = localStorage.getItem('melhorPontuacao') || 0;
    const moedas = localStorage.getItem('moedasApanhadas') || 0;

    this.cameras.main.setBackgroundColor('#1a1a1a');

    this.add.text(400, 120, 'GAME OVER', {
      fontSize: '48px',
      fill: '#ff4444',
      fontFamily: 'Courier',
      stroke: '#000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(400, 200, `Plataformas alcançadas: ${pontuacao}`, {
      fontSize: '22px',
      fill: '#ffffff',
      fontFamily: 'Courier',
    }).setOrigin(0.5);

     this.add.text(400, 240, `Moedas apanhadas: ${moedas}`, {
      fontSize: '22px',
      fill: '#ffffff',
      fontFamily: 'Courier',
    }).setOrigin(0.5);

    this.add.text(400, 280, `Melhor pontuação: ${melhor}`, {
      fontSize: '22px',
      fill: '#ffff00',
      fontFamily: 'Courier',
    }).setOrigin(0.5);


    this.add.text(400, 350, 'Pressiona [ESPAÇO] para jogar de novo', {
      fontSize: '18px',
      fill: '#00ffcc',
      fontFamily: 'Courier',
    }).setOrigin(0.5);


    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('CenaJogo');
    });
  }
}
