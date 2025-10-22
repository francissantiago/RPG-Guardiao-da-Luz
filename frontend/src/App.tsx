import { useState, useEffect } from 'react'
import './App.css'
import { getColorForName, getRandomPaletteColor } from './utils/colors'
import type { Character, Race, Item, Enemy, Campaign } from './types'
import Sidebar from './components/Sidebar'
import CharacterForm from './components/CharacterForm'
import CharacterList from './components/CharacterList'
import CharacterDetails from './components/CharacterDetails'
import Inventory from './components/Inventory'
import EnemyList from './components/EnemyList'
import DiceRoller from './components/DiceRoller'
import SquareMapGenerator from './components/SquareMapGenerator'
import CampaignOverview from './components/CampaignOverview'
import { useToast } from './components/ToastProvider'

function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
      const [currentView, setCurrentView] = useState<'create' | 'view' | 'enemies' | 'dice' | 'maps' | 'campaign'>(() => {
    const savedView = localStorage.getItem('currentView') as 'create' | 'view' | 'enemies' | 'dice' | 'maps' | 'campaign';
    return savedView || 'campaign';
  });
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [editedCharacter, setEditedCharacter] = useState<Character | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState<string | undefined>(undefined);
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [level, setLevel] = useState(1);
  const [forca, setForca] = useState(0);
  const [destreza, setDestreza] = useState(0);
  const [constituicao, setConstituicao] = useState(0);
  const [inteligencia, setInteligencia] = useState(0);
  const [sabedoria, setSabedoria] = useState(0);
  const [carisma, setCarisma] = useState(0);
  const [pontosDisponiveis, setPontosDisponiveis] = useState(70);
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem('sidebarExpanded');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    fetchCharacters();
    fetchEnemies();
    fetchCampaigns();
  }, []);

  useEffect(() => {
    localStorage.setItem('currentView', currentView);
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem('sidebarExpanded', JSON.stringify(isExpanded));
  }, [isExpanded]);

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

  // Toast hook (provider wraps App in main.tsx)
  const toast = useToast();

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
        const location = (char as any).location_x !== null && (char as any).location_y !== null ? { x: (char as any).location_x, y: (char as any).location_y } : undefined;
        return { ...char, inventory, location, color: (char as any).color || undefined };
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

  const fetchCampaigns = async () => {
    try {
      // Buscar campanha ativa
      const activeResponse = await fetch('http://localhost:3001/campaigns/active');
      const activeData = await activeResponse.json();
      setActiveCampaign(activeData.campaign);
    } catch (error) {
      console.error('Erro ao buscar campanhas:', error);
    }
  };

  const createCampaign = async (name: string, mapSize: number = 5) => {
    try {
      const response = await fetch('http://localhost:3001/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, map_size: mapSize }),
      });
      const data = await response.json();
      
      if (response.ok) {
        // Atualizar campanhas e buscar a ativa
        await fetchCampaigns();
        
        // Posicionar personagens no mapa da nova campanha
        await positionCharactersInCampaign(data.id);
        try { toast.show('Campanha criada com sucesso', 'success'); } catch {}
        
        return data;
      }
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
    }
  };

  const endCampaign = async () => {
    if (!activeCampaign) return;
    try {
      const response = await fetch(`http://localhost:3001/campaigns/${activeCampaign.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'completed' }),
      });
      
      if (response.ok) {
        // Atualizar campanhas para refletir mudança
        await fetchCampaigns();
      }
    } catch (error) {
      console.error('Erro ao encerrar campanha:', error);
    }
  };

  const positionCharactersInCampaign = async (campaignId: number) => {
    try {
      // Buscar informações da campanha para obter o tamanho do mapa
      const campaignResponse = await fetch(`http://localhost:3001/campaigns`);
      const campaignData = await campaignResponse.json();
      const campaign = campaignData.campaigns.find((c: any) => c.id === campaignId);
      const mapSize = campaign?.map_size || 5;
      
      // Calcular dimensões do mapa baseadas na lógica do SquareMapGenerator
      // Para size=5: width = 5 * 3 = 15, então x vai de 0 até 15*2+1-1 = 30
      // height = 5, então y vai de 0 até 5*2+1-1 = 10
      const mapWidth = mapSize * 6;  // Para size=5: 30 (0-30)
      const mapHeight = mapSize * 2; // Para size=5: 10 (0-10)
      
      // Buscar todos os personagens
      const charsResponse = await fetch('http://localhost:3001/characters');
      const charsData = await charsResponse.json();
      
      // Função de ruído idêntica ao SquareMapGenerator
      const noise = (x: number, y: number, seed: number): number => {
        const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 43758.5453) * 43758.5453;
        return n - Math.floor(n);
      };
      
      // Construir lista de todas as células transitáveis (usando a função exata do mapa)
      const walkableCells: { x: number; y: number }[] = [];
      for (let x = 0; x <= mapWidth; x++) {
        for (let y = 0; y <= mapHeight; y++) {
          const elevation = noise(x * 0.1, y * 0.1, campaign.map_seed);
          const moisture = noise(x * 0.05 + 100, y * 0.05 + 100, campaign.map_seed);
          const temperature = 1 - Math.abs(y) / mapSize;
          const isBorder = Math.abs(x) > mapSize * 2.5 || Math.abs(y) > mapSize * 0.7;

          let terrainType = 'grass';
          if (isBorder && elevation > 0.5) {
            terrainType = 'mountain';
          } else if (elevation > 0.7) {
            terrainType = temperature > 0.3 ? 'mountain' : 'snow';
          } else if (moisture > 0.6) {
            terrainType = elevation > 0.3 ? 'swamp' : 'water';
          } else if (temperature < 0.2) {
            terrainType = 'snow';
          } else if (temperature > 0.8 && moisture < 0.3) {
            terrainType = 'desert';
          } else if (elevation > 0.4) {
            terrainType = 'forest';
          } else {
            terrainType = 'grass';
          }

          // Apenas células não-mountain e não-water são consideradas transitáveis
          if (!['mountain', 'water'].includes(terrainType)) {
            walkableCells.push({ x, y });
          }
        }
      }

      if (walkableCells.length === 0) {
        console.error('Mapa sem células transitáveis — todos os personagens serão posicionados no centro.');
      }

      // Embaralhar a lista para distribuição aleatória sem sobreposição
      for (let i = walkableCells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [walkableCells[i], walkableCells[j]] = [walkableCells[j], walkableCells[i]];
      }

      let walkableIndex = 0;
      for (const char of charsData.characters) {
        let location_x = Math.floor(mapWidth / 2);
        let location_y = Math.floor(mapHeight / 2);

        if (walkableCells.length > 0 && walkableIndex < walkableCells.length) {
          const cell = walkableCells[walkableIndex++];
          location_x = cell.x;
          location_y = cell.y;
        } else {
          // fallback: centro do mapa
          console.warn(`Fallback de posicionamento para ${char.name}: (${location_x}, ${location_y})`);
        }

        await fetch(`http://localhost:3001/characters/${char.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...char,
            campaign_id: campaignId,
            location_x,
            location_y,
          }),
        });
      }
      
      // Recarregar personagens com as novas posições
      await fetchCharacters();
    } catch (error) {
      console.error('Erro ao posicionar personagens:', error);
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
        try { toast.show('Inimigo criado com sucesso', 'success'); } catch {}
      } else {
        try {
          const err = await response.json();
          toast.show(err.error || 'Erro ao criar inimigo', 'error');
        } catch (e) {
          console.error('Erro ao criar inimigo');
        }
      }
    } catch (error) {
      console.error('Erro ao criar inimigo:', error);
      try { toast.show('Erro ao criar inimigo', 'error'); } catch {}
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

      // Se há uma campanha ativa, posicionar o personagem no mapa da campanha
      let location_x = 0;
      let location_y = 0;

      if (activeCampaign) {
        // Usar a mesma lógica de posicionamento da campanha
        const mapSize = activeCampaign.map_size || 5;
        const mapWidth = mapSize * 6;
        const mapHeight = mapSize * 2;

        // Função de ruído idêntica ao SquareMapGenerator
        const noise = (x: number, y: number, seed: number): number => {
          const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 43758.5453) * 43758.5453;
          return n - Math.floor(n);
        };

        // Função para determinar se uma coordenada é transitável (versão flexível para posicionamento)
        const isWalkableForPlacement = (x: number, y: number, seed: number, mapSize: number, strict: boolean = true): boolean => {
          const elevation = noise(x * 0.1, y * 0.1, seed);
          const moisture = noise(x * 0.05 + 100, y * 0.05 + 100, seed);
          const temperature = 1 - Math.abs(y) / mapSize;

          // Em modo strict, usar as mesmas regras do mapa
          // Em modo relaxed, reduzir as restrições de borda
          const borderThreshold = strict ? 2.5 : 4.0; // Permitir bordas maiores no modo relaxed
          const isBorder = Math.abs(x) > mapSize * borderThreshold || Math.abs(y) > mapSize * (strict ? 0.7 : 1.0);

          let terrainType: string;

          if (isBorder && elevation > 0.5) {
            terrainType = 'mountain';
          } else if (elevation > 0.7) {
            terrainType = temperature > 0.3 ? 'mountain' : 'snow';
          } else if (moisture > 0.6) {
            terrainType = elevation > 0.3 ? 'swamp' : 'water';
          } else if (temperature < 0.2) {
            terrainType = 'snow';
          } else if (temperature > 0.8 && moisture < 0.3) {
            terrainType = 'desert';
          } else if (elevation > 0.4) {
            terrainType = 'forest';
          } else {
            terrainType = 'grass';
          }

          // Em modo strict: só terrains walkable
          // Em modo relaxed: permitir snow também (menos pior que mountain/water)
          if (strict) {
            return !['mountain', 'water'].includes(terrainType);
          } else {
            return !['mountain', 'water'].includes(terrainType) || terrainType === 'snow';
          }
        };

        // Tentar encontrar uma posição válida no mapa da campanha
        let attempts = 0;
        const maxAttempts = 100;
        let foundPosition = false;

        do {
          location_x = Math.floor(Math.random() * (mapWidth + 1));
          location_y = Math.floor(Math.random() * (mapHeight + 1));
          attempts++;

          if (isWalkableForPlacement(location_x, location_y, activeCampaign.map_seed, mapSize, true)) {
            foundPosition = true;
            break;
          }
        } while (attempts < maxAttempts);

        // Se não encontrou em modo strict, tentar modo relaxed
        if (!foundPosition) {
          console.warn(`Não encontrou posição transitável estrita para novo personagem, tentando modo relaxed`);
          attempts = 0;
          const maxRelaxedAttempts = 200;

          do {
            location_x = Math.floor(Math.random() * (mapWidth + 1));
            location_y = Math.floor(Math.random() * (mapHeight + 1));
            attempts++;

            if (isWalkableForPlacement(location_x, location_y, activeCampaign.map_seed, mapSize, false)) {
              foundPosition = true;
              console.log(`Encontrada posição relaxed para novo personagem: (${location_x}, ${location_y})`);
              break;
            }
          } while (attempts < maxRelaxedAttempts);
        }

        // Se ainda não encontrou, usar busca exaustiva
        if (!foundPosition) {
          console.error(`FALHA CRÍTICA: Não encontrou posição adequada para novo personagem, usando busca exaustiva`);

          for (let testX = 0; testX <= mapWidth && !foundPosition; testX++) {
            for (let testY = 0; testY <= mapHeight && !foundPosition; testY++) {
              // Aceitar qualquer terreno que não seja mountain
              const elevation = noise(testX * 0.1, testY * 0.1, activeCampaign.map_seed);
              const moisture = noise(testX * 0.05 + 100, testY * 0.05 + 100, activeCampaign.map_seed);

              let terrainType = 'grass';
              if (elevation > 0.7) terrainType = 'mountain';
              else if (moisture > 0.6) terrainType = elevation > 0.3 ? 'swamp' : 'water';
              else if (elevation > 0.4) terrainType = 'forest';

              if (terrainType !== 'mountain') {
                location_x = testX;
                location_y = testY;
                foundPosition = true;
                console.warn(`POSIÇÃO DE EMERGÊNCIA para novo personagem: (${testX}, ${testY}) - Terreno: ${terrainType}`);
              }
            }
          }
        }

        // Último recurso: centro do mapa
        if (!foundPosition) {
          console.error(`ERRO CRÍTICO: Nenhuma posição segura encontrada para novo personagem!`);
          location_x = Math.floor(mapWidth / 2);
          location_y = Math.floor(mapHeight / 2);
        }
      } else {
        // Se não há campanha ativa, usar posições aleatórias simples (fallback)
        location_x = Math.floor(Math.random() * 61);
        location_y = Math.floor(Math.random() * 21);
      }

  // Use chosen color or deterministic palette color from name
  const generatedColor = color ?? getColorForName(name || undefined) ?? getRandomPaletteColor();

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
          location_x,
          location_y,
          campaign_id: activeCampaign?.id || null,
          color: generatedColor,
        }),
      });
      if (response.ok) {
        setName('');
        setSelectedRace(null);
        setColor(undefined);
        setLevel(1);
        setForca(0);
        setDestreza(0);
        setConstituicao(0);
        setInteligencia(0);
        setSabedoria(0);
        setCarisma(0);
        setPontosDisponiveis(70);
        fetchCharacters();
        try { toast.show('Personagem criado com sucesso', 'success'); } catch {}
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
          try { toast.show('Personagem evoluiu de nível!', 'success'); } catch {}
        } else {
          const error = await response.json();
          toast.show(error.error || 'Erro ao subir nível', 'error');
        }
    } catch (error) {
      console.error('Erro ao subir nível:', error);
      try { toast.show('Erro ao subir nível', 'error'); } catch {}
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
        try { toast.show('XP adicionada com sucesso', 'success'); } catch {}
      }
    } catch (error) {
      console.error('Erro ao adicionar XP:', error);
      try { toast.show('Erro ao adicionar XP', 'error'); } catch {}
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
          color: editedCharacter.color ?? null,
          xp: editedCharacter.xp,
          weapon_name: editedCharacter.weapon_name,
          weapon_attr: editedCharacter.weapon_attr,
          weapon_bonus: editedCharacter.weapon_bonus,
          current_pv: editedCharacter.current_pv,
          current_pe: editedCharacter.current_pe,
          location_x: editedCharacter.location?.x,
          location_y: editedCharacter.location?.y,
        }),
      });
      if (response.ok) {
        fetchCharacters();
        setSelectedCharacter(editedCharacter);
        try { toast.show('Personagem atualizado com sucesso', 'success'); } catch {}
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
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
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
            color={color}
            setColor={setColor}
          />
        ) : currentView === 'enemies' ? (
          <EnemyList enemies={enemies} characters={characters} onCreateEnemy={createEnemy} />
        ) : currentView === 'dice' ? (
          <DiceRoller characters={characters} />
        ) : currentView === 'maps' ? (
          <SquareMapGenerator selectedCharacter={selectedCharacter} onCharacterMoved={(updated) => {
            // atualizar lista local de characters
            setCharacters(prev => prev.map(c => c.id === updated.id ? { ...c, location: updated.location } : c));
            // atualizar seleção
            setSelectedCharacter(prev => prev && prev.id === updated.id ? { ...prev, location: updated.location } : prev);
          }} />
        ) : currentView === 'campaign' ? (
          <CampaignOverview 
            characters={characters} 
            enemies={enemies} 
            onUpdateCharacter={handleUpdateCharacter}
            activeCampaign={activeCampaign}
            onCreateCampaign={createCampaign}
            onEndCampaign={endCampaign}
            selectedCharacter={selectedCharacter}
            onCharacterMoved={(updated: Character) => {
              setCharacters(prev => prev.map(c => c.id === updated.id ? { ...c, location: updated.location } : c));
              setSelectedCharacter(prev => prev && prev.id === updated.id ? { ...prev, location: updated.location } : prev);
            }}
          />
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
