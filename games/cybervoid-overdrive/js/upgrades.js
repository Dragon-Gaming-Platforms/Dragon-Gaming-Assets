/**
 * CYBERVOID: OVERDRIVE - Roguelite Upgrades, Drone Companion & Progression
 */

const UPGRADE_CARDS = [
    {
        id: 'overclock',
        name: 'Neural Overclock',
        category: 'Offense',
        rarity: 'Common',
        icon: '⚡',
        description: '+20% Fire Rate and +12% Bullet Velocity.',
        apply: (player) => {
            player.modifiers.fireRateMult *= 0.82;
            player.modifiers.bulletSpeedMult *= 1.12;
        }
    },
    {
        id: 'heavy_caliber',
        name: 'Depleted Uranium Core',
        category: 'Offense',
        rarity: 'Rare',
        icon: '💥',
        description: '+28% Weapon Damage and +25% Knockback impulse.',
        apply: (player) => {
            player.modifiers.damageMult *= 1.28;
            player.modifiers.knockbackMult *= 1.25;
        }
    },
    {
        id: 'multishot',
        name: 'Split-Fire Chamber',
        category: 'Offense',
        rarity: 'Epic',
        icon: '🔱',
        description: '+1 Additional Projectile to all weapon bursts.',
        apply: (player) => {
            player.modifiers.extraProjectiles += 1;
        }
    },
    {
        id: 'piercing_rounds',
        name: 'Tungsten Penetrator',
        category: 'Offense',
        rarity: 'Rare',
        icon: '🏹',
        description: 'All kinetic rounds pierce +1 additional enemy.',
        apply: (player) => {
            player.modifiers.extraPierce += 1;
        }
    },
    {
        id: 'ricochet',
        name: 'Reflective Matrix',
        category: 'Utility',
        rarity: 'Rare',
        icon: '🔄',
        description: 'Bullets bounce off arena perimeter walls +1 time.',
        apply: (player) => {
            player.modifiers.ricochet += 1;
        }
    },
    {
        id: 'critical_overload',
        name: 'Quantum Targeting',
        category: 'Offense',
        rarity: 'Epic',
        icon: '🎯',
        description: '+15% Critical Chance and +50% Critical Hit Damage.',
        apply: (player) => {
            player.modifiers.critChanceBonus += 0.15;
            player.modifiers.critDamageBonus += 0.50;
        }
    },
    {
        id: 'kinetic_shield',
        name: 'Aegis Energy Barrier',
        category: 'Defense',
        rarity: 'Rare',
        icon: '🛡️',
        description: '+35 Max Shield capacity and +30% faster shield recharge.',
        apply: (player) => {
            player.maxShield += 35;
            player.shield = player.maxShield;
            player.shieldRechargeRate *= 1.30;
        }
    },
    {
        id: 'chrono_dash',
        name: 'Warp Capacitor',
        category: 'Mobility',
        rarity: 'Common',
        icon: '🚀',
        description: '+1 Maximum Dash Charge and 25% faster dash cooldown.',
        apply: (player) => {
            player.maxDashes += 1;
            player.dashCooldown *= 0.75;
        }
    },
    {
        id: 'static_discharge',
        name: 'Tesla Dash',
        category: 'Utility',
        rarity: 'Epic',
        icon: '⚡',
        description: 'Dashing discharges a 120px EMP shockwave damaging and shocking enemies.',
        apply: (player) => {
            player.hasTeslaDash = true;
        }
    },
    {
        id: 'nano_siphon',
        name: 'Vampiric Nanites',
        category: 'Defense',
        rarity: 'Rare',
        icon: '💉',
        description: '10% chance on enemy kill to spawn an instant Repair Kit.',
        apply: (player) => {
            player.modifiers.lifestealChance = (player.modifiers.lifestealChance || 0) + 0.10;
        }
    },
    {
        id: 'magnetic_field',
        name: 'Vortex Siphon',
        category: 'Utility',
        rarity: 'Common',
        icon: '🧲',
        description: '+100% Nanite & Pickup vacuum collection radius.',
        apply: (player) => {
            player.magnetRadius *= 2.0;
        }
    },
    {
        id: 'titan_plating',
        name: 'Cyber Plating',
        category: 'Defense',
        rarity: 'Common',
        icon: '💎',
        description: '+40 Maximum Health and +15% Damage Resistance.',
        apply: (player) => {
            player.maxHp += 40;
            player.hp = Math.min(player.maxHp, player.hp + 40);
            player.modifiers.armorReduction = (player.modifiers.armorReduction || 0) + 0.15;
        }
    },
    {
        id: 'orbital_sentinel',
        name: 'Combat Drone Mk.I',
        category: 'Special',
        rarity: 'Legendary',
        icon: '🛸',
        description: 'Deploys an autonomous orbital drone firing plasma bolts at nearby hostiles.',
        apply: (player) => {
            player.drones.push(new SentinelDrone(player));
        }
    },
    {
        id: 'chain_detonation',
        name: 'Corpse Combustion',
        category: 'Offense',
        rarity: 'Epic',
        icon: '☣️',
        description: 'Enemies violently explode on death, dealing 40% overkill damage to neighbors.',
        apply: (player) => {
            player.hasCorpseExplosion = true;
        }
    }
];

