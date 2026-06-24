import QRCode from "qrcode";
import { cardUrl } from "./utils";

export interface QROptions {
  size?: number;
  color?: { dark?: string; light?: string };
  margin?: number;
}

/**
 * Generate a QR code as a PNG Buffer (for server-side use).
 * Points to the employee's public digital card URL with ?ref=qr tracking.
 */
export async function generateQRCodeBuffer(
  employeeId: string,
  options: QROptions = {}
): Promise<Buffer> {
  const url = `${cardUrl(employeeId)}?ref=qr`;

  const qrBuffer = await QRCode.toBuffer(url, {
    type: "png",
    width: options.size ?? 512,
    margin: options.margin ?? 2,
    color: {
      dark: options.color?.dark ?? "#1e293b",   // slate-800
      light: options.color?.light ?? "#ffffff",
    },
    errorCorrectionLevel: "H", // High — allows logo overlay
  });

  return qrBuffer;
}

/**
 * Generate a QR code as a base64 data URL (for client-side display).
 */
export async function generateQRCodeDataURL(
  employeeId: string,
  options: QROptions = {}
): Promise<string> {
  const url = `${cardUrl(employeeId)}?ref=qr`;

  return QRCode.toDataURL(url, {
    width: options.size ?? 300,
    margin: options.margin ?? 2,
    color: {
      dark: options.color?.dark ?? "#1e293b",
      light: options.color?.light ?? "#ffffff",
    },
    errorCorrectionLevel: "H",
  });
}

/**
 * Upload a QR code PNG to Supabase Storage and return the public URL.
 * Requires a Supabase admin client instance.
 */
export async function uploadQRCode(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  employeeId: string,
  employeeDbId: string
): Promise<string | null> {
  try {
    const buffer = await generateQRCodeBuffer(employeeId);

    const path = `qr-codes/${employeeDbId}.png`;
    const { error } = await supabase.storage
      .from("qr-codes")
      .upload(path, buffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (error) {
      console.error("QR upload error:", error);
      return null;
    }

    const { data } = supabase.storage.from("qr-codes").getPublicUrl(path);
    return data.publicUrl;
  } catch (err) {
    console.error("QR generation error:", err);
    return null;
  }
}
