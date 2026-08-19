import { Repository } from '#repositories/repository.ts';

export interface FileRecord {
  id: string;
  userId: string;
  name: string;
  size: number;
  contentType: string;
  storageKey: string;
  createdAt: string;
}

export class FilesRepository extends Repository {
  async create(file: FileRecord): Promise<void> {
    await this.sql`
      insert into "file"
        ("id", "user_id", "name", "size", "content_type", "storage_key", "created_at")
      values
        (${file.id}, ${file.userId}, ${file.name}, ${file.size}, ${file.contentType},
         ${file.storageKey}, ${file.createdAt})
    `;
  }

  async listByUser(userId: string): Promise<FileRecord[]> {
    return await this.sql<FileRecord[]>`
      select "id", "user_id" as "userId", "name", "size", "content_type" as "contentType",
             "storage_key" as "storageKey", "created_at" as "createdAt"
      from "file"
      where "user_id" = ${userId}
      order by "created_at" desc
    `;
  }

  async findForUser({
    fileId,
    userId,
  }: {
    fileId: string;
    userId: string;
  }): Promise<FileRecord | null> {
    const rows = await this.sql<FileRecord[]>`
      select "id", "user_id" as "userId", "name", "size", "content_type" as "contentType",
             "storage_key" as "storageKey", "created_at" as "createdAt"
      from "file"
      where "id" = ${fileId} and "user_id" = ${userId}
    `;
    return rows[0] ?? null;
  }

  // Answers with the stored key so changing how keys are minted cannot strand old objects.
  async deleteForUser({
    fileId,
    userId,
  }: {
    fileId: string;
    userId: string;
  }): Promise<string | null> {
    const rows = await this.sql<Array<{ storageKey: string }>>`
      delete from "file"
      where "id" = ${fileId} and "user_id" = ${userId}
      returning "storage_key" as "storageKey"
    `;
    return rows[0]?.storageKey ?? null;
  }
}
