import Phaser from 'phaser';
import { GAME_W, GAME_H, COLORS } from '../constants.js';
import { generateRandomSeed, formatSeed, seedToNumber } from '../utils/SeedManager.js';
import * as Storage from '../utils/Storage.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.BG);
    this.settings = Storage.getSettings();
    this.currentSeed = generateRandomSeed();
    this.selectedDifficulty = this.settings.botDifficulty || 'NORMAL';

    const cx = GAME_W / 2;

    // --- Title ---
    this.add.text(cx, 16, 'DUEL OF', {
      fontFamily: 'monospace', fontSize: '16px', color: '#e74c3c',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(cx, 34, 'THE SEEDS', {
      fontFamily: 'monospace', fontSize: '18px', color: '#f1c40f',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(cx, 58, 'JUMP TRIAL V1', {
      fontFamily: 'monospace', fontSize: '7px', color: '#888888',
    }).setOrigin(0.5);

    // --- Seed display ---
    this.add.text(cx, 85, 'SEED:', {
      fontFamily: 'monospace', fontSize: '8px', color: '#aaaaaa',
    }).setOrigin(0.5);

    this.seedText = this.add.text(cx, 100, this.currentSeed, {
      fontFamily: 'monospace', fontSize: '14px', color: '#ffffff',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);

    // Random seed button
    const randBtn = this.createButton(cx, 120, 'NEUER SEED', '#44cc88');
    randBtn.on('pointerdown', () => {
      this.currentSeed = generateRandomSeed();
      this.seedText.setText(this.currentSeed);
    });

    // Custom seed button
    const customBtn = this.createButton(cx, 140, 'SEED EINGEBEN', '#6688aa');
    customBtn.on('pointerdown', () => this.promptCustomSeed());

    // --- Player name ---
    this.add.text(cx, 168, 'SPIELER:', {
      fontFamily: 'monospace', fontSize: '8px', color: '#aaaaaa',
    }).setOrigin(0.5);

    this.nameText = this.add.text(cx, 182, this.settings.playerName, {
      fontFamily: 'monospace', fontSize: '10px', color: '#ffffff',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setInteractive();

    this.nameText.on('pointerdown', () => this.promptPlayerName());

    // --- Bot difficulty ---
    this.add.text(cx, 205, 'BOT-SCHWIERIGKEIT:', {
      fontFamily: 'monospace', fontSize: '8px', color: '#aaaaaa',
    }).setOrigin(0.5);

    const difficulties = ['EASY', 'NORMAL', 'HARD', 'PERFECT'];
    const diffLabels = ['Anfänger', 'Normal', 'Schwer', 'Perfekt'];

    this.diffButtons = [];
    const totalW = difficulties.length * 52;
    const startX = cx - totalW / 2 + 26;

    difficulties.forEach((diff, i) => {
      const bx = startX + i * 52;
      const btn = this.add.text(bx, 220, diffLabels[i], {
        fontFamily: 'monospace', fontSize: '7px',
        color: this.selectedDifficulty === diff ? '#f1c40f' : '#666666',
        stroke: '#000', strokeThickness: 1,
        backgroundColor: this.selectedDifficulty === diff ? '#333333' : undefined,
        padding: { x: 3, y: 2 },
      }).setOrigin(0.5).setInteractive();

      btn.on('pointerdown', () => {
        this.selectedDifficulty = diff;
        this.diffButtons.forEach((b, j) => {
          b.setColor(difficulties[j] === diff ? '#f1c40f' : '#666666');
          b.setBackgroundColor(difficulties[j] === diff ? '#333333' : undefined);
        });
      });

      this.diffButtons.push(btn);
    });

    // --- START button ---
    const startBtn = this.add.text(cx, 260, '▶  START', {
      fontFamily: 'monospace', fontSize: '14px', color: '#ffffff',
      stroke: '#000', strokeThickness: 3,
      backgroundColor: '#cc3333',
      padding: { x: 20, y: 8 },
    }).setOrigin(0.5).setInteractive();

    startBtn.on('pointerdown', () => this.startGame());

    // Pulsing animation on start button
    this.tweens.add({
      targets: startBtn,
      scaleX: 1.05,
      scaleY: 1.05,
      yoyo: true,
      repeat: -1,
      duration: 600,
      ease: 'Sine.easeInOut',
    });

    // --- Recent seeds ---
    const recentSeeds = Storage.getRecentSeeds().slice(0, 5);
    if (recentSeeds.length > 0) {
      this.add.text(cx, 295, 'LETZTE SEEDS:', {
        fontFamily: 'monospace', fontSize: '7px', color: '#888888',
      }).setOrigin(0.5);

      recentSeeds.forEach((seed, i) => {
        const scores = Storage.getHighscores(seed);
        const bestTime = scores.length > 0 ? this.formatTime(scores[0].time) : '---';
        const seedBtn = this.add.text(cx, 308 + i * 14, `${seed}  ${bestTime}`, {
          fontFamily: 'monospace', fontSize: '7px', color: '#aaaacc',
        }).setOrigin(0.5).setInteractive();

        seedBtn.on('pointerdown', () => {
          this.currentSeed = seed;
          this.seedText.setText(seed);
        });
      });
    }

    // --- Favorite seeds ---
    const favSeeds = Storage.getFavoriteSeeds().slice(0, 3);
    if (favSeeds.length > 0) {
      const favY = 295 + (recentSeeds.length + 1) * 14 + 10;
      this.add.text(cx, favY, '★ FAVORITEN:', {
        fontFamily: 'monospace', fontSize: '7px', color: '#f1c40f',
      }).setOrigin(0.5);

      favSeeds.forEach((seed, i) => {
        const seedBtn = this.add.text(cx, favY + 12 + i * 14, seed, {
          fontFamily: 'monospace', fontSize: '7px', color: '#f1c40f',
        }).setOrigin(0.5).setInteractive();

        seedBtn.on('pointerdown', () => {
          this.currentSeed = seed;
          this.seedText.setText(seed);
        });
      });
    }

    // Keyboard shortcut: Enter to start
    this.input.keyboard.on('keydown-ENTER', () => this.startGame());
  }

  createButton(x, y, text, color) {
    return this.add.text(x, y, text, {
      fontFamily: 'monospace', fontSize: '8px', color,
      stroke: '#000', strokeThickness: 1,
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5).setInteractive();
  }

  promptCustomSeed() {
    const seed = prompt('Seed eingeben:');
    if (seed && seed.trim()) {
      this.currentSeed = formatSeed(seed);
      this.seedText.setText(this.currentSeed);
    }
  }

  promptPlayerName() {
    const name = prompt('Spielername:', this.settings.playerName);
    if (name && name.trim()) {
      this.settings.playerName = name.trim();
      this.nameText.setText(this.settings.playerName);
      Storage.saveSettings(this.settings);
    }
  }

  startGame() {
    this.settings.botDifficulty = this.selectedDifficulty;
    Storage.saveSettings(this.settings);

    this.scene.start('Game', {
      seed: this.currentSeed,
      seedNum: seedToNumber(this.currentSeed),
      playerName: this.settings.playerName,
      botDifficulty: this.selectedDifficulty,
    });
  }

  formatTime(ms) {
    const sec = Math.floor(ms / 1000);
    const millis = Math.floor(ms % 1000);
    return `${sec}.${String(millis).padStart(3, '0')}s`;
  }
}
