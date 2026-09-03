const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from "react";

import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, MapPin } from "lucide-react";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  format, isSameDay, isSameMonth, addMonths, parseISO, isToday,
} from "date-fns";
import { useTranslation } from "@/lib/i18n";
import AppointmentForm from "@/components/appointments/AppointmentForm";

const typeStyles = {
  chemotherapy: "bg-teal-100 text-teal-700",
  consultation: "bg-blue-100 text-blue-700",
  follow_up: "bg-violet-100 text-violet-700",
  lab_test: "bg-amber-100 text-amber-700",
  imaging: "bg-rose-100 text-rose-700",
  other: "bg-slate-100 text-slate-600",
};

const statusStyles = {
  scheduled: "bg-teal-50 text-teal-700",
  completed: "bg-slate-100 text-slate-600",
  cancelled: "bg-rose-50 text-rose-600",
  no_show: "bg-amber-50 text-amber-700",
};

export default function Appointments() {
  const { t } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [appts, pats] = await Promise.all([
        db.entities.Appointment.list("-appointment_date", 500),
        db.entities.Patient.list("-created_date", 200),
      ]);
      setAppointments(appts);
      setPatients(pats);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const apptsForDay = (day) =>
    appointments.filter((a) => {
      try {
        return isSameDay(parseISO(a.appointment_date), day);
      } catch {
        return false;
      }
    });

  const upcoming = appointments
    .filter((a) => new Date(a.appointment_date) >= new Date() && a.status === "scheduled")
    .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))
    .slice(0, 6);

  const selectedDayAppts = selectedDate
    ? apptsForDay(selectedDate).sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))
    : [];

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">{t("appt.title")}</h1>
          <p className="text-slate-400 mt-1 text-sm">{t("appt.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors w-fit"
        >
          <Plus className="w-4 h-4" />
          {t("appt.add")}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">{format(currentMonth, "MMMM yyyy")}</h2>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, -1))} className="p-2 rounded-lg hover:bg-slate-100">
                <ChevronLeft className="w-4 h-4 text-slate-500" />
              </button>
              <button onClick={() => { setCurrentMonth(new Date()); setSelectedDate(new Date()); }} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100">
                {t("appt.today")}
              </button>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-slate-100">
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((d) => (
              <div key={d} className="text-center text-[11px] font-medium text-slate-400 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const dayAppts = apptsForDay(day);
              const inMonth = isSameMonth(day, currentMonth);
              const isSel = selectedDate && isSameDay(day, selectedDate);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[64px] p-1.5 rounded-lg border text-left transition-all ${
                    isSel
                      ? "border-teal-500 bg-teal-50"
                      : "border-transparent hover:bg-slate-50"
                  } ${!inMonth ? "opacity-40" : ""}`}
                >
                  <div className={`text-xs font-medium mb-1 ${isToday(day) ? "w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center" : "text-slate-600"}`}>
                    {format(day, "d")}
                  </div>
                  <div className="space-y-0.5">
                    {dayAppts.slice(0, 2).map((a) => (
                      <div key={a.id} className={`text-[10px] font-medium px-1 py-0.5 rounded truncate ${typeStyles[a.type] || typeStyles.other}`}>
                        {format(parseISO(a.appointment_date), "HH:mm")} {a.patient_name?.split(" ")[0]}
                      </div>
                    ))}
                    {dayAppts.length > 2 && (
                      <div className="text-[10px] text-slate-400 px-1">+{dayAppts.length - 2} {t("appt.more")}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected day + upcoming */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 text-sm">
                {selectedDate ? format(selectedDate, "EEEE, MMM d") : ""}
              </h3>
            </div>
            {selectedDayAppts.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">{t("appt.noApptsDay")}</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {selectedDayAppts.map((a) => (
                  <div key={a.id} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <Link to={`/patients/${a.patient_id}`} className="text-sm font-medium text-slate-800 hover:text-teal-600 truncate">
                        {a.patient_name}
                      </Link>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusStyles[a.status] || statusStyles.scheduled}`}>
                        {t(`appt.status_${a.status}`)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{a.title}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {format(parseISO(a.appointment_date), "HH:mm")}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${typeStyles[a.type] || typeStyles.other}`}>{t(`appt.type_${a.type}`)}</span>
                    </div>
                    {a.location && <p className="text-xs text-slate-400 mt-1 inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {a.location}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
              <Calendar className="w-4 h-4 text-teal-600" />
              <h3 className="font-semibold text-slate-800 text-sm">{t("appt.upcoming")}</h3>
            </div>
            {loading ? (
              <div className="p-6 flex justify-center">
                <div className="w-6 h-6 border-2 border-slate-200 border-t-teal-600 rounded-full animate-spin" />
              </div>
            ) : upcoming.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">{t("appt.noUpcoming")}</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcoming.map((a) => (
                  <Link key={a.id} to={`/patients/${a.patient_id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{a.patient_name}</p>
                      <p className="text-xs text-slate-400 truncate">{a.title}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-xs font-medium text-slate-600">{format(parseISO(a.appointment_date), "MMM d")}</p>
                      <p className="text-xs text-slate-400">{format(parseISO(a.appointment_date), "HH:mm")}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <AppointmentForm
          patients={patients}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}