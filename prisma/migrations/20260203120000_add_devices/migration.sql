-- CreateTable
CREATE TABLE "device_brands" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "is_global" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "store_id" UUID,

    CONSTRAINT "device_brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_models" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "brand_id" UUID NOT NULL,

    CONSTRAINT "device_models_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (global brands unique name)
CREATE UNIQUE INDEX "device_brands_global_name_key" ON "device_brands"("name") WHERE "store_id" IS NULL;

-- CreateIndex (store-scoped brands unique name)
CREATE UNIQUE INDEX "device_brands_store_id_name_key" ON "device_brands"("store_id", "name") WHERE "store_id" IS NOT NULL;

-- CreateIndex
CREATE INDEX "device_brands_store_id_idx" ON "device_brands"("store_id");

-- CreateIndex
CREATE INDEX "device_brands_is_global_idx" ON "device_brands"("is_global");

-- CreateIndex
CREATE UNIQUE INDEX "device_models_brand_id_name_key" ON "device_models"("brand_id", "name");

-- CreateIndex
CREATE INDEX "device_models_brand_id_idx" ON "device_models"("brand_id");

-- AddForeignKey
ALTER TABLE "device_brands" ADD CONSTRAINT "device_brands_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_models" ADD CONSTRAINT "device_models_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "device_brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================
-- SEED: Catálogo Global de Dispositivos Precargados
-- ============================================================

-- Samsung
INSERT INTO "device_brands" ("id", "name", "is_global", "is_active", "store_id")
VALUES (gen_random_uuid(), 'Samsung', true, true, NULL);

WITH brand AS (
  SELECT id FROM "device_brands" WHERE "name" = 'Samsung' AND "store_id" IS NULL
)
INSERT INTO "device_models" ("id", "name", "is_active", "brand_id") VALUES
  (gen_random_uuid(), 'Galaxy S24 Ultra', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Galaxy S24+', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Galaxy S24', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Galaxy S23 Ultra', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Galaxy S23+', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Galaxy S23', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Galaxy S22 Ultra', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Galaxy S22+', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Galaxy S22', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Galaxy S21 Ultra', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Galaxy S21+', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Galaxy S21', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Galaxy S20 Ultra', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Galaxy S20+', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Galaxy S20', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Galaxy A55', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Galaxy A54', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Galaxy A35', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Galaxy A34', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Galaxy A25', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Galaxy A15', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Galaxy A14', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Galaxy A05', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Galaxy Z Fold 5', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Galaxy Z Fold 4', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Galaxy Z Flip 5', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Galaxy Z Flip 4', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Galaxy Note 20 Ultra', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Galaxy Note 20', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Galaxy M14', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Galaxy M34', true, (SELECT id FROM brand));

-- Apple
INSERT INTO "device_brands" ("id", "name", "is_global", "is_active", "store_id")
VALUES (gen_random_uuid(), 'Apple', true, true, NULL);

