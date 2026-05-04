import { SEED_WORDS } from '../constants.js';

/**
 * Converts a seed string like "WOLF-99" into a numeric hash.
 */
export function seedToNumber(seedStr) {
  const s = String(seedStr).toUpperCase().trim();
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) || 1;
}

/**
 * Generates a random seed string in WORD-NUMBER format.
 */
export function generateRandomSeed() {
  const word = SEED_WORDS[Math.floor(Math.random() * SEED_WORDS.length)];
  const num = Math.floor(Math.random() * 100);
  return `${word}-${String(num).padStart(2, '0')}`;
}

/**
 * Validates that a seed string is in a reasonable format.
 */
export function isValidSeed(seedStr) {
  return typeof seedStr === 'string' && seedStr.trim().length >= 1;
}

/**
 * Formats a seed string for display.
 */
export function formatSeed(seedStr) {
  return String(seedStr).toUpperCase().trim();
}
