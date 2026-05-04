import Phaser from 'phaser';
import {
  TILE, GAME_W, GAME_H, COLS, LEVEL_ROWS,
  WALL_TILE, PLATFORM_TILE, SPIKE_TILE, FINISH_TILE,
  PLAYER_SPEED, PLAYER_JUMP, PLAYER_DASH_SPEED, PLAYER_DASH_DURATION, PLAYER_DASH_COOLDOWN,
  GRAVITY, COYOTE_TIME, JUMP_BUFFER,
  BOT_DIFFICULTY, COLORS,
} from '../constants.js';
import { generateLevel, validateLevel } from '../level/LevelGenerator.js';
import { seedToNumber } from '../utils/SeedManager.js';
import * as Storage from '../utils/Storage.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  init(data) {
    this.seed = data.seed || 'WOLF-99';
    this.seedNum = data.seedNum || seedToNumber(this.seed);
    this.playerName = data.playerName || 'Spieler';
    this.botDiffKey = data.botDifficulty || 'NORMAL';
    this.botDiffSettings = BOT_DIFFICULTY[this.botDiffKey];

    // Load and validate ghost data
    this.existingGhost = null;
    try {
      const raw = Storage.getBestGhost(this.seed);
      if (raw && Array.isArray(raw.frames) && raw.frames.length > 5 &&
          typeof raw.time === 'number' && raw.time > 0 &&
          typeof raw.frames[0].x === 'number' && typeof raw.frames[0].y === 'number') {
        this.existingGhost = raw;
      }
    } catch (e) {
      console.warn('Ghost data invalid, ignoring:', e);
    }
  }

  create() {
    // --- Generate level ---
    this.levelData = generateLevel(this.seedNum);
    if (!validateLevel(this.levelData)) {
      this.levelData = generateLevel(this.seedNum + 1);
    }

    this.cameras.main.setBackgroundColor(COLORS.BG);

    const levelH = LEVEL_ROWS * TILE;

    // --- Background ---
    this.createBackground(levelH);

    // --- Create tile groups ---
    this.wallGroup = this.physics.add.staticGroup();
    this.platformGroup = this.physics.add.staticGroup();
    this.spikeGroup = this.physics.add.staticGroup();
    this.finishGroup = this.physics.add.staticGroup();

    this.buildLevel();
    this.addDecorations();

    // --- Player ---
    const sp = this.levelData.startPos;
    this.player = this.physics.add.sprite(sp.x, sp.y, 'player');
    this.player.setSize(10, 14);
    this.player.setOffset(3, 2);
    this.player.setCollideWorldBounds(false);
    this.player.setDepth(10);

    // --- Bot ---
    const botStart = this.levelData.startPos;
    this.bot = this.physics.add.sprite(botStart.x + 16, botStart.y, 'bot');
    this.bot.setSize(10, 14);
    this.bot.setOffset(3, 2);
    this.bot.setCollideWorldBounds(false);
    this.bot.setDepth(9);
    this.bot.setTint(0x88cc88);
    this.botWaypointIdx = 0;
    this.botFinished = false;
    this.botFinishTime = 0;

    // --- Ghost ---
    this.ghostSprite = null;
    this.ghostPlaybackIdx = 0;
    if (this.existingGhost && this.existingGhost.frames) {
      this.ghostSprite = this.add.sprite(sp.x, sp.y, 'ghost');
      this.ghostSprite.setAlpha(0.4);
      this.ghostSprite.setDepth(8);
    }

    // --- Physics collisions ---
    this.physics.add.collider(this.player, this.wallGroup);
    this.physics.add.collider(this.bot, this.wallGroup);

    // One-way platform collision
    this.physics.add.collider(this.player, this.platformGroup, null, this.oneWayCheck, this);
    this.physics.add.collider(this.bot, this.platformGroup, null, this.oneWayCheck, this);

    // Spike overlap -> respawn
    this.physics.add.overlap(this.player, this.spikeGroup, this.onPlayerHitSpike, null, this);

    // Finish overlap -> win
    this.physics.add.overlap(this.player, this.finishGroup, this.onPlayerFinish, null, this);

    // --- Physics world bounds ---
    this.physics.world.setBounds(0, 0, COLS * TILE, levelH);

    // --- Camera ---
    this.cameras.main.setBounds(0, 0, COLS * TILE, levelH);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.15);
    this.cameras.main.setDeadzone(GAME_W * 0.2, GAME_H * 0.15);

    // --- Input ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    this.spaceKey = this.input.keyboard.addKey('SPACE');

    // --- Player state ---
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.dashTimer = 0;
    this.dashCooldown = 0;
    this.isDashing = false;
    this.facingRight = true;
    this.isAlive = true;
    this.playerFinished = false;

    // --- Timer ---
    this.gameState = 'countdown'; // countdown | playing | finished
    this.countdownValue = 3;
    this.countdownTimer = 0;
    this.runTime = 0;
    this.frameCount = 0;

    // --- Ghost recording ---
    this.ghostRecording = [];

    // --- Touch controls ---
    this.touchState = { left: false, right: false, jump: false, dash: false };
    this.createTouchControls();

    // --- HUD ---
    this.createHUD();

    // --- Countdown ---
    this.startCountdown();

    // --- Fall death ---
    this.deathY = (LEVEL_ROWS + 5) * TILE;

    // --- Respawn position (last safe platform) ---
    this.lastSafeX = sp.x;
    this.lastSafeY = sp.y;
    this.respawnInvincible = 0;
  }

  // ===================== LEVEL BUILD =====================

  buildLevel() {
    const grid = this.levelData.grid;
    for (let row = 0; row < LEVEL_ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const tile = grid[row][col];
        const x = col * TILE + TILE / 2;
        const y = row * TILE + TILE / 2;

        if (tile === WALL_TILE) {
          const s = this.wallGroup.create(x, y, 'wall');
          s.setSize(TILE, TILE);
          s.refreshBody();
        } else if (tile === PLATFORM_TILE) {
          const s = this.platformGroup.create(x, y, 'platform');
          s.setSize(TILE, TILE);
          s.refreshBody();
        } else if (tile === SPIKE_TILE) {
          const s = this.spikeGroup.create(x, y, 'spike');
          s.setSize(12, 8);
          s.setOffset(2, 0);
          s.refreshBody();
        } else if (tile === FINISH_TILE) {
          const s = this.finishGroup.create(x, y, 'finish');
          s.setSize(TILE, TILE);
          s.refreshBody();
        }
      }
    }
  }

  addDecorations() {
    // Add torches near walls at intervals
    const grid = this.levelData.grid;
    for (let row = 5; row < LEVEL_ROWS - 5; row += 8) {
      // Left wall torch
      if (grid[row][1] === 0) {
        this.add.sprite(1 * TILE + TILE / 2, row * TILE + TILE / 2, 'torch')
          .setDepth(1).setAlpha(0.8);
      }
      // Right wall torch
      if (grid[row][COLS - 2] === 0) {
        this.add.sprite((COLS - 2) * TILE + TILE / 2, row * TILE + TILE / 2, 'torch')
          .setDepth(1).setAlpha(0.8).setFlipX(true);
      }
    }
  }

  createBackground(levelH) {
    // Tiled background
    for (let row = 0; row < LEVEL_ROWS; row++) {
      for (let col = 1; col < COLS - 1; col++) {
        if (this.levelData.grid[row][col] === 0) {
          this.add.sprite(col * TILE + TILE / 2, row * TILE + TILE / 2, 'bg_tile')
            .setDepth(0).setAlpha(0.3);
        }
      }
    }
  }

  // ===================== ONE-WAY PLATFORMS =====================

  oneWayCheck(entity, platform) {
    // Jumping upward → never collide, let entity pass through from below
    if (entity.body.velocity.y < 0) return false;
    // Falling or standing → only collide if entity was above platform last frame
    const prevBottom = entity.body.prev.y + entity.body.height;
    return prevBottom <= platform.body.top + 8;
  }

  // ===================== TOUCH CONTROLS =====================

  createTouchControls() {
    const camH = GAME_H;
    const btnY = camH - 40;
    const btnAlpha = 0.7;

    // Left button
    this.btnLeft = this.add.image(36, btnY, 'btn_left')
      .setScrollFactor(0).setDepth(100).setAlpha(btnAlpha).setInteractive();

    // Right button
    this.btnRight = this.add.image(100, btnY, 'btn_right')
      .setScrollFactor(0).setDepth(100).setAlpha(btnAlpha).setInteractive();

    // Dash button
    this.btnDash = this.add.image(160, btnY, 'btn_dash')
      .setScrollFactor(0).setDepth(100).setAlpha(btnAlpha).setInteractive();

    // Jump button
    this.btnJump = this.add.image(210, btnY, 'btn_jump')
      .setScrollFactor(0).setDepth(100).setAlpha(btnAlpha).setInteractive();

    // Touch handlers
    const setupBtn = (btn, key) => {
      btn.on('pointerdown', () => { this.touchState[key] = true; btn.setAlpha(1); });
      btn.on('pointerup', () => { this.touchState[key] = false; btn.setAlpha(btnAlpha); });
      btn.on('pointerout', () => { this.touchState[key] = false; btn.setAlpha(btnAlpha); });
    };

    setupBtn(this.btnLeft, 'left');
    setupBtn(this.btnRight, 'right');
    setupBtn(this.btnDash, 'dash');
    setupBtn(this.btnJump, 'jump');

    // Multi-touch support
    this.input.addPointer(2);
  }

  // ===================== HUD =====================

  createHUD() {
    const style = {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    };

    const bigStyle = { ...style, fontSize: '12px' };
    const smallStyle = { ...style, fontSize: '6px', color: '#bbbbbb' };

    // Seed label
    this.add.text(4, 4, `SEED: ${this.seed}`, style)
      .setScrollFactor(0).setDepth(100);

    // Mode label
    this.add.text(4, 14, 'JUMP TRIAL V1', smallStyle)
      .setScrollFactor(0).setDepth(100);

    // Timer
    this.timerText = this.add.text(GAME_W / 2, 4, '00:00.000', bigStyle)
      .setScrollFactor(0).setDepth(100).setOrigin(0.5, 0);

    // Ghost time (if exists)
    if (this.existingGhost) {
      const ghostTime = this.formatTime(this.existingGhost.time);
      this.add.text(GAME_W - 4, 4, `GHOST`, { ...smallStyle, color: '#88ccee' })
        .setScrollFactor(0).setDepth(100).setOrigin(1, 0);
      this.add.text(GAME_W - 4, 12, ghostTime, { ...style, color: '#88ccee' })
        .setScrollFactor(0).setDepth(100).setOrigin(1, 0);
    }

    // Best time
    const scores = Storage.getHighscores(this.seed);
    if (scores.length > 0) {
      this.add.text(GAME_W / 2, 16, `BEST: ${this.formatTime(scores[0].time)}`, smallStyle)
        .setScrollFactor(0).setDepth(100).setOrigin(0.5, 0);
    }

    // Pause button area (top right)
    const pauseBtn = this.add.text(GAME_W - 4, 24, '|| PAUSE', { ...smallStyle, color: '#888888' })
      .setScrollFactor(0).setDepth(100).setOrigin(1, 0).setInteractive();
    pauseBtn.on('pointerdown', () => this.togglePause());

    // Countdown text
    this.countdownText = this.add.text(GAME_W / 2, GAME_H / 2 - 30, '', {
      fontFamily: 'monospace', fontSize: '32px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 4,
    }).setScrollFactor(0).setDepth(200).setOrigin(0.5);

    // Bot status text
    this.botStatusText = this.add.text(GAME_W / 2, GAME_H / 2 + 40, '', {
      ...smallStyle, color: '#88cc88',
    }).setScrollFactor(0).setDepth(100).setOrigin(0.5, 0);
  }

  formatTime(ms) {
    const totalSec = ms / 1000;
    const min = Math.floor(totalSec / 60);
    const sec = Math.floor(totalSec % 60);
    const millis = Math.floor(ms % 1000);
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
  }

  // ===================== COUNTDOWN =====================

  startCountdown() {
    this.countdownValue = 3;
    this.countdownText.setText('3');
    this.player.setVelocity(0, 0);
    this.player.body.setAllowGravity(false);
    this.bot.setVelocity(0, 0);
    this.bot.body.setAllowGravity(false);

    this.time.addEvent({
      delay: 800,
      repeat: 3,
      callback: () => {
        this.countdownValue--;
        if (this.countdownValue > 0) {
          this.countdownText.setText(String(this.countdownValue));
        } else if (this.countdownValue === 0) {
          this.countdownText.setText('GO!');
        } else {
          this.countdownText.setText('');
          this.gameState = 'playing';
          this.player.body.setAllowGravity(true);
          this.bot.body.setAllowGravity(true);
        }
      },
    });
  }

  // ===================== UPDATE LOOP =====================

  update(time, delta) {
    if (this.gameState === 'countdown') {
      return;
    }

    if (this.gameState === 'playing') {
      this.runTime += delta;
      this.frameCount++;
      this.timerText.setText(this.formatTime(this.runTime));

      this.updatePlayer(delta);
      this.updateBot(delta);
      try { this.updateGhostPlayback(); } catch (e) {
        console.warn('Ghost playback error, disabling:', e);
        this.existingGhost = null;
        if (this.ghostSprite) this.ghostSprite.setVisible(false);
      }
      this.recordGhost();
      this.updateRespawnInvincibility(delta);
      this.checkFallDeath();
      this.trackSafePosition();
    }
  }

  // ===================== PLAYER =====================

  updatePlayer(delta) {
    if (!this.isAlive) return;

    const body = this.player.body;
    const onFloor = body.blocked.down || body.touching.down;

    // Coyote time
    if (onFloor) {
      this.coyoteTimer = COYOTE_TIME;
    } else {
      this.coyoteTimer -= delta;
    }

    // Input
    const left = this.cursors.left.isDown || this.wasd.A.isDown || this.touchState.left;
    const right = this.cursors.right.isDown || this.wasd.D.isDown || this.touchState.right;
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.wasd.W) ||
      Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
      this.touchState.jump;
    const dashPressed = Phaser.Input.Keyboard.JustDown(this.cursors.shift) ||
      this.touchState.dash;

    // --- Dash ---
    this.dashCooldown -= delta;
    if (this.isDashing) {
      this.dashTimer -= delta;
      if (this.dashTimer <= 0) {
        this.isDashing = false;
      }
    }

    if (dashPressed && !this.isDashing && this.dashCooldown <= 0) {
      this.isDashing = true;
      this.dashTimer = PLAYER_DASH_DURATION;
      this.dashCooldown = PLAYER_DASH_COOLDOWN;
      this.emitDashParticles();
    }

    // --- Horizontal movement ---
    if (this.isDashing) {
      body.setVelocityX(this.facingRight ? PLAYER_DASH_SPEED : -PLAYER_DASH_SPEED);
    } else if (left) {
      body.setVelocityX(-PLAYER_SPEED);
      this.facingRight = false;
    } else if (right) {
      body.setVelocityX(PLAYER_SPEED);
      this.facingRight = true;
    } else {
      body.setVelocityX(0);
    }

    // Flip sprite
    this.player.setFlipX(!this.facingRight);

    // --- Jump buffer ---
    if (jumpPressed) {
      this.jumpBufferTimer = JUMP_BUFFER;
    } else {
      this.jumpBufferTimer -= delta;
    }

    // --- Jump ---
    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      body.setVelocityY(PLAYER_JUMP);
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      this.emitJumpParticles();
    }

    // Reset touch jump (one-shot)
    if (this.touchState.jump) {
      this.touchState.jump = false;
    }
    if (this.touchState.dash) {
      this.touchState.dash = false;
    }

    // --- Animation frame (simple) ---
    if (!onFloor) {
      this.player.setFrame(3); // jump
    } else if (Math.abs(body.velocity.x) > 10) {
      this.player.setFrame(this.frameCount % 20 < 10 ? 1 : 2); // run
    } else {
      this.player.setFrame(0); // idle
    }
  }

  trackSafePosition() {
    const body = this.player.body;
    if ((body.blocked.down || body.touching.down) && this.isAlive) {
      this.lastSafeX = this.player.x;
      this.lastSafeY = this.player.y - 2;
    }
  }

  // ===================== BOT =====================

  updateBot(delta) {
    if (this.botFinished) return;

    const path = this.levelData.botPath;
    if (!path || this.botWaypointIdx >= path.length) {
      this.botFinished = true;
      this.botFinishTime = this.runTime;
      this.bot.setVelocity(0, 0);
      this.botStatusText.setText(`BOT: ${this.formatTime(this.botFinishTime)}`);
      return;
    }

    const target = path[this.botWaypointIdx];
    const bot = this.bot;
    const dx = target.x - bot.x;
    const dy = target.y - bot.y;
    const speed = PLAYER_SPEED * this.botDiffSettings.speedMult;
    const botOnFloor = bot.body.blocked.down || bot.body.touching.down;

    // Horizontal movement toward waypoint
    if (Math.abs(dx) > 4) {
      bot.body.setVelocityX(dx > 0 ? speed : -speed);
      bot.setFlipX(dx < 0);
    } else {
      bot.body.setVelocityX(0);
    }

    // Jump when target is above — always full jump power
    if (dy < -TILE * 0.3 && botOnFloor) {
      bot.body.setVelocityY(PLAYER_JUMP);
    }

    // Also jump if on floor and horizontally close but can't reach (stuck on ledge)
    if (botOnFloor && Math.abs(dx) < TILE * 2 && dy < -4) {
      bot.body.setVelocityY(PLAYER_JUMP);
    }

    // Reached waypoint?
    if (Math.abs(dx) < 14 && Math.abs(dy) < 18) {
      this.botWaypointIdx++;
      this._botStuckTimer = 0;
    }

    // Bot stuck detection — skip waypoint faster
    if (!this._botStuckTimer) this._botStuckTimer = 0;
    if (!this._botLastPos) this._botLastPos = { x: bot.x, y: bot.y };

    const moved = Math.abs(bot.x - this._botLastPos.x) + Math.abs(bot.y - this._botLastPos.y);
    if (moved < 2) {
      this._botStuckTimer += delta;
      // If stuck, try jumping
      if (this._botStuckTimer > 500 && botOnFloor) {
        bot.body.setVelocityY(PLAYER_JUMP);
      }
      // Skip waypoint if stuck too long
      if (this._botStuckTimer > 1500) {
        this.botWaypointIdx++;
        this._botStuckTimer = 0;
      }
    } else {
      this._botStuckTimer = 0;
    }
    this._botLastPos = { x: bot.x, y: bot.y };
  }

  // ===================== GHOST =====================

  recordGhost() {
    if (this.frameCount % 3 === 0) {
      this.ghostRecording.push({
        x: this.player.x,
        y: this.player.y,
        f: this.frameCount,
      });
    }
  }

  updateGhostPlayback() {
    if (!this.ghostSprite || !this.existingGhost) return;

    const frames = this.existingGhost.frames;
    if (!frames || frames.length === 0) {
      this.ghostSprite.setVisible(false);
      return;
    }

    const targetFrame = Math.floor(this.frameCount / 3);
    if (targetFrame < frames.length) {
      const gf = frames[targetFrame];
      if (gf && typeof gf.x === 'number' && typeof gf.y === 'number') {
        this.ghostSprite.setPosition(gf.x, gf.y);
        this.ghostSprite.setVisible(true);
      }
    } else {
      this.ghostSprite.setVisible(false);
    }
  }

  // ===================== SPIKES & DEATH =====================

  onPlayerHitSpike(player, spike) {
    if (this.respawnInvincible > 0 || !this.isAlive) return;

    // Flash and respawn
    this.isAlive = false;
    this.cameras.main.shake(100, 0.01);

    this.player.setTint(0xff0000);
    this.time.delayedCall(300, () => {
      this.player.clearTint();
      this.player.setPosition(this.lastSafeX, this.lastSafeY);
      this.player.setVelocity(0, 0);
      this.isAlive = true;
      this.respawnInvincible = 1000;
    });
  }

  updateRespawnInvincibility(delta) {
    if (this.respawnInvincible > 0) {
      this.respawnInvincible -= delta;
      // Blink effect
      this.player.setAlpha(Math.sin(this.respawnInvincible * 0.02) > 0 ? 1 : 0.3);
      if (this.respawnInvincible <= 0) {
        this.player.setAlpha(1);
      }
    }
  }

  checkFallDeath() {
    if (this.player.y > this.deathY) {
      this.player.setPosition(this.lastSafeX, this.lastSafeY);
      this.player.setVelocity(0, 0);
      this.cameras.main.shake(150, 0.015);
    }

    // Bot fall recovery
    if (this.bot.y > this.deathY && !this.botFinished) {
      const nextWp = this.levelData.botPath[Math.min(this.botWaypointIdx, this.levelData.botPath.length - 1)];
      this.bot.setPosition(nextWp.x, nextWp.y - TILE);
      this.bot.setVelocity(0, 0);
    }
  }

  // ===================== FINISH =====================

  onPlayerFinish(player, finishTile) {
    if (this.playerFinished) return;
    this.playerFinished = true;
    this.gameState = 'finished';

    const finalTime = this.runTime;
    this.player.setVelocity(0, 0);
    this.player.body.setAllowGravity(false);

    // Save score
    const entry = { name: this.playerName, time: finalTime, date: Date.now() };
    const scores = Storage.saveHighscore(this.seed, entry);

    // Save ghost if best
    const ghostData = { time: finalTime, frames: this.ghostRecording };
    const isBestGhost = Storage.saveGhost(this.seed, ghostData);

    // Add to recent seeds
    Storage.addRecentSeed(this.seed);

    // Show completion briefly, then go to results
    this.countdownText.setText('FINISH!');
    this.countdownText.setColor('#44cc88');

    this.cameras.main.flash(500, 68, 204, 136);

    this.time.delayedCall(1500, () => {
      this.scene.start('Result', {
        seed: this.seed,
        seedNum: this.seedNum,
        playerName: this.playerName,
        time: finalTime,
        botTime: this.botFinished ? this.botFinishTime : null,
        ghostTime: this.existingGhost ? this.existingGhost.time : null,
        isBestGhost,
        scores,
        botDifficulty: this.botDiffKey,
      });
    });
  }

  // ===================== PARTICLES =====================

  emitJumpParticles() {
    if (!this.jumpEmitter) {
      this.jumpEmitter = this.add.particles(0, 0, 'particle', {
        speed: { min: 20, max: 60 },
        lifespan: 300,
        scale: { start: 1, end: 0 },
        alpha: { start: 0.8, end: 0 },
        gravityY: 100,
        emitting: false,
        quantity: 5,
      });
      this.jumpEmitter.setDepth(7);
    }
    this.jumpEmitter.emitParticleAt(this.player.x, this.player.y + 7, 5);
  }

  emitDashParticles() {
    if (!this.dashEmitter) {
      this.dashEmitter = this.add.particles(0, 0, 'particle', {
        speed: { min: 30, max: 80 },
        lifespan: 200,
        scale: { start: 1.5, end: 0 },
        alpha: { start: 0.6, end: 0 },
        tint: COLORS.GOLD,
        emitting: false,
        quantity: 8,
      });
      this.dashEmitter.setDepth(7);
    }
    this.dashEmitter.emitParticleAt(this.player.x, this.player.y, 8);
  }

  // ===================== PAUSE =====================

  togglePause() {
    if (this.gameState !== 'playing') return;
    if (this.scene.isPaused()) {
      this.scene.resume();
    } else {
      this.scene.pause();
    }
  }
}
