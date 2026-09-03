import React, { useState } from "react";

import { X } from "lucide-react";

export default function MedicationForm({ patient, treatmentPlanId, onClose, onSaved }) {
  const [form, setForm] = useState({
    drug_name: "",
    dosage: "",
    route: "",
    frequency: "",
    start_date: "",
    end_date: "",
    status: "active",
    side_effects_observed: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.drug_name || !form.dosage) {
      setError("Drug name and dosage are required.");
      return;
    }
    setSaving(true);