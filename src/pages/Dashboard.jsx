import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Users, Activity, Pill, ClipboardList, TrendingUp, ArrowRight, Plus, Calendar, Bell } from "lucide-react";
import { Image as UIImage } from "@/components/ui/image";
import { CANCER_CATEGORIES, getCategory, getCategoryStyle } from "@/lib/cancerTypes";
import { useTranslation } from "@/lib/i18n";

function StatCard({ icon: Icon, label, value, accent, to, t }) {
  return (
    <Link
      to={to}
      className="group bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 font-medium">{label}</p>
          <p className="text-3xl font-semibold text-slate-800 mt-2 tracking-tight">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-center gap-1 mt-4 text-xs text-slate-400 group-hover:text-teal-600 transition-colors">
        {t("dash.view")} <ArrowRight className="w-3 h-3" />
      </div>
    </Link>
  );