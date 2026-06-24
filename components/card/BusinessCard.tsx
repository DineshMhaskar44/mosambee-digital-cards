"use client";

import { useEffect, useSearchParams } from "react";
import Image from "next/image";
import {
  Phone, Mail, Globe, MapPin, Linkedin,
  MessageCircle, FileText, Download, Share2,
} from "lucide-react";
import type { Employee } from "@/types";
import { whatsappUrl } from "@/lib/utils";
import { ShareButton } from "./ShareButton";

interface BusinessCardProps {
  employee: Employee;
}

export function BusinessCard({ employee }: BusinessCardProps) {
  const searchParams = useSearchParams();

  // Track scan on mount
  useEffect(() => {
    const referrer = searchParams.get("ref") ?? "direct";
    fetch(`/api/scan/${employee.employee_id}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ referrer }),
    }).catch(() => {}); // fire-and-forget; never block UX
  }, [employee.employee_id, searchParams]);

  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME ?? "Mosambee";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto animate-slide-up">

        {/* Card container */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl">

          {/* Hero banner */}
          <div className="relative h-32 bg-gradient-to-r from-brand-500 to-brand-700">
            {/* Company logo area */}
            <div className="absolute top-4 left-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">M</span>
                </div>
                <span className="text-white font-semibold text-sm">{companyName}</span>
              </div>
            </div>

            {/* Share button */}
            <div className="absolute top-4 right-4">
              <ShareButton employee={employee} />
            </div>

            {/* Profile photo — overlaps banner */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
              <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 overflow-hidden bg-gray-100 shadow-lg">
                {employee.profile_photo_url ? (
                  <Image
                    src={employee.profile_photo_url}
                    alt={employee.full_name}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-brand-100 flex items-center justify-center">
                    <span className="text-brand-600 font-bold text-3xl">
                      {employee.full_name[0]}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Identity */}
          <div className="pt-16 pb-4 px-6 text-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {employee.full_name}
            </h1>
            <p className="text-brand-500 font-medium text-sm mt-0.5">{employee.designation}</p>
            <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">
              {employee.department} · {companyName}
            </p>
          </div>

          {/* Divider */}
          <div className="mx-6 border-t border-gray-100 dark:border-slate-700" />

          {/* Contact info */}
          <div className="px-6 py-4 space-y-3">
            <InfoRow icon={<Phone className="w-4 h-4" />} label={employee.mobile_number} href={`tel:${employee.mobile_number}`} />
            <InfoRow icon={<Mail className="w-4 h-4" />}  label={employee.email}         href={`mailto:${employee.email}`} truncate />
            {employee.company_website && (
              <InfoRow icon={<Globe className="w-4 h-4" />} label={employee.company_website.replace(/^https?:\/\//, "")} href={employee.company_website} external />
            )}
            {employee.office_address && (
              <InfoRow icon={<MapPin className="w-4 h-4" />} label={employee.office_address} />
            )}
          </div>

          {/* Quick action buttons */}
          <div className="px-4 pb-4 grid grid-cols-3 gap-2.5">
            <ActionBtn
              href={`tel:${employee.mobile_number}`}
              icon={<Phone className="w-5 h-5" />}
              label="Call"
              color="bg-green-500 hover:bg-green-600"
            />
            {employee.whatsapp_number && (
              <ActionBtn
                href={whatsappUrl(employee.whatsapp_number)}
                icon={<MessageCircle className="w-5 h-5" />}
                label="WhatsApp"
                color="bg-[#25D366] hover:bg-[#1ebe5d]"
                external
              />
            )}
            <ActionBtn
              href={`mailto:${employee.email}`}
              icon={<Mail className="w-5 h-5" />}
              label="Email"
              color="bg-blue-500 hover:bg-blue-600"
            />
            {employee.company_website && (
              <ActionBtn
                href={employee.company_website}
                icon={<Globe className="w-5 h-5" />}
                label="Website"
                color="bg-slate-600 hover:bg-slate-700"
                external
              />
            )}
            {employee.company_profile_pdf && (
              <ActionBtn
                href={employee.company_profile_pdf}
                icon={<FileText className="w-5 h-5" />}
                label="Profile"
                color="bg-orange-500 hover:bg-orange-600"
                external
              />
            )}
            {/* Save Contact — vCard */}
            <ActionBtn
              href={`/api/vcard/${employee.employee_id}`}
              icon={<Download className="w-5 h-5" />}
              label="Save"
              color="bg-brand-500 hover:bg-brand-600"
              download
            />
          </div>

          {/* LinkedIn */}
          {employee.linkedin_url && (
            <div className="px-4 pb-4">
              <a
                href={employee.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                           bg-[#0A66C2] text-white text-sm font-medium
                           hover:bg-[#095ab5] transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                Connect on LinkedIn
              </a>
            </div>
          )}

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-slate-900/50 px-6 py-3 text-center">
            <p className="text-xs text-gray-400 dark:text-slate-500">
              Digital Business Card · {companyName}
            </p>
          </div>
        </div>

        {/* Card views counter */}
        <p className="text-center text-slate-500 text-xs mt-4">
          Powered by Mosambee Digital Cards
        </p>
      </div>
    </div>
  );
}

// ---- Sub-components ----

function InfoRow({
  icon, label, href, external, truncate,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  external?: boolean;
  truncate?: boolean;
}) {
  const cls = `flex items-center gap-3 text-sm text-gray-700 dark:text-slate-300
               ${href ? "hover:text-brand-500 transition-colors" : ""}`;

  const content = (
    <>
      <span className="text-brand-500 flex-shrink-0">{icon}</span>
      <span className={truncate ? "truncate" : ""}>{label}</span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={cls}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {content}
      </a>
    );
  }

  return <div className={cls}>{content}</div>;
}

function ActionBtn({
  href, icon, label, color, external, download,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  external?: boolean;
  download?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      download={download}
      className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl text-white
                  transition-all duration-200 active:scale-95 ${color}`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </a>
  );
}
