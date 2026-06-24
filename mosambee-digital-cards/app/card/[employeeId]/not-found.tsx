import Link from "next/link";
import { QrCode } from "lucide-react";

export default function CardNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <QrCode className="w-10 h-10 text-slate-400" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Card Not Found</h1>
        <p className="text-slate-400 text-sm mb-6">
          This digital business card does not exist or is inactive.
        </p>
        <a
          href="https://mosambee.com"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-medium transition-colors"
        >
          Visit Mosambee
        </a>
      </div>
    </div>
  );
}
