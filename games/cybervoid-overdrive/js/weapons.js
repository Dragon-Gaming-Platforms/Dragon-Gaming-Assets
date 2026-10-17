/**
 * CYBERVOID: OVERDRIVE - Weapons & Ballistics Engine
 */

const WEAPON_CONFIGS = {
    carbine: {
        id: 'carbine',
        name: 'Pulse Carbine',
        shortName: 'CARBINE',
        icon: '⚡',
        description: 'Rapid-fire plasma rifle with tight spread and high velocity.',
        damage: 22,
        fireRate: 0.12, // seconds between shots
        magSize: 32,
        reloadTime: 1.2,
        speed: 18,
        spread: 0.04,
        projectiles: 1,
        pierce: 0,
        knockback: 3,
        color: '#00f0ff',
        sound: 'pistol',
        cost: 0,
        unlocked: true,
        casingType: 'bullet',
        recoilPush: 0.6
    },
    shotgun: {
        id: 'shotgun',
        name: 'Scatter Sweeper',
        shortName: 'SCATTER',
        icon: '💥',
        description: 'Fires an 8-pellet buckshot spread. Lethal at point-blank range.',
        damage: 15, // 15 x 8 = 120 total max
        fireRate: 0.62,
        magSize: 8,
        reloadTime: 1.6,
        speed: 16,
        spread: 0.28,
        projectiles: 8,
        pierce: 0,
        knockback: 10,
        color: '#ffaa00',
        sound: 'shotgun',
        cost: 250,
        unlocked: true,
        casingType: 'shotgun',
        recoilPush: 4.5
    },
    railgun: {
        id: 'railgun',
        name: 'Hyper Railgun',
        shortName: 'RAILGUN',
        icon: '🎯',
        description: 'Super-accelerated slug piercing through all targets in its trajectory.',
        damage: 110,
        fireRate: 0.85,
        magSize: 5,
        reloadTime: 1.9,
        speed: 32,
        spread: 0.01,
        projectiles: 1,
        pierce: 99,
        knockback: 8,
        color: '#ff00aa',
        sound: 'railgun',
        cost: 500,
        unlocked: false,
        casingType: 'bullet',
        recoilPush: 6.0
    },
    missile: {
        id: 'missile',
        name: 'Seeker Swarm',
        shortName: 'MISSILE',
        icon: '🚀',
        description: 'Micro-rockets that track nearby targets and detonate in cluster fire.',
        damage: 48,
        splashRadius: 55,
        fireRate: 0.42,
        magSize: 12,
        reloadTime: 2.0,
        speed: 11,
        spread: 0.15,
        projectiles: 2,
        pierce: 0,
        knockback: 7,
        color: '#00ff66',
        sound: 'missile',
        cost: 750,
        unlocked: false,
        casingType: 'bullet',
        recoilPush: 1.8
    },
    tesla: {
        id: 'tesla',
        name: 'Arc Tesla Coil',
        shortName: 'TESLA',
        icon: '🌐',
        description: 'Channels high-voltage lightning that chains between multiple foes.',
        damage: 34,
        chainCount: 5,
        chainRange: 160,
        fireRate: 0.36,
        magSize: 16,
        reloadTime: 1.5,
        speed: 24,
        spread: 0.06,
        projectiles: 1,
        pierce: 0,
        knockback: 2,
        color: '#6688ff',
        sound: 'tesla',
        cost: 1000,
        unlocked: false,
        casingType: 'bullet',
        recoilPush: 0.5
    },
    flamer: {
        id: 'flamer',
        name: 'Void Torch',
        shortName: 'FLAMER',
        icon: '🔥',
        description: 'Torrent of swirling plasma flames that burns and melts hordes.',
        damage: 9,
        fireRate: 0.05,
        magSize: 90,
        reloadTime: 2.2,
        speed: 12,
        spread: 0.35,
        projectiles: 2,
        pierce: 99,
        knockback: 0.5,
        color: '#ff3300',
        sound: 'flamer',
        cost: 1300,
        unlocked: false,
        casingType: 'none',
        recoilPush: 0.2
    },
    vortex: {
        id: 'vortex',
        name: 'Singularity Launcher',
        shortName: 'VORTEX',
        icon: '🌀',
        description: 'Deploys a gravitational vortex pulling enemies together before detonating.',
        damage: 30,
        detonateDamage: 140,
        splashRadius: 120,
        fireRate: 1.1,
        magSize: 4,
        reloadTime: 2.4,
        speed: 8,
        spread: 0.02,
        projectiles: 1,
        pierce: 0,
        knockback: -8, // Pulls!
        color: '#aa00ff',
        sound: 'vortex',
        cost: 1800,
        unlocked: false,
        casingType: 'none',
        recoilPush: 3.5
    }
};

