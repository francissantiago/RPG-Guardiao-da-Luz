import { useState, useMemo, useEffect, useRef } from 'react';
import type { Character } from '../types';

// Tipos para coordenadas quadradas
interface SquareCoordinate {
  x: number; // coluna
  y: number; // linha
}

// Tipos de terreno
type TerrainType = 'grass' | 'forest' | 'mountain' | 'water' | 'desert' | 'snow' | 'swamp';

// Configuração do terreno
interface TerrainConfig {
  type: TerrainType;
  color: string;
  name: string;
  walkable: boolean;
  defenseBonus: number;
}

// Configurações de terreno
const TERRAIN_CONFIGS: Record<TerrainType, TerrainConfig> = {
  grass: { type: 'grass', color: '#90EE90', name: 'Grama', walkable: true, defenseBonus: 0 },
  forest: { type: 'forest', color: '#228B22', name: 'Floresta', walkable: true, defenseBonus: 1 },
  mountain: { type: 'mountain', color: '#696969', name: 'Montanha', walkable: false, defenseBonus: 2 },
  water: { type: 'water', color: '#4169E1', name: 'Água', walkable: false, defenseBonus: 0 },
  desert: { type: 'desert', color: '#F4A460', name: 'Deserto', walkable: true, defenseBonus: -1 },
  snow: { type: 'snow', color: '#F0F8FF', name: 'Neve', walkable: true, defenseBonus: 0 },
  swamp: { type: 'swamp', color: '#556B2F', name: 'Pântano', walkable: true, defenseBonus: -1 },
};

// Ícones SVG para cada tipo de terreno
const TERRAIN_ICONS: Record<TerrainType, React.ReactNode> = {
  grass: (
    <rect x={0.25} y={0.25} width={0.5} height={0.5} fill="#3cb371" rx={0.15} />
  ),
  forest: (
    <g>
      <ellipse cx={0.5} cy={0.55} rx={0.22} ry={0.28} fill="#145a32" />
      <rect x={0.45} y={0.7} width={0.1} height={0.18} fill="#6e4b1a" />
    </g>
  ),
  mountain: (
    <polygon points="0.2,0.9 0.5,0.2 0.8,0.9" fill="#a9a9a9" stroke="#555" strokeWidth={0.04} />
  ),
  water: (
    <ellipse cx={0.5} cy={0.5} rx={0.32} ry={0.22} fill="#1e90ff" />
  ),
  desert: (
    <g>
      <ellipse cx={0.5} cy={0.6} rx={0.28} ry={0.18} fill="#e2c16b" />
      <rect x={0.35} y={0.75} width={0.3} height={0.08} fill="#c2b280" rx={0.04} />
    </g>
  ),
  snow: (
    <g>
      <ellipse cx={0.5} cy={0.5} rx={0.28} ry={0.22} fill="#e0f7fa" />
      <rect x={0.42} y={0.7} width={0.16} height={0.08} fill="#b2ebf2" rx={0.04} />
    </g>
  ),
  swamp: (
    <g>
      <ellipse cx={0.5} cy={0.6} rx={0.22} ry={0.16} fill="#556b2f" />
      <rect x={0.45} y={0.75} width={0.1} height={0.08} fill="#2e4d1a" />
    </g>
  ),
};

// Props do componente
interface HexMapGeneratorProps {
  size?: number;
  seed?: number;
  characters?: Character[];
  compact?: boolean; // quando true, renderiza somente o mapa (modo campanha)
  selectedCharacter?: Character | null;
  onCharacterMoved?: (updated: Character) => void;
}

