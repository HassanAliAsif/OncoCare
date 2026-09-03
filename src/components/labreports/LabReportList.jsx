import React from "react";
import { FileText, Trash2, FlaskConical } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700",
  completed: "bg-teal-50 text-teal-700",
  reviewed: "bg-blue-50 text-blue-700",
};

const flagStyles = {
  normal: "bg-teal-50 text-teal-700",
  low: "bg-blue-50 text-blue-700",
  high: "bg-amber-50 text-amber-700",
  critical: "bg-rose-50 text-rose-600",
};

export default function LabReportList({ reports, canDelete, onDelete }) {
  const { t } = useTranslation();

  if (reports.length === 0) {
    return (
      <div className="p-10 text-center">
        <FlaskConical className="w-10 h-10 text-slate-200 mx-auto" />
        <p className="text-slate-400 mt-3 text-sm">{t("lab.noReports")}</p>
      </div>
    );
  }