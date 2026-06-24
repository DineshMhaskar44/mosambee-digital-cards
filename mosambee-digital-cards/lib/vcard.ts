import type { Employee } from "@/types";

/**
 * Generate a vCard 3.0 (.vcf) string from an employee record.
 * Compatible with both Android and iPhone contacts.
 */
export function generateVCard(employee: Employee): string {
  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",

    // Name — structured: FN is full display name, N is structured
    `FN:${escape(employee.full_name)}`,
    `N:${escape(employee.full_name)};;;`,

    // Organisation
    `ORG:${escape(process.env.NEXT_PUBLIC_COMPANY_NAME ?? "Mosambee")}`,
    `TITLE:${escape(employee.designation)}`,

    // Phone(s)
    `TEL;TYPE=CELL,VOICE:${employee.mobile_number}`,
  ];

  if (employee.alternate_number) {
    lines.push(`TEL;TYPE=WORK,VOICE:${employee.alternate_number}`);
  }

  if (employee.whatsapp_number) {
    lines.push(`TEL;TYPE=CELL,VOICE,X-WHATSAPP:${employee.whatsapp_number}`);
  }

  // Email
  lines.push(`EMAIL;TYPE=WORK:${employee.email}`);

  // Website
  if (employee.company_website) {
    lines.push(`URL;TYPE=WORK:${employee.company_website}`);
  }

  // LinkedIn
  if (employee.linkedin_url) {
    lines.push(`URL;TYPE=LinkedIn:${employee.linkedin_url}`);
  }

  // Address
  if (employee.office_address) {
    lines.push(`ADR;TYPE=WORK:;;${escape(employee.office_address)};;;;`);
  }

  // Photo (link-based — avoids huge base64 in vCard)
  if (employee.profile_photo_url) {
    lines.push(`PHOTO;VALUE=URL:${employee.profile_photo_url}`);
  }

  // Note
  lines.push(`NOTE:Digital Business Card — ${process.env.NEXT_PUBLIC_COMPANY_NAME ?? "Mosambee"}`);

  // Metadata
  lines.push(`REV:${new Date().toISOString()}`);
  lines.push("END:VCARD");

  return lines.join("\r\n");
}

/**
 * Escape special characters in vCard fields.
 * Commas, semicolons, backslashes, and newlines must be escaped.
 */
function escape(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");
}

/**
 * Generate filename for the .vcf download.
 */
export function vcardFilename(employee: Employee): string {
  const name = employee.full_name.toLowerCase().replace(/\s+/g, "-");
  return `${name}-mosambee.vcf`;
}