export default function SquareMapGenerator({ size = 10, seed = Math.random(), characters = [], compact = false, selectedCharacter = null, onCharacterMoved }: HexMapGeneratorProps) {
  const [mapSize, setMapSize] = useState<number>(size);
  const [currentSeed, setCurrentSeed] = useState<number>(seed);
  // Estado para célula selecionada
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);
  // Zoom e Pan
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  // Estado para posições animadas dos personagens: { [charId]: { x, y } }
  const [animatedPositions, setAnimatedPositions] = useState<Record<number, { x: number; y: number }>>(() => {
    const init: Record<number, { x: number; y: number }> = {};
    characters.forEach(c => { if (c.location) init[c.id] = { x: c.location.x, y: c.location.y }; });
    return init;
  });
  const rafRef = useRef<number | null>(null);
  const animRefs = useRef<Record<number, { startX: number; startY: number; toX: number; toY: number; startTime: number; duration: number }>>({});

  // Função para gerar coordenadas quadradas em formato retangular preenchendo completamente a área
  const generateHexCoordinates = (size: number): SquareCoordinate[] => {
    const coords: SquareCoordinate[] = [];

    // Para um mapa retangular quadrado que preenche completamente a área
    const width = size * 3;  // Largura do retângulo
    const height = size;     // Altura do retângulo

    for (let x = 0; x < width * 2 + 1; x++) {
      for (let y = 0; y < height * 2 + 1; y++) {
        coords.push({ x, y });
      }
    }

    return coords;
  };

  // Função de ruído simples baseada em seed
  const noise = (x: number, y: number, seed: number): number => {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 43758.5453) * 43758.5453;
    return n - Math.floor(n);
  };

  // Função para determinar o tipo de terreno baseado na posição e seed
  const getTerrainType = (coord: SquareCoordinate, seed: number): TerrainType => {
    const { x, y } = coord;
    const elevation = noise(x * 0.1, y * 0.1, seed);
    const moisture = noise(x * 0.05 + 100, y * 0.05 + 100, seed);
    const temperature = 1 - Math.abs(y) / mapSize; // Mais frio nas bordas norte/sul

    // Bordas do mapa tendem a ter terrenos mais extremos
    const isBorder = Math.abs(x) > mapSize * 2.5 || Math.abs(y) > mapSize * 0.7;

    if (isBorder && elevation > 0.5) {
      return 'mountain'; // Montanhas nas bordas
    }

    if (elevation > 0.7) {
      return temperature > 0.3 ? 'mountain' : 'snow';
    }

    if (moisture > 0.6) {
      return elevation > 0.3 ? 'swamp' : 'water';
    }

    if (temperature < 0.2) {
      return 'snow';
    }

    if (temperature > 0.8 && moisture < 0.3) {
      return 'desert';
    }

    if (elevation > 0.4) {
      return 'forest';
    }

    return 'grass';
  };

  // Gerar coordenadas e o mapa (memoizado)
  const coords = useMemo(() => generateHexCoordinates(mapSize), [mapSize]);

  const hexMap = useMemo(() => {
    return coords.map(coord => ({
      coord,
      terrain: TERRAIN_CONFIGS[getTerrainType(coord, currentSeed)],
      elevation: noise(coord.x * 0.1, coord.y * 0.1, currentSeed)
    }));
  }, [coords, currentSeed]);

  // Nota: renderizamos diretamente em unidades do viewBox (cada célula = 1x1),
  // então não precisamos de uma função de conversão para pixels.

  // Calcular as dimensões do grid (número de colunas/linhas) e preparar valores para o viewBox
  const mapCenter = useMemo(() => {
    const cols = Array.from(new Set(coords.map(c => c.x))).length;
    const rows = Array.from(new Set(coords.map(c => c.y))).length;

    // Usamos unidade 1 por célula no viewBox, então a largura/altura reais do viewBox são cols e rows
    return {
      x: cols / 2,
      y: rows / 2,
      width: cols,
      height: rows,
      actualWidth: cols,
      actualHeight: rows,
      cols,
      rows
    } as unknown as { x:number; y:number; width:number; height:number; actualWidth:number; actualHeight:number; cols:number; rows:number };
  }, [coords]);

  // Sincroniza props seed/size com o estado interno para manter paridade determinística
  useEffect(() => {
    setCurrentSeed(seed);
  }, [seed]);

  useEffect(() => {
    setMapSize(size);
  }, [size]);

  // Quando a lista de characters mudar (posições atualizadas pelo servidor via onCharacterMoved), animar cada marcador que teve mudança de célula.
  useEffect(() => {
    const now = performance.now();
    const nextAnimated: Record<number, { x: number; y: number }> = { ...animatedPositions };
    let needsFrame = false;

    characters.forEach(c => {
      if (!c.location) return;
      const prev = animatedPositions[c.id];
      const to = { x: c.location.x, y: c.location.y };
      if (!prev) {
        // inicializar se ainda não existente
        nextAnimated[c.id] = { x: to.x, y: to.y };
        return;
      }
      if (prev.x !== to.x || prev.y !== to.y) {
        // preparar animação
        const dx = Math.abs(to.x - prev.x);
        const dy = Math.abs(to.y - prev.y);
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const durationPerTile = 180; // ms por tile
        const duration = Math.round(durationPerTile * dist);
        animRefs.current[c.id] = { startX: prev.x, startY: prev.y, toX: to.x, toY: to.y, startTime: now, duration };
        needsFrame = true;
      }
    });

    if (needsFrame) {
      // start RAF loop
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const step = (t: number) => {
        let anyRunning = false;
        const updated: Record<number, { x: number; y: number }> = { ...nextAnimated };
        Object.keys(animRefs.current).forEach(key => {
          const id = parseInt(key);
          const r = animRefs.current[id];
          if (!r) return;
          const elapsed = t - r.startTime;
          const progress = Math.min(1, Math.max(0, elapsed / r.duration));
          const ix = r.startX + (r.toX - r.startX) * progress;
          const iy = r.startY + (r.toY - r.startY) * progress;
          updated[id] = { x: ix, y: iy };
          if (progress < 1) anyRunning = true;
          else {
            // finalize: set position exactly and remove animRef
            updated[id] = { x: r.toX, y: r.toY };
            delete animRefs.current[id];
          }
        });
        setAnimatedPositions(updated);
        if (anyRunning) rafRef.current = requestAnimationFrame(step);
        else rafRef.current = null;
      };
      rafRef.current = requestAnimationFrame(step);
    } else {
      // apenas sincronizar posições (caso sem animações pendentes)
      const synced: Record<number, { x: number; y: number }> = {};
      characters.forEach(c => { if (c.location) synced[c.id] = { x: c.location.x, y: c.location.y }; });
      setAnimatedPositions(synced);
    }

    return () => {
      // cancel any raf if component unmounts or chars change
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characters]);

  // helpers de cor: calcula se a cor é escura para ajustar cor do texto
  const hexToRgb = (hex: string) => {
    if (!hex) return { r: 0, g: 0, b: 0 };
    const clean = hex.replace('#', '');
    if (clean.length === 3) {
      return {
        r: parseInt(clean[0] + clean[0], 16),
        g: parseInt(clean[1] + clean[1], 16),
        b: parseInt(clean[2] + clean[2], 16),
      };
    }
    return {
      r: parseInt(clean.substring(0, 2), 16),
      g: parseInt(clean.substring(2, 4), 16),
      b: parseInt(clean.substring(4, 6), 16),
    };
  };

  const isDarkColor = (hex: string) => {
    const { r, g, b } = hexToRgb(hex || '#000000');
    // luminance formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.6; // threshold: adjust if necessary
  };

  // Handler para gerar um novo mapa (novo seed)
  const generateNewMap = () => {
    setCurrentSeed(Math.random());
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      {/* Header, controles e legenda são ocultados em modo compact */}
      {!compact && (
        <>
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white text-center">
            🏔️ Gerador de Mapas Quadrados
          </h2>

          {/* Controles */}
          <div className="mb-6 flex flex-wrap gap-4 items-center justify-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tamanho:</label>
              <select
                value={mapSize}
                onChange={(e) => setMapSize(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value={3}>Pequeno (3)</option>
                <option value={5}>Médio (5)</option>
                <option value={7}>Grande (7)</option>
                <option value={10}>Enorme (10)</option>
                <option value={15}>Gigante (15)</option>
                <option value={20}>Colossal (20)</option>
              </select>
            </div>

            <button
              onClick={generateNewMap}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              🎲 Gerar Novo Mapa
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom(z => Math.min(z + 0.2, 5))}
                className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-md font-bold text-lg"
                title="Zoom In"
              >+
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">Zoom: {zoom.toFixed(1)}x</span>
              <button
                onClick={() => setZoom(z => Math.max(z - 0.2, 0.2))}
                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md font-bold text-lg"
                title="Zoom Out"
              >−
              </button>
              <button
                onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                className="bg-gray-500 hover:bg-gray-700 text-white px-2 py-1 rounded-md font-bold text-sm"
                title="Resetar Zoom e Posição"
              >Resetar</button>
            </div>
          </div>

          {/* Legenda com ícones SVG */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Legenda:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {Object.keys(TERRAIN_CONFIGS).map(type => (
                <div key={type} className="flex items-center gap-2">
                  <svg width={24} height={24} viewBox="0 0 1 1" style={{ background: TERRAIN_CONFIGS[type as TerrainType].color, borderRadius: 4, border: '1px solid #ccc' }}>
                    {TERRAIN_ICONS[type as TerrainType]}
                  </svg>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{TERRAIN_CONFIGS[type as TerrainType].name}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Mapa SVG (sempre mostrado, também em modo compact) */}
      <div className="flex justify-center w-full select-none">
        <svg
          width="100%"
          viewBox={`0 0 ${mapCenter.actualWidth} ${mapCenter.actualHeight}`}
          preserveAspectRatio="xMidYMid meet"
          className="border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 max-w-full"
          style={{ aspectRatio: `${mapCenter.cols} / ${mapCenter.rows}`, maxHeight: '70vh', cursor: isPanning ? 'grabbing' : 'grab' }}
          onMouseDown={e => {
            setIsPanning(true);
            setPanStart({ x: e.clientX, y: e.clientY });
          }}
          onMouseUp={() => setIsPanning(false)}
          onMouseLeave={() => setIsPanning(false)}
          onMouseMove={e => {
            if (isPanning && panStart) {
              const dx = (e.clientX - panStart.x) / 30 / zoom; // Sensibilidade
              const dy = (e.clientY - panStart.y) / 30 / zoom;
              setPan(p => ({ x: p.x - dx, y: p.y - dy }));
              setPanStart({ x: e.clientX, y: e.clientY });
            }
          }}
        >
          <g transform={`scale(${zoom}) translate(${pan.x},${pan.y})`}>
            {hexMap.map((hex) => {
              const gx = hex.coord.x;
              const gy = hex.coord.y;
              const isSelected = selectedCell && selectedCell.x === gx && selectedCell.y === gy;
              return (
                <g key={`${hex.coord.x}-${hex.coord.y}`}>
                  {/* Quadrado principal */}
                  <rect
                    x={gx}
                    y={gy}
                    width={1}
                    height={1}
                    fill={hex.terrain.color}
                    stroke="#000"
                    strokeWidth={0.03}
                    vectorEffect="non-scaling-stroke"
                    className="cursor-pointer"
                    onClick={async () => {
                      // se houver personagem selecionado, e o tile for adjacente, tente step
                      if (selectedCharacter && selectedCharacter.location) {
                        const from = selectedCharacter.location;
                        const dx = gx - from.x;
                        const dy = gy - from.y;
                        if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && !(dx === 0 && dy === 0)) {
                          try {
                            const resp = await fetch(`http://localhost:3001/characters/${selectedCharacter.id}/step`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ dx, dy }),
                            });
                            const data = await resp.json();
                            if (resp.ok) {
                              // notificar app para atualizar estado
                              if (onCharacterMoved) onCharacterMoved({ ...selectedCharacter, location: { x: data.to.x, y: data.to.y } } as Character);
                              // atualizar seleção de célula
                              setSelectedCell({ x: data.to.x, y: data.to.y });
                            } else {
                              try { (window as any).__APP_TOAST__?.(data.error || 'Erro ao mover personagem', 'error'); } catch { alert(data.error || 'Erro ao mover personagem'); }
                            }
                          } catch (e) {
                            console.error('Erro ao chamar step:', e);
                            try { (window as any).__APP_TOAST__?.('Erro de conexão ao mover personagem', 'error'); } catch { alert('Erro de conexão ao mover personagem'); }
                          }
                          return;
                        }
                      }

                      // comportamento padrão de seleção de célula
                      setSelectedCell(prev => (prev && prev.x === gx && prev.y === gy) ? null : { x: gx, y: gy });
                    }}
                  />
                  {/* Ícone do terreno */}
                  <g transform={`translate(${gx},${gy})`}>
                    {TERRAIN_ICONS[hex.terrain.type]}
                  </g>
                  {/* Borda azul da célula selecionada */}
                  {isSelected && (
                    <>
                      {/* overlay semi-transparente para melhor contraste (com animação de opacidade) */}
                      <rect
                        x={gx}
                        y={gy}
                        width={1}
                        height={1}
                        fill="#ff00ff66" /* overlay magenta para contraste */
                        stroke="none"
                        pointerEvents="none"
                      >
                        <animate
                          attributeName="opacity"
                          values="0.9;0.5;0.9"
                          dur="1.0s"
                          repeatCount="indefinite"
                        />
                      </rect>
                      {/* borda pulsante */}
                      <rect
                        x={gx + 0.01}
                        y={gy + 0.01}
                        width={0.98}
                        height={0.98}
                        fill="none"
                        stroke="#ff00ff" /* magenta vivo */
                        strokeWidth={0.6} /* mais espessa por padrão */
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                        pointerEvents="none"
                      >
                        <animate
                          attributeName="stroke-width"
                          values="0.6;1.6;0.6" /* maior amplitude de pulso */
                          dur="1s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="1;0.5;1"
                          dur="1s"
                          repeatCount="indefinite"
                        />
                      </rect>
                    </>
                  )}
                  {/* Coordenadas (opcional, para debug) */}
                  {mapSize <= 7 && (
                    <text
                      x={gx + 0.5}
                      y={gy + 0.5}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xs fill-gray-700 pointer-events-none"
                      style={{ fontSize: 0.35 }}
                    >
                      {hex.coord.x},{hex.coord.y}
                    </text>
                  )}

                  {/* Tooltip */}
                  <title>
                    {hex.terrain.name} ({hex.coord.x}, {hex.coord.y})
                    {hex.terrain.walkable ? ' - Transitável' : ' - Intransitável'}
                    {hex.terrain.defenseBonus !== 0 && ` - Bônus de defesa: ${hex.terrain.defenseBonus}`}
                  </title>
                </g>
              );
            })}
              {/* Marcadores de personagens: renderizados depois para ficarem sobre os tiles */}
              {characters.filter(c => c.location).map(c => {
                const animated = animatedPositions[c.id] ?? (c.location ? { x: c.location.x, y: c.location.y } : { x: 0, y: 0 });
                const lx = animated.x;
                const ly = animated.y;
                const color = c.color ?? '#2563eb'; // fallback azul
                // ajustar o tamanho do marcador com base no tamanho do mapa (mapSize)
                const baseRadius = 0.28;
                const radius = Math.max(0.12, Math.min(0.6, baseRadius * (10 / Math.max(3, mapSize))));
                const fontSize = radius * 1.6;
                const haloStroke = 'rgba(0,0,0,0.65)';
                // determinar seleção comparando com posição inteira do personagem (não interpolada)
                const realPos = c.location ?? { x: Math.round(lx), y: Math.round(ly) };
                const isMarkerSelected = selectedCell && selectedCell.x === realPos.x && selectedCell.y === realPos.y;

                return (
                  <g key={`marker-${c.id}`} transform={`translate(${lx + 0.5},${ly + 0.5})`} className="pointer-events-auto" style={{ transition: 'transform 0.12s linear' }}>
                    {/* halo externo (maior se selecionado) */}
                    <circle cx={0} cy={0} r={radius + (isMarkerSelected ? 0.12 : 0.06)} fill="none" stroke={haloStroke} strokeWidth={isMarkerSelected ? 0.05 : 0.03} opacity={0.95} vectorEffect="non-scaling-stroke" pointerEvents="none">
                      {isMarkerSelected && (
                        <animate attributeName="r" values={`${radius + 0.06};${radius + 0.16};${radius + 0.06}`} dur="1s" repeatCount="indefinite" />
                      )}
                    </circle>
                    {/* marcador principal (levemente maior se selecionado) */}
                    <circle cx={0} cy={0} r={radius + (isMarkerSelected ? 0.06 : 0)} fill={color} stroke="#000" strokeWidth={0.02} vectorEffect="non-scaling-stroke" />
                    {/* inicial: usar branco para máxima legibilidade em tema escuro */}
                    <text x={0} y={0.06} textAnchor="middle" dominantBaseline="middle" fontSize={fontSize} fill="#ffffff" fontWeight={700} style={{ pointerEvents: 'none' }}>{c.name.charAt(0).toUpperCase()}</text>
                  </g>
                );
              })}
          </g>
        </svg>
      </div>

      {/* Personagens no mapa (exibido também em modo compact) */}
      <div className="mt-4">
  <h3 className="text-lg font-medium mb-2 text-gray-100 dark:text-white">Personagens no Mapa:</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {characters.filter(char => char.location).map((char) => {
            const color = char.color ?? '#2563eb';
            // container background: usar a cor com alpha pequena (hex + alpha) se for hex de 7 chars
            let containerBg = 'transparent';
            if (/^#([0-9a-f]{6})$/i.test(color)) containerBg = `${color}22`; // baixa opacidade
            const locX = char.location!.x;
            const locY = char.location!.y;
            const isThisSelected = selectedCell && selectedCell.x === locX && selectedCell.y === locY;
            return (
              <div
                key={char.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedCell(prev => (prev && prev.x === locX && prev.y === locY) ? null : { x: locX, y: locY })}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedCell(prev => (prev && prev.x === locX && prev.y === locY) ? null : { x: locX, y: locY }); }}
                className={`flex items-center gap-2 p-2 rounded ${isThisSelected ? 'ring-2 ring-offset-1 ring-white/30' : ''} cursor-pointer`}
                style={{ background: containerBg }}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: color, color: '#ffffff', boxShadow: '0 0 0 1px rgba(0,0,0,0.12) inset' }}>
                  {char.name.charAt(0).toUpperCase()}
                </div>
                <span className={`text-sm text-gray-100`}>{char.name} ({locX}, {locY})</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Informações do Mapa e célula selecionada (exibido também em modo compact) */}
      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>Mapa quadrado com {hexMap.length} quadrados • Seed: {currentSeed.toFixed(4)}</p>
        <p className="mt-1">
          Passe o mouse sobre os quadrados para ver informações detalhadas.<br/>
          Clique em um quadrado para selecionar e ver detalhes abaixo.
        </p>
        {selectedCell && (
          <div className="mt-4 p-3 rounded bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 inline-block">
            <strong>Detalhes da célula selecionada:</strong>
            <br />
            Coordenadas: <span className="font-mono">{selectedCell.x},{selectedCell.y}</span>
            <br />
            {(() => {
              const found = hexMap.find(h => h.coord.x === selectedCell.x && h.coord.y === selectedCell.y);
              if (!found) return <span className="text-red-500">Não encontrada</span>;
              return <>
                Terreno: <span className="font-semibold">{found.terrain.name}</span><br/>
                Transitável: {found.terrain.walkable ? 'Sim' : 'Não'}<br/>
                Bônus de defesa: {found.terrain.defenseBonus}
              </>;
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
