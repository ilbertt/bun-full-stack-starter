import { t } from 'elysia';
import { FileSchema } from '#routes/api/files/model.ts';

// Long enough to say something, short enough that a socket can't be used to push payloads around.
const MAX_ECHO_LENGTH = 200;

// Server → client. A union discriminated by `type`, which is what makes it worth declaring: Eden
// hands the frontend the same union, so a `switch` narrows each branch to its own payload and a
// branch nobody handles is a compile error rather than a message quietly dropped on the floor.
// `ws.send` checks a message against this before it goes out, exactly as a route checks a body.
export const ServerMessageSchema = t.Union([
  t.Object({ type: t.Literal('file.uploaded'), file: FileSchema }),
  t.Object({ type: t.Literal('file.deleted'), fileId: t.String() }),
  // `t.Date()` for the same reason a row's timestamp gets one: Eden revives a date-shaped string
  // into a `Date` on the way in, over a socket exactly as over a response.
  t.Object({ type: t.Literal('echo'), text: t.String(), at: t.Date() }),
  t.Object({ type: t.Literal('pong') }),
]);

// Client → server, and the same deal in the other direction: this is the socket's `body`, so
// anything that isn't it — a `type` nobody serves, an empty or oversized `text` — is answered
// with a validation error instead of reaching the handler.
export const ClientMessageSchema = t.Union([
  t.Object({ type: t.Literal('ping') }),
  t.Object({
    type: t.Literal('echo'),
    text: t.String({ minLength: 1, maxLength: MAX_ECHO_LENGTH }),
  }),
]);
