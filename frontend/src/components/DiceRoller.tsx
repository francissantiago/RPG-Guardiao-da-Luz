import { useDiceRoller } from '../hooks/useDiceRoller';
import type { Character } from '../types';

interface DiceRollerProps {
  characters: Character[];
}

export default function DiceRoller({ characters }: DiceRollerProps) {
  const dice = useDiceRoller(characters);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white text-center">🎲 Rolagem de Dados</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <details className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <summary className="text-lg font-medium mb-4 text-gray-900 dark:text-white cursor-pointer list-none">🎲 Rolagem Manual (Avançado)</summary>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Use para rolagens customizadas, dano variável, NPCs, monstros ou situações especiais não cobertas pelas ações rápidas.</p>

            <div className="grid grid-cols-4 md:grid-cols-7 gap-3 mb-4">
              {dice.diceTypes.map(({ type, icon }) => (
                <button key={type} onClick={() => dice.setSelectedDice(type)} className={`p-3 rounded-lg border-2 transition-all ${dice.selectedDice === type ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'}`}>
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className="text-sm font-medium">{type.toUpperCase()}</div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantidade</label>
                <input type="number" min={1} max={10} value={dice.quantity} onChange={(e) => dice.setQuantity(parseInt(e.target.value) || 1)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Modificador</label>
                <input type="number" value={dice.modifier} onChange={(e) => dice.setModifier(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              </div>
              <div className="flex items-end">
                <button onClick={dice.handleRoll} disabled={dice.isRolling} className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-medium">{dice.isRolling ? '🎲 Rolando...' : '🎲 Rolar Dados'}</button>
              </div>
            </div>
          </details>

          {dice.lastRoll && (
            <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg border border-green-200 dark:border-green-700">
              <h3 className="text-lg font-medium mb-2 text-green-800 dark:text-green-200">Resultado: {dice.lastRoll.result}</h3>
              <div className="text-sm text-green-700 dark:text-green-300">{dice.lastRoll.rolls.join(' + ')} {dice.lastRoll.modifier ? `+ ${dice.lastRoll.modifier}` : ''}</div>
            </div>
          )}

          {dice.lastQuickAction && (
            <div className={`p-4 rounded-lg border ${dice.lastQuickAction.success ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700' : 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700'}`}>
              <h3 className="text-lg font-medium mb-2 flex items-center gap-2"><span className="text-2xl">{dice.lastQuickAction.success ? '✅' : '❌'}</span><span className={dice.lastQuickAction.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>{dice.lastQuickAction.actionName}</span></h3>
              <div className="text-sm mb-2">{dice.lastQuickAction.description}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">🎲 D20: {dice.lastQuickAction.rollResult} {dice.lastQuickAction.modifier !== 0 && `+ ${dice.lastQuickAction.modifier}`} = {dice.lastQuickAction.total}</div>
            </div>
          )}

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Ações Rápidas</h3>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selecionar Jogador:</label>
              <select value={dice.selectedPlayerForAction} onChange={(e) => dice.setSelectedPlayerForAction(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
                <option value="">Escolher jogador...</option>
                {characters.map(char => <option key={char.id} value={char.id}>{char.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              <button title="Força: quebrar portas, levantar objetos pesados, luta corpo a corpo. Ex: arrombar uma porta trancada ou erguer uma pedra pesada." onClick={() => dice.executeQuickAction('strength')} disabled={!dice.selectedPlayerForAction} className="col-span-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-2 py-2 rounded-md text-xs">💪 Força</button>
              <button title="Destreza: esquivar, precisão com armas à distância, movimentos ágeis. Ex: desviar de um ataque ou mirar com um arco." onClick={() => dice.executeQuickAction('dexterity')} disabled={!dice.selectedPlayerForAction} className="col-span-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white px-2 py-2 rounded-md text-xs">🏃 Destreza</button>
              <button title="Constituição: resistir a venenos, fadiga e doenças. Ex: aguentar uma noite sem dormir ou resistir a uma toxina." onClick={() => dice.executeQuickAction('constitution')} disabled={!dice.selectedPlayerForAction} className="col-span-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-2 py-2 rounded-md text-xs">❤️ Constituição</button>
              <button title="Inteligência: resolver enigmas e recordar conhecimentos. Ex: decifrar uma inscrição antiga ou identificar uma poção." onClick={() => dice.executeQuickAction('intelligence')} disabled={!dice.selectedPlayerForAction} className="col-span-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-2 py-2 rounded-md text-xs">🧠 Inteligência</button>
              <button title="Sabedoria: percepção, intuição e sobrevivência. Ex: sentir uma armadilha ou navegar por terrenos desconhecidos." onClick={() => dice.executeQuickAction('wisdom')} disabled={!dice.selectedPlayerForAction} className="col-span-1 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white px-2 py-2 rounded-md text-xs">👁️ Sabedoria</button>
              <button title="Carisma: persuasão, enganação e liderança. Ex: convencer um guarda a deixar passar." onClick={() => dice.executeQuickAction('charisma')} disabled={!dice.selectedPlayerForAction} className="col-span-1 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 text-white px-2 py-2 rounded-md text-xs">🎭 Carisma</button>

              <button title="Percepção: notar detalhes, armadilhas e pistas. Ex: perceber uma passagem escondida ou uma inscrição oculta." onClick={() => dice.executeQuickAction('perception')} disabled={!dice.selectedPlayerForAction} className="col-span-1 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white px-2 py-2 rounded-md text-xs">👀 Percepção</button>
              <button title="Furtividade: mover-se sem ser detectado. Ex: entrar num acampamento sem acordar sentinelas." onClick={() => dice.executeQuickAction('stealth')} disabled={!dice.selectedPlayerForAction} className="col-span-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white px-2 py-2 rounded-md text-xs">👤 Furtividade</button>
              <button title="Persuasão: convencer, negociar e liderar. Ex: barganhar um preço melhor ou convencer alguém a ajudar." onClick={() => dice.executeQuickAction('persuasion')} disabled={!dice.selectedPlayerForAction} className="col-span-1 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 text-white px-2 py-2 rounded-md text-xs">💬 Persuasão</button>
              <button title="Enganação: mentir, disfarçar e blefar. Ex: fingir ser um mercador ou enganar um interrogador." onClick={() => dice.executeQuickAction('deception')} disabled={!dice.selectedPlayerForAction} className="col-span-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-300 text-white px-2 py-2 rounded-md text-xs">🎭 Enganação</button>
              <button title="Atletismo: correr, nadar, escalar, saltar. Ex: escalar um muro alto ou nadar através de um rio forte." onClick={() => dice.executeQuickAction('athletics')} disabled={!dice.selectedPlayerForAction} className="col-span-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-2 py-2 rounded-md text-xs">🏋️ Atletismo</button>
              <button title="Acrobacia: manobras ágeis, equilíbrio, parkour. Ex: saltar entre telhados ou se equilibrar em uma corda." onClick={() => dice.executeQuickAction('acrobatics')} disabled={!dice.selectedPlayerForAction} className="col-span-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white px-2 py-2 rounded-md text-xs">🤸 Acrobacia</button>

              <button title="Sobrevivência: rastrear, caçar, orientar-se na natureza. Ex: seguir pegadas na floresta ou encontrar água." onClick={() => dice.executeQuickAction('survival')} disabled={!dice.selectedPlayerForAction} className="col-span-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-2 py-2 rounded-md text-xs">🏕️ Sobrevivência</button>
              <button title="Investigação: examinar pistas, procurar itens escondidos. Ex: investigar uma cena ou encontrar armadilhas." onClick={() => dice.executeQuickAction('investigation')} disabled={!dice.selectedPlayerForAction} className="col-span-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-2 py-2 rounded-md text-xs">🔎 Investigação</button>
              <button title="Performance: cantar, dançar, atuar, entreter. Ex: entreter uma plateia para distrair guardas." onClick={() => dice.executeQuickAction('performance')} disabled={!dice.selectedPlayerForAction} className="col-span-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-2 py-2 rounded-md text-xs">🎪 Performance</button>
              <button title="Ofício: criar itens, reparar equipamentos, artesanato. Ex: forjar uma espada ou consertar uma armadura." onClick={() => dice.executeQuickAction('crafting')} disabled={!dice.selectedPlayerForAction} className="col-span-1 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 text-white px-2 py-2 rounded-md text-xs">🔨 Ofício</button>
            </div>

            {!dice.selectedPlayerForAction && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Selecione um jogador para usar as ações rápidas</p>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Histórico</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {dice.rollHistory.length === 0 ? <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhuma rolagem ainda</p> : dice.rollHistory.map((r, i) => (
                <div key={i} className="bg-white dark:bg-gray-600 p-2 rounded text-sm">
                  <div className="font-medium">{r.dice.toUpperCase()}: {r.result}</div>
                  <div className="text-gray-600 dark:text-gray-400 text-xs">{r.rolls.join(', ')}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Estatísticas</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Total de rolagens:</span><span className="font-medium">{dice.stats.totalRolls}</span></div>
              <div className="flex justify-between"><span>Média d20:</span><span className="font-medium">{dice.stats.avgD20.toFixed(1)}</span></div>
              <div className="flex justify-between"><span>Críticos (20):</span><span className="font-medium text-green-600">{dice.stats.crits}</span></div>
              <div className="flex justify-between"><span>Falhas (1):</span><span className="font-medium text-red-600">{dice.stats.fails}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}