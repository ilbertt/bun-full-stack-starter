-- better-auth 1.7.3 restored the 1.6 account schema: an account is identified by
-- ("providerId", "accountId") again and nothing writes "issuer", so the not-null column left by
-- 1.7.0-1.7.2 rejects every sign-up and account link. The index goes first — SQLite refuses to
-- drop a column an index still covers.
drop index "auth_account_issuer_accountId_uidx";

alter table "auth_account" drop column "issuer";
