import type { Character } from '../types';

interface CharacterListProps {
  characters: Character[];
  selectedCharacter: Character | null;
  onSelectCharacter: (char: Character) => void;
  campaignSeed?: number | undefined;
  mapSize?: number | undefined;
  onStep?: (id: number, dx: number, dy: number) => void | Promise<void>;
}

export default function CharacterList({ characters, selectedCharacter, onSelectCharacter }: CharacterListProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Personagens</h2>
      <div className="space-y-3">
        {characters.map((char) => (
          <div
            key={char.id}
            className={`grid grid-cols-[auto_1fr] gap-2 p-3 rounded-lg cursor-pointer ${selectedCharacter?.id === char.id ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-50 dark:bg-gray-700'} hover:bg-gray-100 dark:hover:bg-gray-600`}
            onClick={() => onSelectCharacter(char)}
          >
            <div className="flex flex-col justify-center items-center gap-3">
              {/* avatar com cor do personagem e texto claro em tema escuro */}
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: char.color ?? '#2563eb', color: '#ffffff', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12)' }}>
                {char.name.charAt(0).toUpperCase()}
              </div>
              <p className="text-xs text-center text-gray-600 dark:text-gray-400 mt-1">Nível {char.level}</p>
            </div>
            <div className="pl-3">
              <p className="font-medium text-gray-900 dark:text-white text-left">{char.name}</p>
                            <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-1">
                <span>PC</span>
                {(() => {
                  const pcVal = Math.min(3000, (char.forca + char.destreza + (char.weapon_attr === 'forca' || char.weapon_attr === 'destreza' ? char.weapon_bonus : 0)) * 75);
                  return (
                    <div className="relative flex-1 h-3 rounded" style={{ background: `linear-gradient(to right, #eab308 0%, #eab308 100%, #e5e7eb 100%, #e5e7eb 100%)` }}>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                        {pcVal}/{pcVal}
                      </span>
                    </div>
                  );
                })()}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-1">
                <span>PV</span>
                {(() => {
                  const maxPv = Math.min(5000, (char.constituicao + (char.weapon_attr === 'constituicao' ? char.weapon_bonus : 0)) * 250);
                  const currentPv = char.current_pv ?? maxPv;
                  const pvPercentage = (currentPv / maxPv) * 100;
                  return (
                    <div className="relative flex-1 h-3 rounded" style={{ background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${pvPercentage}%, #e5e7eb ${pvPercentage}%, #e5e7eb 100%)` }}>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                        {currentPv}/{maxPv}
                      </span>
                    </div>
                  );
                })()}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <span>PE</span>
                {(() => {
                  const maxPe = Math.min(2000, ((char.inteligencia + char.sabedoria + char.carisma + (['inteligencia', 'sabedoria', 'carisma'].includes(char.weapon_attr) ? char.weapon_bonus : 0)) * 33));
                  const currentPe = char.current_pe ?? maxPe;
                  const pePercentage = (currentPe / maxPe) * 100;
                  return (
                    <div className="relative flex-1 h-3 rounded" style={{ background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${pePercentage}%, #e5e7eb ${pePercentage}%, #e5e7eb 100%)` }}>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                        {currentPe}/{maxPe}
                      </span>
                    </div>
                  );
                })()}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <span>XP</span>
                {(() => {
                  const requiredXp = 1000 * char.level;
                  const xpPercentage = Math.min(100, (char.xp / requiredXp) * 100);
                  return (
                    <div className="relative flex-1 h-3 rounded" style={{ background: `linear-gradient(to right, #10b981 0%, #10b981 ${xpPercentage}%, #ffffff ${xpPercentage}%, #ffffff 100%)` }}>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-900">
                        {char.xp}/{requiredXp}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}