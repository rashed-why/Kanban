-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN "userName" TEXT NOT NULL DEFAULT '';

-- Backfill from User for existing rows
UPDATE "RefreshToken" AS rt
SET "userName" = u.name
FROM "User" AS u
WHERE rt."userId" = u.id;
