alter table "file" add column "expires_at" text;

create index "file_expires_at_idx" on "file" ("expires_at") where "expires_at" is not null;
