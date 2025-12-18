
import { useEffect, useRef, useCallback } from 'react';
import { Dungeon } from '../types';

const CHANNEL_NAME = 'dungeon_weaver_sync_v1';

export const useDungeonSync = (onUpdate?: (dungeon: Dungeon) => void) => {
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);
    
    if (onUpdate) {
      channelRef.current.onmessage = (event) => {
        if (event.data && typeof event.data === 'object') {
          onUpdate(event.data as Dungeon);
        }
      };
    }

    return () => {
      channelRef.current?.close();
    };
  }, [onUpdate]);

  const broadcastDungeon = useCallback((dungeon: Dungeon) => {
    channelRef.current?.postMessage(dungeon);
  }, []);

  return { broadcastDungeon };
};
