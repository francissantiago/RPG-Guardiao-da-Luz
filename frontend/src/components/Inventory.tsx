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
            <div className="grid grid-cols-5 gap-2">
              {['Cabeça', 'Corpo', 'Mãos', 'Pernas', 'Pés'].map((slot) => (
                <div key={slot} className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-center text-sm">
                  {slot}
                </div>
              ))}
            </div>
          </div>
          {/* Itens */}
          <div>
            <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Itens</h3>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {Array.from({ length: 20 }, (_, i) => (
                <div key={i} className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-center text-sm">
                  Slot {i + 1}
                </div>
              ))}
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded">
              <label className="block text-gray-700 dark:text-gray-300 font-medium">CICLOS:</label>
              <input
                type="number"
                value={selectedCharacter.inventory?.currency || 0}
                className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">Selecione um personagem</p>
      )}
    </div>
  );
}