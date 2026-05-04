import Phaser from 'phaser';
import { GAME_W, GAME_H, COLORS } from '../constants.js';
import * as Storage from '../utils/Storage.js';

export class ResultScene extends Phaser.Scene {
  constructor() {
    super('Result');
  }

  init(data) {
    this.seed = data.seed;
    this.seedNum = data.seedNum;
    this.playerName = data.playerName;
    this.time = data.time;
    this.botTime = data.botTime;
    this.ghostTime = data.ghostTime;
    this.isBestGhost = data.isBestGhost;
    this.scores = data.scores || [];
    this.botDifficulty = data.botDifficulty;
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.BG);
    const cx = GAME_W / 2;

    // --- Header ---
    this.add.text(cx, 16, 'ERGEBNIS', {
      fontFamily: 'monospace', fontSize: '14px', color: '#f1c40f',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(cx, 34, `SEED: ${this.seed}`, {
      fontFamily: 'monospace', fontSize: '8px', color: '#aaaaaa',
    }).setOrigin(0.5);

    // --- Time ---
    const timeStr = this.formatTime(this.time);
    this.add.text(cx, 60, timeStr, {
      fontFamily: 'monospace', fontSize: '18px', color: '#ffffff',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(cx, 80, this.playerName, {
      fontFamily: 'monospace', fontSize: '9px', color: '#e74c3c',
    }).setOrigin(0.5);

    // --- Comparison ---
    let compY = 100;

    // vs Bot
    if (this.botTime != null) {
      const beatBot = this.time < this.botTime;
      const botStr = this.formatTime(this.botTime);
      this.add.text(cx, compY, `BOT (${this.botDifficulty}): ${botStr}`, {
        fontFamily: 'monospace', fontSize: '8px', color: '#88cc88',
      }).setOrigin(0.5);
      this.add.text(cx, compY + 12, beatBot ? '✓ BOT GESCHLAGEN!' : '✗ Bot war schneller', {
        fontFamily: 'monospace', fontSize: '8px',
        color: beatBot ? '#44cc88' : '#cc4444',
      }).setOrigin(0.5);
      compY += 28;
    }

    // vs Ghost
    if (this.ghostTime != null) {
      const beatGhost = this.time < this.ghostTime;
      const ghostStr = this.formatTime(this.ghostTime);
      this.add.text(cx, compY, `GHOST: ${ghostStr}`, {
        fontFamily: 'monospace', fontSize: '8px', color: '#88ccee',
      }).setOrigin(0.5);
      this.add.text(cx, compY + 12, beatGhost ? '✓ GHOST GESCHLAGEN!' : '✗ Ghost war schneller', {
        fontFamily: 'monospace', fontSize: '8px',
        color: beatGhost ? '#44cc88' : '#cc4444',
      }).setOrigin(0.5);
      compY += 28;
    }

    if (this.isBestGhost) {
      this.add.text(cx, compY, '★ NEUER GHOST GESPEICHERT!', {
        fontFamily: 'monospace', fontSize: '8px', color: '#f1c40f',
      }).setOrigin(0.5);
      compY += 16;
    }

    // --- Leaderboard ---
    compY += 10;
    this.add.text(cx, compY, 'RANGLISTE', {
      fontFamily: 'monospace', fontSize: '9px', color: '#f1c40f',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    compY += 16;

    const topScores = this.scores.slice(0, 5);
    const medalColors = [0xf1c40f, 0xbdc3c7, 0xcd7f32, 0xaaaaaa, 0xaaaaaa];

    topScores.forEach((score, i) => {
      const rank = `${i + 1}.`;
      const name = score.name.substring(0, 8).padEnd(8);
      const time = this.formatTime(score.time);
      const isCurrentRun = score.time === this.time && score.name === this.playerName;

      this.add.text(cx, compY + i * 14, `${rank} ${name}  ${time}`, {
        fontFamily: 'monospace', fontSize: '7px',
        color: isCurrentRun ? '#ffffff' : `#${medalColors[i].toString(16).padStart(6, '0')}`,
        stroke: isCurrentRun ? '#e74c3c' : undefined,
        strokeThickness: isCurrentRun ? 1 : 0,
      }).setOrigin(0.5);
    });

    // --- Actions ---
    const actY = compY + topScores.length * 14 + 20;

    // Retry
    const retryBtn = this.createButton(cx, actY, '↻ NOCHMAL', '#44cc88');
    retryBtn.on('pointerdown', () => {
      this.scene.start('Game', {
        seed: this.seed,
        seedNum: this.seedNum,
        playerName: this.playerName,
        botDifficulty: this.botDifficulty,
      });
    });

    // New seed
    const newBtn = this.createButton(cx, actY + 22, '⟳ NEUER SEED', '#6688aa');
    newBtn.on('pointerdown', () => {
      this.scene.start('Menu');
    });

    // Favorite
    const favSeeds = Storage.getFavoriteSeeds();
    const isFav = favSeeds.includes(this.seed);
    const favBtn = this.createButton(cx, actY + 44, isFav ? '★ FAVORIT (gespeichert)' : '☆ ALS FAVORIT SPEICHERN', '#f1c40f');
    favBtn.on('pointerdown', () => {
      if (!isFav) {
        Storage.saveFavoriteSeed(this.seed);
        favBtn.setText('★ FAVORIT (gespeichert)');
      } else {
        Storage.removeFavoriteSeed(this.seed);
        favBtn.setText('☆ ALS FAVORIT SPEICHERN');
      }
    });

    // Share text
    const shareBtn = this.createButton(cx, actY + 66, '↗ TEILEN', '#aa66cc');
    shareBtn.on('pointerdown', () => this.shareResult());

    // Back to menu
    const menuBtn = this.createButton(cx, actY + 88, '← MENÜ', '#888888');
    menuBtn.on('pointerdown', () => this.scene.start('Menu'));

    // Keyboard
    this.input.keyboard.on('keydown-ENTER', () => {
      this.scene.start('Game', {
        seed: this.seed,
        seedNum: this.seedNum,
        playerName: this.playerName,
        botDifficulty: this.botDifficulty,
      });
    });
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.start('Menu');
    });
  }

  createButton(x, y, text, color) {
    return this.add.text(x, y, text, {
      fontFamily: 'monospace', fontSize: '8px', color,
      stroke: '#000', strokeThickness: 1,
      padding: { x: 6, y: 3 },
    }).setOrigin(0.5).setInteractive();
  }

  formatTime(ms) {
    const totalSec = ms / 1000;
    const min = Math.floor(totalSec / 60);
    const sec = Math.floor(totalSec % 60);
    const millis = Math.floor(ms % 1000);
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
  }

  shareResult() {
    const timeStr = this.formatTime(this.time);
    const text = `Duel of the Seeds — Seed ${this.seed}\nMeine Zeit: ${timeStr}\nSchaffst du das schneller? 🏆`;

    if (navigator.share) {
      navigator.share({ title: 'Duel of the Seeds', text }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.add.text(GAME_W / 2, GAME_H - 20, 'In Zwischenablage kopiert!', {
          fontFamily: 'monospace', fontSize: '7px', color: '#44cc88',
        }).setOrigin(0.5);
      });
    }
  }
}
