import type { Character } from '../types';

interface SidebarProps {
  currentView: 'create' | 'view';
  setCurrentView: (view: 'create' | 'view') => void;
  characters: Character[];
  addXp: (id: number, amount: number) => void;
  levelUp: (id: number) => void;
}

export default function Sidebar({ currentView, setCurrentView, characters, addXp, levelUp }: SidebarProps) {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 p-4 shadow-md">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Menu</h2>
      <ul className="space-y-2">
        <li><button className={`w-full text-left p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded ${currentView === 'create' ? 'bg-gray-300 dark:bg-gray-600' : ''} text-gray-900 dark:text-white`} onClick={() => setCurrentView('create')}>Criar Personagem</button></li>
        <li><button className={`w-full text-left p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded ${currentView === 'view' ? 'bg-gray-300 dark:bg-gray-600' : ''} text-gray-900 dark:text-white`} onClick={() => setCurrentView('view')}>Ver Personagens</button></li>
        <li><button className="w-full text-left p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-white">Configurações</button></li>
      </ul>
      {currentView === 'create' && (
        <>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white mt-8">Personagens Cadastrados</h2>
          <div className="grid grid-cols-1 gap-4">
            {characters.map((char) => (
              <div key={char.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white text-left">{char.name}</h3>
                <p className="text-gray-700 dark:text-gray-300 text-left">Raça: {char.race}</p>
                <p className="text-gray-700 dark:text-gray-300 text-left">Arma: {char.weapon_name} (+{char.weapon_bonus} {char.weapon_attr})</p>
                <p className="text-gray-700 dark:text-gray-300 text-left">Nível: {char.level}</p>
                <p className="text-gray-700 dark:text-gray-300 text-left">XP: {char.xp} / {1000 * char.level}</p>
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={() => addXp(char.id, 100)}
                    className="flex-1 bg-blue-500 dark:bg-blue-600 text-white py-1 px-2 text-sm rounded hover:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    +100 XP
                  </button>
                  <button
                    onClick={() => levelUp(char.id)}
                    className="flex-1 bg-green-500 dark:bg-green-600 text-white py-1 px-2 text-sm rounded hover:bg-green-600 dark:hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={char.level >= 20 || char.xp < 1000 * char.level}
                  >
                    {char.level >= 20 ? 'Max' : 'Up'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}