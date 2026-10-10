export function normalizeRestaurantSearch(value: string): string {
  return value.toLowerCase().replace(/(\d),(?=\d)/g, '$1').replace(/['\u2019]s\b/g, '').replace(/['\u2019]/g, '')
    .replace(/[^a-z0-9]+/g, ' ').trim();
}

function editDistance(a: string, b: string): number {
  const rows = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1,
        rows[i - 1][j - 1] + Number(a[i - 1] !== b[j - 1]));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1);
      }
    }
  }
  return rows[a.length][b.length];
}

export function rankRestaurantNames<T extends { name: string }>(items: T[], query: string): T[] {
  const normalized = normalizeRestaurantSearch(query);
  if (!normalized) return [];
  const tokens = normalized.split(' ');
  return items.map(item => {
    const name = normalizeRestaurantSearch(item.name);
    const words = name.split(' ');
    let score = Infinity;
    if (name === normalized) score = 0;
    else if (name.startsWith(normalized)) score = 1;
    else if (tokens.every(token => words.some(word => word.startsWith(token)))) score = 2;
    else if (tokens.every(token => name.includes(token))) score = 3;
    else {
      const distances = tokens.map(token => {
        if (words.some(word => word.startsWith(token))) return 0;
        if (token.length < 4) return Infinity;
        const distance = Math.min(...words.map(word => editDistance(token, word)));
        return distance <= (token.length >= 7 ? 2 : 1) ? distance : Infinity;
      });
      if (distances.every(Number.isFinite)) score = 4 + distances.reduce((sum, distance) => sum + distance, 0);
    }
    return { item, score };
  }).filter(result => Number.isFinite(result.score))
    .sort((a, b) => a.score - b.score || a.item.name.localeCompare(b.item.name))
    .map(result => result.item);
}
