/**
 * CYBERVOID: OVERDRIVE - Core Game Loop, Player, Camera & Arena Engine
 */

class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.targetX = 0;
        this.targetY = 0;

        // Screen Shake / Trauma
        this.trauma = 0; // 0.0 to 1.0
        this.shakeAngle = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
        this.maxOffset = 24;
        this.maxAngle = 0.06;
    }

    addTrauma(amount) {
        this.trauma = Math.min(1.0, this.trauma + amount);
    }

    resize(w, h) {
        this.width = w;
        this.height = h;
    }

    update(dt, player, mouseX, mouseY) {
        // Lookahead bias in the direction of mouse aim
        const lookaheadFactor = 0.22;
        const screenCenterX = this.width / 2;
        const screenCenterY = this.height / 2;
        const aimOffsetX = (mouseX - screenCenterX) * lookaheadFactor;
        const aimOffsetY = (mouseY - screenCenterY) * lookaheadFactor;

        this.targetX = player.x + aimOffsetX - screenCenterX;
        this.targetY = player.y + aimOffsetY - screenCenterY;

        // Smooth Camera Lerp
        const lerpFactor = 0.12;
        this.x += (this.targetX - this.x) * lerpFactor;
        this.y += (this.targetY - this.y) * lerpFactor;

        // Update Screen Shake Trauma (quadratic falloff)
        if (this.trauma > 0) {
            const shake = this.trauma * this.trauma;
            this.shakeOffsetX = (Math.random() * 2 - 1) * this.maxOffset * shake;
            this.shakeOffsetY = (Math.random() * 2 - 1) * this.maxOffset * shake;
            this.shakeAngle = (Math.random() * 2 - 1) * this.maxAngle * shake;

            this.trauma = Math.max(0, this.trauma - 1.2 * dt);
        } else {
            this.shakeOffsetX = 0;
            this.shakeOffsetY = 0;
            this.shakeAngle = 0;
        }
    }

    apply(ctx) {
        ctx.save();
        ctx.translate(this.shakeOffsetX, this.shakeOffsetY);
        if (this.shakeAngle !== 0) {
            ctx.translate(this.width / 2, this.height / 2);
            ctx.rotate(this.shakeAngle);
            ctx.translate(-this.width / 2, -this.height / 2);
        }
    }

    restore(ctx) {
        ctx.restore();
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = 16;
        this.speed = 5.2;
        this.friction = 0.86;
        this.angle = 0;

        // Health & Shield
        this.maxHp = 100;
        this.hp = this.maxHp;
        this.maxShield = 50;
        this.shield = this.maxShield;
        this.shieldRechargeDelay = 3.5; // seconds after damage before shield recharges
        this.shieldRechargeTimer = 0;
        this.shieldRechargeRate = 22; // shield hp per second

        // Dash Mechanics
        this.maxDashes = 2;
        this.dashes = this.maxDashes;
        this.dashCooldown = 1.8;
        this.dashRechargeTimer = 0;
        this.isDashing = false;
        this.dashTimer = 0;
        this.dashDuration = 0.18;
        this.dashSpeed = 16.5;
        this.isInvulnerable = false;
        this.invulnerableTimer = 0;

        // Ultimate EMP / Nova Bomb
        this.maxUltimate = 100;
        this.ultimateCharge = 0;

        // Modifiers / Roguelite perks
        this.modifiers = {
            damageMult: 1.0,
            fireRateMult: 1.0,
            bulletSpeedMult: 1.0,
            extraProjectiles: 0,
            extraPierce: 0,
            knockbackMult: 1.0,
            spreadMult: 1.0,
            critChanceBonus: 0.0,
            critDamageBonus: 0.0,
            ricochet: 0,
            lifestealChance: 0.0,
            armorReduction: 0.0
        };

        this.hasTeslaDash = false;
        this.hasCorpseExplosion = false;
        this.magnetRadius = 140;
        this.drones = [];

        // Weapon unlocks
        this.unlockedWeapons = ['carbine', 'shotgun'];
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.hp = this.maxHp;
        this.shield = this.maxShield;
        this.dashes = this.maxDashes;
        this.ultimateCharge = 0;
        this.isDashing = false;
        this.isInvulnerable = false;
    }

    takeDamage(amount) {
        if (this.isInvulnerable || this.isDashing) return;

        // Armor mitigation
        if (this.modifiers.armorReduction > 0) {
            amount *= (1 - this.modifiers.armorReduction);
        }

        this.shieldRechargeTimer = 0; // Reset shield delay
        window.game.camera.addTrauma(0.35);

        // Shield absorbs first
        if (this.shield > 0) {
            window.audio.playShieldHit();
            if (this.shield >= amount) {
                this.shield -= amount;
                window.particles.addHitSparks(this.x, this.y, this.angle + Math.PI, '#00ffff', 8);
                return;
            } else {
                amount -= this.shield;
                this.shield = 0;
                window.audio.playShieldBreak();
                window.particles.addHitSparks(this.x, this.y, this.angle + Math.PI, '#00ffff', 16);
            }
        }

        // Remainder hits HP
        this.hp -= amount;
        window.audio.playPlayerHit();
        window.particles.addHitSparks(this.x, this.y, this.angle + Math.PI, '#ff0033', 12);

        // Flash red combat vignette
        if (window.game) {
            window.game.flashDamageVignette();
        }

        // Brief i-frames
        this.isInvulnerable = true;
        this.invulnerableTimer = 0.35;

        if (this.hp <= 0) {
            this.hp = 0;
            window.game.gameOver();
        }
    }

    dash(moveX, moveY) {
        if (this.dashes < 1 || this.isDashing) return;

        this.dashes--;
        this.isDashing = true;
        this.dashTimer = this.dashDuration;
        this.isInvulnerable = true;
        this.invulnerableTimer = this.dashDuration + 0.1;

        // Determine dash vector
        let dashAngle = this.angle;
        if (moveX !== 0 || moveY !== 0) {
            dashAngle = Math.atan2(moveY, moveX);
        }

        this.vx = Math.cos(dashAngle) * this.dashSpeed;
        this.vy = Math.sin(dashAngle) * this.dashSpeed;

        window.audio.playDash();
        window.particles.addDashGhost(this.x, this.y, this.angle, this.radius, '#00f0ff');
        window.game.camera.addTrauma(0.12);

        // Tesla Dash Shockwave Perk
        if (this.hasTeslaDash && window.game) {
            window.audio.playShoot('tesla');
            window.particles.addExplosion(this.x, this.y, '#00f0ff', 90, 20);
            const enemies = window.game.enemies;
            for (let i = 0; i < enemies.length; i++) {
                const e = enemies[i];
                if (e.isDead) continue;
                if (Math.hypot(e.x - this.x, e.y - this.y) < 130) {
                    e.takeDamage(45, true, 'tesla');
                    e.applyStun(1.0);
                }
            }
        }
    }

    triggerUltimate() {
        if (this.ultimateCharge < this.maxUltimate) return false;

        this.ultimateCharge = 0;
        window.audio.playEmpBlast();
        window.game.camera.addTrauma(0.65);
        window.particles.addExplosion(this.x, this.y, '#00ffcc', 350, 60);

        // Clear all enemy projectiles
        window.game.enemyProjectiles = [];

        // Massive damage & stun to all on-screen enemies
        const enemies = window.game.enemies;
        for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            if (e.isDead) continue;
            e.takeDamage(220, true, 'ultimate');
            e.applyStun(2.5);
        }

        window.particles.addText(this.x, this.y - 40, '⚡ EMP NOVA DETONATED! ⚡', '#00ffcc', 24, true);
        return true;
    }

    update(dt, input, arenaBounds, enemies, playerProjectiles) {
        // 1. Invulnerability timer
        if (this.invulnerableTimer > 0) {
            this.invulnerableTimer -= dt;
            if (this.invulnerableTimer <= 0) {
                this.isInvulnerable = false;
            }
        }

        // 2. Dash Timer & Cooldown
        if (this.isDashing) {
            this.dashTimer -= dt;
            // Spawn afterimages during dash
            if (Math.random() < 0.6) {
                window.particles.addDashGhost(this.x, this.y, this.angle, this.radius, '#00f0ff');
            }
            if (this.dashTimer <= 0) {
                this.isDashing = false;
            }
        }

        if (this.dashes < this.maxDashes) {
            this.dashRechargeTimer += dt;
            if (this.dashRechargeTimer >= this.dashCooldown) {
                this.dashes++;
                this.dashRechargeTimer = 0;
            }
        }

        // 3. Shield Regeneration
        this.shieldRechargeTimer += dt;
        if (this.shieldRechargeTimer >= this.shieldRechargeDelay && this.shield < this.maxShield) {
            this.shield = Math.min(this.maxShield, this.shield + this.shieldRechargeRate * dt);
        }

        // 4. Movement
        if (!this.isDashing) {
            let mx = 0;
            let my = 0;
            if (input.keys['KeyW'] || input.keys['ArrowUp']) my -= 1;
            if (input.keys['KeyS'] || input.keys['ArrowDown']) my += 1;
            if (input.keys['KeyA'] || input.keys['ArrowLeft']) mx -= 1;
            if (input.keys['KeyD'] || input.keys['ArrowRight']) mx += 1;

            // Normalize diagonal
            if (mx !== 0 && my !== 0) {
                mx *= 0.7071;
                my *= 0.7071;
            }

            // Virtual Joystick override
            if (input.virtualMoveX !== 0 || input.virtualMoveY !== 0) {
                mx = input.virtualMoveX;
                my = input.virtualMoveY;
            }

            // Accelerate
            const accel = this.speed * 0.32;
            this.vx += mx * accel;
            this.vy += my * accel;

            // Apply friction
            this.vx *= Math.pow(this.friction, dt * 60);
            this.vy *= Math.pow(this.friction, dt * 60);
        }

        this.x += this.vx * (dt * 60);
        this.y += this.vy * (dt * 60);

        // Clamp to arena
        if (arenaBounds) {
            this.x = Math.max(arenaBounds.minX + this.radius, Math.min(arenaBounds.maxX - this.radius, this.x));
            this.y = Math.max(arenaBounds.minY + this.radius, Math.min(arenaBounds.maxY - this.radius, this.y));
        }

        // 5. Update Drone Companions
        for (let i = 0; i < this.drones.length; i++) {
            this.drones[i].update(dt, enemies, playerProjectiles);
        }
    }

    render(ctx, camera) {
        const sx = this.x - camera.x;
        const sy = this.y - camera.y;

        // Render Drones
        for (let i = 0; i < this.drones.length; i++) {
            this.drones[i].render(ctx, camera);
        }

        ctx.save();
        ctx.translate(sx, sy);

        // Flash if invulnerable
        if (this.isInvulnerable && Math.floor(Date.now() / 60) % 2 === 0) {
            ctx.globalAlpha = 0.45;
        }

        // Energy Shield Ring
        if (this.shield > 0) {
            ctx.save();
            const shieldRatio = this.shield / this.maxShield;
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.4 + shieldRatio * 0.45})`;
            ctx.lineWidth = 2.5;
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 7 + Math.sin(Date.now() * 0.006) * 1.5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        ctx.rotate(this.angle);

        // Cyber Stealth Fighter Ship Chassis
        ctx.fillStyle = '#101524';
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.moveTo(this.radius * 1.4, 0); // Nose cone
        ctx.lineTo(-this.radius * 0.9, -this.radius * 0.9); // Left wingtip
        ctx.lineTo(-this.radius * 0.4, -this.radius * 0.3); // Thruster inlet
        ctx.lineTo(-this.radius * 0.7, 0); // Center rear
        ctx.lineTo(-this.radius * 0.4, this.radius * 0.3); // Thruster inlet
        ctx.lineTo(-this.radius * 0.9, this.radius * 0.9); // Right wingtip
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cockpit Canopy Glow
        ctx.fillStyle = '#00ffcc';
        ctx.beginPath();
        ctx.ellipse(this.radius * 0.2, 0, 6, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Engine Thruster Flame (animated)
        if (Math.hypot(this.vx, this.vy) > 0.5 || this.isDashing) {
            const flameLen = this.isDashing ? 22 : 10 + Math.random() * 6;
            ctx.fillStyle = this.isDashing ? '#00f0ff' : '#ffaa00';
            ctx.beginPath();
            ctx.moveTo(-this.radius * 0.7, -3);
            ctx.lineTo(-this.radius * 0.7 - flameLen, 0);
            ctx.lineTo(-this.radius * 0.7, 3);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }
}

class Pickup {
    constructor(x, y, type = 'xp_small', value = 15) {
        this.x = x;
        this.y = y;
        this.type = type; // xp_small, xp_med, xp_large, health, shield, weapon_crate
        this.value = value;
        this.radius = 7;
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = (Math.random() - 0.5) * 3;
        this.friction = 0.92;
        this.color = '#00ff66';

        if (type === 'xp_med') {
            this.radius = 9;
            this.color = '#00aaff';
        } else if (type === 'xp_large') {
            this.radius = 12;
            this.color = '#cc00ff';
        } else if (type === 'health') {
            this.radius = 11;
            this.color = '#ff0055';
        } else if (type === 'shield') {
            this.radius = 11;
            this.color = '#00ffff';
        } else if (type === 'weapon_crate') {
            this.radius = 14;
            this.color = '#ffea00';
        }
    }

    update(dt, player) {
        // Friction on initial pop
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= this.friction;
        this.vy *= this.friction;

        // Magnet attraction towards player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < player.magnetRadius) {
            const pullSpeed = (1 - dist / player.magnetRadius) * 18.0 + 3.0;
            this.vx += (dx / dist) * pullSpeed;
            this.vy += (dy / dist) * pullSpeed;
        }

        // Collection check
        if (dist < player.radius + this.radius) {
            this.collect(player);
            return false;
        }

        return true;
    }

    collect(player) {
        if (this.type.startsWith('xp')) {
            window.game.addXp(this.value);
            window.audio.playGemPickup(window.game.combo);
        } else if (this.type === 'health') {
            player.hp = Math.min(player.maxHp, player.hp + 35);
            window.particles.addText(player.x, player.y - 20, '+35 HP', '#00ff66', 18);
            window.audio.playGemPickup(2);
        } else if (this.type === 'shield') {
            player.shield = player.maxShield;
            window.particles.addText(player.x, player.y - 20, 'SHIELD MAX!', '#00ffff', 18);
            window.audio.playShieldHit();
        } else if (this.type === 'weapon_crate') {
            window.game.unlockRandomWeapon();
            window.particles.addText(player.x, player.y - 20, 'WEAPON CRATE!', '#ffea00', 22, true);
            window.audio.playLevelUp();
        }
    }

    render(ctx, camera) {
        const sx = this.x - camera.x;
        const sy = this.y - camera.y;

        ctx.save();
        ctx.translate(sx, sy);
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = this.color;

        // Floating hover bob
        const bob = Math.sin(Date.now() * 0.006 + this.x) * 2;

        if (this.type === 'health') {
            // Glowing Cross
            ctx.fillRect(-3, -7 + bob, 6, 14);
            ctx.fillRect(-7, -3 + bob, 14, 6);
        } else if (this.type === 'weapon_crate') {
            // Holographic Crate
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.fillRect(-8, -8 + bob, 16, 16);
            ctx.strokeRect(-8, -8 + bob, 16, 16);
        } else {
            // Nanite Crystal Diamond
            ctx.beginPath();
            ctx.moveTo(0, -this.radius + bob);
            ctx.lineTo(this.radius * 0.8, bob);
            ctx.lineTo(0, this.radius + bob);
            ctx.lineTo(-this.radius * 0.8, bob);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }
}

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.camera = new Camera();
        this.player = new Player(0, 0);

        this.arenaBounds = {
            minX: -1600,
            maxX: 1600,
            minY: -1600,
            maxY: 1600
        };

        this.enemies = [];
        this.enemyProjectiles = [];
        this.pickups = [];

        // Game State
        this.state = 'MENU'; // MENU, PLAYING, LEVEL_UP, PAUSED, GAME_OVER, VICTORY
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('cybervoid_highscore') || '0', 10);
        this.level = 1;
        this.xp = 0;
        this.xpNeeded = 100;
        this.kills = 0;
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.timeSurvived = 0;

        // Adrenaline / Combo System
        this.combo = 1;
        this.comboTimer = 0;
        this.maxComboDuration = 3.8;
        this.maxComboReached = 1;

        // Input
        this.input = {
            keys: {},
            mouseX: window.innerWidth / 2,
            mouseY: window.innerHeight / 2,
            mouseDown: false,
            autoFire: false,
            virtualMoveX: 0,
            virtualMoveY: 0
        };

        this.lastTime = performance.now();
        this.banner = { text: '', color: '#fff', alpha: 0 };
        this.damageVignetteAlpha = 0;

        this.initDOM();
        this.initInput();
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Sync initial audio volume UI
        if (window.audio) {
            const masterSlider = document.getElementById('masterVolSlider');
            const sfxSlider = document.getElementById('sfxVolSlider');
            const musicSlider = document.getElementById('musicVolSlider');
            if (masterSlider) masterSlider.value = window.audio.masterVolume;
            if (sfxSlider) sfxSlider.value = window.audio.sfxVolume;
            if (musicSlider) musicSlider.value = window.audio.musicVolume;
            if (this.ui.btnMuteHud) this.ui.btnMuteHud.textContent = window.audio.isMuted ? '🔇' : '🔊';
        }

        requestAnimationFrame((t) => this.loop(t));
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.camera.resize(this.canvas.width, this.canvas.height);
    }

    initDOM() {
        this.ui = {
            mainMenu: document.getElementById('mainMenu'),
            hud: document.getElementById('hud'),
            levelUpModal: document.getElementById('levelUpModal'),
            pauseModal: document.getElementById('pauseModal'),
            gameOverModal: document.getElementById('gameOverModal'),
            victoryModal: document.getElementById('victoryModal'),
            cardsContainer: document.getElementById('upgradeCardsContainer'),
            scoreVal: document.getElementById('hudScore'),
            highScoreVal: document.getElementById('hudHighScore'),
            levelVal: document.getElementById('hudLevel'),
            xpBarFill: document.getElementById('xpFill'),
            hpBarFill: document.getElementById('hpFill'),
            hpText: document.getElementById('hpText'),
            shieldBarFill: document.getElementById('shieldFill'),
            shieldText: document.getElementById('shieldText'),
            dashPips: document.getElementById('dashPips'),
            ultBarFill: document.getElementById('ultFill'),
            ammoCurrent: document.getElementById('ammoCurrent'),
            ammoMax: document.getElementById('ammoMax'),
            weaponName: document.getElementById('weaponName'),
            weaponSlots: document.getElementById('weaponSlots'),
            comboCounter: document.getElementById('comboCounter'),
            comboMeterFill: document.getElementById('comboMeterFill'),
            bossHud: document.getElementById('bossHud'),
            bossName: document.getElementById('bossName'),
            bossHpFill: document.getElementById('bossHpFill'),
            crosshair: document.getElementById('customCrosshair'),
            btnMuteHud: document.getElementById('btnMuteHud'),
            activeReloadTrack: document.getElementById('activeReloadTrack'),
            activeReloadCursor: document.getElementById('activeReloadCursor'),
            touchControls: document.getElementById('touchControls'),
            touchStickZone: document.getElementById('touchStickLeft'),
            touchStickKnob: document.getElementById('touchStickKnob'),
            touchFireBtn: document.getElementById('touchFireBtn'),
            touchDashBtn: document.getElementById('touchDashBtn'),
            touchEmpBtn: document.getElementById('touchEmpBtn'),
            touchReloadBtn: document.getElementById('touchReloadBtn'),
            touchSwapBtn: document.getElementById('touchSwapBtn')
        };
    }

    initInput() {
        window.addEventListener('keydown', (e) => {
            this.input.keys[e.code] = true;

            // Audio init on first keystroke
            window.audio.init();

            if (e.code === 'KeyP' || e.code === 'Escape') {
                this.togglePause();
            } else if (e.code === 'KeyR') {
                if (this.state === 'PLAYING') {
                    if (window.weapons.current.isReloading) {
                        window.weapons.attemptActiveReload();
                    } else {
                        window.weapons.startReload();
                    }
                }
            } else if (e.code === 'KeyF') {
                this.input.autoFire = !this.input.autoFire;
                this.showBanner(this.input.autoFire ? 'AUTO-FIRE: ON' : 'AUTO-FIRE: OFF', '#00f0ff');
            } else if (e.code === 'KeyM') {
                this.toggleMute();
            } else if (e.code === 'Space' || e.code === 'ShiftLeft') {
                if (this.state === 'PLAYING') {
                    let mx = 0, my = 0;
                    if (this.input.keys['KeyW']) my -= 1;
                    if (this.input.keys['KeyS']) my += 1;
                    if (this.input.keys['KeyA']) mx -= 1;
                    if (this.input.keys['KeyD']) mx += 1;
                    this.player.dash(mx, my);
                }
            } else if (e.code === 'KeyQ' || e.code === 'KeyE') {
                if (this.state === 'PLAYING') {
                    this.player.triggerUltimate();
                }
            } else if (e.key >= '1' && e.key <= '7') {
                const keys = ['carbine', 'shotgun', 'railgun', 'missile', 'tesla', 'flamer', 'vortex'];
                const targetKey = keys[parseInt(e.key, 10) - 1];
                if (targetKey && window.weapons.weapons[targetKey].unlocked) {
                    window.weapons.equip(targetKey);
                    this.updateWeaponHUD();
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            this.input.keys[e.code] = false;
        });

        window.addEventListener('mousemove', (e) => {
            this.input.mouseX = e.clientX;
            this.input.mouseY = e.clientY;

            // Move dynamic custom reticle
            if (this.ui.crosshair) {
                this.ui.crosshair.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
            }
        });

        window.addEventListener('mousedown', (e) => {
            window.audio.init();
            if (e.button === 0) {
                this.input.mouseDown = true;
            } else if (e.button === 2) {
                // Right click = Dash
                e.preventDefault();
                let mx = 0, my = 0;
                if (this.input.keys['KeyW']) my -= 1;
                if (this.input.keys['KeyS']) my += 1;
                if (this.input.keys['KeyA']) mx -= 1;
                if (this.input.keys['KeyD']) mx += 1;
                this.player.dash(mx, my);
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.input.mouseDown = false;
            }
        });

        window.addEventListener('contextmenu', (e) => e.preventDefault());

        window.addEventListener('wheel', (e) => {
            if (this.state !== 'PLAYING') return;
            const keys = ['carbine', 'shotgun', 'railgun', 'missile', 'tesla', 'flamer', 'vortex'];
            const unlocked = keys.filter(k => window.weapons.weapons[k].unlocked);
            const currIdx = unlocked.indexOf(window.weapons.equippedKey);
            let nextIdx = (currIdx + (e.deltaY > 0 ? 1 : -1) + unlocked.length) % unlocked.length;
            window.weapons.equip(unlocked[nextIdx]);
            this.updateWeaponHUD();
        });

        // ==========================================
        // VIRTUAL TOUCH CONTROLS (MOBILE & TABLET)
        // ==========================================
        const enableTouch = () => {
            if (this.ui.touchControls) {
                this.ui.touchControls.classList.remove('hidden');
            }
        };

        window.addEventListener('touchstart', () => {
            window.audio.init();
            enableTouch();
        }, { passive: true, once: true });

        // Left Virtual Joystick
        if (this.ui.touchStickZone && this.ui.touchStickKnob) {
            let stickId = null;
            let center = { x: 0, y: 0 };
            const maxR = 45;

            const onStickStart = (e) => {
                e.preventDefault();
                for (let i = 0; i < e.changedTouches.length; i++) {
                    const t = e.changedTouches[i];
                    if (stickId === null) {
                        stickId = t.identifier;
                        const rect = this.ui.touchStickZone.getBoundingClientRect();
                        center = {
                            x: rect.left + rect.width / 2,
                            y: rect.top + rect.height / 2
                        };
                        updateStickPos(t.clientX, t.clientY);
                        break;
                    }
                }
            };

            const updateStickPos = (cx, cy) => {
                let dx = cx - center.x;
                let dy = cy - center.y;
                const dist = Math.hypot(dx, dy);
                if (dist > maxR) {
                    dx = (dx / dist) * maxR;
                    dy = (dy / dist) * maxR;
                }
                this.ui.touchStickKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
                this.input.virtualMoveX = dx / maxR;
                this.input.virtualMoveY = dy / maxR;
            };

            const onStickMove = (e) => {
                for (let i = 0; i < e.changedTouches.length; i++) {
                    const t = e.changedTouches[i];
                    if (t.identifier === stickId) {
                        e.preventDefault();
                        updateStickPos(t.clientX, t.clientY);
                        break;
                    }
                }
            };

            const onStickEnd = (e) => {
                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (e.changedTouches[i].identifier === stickId) {
                        stickId = null;
                        this.ui.touchStickKnob.style.transform = 'translate(-50%, -50%)';
                        this.input.virtualMoveX = 0;
                        this.input.virtualMoveY = 0;
                        break;
                    }
                }
            };

            this.ui.touchStickZone.addEventListener('touchstart', onStickStart, { passive: false });
            window.addEventListener('touchmove', onStickMove, { passive: false });
            window.addEventListener('touchend', onStickEnd, { passive: false });
            window.addEventListener('touchcancel', onStickEnd, { passive: false });
        }

        // Touch Action Buttons
        if (this.ui.touchFireBtn) {
            this.ui.touchFireBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.input.mouseDown = true;
            });
            this.ui.touchFireBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.input.mouseDown = false;
            });
        }

        if (this.ui.touchDashBtn) {
            this.ui.touchDashBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.player.dash(this.input.virtualMoveX, this.input.virtualMoveY);
            });
        }

        if (this.ui.touchEmpBtn) {
            this.ui.touchEmpBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.player.triggerUltimate();
            });
        }

        if (this.ui.touchReloadBtn) {
            this.ui.touchReloadBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (window.weapons.current.isReloading) {
                    window.weapons.attemptActiveReload();
                } else {
                    window.weapons.startReload();
                }
            });
        }

        if (this.ui.touchSwapBtn) {
            this.ui.touchSwapBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const keys = ['carbine', 'shotgun', 'railgun', 'missile', 'tesla', 'flamer', 'vortex'];
                const unlocked = keys.filter(k => window.weapons.weapons[k].unlocked);
                const currIdx = unlocked.indexOf(window.weapons.equippedKey);
                const nextIdx = (currIdx + 1) % unlocked.length;
                window.weapons.equip(unlocked[nextIdx]);
                this.updateWeaponHUD();
            });
        }
    }

    toggleMute() {
        const isMuted = window.audio.toggleMute();
        if (this.ui.btnMuteHud) {
            this.ui.btnMuteHud.textContent = isMuted ? '🔇' : '🔊';
        }
    }

    startNewGame() {
        window.audio.init();
        window.audio.resume();

        this.player.reset(0, 0);
        this.camera.x = 0;
        this.camera.y = 0;
        this.enemies = [];
        this.enemyProjectiles = [];
        this.pickups = [];
        window.particles.clear();

        this.score = 0;
        this.level = 1;
        this.xp = 0;
        this.xpNeeded = 100;
        this.kills = 0;
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.timeSurvived = 0;
        this.combo = 1;
        this.comboTimer = 0;
        this.isEndlessOverdrive = false;

        window.enemiesManager.start();
        window.weapons.equip('carbine');

        this.state = 'PLAYING';
        this.ui.mainMenu.classList.add('hidden');
        this.ui.gameOverModal.classList.add('hidden');
        if (this.ui.victoryModal) this.ui.victoryModal.classList.add('hidden');
        this.ui.levelUpModal.classList.add('hidden');
        this.ui.pauseModal.classList.add('hidden');
        this.ui.hud.classList.remove('hidden');

        if (this.ui.btnMuteHud && window.audio) {
            this.ui.btnMuteHud.textContent = window.audio.isMuted ? '🔇' : '🔊';
        }

        this.showBanner('CYBERVOID INITIALIZED', '#00f0ff');
        this.updateWeaponHUD();
        window.audio.setCombatIntensity(1);
    }

    victory() {
        this.state = 'VICTORY';
        window.audio.playVictoryFanfare();

        // Celebration fireworks
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const dist = 40 + Math.random() * 90;
            const px = this.player.x + Math.cos(angle) * dist;
            const py = this.player.y + Math.sin(angle) * dist;
            window.particles.addExplosion(px, py, '#ffea00', 80, 45);
        }
        window.particles.addText(this.player.x, this.player.y - 70, 'APEX OVERLORD PURGED!', '#ffea00', 32, true);

        setTimeout(() => {
            if (this.ui.victoryModal) {
                this.ui.victoryModal.classList.remove('hidden');
                document.getElementById('vicFinalScore').textContent = this.score.toLocaleString();
                document.getElementById('vicHighScore').textContent = this.highScore.toLocaleString();
                document.getElementById('vicFinalKills').textContent = this.kills;
                document.getElementById('vicFinalLevel').textContent = this.level;
                document.getElementById('vicFinalTime').textContent = Math.floor(this.timeSurvived) + 's';
                document.getElementById('vicFinalCombo').textContent = 'x' + this.maxComboReached;
            }
        }, 1200);
    }

    continueEndless() {
        this.isEndlessOverdrive = true;
        this.state = 'PLAYING';
        if (this.ui.victoryModal) {
            this.ui.victoryModal.classList.add('hidden');
        }
        this.showBanner('ENDLESS OVERDRIVE ENGAGED // NO LIMITS', '#ff0055');
        window.audio.setCombatIntensity(2);
        // Full repair bonus
        this.player.hp = this.player.maxHp;
        this.player.shield = this.player.maxShield;
        // Proceed to wave 11
        window.enemiesManager.currentWave++;
        window.enemiesManager.waveTimer = 0;
        window.enemiesManager.isWaveIntermission = false;
        window.enemiesManager.spawnWaveAnnouncement();
    }

    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            this.ui.pauseModal.classList.remove('hidden');
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            this.ui.pauseModal.classList.add('hidden');
        }
    }

    addXp(amount) {
        this.xp += amount;
        if (this.xp >= this.xpNeeded) {
            this.xp -= this.xpNeeded;
            this.level++;
            this.xpNeeded = Math.round(this.xpNeeded * 1.25);
            this.triggerLevelUp();
        }
    }

    triggerLevelUp() {
        this.state = 'LEVEL_UP';
        window.audio.playLevelUp();
        this.ui.levelUpModal.classList.remove('hidden');

        // Populate cards
        const choices = window.upgradesManager.getRandomChoices(3);
        this.ui.cardsContainer.innerHTML = '';

        choices.forEach(card => {
            const cardEl = document.createElement('div');
            cardEl.className = `upgrade-card ${card.rarity.toLowerCase()}`;
            cardEl.innerHTML = `
                <div class="card-icon">${card.icon}</div>
                <div class="card-header">
                    <span class="card-title">${card.name}</span>
                    <span class="card-rarity">${card.rarity}</span>
                </div>
                <div class="card-desc">${card.description}</div>
                <button class="card-btn">SELECT PERK</button>
            `;
            cardEl.addEventListener('click', () => {
                window.upgradesManager.applyUpgrade(card, this.player);
                this.ui.levelUpModal.classList.add('hidden');
                this.state = 'PLAYING';
            });
            this.ui.cardsContainer.appendChild(cardEl);
        });
    }

    unlockRandomWeapon() {
        const locked = Object.keys(window.weapons.weapons).filter(k => !window.weapons.weapons[k].unlocked);
        if (locked.length > 0) {
            const pick = locked[Math.floor(Math.random() * locked.length)];
            window.weapons.weapons[pick].unlocked = true;
            window.weapons.equip(pick);
            this.updateWeaponHUD();
            this.showBanner(`UNLOCKED: ${window.weapons.weapons[pick].name.toUpperCase()}!`, '#ffea00');
        } else {
            // Already have all weapons -> give big score + ammo refill
            this.score += 2000;
            window.weapons.current.currentAmmo = window.weapons.current.magSize;
        }
    }

    onEnemyKilled(enemy) {
        this.kills++;

        // Combo Multiplier
        this.combo++;
        this.comboTimer = this.maxComboDuration;
        this.maxComboReached = Math.max(this.maxComboReached, this.combo);

        // Score with combo scaling
        const earnedScore = enemy.scoreValue * this.combo;
        this.score += earnedScore;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('cybervoid_highscore', this.highScore.toString());
        }

        // Ultimate charge
        this.player.ultimateCharge = Math.min(this.player.maxUltimate, this.player.ultimateCharge + (enemy.isBoss ? 40 : 4));

        // Corpse explosion perk
        if (this.player.hasCorpseExplosion) {
            window.particles.addExplosion(enemy.x, enemy.y, '#00ff66', 80, 18);
            for (let i = 0; i < this.enemies.length; i++) {
                const other = this.enemies[i];
                if (other === enemy || other.isDead) continue;
                if (Math.hypot(other.x - enemy.x, other.y - enemy.y) < 85) {
                    other.takeDamage(enemy.maxHp * 0.4, false, 'corpse_explosion');
                }
            }
        }

        // Drop Nanite Gems
        const gemType = enemy.isBoss ? 'xp_large' : (enemy.isElite ? 'xp_med' : 'xp_small');
        this.pickups.push(new Pickup(enemy.x, enemy.y, gemType, enemy.xpValue));

        // Lifesteal / Health drop chance
        const healChance = 0.04 + (this.player.modifiers.lifestealChance || 0);
        if (Math.random() < healChance) {
            this.pickups.push(new Pickup(enemy.x + 10, enemy.y, 'health'));
        }

        // Elite / Boss weapon crate drop
        if (enemy.isElite && Math.random() < 0.4) {
            this.pickups.push(new Pickup(enemy.x - 10, enemy.y, 'weapon_crate'));
        } else if (enemy.isBoss) {
            this.pickups.push(new Pickup(enemy.x - 15, enemy.y, 'weapon_crate'));
            this.pickups.push(new Pickup(enemy.x + 15, enemy.y, 'shield'));
        }
    }

    flashDamageVignette() {
        this.damageVignetteAlpha = 0.8;
    }

    showBanner(text, color = '#00f0ff') {
        this.banner.text = text;
        this.banner.color = color;
        this.banner.alpha = 1.0;
    }

    gameOver() {
        this.state = 'GAME_OVER';
        window.audio.playExplosion(true);
        window.particles.addExplosion(this.player.x, this.player.y, '#00f0ff', 120, 80);

        setTimeout(() => {
            this.ui.gameOverModal.classList.remove('hidden');
            document.getElementById('finalScore').textContent = this.score.toLocaleString();
            document.getElementById('finalHighScore').textContent = this.highScore.toLocaleString();
            document.getElementById('finalKills').textContent = this.kills;
            document.getElementById('finalWave').textContent = window.enemiesManager.currentWave;
            document.getElementById('finalTime').textContent = Math.floor(this.timeSurvived) + 's';
            document.getElementById('finalCombo').textContent = 'x' + this.maxComboReached;
        }, 800);
    }

    // === MAIN UPDATE LOOP ===
    update(dt) {
        if (this.state !== 'PLAYING') return;

        this.timeSurvived += dt;

        // 1. Combo Timer Decay
        if (this.comboTimer > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) {
                this.combo = 1;
            }
        }

        // 2. Banner fade
        if (this.banner.alpha > 0) {
            this.banner.alpha -= dt * 0.5;
        }

        // 3. Damage vignette fade
        if (this.damageVignetteAlpha > 0) {
            this.damageVignetteAlpha = Math.max(0, this.damageVignetteAlpha - dt * 2.2);
        }

        // 4. Player Aim Calculation
        const mouseWorldX = this.camera.x + this.input.mouseX;
        const mouseWorldY = this.camera.y + this.input.mouseY;
        this.player.angle = Math.atan2(mouseWorldY - this.player.y, mouseWorldX - this.player.x);

        // 5. Fire Weapon
        if (this.input.mouseDown || this.input.autoFire) {
            const fired = window.weapons.fire(this.player, this.player.angle, this.player.modifiers);
            if (fired) this.shotsFired++;
        }

        // 6. Update Player
        this.player.update(dt, this.input, this.arenaBounds, this.enemies, window.weapons.projectiles);

        // 7. Update Weapons & Projectiles
        window.weapons.update(dt, this.enemies, this.arenaBounds, this.player);

        // 8. Update Camera
        this.camera.update(dt, this.player, this.input.mouseX, this.input.mouseY);

        // 9. Update Waves & Boss
        window.enemiesManager.update(dt, this.enemies, this.arenaBounds, this.player);

        // Dynamic Music intensity
        if (window.enemiesManager.activeBoss) {
            window.audio.setCombatIntensity(3);
        } else if (this.enemies.length > 15 || this.combo > 5) {
            window.audio.setCombatIntensity(2);
        } else {
            window.audio.setCombatIntensity(1);
        }

        // 10. Update Enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            e.update(dt, this.player, this.enemies, this.arenaBounds, this.enemyProjectiles);
            if (e.isDead) {
                this.enemies.splice(i, 1);
            }
        }

        // 11. Update Enemy Projectiles
        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            const ep = this.enemyProjectiles[i];
            const alive = ep.update(dt, null, this.arenaBounds, null);
            if (!alive) {
                this.enemyProjectiles.splice(i, 1);
                continue;
            }

            // Hit Player Collision
            const d = Math.hypot(ep.x - this.player.x, ep.y - this.player.y);
            if (d < ep.radius + this.player.radius) {
                this.player.takeDamage(ep.damage);
                window.particles.addHitSparks(ep.x, ep.y, ep.angle || 0, '#ff0033', 8);
                this.enemyProjectiles.splice(i, 1);
            }
        }

        // 12. Player Bullet Collision vs Enemies
        this.checkBulletCollisions();

        // 13. Update Pickups
        for (let i = this.pickups.length - 1; i >= 0; i--) {
            const p = this.pickups[i];
            const active = p.update(dt, this.player);
            if (!active) {
                this.pickups.splice(i, 1);
            }
        }

        // 14. Update FX & Particles
        window.particles.update(dt * 60);

        // 15. Update HUD UI Elements
        this.renderHUD();
    }

    checkBulletCollisions() {
        const projs = window.weapons.projectiles;
        for (let pIdx = projs.length - 1; pIdx >= 0; pIdx--) {
            const p = projs[pIdx];
            if (p.owner !== 'player') continue;

            for (let eIdx = 0; eIdx < this.enemies.length; eIdx++) {
                const e = this.enemies[eIdx];
                if (e.isDead || p.hitEntities.has(e)) continue;

                const dist = Math.hypot(p.x - e.x, p.y - e.y);
                if (dist < p.radius + e.radius) {
                    this.shotsHit++;
                    p.hitEntities.add(e);

                    // Juggernaut Frontal Shield check
                    if (e.hasFrontShield) {
                        const hitAngle = Math.atan2(p.y - e.y, p.x - e.x);
                        let angleDiff = Math.abs(hitAngle - e.angle);
                        while (angleDiff > Math.PI) angleDiff = Math.abs(angleDiff - Math.PI * 2);

                        if (angleDiff < e.shieldArc / 2 && p.type !== 'railgun' && p.type !== 'vortex') {
                            // Blocked by shield!
                            window.audio.playShieldHit();
                            window.particles.addHitSparks(p.x, p.y, hitAngle, '#00ffff', 10);
                            projs.splice(pIdx, 1);
                            break;
                        }
                    }

                    // Apply Damage
                    e.takeDamage(p.damage, p.isCrit, p.type);

                    // Knockback
                    if (!e.isBoss) {
                        const pushAngle = Math.atan2(p.vy, p.vx);
                        e.x += Math.cos(pushAngle) * p.knockback;
                        e.y += Math.sin(pushAngle) * p.knockback;
                    }

                    // Status Effects
                    if (p.type === 'flamer') {
                        e.applyBurn(14, 2.5);
                    } else if (p.type === 'tesla' && p.chainCount > 0) {
                        this.triggerTeslaChain(e, p.damage * 0.75, p.chainCount - 1, p.chainRange);
                    }

                    // Splash / Explosives
                    if (p.splashRadius > 0 && p.type === 'missile') {
                        window.particles.addExplosion(p.x, p.y, '#00ff66', p.splashRadius, 25);
                        window.audio.playExplosion(false);
                        for (let j = 0; j < this.enemies.length; j++) {
                            const splashTarget = this.enemies[j];
                            if (splashTarget === e || splashTarget.isDead) continue;
                            const sd = Math.hypot(splashTarget.x - p.x, splashTarget.y - p.y);
                            if (sd < p.splashRadius) {
                                splashTarget.takeDamage(p.damage * 0.65, false, 'missile_splash');
                            }
                        }
                    }

                    // Pierce Check
                    if (p.pierce > 0) {
                        p.pierce--;
                    } else {
                        projs.splice(pIdx, 1);
                        break;
                    }
                }
            }
        }
    }

    triggerTeslaChain(startEnemy, damage, remainingChains, range) {
        if (remainingChains <= 0) return;

        let closest = null;
        let minDist = range;
        for (let i = 0; i < this.enemies.length; i++) {
            const e = this.enemies[i];
            if (e === startEnemy || e.isDead) continue;
            const d = Math.hypot(e.x - startEnemy.x, e.y - startEnemy.y);
            if (d < minDist) {
                minDist = d;
                closest = e;
            }
        }

        if (closest) {
            // Draw electric arc lightning sparks
            window.particles.addSparks(closest.x, closest.y, '#6688ff', 6, 2, 2);
            closest.takeDamage(damage, false, 'tesla');
            closest.applyStun(0.35);
            this.triggerTeslaChain(closest, damage * 0.8, remainingChains - 1, range);
        }
    }

    // === RENDER ALL GAME LAYERS ===
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Apply camera transformation with screen shake
        this.camera.apply(this.ctx);

        // Layer 1: Cyber Arena Floor & Glowing Grid
        this.renderArenaGrid();

        // Layer 2: Persistent Floor Scorch Decals & Shell Casings
        window.particles.renderFloor(this.ctx, this.camera);

        // Layer 3: Pickups
        for (let i = 0; i < this.pickups.length; i++) {
            this.pickups[i].render(this.ctx, this.camera);
        }

        // Layer 4: Enemies & Bosses
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].render(this.ctx, this.camera);
        }

        // Layer 5: Player Ship & Drones
        this.player.render(this.ctx, this.camera);

        // Layer 6: Projectiles (Player & Enemy)
        window.weapons.render(this.ctx, this.camera);
        for (let i = 0; i < this.enemyProjectiles.length; i++) {
            this.enemyProjectiles[i].render(this.ctx, this.camera);
        }

        // Layer 7: Foreground Sparks, Shockwaves, Damage Numbers
        window.particles.renderForeground(this.ctx, this.camera);

        this.camera.restore(this.ctx);

        // Layer 8: Screen-Space Radar Chevrons for Off-Screen Bosses & Elites
        this.renderOffScreenIndicators();

        // Layer 9: Screen-Space Post-Processing (Vignette & Boss Alert Banner)
        this.renderPostProcessing();
    }

    renderOffScreenIndicators() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const padding = 42;

        const targets = this.enemies.filter(e => !e.isDead && (e.isBoss || e.isElite));
        if (targets.length === 0) return;

        const cam = this.camera;

        targets.forEach(target => {
            const sx = target.x - cam.x;
            const sy = target.y - cam.y;

            // If inside viewport with padding, skip
            if (sx >= padding && sx <= w - padding && sy >= padding && sy <= h - padding) {
                return;
            }

            const dx = sx - cx;
            const dy = sy - cy;
            const angle = Math.atan2(dy, dx);
            const dist = Math.hypot(dx, dy);

            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            const halfW = w / 2 - padding;
            const halfH = h / 2 - padding;

            let tX = cos > 0 ? halfW / cos : (cos < 0 ? -halfW / cos : Infinity);
            let tY = sin > 0 ? halfH / sin : (sin < 0 ? -halfH / sin : Infinity);
            let t = Math.min(tX, tY);

            const edgeX = cx + cos * t;
            const edgeY = cy + sin * t;

            const isBoss = target.isBoss;
            const color = isBoss ? '#ff0055' : '#ffea00';
            const pulse = (Math.sin(Date.now() * 0.009) + 1) * 0.3 + 0.4;

            ctx.save();
            ctx.translate(edgeX, edgeY);
            ctx.rotate(angle);

            // Directional Chevron Arrow
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 14 * pulse;
            ctx.globalAlpha = 0.9 * pulse;

            ctx.beginPath();
            ctx.moveTo(14, 0);
            ctx.lineTo(-8, -10);
            ctx.lineTo(-2, 0);
            ctx.lineTo(-8, 10);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            // Distance & Identifier Label
            ctx.save();
            ctx.font = '700 11px "Orbitron", sans-serif';
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 8;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const meters = Math.round(dist / 22) + 'm';
            const label = isBoss ? `⚠️ ${target.bossName || 'BOSS'} [${meters}]` : `⚡ ELITE [${meters}]`;

            const textOffX = -cos * 24;
            const textOffY = -sin * 24;
            ctx.fillText(label, edgeX + textOffX, edgeY + textOffY);
            ctx.restore();
        });
    }

    renderArenaGrid() {
        const bounds = this.arenaBounds;
        const cam = this.camera;
        const ctx = this.ctx;

        const left = bounds.minX - cam.x;
        const top = bounds.minY - cam.y;
        const w = bounds.maxX - bounds.minX;
        const h = bounds.maxY - bounds.minY;

        // Dark metallic arena background
        ctx.fillStyle = '#05070d';
        ctx.fillRect(left, top, w, h);

        // Neon Grid Lines
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.07)';
        ctx.lineWidth = 1;

        const gridSize = 80;
        const startX = Math.floor(bounds.minX / gridSize) * gridSize;
        const startY = Math.floor(bounds.minY / gridSize) * gridSize;

        ctx.beginPath();
        for (let x = startX; x <= bounds.maxX; x += gridSize) {
            ctx.moveTo(x - cam.x, bounds.minY - cam.y);
            ctx.lineTo(x - cam.x, bounds.maxY - cam.y);
        }
        for (let y = startY; y <= bounds.maxY; y += gridSize) {
            ctx.moveTo(bounds.minX - cam.x, y - cam.y);
            ctx.lineTo(bounds.maxX - cam.x, y - cam.y);
        }
        ctx.stroke();

        // High-Voltage Perimeter Energy Barrier
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 18;
        ctx.strokeRect(left, top, w, h);
        ctx.shadowBlur = 0;
    }

    renderPostProcessing() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Red Damage Vignette
        if (this.damageVignetteAlpha > 0) {
            ctx.save();
            const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.35, w / 2, h / 2, w * 0.75);
            grad.addColorStop(0, 'rgba(255, 0, 50, 0)');
            grad.addColorStop(1, `rgba(255, 0, 50, ${this.damageVignetteAlpha})`);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
            ctx.restore();
        }

        // Center Wave Banner
        if (this.banner.alpha > 0) {
            ctx.save();
            ctx.globalAlpha = this.banner.alpha;
            ctx.font = '900 48px "Rajdhani", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = this.banner.color;
            ctx.shadowColor = this.banner.color;
            ctx.shadowBlur = 24;
            ctx.fillText(this.banner.text, w / 2, h * 0.28);
            ctx.restore();
        }
    }

    renderHUD() {
        if (!this.ui.scoreVal) return;

        // Score & Level
        this.ui.scoreVal.textContent = this.score.toLocaleString();
        this.ui.highScoreVal.textContent = this.highScore.toLocaleString();
        this.ui.levelVal.textContent = this.level;
        this.ui.xpBarFill.style.width = `${Math.min(100, (this.xp / this.xpNeeded) * 100)}%`;

        // HP & Shield
        const hpPercent = Math.max(0, (this.player.hp / this.player.maxHp) * 100);
        this.ui.hpBarFill.style.width = `${hpPercent}%`;
        this.ui.hpText.textContent = `${Math.ceil(this.player.hp)} / ${this.player.maxHp}`;

        const shieldPercent = Math.max(0, (this.player.shield / this.player.maxShield) * 100);
        this.ui.shieldBarFill.style.width = `${shieldPercent}%`;
        this.ui.shieldText.textContent = `${Math.ceil(this.player.shield)} / ${this.player.maxShield}`;

        // Dash Pips
        if (this.ui.dashPips) {
            let pipsHtml = '';
            for (let i = 0; i < this.player.maxDashes; i++) {
                const filled = i < this.player.dashes ? 'active' : '';
                pipsHtml += `<div class="dash-pip ${filled}"></div>`;
            }
            this.ui.dashPips.innerHTML = pipsHtml;
        }

        // Ultimate Fill
        const ultPercent = Math.min(100, (this.player.ultimateCharge / this.player.maxUltimate) * 100);
        this.ui.ultBarFill.style.width = `${ultPercent}%`;

        // Ammo & Reload Ring
        const w = window.weapons.current;
        this.ui.ammoCurrent.textContent = w.isReloading ? 'RELOAD' : w.currentAmmo;
        this.ui.ammoMax.textContent = w.magSize;
        this.ui.weaponName.textContent = w.name.toUpperCase();

        // Active Reload indicator on custom reticle
        if (this.ui.crosshair) {
            const reloadBar = this.ui.crosshair.querySelector('.crosshair-reload-bar');
            if (reloadBar) {
                if (w.isReloading) {
                    reloadBar.style.display = 'block';
                    reloadBar.style.width = `${w.reloadProgress * 100}%`;
                } else {
                    reloadBar.style.display = 'none';
                }
            }
        }

        // Dedicated Active Reload HUD bar
        if (this.ui.activeReloadTrack && this.ui.activeReloadCursor) {
            if (w.isReloading) {
                this.ui.activeReloadTrack.classList.remove('hidden');
                this.ui.activeReloadCursor.style.left = `${Math.min(100, Math.max(0, w.reloadProgress * 100))}%`;
            } else {
                this.ui.activeReloadTrack.classList.add('hidden');
            }
        }

        // Combo Counter
        if (this.combo > 1) {
            this.ui.comboCounter.classList.remove('hidden');
            this.ui.comboCounter.querySelector('.combo-number').textContent = `x${this.combo}`;
            const meterPct = (this.comboTimer / this.maxComboDuration) * 100;
            this.ui.comboMeterFill.style.width = `${meterPct}%`;
        } else {
            this.ui.comboCounter.classList.add('hidden');
        }

        // Boss Health HUD
        const boss = window.enemiesManager.activeBoss;
        if (boss && !boss.isDead) {
            this.ui.bossHud.classList.remove('hidden');
            this.ui.bossName.textContent = boss.bossName;
            const bossHpPct = Math.max(0, (boss.hp / boss.maxHp) * 100);
            this.ui.bossHpFill.style.width = `${bossHpPct}%`;
        } else {
            this.ui.bossHud.classList.add('hidden');
        }
    }

    updateWeaponHUD() {
        if (!this.ui.weaponSlots) return;
        const keys = ['carbine', 'shotgun', 'railgun', 'missile', 'tesla', 'flamer', 'vortex'];
        this.ui.weaponSlots.innerHTML = '';

        keys.forEach((key, idx) => {
            const w = window.weapons.weapons[key];
            const slot = document.createElement('div');
            const isEquipped = key === window.weapons.equippedKey;
            slot.className = `weapon-slot ${isEquipped ? 'active' : ''} ${w.unlocked ? '' : 'locked'}`;
            slot.innerHTML = `
                <span class="slot-num">${idx + 1}</span>
                <span class="slot-icon" style="font-size: 13px; margin-right: 4px;">${w.icon || ''}</span>
                <span class="slot-name">${w.shortName || w.name}</span>
            `;
            if (w.unlocked) {
                slot.addEventListener('click', () => {
                    window.weapons.equip(key);
                    this.updateWeaponHUD();
                });
            }
            this.ui.weaponSlots.appendChild(slot);
        });
    }

    loop(timestamp) {
        const dt = Math.min(0.1, (timestamp - this.lastTime) / 1000);
        this.lastTime = timestamp;

        this.update(dt);
        this.render();

        requestAnimationFrame((t) => this.loop(t));
    }
}

// Global initialization on DOM load
window.addEventListener('DOMContentLoaded', () => {
    window.game = new GameEngine();
});
