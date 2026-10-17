/**
 * CYBERVOID: OVERDRIVE - High-Performance Particle & Visual FX System
 */

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.floatingTexts = [];
        this.shockwaves = [];
        this.casings = [];
        this.dashGhosts = [];
        this.floorDecals = []; // Permanent or fading scorches & cyber-oil

        // Max limits for guaranteed 60fps performance
        this.maxParticles = 600;
        this.maxDecals = 200;
        this.maxCasings = 100;
    }

    clear() {
        this.particles = [];
        this.floatingTexts = [];
        this.shockwaves = [];
        this.casings = [];
        this.dashGhosts = [];
        this.floorDecals = [];
    }

    // === FLOATING TEXT ===
    addText(x, y, text, color = '#ffffff', fontSize = 16, isCrit = false) {
        this.floatingTexts.push({
            x: x + (Math.random() - 0.5) * 12,
            y: y - 10,
            vx: (Math.random() - 0.5) * 1.5,
            vy: isCrit ? -3.5 : -2.0,
            text: text,
            color: color,
            fontSize: isCrit ? fontSize * 1.4 : fontSize,
            isCrit: isCrit,
            alpha: 1.0,
            life: 1.0,
            decay: isCrit ? 0.015 : 0.025,
            scale: isCrit ? 1.5 : 1.0
        });
    }

    // === SPARKS / IMPACT PARTICLES ===
    addSparks(x, y, color = '#00f0ff', count = 12, speed = 4, size = 3) {
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) {
                this.particles.shift();
            }
            const angle = Math.random() * Math.PI * 2;
            const spd = (0.3 + Math.random() * 0.7) * speed;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                color: color,
                size: (0.5 + Math.random() * 0.8) * size,
                alpha: 1.0,
                decay: 0.02 + Math.random() * 0.03,
                drag: 0.94,
                glow: true,
                type: 'spark'
            });
        }
    }

    // === DIRECTIONAL HIT CONE SPARKS ===
    addHitSparks(x, y, angle, color = '#ff0055', count = 8) {
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) this.particles.shift();
            const spread = (Math.random() - 0.5) * 0.9;
            const spd = 2 + Math.random() * 5;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle + spread) * spd,
                vy: Math.sin(angle + spread) * spd,
                color: color,
                size: 2 + Math.random() * 3,
                alpha: 1.0,
                decay: 0.03 + Math.random() * 0.03,
                drag: 0.93,
                glow: true,
                type: 'spark'
            });
        }
    }

    // === EXPLOSION FX ===
    addExplosion(x, y, color = '#ff5500', radius = 40, count = 30) {
        // Core shockwave
        this.shockwaves.push({
            x: x,
            y: y,
            radius: 5,
            maxRadius: radius * 1.5,
            color: color,
            alpha: 1.0,
            lineWidth: 6,
            decay: 0.035
        });

        // Fiery debris & smoke
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) this.particles.shift();
            const angle = Math.random() * Math.PI * 2;
            const spd = (0.5 + Math.random() * 1.5) * (radius / 8);
            const isSmoke = Math.random() > 0.6;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                color: isSmoke ? '#333344' : color,
                size: isSmoke ? 8 + Math.random() * 10 : 3 + Math.random() * 4,
                alpha: 1.0,
                decay: isSmoke ? 0.015 : 0.03,
                drag: isSmoke ? 0.92 : 0.95,
                glow: !isSmoke,
                type: isSmoke ? 'smoke' : 'spark'
            });
        }

        // Add scorch mark decal on the ground
        this.addDecal(x, y, radius * 0.9, 'scorch');
    }

    // === SMOKE TRAIL (FOR ROCKETS/DASH) ===
    addSmoke(x, y, color = 'rgba(100, 240, 255, 0.4)', size = 5) {
        if (this.particles.length >= this.maxParticles) this.particles.shift();
        this.particles.push({
            x: x + (Math.random() - 0.5) * 4,
            y: y + (Math.random() - 0.5) * 4,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            color: color,
            size: size,
            alpha: 0.8,
            decay: 0.035,
            drag: 0.97,
            glow: false,
            type: 'smoke'
        });
    }

    // === DASH AFTERIMAGE (GHOST) ===
    addDashGhost(x, y, angle, radius, color = '#00f0ff') {
        this.dashGhosts.push({
            x: x,
            y: y,
            angle: angle,
            radius: radius,
            color: color,
            alpha: 0.65,
            decay: 0.07
        });
    }

    // === EJECTED BRASS CASING ===
    addCasing(x, y, angle, type = 'bullet') {
        if (this.casings.length >= this.maxCasings) this.casings.shift();
        // Eject casing perpendicular to firing angle with variance
        const ejectAngle = angle + Math.PI / 2 + (Math.random() - 0.5) * 0.4;
        const spd = 2 + Math.random() * 2.5;

        this.casings.push({
            x: x,
            y: y,
            vx: Math.cos(ejectAngle) * spd,
            vy: Math.sin(ejectAngle) * spd,
            rot: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.4,
            alpha: 1.0,
            life: 1.0,
            decay: 0.003, // stays around for seconds!
            drag: 0.88,
            type: type
        });
    }

    // === FLOOR DECALS (SPLATTER & SCORCHES) ===
    addDecal(x, y, size = 20, type = 'scorch', color = '#0a0a14') {
        if (this.floorDecals.length >= this.maxDecals) {
            this.floorDecals.shift();
        }

        const splats = [];
        const numBlobs = 3 + Math.floor(Math.random() * 5);
        for (let i = 0; i < numBlobs; i++) {
            splats.push({
                ox: (Math.random() - 0.5) * size,
                oy: (Math.random() - 0.5) * size,
                r: (0.3 + Math.random() * 0.7) * (size * 0.5)
            });
        }

        this.floorDecals.push({
            x: x,
            y: y,
            radius: size,
            type: type,
            color: color,
            alpha: 0.75,
            decay: 0.0008, // Very slow fade
            splats: splats
        });
    }

    // === UPDATE ALL PARTICLES ===
    update(dt = 1) {
        // 1. Sparks & Smoke
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= Math.pow(p.drag, dt);
            p.vy *= Math.pow(p.drag, dt);

            if (p.type === 'smoke') {
                p.size += 0.3 * dt;
            }

            p.alpha -= p.decay * dt;
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // 2. Floating combat numbers
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.x += ft.vx * dt;
            ft.y += ft.vy * dt;
            ft.vy += 0.06 * dt; // slight gravity arc
            if (ft.scale > 1.0) {
                ft.scale = Math.max(1.0, ft.scale - 0.08 * dt);
            }
            ft.alpha -= ft.decay * dt;
            if (ft.alpha <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }

        // 3. Shockwaves
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const sw = this.shockwaves[i];
            sw.radius += (sw.maxRadius - sw.radius) * 0.18 * dt;
            sw.alpha -= sw.decay * dt;
            if (sw.alpha <= 0 || sw.radius >= sw.maxRadius * 0.98) {
                this.shockwaves.splice(i, 1);
            }
        }

        // 4. Dash Ghosts
        for (let i = this.dashGhosts.length - 1; i >= 0; i--) {
            const dg = this.dashGhosts[i];
            dg.alpha -= dg.decay * dt;
            if (dg.alpha <= 0) {
                this.dashGhosts.splice(i, 1);
            }
        }

        // 5. Casings
        for (let i = this.casings.length - 1; i >= 0; i--) {
            const c = this.casings[i];
            c.x += c.vx * dt;
            c.y += c.vy * dt;
            c.vx *= Math.pow(c.drag, dt);
            c.vy *= Math.pow(c.drag, dt);
            c.rot += c.vRot * dt;
            c.vRot *= Math.pow(0.9, dt);

            c.alpha -= c.decay * dt;
            if (c.alpha <= 0) {
                this.casings.splice(i, 1);
            }
        }

        // 6. Floor Decals
        for (let i = this.floorDecals.length - 1; i >= 0; i--) {
            const d = this.floorDecals[i];
            d.alpha -= d.decay * dt;
            if (d.alpha <= 0) {
                this.floorDecals.splice(i, 1);
            }
        }
    }

    // === RENDER FLOOR DECALS & CASINGS (Behind entities) ===
    renderFloor(ctx, camera) {
        // Draw Decals
        for (let i = 0; i < this.floorDecals.length; i++) {
            const d = this.floorDecals[i];
            const sx = d.x - camera.x;
            const sy = d.y - camera.y;

            ctx.save();
            ctx.globalAlpha = d.alpha;
            ctx.fillStyle = d.color;

            if (d.type === 'scorch') {
                const grad = ctx.createRadialGradient(sx, sy, 2, sx, sy, d.radius);
                grad.addColorStop(0, 'rgba(10, 10, 15, 0.85)');
                grad.addColorStop(0.6, 'rgba(25, 20, 30, 0.4)');
                grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(sx, sy, d.radius, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Splatter blobs
                d.splats.forEach(b => {
                    ctx.beginPath();
                    ctx.arc(sx + b.ox, sy + b.oy, b.r, 0, Math.PI * 2);
                    ctx.fill();
                });
            }
            ctx.restore();
        }

        // Draw Shell Casings
        for (let i = 0; i < this.casings.length; i++) {
            const c = this.casings[i];
            const sx = c.x - camera.x;
            const sy = c.y - camera.y;

            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(c.rot);
            ctx.globalAlpha = c.alpha;

            if (c.type === 'shotgun') {
                ctx.fillStyle = '#ff2244';
                ctx.fillRect(-3, -1.5, 6, 3);
                ctx.fillStyle = '#ffdd44';
                ctx.fillRect(2, -1.5, 2, 3);
            } else {
                ctx.fillStyle = '#ffcc00';
                ctx.fillRect(-2.5, -1, 5, 2);
            }
            ctx.restore();
        }
    }

    // === RENDER FOREGROUND PARTICLES, GHOSTS & TEXTS ===
    renderForeground(ctx, camera) {
        // 1. Dash Ghosts
        for (let i = 0; i < this.dashGhosts.length; i++) {
            const g = this.dashGhosts[i];
            const sx = g.x - camera.x;
            const sy = g.y - camera.y;

            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(g.angle);
            ctx.globalAlpha = g.alpha;
            ctx.strokeStyle = g.color;
            ctx.shadowColor = g.color;
            ctx.shadowBlur = 10;
            ctx.lineWidth = 2.5;

            // Player ghost shape
            ctx.beginPath();
            ctx.moveTo(g.radius * 1.2, 0);
            ctx.lineTo(-g.radius, -g.radius * 0.85);
            ctx.lineTo(-g.radius * 0.4, 0);
            ctx.lineTo(-g.radius, g.radius * 0.85);
            ctx.closePath();
            ctx.stroke();

            ctx.restore();
        }

        // 2. Shockwaves
        for (let i = 0; i < this.shockwaves.length; i++) {
            const sw = this.shockwaves[i];
            const sx = sw.x - camera.x;
            const sy = sw.y - camera.y;

            ctx.save();
            ctx.globalAlpha = sw.alpha;
            ctx.strokeStyle = sw.color;
            ctx.shadowColor = sw.color;
            ctx.shadowBlur = 14;
            ctx.lineWidth = sw.lineWidth;

            ctx.beginPath();
            ctx.arc(sx, sy, sw.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // 3. Sparks & Smoke
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            const sx = p.x - camera.x;
            const sy = p.y - camera.y;

            ctx.save();
            ctx.globalAlpha = p.alpha;

            if (p.glow) {
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 8;
            }

            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // 4. Floating Combat Text
        for (let i = 0; i < this.floatingTexts.length; i++) {
            const ft = this.floatingTexts[i];
            const sx = ft.x - camera.x;
            const sy = ft.y - camera.y;

            ctx.save();
            ctx.translate(sx, sy);
            ctx.scale(ft.scale, ft.scale);
            ctx.globalAlpha = ft.alpha;
            ctx.font = `900 ${ft.fontSize}px 'Rajdhani', 'Segoe UI', system-ui, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Glow & Outline
            ctx.shadowColor = ft.isCrit ? '#ff0055' : ft.color;
            ctx.shadowBlur = ft.isCrit ? 12 : 6;
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
            ctx.lineWidth = ft.isCrit ? 4 : 2.5;
            ctx.strokeText(ft.text, 0, 0);

            ctx.fillStyle = ft.color;
            ctx.fillText(ft.text, 0, 0);
            ctx.restore();
        }
    }
}

window.particles = new ParticleSystem();
