const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { X, Upload, Plus, Trash2, FileText } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useTranslation } from "@/lib/i18n";
import { LAB_PANELS, LAB_PANEL_NAMES } from "@/lib/labPanels";

const FLAGS = ["normal", "low", "high", "critical"];

const flagStyles = {
  normal: "bg-teal-50 text-teal-700",
  low: "bg-blue-50 text-blue-700",
  high: "bg-amber-50 text-amber-700",
  critical: "bg-rose-50 text-rose-600",
};

export default function LabReportForm({ patient, onClose, onSaved }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [form, setForm] = useState({
    test_name: "",
    report_date: new Date().toISOString().slice(0, 10),
    ordering_physician: user?.full_name || "",
    lab_name: "",
    notes: "",
    status: "completed",
    file_url: "",
  });
  const [results, setResults] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handlePanel = (panelName) => {
    update("test_name", panelName);
    if (panelName && LAB_PANELS[panelName]) {
      setResults(LAB_PANELS[panelName].map((p) => ({ ...p, value: "", flag: "normal" })));
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      update("file_url", file_url);
    } catch {
      setError("Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  const updateResult = (idx, key, val) => {
    setResults((r) => r.map((row, i) => (i === idx ? { ...row, [key]: val } : row)));
  };
  const addResult = () => setResults((r) => [...r, { parameter: "", value: "", unit: "", reference_range: "", flag: "normal" }]);
  const removeResult = (idx) => setResults((r) => r.filter((_, i) => i !== idx));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.test_name || !form.report_date) {
      setError(t("lab.required"));
      return;
    }
    setSaving(true);
    setError("");
    try {
      const validResults = results.filter((r) => r.parameter && r.value !== "");
      await db.entities.LabReport.create({
        ...form,
        patient_id: patient.id,
        patient_name: patient.full_name,
        patient_email: patient.email,
        results: JSON.stringify(validResults),
        reviewed_by: user?.full_name || "",
      });
      onSaved?.();
    } catch (err) {
      setError(err.message || "Failed to save lab report.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">{t("lab.add")}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <form onSubmit={submit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Test info */}
          <div>
            <h3 className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-3">{t("lab.testInfo")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">{t("lab.selectPanel")}</label>
                <select
                  value={LAB_PANEL_NAMES.includes(form.test_name) ? form.test_name : ""}
                  onChange={(e) => handlePanel(e.target.value)}
                  className={inputCls}
                >
                  <option value="">{t("lab.selectPanelPlaceholder")}</option>
                  {LAB_PANEL_NAMES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">{t("lab.testName")}</label>
                <input
                  value={form.test_name}
                  onChange={(e) => update("test_name", e.target.value)}
                  className={inputCls}
                  placeholder={t("lab.testNamePlaceholder")}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">{t("lab.reportDate")}</label>
                <input type="date" value={form.report_date} onChange={(e) => update("report_date", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">{t("lab.status")}</label>
                <select value={form.status} onChange={(e) => update("status", e.target.value)} className={inputCls}>
                  {["pending", "completed", "reviewed"].map((s) => (
                    <option key={s} value={s}>{t(`lab.status_${s}`)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">{t("lab.orderingPhysician")}</label>
                <input value={form.ordering_physician} onChange={(e) => update("ordering_physician", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">{t("lab.labName")}</label>
                <input value={form.lab_name} onChange={(e) => update("lab_name", e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>

          {/* File upload */}
          <div>
            <h3 className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-3">{t("lab.reportFile")}</h3>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer">
                <Upload className="w-4 h-4" />
                {uploading ? t("lab.uploading") : t("lab.uploadFile")}
                <input type="file" accept="image/*,application/pdf" onChange={handleFile} className="hidden" disabled={uploading} />
              </label>
              {form.file_url && (
                <a href={form.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700">
                  <FileText className="w-4 h-4" /> {t("lab.viewFile")}
                </a>
              )}
            </div>
          </div>

          {/* Results */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-teal-600 uppercase tracking-wide">{t("lab.results")}</h3>
              <button type="button" onClick={addResult} className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700">
                <Plus className="w-3.5 h-3.5" /> {t("lab.addResult")}
              </button>
            </div>
            {results.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center bg-slate-50 rounded-lg">{t("lab.noResults")}</p>
            ) : (
              <div className="space-y-2">
                {results.map((r, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 rounded-lg p-2">
                    <input
                      value={r.parameter}
                      onChange={(e) => updateResult(idx, "parameter", e.target.value)}
                      placeholder={t("lab.parameter")}
                      className="col-span-12 sm:col-span-3 px-2 py-1.5 rounded border border-slate-200 text-xs bg-white"
                    />
                    <input
                      value={r.value}
                      onChange={(e) => updateResult(idx, "value", e.target.value)}
                      placeholder={t("lab.value")}
                      className="col-span-4 sm:col-span-2 px-2 py-1.5 rounded border border-slate-200 text-xs bg-white"
                    />
                    <input
                      value={r.unit}
                      onChange={(e) => updateResult(idx, "unit", e.target.value)}
                      placeholder={t("lab.unit")}
                      className="col-span-4 sm:col-span-2 px-2 py-1.5 rounded border border-slate-200 text-xs bg-white"
                    />
                    <input
                      value={r.reference_range}
                      onChange={(e) => updateResult(idx, "reference_range", e.target.value)}
                      placeholder={t("lab.refRange")}
                      className="col-span-4 sm:col-span-3 px-2 py-1.5 rounded border border-slate-200 text-xs bg-white"
                    />
                    <div className="col-span-10 sm:col-span-1">
                      <select
                        value={r.flag}
                        onChange={(e) => updateResult(idx, "flag", e.target.value)}
                        className={`w-full px-1.5 py-1.5 rounded border border-slate-200 text-xs ${flagStyles[r.flag] || flagStyles.normal}`}
                      >
                        {FLAGS.map((f) => (
                          <option key={f} value={f}>{t(`lab.flag_${f}`)}</option>
                        ))}
                      </select>
                    </div>
                    <button type="button" onClick={() => removeResult(idx)} className="col-span-2 sm:col-span-1 p-1.5 rounded text-slate-300 hover:text-rose-500 hover:bg-rose-50 flex justify-center">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">{t("lab.notes")}</label>
            <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={2} className={inputCls} />
          </div>

          {error && <p className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{error}</p>}
        </form>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">{t("common.cancel")}</button>
          <button onClick={submit} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50">
            {saving ? t("common.saving") : t("common.save")}
          </button>
        </div>
      </div>
    </div>
  );
}