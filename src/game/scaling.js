import { SHIP_SIZE, SHIP_THRUST, ASTEROIDS_SIZE, ASTEROIDS_SPEED, BULLET_SPEED, HYPERSPACE_DIST } from './constants.js';

/**
 * Calculate a scale factor relative to a 1920px-wide baseline.
 * On desktop (1920px) → 1.0, on mobile landscape (~844px) → ~0.44
 * Clamped to [0.35, 1.0] to avoid extremes.
 */
/**
 * Calculate a scale factor relative to a 1920px-wide baseline.
 */
export function getScale(canvas) {
    const reference = 1920;
    const effectiveWidth = Math.min(canvas.width, canvas.height * (16 / 9));
    return Math.max(0.35, Math.min(1.0, effectiveWidth / reference));
}

/**
 * Player scale: Less aggressive than base scale.
 * Keeps the player ship readable on mobile.
 */
export function getPlayerScale(baseScale) {
    return Math.pow(baseScale, 0.6);
}

/**
 * Enemy scale: More aggressive than base scale.
 * UFOs/Rivals become "significantly smaller" on mobile.
 */
export function getEnemyScale(baseScale) {
    // More aggressive than player scale to emphasize "small, agile" enemies on mobile
    return Math.pow(baseScale, 0.9);
}

/**
 * Retro Bullet Scale: Increases when base scale decreases.
 * Ensures tiny bullets are visible on mobile.
 */
export function getRetroBulletScale(baseScale) {
    return baseScale < 1.0 ? 1.5 : 1.0;
}

/** Scaled versions of constants */
export function scaledShipSize(scale) {
    return SHIP_SIZE * scale;
}

export function scaledAsteroidSize(scale) {
    return ASTEROIDS_SIZE * scale;
}

export function scaledAsteroidSpeed(scale) {
    return ASTEROIDS_SPEED * scale;
}

export function scaledBulletSpeed(scale) {
    return BULLET_SPEED * scale;
}

export function scaledShipThrust(scale) {
    return SHIP_THRUST * scale;
}

export function scaledHyperspaceDist(scale) {
    return HYPERSPACE_DIST * scale;
}
