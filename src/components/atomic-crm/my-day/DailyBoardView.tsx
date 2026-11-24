import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  Search,
  Eye,
  TrendingUp,
  X,
  FolderKanban,
  PauseCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TEAM_MEMBERS } from "../providers/fakerest/dataGenerator/sales";
import type { DailyReport, Task } from "../types";

interface DailyBoardViewProps {
  reports: DailyReport[];
  tasks: Task[];
  activeTenantId?: string;
}

export const DailyBoardView = ({
  reports,
  tasks,
  activeTenantId = "group",
}: DailyBoardViewProps) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [companyFilter, setCompanyFilter] = useState<string>(
    activeTenantId === "group" ? "all" : activeTenantId,
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "submitted" | "pending" | "blocked"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReportMember, setSelectedReportMember] = useState<{
    member: (typeof TEAM_MEMBERS)[0];
    report?: DailyReport;
    memberTasks: Task[];
  } | null>(null);

  // Filter team members based on company
  const filteredMembers = TEAM_MEMBERS.filter((m) => {
    if (companyFilter === "goldland") return m.tenant_ids?.includes("goldland");
    if (companyFilter === "abbadi") return m.tenant_ids?.includes("abbadi");
    if (companyFilter === "casavera") return m.tenant_ids?.includes("casavera");
    return true;
  }).filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.first_name.toLowerCase().includes(q) ||
      m.last_name.toLowerCase().includes(q) ||
      m.job_title?.toLowerCase().includes(q) ||
      m.department?.toLowerCase().includes(q)
    );
  });

  // Calculate metrics
  const totalStaffCount = filteredMembers.length;
  const staffWithReports = filteredMembers.filter((m) =>
    reports.some((r) => r.user_id === m.id && r.status === "submitted"),
  );
  const submittedCount = staffWithReports.length;
  const pendingCount = totalStaffCount - submittedCount;
  const submissionRate =
    totalStaffCount > 0
      ? Math.round((submittedCount / totalStaffCount) * 100)
      : 0;

  const relevantTasks = tasks.filter((t) => {
    if (companyFilter === "goldland") return t.operating_company === "goldland";
    if (companyFilter === "abbadi") return t.operating_company === "abbadi";
    if (companyFilter === "casavera") return t.operating_company === "casavera";
    return true;
  });

  const totalTasksCount = relevantTasks.length;
  const completedTasksCount = relevantTasks.filter(
    (t) => t.status === "completed",
  ).length;
  const blockersCount = reports.filter((r) => !!r.blockers).length;

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <input
              type="date"
              className="bg-transparent border-0 text-sm text-slate-200 focus:outline-none cursor-pointer"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {/* Operating Company Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                companyFilter === "all"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => setCompanyFilter("all")}
            >
              All Entities
            </button>
            <button
              type="button"
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                companyFilter === "goldland"
                  ? "bg-amber-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => setCompanyFilter("goldland")}
            >
              Goldland (GL)
            </button>
            <button
              type="button"
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                companyFilter === "abbadi"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => setCompanyFilter("abbadi")}
            >
              Abbadi Tech (AT)
            </button>
            <button
              type="button"
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                companyFilter === "casavera"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => setCompanyFilter("casavera")}
            >
              Casavera (CV)
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search staff, role, project..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Daily Submission Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {submittedCount} / {totalStaffCount}
            <span className="text-sm font-normal text-emerald-400 ml-2">
              ({submissionRate}%)
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${submissionRate}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Team Tasks Tracked</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {completedTasksCount} / {totalTasksCount}
            <span className="text-sm font-normal text-slate-400 ml-2">
              Done
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            {totalTasksCount - completedTasksCount} in-flight across site &amp;
            office
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pending Check-ins</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2">
            {pendingCount}
            <span className="text-sm font-normal text-slate-400 ml-2">
              Employees
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Automated 17:00 nudge sent via email &amp; in-app
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Blockers Flagged</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-2">
            {blockersCount}
            <span className="text-sm font-normal text-slate-400 ml-2">
              Items
            </span>
          </div>
          <div className="text-xs text-rose-400/80 mt-2">
            Requires manager review &amp; authority follow-up
          </div>
        </div>
      </div>

      {/* Roster Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            statusFilter === "all"
              ? "bg-secondary text-secondary-foreground font-bold shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setStatusFilter("all")}
        >
          All Staff ({totalStaffCount})
        </button>
        <button
          type="button"
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
            statusFilter === "submitted"
              ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setStatusFilter("submitted")}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Submitted ({submittedCount})
        </button>
        <button
          type="button"
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
            statusFilter === "pending"
              ? "bg-amber-500/15 text-amber-500 border border-amber-500/30 font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setStatusFilter("pending")}
        >
          <Clock className="w-3.5 h-3.5" />
          Pending ({pendingCount})
        </button>
        <button
          type="button"
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
            statusFilter === "blocked"
              ? "bg-rose-500/15 text-rose-500 border border-rose-500/30 font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setStatusFilter("blocked")}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Has Blockers ({blockersCount})
        </button>
      </div>

      {/* Staff Daily Status Table */}
      <div className="bg-card border border-border/70 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground uppercase tracking-wider text-[11px] border-b border-border/60">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Entity &amp; Discipline</th>
                <th className="py-3 px-4">Check-in Status</th>
                <th className="py-3 px-4">Today's Tasks</th>
                <th className="py-3 px-4">Summary &amp; Blockers</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMembers
                .filter((member) => {
                  const report = reports.find((r) => r.user_id === member.id);
                  const isSubmitted = report?.status === "submitted";
                  if (statusFilter === "submitted") return isSubmitted;
                  if (statusFilter === "pending") return !isSubmitted;
                  if (statusFilter === "blocked") return !!report?.blockers;
                  return true;
                })
                .map((member) => {
                  const report = reports.find((r) => r.user_id === member.id);
                  const isSubmitted = report?.status === "submitted";
                  const memberTasks = tasks.filter(
                    (t) => t.sales_id === member.id || t.owner_id === member.id,
                  );
                  const doneTasks = memberTasks.filter(
                    (t) => t.status === "completed",
                  ).length;

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              member.avatar?.src ||
                              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop"
                            }
                            alt={member.first_name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-700"
                          />
                          <div>
                            <div className="font-semibold text-slate-100">
                              {member.first_name} {member.last_name}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {member.job_title || member.role_name}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Entity Badges */}
                      <td className="py-3.5 px-4">
                        <div className="flex gap-1 items-center">
                          {member.tenant_ids?.map((t) => (
                            <span
                              key={t}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                                t === "goldland"
                                  ? "bg-amber-950/60 text-amber-300 border-amber-800/50"
                                  : t === "abbadi"
                                    ? "bg-blue-950/60 text-blue-300 border-blue-800/50"
                                    : "bg-emerald-950/60 text-emerald-300 border-emerald-800/50"
                              }`}
                            >
                              {t === "goldland"
                                ? "GL"
                                : t === "abbadi"
                                  ? "AT"
                                  : "CV"}
                            </span>
                          ))}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {member.department}
                        </div>
                      </td>

                      {/* Check-in Status */}
                      <td className="py-3.5 px-4">
                        {isSubmitted ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Submitted (
                            {report.submitted_at
                              ? new Date(
                                  report.submitted_at,
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "17:30"}
                            )
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-800/50">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            Pending Check-in
                          </div>
                        )}
                      </td>

                      {/* Task Count & Progress */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200">
                          {doneTasks} / {memberTasks.length} Completed
                        </div>
                        {memberTasks.length > 0 && (
                          <div className="w-24 bg-slate-950 rounded-full h-1 mt-1.5 overflow-hidden">
                            <div
                              className="bg-indigo-500 h-1 rounded-full"
                              style={{
                                width: `${Math.round((doneTasks / memberTasks.length) * 100)}%`,
                              }}
                            />
                          </div>
                        )}
                      </td>

                      {/* Summary & Blockers Preview */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {report ? (
                          <div>
                            <p className="text-slate-300 text-xs truncate">
                              {report.summary}
                            </p>
                            {report.blockers && (
                              <div className="flex items-center gap-1 text-[11px] text-rose-400 mt-1 font-medium">
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                                <span className="truncate">
                                  {report.blockers}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">
                            No report submitted yet
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs border-slate-700 hover:bg-slate-800 text-slate-300"
                          onClick={() =>
                            setSelectedReportMember({
                              member,
                              report,
                              memberTasks,
                            })
                          }
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View Day
                        </Button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drill-Down Modal for Selected Member */}
      {selectedReportMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-xl w-full shadow-2xl p-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={
                    selectedReportMember.member.avatar?.src ||
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop"
                  }
                  alt={selectedReportMember.member.first_name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-700"
                />
                <div>
                  <h3 className="text-base font-bold text-white">
                    {selectedReportMember.member.first_name}{" "}
                    {selectedReportMember.member.last_name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedReportMember.member.job_title} •{" "}
                    {selectedReportMember.member.department}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
                onClick={() => setSelectedReportMember(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mt-4">
              {/* Report Summary */}
              {selectedReportMember.report ? (
                <>
                  <div className="p-3.5 rounded-xl bg-card border border-border/70">
                    <div className="text-[11px] font-semibold uppercase text-muted-foreground mb-1">
                      Submitted Summary
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">
                      {selectedReportMember.report.summary}
                    </p>
                  </div>

                  {selectedReportMember.report.blockers && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
                      <div className="text-[11px] font-semibold uppercase text-rose-500 flex items-center gap-1.5 mb-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Reported Site Blocker
                      </div>
                      <p className="text-xs text-foreground leading-relaxed">
                        {selectedReportMember.report.blockers}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-500 flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>
                    This employee has not submitted their end-of-day check-in
                    yet for today.
                  </span>
                </div>
              )}

              {/* Assigned Tasks Checklist */}
              <div>
                <div className="text-[11px] font-semibold uppercase text-muted-foreground mb-2">
                  Today's Tasks ({selectedReportMember.memberTasks.length})
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedReportMember.memberTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 rounded-lg bg-card border border-border/70 text-xs flex items-center justify-between"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="text-foreground truncate">{t.text}</div>
                        {t.project_name && (
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <FolderKanban className="w-3 h-3 text-muted-foreground" />
                            <span>{t.project_name}</span>
                          </div>
                        )}
                        {t.hold_reason && (
                          <div className="text-[10px] text-amber-500 mt-0.5 flex items-center gap-1">
                            <PauseCircle className="w-3 h-3 text-amber-500" />
                            <span>Hold reason: {t.hold_reason}</span>
                          </div>
                        )}
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                          t.status === "completed"
                            ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                            : t.status === "on_hold"
                              ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                              : "bg-primary/15 text-primary border border-primary/30"
                        }`}
                      >
                        {t.status === "completed"
                          ? "Done"
                          : t.status === "on_hold"
                            ? "On Hold"
                            : "In Progress"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 mt-4 border-t border-slate-800">
              <Button
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
                onClick={() => setSelectedReportMember(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
