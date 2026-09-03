import React, { useState } from "react";

import { X } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useTranslation } from "@/lib/i18n";

const APPT_TYPES = ["chemotherapy", "consultation", "follow_up", "lab_test", "imaging", "other"];

export default function AppointmentForm({ patient, patients, defaultDate, onClose, onSaved }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [form, setForm] = useState({
    patient_id: patient?.id || "",
    title: "",
    appointment_date: defaultDate ? `${defaultDate}T09:00` : "",
    duration_minutes: 30,
    type: "consultation",
    location: "",
    notes: "",
    status: "scheduled",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();