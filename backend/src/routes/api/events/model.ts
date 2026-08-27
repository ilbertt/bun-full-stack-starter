import { t } from 'elysia';
import { FileSchema } from '#routes/api/files/model.ts';

// Server → client. A union discriminated by `type`, which is what makes it worth declaring: Eden
// hands the frontend the same union, so a `switch` narrows each branch to its own payload and a
// branch nobody handles is a compile error rather than a message quietly dropped on the floor.
// `ws.send` checks a message against this before it goes out, exactly as a route checks a body.
export const ServerMessageSchema = t.Union([
  t.Object({ type: t.Literal('file.uploaded'), file: FileSchema }),
  t.Object({ type: t.Literal('file.deleted'), fileId: t.String() }),
  t.Object({ type: t.Literal('pong') }),
]);

// Client → server, and the same deal in the other direction: this is the socket's `body`, so
// anything that isn't it is answered with a validation error instead of reaching the handler.
export const ClientMessageSchema = t.Object({ type: t.Literal('ping') });
