import type { FileRecord } from '#files/file.ts';
import { NotFoundError } from '#lib/errors.ts';
import { uuidv7 } from '#lib/id.ts';
import type { StorageClient } from '#lib/storage/storage.ts';
import { storageExtension } from '#lib/uploads.ts';
import type { FilesRepository } from '#repositories/files.repository.ts';
import type { EventsService } from '#services/events.service.ts';
import { Service } from '#services/service.ts';

const FILE_EXPIRATION_MS = 60_000;

export class FilesService extends Service {
  private readonly filesRepo: FilesRepository;
  private readonly storage: StorageClient;
  private readonly events: EventsService;

  constructor({
    filesRepo,
    storage,
    events,
  }: {
    filesRepo: FilesRepository;
    storage: StorageClient;
    events: EventsService;
  }) {
    super();
    this.filesRepo = filesRepo;
    this.storage = storage;
    this.events = events;
  }

  async upload({
    userId,
    file,
    expire = false,
  }: {
    userId: string;
    file: File;
    expire?: boolean;
  }): Promise<FileRecord> {
    const id = uuidv7();
    const now = new Date();
    const record: FileRecord = {
      id,
      user_id: userId,
      name: file.name,
      size: file.size,
      content_type: file.type,
      storage_key: this.storageKeyOf({ userId, fileId: id, fileName: file.name }),
      created_at: now.toISOString(),
      expires_at: expire ? new Date(now.getTime() + FILE_EXPIRATION_MS).toISOString() : null,
    };

    await this.storage.write(record.storage_key, file);

    try {
      await this.filesRepo.create(record);
    } catch (error) {
      // No transaction spans the store and the database. Of the two possible orphans only this
      // one is recoverable: a row without an object 404s forever, an object alone wastes space.
      await this.storage.delete(record.storage_key);
      throw error;
    }

    this.logger.info(`stored file ${record.id} (${record.size} bytes)`);
    // Told to every socket this user has open, this request's own tab included. Published after
    // the row exists, so a client that reacts by reading the list cannot lose the race.
    this.events.publish({ userId, event: { type: 'file.uploaded', file: record } });
    return record;
  }

  async list({ userId }: { userId: string }): Promise<FileRecord[]> {
    return await this.filesRepo.listByUser(userId);
  }

  async download({ fileId, userId }: { fileId: string; userId: string }): Promise<{
    record: FileRecord;
    body: Blob;
  }> {
    const record = await this.filesRepo.findForUser({ fileId, userId });
    if (!record) {
      throw new NotFoundError('File not found');
    }

    if (!(await this.storage.exists(record.storage_key))) {
      throw new NotFoundError('File not found');
    }

    return { record, body: this.storage.file(record.storage_key) };
  }

  async remove({ fileId, userId }: { fileId: string; userId: string }): Promise<void> {
    const storageKey = await this.filesRepo.deleteForUser({ fileId, userId });
    if (!storageKey) {
      throw new NotFoundError('File not found');
    }

    await this.storage.delete(storageKey);
    this.logger.info(`removed file ${fileId}`);
    this.events.publish({ userId, event: { type: 'file.deleted', fileId } });
  }

  async expire(): Promise<void> {
    const files = await this.filesRepo.listExpired(new Date().toISOString());
    for (const file of files) {
      try {
        // Keep the row until the bytes are gone so a failed cleanup can retry next minute.
        if (await this.storage.exists(file.storage_key)) {
          await this.storage.delete(file.storage_key);
        }
        const removed = await this.filesRepo.deleteForUser({
          fileId: file.id,
          userId: file.user_id,
        });
        if (removed) {
          this.logger.info(`expired file ${file.id}`);
          this.events.publish({
            userId: file.user_id,
            event: { type: 'file.deleted', fileId: file.id },
          });
        }
      } catch (error) {
        this.logger.error(`could not expire file ${file.id}`, error);
      }
    }
  }

  private storageKeyOf({
    userId,
    fileId,
    fileName,
  }: {
    userId: string;
    fileId: string;
    fileName: string;
  }): string {
    return `${userId}/${fileId}${storageExtension(fileName)}`;
  }
}