class Projectile {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.vx = config.vx;
        this.vy = config.vy;
        this.speed = config.speed;
        this.damage = config.damage;
        this.color = config.color;
        this.radius = config.radius || 4;
        this.pierce = config.pierce || 0;
        this.knockback = config.knockback || 2;
        this.type = config.type || 'bullet'; // bullet, missile, flamer, vortex, enemy_bullet
        this.owner = config.owner || 'player'; // 'player' or 'enemy'
        this.splashRadius = config.splashRadius || 0;
        this.chainCount = config.chainCount || 0;
        this.chainRange = config.chainRange || 0;
        this.bounces = config.bounces || 0;

        this.life = config.life || 3.0; // Lifetime in seconds
        this.distanceTravelled = 0;
        this.maxDistance = config.maxDistance || 1800;

        // Specific mechanics
        this.homing = config.homing || false;
        this.homingTarget = null;
        this.trailTimer = 0;
        this.hitEntities = new Set(); // Prevent multi-hitting same entity on same frame

        // Vortex specific
        this.vortexTimer = 0;
        this.vortexDuration = 1.8;
    }

    update(dt, enemies, arenaBounds, player) {
        this.life -= dt;
        if (this.life <= 0) return false;

        // 1. Homing Logic for Micro-Missiles
        if (this.homing && this.owner === 'player' && enemies && enemies.length > 0) {
            if (!this.homingTarget || this.homingTarget.isDead) {
                // Find closest living enemy
                let closest = null;
                let minDist = 450;
                for (let i = 0; i < enemies.length; i++) {
                    const e = enemies[i];
                    if (e.isDead) continue;
                    const d = Math.hypot(e.x - this.x, e.y - this.y);
                    if (d < minDist) {
                        minDist = d;
                        closest = e;
                    }
                }
                this.homingTarget = closest;
            }

            if (this.homingTarget) {
                const targetAngle = Math.atan2(this.homingTarget.y - this.y, this.homingTarget.x - this.x);
                const currentAngle = Math.atan2(this.vy, this.vx);
                let diff = targetAngle - currentAngle;
                while (diff < -Math.PI) diff += Math.PI * 2;
                while (diff > Math.PI) diff -= Math.PI * 2;

                const turnRate = 6.0 * dt;
                const newAngle = currentAngle + Math.sign(diff) * Math.min(Math.abs(diff), turnRate);
                const currentSpd = Math.hypot(this.vx, this.vy);
                this.vx = Math.cos(newAngle) * currentSpd;
                this.vy = Math.sin(newAngle) * currentSpd;
            }
        }

        // 2. Singularity Gravity Pull
        if (this.type === 'vortex' && this.owner === 'player') {
            this.vortexTimer += dt;
            // Slowly decelerate
            this.vx *= 0.94;
            this.vy *= 0.94;

            // Pull surrounding enemies
            if (enemies) {
                for (let i = 0; i < enemies.length; i++) {
                    const e = enemies[i];
                    if (e.isDead || e.isBoss) continue;
                    const dist = Math.hypot(e.x - this.x, e.y - this.y);
                    if (dist < this.splashRadius) {
                        const pullAngle = Math.atan2(this.y - e.y, this.x - e.x);
                        const pullForce = (1 - dist / this.splashRadius) * 220 * dt;
                        e.x += Math.cos(pullAngle) * pullForce;
                        e.y += Math.sin(pullAngle) * pullForce;
                    }
                }
            }

            // Spawn purple distortion particles
            if (Math.random() < 0.6) {
                window.particles.addSmoke(this.x, this.y, 'rgba(170, 0, 255, 0.5)', 8);
            }

            // Explode at end of duration
            if (this.vortexTimer >= this.vortexDuration) {
                this.detonateVortex(enemies);
                return false;
            }
        }

        // Movement
        this.x += this.vx * (dt * 60);
        this.y += this.vy * (dt * 60);
        this.distanceTravelled += Math.hypot(this.vx, this.vy) * (dt * 60);

        if (this.distanceTravelled >= this.maxDistance) {
            return false;
        }

        // Particle Trails
        this.trailTimer += dt;
        if (this.type === 'missile' && this.trailTimer > 0.03) {
            this.trailTimer = 0;
            window.particles.addSmoke(this.x, this.y, 'rgba(255, 200, 50, 0.4)', 4);
        } else if (this.type === 'flamer') {
            this.radius += 0.35 * (dt * 60); // Expands as it travels
            if (Math.random() < 0.3) {
                window.particles.addSparks(this.x, this.y, '#ff4400', 1, 1, 3);
            }
        }

        // Arena Boundaries & Wall Bounce
        if (arenaBounds) {
            let bounced = false;
            if (this.x < arenaBounds.minX + this.radius) {
                this.x = arenaBounds.minX + this.radius;
                this.vx = -this.vx;
                bounced = true;
            } else if (this.x > arenaBounds.maxX - this.radius) {
                this.x = arenaBounds.maxX - this.radius;
                this.vx = -this.vx;
                bounced = true;
            }
            if (this.y < arenaBounds.minY + this.radius) {
                this.y = arenaBounds.minY + this.radius;
                this.vy = -this.vy;
                bounced = true;
            } else if (this.y > arenaBounds.maxY - this.radius) {
                this.y = arenaBounds.maxY - this.radius;
                this.vy = -this.vy;
                bounced = true;
            }

            if (bounced) {
                if (this.bounces > 0) {
                    this.bounces--;
                    window.particles.addSparks(this.x, this.y, this.color, 4, 3, 2);
                } else if (this.type !== 'vortex') {
                    window.particles.addSparks(this.x, this.y, this.color, 6, 3, 2);
                    return false;
                }
            }
        }

        return true;
    }

    detonateVortex(enemies) {
        window.particles.addExplosion(this.x, this.y, '#aa00ff', this.splashRadius, 35);
        window.audio.playExplosion(true);

        if (enemies) {
            for (let i = 0; i < enemies.length; i++) {
                const e = enemies[i];
                if (e.isDead) continue;
                const d = Math.hypot(e.x - this.x, e.y - this.y);
                if (d <= this.splashRadius) {
                    const dmg = Math.round(140 * (1 - (d / this.splashRadius) * 0.4));
                    e.takeDamage(dmg, false, 'vortex');
                }
            }
        }
    }

    render(ctx, camera) {
        const sx = this.x - camera.x;
        const sy = this.y - camera.y;

        ctx.save();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = this.color;

        if (this.type === 'flamer') {
            const grad = ctx.createRadialGradient(sx, sy, 1, sx, sy, this.radius);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.4, this.color);
            grad.addColorStop(1, 'rgba(255, 50, 0, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(sx, sy, this.radius, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'missile') {
            const angle = Math.atan2(this.vy, this.vx);
            ctx.translate(sx, sy);
            ctx.rotate(angle);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-6, -2.5, 12, 5);
            ctx.fillStyle = '#00ff66';
            ctx.beginPath();
            ctx.moveTo(6, 0);
            ctx.lineTo(2, -3.5);
            ctx.lineTo(2, 3.5);
            ctx.closePath();
            ctx.fill();
        } else if (this.type === 'vortex') {
            ctx.beginPath();
            ctx.arc(sx, sy, 9, 0, Math.PI * 2);
            ctx.fill();

            // Swirling rings
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(sx, sy, 16 + Math.sin(Date.now() * 0.01) * 3, 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.type === 'railgun') {
            // Elongated tracer slug
            const angle = Math.atan2(this.vy, this.vx);
            ctx.translate(sx, sy);
            ctx.rotate(angle);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-16, -2, 32, 4);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(-16, -2, 32, 4);
        } else {
            // Standard plasma pellet
            const angle = Math.atan2(this.vy, this.vx);
            ctx.translate(sx, sy);
            ctx.rotate(angle);
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(0, 0, this.radius * 1.8, this.radius, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        ctx.restore();
    }
}

