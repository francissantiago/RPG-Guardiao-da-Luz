import { useState, useMemo } from 'react';
import type { Character } from '../types';

type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

interface RollResult {
  dice: DiceType;
  result: number;
  max: number;
  rolls: number[];
  modifier: number;
}

export function useDiceRoller(characters: Character[]) {
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

    setTimeout(() => {
      const result = rollDice(selectedDice, quantity, modifier);
      setLastRoll(result);
      setRollHistory(prev => [result, ...prev.slice(0, 9)]);
      setIsRolling(false);
    }, 300);
  };

  const executeQuickAction = (actionType: string) => {
    if (!selectedPlayerForAction) return;

    const player = characters.find(c => c.id === parseInt(selectedPlayerForAction));
    if (!player) return;

    let mod = 0;
    let actionName = '';

    switch (actionType) {
      case 'strength':
        mod = Math.floor((player.forca - 10) / 2);
        actionName = 'Teste de Força';
        break;
      case 'dexterity':
        mod = Math.floor((player.destreza - 10) / 2);
        actionName = 'Teste de Destreza';
        break;
      case 'constitution':
        mod = Math.floor((player.constituicao - 10) / 2);
        actionName = 'Teste de Constituição';
        break;
      case 'intelligence':
        mod = Math.floor((player.inteligencia - 10) / 2);
        actionName = 'Teste de Inteligência';
        break;
      case 'wisdom':
        mod = Math.floor((player.sabedoria - 10) / 2);
        actionName = 'Teste de Sabedoria';
        break;
      case 'charisma':
        mod = Math.floor((player.carisma - 10) / 2);
        actionName = 'Teste de Carisma';
        break;
      case 'perception':
        mod = Math.floor((player.sabedoria - 10) / 2);
        actionName = 'Percepção';
        break;
      case 'stealth':
        mod = Math.floor((player.destreza - 10) / 2);
        actionName = 'Furtividade';
        break;
      case 'persuasion':
        mod = Math.floor((player.carisma - 10) / 2);
        actionName = 'Persuasão';
        break;
      case 'deception':
        mod = Math.floor((player.carisma - 10) / 2);
        actionName = 'Enganação';
        break;
      case 'athletics':
        mod = Math.floor((player.forca - 10) / 2);
        actionName = 'Atletismo';
        break;
      case 'acrobatics':
        mod = Math.floor((player.destreza - 10) / 2);
        actionName = 'Acrobacia';
        break;
      case 'survival':
        mod = Math.floor((player.sabedoria - 10) / 2);
        actionName = 'Sobrevivência';
        break;
      case 'investigation':
        mod = Math.floor((player.inteligencia - 10) / 2);
        actionName = 'Investigação';
        break;
      case 'performance':
        mod = Math.floor((player.carisma - 10) / 2);
        actionName = 'Performance';
        break;
      case 'crafting':
        mod = Math.floor((player.inteligencia - 10) / 2);
        actionName = 'Ofício';
        break;
      default:
        return;
    }

    const roll = rollDice('d20', 1, mod);
    const rollResult = roll.rolls[0];
    const total = roll.result;
    const difficulty = 10;
    const success = total >= difficulty;

    let description = '';
    if (success) {
      description = `✅ Sucesso! ${player.name} conseguiu realizar a ação com resultado ${total} (dificuldade: ${difficulty}).`;
    } else {
      description = `❌ Falha! ${player.name} não conseguiu realizar a ação com resultado ${total} (dificuldade: ${difficulty}).`;
    }

    setLastQuickAction({
      playerName: player.name,
      actionName,
      rollResult,
      modifier: mod,
      total,
      success,
      description
    });

    setRollHistory(prev => [{ ...roll, dice: 'd20' as DiceType }, ...prev.slice(0, 9)]);
  };

  const stats = useMemo(() => {
    const totalRolls = rollHistory.length;
    const d20rolls = rollHistory.filter(r => r.dice === 'd20');
    const avgD20 = d20rolls.length > 0 ? (d20rolls.reduce((s, r) => s + r.result, 0) / d20rolls.length) : 0;
    const crits = d20rolls.filter(r => r.rolls[0] === 20).length;
    const fails = d20rolls.filter(r => r.rolls[0] === 1).length;
    return { totalRolls, avgD20, crits, fails };
  }, [rollHistory]);

  return {
    // state
    selectedDice,
    setSelectedDice,
    quantity,
    setQuantity,
    modifier,
    setModifier,
    isRolling,
    lastRoll,
    rollHistory,
    selectedPlayerForAction,
    setSelectedPlayerForAction,
    lastQuickAction,
    diceTypes,
    // actions
    handleRoll,
    executeQuickAction,
    // computed
    stats,
  } as const;
}

export type UseDiceRollerReturn = ReturnType<typeof useDiceRoller>;
