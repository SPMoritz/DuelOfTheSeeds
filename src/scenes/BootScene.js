import Phaser from 'phaser';
import { TILE, COLORS } from '../constants.js';
import { registerSounds } from '../utils/SoundGen.js';

/**
 * BootScene: generates all pixel art textures programmatically,
 * then transitions to MenuScene.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    this.generateTextures();

    // Generate and load sounds, then go to menu
    this.load.once('complete', () => {
      this.scene.start('Menu');
    });
    registerSounds(this);
  }

  generateTextures() {
    this.createWallTile();
    this.createPlatformTile();
    this.createSpikeTile();
    this.createFinishTile();
    this.createPlayerSprite();
    this.createBotSprite();
    this.createGhostSprite();
    this.createParticle();
    this.createBtnTextures();
    this.createBackgroundTile();
    this.createTorchSprite();
  }

  /** Dark stone wall tile */
  createWallTile() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(COLORS.STONE_DARK);
    g.fillRect(0, 0, TILE, TILE);
    // Brick pattern
    g.fillStyle(COLORS.STONE_MID);
    g.fillRect(1, 1, 6, 6);
    g.fillRect(9, 1, 6, 6);
    g.fillRect(5, 9, 6, 6);
    g.fillRect(12, 9, 3, 6);
    g.fillRect(0, 9, 3, 6);
    // Highlights
    g.fillStyle(COLORS.STONE_LIGHT);
    g.fillRect(1, 1, 6, 1);
    g.fillRect(9, 1, 6, 1);
    g.fillRect(5, 9, 6, 1);
    g.generateTexture('wall', TILE, TILE);
    g.destroy();
  }

  /** Mossy stone platform tile */
  createPlatformTile() {
    const g = this.make.graphics({ add: false });
    // Base stone
    g.fillStyle(COLORS.STONE_MID);
    g.fillRect(0, 0, TILE, TILE);
    // Darker bottom
    g.fillStyle(COLORS.STONE_DARK);
    g.fillRect(0, 12, TILE, 4);
    // Top edge (mossy)
    g.fillStyle(COLORS.PLATFORM_TOP);
    g.fillRect(0, 0, TILE, 3);
    // Moss details
    g.fillStyle(COLORS.MOSS);
    g.fillRect(2, 3, 2, 1);
    g.fillRect(8, 3, 3, 1);
    g.fillRect(13, 2, 2, 2);
    // Stone texture lines
    g.fillStyle(COLORS.STONE_LIGHT);
    g.fillRect(1, 5, 5, 1);
    g.fillRect(8, 7, 4, 1);
    g.generateTexture('platform', TILE, TILE);
    g.destroy();
  }

  /** Spike hazard tile */
  createSpikeTile() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(COLORS.SPIKE);
    // Three triangular spikes
    for (let i = 0; i < 3; i++) {
      const bx = 1 + i * 5;
      g.fillRect(bx + 2, 2, 1, 1);
      g.fillRect(bx + 1, 4, 3, 1);
      g.fillRect(bx + 1, 6, 3, 2);
      g.fillRect(bx, 8, 5, 2);
    }
    // Darker tips
    g.fillStyle(0x992222);
    g.fillRect(3, 2, 1, 1);
    g.fillRect(8, 2, 1, 1);
    g.fillRect(13, 2, 1, 1);
    // Base
    g.fillStyle(COLORS.STONE_DARK);
    g.fillRect(0, 10, TILE, 6);
    g.generateTexture('spike', TILE, TILE);
    g.destroy();
  }

  /** Finish portal tile */
  createFinishTile() {
    const g = this.make.graphics({ add: false });
    // Portal glow
    g.fillStyle(0x115533);
    g.fillRect(0, 0, TILE, TILE);
    // Swirl
    g.fillStyle(COLORS.PORTAL_GREEN);
    g.fillRect(4, 2, 8, 12);
    g.fillStyle(0x66ffaa);
    g.fillRect(6, 4, 4, 8);
    g.fillStyle(0xaaffdd);
    g.fillRect(7, 6, 2, 4);
    // Frame
    g.fillStyle(COLORS.GOLD);
    g.fillRect(2, 0, 12, 2);
    g.fillRect(2, 14, 12, 2);
    g.fillRect(2, 0, 2, 16);
    g.fillRect(12, 0, 2, 16);
    g.generateTexture('finish', TILE, TILE);
    g.destroy();
  }

  /** Player character (16x16) — knight with red cape */
  createPlayerSprite() {
    const T = TILE;
    const g = this.make.graphics({ add: false });

    // --- Frame 0: idle ---
    this.drawPlayerFrame(g, 0, 0, false);
    // --- Frame 1: run1 ---
    this.drawPlayerFrame(g, T, 0, true);
    // --- Frame 2: run2 ---
    this.drawPlayerFrame(g, T * 2, 0, false);
    // --- Frame 3: jump ---
    this.drawPlayerJumpFrame(g, T * 3, 0);

    g.generateTexture('player', T * 4, T);
    g.destroy();

    // Create sprite sheet frames with numeric indices
    const tex = this.textures.get('player');
    tex.add(0, 0, 0, 0, T, T);
    tex.add(1, 0, T, 0, T, T);
    tex.add(2, 0, T * 2, 0, T, T);
    tex.add(3, 0, T * 3, 0, T, T);
  }

  drawPlayerFrame(g, ox, oy, altLeg) {
    // Body (brown tunic)
    g.fillStyle(0x8B4513);
    g.fillRect(ox + 5, oy + 4, 6, 6);
    // Head
    g.fillStyle(0xf0c0a0);
    g.fillRect(ox + 5, oy + 1, 5, 4);
    // Hair
    g.fillStyle(0x553311);
    g.fillRect(ox + 5, oy + 0, 5, 2);
    // Eyes
    g.fillStyle(0x000000);
    g.fillRect(ox + 8, oy + 2, 1, 1);
    // Cape
    g.fillStyle(COLORS.PLAYER);
    g.fillRect(ox + 3, oy + 5, 2, 5);
    g.fillStyle(COLORS.PLAYER_CAPE);
    g.fillRect(ox + 3, oy + 5, 2, 3);
    // Legs
    g.fillStyle(0x444466);
    if (altLeg) {
      g.fillRect(ox + 6, oy + 10, 2, 4);
      g.fillRect(ox + 9, oy + 11, 2, 3);
    } else {
      g.fillRect(ox + 6, oy + 10, 2, 3);
      g.fillRect(ox + 9, oy + 10, 2, 4);
    }
    // Boots
    g.fillStyle(0x663300);
    g.fillRect(ox + 5, oy + 13, 3, 2);
    g.fillRect(ox + 9, oy + 13, 3, 2);
    // Arm
    g.fillStyle(0xf0c0a0);
    g.fillRect(ox + 11, oy + 5, 2, 3);
  }

  drawPlayerJumpFrame(g, ox, oy) {
    // Body
    g.fillStyle(0x8B4513);
    g.fillRect(ox + 5, oy + 3, 6, 6);
    // Head
    g.fillStyle(0xf0c0a0);
    g.fillRect(ox + 5, oy + 0, 5, 4);
    // Hair
    g.fillStyle(0x553311);
    g.fillRect(ox + 5, oy + 0, 5, 2);
    // Eyes
    g.fillStyle(0x000000);
    g.fillRect(ox + 8, oy + 1, 1, 1);
    // Cape (flowing up)
    g.fillStyle(COLORS.PLAYER);
    g.fillRect(ox + 3, oy + 4, 2, 7);
    g.fillRect(ox + 2, oy + 8, 2, 4);
    // Legs (tucked)
    g.fillStyle(0x444466);
    g.fillRect(ox + 6, oy + 9, 2, 3);
    g.fillRect(ox + 9, oy + 9, 2, 3);
    // Boots
    g.fillStyle(0x663300);
    g.fillRect(ox + 5, oy + 12, 3, 2);
    g.fillRect(ox + 9, oy + 11, 3, 2);
    // Arms (reaching up)
    g.fillStyle(0xf0c0a0);
    g.fillRect(ox + 11, oy + 2, 2, 3);
  }

  /** Bot sprite (green knight) */
  createBotSprite() {
    const T = TILE;
    const g = this.make.graphics({ add: false });

    // Helmet
    g.fillStyle(0x336633);
    g.fillRect(4, 0, 7, 5);
    // Visor
    g.fillStyle(0x224422);
    g.fillRect(8, 2, 3, 2);
    // Eye slit
    g.fillStyle(0xffcc00);
    g.fillRect(9, 2, 1, 1);
    // Body armor
    g.fillStyle(0x336633);
    g.fillRect(4, 5, 8, 5);
    g.fillStyle(0x448844);
    g.fillRect(5, 5, 6, 1);
    // Legs
    g.fillStyle(0x2a4a2a);
    g.fillRect(5, 10, 3, 4);
    g.fillRect(9, 10, 3, 4);
    // Boots
    g.fillStyle(0x443322);
    g.fillRect(4, 13, 4, 2);
    g.fillRect(8, 13, 4, 2);
    // Shield arm
    g.fillStyle(COLORS.BOT);
    g.fillRect(2, 5, 2, 5);

    g.generateTexture('bot', T, T);
    g.destroy();
  }

  /** Ghost sprite (transparent blue outline) */
  createGhostSprite() {
    const T = TILE;
    const g = this.make.graphics({ add: false });
    // Simple ghost shape
    g.fillStyle(COLORS.GHOST);
    // Head
    g.fillRect(4, 1, 7, 5);
    // Body
    g.fillRect(3, 6, 9, 5);
    // Wavy bottom
    g.fillRect(3, 11, 3, 2);
    g.fillRect(7, 11, 2, 3);
    g.fillRect(10, 11, 2, 2);
    // Eyes
    g.fillStyle(0xffffff);
    g.fillRect(5, 3, 2, 2);
    g.fillRect(9, 3, 2, 2);
    g.fillStyle(0x3366aa);
    g.fillRect(6, 3, 1, 2);
    g.fillRect(10, 3, 1, 2);

    g.generateTexture('ghost', T, T);
    g.destroy();
  }

  /** Small particle for effects */
  createParticle() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0xffffff);
    g.fillRect(0, 0, 2, 2);
    g.generateTexture('particle', 2, 2);
    g.destroy();
  }

  /** Touch button textures */
  createBtnTextures() {
    const S = 48;

    // Arrow left
    this.createArrowBtn('btn_left', S, 'left');
    // Arrow right
    this.createArrowBtn('btn_right', S, 'right');
    // Jump (up arrow)
    this.createArrowBtn('btn_jump', 64, 'up');
    // Dash
    this.createDashBtn('btn_dash', 40);
  }

  createArrowBtn(name, size, dir) {
    const g = this.make.graphics({ add: false });
    // Background circle
    g.fillStyle(0x000000, 0.4);
    g.fillCircle(size / 2, size / 2, size / 2);
    // Border
    g.lineStyle(2, 0xffffff, 0.6);
    g.strokeCircle(size / 2, size / 2, size / 2 - 2);
    // Arrow
    g.fillStyle(0xffffff, 0.9);
    const cx = size / 2;
    const cy = size / 2;
    const as = size * 0.2;

    if (dir === 'left') {
      g.fillTriangle(cx - as, cy, cx + as * 0.5, cy - as, cx + as * 0.5, cy + as);
    } else if (dir === 'right') {
      g.fillTriangle(cx + as, cy, cx - as * 0.5, cy - as, cx - as * 0.5, cy + as);
    } else if (dir === 'up') {
      g.fillTriangle(cx, cy - as, cx - as, cy + as * 0.5, cx + as, cy + as * 0.5);
    }

    g.generateTexture(name, size, size);
    g.destroy();
  }

  createDashBtn(name, size) {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0x000000, 0.4);
    g.fillRoundedRect(0, 0, size, size, 6);
    g.lineStyle(2, 0xffffff, 0.5);
    g.strokeRoundedRect(1, 1, size - 2, size - 2, 6);
    // Double arrow >>
    g.fillStyle(0xffffff, 0.8);
    const cx = size / 2;
    const cy = size / 2;
    const s = size * 0.15;
    g.fillTriangle(cx - s * 2, cy, cx - s * 0.5, cy - s, cx - s * 0.5, cy + s);
    g.fillTriangle(cx + s * 0.5, cy, cx + s * 2, cy - s, cx + s * 2, cy + s);
    g.generateTexture(name, size, size);
    g.destroy();
  }

  /** Background tile (dark stone) */
  createBackgroundTile() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(COLORS.SKY_TOP);
    g.fillRect(0, 0, TILE, TILE);
    // Subtle texture
    g.fillStyle(0x181830, 0.5);
    g.fillRect(3, 3, 2, 2);
    g.fillRect(10, 7, 2, 2);
    g.fillRect(6, 12, 2, 2);
    g.generateTexture('bg_tile', TILE, TILE);
    g.destroy();
  }

  /** Torch sprite for wall decoration */
  createTorchSprite() {
    const g = this.make.graphics({ add: false });
    // Stick
    g.fillStyle(0x8B6914);
    g.fillRect(6, 6, 3, 10);
    // Bracket
    g.fillStyle(COLORS.STONE_LIGHT);
    g.fillRect(4, 8, 7, 2);
    // Flame
    g.fillStyle(COLORS.TORCH_FIRE);
    g.fillRect(5, 1, 5, 5);
    g.fillStyle(0xffcc44);
    g.fillRect(6, 2, 3, 3);
    g.fillStyle(0xffee88);
    g.fillRect(7, 3, 1, 2);
    g.generateTexture('torch', TILE, TILE);
    g.destroy();
  }
}
