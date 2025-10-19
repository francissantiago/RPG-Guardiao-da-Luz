import { useState, useEffect } from 'react'
import './App.css'
import type { Character, Race, Item, Enemy } from './types'
import Sidebar from './components/Sidebar'
import CharacterForm from './components/CharacterForm'
import CharacterList from './components/CharacterList'
import CharacterDetails from './components/CharacterDetails'
import Inventory from './components/Inventory'
import EnemyList from './components/EnemyList'
import DiceRoller from './components/DiceRoller'

function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
      const [currentView, setCurrentView] = useState<'create' | 'view' | 'enemies' | 'dice'>(() => {
    const savedView = localStorage.getItem('currentView') as 'create' | 'view' | 'enemies' | 'dice';
    return savedView || 'view';
  });
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [editedCharacter, setEditedCharacter] = useState<Character | null>(null);
  const [name, setName] = useState('');
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [level, setLevel] = useState(1);
  const [forca, setForca] = useState(0);
  const [destreza, setDestreza] = useState(0);
  const [constituicao, setConstituicao] = useState(0);
  const [inteligencia, setInteligencia] = useState(0);
  const [sabedoria, setSabedoria] = useState(0);
  const [carisma, setCarisma] = useState(0);
  const [pontosDisponiveis, setPontosDisponiveis] = useState(70);
  const [enemies, setEnemies] = useState<Enemy[]>([]);

  useEffect(() => {
    fetchCharacters();
    fetchEnemies();
  }, []);

  useEffect(() => {
    localStorage.setItem('currentView', currentView);
  }, [currentView]);

  useEffect(() => {
    if (selectedRace) {
      setForca(selectedRace.baseStats.forca);
      setDestreza(selectedRace.baseStats.destreza);
      setConstituicao(selectedRace.baseStats.constituicao);
      setInteligencia(selectedRace.baseStats.inteligencia);
      setSabedoria(selectedRace.baseStats.sabedoria);
      setCarisma(selectedRace.baseStats.carisma);
      setPontosDisponiveis(70);
    } else {
      setForca(0);
      setDestreza(0);
      setConstituicao(0);
      setInteligencia(0);
      setSabedoria(0);
      setCarisma(0);
      setPontosDisponiveis(70);
    }
  }, [selectedRace]);

  const fetchCharacters = async () => {
    try {
      const response = await fetch('http://localhost:3001/characters');
      const data = await response.json();
      const charactersWithInventory = await Promise.all(data.characters.map(async (char: Character) => {
        const itemsResponse = await fetch(`http://localhost:3001/characters/${char.id}/items`);
        const itemsData = await itemsResponse.json();
        const equipped: { [key: string]: Item | null } = {
          head: null,
          body: null,
          hands: {
            id: -1, // ID especial para weapon
            name: char.weapon_name,
            type: 'weapon',
            bonus: { attr: char.weapon_attr, value: char.weapon_bonus },
          },
          legs: null,
          feet: null,
        };
        itemsData.items.forEach((ci: any) => {
          const slot = ci.equipped_slot as keyof typeof equipped;
          if (slot && slot in equipped) {
            equipped[slot] = {
              id: ci.item_id,
              name: ci.name,
              type: ci.type,
              bonus: ci.bonus_attr ? { attr: ci.bonus_attr, value: ci.bonus_value } : undefined,
            };
          }
        });
        const inventory = {
          equipped,
          items: itemsData.items.filter((ci: any) => !ci.equipped_slot).map((ci: any) => ({
            id: ci.item_id,
            name: ci.name,
            type: ci.type,
            bonus: ci.bonus_attr ? { attr: ci.bonus_attr, value: ci.bonus_value } : undefined,
          })),
          currency: char.currency,
        };
        return { ...char, inventory };
      }));
      setCharacters(charactersWithInventory);
    } catch (error) {
      console.error('Erro ao buscar personagens:', error);
    }
  };

  const fetchEnemies = async () => {
    try {
      const response = await fetch('http://localhost:3001/enemies');
      const data = await response.json();
      setEnemies(data.enemies);
    } catch (error) {
      console.error('Erro ao buscar inimigos:', error);
    }
  };

  const createEnemy = async (enemyData: Omit<Enemy, 'id' | 'current_pv' | 'current_pc' | 'current_pe'>) => {
    try {
      const response = await fetch('http://localhost:3001/enemies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enemyData),
      });
      if (response.ok) {
        fetchEnemies();
      } else {
        console.error('Erro ao criar inimigo');
      }
    } catch (error) {
      console.error('Erro ao criar inimigo:', error);
    }
  };

  const adjustAttribute = (setter: React.Dispatch<React.SetStateAction<number>>, current: number, delta: number) => {
    if (delta > 0 && (pontosDisponiveis <= 0 || current >= 20)) return;
    if (delta < 0 && current <= 1) return; // Mínimo 1
    setter(current + delta);
    setPontosDisponiveis(pontosDisponiveis - delta);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const effectiveConstituicao = constituicao + (selectedRace?.weapon.attr === 'constituicao' ? selectedRace.weapon.bonus : 0);
      const effectiveInteligencia = inteligencia + (selectedRace?.weapon.attr === 'inteligencia' ? selectedRace.weapon.bonus : 0);
      const effectiveSabedoria = sabedoria + (selectedRace?.weapon.attr === 'sabedoria' ? selectedRace.weapon.bonus : 0);
      const effectiveCarisma = carisma + (selectedRace?.weapon.attr === 'carisma' ? selectedRace.weapon.bonus : 0);
      const max_pv = Math.min(5000, effectiveConstituicao * 250);
      const max_pe = Math.min(2000, (effectiveInteligencia + effectiveSabedoria + effectiveCarisma) * 33);
      const response = await fetch('http://localhost:3001/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          race: selectedRace?.name || '',
          level,
          user_id: 1,
          forca,
          destreza,
          constituicao,
          inteligencia,
          sabedoria,
          carisma,
          pontos_disponiveis: pontosDisponiveis,
          weapon_name: selectedRace?.weapon.name || '',
          weapon_attr: selectedRace?.weapon.attr || '',
          weapon_bonus: selectedRace?.weapon.bonus || 0,
          current_pv: max_pv,
          current_pe: max_pe,
        }),
      });
      if (response.ok) {
        setName('');
        setSelectedRace(null);
        setLevel(1);
        setForca(0);
        setDestreza(0);
        setConstituicao(0);
        setInteligencia(0);
        setSabedoria(0);
        setCarisma(0);
        setPontosDisponiveis(70);
        fetchCharacters();
      }
    } catch (error) {
      console.error('Erro ao criar personagem:', error);
    }
  };

  const levelUp = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3001/characters/${id}/levelup`, {
        method: 'PUT',
      });
      if (response.ok) {
        fetchCharacters();
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Erro ao subir nível:', error);
    }
  };

  const addXp = async (id: number, amount: number) => {
    try {
      const response = await fetch(`http://localhost:3001/characters/${id}/addxp`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });
      if (response.ok) {
        fetchCharacters();
      }
    } catch (error) {
      console.error('Erro ao adicionar XP:', error);
    }
  };

  const handleUpdateCharacter = async () => {
    if (!editedCharacter) return;
    try {
      const response = await fetch(`http://localhost:3001/characters/${editedCharacter.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editedCharacter.name,
          race: editedCharacter.race,
          level: editedCharacter.level,
          forca: editedCharacter.forca,
          destreza: editedCharacter.destreza,
          constituicao: editedCharacter.constituicao,
          inteligencia: editedCharacter.inteligencia,
          sabedoria: editedCharacter.sabedoria,
          carisma: editedCharacter.carisma,
          pontos_disponiveis: editedCharacter.pontos_disponiveis,
          xp: editedCharacter.xp,
          weapon_name: editedCharacter.weapon_name,
          weapon_attr: editedCharacter.weapon_attr,
          weapon_bonus: editedCharacter.weapon_bonus,
          current_pv: editedCharacter.current_pv,
          current_pe: editedCharacter.current_pe,
        }),
      });
      if (response.ok) {
        fetchCharacters();
        setSelectedCharacter(editedCharacter);
      }
    } catch (error) {
      console.error('Erro ao atualizar personagem:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex w-full">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        characters={characters}
        addXp={addXp}
        levelUp={levelUp}
      />
      <main className="flex-1 px-4 py-4">
        {currentView === 'create' ? (
          <CharacterForm
            name={name}
            setName={setName}
            selectedRace={selectedRace}
            setSelectedRace={setSelectedRace}
            forca={forca}
            destreza={destreza}
            constituicao={constituicao}
            inteligencia={inteligencia}
            sabedoria={sabedoria}
            carisma={carisma}
            pontosDisponiveis={pontosDisponiveis}
            adjustAttribute={adjustAttribute}
            setForca={setForca}
            setDestreza={setDestreza}
            setConstituicao={setConstituicao}
            setInteligencia={setInteligencia}
            setSabedoria={setSabedoria}
            setCarisma={setCarisma}
            handleSubmit={handleSubmit}
          />
        ) : currentView === 'enemies' ? (
          <EnemyList enemies={enemies} characters={characters} onCreateEnemy={createEnemy} />
        ) : currentView === 'dice' ? (
          <DiceRoller characters={characters} enemies={enemies} onUpdateCharacter={handleUpdateCharacter} />
        ) : (
          <div className="h-full grid grid-cols-[0.5fr_1fr_1fr] gap-4">
            <CharacterList
              characters={characters}
              selectedCharacter={selectedCharacter}
              onSelectCharacter={(char: Character) => { setSelectedCharacter(char); setEditedCharacter({ ...char }); }}
            />
            <CharacterDetails
              editedCharacter={editedCharacter}
              setEditedCharacter={setEditedCharacter}
              handleUpdateCharacter={handleUpdateCharacter}
            />
            <Inventory selectedCharacter={selectedCharacter} />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
