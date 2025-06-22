class CenaJogo extends Phaser.Scene {
  constructor() {
    super('CenaJogo');
  }

  preload() {
    this.load.image('sky', 'assets/imagens/background/sky.png');
    this.load.image('ground', 'assets/imagens/tiles/grass.png');

    this.load.spritesheet('ninja_idle', 'assets/imagens/characters/Ninja Frog/Idle.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('ninja_run', 'assets/imagens/characters/Ninja Frog/Run.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('ninja_jump', 'assets/imagens/characters/Ninja Frog/Double Jump.png', { frameWidth: 32, frameHeight: 32 });

    // Inimigo cogumelo
    this.load.spritesheet('mushroom', 'assets/imagens/inimigos/mushroom/Run.png', { frameWidth: 32, frameHeight: 32 });

    this.load.audio('musica', 'assets/audio/musica.mp3');
    this.load.audio('salto', 'assets/audio/salto.mp3');
    this.load.audio('plataforma', 'assets/audio/plataforma.mp3');
    this.load.audio('somMoeda', 'assets/audio/moeda.mp3');
    this.load.audio('somPerdeu', 'assets/audio/perdeu.mp3');
    this.load.audio('morteInimigo', 'assets/audio/morte_inimigo.mp3');

    this.load.spritesheet('moeda', 'assets/imagens/itens/Coin Animation Strip.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('moeda_fx', 'assets/imagens/itens/Coin Collect Particle Strip.png', { frameWidth: 32, frameHeight: 32 });
  }

  create() {
    this.pontuacao = 0;
    this.pontuacaoMoedas = 0;
    this.platformSpawnY = 600;
    this.plataformasVisitadas = new Set();
    this.jogoAtivo = false;
    this.limiteQueda = 1000;

    this.somMusica = this.sound.add('musica', { volume: 0.2, loop: true });
    this.somSalto = this.sound.add('salto', { volume: 0.5 });
    this.somPlataforma = this.sound.add('plataforma', { volume: 0.6 });
    this.somMoeda = this.sound.add('somMoeda', { volume: 0.5 });
    this.somPerdeu = this.sound.add('somPerdeu', { volume: 0.5 });
    this.somMorteInimigo = this.sound.add('morteInimigo', { volume: 0.5 });

    this.somMusica.play();

    this.add.tileSprite(400, 300, 800, 600, 'sky').setScrollFactor(0);

    this.cameras.main.setBounds(0, -10000, 800, 20000);
    this.physics.world.setBounds(0, -10000, 800, 20000);

    this.platforms = this.physics.add.staticGroup();
    this.platformsMoveis = this.physics.add.group({ allowGravity: false, immovable: true });
    this.inimigos = this.physics.add.group();

    this.anims.create({
      key: 'mushroom_run',
      frames: this.anims.generateFrameNumbers('mushroom', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1
    });

    this.platforms.create(400, 600, 'ground').setScale(2).refreshBody();

    for (let i = 1; i <= 9; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = 600 - i * 150;
      this.platforms.create(x, y, 'ground').setScale(2).refreshBody();
      this.platformSpawnY = y;
    }

    this.player = this.physics.add.sprite(400, 400, 'ninja_idle').setScale(2);
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.textoPontuacao = this.add.text(16, 16, 'Plataformas: 0', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial',
    }).setScrollFactor(0);

    this.textoMoedas = this.add.text(16, 40, 'Moedas: 0', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial',
    }).setScrollFactor(0);

    this.moedas = this.physics.add.group();

    this.anims.create({
      key: 'coin_anim',
      frames: this.anims.generateFrameNumbers('moeda', { start: 0, end: 7 }),
      frameRate: 12,
      repeat: -1,
    });

    this.anims.create({
      key: 'coin_fx',
      frames: this.anims.generateFrameNumbers('moeda_fx', { start: 0, end: 7 }),
      frameRate: 20,
      repeat: 0,
      hideOnComplete: true,
    });

    this.physics.add.overlap(this.player, this.moedas, (player, moeda) => {
      this.pontuacaoMoedas++;
      this.textoMoedas.setText('Moedas: ' + this.pontuacaoMoedas);
      this.somMoeda.play();
      const fx = this.add.sprite(moeda.x, moeda.y, 'moeda_fx').setScale(1.3);
      fx.play('coin_fx');
      moeda.destroy();
    }, null, this);

    // Colisão com inimigos
    this.physics.add.overlap(this.player, this.inimigos, (player, inimigo) => {
      if (!this.jogoAtivo) return;

      const pisouPorCima =
        player.body.velocity.y > 0 &&
        player.body.touching.down &&
        inimigo.body.touching.up;

      if (pisouPorCima) {
        this.somMorteInimigo.play();
        inimigo.disableBody(true, true); // remove o inimigo
        this.pontuacao++;
        this.textoPontuacao.setText('Plataformas: ' + this.pontuacao);
      } else {
        this.jogoAtivo = false;
        this.somMusica.stop();
        this.somPerdeu.play();
        this.time.delayedCall(500, () => {
          localStorage.setItem('ultimaPontuacao', this.pontuacao);
          localStorage.setItem('moedasApanhadas', this.pontuacaoMoedas);
          const melhor = localStorage.getItem('melhorPontuacao') || 0;
          if (this.pontuacao > melhor) {
            localStorage.setItem('melhorPontuacao', this.pontuacao);
          }
          this.scene.start('CenaFim');
        });
      }
    });

    // Plataformas
    this.physics.add.collider(this.player, this.platforms, (player, plataforma) => {
      if (
        player.body.touching.down &&
        plataforma.body.touching.up &&
        !this.plataformasVisitadas.has(plataforma)
      ) {
        this.plataformasVisitadas.add(plataforma);
        this.pontuacao++;
        this.textoPontuacao.setText('Plataformas: ' + this.pontuacao);
        this.somPlataforma.play();
      }
    });

    this.physics.add.collider(this.player, this.platformsMoveis, (player, plataforma) => {
      if (
        player.body.touching.down &&
        plataforma.body.touching.up &&
        !this.plataformasVisitadas.has(plataforma)
      ) {
        this.plataformasVisitadas.add(plataforma);
        this.pontuacao++;
        this.textoPontuacao.setText('Plataformas: ' + this.pontuacao);
        this.somPlataforma.play();
      }
    });

    this.physics.add.collider(this.inimigos, this.platforms);
   

    this.cameras.main.startFollow(this.player);

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('ninja_idle', { start: 0, end: 10 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('ninja_run', { start: 0, end: 10 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNumbers('ninja_jump', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1,
    });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.canDoubleJump = false;
    this.hasDoubleJumped = false;
    this.coyoteTimeDuration = 150;
    this.lastOnGroundTime = 0;

    this.time.delayedCall(100, () => {
      this.jogoAtivo = true;
    });
  } 
   update(time, delta) {
  const onGround = this.player.body.blocked.down;

  if (onGround) {
    this.lastOnGroundTime = time;
    this.canDoubleJump = true;
    this.hasDoubleJumped = false;
  }

  if (this.cursors.left.isDown) {
    this.player.setVelocityX(-200);
    this.player.flipX = true;
    if (onGround) this.player.anims.play('run', true);
  } else if (this.cursors.right.isDown) {
    this.player.setVelocityX(200);
    this.player.flipX = false;
    if (onGround) this.player.anims.play('run', true);
  } else {
    this.player.setVelocityX(0);
    if (onGround) this.player.anims.play('idle', true);
  }

  if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
    if (onGround || (time - this.lastOnGroundTime) <= this.coyoteTimeDuration) {
      this.player.setVelocityY(-450);
      this.canDoubleJump = true;
      this.hasDoubleJumped = false;
      this.player.anims.play('jump', true);
      this.somSalto.play();
    } else if (this.canDoubleJump && !this.hasDoubleJumped) {
      this.player.setVelocityY(-400);
      this.hasDoubleJumped = true;
      this.player.anims.play('jump', true);
      this.somSalto.play();
    }
  }

  if (!onGround && this.player.body.velocity.y !== 0) {
    this.player.anims.play('jump', true);
  }

  // Gerar novas plataformas e inimigos
  let plataformasAcima = 0;
  this.platforms.children.each((p) => { if (p.y < this.player.y) plataformasAcima++; });
  this.platformsMoveis.children.each((p) => { if (p.y < this.player.y) plataformasAcima++; });

  while (plataformasAcima < 10) {
    const x = Phaser.Math.Between(100, 700);
    const y = this.platformSpawnY - Phaser.Math.Between(120, 180);
    const isMovel = Phaser.Math.Between(0, 4) === 0;

    let plataforma;
    if (isMovel) {
      plataforma = this.platformsMoveis.create(x, y, 'ground').setScale(2).refreshBody();
      plataforma.setVelocityX(Phaser.Math.Between(60, 100) * (Phaser.Math.Between(0, 1) ? 1 : -1));
    } else {
      plataforma = this.platforms.create(x, y, 'ground').setScale(2).refreshBody();
    }

    this.platformSpawnY = y;
    plataformasAcima++;

    if (Phaser.Math.Between(0, 1)) {
      const moeda = this.moedas.create(x, y - 30, 'moeda').setScale(1.3);
      moeda.body.allowGravity = false;
      moeda.play('coin_anim');
    }

    // Criar cogumelo apenas se não for plataforma móvel
    if (!isMovel && plataforma && Phaser.Math.Between(0, 4) === 0) {
      const inimigo = this.inimigos.create(x, y - 40, 'mushroom').setScale(1.5);
      inimigo.play('mushroom_run');
      inimigo.setVelocityX(Phaser.Math.Between(40, 60) * (Phaser.Math.Between(0, 1) ? 1 : -1));
      inimigo.body.setSize(20, 28).setOffset(6, 4);
      inimigo.setCollideWorldBounds(true)
      inimigo.plataformaBase = plataforma;
    }
  }

  // Remover plataformas muito abaixo do jogador
  this.platforms.children.each((p) => {
    if (p.y > this.player.y + 800) {
      p.destroy();
      this.plataformasVisitadas.delete(p);
    }
  });

  this.platformsMoveis.children.each((p) => {
    if (p.y > this.player.y + 800) {
      p.destroy();
      this.plataformasVisitadas.delete(p);
    }
    if (p.x <= 100) p.setVelocityX(Math.abs(p.body.velocity.x));
    else if (p.x >= 700) p.setVelocityX(-Math.abs(p.body.velocity.x));
  });

  // Mover jogador com plataformas móveis
  this.platformsMoveis.children.each((p) => {
    if (
      this.player.body.blocked.down &&
      Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), p.getBounds())
    ) {
      this.player.x += p.body.velocity.x * delta / 1000;
    }
  });

  // Movimento dos cogumelos dentro da sua plataforma
  this.inimigos.children.each((inimigo) => {
  if (!inimigo.active || !inimigo.body || !inimigo.plataformaBase) return;

  const plataforma = inimigo.plataformaBase;
  const limiteEsquerdo = plataforma.x - plataforma.displayWidth / 2 + 10;
  const limiteDireito = plataforma.x + plataforma.displayWidth / 2 - 10;

  if (inimigo.x <= limiteEsquerdo) {
    inimigo.setVelocityX(Math.abs(inimigo.body.velocity.x));
    inimigo.flipX = false;
  } else if (inimigo.x >= limiteDireito) {
    inimigo.setVelocityX(-Math.abs(inimigo.body.velocity.x));
    inimigo.flipX = true;
  }
});

  //Fim do jogo ao cair
if (this.jogoAtivo && this.player.y > this.limiteQueda) {
    this.jogoAtivo = false;
    this.somMusica.stop();
    this.somPerdeu.play();
    localStorage.setItem('ultimaPontuacao', this.pontuacao);
    localStorage.setItem('moedasApanhadas', this.pontuacaoMoedas);
    const melhor = localStorage.getItem('melhorPontuacao') || 0;
    if (this.pontuacao > melhor) {
      localStorage.setItem('melhorPontuacao', this.pontuacao);
    }
    this.scene.start('CenaFim');
  }
}

}

