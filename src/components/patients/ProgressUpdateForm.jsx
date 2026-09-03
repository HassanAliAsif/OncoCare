import React, { useState } from "react";

import { X } from "lucide-react";

export default function ProgressUpdateForm({ patient, onClose, onSaved }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    update_date: today,
    recorded_by: "",
    weight_kg: "",
    temperature_c: "",
    blood_pressure: "",
    hemoglobin: "",
    white_blood_count: "",
    platelet_count: "",
    tumor_response: "",
    symptoms: "",
    side_effects: "",
    assessment: "",
    next_steps: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const num = (v) => (v === "" ? undefined : Number(v));