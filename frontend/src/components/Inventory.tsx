import type { Character } from '../types';

interface InventoryProps {
  selectedCharacter: Character | null;
}

export default function Inventory({ selectedCharacter }: InventoryProps) {
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
            <div className="grid grid-cols-4 gap-2 mb-4 min-h-[90px]">
              {selectedCharacter.inventory?.items.map((item, index) => (
                <div key={index} className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-center text-sm">
                  {item.name}
                  {item.bonus && ` (+${item.bonus.value} ${item.bonus.attr})`}
                </div>
              ))}
              {Array.from({ length: Math.max(0, 20 - (selectedCharacter.inventory?.items.length || 0)) }, (_, i) => (
                <div key={`empty-${i}`} className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-center text-sm text-gray-500">
                  Vazio
                </div>
              ))}
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded">
              <label className="block text-gray-700 dark:text-gray-300 font-medium">CICLOS:</label>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{selectedCharacter.currency}</div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">Selecione um personagem</p>
      )}
    </div>
  );
}