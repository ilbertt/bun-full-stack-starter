-- The cascade reaches rows only: deleting a user leaves its stored objects behind.
create table "file" (
  "id" text not null primary key,
  "user_id" text not null references "auth_user" ("id") on delete cascade,
  "name" text not null,
  "size" integer not null,
  "content_type" text not null,
  "storage_key" text not null unique,
  -- ISO-8601 with an explicit Z, never sqlite's own `datetime('now')`: that format carries no
  -- zone, so `t.Date()` reads it as local time and shifts it by the server's offset.
  "created_at" text not null
);

create index "file_user_id_idx" on "file" ("user_id");
