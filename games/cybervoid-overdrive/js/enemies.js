/**
 * CYBERVOID: OVERDRIVE - Enemy AI, Spawning & Boss Battle Engine
 */

class Enemy {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.type = config.type || 'swarmer';
        this.radius = config.radius || 14;
        this.maxHp = config.hp || 30;
        this.hp = this.maxHp;
        this.speed = config.speed || 3.0;
        this.damage = config.damage || 10;
        this.xpValue = config.xpValue || 15;
        this.scoreValue = config.scoreValue || 50;
        this.color = config.color || '#ff0055';

        this.vx = 0;
        this.vy = 0;
        this.angle = 0;

        // Visual flash & feedback
        this.hitFlash = 0;
        this.isDead = false;

        // Status effects
        this.burnTimer = 0;
        this.burnDamage = 0;
        this.burnTickTimer = 0;
        this.stunTimer = 0;

        // Behavior timers
        this.shootTimer = Math.random() * 1.5;
        this.shootCooldown = config.shootCooldown || 2.0;
        this.chargeTimer = 0;
        this.isCharging = false;
        this.aimLaserProgress = 0;

        // Elite status
        this.isElite = config.isElite || false;
        if (this.isElite) {
            this.maxHp = Math.round(this.maxHp * 2.5);
            this.hp = this.maxHp;
            this.radius *= 1.35;
            this.damage = Math.round(this.damage * 1.4);
            this.scoreValue *= 3;
            this.xpValue *= 3;
        }

        // Boss status
        this.isBoss = config.isBoss || false;
        this.bossName = config.bossName || '';
        this.bossPhase = 1;
        this.specialTimer = 0;

