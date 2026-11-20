// Pure difficulty maths. No DOM, no canvas, no randomness: everything here is a
// function of the wave number alone, so the curve can be asserted in tests.

export const FIELD = { W: 480, H: 720 };

export function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

/**
 * Difficulty is strictly increasing and decelerating: a log term carries the
 * early ramp, a small linear term guarantees it never flattens out.
 */
export function difficulty(wave) {
  const w = Math.max(1, wave);
  return 1 + 0.55 * Math.log2(w) + 0.03 * (w - 1);
}

export function isBossWave(wave) {
  return wave % 5 === 0;
}

export function waveConfig(wave) {
  const d = difficulty(wave);
  return {
    wave,
    difficulty: d,
    boss: isBossWave(wave),
    // How many enemies the wave sends before it is considered cleared.
    budget: Math.round(5 + 4 * (d - 1)),
    // Seconds between spawns. Floored so late waves stay readable.
    spawnInterval: clamp(1.55 / d, 0.26, 1.55),
    speedScale: 1 + 0.17 * (d - 1),
    hpBonus: Math.floor((d - 1) / 0.85),
    fireScale: 1 + 0.42 * (d - 1),
    bossHp: Math.round(34 * d),
  };
}

/**
 * A single scalar summarising the pressure a wave applies. Only used by the
 * tests, which assert it never eases off as the wave number climbs.
 */
export function threat(wave) {
  const c = waveConfig(wave);
  return (c.budget * (2 + c.hpBonus) * c.speedScale * c.fireScale) / c.spawnInterval;
}

/**
 * Compounding combo bonus. An affine bonus barely separates a flawless run from
 * a merely good one, so the multiplier compounds per consecutive kill and is
 * reset by any lapse (taking a hit, or letting an enemy escape).
 */
export function comboMultiplier(streak) {
  if (streak <= 0) return 1;
  return Math.min(6, Math.pow(1.085, streak));
}

export function scoreFor(base, streak) {
  return Math.round(base * comboMultiplier(streak));
}

/** Chance that a destroyed enemy leaves a power-up behind. */
export function dropChance(wave) {
  return clamp(0.14 + 0.004 * wave, 0.14, 0.24);
}
