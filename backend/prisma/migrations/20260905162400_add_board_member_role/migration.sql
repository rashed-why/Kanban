-- CreateEnum
CREATE TYPE "BoardRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

-- AlterTable
ALTER TABLE "BoardMember" ADD COLUMN "role" "BoardRole" NOT NULL DEFAULT 'VIEWER';
