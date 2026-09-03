import React, { useState } from "react";

import { X, Upload, ImageIcon } from "lucide-react";
import { Image as UIImage } from "@/components/ui/image";
import { CANCER_TYPE_OPTIONS } from "@/lib/cancerTypes";

export default function PatientForm({ patient, onClose, onSaved }) {
  const [form, setForm] = useState({
    full_name: patient?.full_name || "",
    date_of_birth: patient?.date_of_birth || "",
    gender: patient?.gender || "",
    national_id: patient?.national_id || "",
    phone: patient?.phone || "",
    email: patient?.email || "",
    address: patient?.address || "",
    country: patient?.country || "",
    emergency_contact_name: patient?.emergency_contact_name || "",
    emergency_contact_phone: patient?.emergency_contact_phone || "",
    blood_type: patient?.blood_type || "",
    diagnosis: patient?.diagnosis || "",
    cancer_type: patient?.cancer_type || "",
    cancer_stage: patient?.cancer_stage || "",
    diagnosis_date: patient?.diagnosis_date || "",
    assigned_oncologist: patient?.assigned_oncologist || "",
    status: patient?.status || "active",
    allergies: patient?.allergies || "",
    notes: patient?.notes || "",
    photo_url: patient?.photo_url || "",