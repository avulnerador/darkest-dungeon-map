
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Eye, EyeOff, PlusCircle, ExternalLink } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import DungeonCanvas from '../components/DungeonCanvas';
import Sidebar from '../components/Sidebar';
import RoomModal from '../components/RoomModal';
import SegmentModal from '../components/SegmentModal';
import { Dungeon, Room, GeneratorConfig, EncounterType, DungeonTheme, CustomEncounter } from '../types';
import { generateProceduralDungeon } from '../utils/dungeonGenerator';
import { useDungeonSync } from '../hooks/useDungeonSync';

const STORAGE_KEY = 'dungeon_weaver_v5_master';

const DEFAULT_ICONS = {
  rooms: { START: '🚩', BATTLE: '⚔️', TREASURE: '💰', CURIO: '🕯️', CAMP: '🔥', BOSS: '💀', EMPTY: '🔘' },
  encounters: { BATTLE: '⚔️', TRAP: '⚠️', TREASURE: '💎', OBSTACLE: '🧱', NONE: '' }
};

const DEFAULT_THEME: DungeonTheme = {
  primary: '#f43f5e', 
  bg: '#050505',
  roomBg: '#111111',
  corridor: '#1c1c1c',
  text: '#e7e5e4',
  masterModeOpacity: 0.35,
  roomIcons: { ...DEFAULT_ICONS.rooms },
  encounterIcons: { ...DEFAULT_ICONS.encounters }
};

const TEMPLATES: Record<string, DungeonTheme> = {
  'Darkest': DEFAULT_THEME,
  'Toxic': { ...DEFAULT_THEME, primary: '#22c55e', bg: '#050a05', roomBg: '#101a10', corridor: '#152515' },
  'Frozen': { ...DEFAULT_THEME, primary: '#38bdf8', bg: '#020810', roomBg: '#0a1a2f', corridor: '#0f253f' },
  'Ethereal': { ...DEFAULT_THEME, primary: '#a855f7', bg: '#050510', roomBg: '#101025', corridor: '#151530' }
};

