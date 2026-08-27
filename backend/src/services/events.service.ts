import type { FileRecord } from '#repositories/files.repository.ts';
import { Service } from '#services/service.ts';

/** Something that happened to one user's data, the moment it happened. */
export type UserEvent =
  | { type: 'file.uploaded'; file: FileRecord }
  | { type: 'file.deleted'; fileId: string };

type UserEventListener = (event: UserEvent) => void;

/**
 * The fan-out behind the `/api/events` socket: a service publishes, and every socket that user
 * has open hears about it. In memory on purpose — the binary is a single process, so a listener
 * registered by a websocket handler sits in the same memory as the service that publishes to it.
 * Nothing is buffered either: a client that isn't connected misses the event and gets the current
 * state from the REST route the next time it asks. Two instances behind a load balancer would
 * need a real broker in here, and that is the one line that changes.
 */
export class EventsService extends Service {
  private readonly listenersByUser = new Map<string, Set<UserEventListener>>();

  /** Answers with the unsubscribe: whoever subscribes owns tearing it down. */
  subscribe({ userId, listener }: { userId: string; listener: UserEventListener }): () => void {
    const listeners = this.listenersByUser.get(userId) ?? new Set<UserEventListener>();
    listeners.add(listener);
    this.listenersByUser.set(userId, listeners);

    return () => {
      listeners.delete(listener);
      // A user with nothing open leaves no empty set behind.
      if (listeners.size === 0) {
        this.listenersByUser.delete(userId);
      }
    };
  }

  publish({ userId, event }: { userId: string; event: UserEvent }): void {
    const listeners = this.listenersByUser.get(userId);
    if (!listeners) {
      return;
    }

    this.logger.info(`publishing ${event.type} to ${listeners.size} listener(s)`);
    for (const listener of listeners) {
      listener(event);
    }
  }
}
