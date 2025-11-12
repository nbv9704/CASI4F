'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingState from '@/components/LoadingState';
import useApi from '@/hooks/useApi';

export default function RoomRedirect({ params }) {
  const router = useRouter();
  const { roomId } = use(params);
  const api = useApi();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!api || redirecting) return;

    const fetchRoomAndRedirect = async () => {
      setRedirecting(true);
      try {
        console.log('[RoomRedirect] Fetching room:', roomId);
        const room = await api.get(`/pvp/${roomId}`);
        console.log('[RoomRedirect] Room data:', room);

        const gameType = room?.gameType || room?.game;
        if (gameType) {
          const targetUrl = `/game/battle/${gameType}/${roomId}`;
          console.log('[RoomRedirect] Redirecting to:', targetUrl);
          router.replace(targetUrl);
        } else {
          console.warn('[RoomRedirect] Room missing gameType:', room);
          router.push('/game');
        }
      } catch (error) {
        console.error('[RoomRedirect] Error fetching room:', error);
        router.push('/game');
      }
    };

    fetchRoomAndRedirect();
  }, [roomId, router, api, redirecting]);

  return <LoadingState message="Redirecting to room..." />;
}
