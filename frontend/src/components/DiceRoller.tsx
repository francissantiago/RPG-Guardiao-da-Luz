import { useState } from 'react';
import type { Character, Enemy } from '../types';

interface DiceRollerProps {
  characters: Character[];
  enemies: Enemy[];
  onUpdateCharacter: (character: Character) => void;
}

type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

interface RollResult {
  dice: DiceType;
  result: number;
  max: number;
  rolls: number[];
  modifier: number;
}

export default function DiceRoller({ characters }: DiceRollerProps) {
  const [selectedDice, setSelectedDice] = useState<DiceType>('d20');
  const [quantity, setQuantity] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState<RollResult | null>(null);
  const [rollHistory, setRollHistory] = useState<RollResult[]>([]);

  // Estados para ações rápidas
  const [selectedPlayerForAction, setSelectedPlayerForAction] = useState<string>('');
  const [lastQuickAction, setLastQuickAction] = useState<{
    playerName: string;
    actionName: string;
    rollResult: number;
    modifier: number;
    total: number;
    success: boolean;
    description: string;
  } | null>(null);

  const diceTypes: { type: DiceType; icon: string; description: string }[] = [
    { type: 'd4', icon: '🎲', description: 'Dado de 4 faces' },
    { type: 'd6', icon: '🎲', description: 'Dado de 6 faces' },
    { type: 'd8', icon: '🎲', description: 'Dado de 8 faces' },
    { type: 'd10', icon: '🎲', description: 'Dado de 10 faces' },
    { type: 'd12', icon: '🎲', description: 'Dado de 12 faces' },
    { type: 'd20', icon: '🎲', description: 'Dado de 20 faces' },
    { type: 'd100', icon: '🎲', description: 'Dado de 100 faces' },
  ];

  const rollDice = (dice: DiceType, qty: number = 1, mod: number = 0): RollResult => {
    const max = parseInt(dice.substring(1));
    const rolls: number[] = [];

    for (let i = 0; i < qty; i++) {
      rolls.push(Math.floor(Math.random() * max) + 1);
    }

    const total = rolls.reduce((sum, roll) => sum + roll, 0) + mod;

    return {
      dice,
      result: total,
      max,
      rolls,
      modifier: mod,
    };
  };

  const handleRoll = async () => {
    setIsRolling(true);

    // Animação de rolagem
    setTimeout(() => {
      const result = rollDice(selectedDice, quantity, modifier);
      setLastRoll(result);
      setRollHistory(prev => [result, ...prev.slice(0, 9)]); // Mantém apenas os últimos 10
      setIsRolling(false);
    }, 1000);
  };

  // Função para executar ações rápidas
  const executeQuickAction = (actionType: string) => {
    if (!selectedPlayerForAction) return;

    const player = characters.find(c => c.id === parseInt(selectedPlayerForAction));
    if (!player) return;

    let modifier = 0;
    let actionName = '';

    switch (actionType) {
      case 'strength':
        modifier = Math.floor((player.forca - 10) / 2);
        actionName = 'Teste de Força';
        break;
      case 'dexterity':
        modifier = Math.floor((player.destreza - 10) / 2);
        actionName = 'Teste de Destreza';
        break;
      case 'constitution':
        modifier = Math.floor((player.constituicao - 10) / 2);
        actionName = 'Teste de Constituição';
        break;
      case 'intelligence':
        modifier = Math.floor((player.inteligencia - 10) / 2);
        actionName = 'Teste de Inteligência';
        break;
      case 'wisdom':
        modifier = Math.floor((player.sabedoria - 10) / 2);
        actionName = 'Teste de Sabedoria';
        break;
      case 'charisma':
        modifier = Math.floor((player.carisma - 10) / 2);
        actionName = 'Teste de Carisma';
        break;
      case 'perception':
        modifier = Math.floor((player.sabedoria - 10) / 2);
        actionName = 'Percepção';
        break;
      case 'stealth':
        modifier = Math.floor((player.destreza - 10) / 2);
        actionName = 'Furtividade';
        break;
      case 'persuasion':
        modifier = Math.floor((player.carisma - 10) / 2);
        actionName = 'Persuasão';
        break;
      case 'deception':
        modifier = Math.floor((player.carisma - 10) / 2);
        actionName = 'Enganação';
        break;
      case 'athletics':
        modifier = Math.floor((player.forca - 10) / 2);
        actionName = 'Atletismo';
        break;
      case 'acrobatics':
        modifier = Math.floor((player.destreza - 10) / 2);
        actionName = 'Acrobacia';
        break;
      case 'survival':
        modifier = Math.floor((player.sabedoria - 10) / 2);
        actionName = 'Sobrevivência';
        break;
      case 'investigation':
        modifier = Math.floor((player.inteligencia - 10) / 2);
        actionName = 'Investigação';
        break;
      case 'performance':
        modifier = Math.floor((player.carisma - 10) / 2);
        actionName = 'Performance';
        break;
      case 'crafting':
        modifier = Math.floor((player.inteligencia - 10) / 2);
        actionName = 'Ofício';
        break;
      default:
        return;
    }

    const roll = rollDice('d20', 1, modifier);
    const rollResult = roll.rolls[0];
    const total = roll.result;
    const difficulty = 10; // Dificuldade média
    const success = total >= difficulty;

    let description = '';
    if (success) {
      description = `✅ Sucesso! ${player.name} conseguiu realizar a ação com resultado ${total} (dificuldade: ${difficulty}).`;
    } else {
      description = `❌ Falha! ${player.name} não conseguiu realizar a ação com resultado ${total} (dificuldade: ${difficulty}).`;
    }

    // Atualizar estado da última ação rápida
    setLastQuickAction({
      playerName: player.name,
      actionName,
      rollResult,
      modifier,
      total,
      success,
      description
    });

    // Adicionar ao histórico com informações da ação
    setRollHistory(prev => [{
      ...roll,
      dice: 'd20' as DiceType
    }, ...prev.slice(0, 9)]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white text-center">
        🎲 Rolagem de Dados
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seção de Rolagem */}
        <div className="lg:col-span-2 space-y-6">
          {/* Rolagem Manual (Avançado) */}
          <details className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <summary className="text-lg font-medium mb-4 text-gray-900 dark:text-white cursor-pointer list-none">
              🎲 Rolagem Manual (Avançado)
            </summary>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Use para rolagens customizadas, dano variável, NPCs, monstros ou situações especiais não cobertas pelas ações rápidas automatizadas.
            </p>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-3 mb-4">
              {diceTypes.map(({ type, icon }) => (
                <button
                  key={type}
                  onClick={() => setSelectedDice(type)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedDice === type
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className="text-sm font-medium">{type.toUpperCase()}</div>
                </button>
              ))}
            </div>

            {/* Controles de Rolagem */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantidade
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Modificador
                </label>
                <input
                  type="number"
                  value={modifier}
                  onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleRoll}
                  disabled={isRolling}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  {isRolling ? '🎲 Rolando...' : '🎲 Rolar Dados'}
                </button>
              </div>
            </div>
          </details>

          {/* Resultado da Rolagem */}
          {lastRoll && (
            <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg border border-green-200 dark:border-green-700">
              <h3 className="text-lg font-medium mb-2 text-green-800 dark:text-green-200">
                Resultado: {lastRoll.result}
              </h3>
              <div className="text-sm text-green-700 dark:text-green-300">
                {lastRoll.rolls.length > 1 ? (
                  <span>Rolagens individuais: {lastRoll.rolls.join(' + ')} {lastRoll.rolls.length > 1 && `+ ${lastRoll.modifier || 0}`}</span>
                ) : (
                  <span>{lastRoll.dice.toUpperCase()}: {lastRoll.rolls[0]} {modifier !== 0 && `+ ${modifier}`}</span>
                )}
              </div>
            </div>
          )}

          {/* Resultado da Última Ação Rápida */}
          {lastQuickAction && (
            <div className={`p-4 rounded-lg border ${
              lastQuickAction.success
                ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700'
                : 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700'
            }`}>
              <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                <span className="text-2xl">
                  {lastQuickAction.success ? '✅' : '❌'}
                </span>
                <span className={
                  lastQuickAction.success
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                }>
                  {lastQuickAction.actionName}
                </span>
              </h3>
              <div className={`text-sm mb-2 ${
                lastQuickAction.success
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-red-700 dark:text-red-300'
              }`}>
                {lastQuickAction.description}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                🎲 D20: {lastQuickAction.rollResult} {lastQuickAction.modifier !== 0 && `+ ${lastQuickAction.modifier}`} = {lastQuickAction.total}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                💡 Em RPG, você rola um d20 e soma modificadores. Resultado ≥ 10 geralmente significa sucesso em tarefas médias.
              </div>
            </div>
          )}

          {/* Resultado Consolidado de Todas as Rolagens */}
          {(lastRoll || lastQuickAction) && (
            <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
              <h3 className="text-lg font-medium mb-2 text-purple-800 dark:text-purple-200">
                🎲 Última Rolagem Executada
              </h3>
              <div className="text-sm text-purple-700 dark:text-purple-300">
                {lastRoll && (
                  <div className="mb-2">
                    <strong>Rolagem Manual:</strong> {lastRoll.dice.toUpperCase()} = {lastRoll.result}
                    {lastRoll.rolls.length > 1 && ` (${lastRoll.rolls.join(' + ')})`}
                  </div>
                )}
                {lastQuickAction && (
                  <div className="mb-2">
                    <strong>Ação Rápida:</strong> {lastQuickAction.actionName} - {lastQuickAction.playerName}
                    (D20: {lastQuickAction.rollResult} + {lastQuickAction.modifier} = {lastQuickAction.total})
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ações Rápidas */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Ações Rápidas</h3>

            {/* Seletor de Jogador */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selecionar Jogador:
              </label>
              <select
                value={selectedPlayerForAction}
                onChange={(e) => setSelectedPlayerForAction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="">Escolher jogador...</option>
                {characters.map(char => (
                  <option key={char.id} value={char.id}>{char.name}</option>
                ))}
              </select>
            </div>

            {/* Ações Disponíveis */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {/* Testes de Atributo */}
              <button
                onClick={() => executeQuickAction('strength')}
                disabled={!selectedPlayerForAction}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-2 py-2 rounded-md text-xs font-medium transition-colors flex flex-col items-center"
                title="Força: Quebrar portas, levantar objetos pesados, lutar corpo a corpo. Ex: Arrombar uma porta trancada ou erguer uma pedra pesada."
              >
                <span className="text-lg">💪</span>
                <span>Força</span>
              </button>
              <button
                onClick={() => executeQuickAction('dexterity')}
                disabled={!selectedPlayerForAction}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-2 py-2 rounded-md text-xs font-medium transition-colors flex flex-col items-center"
                title="Destreza: Esquivar, usar armas à distância, furtividade. Ex: Desviar de um ataque ou mirar com um arco."
              >
                <span className="text-lg">🏃</span>
                <span>Destreza</span>
              </button>
              <button
                onClick={() => executeQuickAction('constitution')}
                disabled={!selectedPlayerForAction}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-2 py-2 rounded-md text-xs font-medium transition-colors flex flex-col items-center"
                title="Constituição: Resistir venenos, fadiga, doenças. Ex: Aguentar uma noite sem dormir ou resistir a uma toxina."
              >
                <span className="text-lg">❤️</span>
                <span>Constituição</span>
              </button>
              <button
                onClick={() => executeQuickAction('intelligence')}
                disabled={!selectedPlayerForAction}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-2 py-2 rounded-md text-xs font-medium transition-colors flex flex-col items-center"
                title="Inteligência: Resolver enigmas, recordar conhecimentos. Ex: Decifrar uma inscrição antiga ou identificar uma poção."
              >
                <span className="text-lg">🧠</span>
                <span>Inteligência</span>
              </button>
              <button
                onClick={() => executeQuickAction('wisdom')}
                disabled={!selectedPlayerForAction}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-2 py-2 rounded-md text-xs font-medium transition-colors flex flex-col items-center"
                title="Sabedoria: Percepção, intuição, sobrevivência. Ex: Sentir uma armadilha ou navegar por terrenos desconhecidos."
              >
                <span className="text-lg">👁️</span>
                <span>Sabedoria</span>
              </button>
              <button
                onClick={() => executeQuickAction('charisma')}
                disabled={!selectedPlayerForAction}
                className="bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-2 py-2 rounded-md text-xs font-medium transition-colors flex flex-col items-center"
                title="Carisma: Persuasão, enganação, liderança. Ex: Convencer um guarda a deixar passar ou intimidar um bandido."
              >
                <span className="text-lg">🎭</span>
                <span>Carisma</span>
              </button>

              {/* Habilidades */}
              <button
                onClick={() => executeQuickAction('perception')}
                disabled={!selectedPlayerForAction}
                className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-2 py-2 rounded-md text-xs font-medium transition-colors flex flex-col items-center"
                title="Percepção: Notar detalhes, ouvir sons distantes, detectar ameaças. Ex: Ouvir passos atrás de uma porta ou encontrar pistas escondidas."
              >
                <span className="text-lg">🔍</span>
                <span>Percepção</span>
              </button>
              <button
                onClick={() => executeQuickAction('stealth')}
                disabled={!selectedPlayerForAction}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-2 py-2 rounded-md text-xs font-medium transition-colors flex flex-col items-center"
                title="Furtividade: Mover-se silenciosamente, esconder-se. Ex: Passar despercebido por guardas ou se esconder em arbustos."
              >
                <span className="text-lg">👤</span>
                <span>Furtividade</span>
              </button>
              <button
                onClick={() => executeQuickAction('persuasion')}
                disabled={!selectedPlayerForAction}
                className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-2 py-2 rounded-md text-xs font-medium transition-colors flex flex-col items-center"
                title="Persuasão: Convencer, negociar, liderar. Ex: Barganhar um preço melhor ou convencer alguém a ajudar."
              >
                <span className="text-lg">💬</span>
                <span>Persuasão</span>
              </button>
              <button
                onClick={() => executeQuickAction('deception')}
                disabled={!selectedPlayerForAction}
                className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-2 py-2 rounded-md text-xs font-medium transition-colors flex flex-col items-center"
                title="Enganação: Mentir, disfarçar, blefar. Ex: Fingir ser um mercador ou enganar um interrogador."
              >
                <span className="text-lg">🎭</span>
                <span>Enganação</span>
              </button>
              <button
                onClick={() => executeQuickAction('athletics')}
                disabled={!selectedPlayerForAction}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-2 py-2 rounded-md text-xs font-medium transition-colors flex flex-col items-center"
                title="Atletismo: Correr, nadar, escalar, saltar. Ex: Escalar um muro alto ou nadar através de um rio forte."
              >
                <span className="text-lg">🏋️</span>
                <span>Atletismo</span>
              </button>
              <button
                onClick={() => executeQuickAction('acrobatics')}
                disabled={!selectedPlayerForAction}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-2 py-2 rounded-md text-xs font-medium transition-colors flex flex-col items-center"
                title="Acrobacia: Manobras ágeis, equilíbrio, parkour. Ex: Saltar entre telhados ou se equilibrar em uma corda."
              >
                <span className="text-lg">🤸</span>
                <span>Acrobacia</span>
              </button>
              <button
                onClick={() => executeQuickAction('survival')}
                disabled={!selectedPlayerForAction}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-2 py-2 rounded-md text-xs font-medium transition-colors flex flex-col items-center"
                title="Sobrevivência: Rastrear, caçar, orientar-se na natureza. Ex: Seguir pegadas na floresta ou encontrar comida selvagem."
              >
                <span className="text-lg">🏕️</span>
                <span>Sobrevivência</span>
              </button>
              <button
                onClick={() => executeQuickAction('investigation')}
                disabled={!selectedPlayerForAction}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-2 py-2 rounded-md text-xs font-medium transition-colors flex flex-col items-center"
                title="Investigação: Examinar pistas, procurar itens escondidos. Ex: Investigar uma cena de crime ou procurar armadilhas."
              >
                <span className="text-lg">🔎</span>
                <span>Investigação</span>
              </button>
              <button
                onClick={() => executeQuickAction('performance')}
                disabled={!selectedPlayerForAction}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-2 py-2 rounded-md text-xs font-medium transition-colors flex flex-col items-center"
                title="Performance: Cantar, dançar, tocar instrumentos, atuar. Ex: Entreter uma plateia ou distrair guardas com uma música."
              >
                <span className="text-lg">🎪</span>
                <span>Performance</span>
              </button>
              <button
                onClick={() => executeQuickAction('crafting')}
                disabled={!selectedPlayerForAction}
                className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-2 py-2 rounded-md text-xs font-medium transition-colors flex flex-col items-center"
                title="Ofício: Criar itens, reparar equipamentos, artesanato. Ex: Forjar uma espada ou preparar uma poção mágica."
              >
                <span className="text-lg">🔨</span>
                <span>Ofício</span>
              </button>
            </div>

            {!selectedPlayerForAction && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Selecione um jogador para usar as ações rápidas
              </p>
            )}
          </div>


        </div>

        {/* Histórico de Rolagens */}
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Histórico</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {rollHistory.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhuma rolagem ainda</p>
              ) : (
                rollHistory.map((roll, index) => (
                  <div key={index} className="bg-white dark:bg-gray-600 p-2 rounded text-sm">
                    <div className="font-medium">{roll.dice.toUpperCase()}: {roll.result}</div>
                    <div className="text-gray-600 dark:text-gray-400 text-xs">
                      {roll.rolls.join(', ')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Estatísticas */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Estatísticas</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total de rolagens:</span>
                <span className="font-medium">{rollHistory.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Média d20:</span>
                <span className="font-medium">
                  {rollHistory.filter(r => r.dice === 'd20').length > 0
                    ? (rollHistory.filter(r => r.dice === 'd20').reduce((sum, r) => sum + r.result, 0) / rollHistory.filter(r => r.dice === 'd20').length).toFixed(1)
                    : '0.0'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span>Críticos (20):</span>
                <span className="font-medium text-green-600">
                  {rollHistory.filter(r => r.dice === 'd20' && r.rolls[0] === 20).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Falhas (1):</span>
                <span className="font-medium text-red-600">
                  {rollHistory.filter(r => r.dice === 'd20' && r.rolls[0] === 1).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}