class WeaponManager {
    constructor() {
        this.weapons = {};
        for (const [key, cfg] of Object.entries(WEAPON_CONFIGS)) {
            this.weapons[key] = {
                ...cfg,
                currentAmmo: cfg.magSize,
                lastFired: 0,
                isReloading: false,
                reloadProgress: 0,
                activeReloadWindow: { start: 0.45, end: 0.70 } // Sweet spot: 45% - 70%
            };
        }

        this.equippedKey = 'carbine';
        this.projectiles = [];

        // Active reload state
        this.activeReloadSuccess = false;
        this.activeReloadBonusTimer = 0; // Temporary crit / fire rate buff
    }

    get current() {
        return this.weapons[this.equippedKey];
    }

    equip(key) {
        if (this.weapons[key] && this.weapons[key].unlocked) {
            this.equippedKey = key;
            return true;
        }
        return false;
    }

    startReload() {
        const w = this.current;
        if (w.isReloading || w.currentAmmo >= w.magSize) return false;
        w.isReloading = true;
        w.reloadProgress = 0;
        window.audio.playActiveReloadTick();
        return true;
    }

    attemptActiveReload() {
        const w = this.current;
        if (!w.isReloading) return false;

        const p = w.reloadProgress;
        if (p >= w.activeReloadWindow.start && p <= w.activeReloadWindow.end) {
            // SUCCESSFUL ACTIVE RELOAD!
            w.currentAmmo = w.magSize;
            w.isReloading = false;
            w.reloadProgress = 0;
            this.activeReloadSuccess = true;
            this.activeReloadBonusTimer = 4.0; // 4s overdrive buff

            window.audio.playActiveReloadSuccess();
            window.particles.addText(
                window.game ? window.game.player.x : 0,
                window.game ? window.game.player.y - 30 : 0,
                'PERFECT RELOAD! +CRIT',
                '#00ffcc',
                18,
                true
            );
            return true;
        } else {
            // FAILED ACTIVE RELOAD: slight penalty
            w.reloadProgress = Math.max(0, w.reloadProgress - 0.2);
            window.audio.playShoot('pistol'); // jammed sound
            return false;
        }
    }

