import { useState, useMemo } from "react";
import { useGetIdentity, useGetList, useNotify } from "ra-core";
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PlusCircle,
  Send,
  Users,
  Briefcase,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActiveTenant } from "@/hooks/useTenant";
import { TEAM_MEMBERS } from "../providers/fakerest/dataGenerator/sales";
import { HoldReasonModal } from "./HoldReasonModal";
import { AddTaskModal } from "./AddTaskModal";
import { EndOfDayModal } from "./EndOfDayModal";
import { DailyBoardView } from "./DailyBoardView";
import type { Task, DailyReport, Project } from "../types";

export const MyDayPage = () => {
  const { identity } = useGetIdentity();
  const { tenant, activeTenantId, isGroup } = useActiveTenant();
  const notify = useNotify();

  // Find current user persona
  const currentPersona = useMemo(() => {
    if (!identity) return TEAM_MEMBERS[0]; // Navas default
    const email = (identity as any)?.email;
    const found = TEAM_MEMBERS.find(
      (m) => m.email === email || m.id === (identity as any)?.id
    );
    return found || TEAM_MEMBERS[0];
  }, [identity]);

  const isManager = Boolean(
    currentPersona.administrator ||
    currentPersona.id === 0 || // Navas (MD)
    currentPersona.id === 1 || // Zaki (IT Admin)
    currentPersona.id === 3    // Abrar (GM)
  );

  // View mode for managers: Personal Day vs Team Board
  const [viewMode, setViewMode] = useState<"personal" | "board">("personal");

  // Fetch Tasks
  const { data: rawTasks } = useGetList<Task>("tasks", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "id", order: "ASC" },
  });

  // Fetch Daily Reports
  const { data: rawReports } = useGetList<DailyReport>("daily_reports", {
    pagination: { page: 1, perPage: 100 },
  });

  // Fetch Projects
  const { data: rawProjects } = useGetList<Project>("projects", {
    pagination: { page: 1, perPage: 20 },
  });

  // Local state overlay for immediate UI interactivity
  const [tasksState, setTasksState] = useState<Task[]>([]);
  const [reportsState, setReportsState] = useState<DailyReport[]>([]);

  // Modals
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
  const [targetHoldTaskId, setTargetHoldTaskId] = useState<string | number | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEndOfDayModalOpen, setIsEndOfDayModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "carried" | "hold" | "done">("all");

  // Synchronize with react-admin data
  const allTasks = tasksState.length > 0 ? tasksState : rawTasks || [];
  const allReports = reportsState.length > 0 ? reportsState : rawReports || [];
  const allProjects = rawProjects || [];

  // Filter tasks for current user
  const myTasks = useMemo(() => {
    const currentId = Number(currentPersona.id);
    return allTasks.filter((t) => {
      // Check assignment to this persona
      const taskOwnerId = t.owner_id != null ? Number(t.owner_id) : null;
      const taskSalesId = t.sales_id != null ? Number(t.sales_id) : null;
      return taskOwnerId === currentId || taskSalesId === currentId;
    });
  }, [allTasks, currentPersona]);

  // Has current user submitted today?
  const mySubmittedReport = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return allReports.find(
      (r) => r.user_id === currentPersona.id && r.report_date === today && r.status === "submitted"
    );
  }, [allReports, currentPersona]);

  // Status transitions
  const handleUpdateTaskStatus = (
    taskId: string | number,
    newStatus: Task["status"],
    holdReason?: string
  ) => {
    if (newStatus === "on_hold" && !holdReason) {
      setTargetHoldTaskId(taskId);
      setIsHoldModalOpen(true);
      return;
    }

    setTasksState((prev) => {
      const base = prev.length > 0 ? prev : allTasks;
      return base.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: newStatus,
            hold_reason: holdReason || t.hold_reason,
            done_date: newStatus === "completed" ? new Date().toISOString() : undefined,
          };
        }
        return t;
      });
    });

    notify(`Task marked as ${newStatus?.replace("_", " ").toUpperCase()}`, { type: "info" });
  };

  const handleConfirmHoldReason = (reason: string) => {
    if (targetHoldTaskId != null) {
      handleUpdateTaskStatus(targetHoldTaskId, "on_hold", reason);
      setTargetHoldTaskId(null);
      setIsHoldModalOpen(false);
    }
  };

  const handleAddNewTask = (newTask: Partial<Task>) => {
    const created: Task = {
      ...(newTask as Task),
      id: Date.now(),
    };
    setTasksState((prev) => [created, ...(prev.length > 0 ? prev : allTasks)]);
    notify("Task assigned successfully!", { type: "success" });
  };

  const handleSubmitEndOfDayReport = (
    report: Partial<DailyReport>,
    updatedTasks: Task[]
  ) => {
    const newReport: DailyReport = {
      ...(report as DailyReport),
      id: Date.now(),
    };

    setReportsState((prev) => [newReport, ...(prev.length > 0 ? prev : allReports)]);

    // Update tasks state
    setTasksState((prev) => {
      const base = prev.length > 0 ? prev : allTasks;
      return base.map((t) => {
        const matchingUpdated = updatedTasks.find((u) => u.id === t.id);
        return matchingUpdated || t;
      });
    });

    notify("Daily report submitted! Your project daily log has been updated.", {
      type: "success",
    });
  };

  // Filtered task view
  const displayTasks = useMemo(() => {
    return myTasks.filter((t) => {
      if (statusFilter === "active") return t.status === "pending" || t.status === "in_progress";
      if (statusFilter === "carried") return (t.carried_over_count || 0) > 0 && t.status !== "completed";
      if (statusFilter === "hold") return t.status === "on_hold";
      if (statusFilter === "done") return t.status === "completed";
      return true;
    });
  }, [myTasks, statusFilter]);

  // Metrics
  const totalMyTasks = myTasks.length;
  const completedMyTasks = myTasks.filter((t) => t.status === "completed").length;
  const carriedOverCount = myTasks.filter((t) => (t.carried_over_count || 0) > 0 && t.status !== "completed").length;
  const onHoldCount = myTasks.filter((t) => t.status === "on_hold").length;

  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Dubai",
  }).format(new Date());

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner: Employee Context & Date */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
            <Calendar className="w-4 h-4" />
            <span>Dubai, UAE • {todayFormatted}</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
            Good morning, {currentPersona.first_name}!
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {currentPersona.job_title || currentPersona.role_name}
            </span>
          </h1>

          <p className="text-xs md:text-sm text-slate-400 mt-1">
            {currentPersona.department} •{" "}
            {isGroup
              ? "All Group Entities (GL · AT · CV)"
              : tenant?.name || "Goldland Contracting LLC"}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Manager Mode Switcher */}
          {isManager && (
            <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  viewMode === "personal"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                onClick={() => setViewMode("personal")}
              >
                <Briefcase className="w-3.5 h-3.5" />
                My Day
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  viewMode === "board"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                onClick={() => setViewMode("board")}
              >
                <Users className="w-3.5 h-3.5" />
                Team Daily Board
              </button>
            </div>
          )}

          <Button
            variant="outline"
            className="border-slate-700 hover:bg-slate-800 text-slate-200 text-xs flex items-center gap-1.5"
            onClick={() => setIsAddTaskModalOpen(true)}
          >
            <PlusCircle className="w-4 h-4 text-indigo-400" />
            + Add Task
          </Button>

          {/* End-of-Day Submission Button */}
          {mySubmittedReport ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Day Signed Off (17:15)
            </div>
          ) : (
            <Button
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/30 flex items-center gap-2"
              onClick={() => setIsEndOfDayModalOpen(true)}
            >
              <Send className="w-4 h-4" />
              Submit End-of-Day Update
            </Button>
          )}
        </div>
      </div>

      {/* Main View Switcher: Manager Board vs Personal Day */}
      {viewMode === "board" ? (
        <DailyBoardView
          reports={allReports}
          tasks={allTasks}
          activeTenantId={activeTenantId}
        />
      ) : (
        <>
          {/* Personal Day Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Today's Total Tasks</span>
                <Briefcase className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white mt-2">
                {totalMyTasks}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Assigned to your queue
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Completed</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400 mt-2">
                {completedMyTasks}
                <span className="text-sm font-normal text-slate-400 ml-2">
                  ({totalMyTasks > 0 ? Math.round((completedMyTasks / totalMyTasks) * 100) : 0}%)
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Verified today
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Carried Over</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-400 mt-2">
                {carriedOverCount}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Incomplete from yesterday
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Tasks On Hold</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold text-rose-400 mt-2">
                {onHoldCount}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                With recorded reason
              </div>
            </div>
          </div>

          {/* Task Filtering Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  statusFilter === "all"
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                onClick={() => setStatusFilter("all")}
              >
                All Tasks ({totalMyTasks})
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  statusFilter === "active"
                    ? "bg-indigo-950 text-indigo-300 border border-indigo-800"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                onClick={() => setStatusFilter("active")}
              >
                Pending &amp; In Progress ({totalMyTasks - completedMyTasks - onHoldCount})
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  statusFilter === "carried"
                    ? "bg-amber-950 text-amber-300 border border-amber-800"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                onClick={() => setStatusFilter("carried")}
              >
                ⏰ Carried Over ({carriedOverCount})
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  statusFilter === "hold"
                    ? "bg-rose-950 text-rose-300 border border-rose-800"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                onClick={() => setStatusFilter("hold")}
              >
                ⏸️ On Hold ({onHoldCount})
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  statusFilter === "done"
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                onClick={() => setStatusFilter("done")}
              >
                ✓ Completed ({completedMyTasks})
              </button>
            </div>

            <span className="text-xs text-slate-500">
              Showing {displayTasks.length} task{displayTasks.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Tasks List */}
          <div className="space-y-3">
            {displayTasks.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">All Caught Up!</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  You have no pending tasks under this filter. Submit your daily update or use "+ Add Task" to schedule tomorrow's work.
                </p>
              </div>
            ) : (
              displayTasks.map((task) => {
                const isCompleted = task.status === "completed";
                const isOnHold = task.status === "on_hold";
                const isCarriedOver = (task.carried_over_count || 0) > 0;

                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isCompleted
                        ? "bg-slate-900/40 border-slate-800/50 opacity-75"
                        : isOnHold
                        ? "bg-slate-900 border-amber-800/40"
                        : "bg-slate-900 border-slate-800 hover:border-slate-700 shadow-md"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Task Content & Tags */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          {/* Priority Pill */}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              task.priority === "critical"
                                ? "bg-rose-950 text-rose-300 border border-rose-800"
                                : task.priority === "urgent"
                                ? "bg-amber-950 text-amber-300 border border-amber-800"
                                : task.priority === "high"
                                ? "bg-indigo-950 text-indigo-300 border border-indigo-800"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {task.priority || "Normal"}
                          </span>

                          {/* Operating Company */}
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                            {task.operating_company === "goldland"
                              ? "GL"
                              : task.operating_company === "abbadi"
                              ? "AT"
                              : "CV"}
                          </span>

                          {/* Carried Over Badge */}
                          {isCarriedOver && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700/60 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Carried over {task.carried_over_count}d
                            </span>
                          )}

                          {/* Project Tag */}
                          {task.project_name && (
                            <span className="text-[11px] font-medium text-indigo-300 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/40 truncate max-w-xs">
                              📌 {task.project_name}
                            </span>
                          )}
                        </div>

                        {/* Title / Description */}
                        <div
                          className={`text-sm font-semibold leading-relaxed ${
                            isCompleted ? "line-through text-slate-400" : "text-slate-100"
                          }`}
                        >
                          {task.text}
                        </div>

                        {/* Hold Reason Banner */}
                        {isOnHold && task.hold_reason && (
                          <div className="mt-2 p-2 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                            <span>
                              <strong>Hold Reason: </strong>
                              {task.hold_reason}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Right: Quick 1-Click Status Toggles */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                            task.status === "completed"
                              ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                              : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
                          }`}
                          onClick={() =>
                            handleUpdateTaskStatus(
                              task.id,
                              task.status === "completed" ? "pending" : "completed"
                            )
                          }
                        >
                          {task.status === "completed" ? "✓ Completed" : "Mark Done"}
                        </button>

                        <button
                          type="button"
                          className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                            task.status === "in_progress"
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/30"
                              : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
                          }`}
                          onClick={() =>
                            handleUpdateTaskStatus(
                              task.id,
                              task.status === "in_progress" ? "pending" : "in_progress"
                            )
                          }
                        >
                          ⏳ In Progress
                        </button>

                        <button
                          type="button"
                          className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                            isOnHold
                              ? "bg-amber-600 text-white shadow-md shadow-amber-900/30"
                              : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
                          }`}
                          onClick={() => {
                            if (isOnHold) {
                              handleUpdateTaskStatus(task.id, "pending");
                            } else {
                              setTargetHoldTaskId(task.id);
                              setIsHoldModalOpen(true);
                            }
                          }}
                        >
                          ⏸️ On Hold
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Active Projects Quick Section */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Layers className="w-5 h-5 text-indigo-400" />
                <h3>My Active Project Tracks</h3>
              </div>
              <span className="text-xs text-slate-400">
                Current operational status &amp; authority milestones
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {allProjects.slice(0, 3).map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-indigo-300">{proj.reference_no}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                      {proj.scope_summary || "Turnkey Project"}
                    </span>
                  </div>

                  <h4 className="font-semibold text-slate-100 text-sm truncate">
                    {proj.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {proj.site_location}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Current Milestone:</span>
                    <span className="font-semibold text-amber-400">
                      {proj.current_stage}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      <HoldReasonModal
        isOpen={isHoldModalOpen}
        onClose={() => {
          setIsHoldModalOpen(false);
          setTargetHoldTaskId(null);
        }}
        onSubmit={handleConfirmHoldReason}
        taskTitle={
          myTasks.find((t) => t.id === targetHoldTaskId)?.text || "Selected Task"
        }
      />

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onAddTask={handleAddNewTask}
        defaultCompany={
          activeTenantId === "group" ? "goldland" : (activeTenantId as any)
        }
        currentUserId={currentPersona.id}
      />

      <EndOfDayModal
        isOpen={isEndOfDayModalOpen}
        onClose={() => setIsEndOfDayModalOpen(false)}
        tasks={myTasks}
        userName={`${currentPersona.first_name} ${currentPersona.last_name}`}
        userId={currentPersona.id}
        company={
          activeTenantId === "group" ? "goldland" : (activeTenantId as any)
        }
        onSubmitReport={handleSubmitEndOfDayReport}
      />
    </div>
  );
};
