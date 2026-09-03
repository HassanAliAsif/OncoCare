import React, { useState } from "react";

import { X } from "lucide-react";

export default function TreatmentPlanForm({ patient, onClose, onSaved }) {
  const [form, setForm] = useState({
    plan_name: "",
    protocol: "",
    cycles_total: "",
    start_date: "",
    end_date: "",
    frequency: "",
    status: "planned",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.plan_name || !form.protocol) {
      setError("Plan name and protocol are required.");
      return;
    }
    setSaving(true);
    setError("");