-- ============================================================
-- MIGRACIÓN: Sucursales (Multi-Branch) + Rol MANAGER
-- IMPORTANTE: Revisar y ejecutar manualmente en Supabase SQL Editor
-- ============================================================

-- 1. Agregar MANAGER al enum UserRole
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'MANAGER' BEFORE 'TECHNICIAN';

-- 2. Crear tabla branches
CREATE TABLE IF NOT EXISTS "branches" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "slug" TEXT,
  "address" TEXT,
  "phone" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "is_default" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "store_id" UUID NOT NULL,

  CONSTRAINT "branches_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "branches_slug_key" UNIQUE ("slug"),
  CONSTRAINT "branches_store_id_name_key" UNIQUE ("store_id", "name"),
  CONSTRAINT "branches_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "branches_store_id_idx" ON "branches"("store_id");

-- 3. Crear tabla user_branches
CREATE TABLE IF NOT EXISTS "user_branches" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "user_id" UUID NOT NULL,
  "branch_id" UUID NOT NULL,

  CONSTRAINT "user_branches_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "user_branches_user_id_branch_id_key" UNIQUE ("user_id", "branch_id"),
  CONSTRAINT "user_branches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "user_branches_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "user_branches_user_id_idx" ON "user_branches"("user_id");
CREATE INDEX IF NOT EXISTS "user_branches_branch_id_idx" ON "user_branches"("branch_id");

-- 4. Agregar columna branch_id (nullable) a tablas existentes
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "branch_id" UUID;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "branch_id" UUID;
ALTER TABLE "work_orders" ADD COLUMN IF NOT EXISTS "branch_id" UUID;
ALTER TABLE "receipts" ADD COLUMN IF NOT EXISTS "branch_id" UUID;

-- 5. Crear branch "Principal" por defecto para cada store existente
INSERT INTO "branches" ("name", "slug", "is_default", "store_id")
SELECT
  'Principal',
  ss."slug" || '-principal',
  true,
  s."id"
FROM "stores" s
LEFT JOIN "store_settings" ss ON ss."store_id" = s."id"
WHERE NOT EXISTS (
  SELECT 1 FROM "branches" b WHERE b."store_id" = s."id" AND b."is_default" = true
);

-- Para stores sin slug en store_settings, usar el id como fallback
UPDATE "branches"
SET "slug" = "store_id" || '-principal'
WHERE "slug" IS NULL AND "is_default" = true;

-- 6. Asignar datos existentes al branch por defecto
UPDATE "items" i
SET "branch_id" = b."id"
FROM "branches" b
WHERE b."store_id" = i."store_id" AND b."is_default" = true AND i."branch_id" IS NULL;

UPDATE "clients" c
SET "branch_id" = b."id"
FROM "branches" b
WHERE b."store_id" = c."store_id" AND b."is_default" = true AND c."branch_id" IS NULL;

UPDATE "work_orders" wo
SET "branch_id" = b."id"
FROM "branches" b
WHERE b."store_id" = wo."store_id" AND b."is_default" = true AND wo."branch_id" IS NULL;

UPDATE "receipts" r
SET "branch_id" = b."id"
FROM "branches" b
WHERE b."store_id" = r."store_id" AND b."is_default" = true AND r."branch_id" IS NULL;

-- 7. Asignar todos los users existentes al branch por defecto de su store
INSERT INTO "user_branches" ("user_id", "branch_id")
SELECT u."id", b."id"
FROM "users" u
JOIN "branches" b ON b."store_id" = u."store_id" AND b."is_default" = true
WHERE NOT EXISTS (
  SELECT 1 FROM "user_branches" ub WHERE ub."user_id" = u."id" AND ub."branch_id" = b."id"
);

-- 8. Hacer branch_id NOT NULL
ALTER TABLE "items" ALTER COLUMN "branch_id" SET NOT NULL;
ALTER TABLE "clients" ALTER COLUMN "branch_id" SET NOT NULL;
ALTER TABLE "work_orders" ALTER COLUMN "branch_id" SET NOT NULL;
ALTER TABLE "receipts" ALTER COLUMN "branch_id" SET NOT NULL;

-- 9. Agregar foreign keys para branch_id
ALTER TABLE "items" ADD CONSTRAINT "items_branch_id_fkey"
  FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "clients" ADD CONSTRAINT "clients_branch_id_fkey"
  FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_branch_id_fkey"
  FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_branch_id_fkey"
  FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 10. Crear índices para branch_id
CREATE INDEX IF NOT EXISTS "items_branch_id_idx" ON "items"("branch_id");
CREATE INDEX IF NOT EXISTS "clients_branch_id_idx" ON "clients"("branch_id");
CREATE INDEX IF NOT EXISTS "work_orders_branch_id_idx" ON "work_orders"("branch_id");
CREATE INDEX IF NOT EXISTS "receipts_branch_id_idx" ON "receipts"("branch_id");

-- 11. Actualizar unique constraints
-- Eliminar las viejas y crear las nuevas

-- Items: de [store_id, sku] a [branch_id, sku]
ALTER TABLE "items" DROP CONSTRAINT IF EXISTS "items_store_id_sku_key";
ALTER TABLE "items" ADD CONSTRAINT "items_branch_id_sku_key" UNIQUE ("branch_id", "sku");

-- WorkOrders: de [store_id, order_code] a [branch_id, order_code]
ALTER TABLE "work_orders" DROP CONSTRAINT IF EXISTS "work_orders_store_id_order_code_key";
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_branch_id_order_code_key" UNIQUE ("branch_id", "order_code");

-- Receipts: de [store_id, receipt_number] a [branch_id, receipt_number]
ALTER TABLE "receipts" DROP CONSTRAINT IF EXISTS "receipts_store_id_receipt_number_key";
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_branch_id_receipt_number_key" UNIQUE ("branch_id", "receipt_number");
