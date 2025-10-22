
import { useState } from 'react';
import type { Character, Enemy, Campaign } from '../types';
import { useDiceRoller } from '../hooks/useDiceRoller';
import SquareMapGenerator from './SquareMapGenerator';

interface CampaignOverviewProps {
  characters: Character[];
  enemies: Enemy[];
  onUpdateCharacter?: (character: Character) => void;
  activeCampaign: Campaign | null;
  onCreateCampaign: (name: string, mapSize: number) => Promise<void>;
  onEndCampaign: () => Promise<void>;
}

export default function CampaignOverview({ characters, enemies, activeCampaign, onCreateCampaign, onEndCampaign }: CampaignOverviewProps) {
  const dice = useDiceRoller(characters);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [mapSize, setMapSize] = useState(5);
  const [isEndingCampaign, setIsEndingCampaign] = useState(false);

  const handleCreateCampaign = async () => {
    if (!campaignName.trim()) return;
    setIsCreatingCampaign(true);
    try {
      await onCreateCampaign(campaignName, mapSize);
      setCampaignName('');
      setMapSize(5);
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  const handleEndCampaign = async () => {
    if (!confirm('Tem certeza que deseja encerrar esta campanha? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    setIsEndingCampaign(true);
    try {
      await onEndCampaign();
    } finally {
      setIsEndingCampaign(false);
    }
  };

  // Se não há campanha ativa, mostrar tela de criação
  if (!activeCampaign) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              🏰 Nenhuma Campanha Ativa
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Para começar sua aventura, você precisa iniciar uma nova campanha.
              Isso irá gerar um mapa procedural e posicionar seus personagens nele.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <label htmlFor="campaignName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome da Campanha
              </label>
              <input
                id="campaignName"
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Digite o nome da sua campanha..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isCreatingCampaign}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="mapSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tamanho do Mapa
              </label>
              <select
                id="mapSize"
                value={mapSize}
                onChange={(e) => setMapSize(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isCreatingCampaign}
              >
                <option value={3}>Pequeno (3x3 setores)</option>
                <option value={5}>Médio (5x5 setores) - Recomendado</option>
                <option value={7}>Grande (7x7 setores)</option>
                <option value={9}>Enorme (9x9 setores)</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                O tamanho afeta a área explorável e o número de encontros possíveis
              </p>
            </div>

            <button
              onClick={handleCreateCampaign}
              disabled={!campaignName.trim() || isCreatingCampaign}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isCreatingCampaign ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Criando Campanha...
                </>
              ) : (
                <>
                  🚀 Iniciar Nova Campanha
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Se há campanha ativa, mostrar a visão normal da campanha
  return (
    <div className="mx-auto space-y-6">
        {/* Cabeçalho da Campanha */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                🏰 {activeCampaign.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Uma visão completa do estado atual da sua aventura bíblica
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleEndCampaign}
                disabled={isEndingCampaign}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                {isEndingCampaign ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Encerrando...
                  </>
                ) : (
                  <>
                    🏁 Encerrar Campanha
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Linha 2: Mapa + Centro de Rolagem */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mapa da Campanha - Maior espaço */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                �️ Mapa da Campanha
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <SquareMapGenerator size={activeCampaign.map_size} seed={activeCampaign.map_seed} characters={characters} compact={true} />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Mapa procedural • Clique para interagir • Personagens em azul
                </p>
              </div>
            </div>
          </div>

          {/* Centro de Rolagem e Ferramentas (compacto, usa useDiceRoller) */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                🎲 Centro de Rolagem
              </h2>

              <div className="space-y-3">
                {/* Rolagem Manual Compacta */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="font-medium">🎲 Rolagem Manual</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Escolha o dado, quantidade e modificador</div>

                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {dice.diceTypes.map(d => (
                      <button key={d.type} onClick={() => dice.setSelectedDice(d.type)} className={`p-2 rounded-md text-sm ${dice.selectedDice === d.type ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-600 text-gray-800 dark:text-white'}`}>
                        {d.type.replace('d', '')}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 flex gap-2 items-center">
                    <input type="number" min={1} value={dice.quantity} onChange={(e) => dice.setQuantity(parseInt(e.target.value) || 1)} className="w-16 px-2 py-1 rounded-md border" />
                    <input type="number" value={dice.modifier} onChange={(e) => dice.setModifier(parseInt(e.target.value) || 0)} className="w-20 px-2 py-1 rounded-md border" />
                    <button onClick={dice.handleRoll} disabled={dice.isRolling} className="ml-auto bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md">{dice.isRolling ? '🎲...' : 'Rolar'}</button>
                  </div>
                </div>

                {/* Ações Rápidas Compactas */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="font-medium">Ações Rápidas</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Testes rápidos por atributo</div>

                  <div className="mt-3">
                    <select value={dice.selectedPlayerForAction} onChange={(e) => dice.setSelectedPlayerForAction(e.target.value)} className="w-full px-2 py-1 rounded-md border bg-white dark:bg-gray-800 text-sm">
                      <option value="">Selecionar jogador...</option>
                      {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="mt-3 grid grid-cols-4 md:grid-cols-4 gap-2">
                    <button title="Força: quebrar portas, levantar objetos pesados, luta corpo a corpo. Ex: arrombar uma porta trancada ou erguer uma pedra pesada." onClick={() => dice.executeQuickAction('strength')} disabled={!dice.selectedPlayerForAction} className="px-2 py-1 rounded-md bg-red-500 text-white text-xs">💪 Força</button>
                    <button title="Destreza: esquivar, precisão com armas à distância, movimentos ágeis. Ex: desviar de um ataque ou mirar com um arco." onClick={() => dice.executeQuickAction('dexterity')} disabled={!dice.selectedPlayerForAction} className="px-2 py-1 rounded-md bg-orange-500 text-white text-xs">🏃 Destreza</button>
                    <button title="Constituição: resistir a venenos, fadiga e doenças. Ex: aguentar uma noite sem dormir ou resistir a uma toxina." onClick={() => dice.executeQuickAction('constitution')} disabled={!dice.selectedPlayerForAction} className="px-2 py-1 rounded-md bg-green-500 text-white text-xs">❤️ Constituição</button>
                    <button title="Inteligência: resolver enigmas e recordar conhecimentos. Ex: decifrar uma inscrição antiga ou identificar uma poção." onClick={() => dice.executeQuickAction('intelligence')} disabled={!dice.selectedPlayerForAction} className="px-2 py-1 rounded-md bg-blue-500 text-white text-xs">🧠 Inteligência</button>
                    <button title="Sabedoria: percepção, intuição e sobrevivência. Ex: sentir uma armadilha ou navegar por terrenos desconhecidos." onClick={() => dice.executeQuickAction('wisdom')} disabled={!dice.selectedPlayerForAction} className="px-2 py-1 rounded-md bg-purple-500 text-white text-xs">👁️ Sabedoria</button>
                    <button title="Carisma: persuasão, enganação e liderança. Ex: convencer um guarda a deixar passar." onClick={() => dice.executeQuickAction('charisma')} disabled={!dice.selectedPlayerForAction} className="px-2 py-1 rounded-md bg-pink-500 text-white text-xs">🎭 Carisma</button>

                    <button title="Percepção: notar detalhes, armadilhas e pistas. Ex: perceber uma passagem escondida ou uma inscrição oculta." onClick={() => dice.executeQuickAction('perception')} disabled={!dice.selectedPlayerForAction} className="px-2 py-1 rounded-md bg-indigo-500 text-white text-xs">👀 Percepção</button>
                    <button title="Furtividade: mover-se sem ser detectado. Ex: entrar num acampamento sem acordar sentinelas." onClick={() => dice.executeQuickAction('stealth')} disabled={!dice.selectedPlayerForAction} className="px-2 py-1 rounded-md bg-emerald-500 text-white text-xs">👤 Furtividade</button>
                    <button title="Persuasão: convencer, negociar e liderar. Ex: barganhar um preço melhor ou convencer alguém a ajudar." onClick={() => dice.executeQuickAction('persuasion')} disabled={!dice.selectedPlayerForAction} className="px-2 py-1 rounded-md bg-teal-500 text-white text-xs">💬 Persuasão</button>
                    <button title="Enganação: mentir, disfarçar e blefar. Ex: fingir ser um mercador ou enganar um interrogador." onClick={() => dice.executeQuickAction('deception')} disabled={!dice.selectedPlayerForAction} className="px-2 py-1 rounded-md bg-yellow-600 text-white text-xs">🎭 Enganação</button>

                    <button title="Atletismo: correr, nadar, escalar, saltar. Ex: escalar um muro alto ou nadar através de um rio forte." onClick={() => dice.executeQuickAction('athletics')} disabled={!dice.selectedPlayerForAction} className="px-2 py-1 rounded-md bg-red-600 text-white text-xs">🏋️ Atletismo</button>
                    <button title="Acrobacia: manobras ágeis, equilíbrio e parkour. Ex: saltar entre telhados ou se equilibrar em uma corda." onClick={() => dice.executeQuickAction('acrobatics')} disabled={!dice.selectedPlayerForAction} className="px-2 py-1 rounded-md bg-orange-600 text-white text-xs">🤸 Acrobacia</button>
                    <button title="Sobrevivência: rastrear, caçar, orientar-se na natureza. Ex: seguir pegadas na floresta ou encontrar água." onClick={() => dice.executeQuickAction('survival')} disabled={!dice.selectedPlayerForAction} className="px-2 py-1 rounded-md bg-green-600 text-white text-xs">🏕️ Sobrevivência</button>
                    <button title="Investigação: examinar pistas, procurar itens escondidos. Ex: investigar uma cena ou encontrar armadilhas." onClick={() => dice.executeQuickAction('investigation')} disabled={!dice.selectedPlayerForAction} className="px-2 py-1 rounded-md bg-blue-600 text-white text-xs">🔎 Investigação</button>
                    <button title="Performance: cantar, dançar, atuar, entreter. Ex: entreter uma plateia para distrair guardas." onClick={() => dice.executeQuickAction('performance')} disabled={!dice.selectedPlayerForAction} className="px-2 py-1 rounded-md bg-purple-600 text-white text-xs">🎪 Performance</button>
                    <button title="Ofício: criar itens, reparar equipamentos, artesanato. Ex: forjar uma espada ou consertar uma armadura." onClick={() => dice.executeQuickAction('crafting')} disabled={!dice.selectedPlayerForAction} className="px-2 py-1 rounded-md bg-amber-600 text-white text-xs">🔨 Ofício</button>
                  </div>

                  {dice.lastQuickAction && (
                    <div className={`mt-3 p-2 rounded text-sm ${dice.lastQuickAction.success ? 'bg-green-50 dark:bg-green-900' : 'bg-red-50 dark:bg-red-900'}`}>
                      <div className="font-medium">{dice.lastQuickAction.actionName} • {dice.lastQuickAction.playerName}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">D20: {dice.lastQuickAction.rollResult} {dice.lastQuickAction.modifier !== 0 && `+ ${dice.lastQuickAction.modifier}`} = {dice.lastQuickAction.total}</div>
                    </div>
                  )}
                </div>

                {/* Histórico e Estatísticas em duas colunas compactas */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <div className="font-medium">Histórico</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-h-28 overflow-y-auto">
                      {dice.rollHistory.length === 0 ? <div className="text-xs">Nenhuma rolagem</div> : dice.rollHistory.slice(0,6).map((r, i) => (
                        <div key={i} className="text-xs py-1 border-b last:border-b-0">{r.dice.toUpperCase()}: {r.result} • {r.rolls.join(', ')}</div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="font-medium">Estatísticas</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      <div className="flex justify-between"><span>Total:</span><span>{dice.stats.totalRolls}</span></div>
                      <div className="flex justify-between"><span>Média d20:</span><span>{dice.stats.avgD20.toFixed(1)}</span></div>
                      <div className="flex justify-between"><span>Críticos:</span><span className="text-green-600">{dice.stats.crits}</span></div>
                      <div className="flex justify-between"><span>Falhas:</span><span className="text-red-600">{dice.stats.fails}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Linha 3: Personagens Horizontalmente */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            👥 Personagens ({characters.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {characters.map((char) => (
              <div key={char.id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shadow-sm" style={{ minWidth: '240px' }}>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 flex-shrink-0 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 font-bold text-lg">
                    {char.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-lg text-gray-900 dark:text-white">{char.name}</p>
                      <span className="text-sm bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">Nv. {char.level}</span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
                      <div>
                        <div className="font-medium">PC</div>
                        <div className="mt-1">
                          {(() => {
                            const maxPc = Math.min(3000, (char.forca + char.destreza + (char.weapon_attr === 'forca' || char.weapon_attr === 'destreza' ? char.weapon_bonus : 0)) * 75);
                            const currentPc = (char as any).current_pc ?? maxPc;
                            const pcPercent = Math.round((currentPc / maxPc) * 100);
                            return (
                              <div className="relative flex-1 h-3 rounded" style={{ background: `linear-gradient(to right, #eab308 0%, #eab308 ${pcPercent}%, #e5e7eb ${pcPercent}%, #e5e7eb 100%)` }}>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">{currentPc}/{maxPc}</span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      <div>
                        <div className="font-medium">PV</div>
                        <div className="mt-1">
                          {(() => {
                            const maxPv = Math.min(5000, (char.constituicao + (char.weapon_attr === 'constituicao' ? char.weapon_bonus : 0)) * 250);
                            const currentPv = char.current_pv ?? maxPv;
                            const pvPercent = Math.round((currentPv / maxPv) * 100);
                            return (
                              <div className="relative flex-1 h-3 rounded" style={{ background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${pvPercent}%, #e5e7eb ${pvPercent}%, #e5e7eb 100%)` }}>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">{currentPv}/{maxPv}</span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      <div>
                        <div className="font-medium">PE</div>
                        <div className="mt-1">
                          {(() => {
                            const maxPe = Math.min(2000, ((char.inteligencia + char.sabedoria + char.carisma + (['inteligencia', 'sabedoria', 'carisma'].includes(char.weapon_attr) ? char.weapon_bonus : 0)) * 33));
                            const currentPe = char.current_pe ?? maxPe;
                            const pePercent = Math.round((currentPe / maxPe) * 100);
                            return (
                              <div className="relative flex-1 h-3 rounded" style={{ background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${pePercent}%, #e5e7eb ${pePercent}%, #e5e7eb 100%)` }}>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">{currentPe}/{maxPe}</span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      <div>
                        <div className="font-medium">XP</div>
                        <div className="mt-1">
                          {(() => {
                            const requiredXp = 1000 * char.level;
                            const xpPercent = Math.min(100, Math.round((char.xp / requiredXp) * 100));
                            return (
                              <div className="relative flex-1 h-3 rounded" style={{ background: `linear-gradient(to right, #10b981 0%, #10b981 ${xpPercent}%, #ffffff ${xpPercent}%, #ffffff 100%)` }}>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-900">{char.xp}/{requiredXp}</span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      Local: {char.location ? `(${char.location.x}, ${char.location.y})` : '—'}
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { dice.setSelectedPlayerForAction(String(char.id)); dice.executeQuickAction('strength'); }}
                          className="px-2 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white text-xs"
                        >
                          💪 Força
                        </button>
                        <button
                          onClick={() => { dice.setSelectedPlayerForAction(String(char.id)); dice.executeQuickAction('dexterity'); }}
                          className="px-2 py-1 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-xs"
                        >
                          🏃 Destreza
                        </button>
                        <button
                          onClick={() => { dice.setSelectedPlayerForAction(String(char.id)); dice.executeQuickAction('constitution'); }}
                          className="px-2 py-1 rounded-md bg-green-500 hover:bg-green-600 text-white text-xs"
                        >
                          ❤️ Constituição
                        </button>
                      </div>

                      <div className="text-xxs text-gray-400 text-right">
                        <div className="text-xs font-medium">Batalha (PVP/PVE)</div>
                        <div className="text-[10px]">Em desenvolvimento</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Linha 4: Inimigos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            ⚔️ Inimigos Ativos ({enemies.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {enemies.length > 0 ? (
              enemies.map((enemy) => (
                <div key={enemy.id} className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">{enemy.name}</span>
                    <span className="text-sm bg-red-100 dark:bg-red-800 px-2 py-1 rounded">
                      Nv. {enemy.level}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    PV: {enemy.current_pv} • PE: {enemy.current_pe}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {enemy.weapon_name} (+{enemy.weapon_bonus} {enemy.weapon_attr})
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Nenhum inimigo ativo</p>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}