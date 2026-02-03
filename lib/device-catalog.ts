// Catálogo global de dispositivos precargados
// Se inserta automáticamente en la BD si no existen marcas globales

export const DEFAULT_DEVICE_CATALOG: Record<string, string[]> = {
  Samsung: [
    "Galaxy S24 Ultra", "Galaxy S24+", "Galaxy S24",
    "Galaxy S23 Ultra", "Galaxy S23+", "Galaxy S23",
    "Galaxy S22 Ultra", "Galaxy S22+", "Galaxy S22",
    "Galaxy S21 Ultra", "Galaxy S21+", "Galaxy S21",
    "Galaxy S20 Ultra", "Galaxy S20+", "Galaxy S20",
    "Galaxy A55", "Galaxy A54", "Galaxy A35", "Galaxy A34",
    "Galaxy A25", "Galaxy A15", "Galaxy A14", "Galaxy A05",
    "Galaxy Z Fold 5", "Galaxy Z Fold 4",
    "Galaxy Z Flip 5", "Galaxy Z Flip 4",
    "Galaxy Note 20 Ultra", "Galaxy Note 20",
    "Galaxy M14", "Galaxy M34",
  ],
  Apple: [
    "iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 16 Plus", "iPhone 16",
    "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15 Plus", "iPhone 15",
    "iPhone 14 Pro Max", "iPhone 14 Pro", "iPhone 14 Plus", "iPhone 14",
    "iPhone 13 Pro Max", "iPhone 13 Pro", "iPhone 13", "iPhone 13 Mini",
    "iPhone 12 Pro Max", "iPhone 12 Pro", "iPhone 12", "iPhone 12 Mini",
    "iPhone 11 Pro Max", "iPhone 11 Pro", "iPhone 11",
    "iPhone SE (3ra gen)", "iPhone SE (2da gen)",
    "iPhone XS Max", "iPhone XS", "iPhone XR", "iPhone X",
    "iPhone 8 Plus", "iPhone 8", "iPhone 7 Plus", "iPhone 7",
  ],
  Motorola: [
    "Moto G84", "Moto G73", "Moto G54", "Moto G53",
    "Moto G34", "Moto G24", "Moto G14", "Moto G04",
    "Moto Edge 40 Pro", "Moto Edge 40",
    "Moto Edge 30 Ultra", "Moto Edge 30",
    "Moto Razr 40 Ultra", "Moto Razr 40",
    "Moto E22", "Moto E13",
    "Moto G Power", "Moto G Stylus",
  ],
  Xiaomi: [
    "Redmi Note 13 Pro+", "Redmi Note 13 Pro", "Redmi Note 13",
    "Redmi Note 12 Pro+", "Redmi Note 12 Pro", "Redmi Note 12",
    "Redmi Note 11 Pro", "Redmi Note 11",
    "Redmi 13C", "Redmi 12", "Redmi A2",
    "POCO X6 Pro", "POCO X5 Pro", "POCO M6 Pro", "POCO F5",
    "Xiaomi 14 Ultra", "Xiaomi 14",
    "Xiaomi 13T Pro", "Xiaomi 13T", "Xiaomi 13",
  ],
  Huawei: [
    "P60 Pro", "P60", "P50 Pro", "P50",
    "P40 Pro", "P40 Lite", "P30 Pro", "P30 Lite",
    "Nova 12", "Nova 11", "Nova 10",
    "Y9a", "Y7a", "Y6p",
  ],
  Realme: [
    "Realme 12 Pro+", "Realme 12 Pro",
    "Realme 11 Pro+", "Realme 11 Pro",
    "Realme C55", "Realme C35", "Realme C33",
    "Realme GT Neo 5",
  ],
  TCL: [
    "TCL 40 SE", "TCL 40 R", "TCL 30 SE", "TCL 30+", "TCL 20 SE",
  ],
  LG: [
    "K61", "K52", "K41S", "Velvet", "V60 ThinQ", "G8 ThinQ",
  ],
  Nokia: [
    "Nokia G42", "Nokia G22", "Nokia C32", "Nokia C22",
  ],
  Honor: [
    "Honor 90", "Honor X9b", "Honor X8a", "Honor X7a", "Honor Magic 5 Pro",
  ],
  ZTE: [
    "ZTE Blade A54", "ZTE Blade V40", "ZTE Blade A53",
  ],
  Google: [
    "Pixel 8 Pro", "Pixel 8", "Pixel 7a", "Pixel 7 Pro", "Pixel 7", "Pixel 6a",
  ],
  Sony: [
    "Xperia 1 V", "Xperia 5 V", "Xperia 10 V",
  ],
  OnePlus: [
    "OnePlus 12", "OnePlus 11", "OnePlus Nord CE 3", "OnePlus Nord N30",
  ],
};
