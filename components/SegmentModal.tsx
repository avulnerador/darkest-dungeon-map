
import React from 'react';
import { X, Sword, ShieldAlert, Ghost, Gift, Flame, Minus, Plus } from 'lucide-react';
import { EncounterType, CustomEncounter, DungeonTheme } from '../types';

interface SegmentModalProps {
  connId: string;
  segId: string;
  currentEncounter: EncounterType;
  customEncounters: CustomEncounter[];
  onClose: () => void;
  onUpdate: (encounter: EncounterType) => void;
  theme: DungeonTheme;
}

const SegmentModal: React.FC<SegmentModalProps> = ({ currentEncounter, customEncounters, onClose, onUpdate, theme }) => {
  const encounters: { type: EncounterType; label: string; icon: React.ReactNode; color: string }[] = [
    { type: 'NONE', label: 'Livre', icon: <Minus size={14} />, color: 'text-stone-600' },
    { type: 'BATTLE', label: 'Luta', icon: <Sword size={14} />, color: 'text-red-600' },
    { type: 'TRAP', label: 'Armadilha', icon: <ShieldAlert size={14} />, color: 'text-purple-500' },
    { type: 'OBSTACLE', label: 'Muro', icon: <Ghost size={14} />, color: 'text-stone-400' },
    { type: 'TREASURE', label: 'Item', icon: <Gift size={14} />, color: 'text-amber-400' },
    { type: 'HUNGER', label: 'Fome', icon: <Flame size={14} />, color: 'text-orange-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0a0a0a] border-2 w-full max-w-sm shadow-2xl" style={{ borderColor: theme.primary }}>
        <div className="flex items-center justify-between p-4 bg-black border-b border-white/5">
          <h2 className="font-cinzel font-bold text-xs tracking-widest uppercase" style={{ color: theme.primary }}>Evento de Corredor</h2>
          <button onClick={onClose} className="text-stone-700 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-4 space-y-4">
           <h3 className="text-[8px] uppercase tracking-widest text-stone-600 font-bold">Padrão</h3>
           <div className="grid grid-cols-3 gap-2">
            {encounters.map(e => (
              <button key={e.type} onClick={() => { onUpdate(e.type); onClose(); }} className={`flex flex-col items-center justify-center gap-2 p-2 border transition-all ${currentEncounter === e.type ? 'bg-white/5 border-stone-600' : 'bg-black border-stone-900 opacity-60'}`}>
                <div className={e.color}>{e.icon}</div>
                <span className="text-[7px] uppercase font-bold tracking-tighter">{e.label}</span>
              </button>
            ))}
          </div>

          <h3 className="text-[8px] uppercase tracking-widest text-stone-600 font-bold">Customizados</h3>
          <div className="grid grid-cols-2 gap-2">
            {customEncounters.map(ce => (
              <button key={ce.id} onClick={() => { onUpdate(ce.id); onClose(); }} className={`flex items-center gap-3 p-3 border bg-black ${currentEncounter === ce.id ? 'border-stone-500' : 'border-stone-900'}`}>
                <span style={{ color: ce.color }}>{ce.icon}</span>
                <span className="text-[8px] uppercase font-bold text-stone-400">{ce.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SegmentModal;
