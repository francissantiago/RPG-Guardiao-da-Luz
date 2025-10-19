import { useState, useMemo } from 'react';

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

// Props do componente
interface HexMapGeneratorProps {
  size?: number;
  seed?: number;
}

export default function SquareMapGenerator({ size = 10, seed = Math.random() }: HexMapGeneratorProps) {
  const [mapSize, setMapSize] = useState(size);
  const [currentSeed, setCurrentSeed] = useState(seed);
  // Estado para célula selecionada
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);
  // Zoom e Pan
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);

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

  // Gerar novo mapa
  const generateNewMap = () => {
    setCurrentSeed(Math.random());
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white text-center">
        🏔️ Gerador de Mapas Quadrados
      </h2>

      {/* Controles */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tamanho:
          </label>
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

      {/* Legenda */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Legenda:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {Object.values(TERRAIN_CONFIGS).map(config => (
            <div key={config.type} className="flex itens-center gap-2">
              <div
                className="w-4 h-4 rounded border border-gray-300"
                style={{ backgroundColor: config.color }}
              ></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {config.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mapa SVG */}
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
                    onClick={() => setSelectedCell(prev => (prev && prev.x === gx && prev.y === gy) ? null : { x: gx, y: gy })}
                  />
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
          </g>
        </svg>
      </div>

      {/* Informações do Mapa */}
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
