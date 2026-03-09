const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";

export function generateSku(): string {
  let sku = "";
  for (let i = 0; i < 3; i++) sku += LETTERS[Math.floor(Math.random() * 26)];
  for (let i = 0; i < 6; i++) sku += DIGITS[Math.floor(Math.random() * 10)];
  for (let i = 0; i < 3; i++) sku += LETTERS[Math.floor(Math.random() * 26)];
  return sku;
}
