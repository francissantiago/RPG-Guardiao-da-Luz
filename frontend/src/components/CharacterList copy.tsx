import React from 'react';
import type { Character } from '../types';

interface CharacterListProps {
  characters: Character[];
  selectedCharacter: Character | null;
  onSelectCharacter: (char: Character) => void;
  campaignSeed?: number;
  mapSize?: number;
  onStep?: (id: number, dx: number, dy: number) => void;
}

const noise = (x: number, y: number, seed: number = 0) => {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 43758.5453) * 43758.5453;
  return n - Math.floor(n);
};

const getTerrainType = (x: number, y: number, seed: number, mapSizeLocal: number) => {
  const elevation = noise(x * 0.1, y * 0.1, seed);
  const moisture = noise(x * 0.05 + 100, y * 0.05 + 100, seed);
  const temperature = 1 - Math.abs(y) / (mapSizeLocal || 5);
  const isBorder = Math.abs(x) > (mapSizeLocal || 5) * 2.5 || Math.abs(y) > (mapSizeLocal || 5) * 0.7;

  if (isBorder && elevation > 0.5) return 'mountain';
  if (elevation > 0.7) return temperature > 0.3 ? 'mountain' : 'snow';
  if (moisture > 0.6) return elevation > 0.3 ? 'swamp' : 'water';
  if (temperature < 0.2) return 'snow';
  if (temperature > 0.8 && moisture < 0.3) return 'desert';
  if (elevation > 0.4) return 'forest';
  return 'grass';
};

export default function CharacterList({ characters, selectedCharacter, onSelectCharacter, campaignSeed, mapSize, onStep }: CharacterListProps) {
  const isWalkable = (x: number, y: number) => {
    if (campaignSeed == null || mapSize == null) return true;
    const terrain = getTerrainType(x, y, campaignSeed, mapSize);
    return !['mountain', 'water'].includes(terrain);
  };

  const isOccupied = (x: number, y: number) => characters.some(c => c.location?.x === x && c.location?.y === y);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Personagens</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {characters.map((char) => {
          const x = char.location?.x ?? 0;
          const y = char.location?.y ?? 0;

          const directions = [
            { name: 'N', dx: 0, dy: -1, symbol: '↑' },
            { name: 'NE', dx: 1, dy: -1, symbol: '↗' },
            { name: 'E', dx: 1, dy: 0, symbol: '→' },
            { name: 'SE', dx: 1, dy: 1, symbol: '↘' },
            { name: 'S', dx: 0, dy: 1, symbol: '↓' },
            { name: 'SW', dx: -1, dy: 1, symbol: '↙' },
            { name: 'W', dx: -1, dy: 0, symbol: '←' },
            { name: 'NW', dx: -1, dy: -1, symbol: '↖' },
          ];

          const validByDir = directions.map(d => {
            const tx = x + d.dx;
            const ty = y + d.dy;
            return { ...d, valid: isWalkable(tx, ty) && !isOccupied(tx, ty) };
          });

          const hasAnyValid = validByDir.some(v => v.valid);

          const pcVal = Math.min(3000, (char.forca + char.destreza + (char.weapon_attr === 'forca' || char.weapon_attr === 'destreza' ? char.weapon_bonus : 0)) * 75);
          const maxPv = Math.min(5000, (char.constituicao + (char.weapon_attr === 'constituicao' ? char.weapon_bonus : 0)) * 250);
          const currentPv = char.current_pv ?? maxPv;

          const maxPe = Math.min(2000, ((char.inteligencia + char.sabedoria + char.carisma + (['inteligencia', 'sabedoria', 'carisma'].includes(char.weapon_attr) ? char.weapon_bonus : 0)) * 33));
          const currentPe = char.current_pe ?? maxPe;

          return (
            <div key={char.id} className={`grid grid-cols-[auto_1fr] gap-2 p-3 rounded-lg cursor-pointer min-w-0 overflow-hidden ${selectedCharacter?.id === char.id ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-50 dark:bg-gray-700'} hover:bg-gray-100 dark:hover:bg-gray-600`} onClick={() => onSelectCharacter(char)}>
              <div className="flex flex-col justify-center items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: char.color ?? '#2563eb', color: '#ffffff', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12)' }}>
                  {char.name.charAt(0).toUpperCase()}
                </div>
                <p className="text-xs text-center text-gray-600 dark:text-gray-400 mt-1">Nível {char.level}</p>
              </div>

              <div className="pl-3 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white text-left">{char.name}</p>

                <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-1">
                  <span>PC</span>
                  <div className="relative flex-1 h-3 rounded bg-yellow-200 overflow-hidden min-w-0">
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white truncate">{pcVal}/{pcVal}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-1">
                  <span>PV</span>
                  <div className="relative flex-1 h-3 rounded bg-red-200 overflow-hidden min-w-0">
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white truncate">{currentPv}/{maxPv}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <span>PE</span>
                  <div className="relative flex-1 h-3 rounded bg-blue-200 overflow-hidden min-w-0">
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white truncate">{currentPe}/{maxPe}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-2">
                  <span>XP</span>
                  <div className="relative flex-1 h-3 rounded bg-green-100 overflow-hidden min-w-0">
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-900 truncate">{char.xp}/{1000 * char.level}</span>
                  </div>
                </div>

                <div className={`mt-2 w-full flex gap-2 items-center justify-end ${hasAnyValid ? '' : 'opacity-40'}`}>
                  {validByDir.map(d => (
                    <button aria-label={`Mover ${d.name}`} key={d.name} onClick={(e) => { e.stopPropagation(); onStep?.(char.id, d.dx, d.dy); }} disabled={!d.valid} className={`w-6 h-6 flex items-center justify-center rounded text-sm ${d.valid ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}>
                      <span className="text-base font-bold leading-none">{d.symbol}</span>
                    </button>
                  ))}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}