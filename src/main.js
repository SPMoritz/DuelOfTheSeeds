import Phaser from 'phaser';
import { GAME_W, GAME_H, GRAVITY, COLORS } from './constants.js';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { ResultScene } from './scenes/ResultScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_W,
  height: GAME_H,
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  backgroundColor: COLORS.BG,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: GRAVITY },
      debug: false,
    },
  },
  input: {
    activePointers: 4,
  },
  scene: [BootScene, MenuScene, GameScene, ResultScene],
};

const game = new Phaser.Game(config);
window.__PHASER_GAME__ = game;

// PWA Service Worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