class SentinelDrone {
    constructor(player) {
        this.player = player;
        this.angle = Math.random() * Math.PI * 2;
        this.distance = 55;
        this.shootTimer = 0;
        this.shootCooldown = 0.55;
        this.color = '#00ffcc';
        this.damage = 18;
    }

    update(dt, enemies, projectiles) {
        // Orbit around player
        this.angle += 2.5 * dt;
        this.x = this.player.x + Math.cos(this.angle) * this.distance;
        this.y = this.player.y + Math.sin(this.angle) * this.distance;

        // Auto-target closest enemy
        this.shootTimer += dt;
        if (this.shootTimer >= this.shootCooldown && enemies && enemies.length > 0) {
            let closest = null;
            let minDist = 380;
            for (let i = 0; i < enemies.length; i++) {
                const e = enemies[i];
                if (e.isDead) continue;
                const d = Math.hypot(e.x - this.x, e.y - this.y);
                if (d < minDist) {
                    minDist = d;
                    closest = e;
                }
            }

            if (closest) {
                this.shootTimer = 0;
                const aim = Math.atan2(closest.y - this.y, closest.x - this.x);
                const spd = 16.0;

                projectiles.push(new Projectile({
                    x: this.x,
                    y: this.y,
                    vx: Math.cos(aim) * spd,
                    vy: Math.sin(aim) * spd,
                    speed: spd,
                    damage: this.damage,
                    color: this.color,
                    radius: 3.5,
                    owner: 'player'
                }));
                window.audio.playShoot('pistol');
            }
        }
    }

    render(ctx, camera) {
        const sx = this.x - camera.x;
        const sy = this.y - camera.y;

        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(this.angle * 2);

        // Drone Body
        ctx.fillStyle = '#0a1a24';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 3 mini rotor wings
        for (let i = 0; i < 3; i++) {
            const a = (i / 3) * Math.PI * 2;
            ctx.fillStyle = this.color;
            ctx.fillRect(Math.cos(a) * 8 - 1.5, Math.sin(a) * 8 - 1.5, 3, 3);
        }

        ctx.restore();
    }
}

class UpgradeManager {
    constructor() {
        this.deck = [...UPGRADE_CARDS];
        this.chosenUpgrades = [];
    }

    getRandomChoices(count = 3) {
        const shuffled = [...this.deck].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    applyUpgrade(card, player) {
        card.apply(player);
        this.chosenUpgrades.push(card);
        window.audio.playLevelUp();
        window.particles.addText(player.x, player.y - 35, `ACQUIRED: ${card.name.toUpperCase()}`, '#00ffcc', 20, true);
    }
}

window.upgradesManager = new UpgradeManager();
