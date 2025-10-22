// Paleta de cores segura para uso como identificadores de personagens
export const PALETTE = [
  '#2563eb', // azul
  '#ef4444', // vermelho
  '#10b981', // verde
  '#f59e0b', // laranja
  '#8b5cf6', // roxo
  '#e11d48', // magenta
  '#0ea5e9', // ciano
  '#14b8a6', // teal
  '#a78bfa', // lavanda
  '#f97316', // laranja-escuro
];

export function getColorForName(name?: string): string {
  if (!name || name.length === 0) {
    return PALETTE[Math.floor(Math.random() * PALETTE.length)];
  }
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % PALETTE.length;
  return PALETTE[idx];
}

export function getRandomPaletteColor(): string {
  return PALETTE[Math.floor(Math.random() * PALETTE.length)];
}
