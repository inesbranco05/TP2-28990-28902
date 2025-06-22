const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 700 },
      debug: false,
    },
  },
  scene: [CenaMenu, CenaJogo, CenaFim],
};

const game = new Phaser.Game(config);
