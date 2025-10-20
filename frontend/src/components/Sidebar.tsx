import type { Character } from '../types';

interface SidebarProps {
  currentView: 'create' | 'view' | 'enemies' | 'dice' | 'maps' | 'campaign';
  setCurrentView: (view: 'create' | 'view' | 'enemies' | 'dice' | 'maps' | 'campaign') => void;
  characters: Character[];
  addXp: (id: number, amount: number) => void;
  levelUp: (id: number) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

export default function Sidebar({ currentView, setCurrentView, characters, addXp, levelUp, isExpanded, setIsExpanded }: SidebarProps) {
  const menuItems = [
    { key: 'create', label: 'Criar Personagem', icon: '➕' },
    { key: 'view', label: 'Ver Personagens', icon: '👥' },
    { key: 'enemies', label: 'Ver Inimigos', icon: '⚔️' },
    { key: 'dice', label: 'Rolar Dados', icon: '🎲' },
    { key: 'maps', label: 'Gerar Mapas', icon: '🗺️' },
    { key: 'campaign', label: 'Campanha', icon: '🏰' },
  ];

  return (
    <aside className={`bg-white dark:bg-gray-800 shadow-md transition-all duration-300 ${isExpanded ? 'w-64' : 'w-16'} flex flex-col`}>
      {/* Header com botão de toggle */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        {isExpanded && <h2 className="text-xl font-bold text-gray-900 dark:text-white">Menu</h2>}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          title={isExpanded ? 'Recolher menu' : 'Expandir menu'}
        >
          {isExpanded ? '◀' : '▶'}
        </button>
      </div>

      {/* Menu Items */}
      <ul className="flex-1 p-2 space-y-2">
        {menuItems.map(({ key, label, icon }) => (
          <li key={key}>
            <button
              className={`w-full ${isExpanded ? 'text-left p-2' : 'p-2 flex justify-center'} hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all ${
                currentView === key ? 'bg-gray-300 dark:bg-gray-600' : ''
              } text-gray-900 dark:text-white`}
              onClick={() => setCurrentView(key as any)}
              title={isExpanded ? '' : label}
            >
              <span className="text-lg">{icon}</span>
              {isExpanded && <span className="ml-2">{label}</span>}
            </button>
          </li>
        ))}
        <li>
          <button
            className={`w-full ${isExpanded ? 'text-left p-2' : 'p-2 flex justify-center'} hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-white`}
            title={isExpanded ? '' : 'Configurações'}
          >
            <span className="text-lg">⚙️</span>
            {isExpanded && <span className="ml-2">Configurações</span>}
          </button>
        </li>
      </ul>

      {/* Seção de Personagens (apenas quando expandido e na view create) */}
      {isExpanded && currentView === 'create' && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Personagens</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {characters.map((char) => (
              <div key={char.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white">{char.name}</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">Nv. {char.level} • XP: {char.xp}</p>
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={() => addXp(char.id, 100)}
                    className="flex-1 bg-blue-500 text-white py-1 px-2 text-xs rounded hover:bg-blue-600"
                  >
                    +100 XP
                  </button>
                  <button
                    onClick={() => levelUp(char.id)}
                    className="flex-1 bg-green-500 text-white py-1 px-2 text-xs rounded hover:bg-green-600 disabled:opacity-50"
                    disabled={char.level >= 20 || char.xp < 1000 * char.level}
                  >
                    Up
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}