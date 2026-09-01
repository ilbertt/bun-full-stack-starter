import type { FileRecord } from '#files/file.ts';
import { Repository } from '#repositories/repository.ts';

export class FilesRepository extends Repository {
  async create(file: FileRecord): Promise<void> {
    await this.sql.CreateFile`
      insert into "file"
        ("id", "user_id", "name", "size", "content_type", "storage_key", "created_at")
      values
        (${file.id}, ${file.user_id}, ${file.name}, ${file.size}, ${file.content_type},
         ${file.storage_key}, ${file.created_at})
    `;
  }

  async listByUser(userId: string): Promise<FileRecord[]> {
    return await this.sql.ListUserFiles`
      select "id", "user_id", "name", "size", "content_type", "storage_key", "created_at"
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
    const rows = await this.sql.FindUserFile`
      select "id", "user_id", "name", "size", "content_type", "storage_key", "created_at"
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
    const rows = await this.sql.DeleteUserFile`
      delete from "file"
      where "id" = ${fileId} and "user_id" = ${userId}
      returning "storage_key"
    `;
    return rows[0]?.storage_key ?? null;
  }
}
