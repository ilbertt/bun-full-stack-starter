import type { UserEvent, UserEventListener, UserEventPublisher } from '#domain/event.ts';
import { createLogger } from '#lib/logger.ts';

/**
 * The fan-out behind the `/api/events` socket: a service publishes, and every socket that user
 * has open hears about it. In memory on purpose — the binary is a single process, so a listener
 * registered by a websocket handler sits in the same memory as the service that publishes to it.
 * Nothing is buffered either: a client that isn't connected misses the event and gets the current
 * state from the REST route the next time it asks. Two instances behind a load balancer would
 * need a real broker in here, and that is the one line that changes.
 */
export class EventsService implements UserEventPublisher {
  private readonly listenersByUser = new Map<string, Set<UserEventListener>>();
  private readonly logger = createLogger('EventsService');

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

  /**
   * What a client says, said back to every socket that user has open — the sender included. It
   * earns its place in a template twice over: it is the only thing here you can see working, and
   * it is the proof that a socket both subscribes to the fan-out and feeds it.
   *
   * The reply carries how many sockets it went to, because an echo that only says back what was
   * typed is indistinguishable from a page printing its own input. A count nobody but this
   * service could know is what makes the round trip visible — and it goes up when you open a
   * second tab, which is the fan-out explaining itself.
   */
  echo({ userId, text }: { userId: string; text: string }): void {
    const sockets = this.listenersByUser.get(userId)?.size ?? 0;
    this.publish({ userId, event: { type: 'echo', text, at: new Date(), sockets } });
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

export type EventsServiceContract = Pick<EventsService, 'subscribe' | 'echo' | 'publish'>;
