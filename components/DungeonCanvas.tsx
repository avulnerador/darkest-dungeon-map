
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Sword, Coins, Skull, Info, Flag, Circle, Lock, X, Flame, Ghost, ShieldAlert, Gift
} from 'lucide-react';
import { Dungeon, Room, RoomType, Connection, EncounterType, CustomEncounter } from '../types';

interface DungeonCanvasProps {
  dungeon: Dungeon;
  setDungeon: (d: Dungeon) => void;
  isMasterMode: boolean;
  onEditRoom: (id: string) => void;
  onEditSegment: (connId: string, segId: string) => void;
  onToggleRoom: (id: string) => void;
  onToggleSegment: (connId: string, segId: string) => void;
  customEncounters: CustomEncounter[];
}

const CELL_SIZE = 40;

const GenericIcon = ({ char, size = 18 }: { char: string, size?: number }) => (
  <div style={{ fontSize: size }} className="font-bold flex items-center justify-center leading-none select-none">
    {char}
  </div>
);

const DungeonCanvas: React.FC<DungeonCanvasProps> = ({ dungeon, setDungeon, isMasterMode, onEditRoom, onEditSegment, onToggleRoom, onToggleSegment, customEncounters }) => {
  const [viewState, setViewState] = useState({ x: 200, y: window.innerHeight / 2, scale: 0.8 });
  const [isPanning, setIsPanning] = useState(false);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<{ x: number, y: number, content: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = dungeon.theme;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Shift') setIsShiftPressed(true); };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.key === 'Shift') setIsShiftPressed(false); };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const zoomSpeed = 0.0015;
    const delta = -e.deltaY * zoomSpeed;
    const newScale = Math.min(Math.max(viewState.scale + delta, 0.15), 4);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const dx = (mouseX - viewState.x) / viewState.scale;
    const dy = (mouseY - viewState.y) / viewState.scale;
    setViewState(prev => ({ scale: newScale, x: mouseX - dx * newScale, y: mouseY - dy * newScale }));
  }, [viewState]);

  const handlePointerDown = (e: React.PointerEvent) => { if (e.button === 0) setIsPanning(true); };
  const handlePointerMove = useCallback((e: PointerEvent) => { if (isPanning) setViewState(prev => ({ ...prev, x: prev.x + e.movementX, y: prev.y + e.movementY })); }, [isPanning]);
  const handlePointerUp = useCallback(() => setIsPanning(false), []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const renderRoomIcon = (type: RoomType) => {
    const custom = theme.roomIcons?.[type];
    if (custom) return <GenericIcon char={custom} size={28} />;
    switch (type) {
      case 'START': return <Flag size={28} fill="currentColor" />;
      case 'BATTLE': return <Sword size={28} fill="currentColor" />;
      case 'TREASURE': return <Coins size={28} fill="currentColor" />;
      case 'BOSS': return <Skull size={32} fill="currentColor" />;
      case 'CAMP': return <Flame size={28} fill="currentColor" />;
      case 'CURIO': return <Info size={28} fill="currentColor" />;
      default: return <Circle size={10} fill="currentColor" />;
    }
  };

  const renderEncounterIcon = (type: EncounterType) => {
    const custom = theme.encounterIcons?.[type] || customEncounters.find(ce => ce.id === type)?.icon;
    if (custom) return <GenericIcon char={custom} size={14} />;
    switch (type) {
      case 'BATTLE': return <X size={16} strokeWidth={4} className="text-red-500" />;
      case 'TRAP': return <ShieldAlert size={16} className="text-purple-400" />;
      case 'TREASURE': return <Gift size={16} className="text-amber-400" />;
      case 'OBSTACLE': return <Ghost size={16} className="text-stone-400" />;
      default: return null;
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing relative"
      style={{ backgroundColor: theme.bg }}
      onPointerDown={handlePointerDown}
      onPointerMove={(e) => handlePointerMove(e.nativeEvent)}
      onPointerUp={handlePointerUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div 
        id="dungeon-inner-canvas"
        className="transition-transform duration-75 ease-out origin-top-left absolute inset-0 pointer-events-none"
        style={{ transform: `translate(${viewState.x}px, ${viewState.y}px) scale(${viewState.scale})` }}
      >
        <div className="relative pointer-events-auto">
          {dungeon.connections.map(conn => (
            <React.Fragment key={`${conn.fromId}-${conn.toId}`}>
              {conn.segments.map(seg => {
                const isVisible = isMasterMode || seg.revealed;
                if (!isVisible) return null;
                return (
                  <div
                    key={seg.id}
                    onClick={(e) => { if (isMasterMode && e.ctrlKey) onToggleSegment(`${conn.fromId}-${conn.toId}`, seg.id); }}
                    onMouseEnter={(e) => isMasterMode && setHoveredElement({ x: e.clientX, y: e.clientY, content: `Evento: ${seg.encounter || 'Vazio'}` })}
                    onMouseLeave={() => setHoveredElement(null)}
                    onContextMenu={(e) => { e.preventDefault(); if (isMasterMode) onEditSegment(`${conn.fromId}-${conn.toId}`, seg.id); }}
                    className={`absolute w-[30px] h-[30px] border flex items-center justify-center transition-all ${seg.revealed ? 'opacity-100' : ''} ${isMasterMode ? 'cursor-help' : ''}`}
                    style={{ 
                      left: seg.gridX * CELL_SIZE - 15, 
                      top: seg.gridY * CELL_SIZE - 15,
                      backgroundColor: theme.corridor,
                      borderColor: seg.revealed ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                      opacity: seg.revealed ? 1 : theme.masterModeOpacity,
                      borderStyle: seg.revealed ? 'solid' : 'dashed'
                    }}
                  >
                    <div className="flex items-center justify-center">{renderEncounterIcon(seg.encounter)}</div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}

          {dungeon.rooms.map(room => {
            const isVisible = isMasterMode || room.revealed;
            if (!isVisible) return null;
            return (
              <div
                key={room.id}
                onClick={(e) => { if (isMasterMode && e.ctrlKey) onToggleRoom(room.id); }}
                onMouseEnter={(e) => isMasterMode && setHoveredElement({ x: e.clientX, y: e.clientY, content: `Sala: ${room.label}\nHostilidades: ${room.enemies?.join(', ') || 'Nenhuma'}` })}
                onMouseLeave={() => setHoveredElement(null)}
                onContextMenu={(e) => { e.preventDefault(); if (isMasterMode) onEditRoom(room.id); }}
                className={`absolute w-[64px] h-[64px] border-4 flex items-center justify-center transition-all z-20 group ${isMasterMode ? 'cursor-pointer' : ''}`}
                style={{ 
                  left: room.gridX * CELL_SIZE - 32, 
                  top: room.gridY * CELL_SIZE - 32,
                  backgroundColor: theme.roomBg,
                  borderColor: room.revealed ? theme.primary : `${theme.primary}55`,
                  opacity: room.revealed ? 1 : theme.masterModeOpacity,
                  borderStyle: room.revealed ? 'solid' : 'dashed',
                  boxShadow: room.revealed ? `0 0 40px rgba(0,0,0,0.6), inset 0 0 10px ${theme.primary}33` : 'none'
                }}
              >
                {room.revealed ? renderRoomIcon(room.type) : <Lock size={20} className="text-stone-700" />}
                
                <div 
                  className="absolute -top-7 whitespace-nowrap text-[9px] uppercase tracking-widest font-bold font-cinzel text-center pointer-events-none w-[180px]"
                  style={{ color: room.revealed ? theme.text : '#444' }}
                >
                  {room.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isShiftPressed && isMasterMode && hoveredElement && (
        <div 
          className="fixed z-[999] bg-black/90 border-2 p-3 text-[10px] uppercase font-cinzel text-white pointer-events-none shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-75"
          style={{ left: hoveredElement.x + 20, top: hoveredElement.y + 20, borderColor: theme.primary }}
        >
          <div className="whitespace-pre-line font-bold mb-1">{hoveredElement.content}</div>
          <div className="text-[8px] text-stone-500 opacity-60">Status da Expedição</div>
        </div>
      )}
    </div>
  );
};

export default DungeonCanvas;
