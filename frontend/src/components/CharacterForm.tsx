import type { Race } from '../types';
import { races } from '../types';

interface CharacterFormProps {
  name: string;
  setName: (name: string) => void;
  selectedRace: Race | null;
  setSelectedRace: (race: Race | null) => void;
  color?: string;
  setColor?: (color: string) => void;
  forca: number;
  destreza: number;
  constituicao: number;
  inteligencia: number;
  sabedoria: number;
  carisma: number;
  pontosDisponiveis: number;
  adjustAttribute: (setter: React.Dispatch<React.SetStateAction<number>>, current: number, delta: number) => void;
  setForca: React.Dispatch<React.SetStateAction<number>>;
  setDestreza: React.Dispatch<React.SetStateAction<number>>;
  setConstituicao: React.Dispatch<React.SetStateAction<number>>;
  setInteligencia: React.Dispatch<React.SetStateAction<number>>;
  setSabedoria: React.Dispatch<React.SetStateAction<number>>;
  setCarisma: React.Dispatch<React.SetStateAction<number>>;
  handleSubmit: (e: React.FormEvent) => void;
}

export default function CharacterForm({
  name,
  setName,
  selectedRace,
  setSelectedRace,
  color,
  setColor,
  forca,
  destreza,
  constituicao,
  inteligencia,
  sabedoria,
  carisma,
  pontosDisponiveis,
  adjustAttribute,
  setForca,
  setDestreza,
  setConstituicao,
  setInteligencia,
  setSabedoria,
  setCarisma,
  handleSubmit,
}: CharacterFormProps) {
  return (
    <>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">RPG - Guardião da Luz</h1>
      </div>
      <div className="w-full bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Cadastrar Personagem</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dados Básicos</h3>
            <div>
              <label className="block text-gray-700 dark:text-gray-300">Nome:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300">Raça:</label>
              <select
                value={selectedRace?.name || ''}
                onChange={(e) => {
                  const raceName = e.target.value;
                  const race = races.find(r => r.name === raceName) || null;
                  setSelectedRace(race);
                }}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                required
              >
                <option value="">Selecione uma raça</option>
                <optgroup label="Raças Masculinas">
                  {races.filter(r => r.gender === 'masculino').map(race => (
                    <option key={race.name} value={race.name}>
                      {race.name} - {race.description}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Raças Femininas">
                  {races.filter(r => r.gender === 'feminino').map(race => (
                    <option key={race.name} value={race.name}>
                      {race.name} - {race.description}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300">Nível:</label>
              <input
                type="number"
                value={1}
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                readOnly
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Distribuição de Pontos</h3>
            {selectedRace && (
              <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white">Bônus da Raça: {selectedRace!.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{selectedRace!.description}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <span>Força: +{selectedRace!.baseStats.forca}</span>
                  <span>Destreza: +{selectedRace!.baseStats.destreza}</span>
                  <span>Constituição: +{selectedRace!.baseStats.constituicao}</span>
                  <span>Inteligência: +{selectedRace!.baseStats.inteligencia}</span>
                  <span>Sabedoria: +{selectedRace!.baseStats.sabedoria}</span>
                  <span>Carisma: +{selectedRace!.baseStats.carisma}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Arma: {selectedRace!.weapon.name} (+{selectedRace!.weapon.bonus} {selectedRace!.weapon.attr})</p>
              </div>
            )}
            <div className="text-center">
              <label className="block text-gray-700 dark:text-gray-300 text-lg font-medium">Pontos Disponíveis: {pontosDisponiveis}</label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Força', value: forca, setter: setForca },
                { label: 'Destreza', value: destreza, setter: setDestreza },
                { label: 'Constituição', value: constituicao, setter: setConstituicao },
                { label: 'Inteligência', value: inteligencia, setter: setInteligencia },
                { label: 'Sabedoria', value: sabedoria, setter: setSabedoria },
                { label: 'Carisma', value: carisma, setter: setCarisma },
              ].map((attr) => (
                <div key={attr.label} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <label className="text-gray-700 dark:text-gray-300 font-medium w-32 text-left">{attr.label}:</label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => adjustAttribute(attr.setter, attr.value, -1)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                      disabled={attr.value <= 1}
                    >
                      -
                    </button>
                    <span className="px-4 py-1 border rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white border-gray-300 dark:border-gray-500 min-w-[3rem] text-center">{attr.value}</span>
                    <button
                      type="button"
                      onClick={() => adjustAttribute(attr.setter, attr.value, 1)}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                      disabled={pontosDisponiveis <= 0}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4 col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Estatísticas</h3>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cor do Personagem (opcional)</label>
              <input type="color" value={color || '#2563eb'} onChange={(e) => setColor && setColor(e.target.value)} className="w-24 h-10 p-0 border-0" />
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <div className="grid grid-cols-3 gap-4">
                {(() => {
                  const effectiveForca = forca + (selectedRace?.weapon.attr === 'forca' ? selectedRace.weapon.bonus : 0);
                  const effectiveDestreza = destreza + (selectedRace?.weapon.attr === 'destreza' ? selectedRace.weapon.bonus : 0);
                  const effectiveConstituicao = constituicao + (selectedRace?.weapon.attr === 'constituicao' ? selectedRace.weapon.bonus : 0);
                  const effectiveInteligencia = inteligencia + (selectedRace?.weapon.attr === 'inteligencia' ? selectedRace.weapon.bonus : 0);
                  const effectiveSabedoria = sabedoria + (selectedRace?.weapon.attr === 'sabedoria' ? selectedRace.weapon.bonus : 0);
                  const effectiveCarisma = carisma + (selectedRace?.weapon.attr === 'carisma' ? selectedRace.weapon.bonus : 0);
                  return (
                    <>
                      <div className="text-center">
                        <p className="text-gray-700 dark:text-gray-300">Pontos de Combate (PC)</p>
                        <progress value={Math.min(3000, (effectiveForca + effectiveDestreza) * 75)} max={3000} className="w-full h-4 progress-pc" title="Pontos de Combate: Calculado como (Força + Destreza) × 75, máximo 3000" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{Math.min(3000, (effectiveForca + effectiveDestreza) * 75)} / 3000</span>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-700 dark:text-gray-300">Ataque Físico</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{Math.floor((effectiveForca + effectiveDestreza) * 2)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-700 dark:text-gray-300">Defesa Física</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{Math.floor((effectiveDestreza + effectiveConstituicao) * 1.5)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-700 dark:text-gray-300">Pontos de Vida (PV)</p>
                        <progress value={Math.min(5000, effectiveConstituicao * 250)} max={5000} className="w-full h-4 progress-pv" title="Pontos de Vida: Calculado como Constituição × 250, máximo 5000" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{Math.min(5000, effectiveConstituicao * 250)} / 5000</span>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-700 dark:text-gray-300">Ataque Mágico</p>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{Math.floor((effectiveInteligencia + effectiveSabedoria) * 2)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-700 dark:text-gray-300">Defesa Mágica</p>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{Math.floor((effectiveSabedoria + effectiveCarisma) * 1.5)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-700 dark:text-gray-300">Pontos de Espiritualidade (PE)</p>
                        <progress value={Math.min(2000, (effectiveInteligencia + effectiveSabedoria + effectiveCarisma) * 33)} max={2000} className="w-full h-4 progress-pe" title="Pontos de Espiritualidade: Calculado como (Inteligência + Sabedoria + Carisma) × 33, máximo 2000" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{Math.min(2000, (effectiveInteligencia + effectiveSabedoria + effectiveCarisma) * 33)} / 2000</span>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-700 dark:text-gray-300">Velocidade</p>
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{effectiveDestreza * 5}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
          <div className="col-span-2 mt-6">
            <button type="submit" className="w-full bg-blue-500 dark:bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 text-lg font-medium">
              Cadastrar Personagem
            </button>
          </div>
        </form>
      </div>
    </>
  );
}