    fire(player, aimAngle, modifiers = {}) {
        const w = this.current;
        const now = performance.now() / 1000;

        if (w.isReloading) return false;

        // Auto reload if out of ammo
        if (w.currentAmmo <= 0) {
            this.startReload();
            return false;
        }

        let effectiveFireRate = w.fireRate;
        if (modifiers.fireRateMult) effectiveFireRate *= modifiers.fireRateMult;
        if (this.activeReloadBonusTimer > 0) effectiveFireRate *= 0.8; // 20% faster fire rate on perfect reload

        if (now - w.lastFired < effectiveFireRate) return false;

        w.lastFired = now;
        w.currentAmmo--;

        // Play SFX
        window.audio.playShoot(w.sound);

        // Player Recoil Pushback
        if (player) {
            const push = w.recoilPush * (modifiers.recoilPushMult || 1.0);
            player.vx -= Math.cos(aimAngle) * push;
            player.vy -= Math.sin(aimAngle) * push;
        }

        // Eject shell casing
        if (w.casingType !== 'none') {
            window.particles.addCasing(player.x, player.y, aimAngle, w.casingType);
        }

        // Camera recoil kick
        if (window.game) {
            window.game.camera.addTrauma(w.id === 'shotgun' || w.id === 'railgun' ? 0.2 : 0.06);
        }

        // Spawn Projectiles
        const baseCount = w.projectiles + (modifiers.extraProjectiles || 0);
        const spreadTotal = w.spread * (modifiers.spreadMult || 1.0);

        for (let i = 0; i < baseCount; i++) {
            let shotAngle = aimAngle;
            if (baseCount > 1) {
                // Fan or random spread
                const spreadOffset = (i / (baseCount - 1) - 0.5) * spreadTotal;
                shotAngle += spreadOffset + (Math.random() - 0.5) * 0.04;
            } else {
                shotAngle += (Math.random() - 0.5) * spreadTotal;
            }

            let spd = w.speed * (modifiers.bulletSpeedMult || 1.0);
            let dmg = w.damage * (modifiers.damageMult || 1.0);

            // Critical hit calculation
            let isCrit = false;
            let critChance = 0.05 + (modifiers.critChanceBonus || 0);
            if (this.activeReloadBonusTimer > 0) critChance += 0.25;

            if (Math.random() < critChance) {
                isCrit = true;
                dmg *= 2.0 + (modifiers.critDamageBonus || 0);
            }

            const proj = new Projectile({
                x: player.x + Math.cos(aimAngle) * 22,
                y: player.y + Math.sin(aimAngle) * 22,
                vx: Math.cos(shotAngle) * spd,
                vy: Math.sin(shotAngle) * spd,
                speed: spd,
                damage: Math.round(dmg),
                color: isCrit ? '#ff0055' : w.color,
                radius: w.id === 'flamer' ? 8 : (w.id === 'railgun' ? 3 : (w.id === 'shotgun' ? 3.5 : 4.5)),
                pierce: w.pierce + (modifiers.extraPierce || 0),
                knockback: w.knockback * (modifiers.knockbackMult || 1.0),
                type: w.id,
                owner: 'player',
                splashRadius: w.splashRadius,
                chainCount: w.chainCount,
                chainRange: w.chainRange,
                homing: w.id === 'missile',
                bounces: modifiers.ricochet || 0,
                life: w.id === 'flamer' ? 0.45 : 3.0
            });

            proj.isCrit = isCrit;
            this.projectiles.push(proj);
        }

        // Auto reload when mag empty
        if (w.currentAmmo <= 0) {
            this.startReload();
        }

        return true;
    }

    update(dt, enemies, arenaBounds, player) {
        // Active reload timer update
        if (this.activeReloadBonusTimer > 0) {
            this.activeReloadBonusTimer -= dt;
        }

        // Weapon reload progress update
        for (const key of Object.keys(this.weapons)) {
            const w = this.weapons[key];
            if (w.isReloading) {
                w.reloadProgress += dt / w.reloadTime;
                if (w.reloadProgress >= 1.0) {
                    w.currentAmmo = w.magSize;
                    w.isReloading = false;
                    w.reloadProgress = 0;
                }
            }
        }

        // Update active projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            const alive = p.update(dt, enemies, arenaBounds, player);
            if (!alive) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    render(ctx, camera) {
        for (let i = 0; i < this.projectiles.length; i++) {
            this.projectiles[i].render(ctx, camera);
        }
    }
}

window.weapons = new WeaponManager();
