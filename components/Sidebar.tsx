
import React, { useState } from 'react';
import { Settings, Trash2, Shield, Palette, Ghost, Plus, LayoutTemplate, Sun, Sparkles } from 'lucide-react';
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

const Sidebar: React.FC<SidebarProps> = ({ config, setConfig, theme, setTheme, templates, hostilities, setHostilities, customEncounters, setCustomEncounters, onGenerate, onExportPNG, history, onLoadMap, onDeleteMap }) => {
  const [tab, setTab] = useState<'build'|'theme'|'icons'|'hist'>('build');
  const [newHost, setNewHost] = useState('');

  const roomLabels: Record<RoomType, string> = { START: 'Início', BATTLE: 'Luta', TREASURE: 'Ouro', CURIO: 'Curio', CAMP: 'Fogo', BOSS: 'Chefe', EMPTY: 'Vazio' };
  const encLabels: Record<EncounterType, string> = { BATTLE: 'Inimigo', TRAP: 'Trampa', TREASURE: 'Item', OBSTACLE: 'Parede', NONE: 'Nada' };

  return (
    <aside className="w-80 border-r flex flex-col h-full z-50 bg-[#050505]" style={{ borderColor: `${theme.primary}33` }}>
      <div className="p-6 flex items-center gap-4 border-b border-white/5 bg-black">
        <Shield size={24} style={{ color: theme.primary }} />
        <h2 className="font-cinzel text-xs font-bold tracking-[0.3em] text-white uppercase">Arquiteto</h2>
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
            className={`flex-1 p-4 flex justify-center transition-all border-b-2 ${tab === t.id ? 'text-red-500' : 'text-stone-600 border-transparent'}`}
            style={{ color: tab === t.id ? theme.primary : '', borderColor: tab === t.id ? theme.primary : '' }}
          >
            {t.icon}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {tab === 'build' && (
          <section className="space-y-6">
            <h3 className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Estrutura</h3>
            <div className="space-y-4">
              <label className="block text-[8px] text-stone-600 uppercase">Tamanho ({config.complexity})</label>
              <input type="range" min="5" max="40" value={config.complexity} onChange={e => setConfig({...config, complexity: parseInt(e.target.value)})} className="w-full accent-red-700" />
              <label className="block text-[8px] text-stone-600 uppercase">Ramificação ({config.branching})</label>
              <input type="range" min="1" max="5" value={config.branching} onChange={e => setConfig({...config, branching: parseInt(e.target.value)})} className="w-full accent-red-700" />
              <button onClick={onGenerate} className="w-full bg-black border py-4 font-cinzel text-[10px] tracking-widest uppercase font-bold transition-all hover:bg-stone-900" style={{ color: theme.primary, borderColor: theme.primary }}>Gerar Masmorra</button>
            </div>
          </section>
        )}

        {tab === 'theme' && (
          <section className="space-y-6">
            <h3 className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Estilo</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(templates).map(([name, t]) => (
                <button key={name} onClick={() => setTheme(t)} className="p-3 text-[9px] border border-stone-800 bg-black uppercase font-bold" style={{ color: t.primary, borderColor: theme.primary === t.primary ? t.primary : '' }}>{name}</button>
              ))}
            </div>
            <div className="space-y-4 pt-4 border-t border-white/5">
              <label className="text-[9px] uppercase text-stone-600 font-bold flex justify-between">
                Visibilidade Oculta <span>{Math.round(theme.masterModeOpacity * 100)}%</span>
              </label>
              <input type="range" min="0" max="1" step="0.05" value={theme.masterModeOpacity} onChange={e => setTheme({...theme, masterModeOpacity: parseFloat(e.target.value)})} className="w-full accent-red-700" />
              
              {['primary', 'bg', 'roomBg', 'corridor', 'text'].map(key => (
                <div key={key} className="flex items-center justify-between p-2 bg-black border border-stone-900">
                  <span className="text-[8px] uppercase text-stone-500">{key}</span>
                  <input type="color" value={theme[key as keyof DungeonTheme] as string} onChange={e => setTheme({...theme, [key]: e.target.value})} className="w-6 h-6 bg-transparent border-none p-0 cursor-pointer" />
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === 'icons' && (
          <section className="space-y-6">
            <h3 className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Ícones das Salas</h3>
            <div className="grid grid-cols-1 gap-2">
              {Object.keys(roomLabels).map((type) => (
                <div key={type} className="flex items-center gap-3 p-2 bg-black border border-stone-900">
                  <span className="text-[9px] uppercase text-stone-500 w-20">{roomLabels[type as RoomType]}</span>
                  <input 
                    type="text" 
                    value={theme.roomIcons?.[type as RoomType] || ''} 
                    maxLength={2}
                    onChange={e => setTheme({...theme, roomIcons: {...theme.roomIcons, [type]: e.target.value}})}
                    className="flex-1 bg-stone-900 border-none text-xs p-1 text-center text-white focus:ring-1 ring-red-500"
                    placeholder="Auto"
                  />
                </div>
              ))}
            </div>
            <h3 className="text-[9px] font-bold text-stone-500 uppercase tracking-widest pt-4 border-t border-white/5">Ícones Corredor</h3>
            <div className="grid grid-cols-1 gap-2">
              {Object.keys(encLabels).map((type) => (
                <div key={type} className="flex items-center gap-3 p-2 bg-black border border-stone-900">
                  <span className="text-[9px] uppercase text-stone-500 w-20">{encLabels[type as EncounterType]}</span>
                  <input 
                    type="text" 
                    value={theme.encounterIcons?.[type as EncounterType] || ''} 
                    maxLength={2}
                    onChange={e => setTheme({...theme, encounterIcons: {...theme.encounterIcons, [type]: e.target.value}})}
                    className="flex-1 bg-stone-900 border-none text-xs p-1 text-center text-white focus:ring-1 ring-red-500"
                    placeholder="Auto"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === 'hist' && (
          <section className="space-y-3">
             {history.map(map => (
                <div key={map.id} className="flex items-center gap-2 p-3 bg-black border border-stone-900 group">
                  <button onClick={() => onLoadMap(map)} className="flex-1 text-left text-[9px] uppercase tracking-widest text-stone-500 group-hover:text-white transition-colors">{map.name}</button>
                  <button onClick={() => onDeleteMap(map.id)} className="text-stone-800 hover:text-red-700 transition-colors"><Trash2 size={12} /></button>
                </div>
              ))}
          </section>
        )}
      </div>

      <div className="p-6 border-t border-white/5">
         <button onClick={onExportPNG} className="w-full py-4 bg-stone-900 border border-stone-800 text-[9px] uppercase tracking-[0.2em] font-bold text-stone-400 hover:text-white hover:border-white transition-all">Baixar PNG de Alta Definição</button>
      </div>
    </aside>
  );
};

export default Sidebar;
