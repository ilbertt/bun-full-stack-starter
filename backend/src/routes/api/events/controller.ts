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
  return event.type === 'file.uploaded'
    ? ({ type: event.type, file: toFileResponse(event.file) } as const)
    : ({ type: event.type, fileId: event.fileId } as const);
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
    // Nothing but `{ type: 'ping' }` can arrive — the schema saw to that — so there is nothing
    // to branch on. The answer proves the socket is alive end to end, both ways.
    //
    // Answered with `ws.send` rather than by returning it: as of Elysia 1.4.29 a returned value
    // is checked against `response` with the test inverted, so a valid message is what gets
    // replaced by a validation error. `ws.send` checks it the right way round.
    message(ws) {
      ws.send({ type: 'pong' });
    },
    close(ws) {
      unsubscribeBySocket.get(ws.raw)?.();
      unsubscribeBySocket.delete(ws.raw);
      ws.data.logger.info(`socket ${ws.id} closed`);
    },
  });
