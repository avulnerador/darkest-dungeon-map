
import React, { useState, useEffect } from 'react';
import DungeonCanvas from '../components/DungeonCanvas';
import { Dungeon } from '../types';
import { useDungeonSync } from '../hooks/useDungeonSync';

const PlayerView: React.FC = () => {
  const [dungeon, setDungeon] = useState<Dungeon | null>(null);

  // Ao montar, tenta pegar o estado ativo do storage para visualização imediata
  useEffect(() => {
    const activeState = localStorage.getItem('dungeon_weaver_active_state');
    if (activeState) {
      try {
        setDungeon(JSON.parse(activeState));
      } catch (e) {
        console.error("Falha ao carregar estado inicial do jogador");
      }
    }
  }, []);

  // Ouve atualizações em tempo real vindas da aba do Mestre
  useDungeonSync((updatedDungeon) => {
    setDungeon(updatedDungeon);
  });

  if (!dungeon) {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center text-stone-600 gap-4">
        <div className="w-12 h-12 border-4 border-t-red-800 border-stone-900 rounded-full animate-spin"></div>
        <p className="font-cinzel text-[10px] tracking-[0.5em] uppercase animate-pulse">Aguardando Mestre...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden" style={{ backgroundColor: dungeon.theme.bg }}>
      <DungeonCanvas 
        dungeon={dungeon}
        setDungeon={() => {}} // Jogador não edita
        isMasterMode={false} // Sempre modo jogador
        onEditRoom={() => {}}
        onEditSegment={() => {}}
        onToggleRoom={() => {}}
        onToggleSegment={() => {}}
        customEncounters={[]}
      />
      
      {/* Overlay discreto de clima */}
      <div className="fixed inset-0 pointer-events-none opacity-20 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]"></div>
    </div>
  );
};

export default PlayerView;
