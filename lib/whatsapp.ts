/**
 * WhatsApp placeholder - se integra después con API real.
 * Por ahora solo hace console.log.
 */

interface WhatsAppMessage {
  phone: string;
  message: string;
}

export async function sendWhatsAppMessage({ phone, message }: WhatsAppMessage) {
  console.log(`[WhatsApp Placeholder] Enviando a ${phone}:`);
  console.log(message);
  return { success: true, placeholder: true };
}

export function buildStatusChangeMessage(
  storeName: string,
  orderCode: string,
  statusLabel: string,
  trackingUrl?: string
) {
  let msg = `Hola! Te informamos desde ${storeName} que tu orden ${orderCode} cambió a: ${statusLabel}.`;
  if (trackingUrl) {
    msg += `\n\nPodés seguir el estado acá: ${trackingUrl}`;
  }
  return msg;
}

export function buildReceiptMessage(
  storeName: string,
  orderCode: string,
  deviceModel: string,
  trackingUrl?: string
) {
  let msg = `Hola! Recibimos tu equipo en ${storeName}.\n\nOrden: ${orderCode}\nEquipo: ${deviceModel}`;
  if (trackingUrl) {
    msg += `\n\nSeguí el estado acá: ${trackingUrl}`;
  }
  return msg;
}