const MasterView: React.FC = () => {
  const [dungeon, setDungeon] = useState<Dungeon | null>(null);
  const [config, setConfig] = useState<GeneratorConfig>({ complexity: 12, branching: 2 });
  const [theme, setTheme] = useState<DungeonTheme>(DEFAULT_THEME);
  const [isMasterMode, setIsMasterMode] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<{connId: string, segId: string} | null>(null);
  const [hostilities, setHostilities] = useState<string[]>(['Esqueleto', 'Culti', 'Aranha', 'Wraith']);
  const [customEncounters, setCustomEncounters] = useState<CustomEncounter[]>([]);
  const [myMaps, setMyMaps] = useState<Dungeon[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  
  const { broadcastDungeon } = useDungeonSync();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setMyMaps(parsed);
      if (parsed.length > 0) {
        const lastDungeon = parsed[0];
        setDungeon(lastDungeon);
        setTheme(lastDungeon.theme || DEFAULT_THEME);
      }
    }
  }, []);

  useEffect(() => {
    if (dungeon && JSON.stringify(dungeon.theme) !== JSON.stringify(theme)) {
      setDungeon(prev => prev ? { ...prev, theme } : null);
    }
  }, [theme]);

  useEffect(() => {
    if (dungeon) {
      broadcastDungeon(dungeon);
      const updatedHistory = [dungeon, ...myMaps.filter(m => m.id !== dungeon.id)].slice(0, 15);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      localStorage.setItem('dungeon_weaver_active_state', JSON.stringify(dungeon));
    }
  }, [dungeon, broadcastDungeon]);

  const handleGenerate = () => {
    const { rooms, connections } = generateProceduralDungeon(config, theme);
    const newDungeon: Dungeon = {
      id: crypto.randomUUID(),
      name: `Masmorra #${Math.floor(Math.random()*900)+100}`,
      complexity: config.complexity,
      branching: config.branching,
      rooms,
      connections,
      createdAt: Date.now(),
      theme
    };
    setDungeon(newDungeon);
    setMyMaps(prev => [newDungeon, ...prev.filter(m => m.id !== newDungeon.id)].slice(0, 15));
  };

  const handleExportPNG = async () => {
    const node = document.getElementById('dungeon-inner-canvas');
    if (!node || isExporting) return;
    
    setIsExporting(true);
    try {
      const dataUrl = await htmlToImage.toPng(node, {
        backgroundColor: theme.bg,
        quality: 1.0,
        pixelRatio: 2
      });
      const link = document.createElement('a');
      link.download = `${dungeon?.name || 'masmorra'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Falha na exportação:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenPlayer = () => {
    window.open('/#/player', '_blank');
  };

  return (
    <div className="flex h-screen w-full text-[#e7e5e4] overflow-hidden select-none font-inter" style={{ backgroundColor: theme.bg }}>
      <Sidebar 
        config={config} setConfig={setConfig}
        theme={theme} setTheme={setTheme}
        templates={TEMPLATES}
        hostilities={hostilities} setHostilities={setHostilities}
        customEncounters={customEncounters} setCustomEncounters={setCustomEncounters}
        onGenerate={handleGenerate}
        onExportPNG={handleExportPNG} 
        isMasterMode={isMasterMode} setIsMasterMode={setIsMasterMode}
        history={myMaps} 
        onLoadMap={(d) => { setDungeon(d); setTheme(d.theme); }}
        onDeleteMap={(id) => { const u = myMaps.filter(m => m.id !== id); setMyMaps(u); localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); }}
      />

      <main className="flex-1 relative flex flex-col">
        <header className="h-16 border-b flex items-center justify-between px-8 z-10 bg-black/95" style={{ borderColor: `${theme.primary}44` }}>
          <div className="flex items-center gap-6">
            <h1 className="font-cinzel text-lg font-bold tracking-[0.4em] uppercase" style={{ color: theme.primary }}>
              {dungeon?.name || 'Mestre da Masmorra'}
            </h1>
            <button 
              onClick={handleOpenPlayer}
              className="flex items-center gap-2 px-4 py-2 text-[8px] font-bold uppercase tracking-widest bg-stone-900 border border-stone-800 hover:border-white transition-all text-stone-400 hover:text-white"
            >
              <ExternalLink size={12} /> Abrir Visão do Jogador
            </button>
          </div>
          <button 
            onClick={() => setIsMasterMode(!isMasterMode)}
            className={`flex items-center gap-3 px-6 py-2 text-[10px] font-cinzel font-bold border transition-all ${isMasterMode ? 'bg-red-950/20' : 'opacity-40'}`}
            style={{ color: isMasterMode ? theme.primary : '#888', borderColor: isMasterMode ? theme.primary : '#333' }}
          >
            {isMasterMode ? <Eye size={14} /> : <EyeOff size={14} />} {isMasterMode ? 'Modo Mestre' : 'Modo Jogador'}
          </button>
        </header>

        <div className="flex-1 relative overflow-hidden">
          {isExporting && (
            <div className="absolute inset-0 z-[100] bg-black/80 flex items-center justify-center">
              <p className="font-cinzel text-xl animate-pulse tracking-widest uppercase" style={{ color: theme.primary }}>Gerando Atlas...</p>
            </div>
          )}
          {dungeon ? (
            <DungeonCanvas 
              dungeon={dungeon} 
              setDungeon={setDungeon} 
              isMasterMode={isMasterMode} 
              onEditRoom={setSelectedRoomId} 
              onEditSegment={(c, s) => setSelectedSegment({connId: c, segId: s})} 
              onToggleRoom={(id) => setDungeon({...dungeon, rooms: dungeon.rooms.map(r => r.id === id ? {...r, revealed: !r.revealed} : r)})}
              onToggleSegment={(c, s) => setDungeon({...dungeon, connections: dungeon.connections.map(conn => `${conn.fromId}-${conn.toId}` === c ? {...conn, segments: conn.segments.map(seg => seg.id === s ? {...seg, revealed: !seg.revealed} : seg)} : conn)})}
              customEncounters={customEncounters} 
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-10 gap-8">
              <PlusCircle size={100} />
              <p className="font-cinzel text-xl tracking-[0.5em] uppercase">Iniciar Expedição</p>
            </div>
          )}
        </div>
      </main>

      {selectedRoomId && dungeon && <RoomModal room={dungeon.rooms.find(r => r.id === selectedRoomId)!} onClose={() => setSelectedRoomId(null)} onUpdate={(u) => setDungeon({...dungeon, rooms: dungeon.rooms.map(r => r.id === selectedRoomId ? {...r, ...u} : r)})} hostilities={hostilities} theme={theme} />}
      {selectedSegment && dungeon && <SegmentModal connId={selectedSegment.connId} segId={selectedSegment.segId} currentEncounter={dungeon.connections.find(c => `${c.fromId}-${c.toId}` === selectedSegment.connId)?.segments.find(s => s.id === selectedSegment.segId)?.encounter || 'NONE'} onClose={() => setSelectedSegment(null)} onUpdate={(e) => setDungeon({...dungeon, connections: dungeon.connections.map(conn => `${conn.fromId}-${conn.toId}` === selectedSegment.connId ? {...conn, segments: conn.segments.map(s => s.id === selectedSegment.segId ? {...s, encounter: e} : s)} : conn)})} customEncounters={customEncounters} theme={theme} />}
    </div>
  );
};

export default MasterView;
