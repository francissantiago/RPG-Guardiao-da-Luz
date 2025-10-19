import { useState } from 'react';
import type { Enemy, Character } from '../types';

interface EnemyListProps {
    enemies: Enemy[];
    characters: Character[];
    onCreateEnemy: (enemyData: Omit<Enemy, 'id' | 'current_pv' | 'current_pe'>) => void;
}

export default function EnemyList({ enemies, characters, onCreateEnemy }: EnemyListProps) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
    const [enemyName, setEnemyName] = useState('');

    const generateEnemyFromCharacter = (character: Character, name: string): Omit<Enemy, 'id' | 'current_pv' | 'current_pe'> => {
        // Gera atributos do inimigo baseado no personagem, mas com algumas variações
        const baseVariation = () => Math.floor(Math.random() * 4) - 2; // -2 a +2

        return {
            name,
            level: Math.max(1, character.level + Math.floor(Math.random() * 3) - 1), // ±1 nível
            forca: Math.max(1, character.forca + baseVariation()),
            destreza: Math.max(1, character.destreza + baseVariation()),
            constituicao: Math.max(1, character.constituicao + baseVariation()),
            inteligencia: Math.max(1, character.inteligencia + baseVariation()),
            sabedoria: Math.max(1, character.sabedoria + baseVariation()),
            carisma: Math.max(1, character.carisma + baseVariation()),
            weapon_name: `Arma de ${name}`,
            weapon_attr: character.weapon_attr,
            weapon_bonus: Math.max(1, character.weapon_bonus + Math.floor(Math.random() * 3) - 1), // ±1 bônus
        };
    };

    const handleCreateEnemy = () => {
        if (!selectedCharacter || !enemyName.trim()) return;

        const enemyData = generateEnemyFromCharacter(selectedCharacter, enemyName.trim());
        onCreateEnemy(enemyData);
        setShowCreateModal(false);
        setSelectedCharacter(null);
        setEnemyName('');
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Inimigos</h2>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    + Adicionar Inimigo
                </button>
            </div>

            {/* Modal de criação */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                            Criar Inimigo Automático
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nome do Inimigo
                                </label>
                                <input
                                    type="text"
                                    value={enemyName}
                                    onChange={(e) => setEnemyName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Digite o nome do inimigo"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Personagem de Referência
                                </label>
                                <select
                                    value={selectedCharacter?.id || ''}
                                    onChange={(e) => {
                                        const char = characters.find(c => c.id === parseInt(e.target.value));
                                        setSelectedCharacter(char || null);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">Selecione um personagem...</option>
                                    {characters.map(char => (
                                        <option key={char.id} value={char.id}>
                                            {char.name} (Nível {char.level})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedCharacter && (
                                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        O inimigo será criado com atributos similares ao personagem selecionado:
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>Nível: ~{Math.max(1, selectedCharacter.level + Math.floor(Math.random() * 3) - 1)}</div>
                                        <div>Força: ~{Math.max(1, selectedCharacter.forca + Math.floor(Math.random() * 5) - 2)}</div>
                                        <div>Destreza: ~{Math.max(1, selectedCharacter.destreza + Math.floor(Math.random() * 5) - 2)}</div>
                                        <div>Constituição: ~{Math.max(1, selectedCharacter.constituicao + Math.floor(Math.random() * 5) - 2)}</div>
                                        <div>Inteligência: ~{Math.max(1, selectedCharacter.inteligencia + Math.floor(Math.random() * 5) - 2)}</div>
                                        <div>Sabedoria: ~{Math.max(1, selectedCharacter.sabedoria + Math.floor(Math.random() * 5) - 2)}</div>
                                        <div>Carisma: ~{Math.max(1, selectedCharacter.carisma + Math.floor(Math.random() * 5) - 2)}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setSelectedCharacter(null);
                                    setEnemyName('');
                                }}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateEnemy}
                                disabled={!selectedCharacter || !enemyName.trim()}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                            >
                                Criar Inimigo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enemies.map((enemy) => (
                    <div key={enemy.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                        {/* 1ª linha: Nome */}
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{enemy.name}</h3>

                        {/* 2ª linha: Nível e XP */}
                        <div className="grid grid-cols-2 gap-2 mb-1 text-sm">
                            <p className="text-gray-700 dark:text-gray-300">Nível: {enemy.level}</p>
                            <p className="text-gray-700 dark:text-gray-300">PV: {enemy.current_pv}</p>
                        </div>

                        {/* 3ª linha: PV e PE */}
                        <div className="grid grid-cols-2 gap-2 mb-1 text-sm">
                            <p className="text-gray-700 dark:text-gray-300">XP: {enemy.level * 100}</p>
                            <p className="text-gray-700 dark:text-gray-300">PE: {enemy.current_pe}</p>
                        </div>

                        {/* 4ª linha: Atributos */}
                        <div className="grid grid-cols-2 gap-2 text-sm mt-3 bg-gray-100 dark:bg-gray-500 p-2 rounded-lg shadow-sm">
                            <div>
                                <p className="text-gray-700 dark:text-gray-300">Força: {enemy.forca}</p>
                                <p className="text-gray-700 dark:text-gray-300">Destreza: {enemy.destreza}</p>
                                <p className="text-gray-700 dark:text-gray-300">Constituição: {enemy.constituicao}</p>
                            </div>
                            <div>
                                <p className="text-gray-700 dark:text-gray-300">Inteligência: {enemy.inteligencia}</p>
                                <p className="text-gray-700 dark:text-gray-300">Sabedoria: {enemy.sabedoria}</p>
                                <p className="text-gray-700 dark:text-gray-300">Carisma: {enemy.carisma}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}