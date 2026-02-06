import Papa from "papaparse";
import * as XLSX from "xlsx";

export interface ParsedItem {
  sku: string;
  name: string;
  stock: number;
  costPrice: number | null;
  salePrice: number | null;
  isActive: boolean;
  category: string | null;
}

export interface ParseResult {
  items: ParsedItem[];
  duplicateSkus: Set<string>;
}

function findDuplicateSkus(items: ParsedItem[]): ParseResult {
  const counts = new Map<string, number>();

  for (const item of items) {
    const key = item.sku || item.name;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  const duplicateSkus = new Set<string>();
  for (const [key, count] of counts) {
    if (count > 1) {
      duplicateSkus.add(key);
    }
  }

  return { items, duplicateSkus };
}

interface RawRow {
  [key: string]: string | number | undefined;
}

function normalizeColumnName(col: string): string {
  const normalized = col.toLowerCase().trim();
  const mapping: Record<string, string> = {
    codigo: "sku",
    código: "sku",
    sku: "sku",
    descripcion: "name",
    descripción: "name",
    nombre: "name",
    name: "name",
    ctdad: "stock",
    cantidad: "stock",
    stock: "stock",
    precio: "costPrice",
    costo: "costPrice",
    costprice: "costPrice",
    precioventa: "salePrice",
    precio_venta: "salePrice",
    saleprice: "salePrice",
    venta: "salePrice",
    categoria: "category",
    categoría: "category",
    category: "category",
  };
  return mapping[normalized] || normalized;
}

function parseNumber(value: string | number | undefined): number | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "number") return value;
  const cleaned = value.toString().replace(/[,$]/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function rowToItem(row: RawRow): ParsedItem | null {
  const normalized: Record<string, string | number | undefined> = {};
  for (const [key, value] of Object.entries(row)) {
    normalized[normalizeColumnName(key)] = value;
  }

  const name = normalized.name?.toString().trim();
  if (!name) return null;

  const salePrice = parseNumber(normalized.salePrice);

  const category = normalized.category?.toString().trim() || null;

  return {
    sku: normalized.sku?.toString().trim() || "",
    name,
    stock: parseNumber(normalized.stock) ?? 0,
    costPrice: parseNumber(normalized.costPrice),
    salePrice,
    isActive: salePrice !== null && salePrice > 0,
    category,
  };
}

export function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<RawRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const items = results.data
          .map(rowToItem)
          .filter((item): item is ParsedItem => item !== null);
        resolve(findDuplicateSkus(items));
      },
      error: (error) => reject(error),
    });
  });
}

export function parseExcel(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<RawRow>(sheet);
        const items = rows
          .map(rowToItem)
          .filter((item): item is ParsedItem => item !== null);
        resolve(findDuplicateSkus(items));
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

export function parseFile(file: File): Promise<ParseResult> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "csv") {
    return parseCSV(file);
  }
  if (ext === "xlsx" || ext === "xls") {
    return parseExcel(file);
  }
  return Promise.reject(new Error("Formato de archivo no soportado. Usa CSV o Excel."));
}
