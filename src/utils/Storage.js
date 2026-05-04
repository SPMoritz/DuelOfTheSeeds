const PREFIX = 'arena_trials_';

function key(name) {
  return PREFIX + name;
}

export function save(name, data) {
  try {
    localStorage.setItem(key(name), JSON.stringify(data));
  } catch (e) {
    console.warn('Storage save failed:', e);
  }
}

export function load(name, fallback = null) {
  try {
    const raw = localStorage.getItem(key(name));
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn('Storage load failed:', e);
    return fallback;
  }
}

export function remove(name) {
  try {
    localStorage.removeItem(key(name));
  } catch (e) {
    console.warn('Storage remove failed:', e);
  }
}

export function getHighscores(seedStr) {
  return load(`scores_${seedStr}`, []);
}

export function saveHighscore(seedStr, entry) {
  const scores = getHighscores(seedStr);
  scores.push(entry);
  scores.sort((a, b) => a.time - b.time);
  if (scores.length > 20) scores.length = 20;
  save(`scores_${seedStr}`, scores);
  return scores;
}

export function getBestGhost(seedStr) {
  return load(`ghost_${seedStr}`, null);
}

export function saveGhost(seedStr, ghostData) {
  const existing = getBestGhost(seedStr);
  if (!existing || ghostData.time < existing.time) {
    save(`ghost_${seedStr}`, ghostData);
    return true;
  }
  return false;
}

export function getSettings() {
  return load('settings', {
    playerName: 'Spieler',
    botDifficulty: 'NORMAL',
    soundEnabled: true,
  });
}

export function saveSettings(settings) {
  save('settings', settings);
}

export function getFavoriteSeeds() {
  return load('favorite_seeds', []);
}

export function saveFavoriteSeed(seedStr) {
  const favs = getFavoriteSeeds();
  if (!favs.includes(seedStr)) {
    favs.push(seedStr);
    save('favorite_seeds', favs);
  }
}

export function removeFavoriteSeed(seedStr) {
  const favs = getFavoriteSeeds().filter((s) => s !== seedStr);
  save('favorite_seeds', favs);
}

export function getRecentSeeds() {
  return load('recent_seeds', []);
}

export function addRecentSeed(seedStr) {
  let recent = getRecentSeeds().filter((s) => s !== seedStr);
  recent.unshift(seedStr);
  if (recent.length > 30) recent.length = 30;
  save('recent_seeds', recent);
}