        // Frontal shield for Juggernaut
        this.hasFrontShield = config.hasFrontShield || false;
        this.shieldArc = Math.PI * 0.65; // ~120 degrees frontal shield
    }

    takeDamage(amount, isCrit = false, weaponType = 'normal') {
        if (this.isDead) return;

        this.hp -= amount;
        this.hitFlash = 0.15; // 150ms bright white flash

        // Floating combat text
        window.particles.addText(
            this.x,
            this.y,
            Math.round(amount).toString(),
            isCrit ? '#ffea00' : (weaponType === 'burn' ? '#ff6600' : '#ffffff'),
            isCrit ? 18 : 14,
            isCrit
        );

        window.particles.addHitSparks(this.x, this.y, this.angle + Math.PI, this.color, isCrit ? 12 : 5);
        window.audio.playHitMarker(isCrit);

        if (this.hp <= 0) {
            this.die();
        }
    }

    applyBurn(damagePerSec, duration) {
        this.burnDamage = Math.max(this.burnDamage, damagePerSec);
        this.burnTimer = Math.max(this.burnTimer, duration);
    }

    applyStun(duration) {
        if (this.isBoss) duration *= 0.3; // Bosses resist stuns
        this.stunTimer = Math.max(this.stunTimer, duration);
    }

    die() {
        if (this.isDead) return;
        this.isDead = true;

        // Big explosion & splatters
        window.particles.addExplosion(this.x, this.y, this.color, this.radius * 2.2, this.isBoss ? 80 : 25);
        window.particles.addDecal(this.x, this.y, this.radius * 1.8, 'splatter', '#1a0515');
        window.audio.playExplosion(this.isBoss);

        if (window.game) {
            window.game.onEnemyKilled(this);
        }
    }

    update(dt, player, otherEnemies, arenaBounds, enemyProjectiles) {
        if (this.isDead) return;

        // 1. Status Effects
        if (this.hitFlash > 0) this.hitFlash -= dt;

        if (this.stunTimer > 0) {
            this.stunTimer -= dt;
            return; // Can't move while stunned
        }

        if (this.burnTimer > 0) {
            this.burnTimer -= dt;
            this.burnTickTimer += dt;
            if (this.burnTickTimer >= 0.25) {
                this.burnTickTimer = 0;
                this.takeDamage(this.burnDamage * 0.25, false, 'burn');
            }
        }

        // Distance & Angle to player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distToPlayer = Math.hypot(dx, dy);
        this.angle = Math.atan2(dy, dx);

        // 2. Separation / Flocking from other enemies
        let sepX = 0;
        let sepY = 0;
        if (!this.isBoss && otherEnemies) {
            for (let i = 0; i < otherEnemies.length; i++) {
                const other = otherEnemies[i];
                if (other === this || other.isDead) continue;
                const ox = this.x - other.x;
                const oy = this.y - other.y;
                const od = Math.hypot(ox, oy);
                const minDist = this.radius + other.radius + 4;
                if (od < minDist && od > 0.001) {
                    const force = (minDist - od) / minDist;
                    sepX += (ox / od) * force * 3.5;
                    sepY += (oy / od) * force * 3.5;
                }
            }
        }

        // 3. Enemy Specific Behaviors
        switch (this.type) {
            case 'swarmer': {
                // Direct aggressive charge with slight serpentine weave
                const weave = Math.sin(Date.now() * 0.008 + this.x) * 0.8;
                this.vx = (Math.cos(this.angle + weave) * this.speed + sepX);
                this.vy = (Math.sin(this.angle + weave) * this.speed + sepY);
                break;
            }

            case 'grunt': {
                // Maintains medium standoff distance & fires blaster
                const preferredDist = 240;
                let moveDir = 1;
                if (distToPlayer < preferredDist - 30) moveDir = -0.7; // Back away
                else if (distToPlayer > preferredDist + 50) moveDir = 1; // Approach
                else moveDir = 0.2;

                // Strafe sideways
                const strafeAngle = this.angle + Math.PI / 2;
                const strafeSpd = Math.sin(Date.now() * 0.003) * 1.5;

                this.vx = Math.cos(this.angle) * this.speed * moveDir + Math.cos(strafeAngle) * strafeSpd + sepX;
                this.vy = Math.sin(this.angle) * this.speed * moveDir + Math.sin(strafeAngle) * strafeSpd + sepY;

                // Shoot at player
                this.shootTimer += dt;
                if (this.shootTimer >= this.shootCooldown) {
                    this.shootTimer = 0;
                    if (distToPlayer < 650 && enemyProjectiles) {
                        const projSpd = 6.5;
                        enemyProjectiles.push(new Projectile({
                            x: this.x + Math.cos(this.angle) * (this.radius + 6),
                            y: this.y + Math.sin(this.angle) * (this.radius + 6),
                            vx: Math.cos(this.angle) * projSpd,
                            vy: Math.sin(this.angle) * projSpd,
                            speed: projSpd,
                            damage: this.damage,
                            color: '#ff2244',
                            radius: 5,
                            owner: 'enemy'
                        }));
                        window.audio.playShoot('pistol');
                    }
                }
                break;
            }

            case 'juggernaut': {
                // Heavy walker with frontal shield, bursts into a charge
                this.chargeTimer += dt;
                if (!this.isCharging && distToPlayer < 240 && this.chargeTimer > 3.0) {
                    // Start charge!
                    this.isCharging = true;
                    this.chargeTimer = 0;
                    this.chargeAngle = this.angle;
                }

                if (this.isCharging) {
                    this.vx = Math.cos(this.chargeAngle) * (this.speed * 2.8);
                    this.vy = Math.sin(this.chargeAngle) * (this.speed * 2.8);
                    if (this.chargeTimer > 0.8) {
                        this.isCharging = false;
                        this.chargeTimer = 0;
                    }
                } else {
                    this.vx = Math.cos(this.angle) * this.speed + sepX;
                    this.vy = Math.sin(this.angle) * this.speed + sepY;
                }
                break;
            }

            case 'kamikaze': {
                // High-speed drone that accelerates and beeps
                let acceleration = 1.0;
                if (distToPlayer < 180) acceleration = 1.8;
                this.vx = Math.cos(this.angle) * (this.speed * acceleration) + sepX;
                this.vy = Math.sin(this.angle) * (this.speed * acceleration) + sepY;

                if (distToPlayer < 45) {
                    // Detonate proximity bomb!
                    this.die();
                    if (distToPlayer < 75 && !player.isInvulnerable) {
                        player.takeDamage(this.damage * 1.5);
                    }
                    return;
                }
                break;
            }

            case 'sniper': {
                // Backs away to maintain extreme range and charges sniper laser
                if (distToPlayer < 380) {
                    this.vx = -Math.cos(this.angle) * this.speed * 1.2 + sepX;
                    this.vy = -Math.sin(this.angle) * this.speed * 1.2 + sepY;
                } else {
                    this.vx = sepX * 0.5;
                    this.vy = sepY * 0.5;
                }

                this.shootTimer += dt;
                // Telegraph laser charge
                this.aimLaserProgress = Math.min(1.0, this.shootTimer / this.shootCooldown);

                if (this.shootTimer >= this.shootCooldown) {
                    this.shootTimer = 0;
                    this.aimLaserProgress = 0;
                    if (distToPlayer < 900 && enemyProjectiles) {
                        const projSpd = 16.0;
                        enemyProjectiles.push(new Projectile({
                            x: this.x + Math.cos(this.angle) * (this.radius + 8),
                            y: this.y + Math.sin(this.angle) * (this.radius + 8),
                            vx: Math.cos(this.angle) * projSpd,
                            vy: Math.sin(this.angle) * projSpd,
                            speed: projSpd,
                            damage: this.damage * 2.2, // Lethal sniper shot!
                            color: '#ff0033',
                            radius: 4,
                            owner: 'enemy'
                        }));
                        window.audio.playShoot('railgun');
                        window.game.camera.addTrauma(0.15);
                    }
                }
                break;
            }

            case 'boss_titan': {
                // BOSS 1: CYBER TITAN (Wave 5)
                this.updateBossTitan(dt, player, enemyProjectiles, distToPlayer);
                break;
            }

            case 'boss_overlord': {
                // BOSS 2: GOLIATH OVERLORD (Wave 10)
                this.updateBossOverlord(dt, player, enemyProjectiles, distToPlayer);
                break;
            }
        }

        // Apply position
        this.x += this.vx * (dt * 60);
        this.y += this.vy * (dt * 60);

        // Clamp inside arena bounds
        if (arenaBounds) {
            this.x = Math.max(arenaBounds.minX + this.radius, Math.min(arenaBounds.maxX - this.radius, this.x));
            this.y = Math.max(arenaBounds.minY + this.radius, Math.min(arenaBounds.maxY - this.radius, this.y));
        }

        // Contact Damage with Player
        if (distToPlayer < this.radius + player.radius) {
            if (!player.isInvulnerable) {
                player.takeDamage(this.damage);
                // Push enemy back slightly
                this.x -= Math.cos(this.angle) * 20;
                this.y -= Math.sin(this.angle) * 20;
            }
        }
    }

    // === BOSS 1: CYBER TITAN LOGIC ===
    updateBossTitan(dt, player, enemyProjectiles, distToPlayer) {
        // Move steadily towards player
        this.vx = Math.cos(this.angle) * this.speed * 0.7;
        this.vy = Math.sin(this.angle) * this.speed * 0.7;

        this.specialTimer += dt;
        this.shootTimer += dt;

        // Attack 1: Rapid Gatling Sweep
        if (this.shootTimer >= 0.16 && this.specialTimer < 3.5) {
            this.shootTimer = 0;
            const sweepOffset = Math.sin(Date.now() * 0.007) * 0.45;
            const shotAngle = this.angle + sweepOffset;
            const spd = 7.0;

            enemyProjectiles.push(new Projectile({
                x: this.x + Math.cos(shotAngle) * (this.radius + 12),
                y: this.y + Math.sin(shotAngle) * (this.radius + 12),
                vx: Math.cos(shotAngle) * spd,
                vy: Math.sin(shotAngle) * spd,
                speed: spd,
                damage: 12,
                color: '#ff9900',
                radius: 6,
                owner: 'enemy'
            }));
            window.audio.playShoot('pistol');
        }

        // Attack 2: Shockwave Ring Slam (Every 6 seconds)
        if (this.specialTimer >= 6.0) {
            this.specialTimer = 0;
            window.audio.playExplosion(true);
            window.game.camera.addTrauma(0.4);

            const bulletCount = 18;
            for (let i = 0; i < bulletCount; i++) {
                const ringAngle = (i / bulletCount) * Math.PI * 2;
                const spd = 5.2;
                enemyProjectiles.push(new Projectile({
                    x: this.x,
                    y: this.y,
                    vx: Math.cos(ringAngle) * spd,
                    vy: Math.sin(ringAngle) * spd,
                    speed: spd,
                    damage: 18,
                    color: '#ff0055',
                    radius: 7,
                    owner: 'enemy'
                }));
            }
        }
    }

    // === BOSS 2: GOLIATH OVERLORD LOGIC ===
    updateBossOverlord(dt, player, enemyProjectiles, distToPlayer) {
        // Check phase 2 rage
        if (this.hp < this.maxHp * 0.5 && this.bossPhase === 1) {
            this.bossPhase = 2;
            this.speed *= 1.4;
            this.color = '#ff0022';
            window.audio.playBossAlert();
            window.particles.addText(this.x, this.y - 60, 'PHASE II: APEX OVERDRIVE!', '#ff0033', 24, true);
            window.game.camera.addTrauma(0.6);
        }

        this.vx = Math.cos(this.angle) * this.speed * 0.8;
        this.vy = Math.sin(this.angle) * this.speed * 0.8;

        this.specialTimer += dt;
        this.shootTimer += dt;

        // Attack 1: Spiral Bullet Hell
        if (this.shootTimer >= 0.12) {
            this.shootTimer = 0;
            const spiralAngle = Date.now() * 0.004;
            const arms = this.bossPhase === 2 ? 4 : 3;
            for (let i = 0; i < arms; i++) {
                const armAngle = spiralAngle + (i / arms) * Math.PI * 2;
                const spd = 5.8;
                enemyProjectiles.push(new Projectile({
                    x: this.x + Math.cos(armAngle) * (this.radius + 10),
                    y: this.y + Math.sin(armAngle) * (this.radius + 10),
                    vx: Math.cos(armAngle) * spd,
                    vy: Math.sin(armAngle) * spd,
                    speed: spd,
                    damage: 15,
                    color: '#aa00ff',
                    radius: 6,
                    owner: 'enemy'
                }));
            }
        }

        // Attack 2: Concentrated Missile Salvo (Every 5 seconds)
        if (this.specialTimer >= 5.0) {
            this.specialTimer = 0;
            window.audio.playShoot('missile');
            for (let i = -2; i <= 2; i++) {
                const salvoAngle = this.angle + i * 0.22;
                const spd = 6.5;
                enemyProjectiles.push(new Projectile({
                    x: this.x,
                    y: this.y,
                    vx: Math.cos(salvoAngle) * spd,
                    vy: Math.sin(salvoAngle) * spd,
                    speed: spd,
                    damage: 22,
                    color: '#ff0033',
                    radius: 7,
                    type: 'missile',
                    owner: 'enemy'
                }));
            }
        }
    }

    render(ctx, camera) {
        const sx = this.x - camera.x;
        const sy = this.y - camera.y;

        ctx.save();
        ctx.translate(sx, sy);

        // 1. Sniper Aim Laser Telegraph
        if (this.type === 'sniper' && this.aimLaserProgress > 0.2) {
            ctx.save();
            ctx.rotate(this.angle);
            ctx.strokeStyle = `rgba(255, 0, 50, ${this.aimLaserProgress * 0.8})`;
            ctx.lineWidth = 1 + this.aimLaserProgress * 2;
            ctx.shadowColor = '#ff0033';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(800, 0);
            ctx.stroke();
            ctx.restore();
        }

        // 2. Elite Aura
        if (this.isElite) {
            ctx.save();
            ctx.strokeStyle = '#ffea00';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = '#ffea00';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 6 + Math.sin(Date.now() * 0.008) * 3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // 3. Hit Flash / Color
        let drawColor = this.color;
        if (this.hitFlash > 0) {
            drawColor = '#ffffff';
        } else if (this.burnTimer > 0) {
            drawColor = '#ff5500';
        }

        ctx.rotate(this.angle);

        // 4. Shape Drawing per Enemy Type
        if (this.type === 'swarmer') {
            // Predatory triple-pointed needle bug
            ctx.fillStyle = drawColor;
            ctx.shadowColor = drawColor;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.moveTo(this.radius * 1.3, 0);
            ctx.lineTo(-this.radius, -this.radius * 0.8);
            ctx.lineTo(-this.radius * 0.4, 0);
            ctx.lineTo(-this.radius, this.radius * 0.8);
            ctx.closePath();
            ctx.fill();

            // Glowing eye
            ctx.fillStyle = '#00f0ff';
            ctx.beginPath();
            ctx.arc(this.radius * 0.4, 0, 2.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'grunt') {
            // Armored Hexagon
            ctx.fillStyle = drawColor;
            ctx.shadowColor = drawColor;
            ctx.shadowBlur = 8;

            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2;
                const px = Math.cos(a) * this.radius;
                const py = Math.sin(a) * this.radius;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();

            // Gun barrel
            ctx.fillStyle = '#333344';
            ctx.fillRect(this.radius * 0.4, -3, this.radius * 0.9, 6);
        } else if (this.type === 'juggernaut') {
            // Heavy Tank Bruiser
            ctx.fillStyle = '#1c1b29';
            ctx.strokeStyle = drawColor;
            ctx.lineWidth = 3;
            ctx.fillRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
            ctx.strokeRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);

            // Frontal Energy Shield Arc
            if (this.hasFrontShield) {
                ctx.save();
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 5;
                ctx.shadowColor = '#00ffff';
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.arc(0, 0, this.radius * 1.45, -this.shieldArc / 2, this.shieldArc / 2);
                ctx.stroke();
                ctx.restore();
            }
        } else if (this.type === 'kamikaze') {
            // Flying Spiked Mine
            ctx.fillStyle = drawColor;
            ctx.shadowColor = drawColor;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();

            // Pulsing warning beacon
            const pulse = (Math.sin(Date.now() * 0.02) + 1) * 0.5;
            ctx.fillStyle = pulse > 0.5 ? '#ffffff' : '#ffff00';
            ctx.beginPath();
            ctx.arc(0, 0, 4, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'sniper') {
            // Diamond stealth chassis
            ctx.fillStyle = '#1a1025';
            ctx.strokeStyle = drawColor;
            ctx.lineWidth = 2.5;
            ctx.shadowColor = drawColor;
            ctx.shadowBlur = 10;

            ctx.beginPath();
            ctx.moveTo(this.radius * 1.5, 0);
            ctx.lineTo(0, -this.radius);
            ctx.lineTo(-this.radius * 1.2, 0);
            ctx.lineTo(0, this.radius);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Long rail barrel
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(this.radius * 1.8, 0);
            ctx.stroke();
        } else if (this.isBoss) {
            // Colossal Boss Mech Chassis
            ctx.fillStyle = '#151424';
            ctx.strokeStyle = drawColor;
            ctx.lineWidth = 4;
            ctx.shadowColor = drawColor;
            ctx.shadowBlur = 20;

            // Octagonal main hull
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const a = (i / 8) * Math.PI * 2;
                const px = Math.cos(a) * this.radius;
                const py = Math.sin(a) * this.radius;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Glowing Reactor Core
            ctx.fillStyle = drawColor;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.45 + Math.sin(Date.now() * 0.008) * 3, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        // 5. Overhead Health Bar (for Elites & regular damaged enemies, non-boss)
        if (!this.isBoss && this.hp < this.maxHp) {
            ctx.save();
            const barW = this.radius * 2.2;
            const barH = 4;
            const barX = sx - barW / 2;
            const barY = sy - this.radius - 10;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(barX, barY, barW, barH);

            const hpPercent = Math.max(0, this.hp / this.maxHp);
            ctx.fillStyle = hpPercent > 0.4 ? '#00ff66' : '#ff0033';
            ctx.fillRect(barX, barY, barW * hpPercent, barH);
            ctx.restore();
        }
    }
}

class WaveManager {
    constructor() {
        this.currentWave = 1;
        this.waveTimer = 0;
        this.waveDuration = 35; // 35s per wave
        this.spawnTimer = 0;
        this.isWaveIntermission = false;
        this.intermissionTimer = 0;
        this.activeBoss = null;
    }

    start() {
        this.currentWave = 1;
        this.waveTimer = 0;
        this.spawnTimer = 0;
        this.isWaveIntermission = false;
        this.activeBoss = null;
    }

    update(dt, enemies, arenaBounds, player) {
        if (this.isWaveIntermission) {
            this.intermissionTimer -= dt;
            if (this.intermissionTimer <= 0) {
                this.isWaveIntermission = false;
                this.currentWave++;
                this.waveTimer = 0;
                this.spawnWaveAnnouncement();
            }
            return;
        }

        this.waveTimer += dt;
        this.spawnTimer += dt;

        // Check if wave is over (only when no boss is alive)
        if (this.waveTimer >= this.waveDuration && !this.activeBoss) {
            this.isWaveIntermission = true;
            this.intermissionTimer = 3.5;
            window.particles.addText(player.x, player.y - 50, `WAVE ${this.currentWave} CLEARED!`, '#00ffcc', 26, true);
            window.audio.playLevelUp();
            return;
        }

        // Spawn cadence scales with wave
        const spawnInterval = Math.max(0.4, 2.2 - this.currentWave * 0.15);
        if (this.spawnTimer >= spawnInterval) {
            this.spawnTimer = 0;
            this.spawnEnemy(enemies, arenaBounds, player);
        }

        // Check Boss Spawns: Wave 5 is Titan Mech, Wave 10 is Goliath Overlord, Endless every 5 waves
        if (this.currentWave === 5 && !this.activeBoss && this.waveTimer > 2.0 && this.waveTimer < 5.0) {
            this.spawnBoss(enemies, arenaBounds, player, 'boss_titan');
        } else if (this.currentWave === 10 && !this.activeBoss && this.waveTimer > 2.0 && this.waveTimer < 5.0) {
            this.spawnBoss(enemies, arenaBounds, player, 'boss_overlord');
        } else if (this.currentWave > 10 && this.currentWave % 5 === 0 && !this.activeBoss && this.waveTimer > 2.0 && this.waveTimer < 5.0) {
            const endlessBoss = (this.currentWave % 10 === 0) ? 'boss_overlord' : 'boss_titan';
            this.spawnBoss(enemies, arenaBounds, player, endlessBoss);
        }

        // Clean up boss reference if dead
        if (this.activeBoss && this.activeBoss.isDead) {
            const wasOverlord = this.activeBoss.type === 'boss_overlord';
            this.activeBoss = null;
            // Immediate wave clear bonus!
            this.waveTimer = this.waveDuration;
            if (wasOverlord && window.game && !window.game.isEndlessOverdrive) {
                window.game.victory();
                return;
            }
        }
    }

    spawnWaveAnnouncement() {
        if (window.game) {
            window.game.showBanner(`WAVE ${this.currentWave}`, '#00f0ff');
            if (this.currentWave === 5 || this.currentWave === 10) {
                window.audio.playBossAlert();
            }
        }
    }

    getSpawnPosition(arenaBounds, player) {
        // Spawn around player just outside viewport, clamped inside arena
        const angle = Math.random() * Math.PI * 2;
        const dist = 550 + Math.random() * 250;
        let x = player.x + Math.cos(angle) * dist;
        let y = player.y + Math.sin(angle) * dist;

        x = Math.max(arenaBounds.minX + 40, Math.min(arenaBounds.maxX - 40, x));
        y = Math.max(arenaBounds.minY + 40, Math.min(arenaBounds.maxY - 40, y));
        return { x, y };
    }

    spawnEnemy(enemies, arenaBounds, player) {
        const pos = this.getSpawnPosition(arenaBounds, player);
        const rand = Math.random();
        const wave = this.currentWave;

        let type = 'swarmer';
        let hp = 24 + wave * 6;
        let speed = 2.4 + Math.min(2.0, wave * 0.1);
        let damage = 8 + wave * 2;
        let color = '#ff0055';
        let radius = 13;
        let hasFrontShield = false;

        // Enemy pool distribution based on wave
        if (wave >= 2 && rand > 0.65) {
            type = 'grunt';
            hp = 60 + wave * 12;
            speed = 1.8;
            color = '#ff6600';
            radius = 16;
        } else if (wave >= 3 && rand > 0.85) {
            type = 'kamikaze';
            hp = 30 + wave * 5;
            speed = 3.6;
            damage = 25;
            color = '#ffff00';
            radius = 12;
        } else if (wave >= 4 && rand > 0.88) {
            type = 'juggernaut';
            hp = 220 + wave * 30;
            speed = 1.4;
            damage = 22;
            color = '#9900ff';
            radius = 24;
            hasFrontShield = true;
        } else if (wave >= 6 && rand > 0.90) {
            type = 'sniper';
            hp = 90 + wave * 15;
            speed = 1.6;
            damage = 35;
            color = '#00f0ff';
            radius = 15;
        }

        // 10% chance for an Elite variant
        const isElite = Math.random() < 0.10 && wave >= 2;

        enemies.push(new Enemy({
            x: pos.x,
            y: pos.y,
            type: type,
            hp: hp,
            speed: speed,
            damage: damage,
            color: color,
            radius: radius,
            isElite: isElite,
            hasFrontShield: hasFrontShield
        }));
    }

    spawnBoss(enemies, arenaBounds, player, bossType) {
        const pos = this.getSpawnPosition(arenaBounds, player);

        if (bossType === 'boss_titan') {
            const titan = new Enemy({
                x: pos.x,
                y: pos.y,
                type: 'boss_titan',
                hp: 2200,
                speed: 1.2,
                damage: 25,
                color: '#ff9900',
                radius: 46,
                isBoss: true,
                bossName: 'G-700 CYBER TITAN'
            });
            this.activeBoss = titan;
            enemies.push(titan);
            window.game.showBanner('WARNING: BOSS INCOMING', '#ff0033');
            window.audio.playBossAlert();
        } else if (bossType === 'boss_overlord') {
            const overlord = new Enemy({
                x: pos.x,
                y: pos.y,
                type: 'boss_overlord',
                hp: 5500,
                speed: 1.4,
                damage: 35,
                color: '#aa00ff',
                radius: 54,
                isBoss: true,
                bossName: 'APEX NEXUS OVERLORD'
            });
            this.activeBoss = overlord;
            enemies.push(overlord);
            window.game.showBanner('APEX NEXUS DETECTED!', '#aa00ff');
            window.audio.playBossAlert();
        }
    }
}

window.enemiesManager = new WaveManager();
