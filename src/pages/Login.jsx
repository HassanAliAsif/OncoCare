const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2, User, Stethoscope } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { safeReturnTo } from "@/lib/authReturnTo";
import { useTranslation } from "@/lib/i18n";
import LanguageToggle from "@/components/LanguageToggle";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("patient");
  const { t } = useTranslation();
  // Post-login destination (e.g. the MCP OAuth consent page sends users here
  // with returnTo so the grant flow can resume). Same-origin paths only.
  const returnTo = safeReturnTo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await db.auth.loginViaEmailPassword(email, password);
      const me = await db.auth.me();
      if (role === "doctor" && me.role !== "admin") {
        await db.auth.logout();
        throw new Error(t("login.notDoctor"));
      }
      if (role === "patient" && me.role === "admin") {
        await db.auth.logout();
        throw new Error(t("login.doctorAccount"));
      }
      window.location.href = returnTo;
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    db.auth.loginWithProvider("google", returnTo);
  };

  return (
    <AuthLayout
      icon={LogIn}
      title={t("login.title")}
      subtitle={t("login.subtitle")}
      footer={
        <>
          {t("login.noAccount")}{" "}
          <Link
            to={"/register" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")}
            className="text-primary font-medium hover:underline"
          >
            {t("login.createOne")}
          </Link>
        </>
      }
    >
      <div className="flex justify-end mb-4">
        <LanguageToggle />
      </div>

      {/* Patient / Doctor area */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setRole("patient")}
          className={`flex flex-col items-center text-center gap-1.5 p-4 rounded-xl border-2 transition-all ${
            role === "patient"
              ? "border-teal-500 bg-teal-50"
              : "border-border bg-card hover:border-slate-300"
          }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${role === "patient" ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-500"}`}>
            <User className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-foreground">{t("login.patient")}</span>
          <span className="text-[11px] text-muted-foreground leading-tight">{t("login.patientDesc")}</span>
        </button>
        <button
          type="button"
          onClick={() => setRole("doctor")}
          className={`flex flex-col items-center text-center gap-1.5 p-4 rounded-xl border-2 transition-all ${
            role === "doctor"
              ? "border-teal-500 bg-teal-50"
              : "border-border bg-card hover:border-slate-300"
          }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${role === "doctor" ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-500"}`}>
            <Stethoscope className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-foreground">{t("login.doctor")}</span>
          <span className="text-[11px] text-muted-foreground leading-tight">{t("login.doctorDesc")}</span>
        </button>
      </div>

      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-6"
        onClick={handleGoogle}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        {t("login.google")}
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">{t("login.or")}</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t("login.email")}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t("login.password")}</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              {t("login.forgot")}
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t("login.loading")}
            </>
          ) : (
            t("login.submit")
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}