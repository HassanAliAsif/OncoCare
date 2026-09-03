import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search, Plus, Users, Edit } from "lucide-react";
import { Image as UIImage } from "@/components/ui/image";
import { getCategoryStyle } from "@/lib/cancerTypes";
import { useTranslation } from "@/lib/i18n";
import PatientForm from "@/components/patients/PatientForm";

const statusStyles = {
  active: "bg-teal-50 text-teal-700",
  on_treatment: "bg-blue-50 text-blue-700",
  on_break: "bg-amber-50 text-amber-700",
  completed: "bg-slate-100 text-slate-600",
  deceased: "bg-rose-50 text-rose-600",
};

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const { t } = useTranslation();

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Patient.list("-created_date", 200);
      setPatients(data);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = patients.filter(
    (p) =>
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.diagnosis?.toLowerCase().includes(search.toLowerCase()) ||
      p.cancer_type?.toLowerCase().includes(search.toLowerCase()) ||
      p.assigned_oncologist?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">{t("patients.title")}</h1>
          <p className="text-slate-400 mt-1 text-sm">{t("patients.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors w-fit"
        >
          <Plus className="w-4 h-4" />
          {t("dash.addPatient")}
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("patients.search")}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400"
        />
      </div>

      {loading ? (
        <div className="p-16 flex justify-center">
          <div className="w-7 h-7 border-3 border-slate-200 border-t-teal-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Users className="w-12 h-12 text-slate-200 mx-auto" />
          <p className="text-slate-400 mt-4 text-sm">
            {search ? t("patients.noMatch") : t("patients.empty")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Link
              key={p.id}
              to={`/patients/${p.id}`}
              className="group bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-teal-50 text-teal-700 flex items-center justify-center font-semibold text-base shrink-0">
                  {p.photo_url ? (
                    <UIImage src={p.photo_url} fittingType="fill" className="w-full h-full" />
                  ) : (
                    p.full_name?.charAt(0)?.toUpperCase() || "P"
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 truncate">{p.full_name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {p.diagnosis || t("patients.noDiagnosis")} {p.cancer_stage ? `· ${p.cancer_stage}` : ""}
                  </p>
                  {p.cancer_type && (
                    <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-1.5 ${getCategoryStyle(p.cancer_type).badge}`}>
                      {p.cancer_type}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusStyles[p.status] || statusStyles.active}`}>
                    {p.status?.replace(/_/g, " ") || "active"}
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setEditingPatient(p);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                    aria-label={t("pd.edit")}
                    title={t("pd.edit")}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-slate-400">{t("patients.oncologist")}</p>
                  <p className="text-slate-600 font-medium mt-0.5 truncate">{p.assigned_oncologist || "—"}</p>
                </div>
                <div>
                  <p className="text-slate-400">{t("patients.bloodType")}</p>
                  <p className="text-slate-600 font-medium mt-0.5">{p.blood_type || "—"}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showForm && (
        <PatientForm
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

      {editingPatient && (
        <PatientForm
          patient={editingPatient}
          onClose={() => setEditingPatient(null)}
          onSaved={() => {
            setEditingPatient(null);
            load();
          }}
        />
      )}
    </div>
  );
}
