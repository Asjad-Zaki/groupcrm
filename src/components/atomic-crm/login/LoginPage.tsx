import { useState } from "react";
import { useLogin, useNotify } from "ra-core";
import {
  Building2,
  ShieldCheck,
  User,
  Lock,
  ChevronRight,
  Sparkles,
  Briefcase,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notification } from "@/components/admin/notification";
import { useConfigurationContext } from "@/components/atomic-crm/root/ConfigurationContext.tsx";
import { TEAM_MEMBERS } from "../providers/fakerest/dataGenerator/sales";
import type { Sale } from "../types";

export const LoginPage = (props: { redirectTo?: string }) => {
  const { title } = useConfigurationContext();
  const { redirectTo = "/" } = props;
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"persona" | "credentials">("persona");
  const [emailInput, setEmailInput] = useState("navas@groupcrm.ae");
  const [passwordInput, setPasswordInput] = useState("demo");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  const login = useLogin();
  const notify = useNotify();

  const handleLogin = (credentials: { email?: string; username?: string; password?: string }) => {
    setLoading(true);
    login(credentials, redirectTo)
      .then(() => {
        setLoading(false);
        notify("Welcome back! Signed in successfully.", { type: "success" });
      })
      .catch((error: any) => {
        setLoading(false);
        const msg = error?.message || "Invalid credentials. Please try again.";
        notify(msg, { type: "error" });
      });
  };

  const handleQuickLogin = (user: Sale) => {
    handleLogin({ email: user.email, password: "demo" });
  };

  const filteredMembers = TEAM_MEMBERS.filter((m) => {
    if (departmentFilter === "all") return true;
    if (departmentFilter === "exec") return m.administrator || m.id === 0 || m.id === 1 || m.id === 3;
    if (departmentFilter === "ops") return m.department?.includes("Site") || m.department?.includes("MEP") || m.department?.includes("Permitting");
    if (departmentFilter === "design") return m.department?.includes("Design") || m.department?.includes("Fit-out");
    if (departmentFilter === "sales") return m.department?.includes("Sales") || m.department?.includes("Finance") || m.department?.includes("Marketing");
    return true;
  });

  const getCompanyBadges = (tenantIds?: string[]) => {
    if (!tenantIds || tenantIds.length === 3) {
      return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-amber-500/30">ALL (GL · AT · CV)</span>;
    }
    return (
      <div className="flex gap-1">
        {tenantIds.map((tid) => {
          if (tid === "goldland") return <span key={tid} className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-600/30">GL</span>;
          if (tid === "abbadi") return <span key={tid} className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-600/30">AT</span>;
          if (tid === "casavera") return <span key={tid} className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-600/30">CV</span>;
          return null;
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex w-full bg-slate-950 text-slate-100">
      {/* Left Column: UAE Operating Companies Branding */}
      <div className="relative hidden lg:flex lg:w-5/12 flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-r border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                {title}
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  UAE Group
                </span>
              </h2>
              <p className="text-xs text-slate-400">Shared Digital Operations Platform</p>
            </div>
          </div>

          <div className="mt-12 space-y-6">
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              Unified workspace connecting customer enquiries, authority approvals, engineering services, and luxury interior delivery across 3 operating entities.
            </p>

            {/* The 3 Companies */}
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/30 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-white flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    Goldland Contracting LLC
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">GL</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Dubai authority approvals (DDA/DM/DCD), architectural design & fit-out permitting.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-blue-500/30 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-white flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-400" />
                    Abbadi Tech Technical Services LLC
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">AT</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Electrical, plumbing, MEP load upgrades & technical contracting operations.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-white flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Casavera Interiors LLC
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">CV</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Luxury interior fit-out, bespoke joinery, 3D BOQ & turnkey project delivery.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Postgres RLS & Multi-Tenant Isolated
          </span>
          <span>Asia/Dubai (UTC+4)</span>
        </div>
      </div>

      {/* Right Column: Authentication & Persona Switcher */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Employee Sign In
            </h1>
            <p className="text-sm text-slate-400">
              Access your company projects, tasks, customer leads, and daily digest.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setActiveTab("persona")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "persona"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              1-Click Employee Login
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("credentials")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "credentials"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Email & Password
            </button>
          </div>

          {/* TAB 1: 1-Click Employee Persona Login */}
          {activeTab === "persona" && (
            <div className="space-y-4">
              {/* Department Filter Pills */}
              <div className="flex flex-wrap gap-1.5 justify-center">
                {[
                  { id: "all", label: "All Staff (17)" },
                  { id: "exec", label: "Leadership" },
                  { id: "ops", label: "Operations & MEP" },
                  { id: "design", label: "Architecture & Design" },
                  { id: "sales", label: "Sales & Finance" },
                ].map((dept) => (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => setDepartmentFilter(dept.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                      departmentFilter === dept.id
                        ? "bg-slate-800 border-amber-500 text-amber-400"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {dept.label}
                  </button>
                ))}
              </div>

              {/* Grid of Team Members */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
                {filteredMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    disabled={loading}
                    onClick={() => handleQuickLogin(member)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800/90 hover:border-amber-500/40 text-left transition-all duration-150 cursor-pointer group shadow-xs"
                  >
                    <img
                      src={member.avatar?.src}
                      alt={member.first_name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-700 group-hover:ring-amber-500 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-sm text-white group-hover:text-amber-300 truncate">
                          {member.first_name} {member.last_name}
                        </span>
                        {getCompanyBadges(member.tenant_ids)}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5 font-medium">
                        {member.job_title || member.role_name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {member.email}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>

              <p className="text-center text-xs text-slate-500">
                Click any employee persona to sign in immediately and test tenant/role visibility.
              </p>
            </div>
          )}

          {/* TAB 2: Standard Credentials Form */}
          {activeTab === "credentials" && (
            <div className="max-w-md mx-auto w-full bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLogin({ email: emailInput, password: passwordInput });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Employee Email or Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="e.g. navas@groupcrm.ae or zaki"
                      required
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Password
                    </label>
                    <span className="text-[11px] text-slate-500">Default: <code className="text-amber-400 font-mono">demo</code></span>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-colors"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-lg transition-all cursor-pointer"
                >
                  {loading ? "Authenticating..." : "Sign In to Workspace"}
                </Button>
              </form>

              {/* Quick Credentials Helpers */}
              <div className="pt-3 border-t border-slate-800">
                <span className="text-xs text-slate-400 block mb-2 font-medium">Quick Credentials:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "Navas (MD)", email: "navas@groupcrm.ae" },
                    { label: "Zaki (IT)", email: "zaki@groupcrm.ae" },
                    { label: "Asma (CV)", email: "asma@casaverainteriors.com" },
                    { label: "Rabeeh (Finance)", email: "rabeeh@groupcrm.ae" },
                  ].map((preset) => (
                    <button
                      key={preset.email}
                      type="button"
                      onClick={() => {
                        setEmailInput(preset.email);
                        setPasswordInput("demo");
                      }}
                      className="text-[11px] px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:border-amber-500 hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer Security Badges */}
          <div className="flex items-center justify-center gap-6 pt-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Role-Based Access
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              MFA Enforcement for Admins
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-400" />
              UAE Timezone (GST)
            </span>
          </div>
        </div>
      </div>
      <Notification />
    </div>
  );
};
