const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";

import { LayoutDashboard, Users, LogOut, Menu, X, Activity, Stethoscope, HeartPulse, Calendar } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useTranslation } from "@/lib/i18n";
import LanguageToggle from "@/components/LanguageToggle";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems =
  user?.role === "admin" ?
  [
  { label: t("nav.dashboard"), path: "/", icon: LayoutDashboard },
  { label: t("nav.patients"), path: "/patients", icon: Users },
  { label: t("nav.appointments"), path: "/appointments", icon: Calendar }] :

  [{ label: t("nav.myRecord"), path: "/portal", icon: HeartPulse }];

  const handleLogout = async () => {
    await db.auth.logout();
  };

  const isActive = (path) => path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-slate-50/60">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-sm">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 leading-tight">{t("app.name")}</p>
            <p className="text-[11px] text-slate-400">{t("app.tagline")}</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1 opacity-100">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active ? "bg-teal-50 text-teal-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`
                }>
                
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>);

          })}
        </nav>
        <div className="p-3 border-t border-slate-100 space-y-1">
          <LanguageToggle className="w-full justify-start" />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all">
            
            <LogOut className="w-[18px] h-[18px]" />
            {t("nav.signOut")}
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-16 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-800">{t("app.name")}</span>
        </div>
        <div className="flex items-center gap-1">
          <LanguageToggle />
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-slate-100">
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen &&
      <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 h-16 border-b border-slate-100">
              <span className="font-semibold text-slate-800">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-6 space-y-1">
              {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active ? "bg-teal-50 text-teal-700" : "text-slate-500 hover:bg-slate-50"}`
                  }>
                  
                    <Icon className="w-[18px] h-[18px]" />
                    {item.label}
                  </Link>);

            })}
            </nav>
            <div className="p-3 border-t border-slate-100 space-y-1">
              <LanguageToggle className="w-full justify-start" />
              <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50">
              
                <LogOut className="w-[18px] h-[18px]" />
                {t("nav.signOut")}
              </button>
            </div>
          </aside>
        </div>
      }

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
          <Outlet />
        </div>
      </main>
    </div>);

}