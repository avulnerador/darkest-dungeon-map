
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
  
  const TILE_SPACING_X = 16; 
  const TILE_SPACING_Y = 12;
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
      connections.push(createConnection(parent, curr, rng));
    });

    prevLayerRooms = currentLayerRooms;
  }

  return { rooms, connections };
};

function createConnection(from: Room, to: Room, rng: PRNG): Connection {
  const segments: CorridorSegment[] = [];
  
  // Caminho Horizontal
  for (let x = from.gridX + 1; x <= to.gridX; x++) {
    segments.push({
      id: `seg-h-${from.id}-${to.id}-${x}`,
      gridX: x,
      gridY: from.gridY,
      encounter: rng.next() > 0.88 ? 'BATTLE' : 'NONE',
      revealed: false
    });
  }

  // Caminho Vertical (até o destino Y)
  const xJoint = to.gridX;
  const startY = from.gridY;
  const endY = to.gridY;
  const stepY = startY < endY ? 1 : -1;

  if (startY !== endY) {
    let currentY = startY + stepY;
    while (currentY !== endY + stepY) {
      segments.push({
        id: `seg-v-${from.id}-${to.id}-${currentY}`,
        gridX: xJoint,
        gridY: currentY,
        encounter: rng.next() > 0.92 ? 'TRAP' : 'NONE',
        revealed: false
      });
      currentY += stepY;
    }
  }

  // Filtrar segmentos que estão dentro da área ocupada pela sala (buffer de 1.5 grid units)
  return { 
    fromId: from.id, 
    toId: to.id, 
    segments: segments.filter(s => {
      const isOverFrom = Math.abs(s.gridX - from.gridX) <= 1 && Math.abs(s.gridY - from.gridY) <= 1;
      const isOverTo = Math.abs(s.gridX - to.gridX) <= 1 && Math.abs(s.gridY - to.gridY) <= 1;
      return !isOverFrom && !isOverTo;
    }) 
  };
}