WITH brand AS (
  SELECT id FROM "device_brands" WHERE "name" = 'Apple' AND "store_id" IS NULL
)
INSERT INTO "device_models" ("id", "name", "is_active", "brand_id") VALUES
  (gen_random_uuid(), 'iPhone 16 Pro Max', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone 16 Pro', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone 16 Plus', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone 16', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone 15 Pro Max', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone 15 Pro', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone 15 Plus', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone 15', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone 14 Pro Max', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone 14 Pro', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone 14 Plus', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone 14', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone 13 Pro Max', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone 13 Pro', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone 13', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone 13 Mini', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone 12 Pro Max', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone 12 Pro', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone 12', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone 12 Mini', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone 11 Pro Max', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone 11 Pro', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone 11', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone SE (3ra gen)', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone SE (2da gen)', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone XS Max', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone XS', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone XR', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone X', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone 8 Plus', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone 8', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone 7 Plus', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'iPhone 7', true, (SELECT id FROM brand));

-- Motorola
INSERT INTO "device_brands" ("id", "name", "is_global", "is_active", "store_id")
VALUES (gen_random_uuid(), 'Motorola', true, true, NULL);

WITH brand AS (
  SELECT id FROM "device_brands" WHERE "name" = 'Motorola' AND "store_id" IS NULL
)
INSERT INTO "device_models" ("id", "name", "is_active", "brand_id") VALUES
  (gen_random_uuid(), 'Moto G84', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Moto G73', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Moto G54', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Moto G53', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Moto G34', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Moto G24', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Moto G14', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Moto G04', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Moto Edge 40 Pro', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Moto Edge 40', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Moto Edge 30 Ultra', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Moto Edge 30', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Moto Razr 40 Ultra', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Moto Razr 40', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Moto E22', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Moto E13', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Moto G Power', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Moto G Stylus', true, (SELECT id FROM brand));

-- Xiaomi
INSERT INTO "device_brands" ("id", "name", "is_global", "is_active", "store_id")
VALUES (gen_random_uuid(), 'Xiaomi', true, true, NULL);

WITH brand AS (
  SELECT id FROM "device_brands" WHERE "name" = 'Xiaomi' AND "store_id" IS NULL
)
INSERT INTO "device_models" ("id", "name", "is_active", "brand_id") VALUES
  (gen_random_uuid(), 'Redmi Note 13 Pro+', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Redmi Note 13 Pro', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Redmi Note 13', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Redmi Note 12 Pro+', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Redmi Note 12 Pro', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Redmi Note 12', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Redmi Note 11 Pro', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Redmi Note 11', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Redmi 13C', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Redmi 12', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Redmi A2', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'POCO X6 Pro', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'POCO X5 Pro', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'POCO M6 Pro', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'POCO F5', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Xiaomi 14 Ultra', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Xiaomi 14', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Xiaomi 13T Pro', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Xiaomi 13T', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Xiaomi 13', true, (SELECT id FROM brand));

-- Huawei
INSERT INTO "device_brands" ("id", "name", "is_global", "is_active", "store_id")
VALUES (gen_random_uuid(), 'Huawei', true, true, NULL);

WITH brand AS (
  SELECT id FROM "device_brands" WHERE "name" = 'Huawei' AND "store_id" IS NULL
)
INSERT INTO "device_models" ("id", "name", "is_active", "brand_id") VALUES
  (gen_random_uuid(), 'P60 Pro', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'P60', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'P50 Pro', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'P50', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'P40 Pro', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'P40 Lite', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'P30 Pro', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'P30 Lite', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Nova 12', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Nova 11', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Nova 10', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Y9a', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Y7a', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Y6p', true, (SELECT id FROM brand));

-- Realme
INSERT INTO "device_brands" ("id", "name", "is_global", "is_active", "store_id")
VALUES (gen_random_uuid(), 'Realme', true, true, NULL);

WITH brand AS (
  SELECT id FROM "device_brands" WHERE "name" = 'Realme' AND "store_id" IS NULL
)
INSERT INTO "device_models" ("id", "name", "is_active", "brand_id") VALUES
  (gen_random_uuid(), 'Realme 12 Pro+', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Realme 12 Pro', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Realme 11 Pro+', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Realme 11 Pro', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Realme C55', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Realme C35', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Realme C33', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Realme GT Neo 5', true, (SELECT id FROM brand));

-- TCL
INSERT INTO "device_brands" ("id", "name", "is_global", "is_active", "store_id")
VALUES (gen_random_uuid(), 'TCL', true, true, NULL);

WITH brand AS (
  SELECT id FROM "device_brands" WHERE "name" = 'TCL' AND "store_id" IS NULL
)
INSERT INTO "device_models" ("id", "name", "is_active", "brand_id") VALUES
  (gen_random_uuid(), 'TCL 40 SE', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'TCL 40 R', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'TCL 30 SE', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'TCL 30+', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'TCL 20 SE', true, (SELECT id FROM brand));

-- LG
INSERT INTO "device_brands" ("id", "name", "is_global", "is_active", "store_id")
VALUES (gen_random_uuid(), 'LG', true, true, NULL);

WITH brand AS (
  SELECT id FROM "device_brands" WHERE "name" = 'LG' AND "store_id" IS NULL
)
INSERT INTO "device_models" ("id", "name", "is_active", "brand_id") VALUES
  (gen_random_uuid(), 'K61', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'K52', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'K41S', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Velvet', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'V60 ThinQ', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'G8 ThinQ', true, (SELECT id FROM brand));

-- Nokia
INSERT INTO "device_brands" ("id", "name", "is_global", "is_active", "store_id")
VALUES (gen_random_uuid(), 'Nokia', true, true, NULL);

WITH brand AS (
  SELECT id FROM "device_brands" WHERE "name" = 'Nokia' AND "store_id" IS NULL
)
INSERT INTO "device_models" ("id", "name", "is_active", "brand_id") VALUES
  (gen_random_uuid(), 'Nokia G42', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Nokia G22', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Nokia C32', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Nokia C22', true, (SELECT id FROM brand));

-- Honor
INSERT INTO "device_brands" ("id", "name", "is_global", "is_active", "store_id")
VALUES (gen_random_uuid(), 'Honor', true, true, NULL);

WITH brand AS (
  SELECT id FROM "device_brands" WHERE "name" = 'Honor' AND "store_id" IS NULL
)
INSERT INTO "device_models" ("id", "name", "is_active", "brand_id") VALUES
  (gen_random_uuid(), 'Honor 90', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Honor X9b', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Honor X8a', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Honor X7a', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Honor Magic 5 Pro', true, (SELECT id FROM brand));

-- ZTE
INSERT INTO "device_brands" ("id", "name", "is_global", "is_active", "store_id")
VALUES (gen_random_uuid(), 'ZTE', true, true, NULL);

WITH brand AS (
  SELECT id FROM "device_brands" WHERE "name" = 'ZTE' AND "store_id" IS NULL
)
INSERT INTO "device_models" ("id", "name", "is_active", "brand_id") VALUES
  (gen_random_uuid(), 'ZTE Blade A54', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'ZTE Blade V40', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'ZTE Blade A53', true, (SELECT id FROM brand));

-- Google
INSERT INTO "device_brands" ("id", "name", "is_global", "is_active", "store_id")
VALUES (gen_random_uuid(), 'Google', true, true, NULL);

WITH brand AS (
  SELECT id FROM "device_brands" WHERE "name" = 'Google' AND "store_id" IS NULL
)
INSERT INTO "device_models" ("id", "name", "is_active", "brand_id") VALUES
  (gen_random_uuid(), 'Pixel 8 Pro', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Pixel 8', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Pixel 7a', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Pixel 7 Pro', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Pixel 7', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Pixel 6a', true, (SELECT id FROM brand));

-- Sony
INSERT INTO "device_brands" ("id", "name", "is_global", "is_active", "store_id")
VALUES (gen_random_uuid(), 'Sony', true, true, NULL);

WITH brand AS (
  SELECT id FROM "device_brands" WHERE "name" = 'Sony' AND "store_id" IS NULL
)
INSERT INTO "device_models" ("id", "name", "is_active", "brand_id") VALUES
  (gen_random_uuid(), 'Xperia 1 V', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Xperia 5 V', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'Xperia 10 V', true, (SELECT id FROM brand));

-- OnePlus
INSERT INTO "device_brands" ("id", "name", "is_global", "is_active", "store_id")
VALUES (gen_random_uuid(), 'OnePlus', true, true, NULL);

WITH brand AS (
  SELECT id FROM "device_brands" WHERE "name" = 'OnePlus' AND "store_id" IS NULL
)
INSERT INTO "device_models" ("id", "name", "is_active", "brand_id") VALUES
  (gen_random_uuid(), 'OnePlus 12', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'OnePlus 11', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'OnePlus Nord CE 3', true, (SELECT id FROM brand)),
  (gen_random_uuid(), 'OnePlus Nord N30', true, (SELECT id FROM brand));
