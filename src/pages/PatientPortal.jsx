import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  ArrowLeft, Edit, Plus, ClipboardList, Pill, Activity, HeartPulse, FileText, Trash2,
  FlaskConical, Calendar,
} from "lucide-react";
import { Image as UIImage } from "@/components/ui/image";
import { getCategoryStyle } from "@/lib/cancerTypes";
import { useTranslation } from "@/lib/i18n";
import PatientForm from "@/components/patients/PatientForm";
import MedicalHistoryForm from "@/components/patients/MedicalHistoryForm";
import TreatmentPlanForm from "@/components/patients/TreatmentPlanForm";
import MedicationForm from "@/components/patients/MedicationForm";
import ProgressUpdateForm from "@/components/patients/ProgressUpdateForm";
import LabReportForm from "@/components/labreports/LabReportForm";
import LabReportList from "@/components/labreports/LabReportList";
import AppointmentForm from "@/components/appointments/AppointmentForm";

const tabKeys = [
  { key: "overview", tk: "pd.tabOverview", icon: FileText },
  { key: "history", tk: "pd.tabHistory", icon: HeartPulse },
  { key: "plans", tk: "pd.tabPlans", icon: ClipboardList },
  { key: "medications", tk: "pd.tabMeds", icon: Pill },
  { key: "progress", tk: "pd.tabProgress", icon: Activity },
  { key: "labs", tk: "lab.tabLabs", icon: FlaskConical },
  { key: "appointments", tk: "appt.tabAppts", icon: Calendar },
];