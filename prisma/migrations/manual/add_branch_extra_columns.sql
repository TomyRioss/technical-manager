-- Agregar columnas faltantes a la tabla branches
-- Estas columnas están definidas en el schema de Prisma pero no fueron incluidas en la migración original

ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "google_maps_url" TEXT;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "whatsapp_number" TEXT;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "business_hours" TEXT;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "map_latitude" DOUBLE PRECISION;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "map_longitude" DOUBLE PRECISION;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "facebook_url" TEXT;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "instagram_url" TEXT;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "tiktok_url" TEXT;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "twitter_url" TEXT;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "youtube_url" TEXT;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "phone_branch_ref" UUID;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "social_branch_ref" UUID;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "hours_branch_ref" UUID;
