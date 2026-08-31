import type { FileRecord } from '#domain/file.ts';

/** Something that happened to one user's data, the moment it happened. */
export type UserEvent =
  | { type: 'file.uploaded'; file: FileRecord }
  | { type: 'file.deleted'; fileId: string }
  | { type: 'echo'; text: string; at: Date; sockets: number };

export type UserEventListener = (event: UserEvent) => void;

export interface UserEventPublisher {
  publish({ userId, event }: { userId: string; event: UserEvent }): void;
}
