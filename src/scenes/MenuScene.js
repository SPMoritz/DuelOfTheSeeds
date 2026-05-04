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
    let y = 0;

    // --- Decorative top line ---
    const topLine = this.add.graphics();
    topLine.fillStyle(0xe74c3c, 0.6);
    topLine.fillRect(20, 6, GAME_W - 40, 1);
    topLine.fillStyle(0xf1c40f, 0.6);
    topLine.fillRect(20, 8, GAME_W - 40, 1);

    // --- Title ---
    y = 18;
    this.add.text(cx, y, 'DUEL OF', {
      fontFamily: 'monospace', fontSize: '14px', color: '#e74c3c',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    y += 18;
    this.add.text(cx, y, 'THE SEEDS', {
      fontFamily: 'monospace', fontSize: '20px', color: '#f1c40f',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5);

    // Animated swords / sparkle
    const sparkle = this.add.text(cx, y + 20, '⚔ JUMP TRIAL ⚔', {
      fontFamily: 'monospace', fontSize: '7px', color: '#666666',
    }).setOrigin(0.5);
    this.tweens.add({
      targets: sparkle, alpha: 0.4, yoyo: true, repeat: -1,
      duration: 1200, ease: 'Sine.easeInOut',
    });

    // --- Decorative separator ---
    const sep1 = this.add.graphics();
    sep1.fillStyle(0x444466, 0.5);
    sep1.fillRect(30, y + 30, GAME_W - 60, 1);

    // --- Seed display ---
    y += 44;
    this.add.text(cx, y, 'SEED:', {
      fontFamily: 'monospace', fontSize: '8px', color: '#aaaaaa',
    }).setOrigin(0.5);

    y += 16;
    this.seedText = this.add.text(cx, y, this.currentSeed, {
      fontFamily: 'monospace', fontSize: '14px', color: '#ffffff',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);

    y += 18;
    const randBtn = this.createButton(cx - 40, y, '⟳ NEU', '#44cc88');
    randBtn.on('pointerdown', () => {
      this.currentSeed = generateRandomSeed();
      this.seedText.setText(this.currentSeed);
    });

    const customBtn = this.createButton(cx + 40, y, '✎ EINGEBEN', '#6688aa');
    customBtn.on('pointerdown', () => this.promptCustomSeed());

    // --- Player name ---
    y += 24;
    this.add.text(cx, y, 'SPIELER:', {
      fontFamily: 'monospace', fontSize: '8px', color: '#aaaaaa',
    }).setOrigin(0.5);

    y += 14;
    this.nameText = this.add.text(cx, y, this.settings.playerName, {
      fontFamily: 'monospace', fontSize: '11px', color: '#ffffff',
      stroke: '#000', strokeThickness: 2,
      backgroundColor: '#2a2a3e',
      padding: { x: 8, y: 3 },
    }).setOrigin(0.5).setInteractive();
    this.nameText.on('pointerdown', () => this.promptPlayerName());

    // --- Bot difficulty ---
    y += 22;
    this.add.text(cx, y, 'BOT-SCHWIERIGKEIT:', {
      fontFamily: 'monospace', fontSize: '7px', color: '#aaaaaa',
    }).setOrigin(0.5);

    const difficulties = ['EASY', 'NORMAL', 'HARD', 'PERFECT'];
    const diffLabels = ['Anfänger', 'Normal', 'Schwer', 'Perfekt'];

    this.diffButtons = [];
    const totalW = difficulties.length * 52;
    const startX = cx - totalW / 2 + 26;

    y += 14;
    difficulties.forEach((diff, i) => {
      const bx = startX + i * 52;
      const btn = this.add.text(bx, y, diffLabels[i], {
        fontFamily: 'monospace', fontSize: '7px',
        color: this.selectedDifficulty === diff ? '#f1c40f' : '#666666',
        stroke: '#000', strokeThickness: 1,
        backgroundColor: this.selectedDifficulty === diff ? '#333355' : undefined,
        padding: { x: 4, y: 2 },
      }).setOrigin(0.5).setInteractive();

      btn.on('pointerdown', () => {
        this.selectedDifficulty = diff;
        this.diffButtons.forEach((b, j) => {
          b.setColor(difficulties[j] === diff ? '#f1c40f' : '#666666');
          b.setBackgroundColor(difficulties[j] === diff ? '#333355' : undefined);
        });
      });
      this.diffButtons.push(btn);
    });

    // --- START button ---
    y += 28;
    const startBtn = this.add.text(cx, y, '▶  START', {
      fontFamily: 'monospace', fontSize: '14px', color: '#ffffff',
      stroke: '#000', strokeThickness: 3,
      backgroundColor: '#cc3333',
      padding: { x: 24, y: 8 },
    }).setOrigin(0.5).setInteractive();

    startBtn.on('pointerdown', () => this.startGame());

    this.tweens.add({
      targets: startBtn,
      scaleX: 1.04, scaleY: 1.04,
      yoyo: true, repeat: -1,
      duration: 700, ease: 'Sine.easeInOut',
    });

    // --- Separator ---
    y += 24;
    const sep2 = this.add.graphics();
    sep2.fillStyle(0x444466, 0.3);
    sep2.fillRect(20, y, GAME_W - 40, 1);

    // --- Recent seeds ---
    y += 8;
    const recentSeeds = Storage.getRecentSeeds().slice(0, 4);
    if (recentSeeds.length > 0) {
      this.add.text(cx, y, 'LETZTE SEEDS:', {
        fontFamily: 'monospace', fontSize: '7px', color: '#666688',
      }).setOrigin(0.5);
      y += 12;

      recentSeeds.forEach((seed) => {
        const scores = Storage.getHighscores(seed);
        const bestTime = scores.length > 0 ? this.formatTime(scores[0].time) : '---';
        const seedBtn = this.add.text(cx, y, `${seed}  ${bestTime}`, {
          fontFamily: 'monospace', fontSize: '7px', color: '#8888aa',
        }).setOrigin(0.5).setInteractive();

        seedBtn.on('pointerdown', () => {
          this.currentSeed = seed;
          this.seedText.setText(seed);
        });
        y += 12;
      });
    }

    // --- Favorite seeds ---
    const favSeeds = Storage.getFavoriteSeeds().slice(0, 3);
    if (favSeeds.length > 0) {
      y += 6;
      this.add.text(cx, y, '★ FAVORITEN:', {
        fontFamily: 'monospace', fontSize: '7px', color: '#f1c40f',
      }).setOrigin(0.5);
      y += 12;

      favSeeds.forEach((seed) => {
        const seedBtn = this.add.text(cx, y, seed, {
          fontFamily: 'monospace', fontSize: '7px', color: '#ddaa33',
        }).setOrigin(0.5).setInteractive();

        seedBtn.on('pointerdown', () => {
          this.currentSeed = seed;
          this.seedText.setText(seed);
        });
        y += 12;
      });
    }

    // Keyboard shortcut
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
