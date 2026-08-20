import { NotFoundError } from '#lib/errors.ts';
import type { StorageClient } from '#lib/storage/storage.ts';
import { storageExtension } from '#lib/uploads.ts';
import type { FileRecord, FilesRepository } from '#repositories/files.repository.ts';
import { Service } from '#services/service.ts';

export class FilesService extends Service {
  private readonly filesRepo: FilesRepository;
  private readonly storage: StorageClient;

  constructor({
    filesRepo,
    storage,
  }: {
    filesRepo: FilesRepository;
    storage: StorageClient;
  }) {
    super();
    this.filesRepo = filesRepo;
    this.storage = storage;
  }

  async upload({ userId, file }: { userId: string; file: File }): Promise<FileRecord> {
    const id = crypto.randomUUID();
    const record: FileRecord = {
      id,
      userId,
      name: file.name,
      size: file.size,
      contentType: file.type,
      storageKey: this.storageKeyOf({ userId, fileId: id, fileName: file.name }),
      createdAt: new Date().toISOString(),
    };

    await this.storage.write(record.storageKey, file);

    try {
      await this.filesRepo.create(record);
    } catch (error) {
      // No transaction spans the store and the database. Of the two possible orphans only this
      // one is recoverable: a row without an object 404s forever, an object alone wastes space.
      await this.storage.delete(record.storageKey);
      throw error;
    }

    this.logger.info(`stored file ${record.id} (${record.size} bytes)`);
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

    if (!(await this.storage.exists(record.storageKey))) {
      throw new NotFoundError('File not found');
    }

    return { record, body: this.storage.file(record.storageKey) };
  }

  async remove({ fileId, userId }: { fileId: string; userId: string }): Promise<void> {
    const storageKey = await this.filesRepo.deleteForUser({ fileId, userId });
    if (!storageKey) {
      throw new NotFoundError('File not found');
    }

    await this.storage.delete(storageKey);
    this.logger.info(`removed file ${fileId}`);
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
