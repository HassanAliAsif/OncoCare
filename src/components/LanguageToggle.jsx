import React from "react";
import { Languages } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function LanguageToggle({ className = "" }) {
  const { lang, toggle } = useTranslation();
  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors ${className}`}
      title={lang === "en" ? "اردو میں دیکھیں" : "View in English"}
    >
      <Languages className="w-4 h-4" />
      {lang === "en" ? "اردو" : "English"}
    </button>
  );
}