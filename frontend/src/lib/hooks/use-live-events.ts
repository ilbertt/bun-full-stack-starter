import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { filesQueryOptions } from '../../queries/files';
import { api } from '../api';

// Far enough apart to be free, close enough to keep an idle socket off whatever timeout sits
// between the browser and the server.
const PING_INTERVAL_MS = 30_000;
const RECONNECT_DELAY_MS = 1_000;
const RECONNECT_MAX_DELAY_MS = 30_000;
const RECONNECT_BACKOFF = 2;
// A window, not a history: the panel is there to show the socket working, not to keep a log.
// Oldest first, newest at the bottom, so a round trip reads downwards the way frames do in
// devtools — the line you sent, then the line that came back under it.
const MAX_LOG_ENTRIES = 8;

type EventsSocket = ReturnType<typeof api.api.events.subscribe>;

/**
 * Every message the route can send, derived from the client rather than written out again —
 * the same rule a response type follows, and for the same reason.
 */
export type ServerMessage = Parameters<Parameters<EventsSocket['subscribe']>[0]>[0]['data'];

/**
 * One frame, in whichever direction it went. Both are kept so the panel reads like the frames
 * pane in devtools: an echo shows as the line you sent and the line that came back, which is the
 * only way a round trip is visible at all.
 */
type LogEntryBody =
  | { direction: 'sent'; text: string }
  | { direction: 'received'; message: ServerMessage };

export type LogEntry = LogEntryBody & { id: number };

/**
 * The page's connection to `/api/events`: it keeps the files cache honest — what another tab, or
 * another device, uploads or deletes lands here without a refetch — and hands back the last few
 * frames plus a way to send one, which is the only part of any of this you can see working.
 */
export function useLiveEvents(): {
  connected: boolean;
  log: LogEntry[];
  send: (text: string) => void;
} {
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  // The live socket, so `send` can reach the one that is currently open rather than the one that
  // existed when the component last rendered.
  const socketRef = useRef<EventsSocket | null>(null);
  const nextIdRef = useRef(0);

  // Messages carry no id of their own, and two identical echoes are a legitimate thing to send.
  const appendToLog = useCallback((entry: LogEntryBody) => {
    nextIdRef.current += 1;
    const id = nextIdRef.current;
    setLog((entries) => [...entries, { ...entry, id }].slice(-MAX_LOG_ENTRIES));
  }, []);

  useEffect(() => {
    let reconnectTimeout: ReturnType<typeof setTimeout> | undefined;
    let reconnectDelay = RECONNECT_DELAY_MS;
    let unmounted = false;

    const connect = () => {
      // Same origin as every other call, so the session cookie rides along on the handshake and
      // the route's `auth: true` has a user before the upgrade is answered.
      const socket = api.api.events.subscribe();
      socketRef.current = socket;

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
          case 'echo':
            break;
          case 'pong':
            // The keepalive answering itself. Shown to nobody: once every thirty seconds it would
            // be the only thing in the panel.
            return;
        }

        appendToLog({ direction: 'received', message: data });
      });
    };

    connect();

    const pingInterval = setInterval(() => {
      if (socketRef.current?.ws.readyState === WebSocket.OPEN) {
        socketRef.current.send({ type: 'ping' });
      }
    }, PING_INTERVAL_MS);

    return () => {
      unmounted = true;
      clearInterval(pingInterval);
      clearTimeout(reconnectTimeout);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [queryClient, appendToLog]);

  const send = useCallback(
    (text: string) => {
      if (socketRef.current?.ws.readyState !== WebSocket.OPEN) {
        return;
      }
      // Typed against the route's `body`: a `type` the server doesn't serve would not compile.
      socketRef.current.send({ type: 'echo', text });
      // Logged as sent, not as an answer: what comes back arrives over the socket like any other
      // message, and lands in the log on its own.
      appendToLog({ direction: 'sent', text });
    },
    [appendToLog],
  );

  return { connected, log, send };
}
