import { useState } from 'react';
import type { Character } from '../types';
import { useToast } from './ToastProvider';

interface InventoryProps {
  selectedCharacter: Character | null;
  refreshCharacters?: () => void;
}

export default function Inventory({ selectedCharacter, refreshCharacters }: InventoryProps) {
  const toast = (() => { try { return useToast(); } catch { return null; } })();
  const [newItemId, setNewItemId] = useState<number>(1);
  const [teleportX, setTeleportX] = useState<number>(0);
  const [teleportY, setTeleportY] = useState<number>(0);
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Inventário</h2>
      {selectedCharacter ? (
        <div className="space-y-4">
          {/* Equipamento */}
          <div>
            <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Equipamento</h3>
            <div className="grid grid-cols-5 gap-2 min-h-[100px]">
              {['head', 'body', 'hands', 'legs', 'feet'].map((slot) => {
                const item = selectedCharacter.inventory?.equipped?.[slot];
                return (
                  <div key={slot} className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-center text-md">
                    <div className="font-medium capitalize">{slot}</div>
                    {item ? (
                      <div className="text-xs mt-1">
                        <div>{item.name}</div>
                        {item.bonus && <div>+{item.bonus.value} {item.bonus.attr.toUpperCase()}</div>}
                      </div>
                    ) : (
                      <div className="text-xs mt-1 text-gray-500">Vazio</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {/* Itens */}
          <div>
            <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Itens</h3>
            <div className="space-y-3 mb-4">
              {selectedCharacter.inventory?.items.length ? (
                <ul className="space-y-2">
                  {selectedCharacter.inventory.items.map((item) => (
                    <li key={item.character_item_id ?? item.id} className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded">
                      <div>
                        <div className="font-medium">{item.name} <span className="text-xs text-gray-500">({item.type})</span></div>
                        {item.bonus && <div className="text-sm text-green-600 dark:text-green-400">+{item.bonus.value} {item.bonus.attr}</div>}
                      </div>
                      <div className="flex gap-2">
                        <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs" onClick={async () => {
                          if (!selectedCharacter) return;
                          try {
                            const res = await fetch(`http://localhost:3001/characters/${selectedCharacter.id}/items/${item.character_item_id ?? item.id}/equip`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slot: 'hands' }) });
                            if (res.ok) { refreshCharacters?.(); toast?.show('Item equipado', 'success'); }
                            else { const data = await res.json(); toast?.show(data.error || 'Erro ao equipar', 'error'); }
                          } catch (e) { console.error(e); toast?.show('Erro ao equipar item', 'error'); }
                        }}>Equipar</button>
                        <button className="px-2 py-1 bg-gray-600 text-white rounded text-xs" onClick={async () => {
                          if (!selectedCharacter) return;
                          try {
                            const res = await fetch(`http://localhost:3001/characters/${selectedCharacter.id}/items/${item.character_item_id ?? item.id}/unequip`, { method: 'PUT' });
                            if (res.ok) { refreshCharacters?.(); toast?.show('Item desequipado', 'success'); }
                            else { const data = await res.json(); toast?.show(data.error || 'Erro ao desequipar', 'error'); }
                          } catch (e) { console.error(e); toast?.show('Erro ao desequipar item', 'error'); }
                        }}>Desequipar</button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-gray-600 dark:text-gray-400">Nenhum item</div>
              )}

              <div className="flex gap-2 items-center">
                <input type="number" value={newItemId} onChange={(e) => setNewItemId(Number(e.target.value))} className="w-24 px-2 py-1 rounded border" />
                <button className="px-3 py-1 bg-emerald-500 text-white rounded text-sm" onClick={async () => {
                  if (!selectedCharacter) return;
                  try {
                    const res = await fetch(`http://localhost:3001/characters/${selectedCharacter.id}/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ item_id: newItemId }) });
                    if (res.ok) { refreshCharacters?.(); toast?.show('Item adicionado ao inventário', 'success'); }
                    else { const data = await res.json(); toast?.show(data.error || 'Erro ao adicionar item', 'error'); }
                  } catch (e) { console.error(e); toast?.show('Erro ao adicionar item', 'error'); }
                }}>Adicionar item</button>
              </div>

              <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded mt-2">
                <label className="block text-gray-700 dark:text-gray-300 font-medium">CICLOS:</label>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{selectedCharacter.currency}</div>
              </div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Teleport</h4>
              <div className="flex gap-2 items-center">
                <input type="number" value={teleportX} onChange={(e) => setTeleportX(Number(e.target.value))} className="w-20 px-2 py-1 rounded border" />
                <input type="number" value={teleportY} onChange={(e) => setTeleportY(Number(e.target.value))} className="w-20 px-2 py-1 rounded border" />
                <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm" onClick={async () => {
                  if (!selectedCharacter) return;
                  try {
                    const res = await fetch(`http://localhost:3001/characters/${selectedCharacter.id}/teleport`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: { x: teleportX, y: teleportY } }) });
                    const data = await res.json();
                    if (res.ok) { refreshCharacters?.(); toast?.show('Teleport realizado', 'success'); }
                    else { toast?.show(data.error || 'Erro no teleport', 'error'); }
                  } catch (e) { console.error(e); toast?.show('Erro ao teletransportar', 'error'); }
                }}>Teleportar</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">Selecione um personagem</p>
      )}
    </div>
  );
}