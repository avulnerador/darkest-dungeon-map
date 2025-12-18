
import React, { useState, useEffect } from 'react';
import { Settings, Trash2, Shield, Palette, Ghost, Plus, LayoutTemplate, Sun, Sparkles, Sword, Coins, Skull, Info, Flag, Circle, Flame, Search, Download } from 'lucide-react';
import { GeneratorConfig, Dungeon, DungeonTheme, CustomEncounter, RoomType, EncounterType } from '../types';

interface SidebarProps {
  config: GeneratorConfig; setConfig: any;
  theme: DungeonTheme; setTheme: any;
  templates: Record<string, DungeonTheme>;
  hostilities: string[]; setHostilities: any;
  customEncounters: CustomEncounter[]; setCustomEncounters: any;
  onGenerate: () => void;
  onExportPNG: () => void;
  isMasterMode: boolean; setIsMasterMode: any;
  history: Dungeon[]; onLoadMap: any; onDeleteMap: any;
}

const DEFAULT_SUGGESTIONS = ['⚔️', '🛡️', '💰', '💀', '🔥', '🕯️', '🚩', '🧪', '🏹', '📜', '🧱', '⚠️', '💎', '👻', '🕸️', '🍖', '🚪', '🗝️', '🔘', '✨'];

const Sidebar: React.FC<SidebarProps> = ({ config, setConfig, theme, setTheme, templates, hostilities, setHostilities, customEncounters, setCustomEncounters, onGenerate, onExportPNG, history, onLoadMap, onDeleteMap }) => {
  const [tab, setTab] = useState<'build'|'theme'|'icons'|'hist'>('build');
  const [editingIconType, setEditingIconType] = useState<{type: string, category: 'room' | 'encounter'} | null>(null);
  const [customInput, setCustomInput] = useState('');
  const [savedIcons, setSavedIcons] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('dungeon_weaver_custom_icons');
    if (saved) setSavedIcons(JSON.parse(saved));
  }, []);

  const roomLabels: Record<RoomType, string> = { START: 'Início', BATTLE: 'Luta', TREASURE: 'Ouro', CURIO: 'Curio', CAMP: 'Fogo', BOSS: 'Chefe', EMPTY: 'Vazio' };
  const encLabels: Record<EncounterType, string> = { BATTLE: 'Inimigo', TRAP: 'Trampa', TREASURE: 'Item', OBSTACLE: 'Parede', NONE: 'Nada' };

  const updateIcon = (icon: string) => {
    if (!editingIconType) return;
    const { type, category } = editingIconType;
    if (category === 'room') {
      setTheme({ ...theme, roomIcons: { ...theme.roomIcons, [type]: icon } });
    } else {
      setTheme({ ...theme, encounterIcons: { ...theme.encounterIcons, [type]: icon } });
    }
    setEditingIconType(null);
  };

  const handleAddCustomIcon = () => {
    if (!customInput.trim()) return;
    const val = customInput.trim();
    if (!savedIcons.includes(val)) {
      const newIcons = [val, ...savedIcons].slice(0, 16);
      setSavedIcons(newIcons);
      localStorage.setItem('dungeon_weaver_custom_icons', JSON.stringify(newIcons));
    }
    updateIcon(val);
    setCustomInput('');
  };

  return (
    <aside className="w-80 border-r flex flex-col h-full z-50 bg-[#050505]" style={{ borderColor: `${theme.primary}33` }}>
      <div className="p-6 flex items-center gap-4 border-b border-white/5 bg-black shadow-lg">
        <Shield size={24} style={{ color: theme.primary }} />
        <h2 className="font-cinzel text-xs font-bold tracking-[0.3em] text-white uppercase">Arquiteto de Estilo</h2>
      </div>

      <div className="flex border-b border-white/5 bg-black/40">
        {[
          { id: 'build', icon: <Settings size={14} /> },
          { id: 'theme', icon: <Palette size={14} /> },
          { id: 'icons', icon: <Sparkles size={14} /> },
          { id: 'hist', icon: <LayoutTemplate size={14} /> }
        ].map(t => (
          <button 
            key={t.id} onClick={() => setTab(t.id as any)}
            className={`flex-1 p-4 flex justify-center transition-all border-b-2 ${tab === t.id ? '' : 'text-stone-600 border-transparent hover:text-stone-400'}`}
            style={{ color: tab === t.id ? theme.primary : '', borderColor: tab === t.id ? theme.primary : '' }}
          >
            {t.icon}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar relative">
        {tab === 'build' && (
          <section className="space-y-6 animate-in slide-in-from-left duration-200">
            <h3 className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Estrutura de Campanha</h3>
            <div className="space-y-4">
              <label className="block text-[8px] text-stone-600 uppercase">Salas Totais ({config.complexity})</label>
              <input type="range" min="5" max="40" value={config.complexity} onChange={e => setConfig({...config, complexity: parseInt(e.target.value)})} className="w-full accent-red-700" style={{ accentColor: theme.primary }} />
              <label className="block text-[8px] text-stone-600 uppercase">Densidade de Ramas ({config.branching})</label>
              <input type="range" min="1" max="5" value={config.branching} onChange={e => setConfig({...config, branching: parseInt(e.target.value)})} className="w-full accent-red-700" style={{ accentColor: theme.primary }} />
              <button onClick={onGenerate} className="w-full bg-black border py-4 font-cinzel text-[10px] tracking-widest uppercase font-bold transition-all hover:brightness-125" style={{ color: theme.primary, borderColor: theme.primary }}>Forjar Masmorra</button>
            </div>
          </section>
        )}

        {tab === 'theme' && (
          <section className="space-y-6 animate-in slide-in-from-left duration-200">
            <h3 className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Paleta de Atmosfera</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(templates).map(([name, t]) => (
                <button 
                  key={name} 
                  onClick={() => setTheme(t)} 
                  className="p-3 text-[9px] border border-stone-800 bg-black uppercase font-bold hover:border-stone-400 transition-colors" 
                  style={{ color: t.primary, borderColor: theme.primary === t.primary ? t.primary : '' }}
                >
                  {name}
                </button>
              ))}
            </div>
            <div className="space-y-4 pt-4 border-t border-white/5">
              <label className="text-[9px] uppercase text-stone-600 font-bold flex justify-between">
                Sombra do Mestre <span>{Math.round(theme.masterModeOpacity * 100)}%</span>
              </label>
              <input type="range" min="0" max="1" step="0.05" value={theme.masterModeOpacity} onChange={e => setTheme({...theme, masterModeOpacity: parseFloat(e.target.value)})} className="w-full" style={{ accentColor: theme.primary }} />
              
              <div className="space-y-2">
                {[
                  { key: 'primary', label: 'Destaque' },
                  { key: 'bg', label: 'Abismo (Fundo)' },
                  { key: 'roomBg', label: 'Câmara (Fundo)' },
                  { key: 'corridor', label: 'Caminho' },
                  { key: 'text', label: 'Runas (Texto)' }
                ].map(({key, label}) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-black border border-stone-900 rounded shadow-inner">
                    <span className="text-[8px] uppercase text-stone-500 font-bold">{label}</span>
                    <input type="color" value={theme[key as keyof DungeonTheme] as string} onChange={e => setTheme({...theme, [key]: e.target.value})} className="w-8 h-8 bg-transparent border-none p-0 cursor-pointer rounded-full overflow-hidden" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {tab === 'icons' && (
          <section className="space-y-6 animate-in slide-in-from-left duration-200">
             <div className="flex justify-between items-center">
              <h3 className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Biblioteca Visual</h3>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-[8px] text-stone-700 font-bold uppercase">Ícones das Câmaras</h4>
              <div className="grid grid-cols-1 gap-1">
                {Object.keys(roomLabels).map((type) => (
                  <div key={type} className="flex items-center gap-2 p-2 bg-black border border-stone-900 hover:border-stone-700 transition-colors group">
                    <span className="text-[9px] uppercase text-stone-500 w-20 truncate">{roomLabels[type as RoomType]}</span>
                    <button 
                      onClick={() => setEditingIconType({type, category: 'room'})}
                      className="flex-1 bg-stone-900 border-none text-xs p-2 text-center text-white font-bold hover:bg-stone-800 transition-all rounded font-fa"
                    >
                      {/^[0-9a-fA-F]{4}$/.test(theme.roomIcons?.[type as RoomType] || '') 
                        ? String.fromCharCode(parseInt(theme.roomIcons?.[type as RoomType], 16)) 
                        : (theme.roomIcons?.[type as RoomType] || 'Auto')}
                    </button>
                  </div>
                ))}
              </div>

              <h4 className="text-[8px] text-stone-700 font-bold uppercase pt-2">Simbolismo de Corredor</h4>
              <div className="grid grid-cols-1 gap-1">
                {Object.keys(encLabels).map((type) => (
                  <div key={type} className="flex items-center gap-2 p-2 bg-black border border-stone-900 hover:border-stone-700 transition-colors group">
                    <span className="text-[9px] uppercase text-stone-500 w-20 truncate">{encLabels[type as EncounterType]}</span>
                    <button 
                      onClick={() => setEditingIconType({type, category: 'encounter'})}
                      className="flex-1 bg-stone-900 border-none text-xs p-2 text-center text-white font-bold hover:bg-stone-800 transition-all rounded font-fa"
                    >
                      {/^[0-9a-fA-F]{4}$/.test(theme.encounterIcons?.[type as EncounterType] || '') 
                        ? String.fromCharCode(parseInt(theme.encounterIcons?.[type as EncounterType], 16)) 
                        : (theme.encounterIcons?.[type as EncounterType] || 'Auto')}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {editingIconType && (
              <div className="absolute inset-0 bg-black/98 z-[60] p-6 animate-in zoom-in duration-150 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                   <h5 className="text-[10px] uppercase font-bold tracking-widest" style={{ color: theme.primary }}>Selecionar Símbolo</h5>
                   <button onClick={() => setEditingIconType(null)} className="text-stone-500 hover:text-white"><Plus size={16} className="rotate-45" /></button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-[8px] text-stone-600 uppercase mb-3 font-bold tracking-widest">Favoritos</p>
                    <div className="grid grid-cols-4 gap-2">
                      {[...savedIcons, ...DEFAULT_SUGGESTIONS].slice(0, 24).map(icon => (
                        <button 
                          key={icon} 
                          onClick={() => updateIcon(icon)}
                          className="p-3 bg-stone-900 text-lg border border-transparent hover:border-white transition-all rounded flex items-center justify-center font-fa"
                        >
                          {/^[0-9a-fA-F]{4}$/.test(icon) ? String.fromCharCode(parseInt(icon, 16)) : icon}
                        </button>
                      ))}
                      <button 
                        onClick={() => updateIcon('')}
                        className="p-3 bg-stone-950 text-[8px] uppercase font-bold text-stone-600 border border-stone-800 hover:border-red-500 transition-all rounded"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-6">
                    <p className="text-[8px] text-stone-600 uppercase mb-3 font-bold tracking-widest">Adicionar Novo (Hex ou Texto)</p>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={customInput}
                        placeholder="Ex: f523 ou ⚔️" 
                        className="flex-1 bg-stone-900 border border-stone-800 p-3 text-white text-xs outline-none focus:border-red-500"
                        onChange={(e) => setCustomInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCustomIcon()}
                      />
                      <button 
                        onClick={handleAddCustomIcon}
                        className="px-4 bg-stone-800 hover:bg-stone-700 text-white transition-all border border-stone-700"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="text-[7px] text-stone-700 uppercase mt-2 italic leading-relaxed">
                      Dica: Digite 4 caracteres hex para Font Awesome ou cole qualquer emoji.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {tab === 'hist' && (
          <section className="space-y-3 animate-in slide-in-from-left duration-200">
             <h3 className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Registros Passados</h3>
             {history.length === 0 && <p className="text-[8px] text-stone-700 uppercase italic">Nenhum mapa salvo...</p>}
             {history.map(map => (
                <div key={map.id} className="flex items-center gap-2 p-3 bg-black border border-stone-900 group hover:border-stone-500 transition-colors">
                  <button onClick={() => onLoadMap(map)} className="flex-1 text-left text-[9px] uppercase tracking-widest text-stone-500 group-hover:text-white transition-colors">{map.name}</button>
                  <button onClick={() => onDeleteMap(map.id)} className="text-stone-800 hover:text-red-700 transition-colors"><Trash2 size={12} /></button>
                </div>
              ))}
          </section>
        )}
      </div>

      <div className="p-6 border-t border-white/5 bg-black/60">
         <button 
          onClick={onExportPNG} 
          className="w-full py-4 bg-stone-900 border border-stone-800 text-[9px] uppercase tracking-[0.2em] font-bold text-stone-400 hover:text-white hover:border-white transition-all rounded flex items-center justify-center gap-3"
         >
           <Download size={14} /> Download PNG
         </button>
      </div>
    </aside>
  );
};

export default Sidebar;
