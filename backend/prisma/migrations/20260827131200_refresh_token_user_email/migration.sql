-- Rename userName → email and backfill from User
ALTER TABLE "RefreshToken" RENAME COLUMN "userName" TO "email";

UPDATE "RefreshToken" AS rt
SET "email" = u.email
FROM "User" AS u
WHERE rt."userId" = u.id;
