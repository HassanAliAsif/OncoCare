import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
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
}

export default function Dashboard() {
  const [stats, setStats] = useState({ patients: 0, activePlans: 0, medications: 0, updates: 0 });
  const [recentPatients, setRecentPatients] = useState([]);
  const [cancerDist, setCancerDist] = useState([]);
  const [upcomingAppts, setUpcomingAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      try {
        const [patients, plans, meds, updates, appts] = await Promise.all([
          base44.entities.Patient.list("-created_date", 200),
          base44.entities.TreatmentPlan.filter({ status: "in_progress" }),
          base44.entities.Medication.filter({ status: "active" }),
          base44.entities.ProgressUpdate.list("-update_date", 1),
          base44.entities.Appointment.list("-appointment_date", 500),
        ]);
        setStats({
          patients: patients.length,
          activePlans: plans.length,
          medications: meds.length,
          updates: updates.length,
        });
        setRecentPatients(patients.slice(0, 6));
        const counts = {};
        patients.forEach((p) => {
          const cat = p.cancer_type ? getCategory(p.cancer_type) : "carcinoma";
          counts[cat] = (counts[cat] || 0) + 1;
        });
        setCancerDist(
          Object.entries(CANCER_CATEGORIES).map(([key, style]) => ({
            key,
            label: style.label,
            count: counts[key] || 0,
            style,
          }))
        );
        setUpcomingAppts(
          appts
            .filter((a) => new Date(a.appointment_date) >= new Date() && a.status === "scheduled")
            .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))
            .slice(0, 5)
        );
      } catch (e) {
        // empty app
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statusStyles = {
    active: "bg-teal-50 text-teal-700",
    on_treatment: "bg-blue-50 text-blue-700",
    on_break: "bg-amber-50 text-amber-700",
    completed: "bg-slate-100 text-slate-600",
    deceased: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">{t("dash.welcome")}</h1>
          <p className="text-slate-400 mt-1 text-sm">{t("dash.overview")}</p>
        </div>
        <Link
          to="/patients"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors w-fit"
        >
          <Plus className="w-4 h-4" />
          {t("dash.addPatient")}
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard t={t} icon={Users} label={t("dash.totalPatients")} value={stats.patients} accent="bg-teal-50 text-teal-600" to="/patients" />
        <StatCard t={t} icon={ClipboardList} label={t("dash.activePlans")} value={stats.activePlans} accent="bg-blue-50 text-blue-600" to="/patients" />
        <StatCard t={t} icon={Pill} label={t("dash.activeMeds")} value={stats.medications} accent="bg-violet-50 text-violet-600" to="/patients" />
        <StatCard t={t} icon={Activity} label={t("dash.progressUpdates")} value={stats.updates} accent="bg-amber-50 text-amber-600" to="/patients" />
      </div>

      {/* Cancer Type Distribution */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Activity className="w-4 h-4 text-teal-600" />
          <h2 className="font-semibold text-slate-800">{t("dash.cancerDist")}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {cancerDist.map((c) => {
            const total = stats.patients || 1;
            const pct = Math.round((c.count / total) * 100);
            return (
              <div key={c.key} className="rounded-xl border border-slate-100 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${c.style.dot}`} />
                  <span className="text-xs font-medium text-slate-600">{c.label}</span>
                </div>
                <p className="text-2xl font-semibold text-slate-800">{c.count}</p>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
                  <div className={`h-full rounded-full ${c.style.bar}`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">{pct}{t("dash.ofTotal")}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Treatment Reminders */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-4 h-4 text-teal-600" />
          <h2 className="font-semibold text-slate-800">{t("reminders.title")}</h2>
        </div>
        {upcomingAppts.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">{t("reminders.noReminders")}</p>
        ) : (
          <div className="space-y-3">
            {upcomingAppts.map((a) => {
              const days = Math.ceil((new Date(a.appointment_date) - new Date()) / (1000 * 60 * 60 * 24));
              const dayLabel = days === 0 ? t("reminders.today") : days === 1 ? t("reminders.tomorrow") : `${t("reminders.apptIn")} ${days} ${t("reminders.days")}`;
              return (
                <Link key={a.id} to={`/patients/${a.patient_id}`} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-teal-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{a.patient_name} — {a.title}</p>
                      <p className="text-xs text-slate-400">{new Date(a.appointment_date).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-teal-600 shrink-0 ml-3">{dayLabel}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            <h2 className="font-semibold text-slate-800">{t("dash.recentPatients")}</h2>
          </div>
          <Link to="/patients" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
            {t("dash.viewAll")}
          </Link>
        </div>
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-7 h-7 border-3 border-slate-200 border-t-teal-600 rounded-full animate-spin" />
          </div>
        ) : recentPatients.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-200 mx-auto" />
            <p className="text-slate-400 mt-3 text-sm">{t("dash.noPatients")}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentPatients.map((p) => (
              <Link
                key={p.id}
                to={`/patients/${p.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-teal-50 text-teal-700 flex items-center justify-center font-medium text-sm shrink-0">
                    {p.photo_url ? (
                      <UIImage src={p.photo_url} fittingType="fill" className="w-full h-full" />
                    ) : (
                      p.full_name?.charAt(0)?.toUpperCase() || "P"
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 truncate">{p.full_name}</p>
                    <div className="flex items-center gap-1.5">
                      {p.cancer_type ? (
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${getCategoryStyle(p.cancer_type).badge}`}>
                          {p.cancer_type}
                        </span>
                      ) : (
                        <p className="text-xs text-slate-400 truncate">{p.diagnosis || "No diagnosis"}</p>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ml-3 ${statusStyles[p.status] || statusStyles.active}`}>
                  {p.status?.replace(/_/g, " ") || "active"}
                </span>
              </Link>
            ))}
          </div>
        )}
        </div>

        <p className="text-center text-xs text-slate-400 pt-2">
        © 2026 OncoCare. All rights reserved.
        </p>
        </div>
        );
        }
