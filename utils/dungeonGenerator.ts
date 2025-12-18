
import { Room, RoomType, Connection, CorridorSegment, GeneratorConfig, EncounterType, DungeonTheme } from '../types';

class PRNG {
  private seed: number;
  constructor(seedStr: string) {
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = (hash << 5) - hash + seedStr.charCodeAt(i);
      hash |= 0;
    }
    this.seed = Math.abs(hash);
  }
  next() {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }
  range(min: number, max: number) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
}

export const generateProceduralDungeon = (config: GeneratorConfig, theme: DungeonTheme) => {
  const seed = Math.random().toString(36);
  const rng = new PRNG(seed);
  const rooms: Room[] = [];
  const connections: Connection[] = [];
  
  const TILE_SPACING_X = 14; 
  const TILE_SPACING_Y = 10;
  const layers = Math.max(3, Math.floor(config.complexity / 2));

  const startRoom: Room = {
    id: 'room-start',
    type: 'START',
    gridX: 0,
    gridY: 0,
    label: 'Old Road',
    revealed: true,
    enemies: []
  };
  rooms.push(startRoom);

  let prevLayerRooms: Room[] = [startRoom];

  for (let l = 1; l <= layers; l++) {
    const currentLayerRooms: Room[] = [];
    const roomsInLayer = l === layers ? 1 : rng.range(1, Math.min(3, config.branching + 1));
    
    for (let r = 0; r < roomsInLayer; r++) {
      const isBoss = l === layers;
      const type: RoomType = isBoss ? 'BOSS' : rng.pick(['BATTLE', 'BATTLE', 'CURIO', 'TREASURE', 'EMPTY', 'CAMP']);
      
      const newRoom: Room = {
        id: `room-${l}-${r}`,
        type,
        gridX: l * TILE_SPACING_X,
        gridY: Math.round((r - (roomsInLayer - 1) / 2) * TILE_SPACING_Y),
        label: isBoss ? 'The Horror' : `Chamber ${l}-${r}`,
        revealed: false,
        enemies: type === 'BATTLE' || isBoss ? ['Priest', 'Witch x2'] : []
      };
      currentLayerRooms.push(newRoom);
      rooms.push(newRoom);
    }

    currentLayerRooms.forEach((curr, idx) => {
      const parent = prevLayerRooms[idx % prevLayerRooms.length];
      connections.push(createConnection(parent, curr, rng, rooms));
    });

    prevLayerRooms = currentLayerRooms;
  }

  return { rooms, connections };
};

function createConnection(from: Room, to: Room, rng: PRNG, allRooms: Room[]): Connection {
  const segments: CorridorSegment[] = [];
  
  for (let x = Math.min(from.gridX, to.gridX); x <= Math.max(from.gridX, to.gridX); x++) {
    segments.push({
      id: `seg-h-${from.id}-${to.id}-${x}`,
      gridX: x,
      gridY: from.gridY,
      encounter: rng.next() > 0.9 ? 'BATTLE' : 'NONE',
      revealed: false
    });
  }

  const startY = Math.min(from.gridY, to.gridY);
  const endY = Math.max(from.gridY, to.gridY);
  for (let y = startY; y <= endY; y++) {
    segments.push({
      id: `seg-v-${from.id}-${to.id}-${y}`,
      gridX: to.gridX,
      gridY: y,
      encounter: rng.next() > 0.9 ? 'TRAP' : 'NONE',
      revealed: false
    });
  }

  // Aumentamos o buffer para 1.5 para garantir que o corredor nem encoste nas bordas visuais (64px)
  return { 
    fromId: from.id, 
    toId: to.id, 
    segments: segments.filter(s => {
      return !allRooms.some(r => {
        const dx = s.gridX - r.gridX;
        const dy = s.gridY - r.gridY;
        const distSq = dx*dx + dy*dy;
        return distSq < 2.25; // 1.5 * 1.5
      });
    }) 
  };
}
