-- Drop unused global user role (RolesGuard / ADMIN were removed; board roles remain on BoardMember).
ALTER TABLE "User" DROP COLUMN "role";

DROP TYPE "Role";
