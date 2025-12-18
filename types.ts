
export type RoomType = 'START' | 'BATTLE' | 'TREASURE' | 'CURIO' | 'BOSS' | 'EMPTY' | 'CAMP';
export type EncounterType = 'NONE' | 'BATTLE' | 'TRAP' | 'OBSTACLE' | 'TREASURE' | 'HUNGER' | string;

export interface DungeonTheme {
  primary: string;    
  bg: string;         
  roomBg: string;     
  corridor: string;   
  text: string;       
  masterModeOpacity: number;
  roomIcons: Record<RoomType, string>;
  encounterIcons: Record<EncounterType, string>;
}

export interface CustomEncounter {
  id: string;
  label: string;
  icon: string; 
  color: string;
}

export interface Room {
  id: string;
  type: RoomType;
  gridX: number;
  gridY: number;
  label: string;
  revealed: boolean;
  enemies?: string[];
}

export interface CorridorSegment {
  id: string;
  gridX: number;
  gridY: number;
  encounter: EncounterType;
  revealed: boolean;
}

export interface Connection {
  fromId: string;
  toId: string;
  segments: CorridorSegment[];
}

export interface Dungeon {
  id: string;
  name: string;
  rooms: Room[];
  connections: Connection[];
  createdAt: number;
  complexity: number;
  branching: number;
  theme: DungeonTheme;
}

export interface GeneratorConfig {
  complexity: number;
  branching: number;
}
