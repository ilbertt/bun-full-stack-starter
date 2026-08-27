import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { filesQueryOptions } from '../../queries/files';
import { api } from '../api';

// Far enough apart to be free, close enough to keep an idle socket off whatever timeout sits
// between the browser and the server.
const PING_INTERVAL_MS = 30_000;
const RECONNECT_DELAY_MS = 1_000;
const RECONNECT_MAX_DELAY_MS = 30_000;
const RECONNECT_BACKOFF = 2;

/**
 * Keeps the files cache honest while the page is open: what another tab — or another device —
 * uploads or deletes lands here without a refetch. The socket is the only live thing in the app,
 * so it is opened by whoever needs it and closed when they go away.
 */
export function useLiveEvents(): { connected: boolean } {
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let socket: ReturnType<typeof api.api.events.subscribe> | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | undefined;
    let reconnectDelay = RECONNECT_DELAY_MS;
    let unmounted = false;

    const connect = () => {
      // Same origin as every other call, so the session cookie rides along on the handshake and
      // the route's `auth: true` has a user before the upgrade is answered.
      socket = api.api.events.subscribe();

      socket.on('open', () => {
        reconnectDelay = RECONNECT_DELAY_MS;
        setConnected(true);
      });

      // A dropped connection and a refused one look the same from here, so the backoff is what
      // keeps a socket the server will never accept from becoming a busy loop.
      socket.on('close', () => {
        setConnected(false);
        if (unmounted) {
          return;
        }
        reconnectTimeout = setTimeout(connect, reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * RECONNECT_BACKOFF, RECONNECT_MAX_DELAY_MS);
      });

      socket.subscribe(({ data }) => {
        // `data` is the union the route declares as its `response`, narrowed by `type`: the
        // payload of each branch is typed, and a branch left unhandled is a compile error.
        switch (data.type) {
          case 'file.uploaded':
            queryClient.setQueryData(filesQueryOptions.queryKey, (files) =>
              // Newest first, like the list route orders it. Filtered, because the tab that did
              // the uploading also refetches and would otherwise hold the file twice.
              files ? [data.file, ...files.filter((file) => file.id !== data.file.id)] : files,
            );
            break;
          case 'file.deleted':
            queryClient.setQueryData(filesQueryOptions.queryKey, (files) =>
              files?.filter((file) => file.id !== data.fileId),
            );
            break;
          case 'pong':
            break;
        }
      });
    };

    connect();

    const pingInterval = setInterval(() => {
      // Typed against the route's `body`: `{ type: 'pong' }` here would not compile.
      if (socket?.ws.readyState === WebSocket.OPEN) {
        socket.send({ type: 'ping' });
      }
    }, PING_INTERVAL_MS);

    return () => {
      unmounted = true;
      clearInterval(pingInterval);
      clearTimeout(reconnectTimeout);
      socket?.close();
    };
  }, [queryClient]);

  return { connected };
}
