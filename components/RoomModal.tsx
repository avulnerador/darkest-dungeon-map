
import React, { useState } from 'react';
import { X, Sword, Coins, Skull, Info, Flag, Circle, Eye, EyeOff, Plus, Trash2, Flame } from 'lucide-react';
import { Room, RoomType, DungeonTheme } from '../types';

interface RoomModalProps {
  room: Room;
  onClose: () => void;
  onUpdate: (updates: Partial<Room>) => void;
  hostilities: string[];
  theme: DungeonTheme;
}

const RoomModal: React.FC<RoomModalProps> = ({ room, onClose, onUpdate, hostilities, theme }) => {
  const roomTypes: { type: RoomType; label: string; icon: React.ReactNode }[] = [
    { type: 'START', label: 'Entrada', icon: <Flag size={14} /> },
    { type: 'BATTLE', label: 'Inimigos', icon: <Sword size={14} /> },
    { type: 'TREASURE', label: 'Espólio', icon: <Coins size={14} /> },
    { type: 'CURIO', label: 'Curio', icon: <Info size={14} /> },
    { type: 'CAMP', label: 'Acampamento', icon: <Flame size={14} /> },
    { type: 'BOSS', label: 'Chefe', icon: <Skull size={14} /> },
    { type: 'EMPTY', label: 'Vazio', icon: <Circle size={14} /> },
  ];

  const addHostility = (h: string) => {
    const enemies = [...(room.enemies || []), h];
    onUpdate({ enemies });
  };

  const removeEnemy = (idx: number) => {
    const enemies = (room.enemies || []).filter((_, i) => i !== idx);
    onUpdate({ enemies });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#080808] border-2 w-full max-w-lg shadow-[0_0_150px_rgba(0,0,0,1)] flex flex-col" style={{ borderColor: theme.primary }}>
        <div className="flex items-center justify-between p-6 bg-black border-b border-white/5">
          <h2 className="font-cinzel font-bold uppercase tracking-[0.3em] text-sm" style={{ color: theme.primary }}>Registro de Câmara</h2>
          <button onClick={onClose} className="text-stone-700 hover:text-white transition-colors"><X size={24} /></button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
          <div className="space-y-4">
            <label className="block text-[9px] text-stone-600 uppercase font-bold tracking-widest font-cinzel">Natureza</label>
            <div className="grid grid-cols-4 gap-2">
              {roomTypes.map(rt => (
                <button key={rt.type} onClick={() => onUpdate({ type: rt.type })} className={`flex flex-col items-center justify-center gap-2 p-3 border transition-all ${room.type === rt.type ? 'bg-white/5' : 'bg-black opacity-40'}`} style={{ borderColor: room.type === rt.type ? theme.primary : '#222', color: room.type === rt.type ? theme.primary : '#555' }}>
                  {rt.icon} <span className="text-[7px] uppercase font-bold">{rt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-[9px] text-stone-600 uppercase font-bold tracking-widest font-cinzel">Presenças Hostis</label>
            <div className="flex flex-wrap gap-2 pb-4 border-b border-white/5">
              {hostilities.map((h, i) => (
                <button key={i} onClick={() => addHostility(h)} className="px-3 py-1 bg-stone-900 text-[8px] uppercase tracking-tighter hover:bg-stone-800 transition-colors">+{h}</button>
              ))}
            </div>
            <div className="space-y-1">
              {(room.enemies || []).map((e, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-black border border-stone-900 group">
                  <span className="text-[10px] text-stone-400 font-cinzel tracking-wider">{e}</span>
                  <button onClick={() => removeEnemy(idx)} className="text-stone-800 hover:text-red-700 opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-black flex justify-end gap-6 border-t border-white/5">
          <button onClick={onClose} className="px-10 py-3 text-[10px] font-cinzel font-bold uppercase tracking-[0.3em] transition-all" style={{ backgroundColor: theme.primary, color: 'white' }}>Confirmar</button>
        </div>
      </div>
    </div>
  );
};

export default RoomModal;
