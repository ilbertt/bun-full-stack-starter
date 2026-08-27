import { Elysia } from 'elysia';
import { authPlugin } from '#lib/auth/plugin.ts';
import { ClientMessageSchema, ServerMessageSchema } from '#routes/api/events/model.ts';
import { toFileResponse } from '#routes/api/files/model.ts';
import type { UserEvent } from '#services/events.service.ts';
import { EventsServicePlugin, loggerPlugin } from '#services/plugins.ts';

// `open` subscribes and `close` has to undo it, and a socket has nowhere to keep the unsubscribe
// of its own — so it is kept here, keyed by the connection. Weak, because a connection that goes
// away without `close` ever running takes its entry with it.
const unsubscribeBySocket = new WeakMap<object, () => void>();

function toServerMessage(event: UserEvent) {
  switch (event.type) {
    case 'file.uploaded':
      return { type: event.type, file: toFileResponse(event.file) } as const;
    case 'file.deleted':
      return { type: event.type, fileId: event.fileId } as const;
    case 'echo':
      return {
        type: event.type,
        text: event.text,
        at: event.at,
        sockets: event.sockets,
      } as const;
  }
}

export const EventsController = new Elysia()
  .use(loggerPlugin('eventsController'))
  .use(authPlugin)
  .use(EventsServicePlugin)
  // A websocket, but a route like any other: the `auth` macro resolves the session from the
  // handshake's cookies and rejects the upgrade with a 401 before any of this runs, so `user`
  // below is as real as it is in an HTTP handler.
  .ws('/events', {
    auth: true,
    detail: {
      tags: ['Events'],
      summary: 'Subscribe to live events',
      description:
        'A websocket that pushes the signed-in user’s file events to every tab they have open. ' +
        'Send `{ "type": "ping" }` to keep it warm; everything else is server-sent.',
    },
    body: ClientMessageSchema,
    response: ServerMessageSchema,
    open(ws) {
      const { user, eventsService, logger } = ws.data;
      logger.info(`socket ${ws.id} open for user ${user.id}`);

      unsubscribeBySocket.set(
        ws.raw,
        eventsService.subscribe({
          userId: user.id,
          listener: (event) => {
            ws.send(toServerMessage(event));
          },
        }),
      );
    },
    // `ws.body` is the parsed message, narrowed by the same union the client sends against —
    // nothing else can reach here, so there are exactly two cases and no `default` to write.
    //
    // Answered with `ws.send`/`publish` rather than by returning: as of Elysia 1.4.29 a returned
    // value is checked against `response` with the test inverted, so a valid message is what gets
    // replaced by a validation error. Both of these check it the right way round.
    message(ws) {
      const { user, eventsService } = ws.data;

      switch (ws.body.type) {
        case 'ping':
          // A keepalive nobody displays: it exists to keep an idle socket off a proxy's timeout.
          ws.send({ type: 'pong' });
          break;
        case 'echo':
          // Through the bus rather than straight back down this socket, so it reaches the user's
          // other tabs too — the same path a file event takes.
          eventsService.echo({ userId: user.id, text: ws.body.text });
          break;
      }
    },
    close(ws) {
      unsubscribeBySocket.get(ws.raw)?.();
      unsubscribeBySocket.delete(ws.raw);
      ws.data.logger.info(`socket ${ws.id} closed`);
    },
  });
