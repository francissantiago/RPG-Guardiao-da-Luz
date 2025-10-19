import type { Character } from '../types';

interface CharacterDetailsProps {
  editedCharacter: Character | null;
  setEditedCharacter: React.Dispatch<React.SetStateAction<Character | null>>;
  handleUpdateCharacter: () => void;
}

export default function CharacterDetails({ editedCharacter, setEditedCharacter, handleUpdateCharacter }: CharacterDetailsProps) {
  if (!editedCharacter) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Detalhes do Personagem</h2>
        <p className="text-gray-600 dark:text-gray-400">Selecione um personagem</p>
      </div>
    );
  }

  const pc = Math.min(3000, (editedCharacter.forca + editedCharacter.destreza + (editedCharacter.weapon_attr === 'forca' || editedCharacter.weapon_attr === 'destreza' ? editedCharacter.weapon_bonus : 0)) * 75);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Detalhes do Personagem</h2>
      <div className="space-y-6">
        {/* Informações Básicas */}
        <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
          <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Informações Básicas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium">Nome:</label>
              <input
                type="text"
                value={editedCharacter.name}
                onChange={(e) => setEditedCharacter(prev => prev ? { ...prev, name: e.target.value } : null)}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium">Raça:</label>
              <p className="text-gray-900 dark:text-white mt-2">{editedCharacter.race}</p>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium">Nível:</label>
              <p className="text-gray-900 dark:text-white mt-2">{editedCharacter.level}</p>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium">XP:</label>
              <p className="text-gray-900 dark:text-white mt-2">{editedCharacter.xp}</p>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-gray-700 dark:text-gray-300 font-medium">Pontos Disponíveis:</label>
            <p className="text-gray-900 dark:text-white mt-2">{editedCharacter.pontos_disponiveis}</p>
          </div>
        </div>

        {/* Atributos */}
        <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
          <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Atributos</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400">Força</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{editedCharacter.forca}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400">Destreza</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{editedCharacter.destreza}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400">Constituição</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{editedCharacter.constituicao}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400">Inteligência</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{editedCharacter.inteligencia}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400">Sabedoria</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{editedCharacter.sabedoria}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400">Carisma</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{editedCharacter.carisma}</p>
            </div>
          </div>
        </div>

        {/* Estatísticas Calculadas */}
        <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
          <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Estatísticas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-yellow-100 dark:bg-yellow-900 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400">Pontos de Combate</p>
              <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">{pc}/{pc}</p>
            </div>
            <div className="text-center p-4 bg-red-100 dark:bg-red-900 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400">Pontos de Vida</p>
              <p className="text-2xl font-bold text-red-800 dark:text-red-200">{editedCharacter.current_pv ?? Math.min(5000, (editedCharacter.constituicao + (editedCharacter.weapon_attr === 'constituicao' ? editedCharacter.weapon_bonus : 0)) * 250)}/{Math.min(5000, (editedCharacter.constituicao + (editedCharacter.weapon_attr === 'constituicao' ? editedCharacter.weapon_bonus : 0)) * 250)}</p>
            </div>
            <div className="text-center p-4 bg-blue-100 dark:bg-blue-900 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400">Pontos de Energia</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{editedCharacter.current_pe ?? Math.min(2000, ((editedCharacter.inteligencia + editedCharacter.sabedoria + editedCharacter.carisma + (['inteligencia', 'sabedoria', 'carisma'].includes(editedCharacter.weapon_attr) ? editedCharacter.weapon_bonus : 0)) * 33))}/{Math.min(2000, ((editedCharacter.inteligencia + editedCharacter.sabedoria + editedCharacter.carisma + (['inteligencia', 'sabedoria', 'carisma'].includes(editedCharacter.weapon_attr) ? editedCharacter.weapon_bonus : 0)) * 33))}</p>
            </div>
          </div>
        </div>

        {/* Arma */}
        <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
          <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Arma Equipada</h3>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <p className="text-lg font-medium text-gray-900 dark:text-white">{editedCharacter.weapon_name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Bônus: +{editedCharacter.weapon_bonus} {editedCharacter.weapon_attr}</p>
          </div>
        </div>

        {/* Inventário */}
        {editedCharacter.inventory && (
          <div>
            <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Inventário</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
                <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Equipados</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <p><span className="font-medium">Cabeça:</span> {editedCharacter.inventory.equipped.head?.name || 'Nenhum'}</p>
                  <p><span className="font-medium">Corpo:</span> {editedCharacter.inventory.equipped.body?.name || 'Nenhum'}</p>
                  <p><span className="font-medium">Mãos:</span> {editedCharacter.inventory.equipped.hands?.name || 'Nenhum'}</p>
                  <p><span className="font-medium">Pernas:</span> {editedCharacter.inventory.equipped.legs?.name || 'Nenhum'}</p>
                  <p><span className="font-medium">Pés:</span> {editedCharacter.inventory.equipped.feet?.name || 'Nenhum'}</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
                <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Itens</h4>
                {editedCharacter.inventory.items.length > 0 ? (
                  <ul className="space-y-1 text-sm">
                    {editedCharacter.inventory.items.map(item => (
                      <li key={item.id} className="flex justify-between">
                        <span>{item.name} ({item.type})</span>
                        {item.bonus && <span className="text-green-600 dark:text-green-400">+{item.bonus.value} {item.bonus.attr}</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">Nenhum item</p>
                )}
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
                <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Moedas</h4>
                <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{editedCharacter.inventory.currency}</p>
              </div>
            </div>
          </div>
        )}

        <button onClick={handleUpdateCharacter} className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
          Salvar Alterações
        </button>
      </div>
    </div>
  );
}