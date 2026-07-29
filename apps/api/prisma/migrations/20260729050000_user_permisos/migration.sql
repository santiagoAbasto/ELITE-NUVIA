-- Adds granular module permissions for COORDINADOR (admin) users.
ALTER TABLE "users" ADD COLUMN "permisos" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
