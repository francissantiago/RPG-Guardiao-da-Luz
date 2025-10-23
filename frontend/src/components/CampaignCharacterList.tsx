import { useState } from 'react';
import { useToast } from './ToastProvider';
import type { Character } from '../types';

interface Props {
  characters: Character[];
  campaignSeed?: number;
  mapSize?: number;
  selectedCharacter?: Character | null;
  onSelectCharacter?: (c: Character) => void;
  onStep?: (id: number, dx: number, dy: number) => void;
  onTeleport?: (updated: Character) => void;
  onBindCharacter?: (charId: number) => void;
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

export default function CampaignCharacterList({ characters, campaignSeed, mapSize, selectedCharacter, onSelectCharacter, onStep, onTeleport, onBindCharacter }: Props) {
  const toast = (() => { try { return useToast(); } catch { return null; } })();
  const [teleportFor, setTeleportFor] = useState<number | null>(null);
  const [tx, setTx] = useState<number>(0);
  const [ty, setTy] = useState<number>(0);
  const isWalkable = (x: number, y: number) => {
    if (campaignSeed == null || mapSize == null) return true;
    const t = getTerrainType(x, y, campaignSeed, mapSize);
    return !['mountain', 'water'].includes(t);
  };

  const isOccupied = (x: number, y: number) => characters.some(c => c.location?.x === x && c.location?.y === y);

  const directions = [
    { name: 'N', dx: 0, dy: -1, s: '↑' },
    { name: 'NE', dx: 1, dy: -1, s: '↗' },
    { name: 'E', dx: 1, dy: 0, s: '→' },
    { name: 'SE', dx: 1, dy: 1, s: '↘' },
    { name: 'S', dx: 0, dy: 1, s: '↓' },
    { name: 'SW', dx: -1, dy: 1, s: '↙' },
    { name: 'W', dx: -1, dy: 0, s: '←' },
    { name: 'NW', dx: -1, dy: -1, s: '↖' },
  ];

  const visibleChars = characters.filter(c => c.location);
  const cols = Math.min(4, Math.max(1, visibleChars.length));

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Personagens no Mapa</h3>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }} className="gap-2">
        {visibleChars.map((c) => {
          const x = c.location!.x;
          const y = c.location!.y;
          const inCampaign = !!c.campaign_id;
          const isSelected = selectedCharacter && selectedCharacter.id === c.id;

          const validByDir = directions.map(d => ({ ...d, valid: inCampaign && isWalkable(x + d.dx, y + d.dy) && !isOccupied(x + d.dx, y + d.dy) }));

          // compute compact stats similar to CharacterList
          const pcVal = Math.min(3000, (c.forca + c.destreza + (c.weapon_attr === 'forca' || c.weapon_attr === 'destreza' ? c.weapon_bonus : 0)) * 75);
          const maxPv = Math.min(5000, (c.constituicao + (c.weapon_attr === 'constituicao' ? c.weapon_bonus : 0)) * 250);
          const currentPv = c.current_pv ?? maxPv;
          const maxPe = Math.min(2000, ((c.inteligencia + c.sabedoria + c.carisma + (['inteligencia', 'sabedoria', 'carisma'].includes(c.weapon_attr) ? c.weapon_bonus : 0)) * 33));
          const currentPe = c.current_pe ?? maxPe;
          const xpNeed = 1000 * c.level;

          return (
            <div key={c.id} role="button" tabIndex={0} onClick={() => onSelectCharacter?.(c)} onKeyDown={(e) => { if (e.key === 'Enter') onSelectCharacter?.(c); }} className={`p-3 rounded-md flex flex-col gap-2 items-stretch bg-gray-50 dark:bg-gray-700 ${isSelected ? 'ring-2 ring-offset-1 ring-blue-400' : ''}`}>
              <div className="flex items-center gap-2 w-full">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: c.color ?? '#2563eb', color: '#fff' }}>{c.name.charAt(0).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-md font-medium truncate">{c.name}</div>
                  <div className="text-sm text-gray-500 truncate">Lvl {c.level} • {x},{y}</div>
                </div>
              </div>

              <div className="w-full space-y-1">
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-300 gap-2">
                  <span className="w-8">PC</span>
                  <div className="flex-1 h-5 rounded bg-yellow-200 overflow-hidden relative">
                    <div style={{ width: `${100}%`, background: '#f59e0b', height: '100%' }} />
                    <span className="absolute inset-0 flex items-center justify-center text-[15px] text-white">{pcVal}/{pcVal}</span>
                  </div>
                </div>

                <div className="flex items-center text-xs text-gray-600 dark:text-gray-300 gap-2">
                  <span className="w-8">PV</span>
                  <div className="flex-1 h-5 rounded bg-red-200 overflow-hidden relative">
                    <div style={{ width: `${Math.round((currentPv / maxPv) * 100)}%`, background: '#ef4444', height: '100%' }} />
                    <span className="absolute inset-0 flex items-center justify-center text-[15px] text-white">{currentPv}/{maxPv}</span>
                  </div>
                </div>

                <div className="flex items-center text-xs text-gray-600 dark:text-gray-300 gap-2">
                  <span className="w-8">PE</span>
                  <div className="flex-1 h-5 rounded bg-blue-200 overflow-hidden relative">
                    <div style={{ width: `${Math.round((currentPe / maxPe) * 100)}%`, background: '#3b82f6', height: '100%' }} />
                    <span className="absolute inset-0 flex items-center justify-center text-[15px] text-white">{currentPe}/{maxPe}</span>
                  </div>
                </div>

                <div className="flex items-center text-xs text-gray-600 dark:text-gray-300 gap-2">
                  <span className="w-8">XP</span>
                  <div className="flex-1 h-5 rounded bg-green-100 overflow-hidden relative">
                    <div style={{ width: `${Math.min(100, Math.round((c.xp / xpNeed) * 100))}%`, background: '#10b981', height: '100%' }} />
                    <span className="absolute inset-0 flex items-center justify-center text-[15px] text-gray-900">{c.xp}/{xpNeed}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mt-2 justify-center">
                {validByDir.map(d => (
                  <button key={d.name} onClick={(e) => { e.stopPropagation(); if (!inCampaign) { try { toast?.show('Personagem não vinculado a uma campanha', 'error'); } catch {} return; } d.valid && onStep?.(c.id, d.dx, d.dy); }} disabled={!d.valid} className={`w-7 h-7 text-lg flex items-center justify-center rounded ${d.valid ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`} title={inCampaign ? d.name : 'Fora da campanha'}>
                    {d.s}
                  </button>
                ))}
                {inCampaign ? (
                  <button onClick={(e) => { e.stopPropagation(); if (teleportFor === c.id) setTeleportFor(null); else { setTeleportFor(c.id); setTx(c.location!.x); setTy(c.location!.y); } }} className={`w-7 h-7 text-lg flex items-center justify-center rounded bg-purple-600 text-white`} title={'Teleportar'}>✦</button>
                ) : (
                  <button onClick={(e) => { e.stopPropagation(); try { toast?.show('Personagem sem campanha — vincule-o para habilitar movimentos', 'info'); } catch {} }} className={`w-7 h-7 text-sm flex items-center justify-center rounded bg-yellow-400 text-white`} title={'Sem campanha'}>Vinc.</button>
                )}
              </div>

              {teleportFor === c.id && (
                <div className="mt-2 flex items-center gap-2 justify-center">
                  <input type="number" value={tx} onChange={(e) => setTx(Number(e.target.value))} className="w-16 px-2 py-1 rounded border bg-white dark:bg-gray-700 text-sm" />
                  <input type="number" value={ty} onChange={(e) => setTy(Number(e.target.value))} className="w-16 px-2 py-1 rounded border bg-white dark:bg-gray-700 text-sm" />
                  <button onClick={async (ev) => {
                    ev.stopPropagation();
                    if (!inCampaign) { try { toast?.show('Personagem não vinculado a uma campanha', 'error'); } catch {} return; }
                    try {
                      const res = await fetch(`http://localhost:3001/characters/${c.id}/teleport`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: { x: tx, y: ty } }) });
                      const data = await res.json();
                      if (res.ok) {
                        onTeleport?.({ ...c, location: { x: data.to.x, y: data.to.y } } as Character);
                        try { toast?.show('Teleport realizado', 'success'); } catch {}
                        setTeleportFor(null);
                      } else {
                        try { toast?.show(data.error || 'Erro no teleport', 'error'); } catch {}
                      }
                    } catch (err) {
                      try { toast?.show('Erro de conexão', 'error'); } catch {}
                      console.error('Erro no teleport:', err);
                    }
                  }} className="px-2 py-1 rounded bg-purple-500 text-white text-sm">Teleportar</button>
                </div>
              )}

              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 flex gap-2 flex-wrap justify-center">
                <div>For: {c.forca}</div>
                <div>Des: {c.destreza}</div>
                <div>Con: {c.constituicao}</div>
                <div>Int: {c.inteligencia}</div>
                <div>Sab: {c.sabedoria}</div>
                <div>Car: {c.carisma}</div>
              {!inCampaign && (
                <div className="w-full flex justify-center mt-2">
                  <button onClick={(e) => { e.stopPropagation(); onBindCharacter?.(c.id); }} className="px-2 py-1 rounded bg-indigo-500 text-white text-sm">Vincular à campanha</button>
                </div>
              )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
