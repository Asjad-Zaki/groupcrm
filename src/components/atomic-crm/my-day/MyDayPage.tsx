import { useState, useMemo, useEffect } from "react";
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
  PauseCircle,
  PlayCircle,
  FolderKanban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      (m) => m.email === email || m.id === (identity as any)?.id,
    );
    return found || TEAM_MEMBERS[0];
  }, [identity]);

  const isManager = Boolean(
    currentPersona.administrator ||
    currentPersona.id === 0 || // Navas (MD)
    currentPersona.id === 1 || // Zaki (IT Admin)
    currentPersona.id === 3, // Abrar (GM)
  );

  // View mode for managers: Personal Day vs Team Board
  const [viewMode, setViewMode] = useState<"personal" | "board">("personal");

  // Fetch Tasks
  const { data: rawTasks, refetch: refetchTasks } = useGetList<Task>("tasks", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "id", order: "ASC" },
  });

  // Fetch Daily Reports
  const { data: rawReports, refetch: refetchReports } = useGetList<DailyReport>(
    "daily_reports",
    {
      pagination: { page: 1, perPage: 100 },
    },
  );

  // Real-time synchronization for tasks and reports
  useEffect(() => {
    const handleTaskSync = () => {
      refetchTasks();
      refetchReports();
    };
    window.addEventListener("group-crm:task-update", handleTaskSync);
    window.addEventListener("group-crm:mutation", handleTaskSync);
    const interval = setInterval(handleTaskSync, 5000);
    return () => {
      window.removeEventListener("group-crm:task-update", handleTaskSync);
      window.removeEventListener("group-crm:mutation", handleTaskSync);
      clearInterval(interval);
    };
  }, [refetchTasks, refetchReports]);

  // Fetch Projects
  const { data: rawProjects } = useGetList<Project>("projects", {
    pagination: { page: 1, perPage: 20 },
  });

  // Local state overlay for immediate UI interactivity
  const [tasksState, setTasksState] = useState<Task[]>([]);
  const [reportsState, setReportsState] = useState<DailyReport[]>([]);

  // Modals
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
  const [targetHoldTaskId, setTargetHoldTaskId] = useState<
    string | number | null
  >(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEndOfDayModalOpen, setIsEndOfDayModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "carried" | "hold" | "done"
  >("all");

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
      (r) =>
        r.user_id === currentPersona.id &&
        r.report_date === today &&
        r.status === "submitted",
    );
  }, [allReports, currentPersona]);

  // Status transitions
  const handleUpdateTaskStatus = (
    taskId: string | number,
    newStatus: Task["status"],
    holdReason?: string,
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
            done_date:
              newStatus === "completed" ? new Date().toISOString() : undefined,
          };
        }
        return t;
      });
    });

    notify(`Task marked as ${newStatus?.replace("_", " ").toUpperCase()}`, {
      type: "info",
    });
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
    updatedTasks: Task[],
  ) => {
    const newReport: DailyReport = {
      ...(report as DailyReport),
      id: Date.now(),
    };

    setReportsState((prev) => [
      newReport,
      ...(prev.length > 0 ? prev : allReports),
    ]);

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
      if (statusFilter === "active")
        return t.status === "pending" || t.status === "in_progress";
      if (statusFilter === "carried")
        return (t.carried_over_count || 0) > 0 && t.status !== "completed";
      if (statusFilter === "hold") return t.status === "on_hold";
      if (statusFilter === "done") return t.status === "completed";
      return true;
    });
  }, [myTasks, statusFilter]);

  // Metrics
  const totalMyTasks = myTasks.length;
  const completedMyTasks = myTasks.filter(
    (t) => t.status === "completed",
  ).length;
  const carriedOverCount = myTasks.filter(
    (t) => (t.carried_over_count || 0) > 0 && t.status !== "completed",
  ).length;
  const onHoldCount = myTasks.filter((t) => t.status === "on_hold").length;

  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Dubai",
  }).format(new Date());

  return (
    <div className="w-full space-y-6 pb-16">
      {/* Top Banner: Employee Context & Date */}
      <Card className="border-border/60 bg-muted/20">
        <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
              <Calendar className="w-4 h-4" />
              <span>Dubai, UAE • {todayFormatted}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground flex items-center gap-3">
              Good morning, {currentPersona.first_name}!
              <Badge
                variant="outline"
                className="text-xs font-semibold border-primary/30 text-primary bg-primary/10"
              >
                {currentPersona.job_title || currentPersona.role_name}
              </Badge>
            </h1>

            <p className="text-xs md:text-sm text-muted-foreground mt-1">
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
              <div className="flex items-center p-1 bg-muted/60 rounded-xl border border-border/60">
                <button
                  type="button"
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    viewMode === "personal"
                      ? "bg-background text-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setViewMode("personal")}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  My Day
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    viewMode === "board"
                      ? "bg-background text-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
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
              size="sm"
              className="text-xs flex items-center gap-1.5"
              onClick={() => setIsAddTaskModalOpen(true)}
            >
              <PlusCircle className="w-4 h-4 text-primary" />
              Add Task
            </Button>

            {/* End-of-Day Submission Button */}
            {mySubmittedReport ? (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Day Signed Off (17:15)
              </div>
            ) : (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
                onClick={() => setIsEndOfDayModalOpen(true)}
              >
                <Send className="w-4 h-4" />
                Submit End-of-Day Update
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border/60 bg-muted/20">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-primary" /> Today's
                    Total Tasks
                  </span>
                  <p className="text-2xl font-black text-foreground">
                    {totalMyTasks}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  Queue
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-muted/20">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />{" "}
                    Completed
                  </span>
                  <p className="text-2xl font-black text-emerald-500">
                    {completedMyTasks}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (
                      {totalMyTasks > 0
                        ? Math.round((completedMyTasks / totalMyTasks) * 100)
                        : 0}
                      %)
                    </span>
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-xs text-emerald-500 border-emerald-500/30"
                >
                  Verified
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-muted/20">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" /> Carried
                    Over
                  </span>
                  <p className="text-2xl font-black text-amber-500">
                    {carriedOverCount}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-xs text-amber-500 border-amber-500/30"
                >
                  From Yesterday
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-muted/20">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />{" "}
                    Tasks On Hold
                  </span>
                  <p className="text-2xl font-black text-rose-500">
                    {onHoldCount}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-xs text-rose-500 border-rose-500/30"
                >
                  Recorded
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Task Filtering Pills */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/20 p-2.5 rounded-xl border border-border/60">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-secondary text-secondary-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setStatusFilter("all")}
              >
                All Tasks ({totalMyTasks})
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  statusFilter === "active"
                    ? "bg-primary/15 text-primary border border-primary/30 font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setStatusFilter("active")}
              >
                Pending &amp; In Progress (
                {totalMyTasks - completedMyTasks - onHoldCount})
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === "carried"
                    ? "bg-amber-500/15 text-amber-500 border border-amber-500/30 font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setStatusFilter("carried")}
              >
                <Clock className="w-3.5 h-3.5" />
                Carried Over ({carriedOverCount})
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === "hold"
                    ? "bg-rose-500/15 text-rose-500 border border-rose-500/30 font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setStatusFilter("hold")}
              >
                <PauseCircle className="w-3.5 h-3.5" />
                On Hold ({onHoldCount})
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === "done"
                    ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setStatusFilter("done")}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Completed ({completedMyTasks})
              </button>
            </div>

            <span className="text-xs text-muted-foreground px-2">
              Showing {displayTasks.length} task
              {displayTasks.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Tasks List */}
          <div className="space-y-3">
            {displayTasks.length === 0 ? (
              <Card className="p-8 border-border/60 bg-muted/20 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-foreground">
                  All Caught Up!
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                  You have no pending tasks under this filter. Submit your daily
                  update or use "+ Add Task" to schedule tomorrow's work.
                </p>
              </Card>
            ) : (
              displayTasks.map((task) => {
                const isCompleted = task.status === "completed";
                const isOnHold = task.status === "on_hold";
                const isCarriedOver = (task.carried_over_count || 0) > 0;

                return (
                  <Card
                    key={task.id}
                    className={`border-border/60 transition-all ${
                      isCompleted
                        ? "bg-card/40 opacity-70"
                        : isOnHold
                          ? "bg-card border-amber-500/30 shadow-xs"
                          : "bg-card hover:border-primary/40 shadow-xs"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Left: Task Content & Tags */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            {/* Priority Pill */}
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                task.priority === "critical"
                                  ? "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                                  : task.priority === "urgent"
                                    ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                                    : task.priority === "high"
                                      ? "bg-blue-500/15 text-blue-500 border border-blue-500/30"
                                      : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {task.priority || "Normal"}
                            </span>

                            {/* Operating Company */}
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-muted text-foreground border border-border/80">
                              {task.operating_company === "goldland"
                                ? "GL"
                                : task.operating_company === "abbadi"
                                  ? "AT"
                                  : "CV"}
                            </span>

                            {/* Carried Over Badge */}
                            {isCarriedOver && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Carried over {task.carried_over_count}d
                              </span>
                            )}

                            {/* Project Tag */}
                            {task.project_name && (
                              <span className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 truncate max-w-xs flex items-center gap-1">
                                <FolderKanban className="w-3 h-3 text-muted-foreground shrink-0" />
                                <span className="truncate">
                                  {task.project_name}
                                </span>
                              </span>
                            )}
                          </div>

                          {/* Title / Description */}
                          <div
                            className={`text-sm font-semibold leading-relaxed ${
                              isCompleted
                                ? "line-through text-muted-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {task.text}
                          </div>

                          {/* Hold Reason Banner */}
                          {isOnHold && task.hold_reason && (
                            <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-500 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
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
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                              task.status === "completed"
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-muted/50 text-muted-foreground hover:text-foreground border border-border/80 hover:bg-muted"
                            }`}
                            onClick={() =>
                              handleUpdateTaskStatus(
                                task.id,
                                task.status === "completed"
                                  ? "pending"
                                  : "completed",
                              )
                            }
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>
                              {task.status === "completed"
                                ? "Completed"
                                : "Mark Done"}
                            </span>
                          </button>

                          <button
                            type="button"
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                              task.status === "in_progress"
                                ? "bg-primary text-primary-foreground shadow-xs"
                                : "bg-muted/50 text-muted-foreground hover:text-foreground border border-border/80 hover:bg-muted"
                            }`}
                            onClick={() =>
                              handleUpdateTaskStatus(
                                task.id,
                                task.status === "in_progress"
                                  ? "pending"
                                  : "in_progress",
                              )
                            }
                          >
                            <PlayCircle className="w-3.5 h-3.5" />
                            <span>In Progress</span>
                          </button>

                          <button
                            type="button"
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                              isOnHold
                                ? "bg-amber-600 text-white shadow-xs"
                                : "bg-muted/50 text-muted-foreground hover:text-foreground border border-border/80 hover:bg-muted"
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
                            <PauseCircle className="w-3.5 h-3.5" />
                            <span>On Hold</span>
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Active Projects Quick Section */}
          <div className="mt-8 pt-6 border-t border-border/60">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-foreground font-bold text-base">
                <Layers className="w-5 h-5 text-primary" />
                <h3>My Active Project Tracks</h3>
              </div>
              <span className="text-xs text-muted-foreground">
                Current operational status &amp; authority milestones
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {allProjects.slice(0, 3).map((proj) => (
                <Card
                  key={proj.id}
                  className="border-border/60 bg-card hover:border-primary/40 transition-colors shadow-xs"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-primary">
                        {proj.reference_no}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-muted text-foreground border border-border/60">
                        {proj.scope_summary || "Turnkey Project"}
                      </span>
                    </div>

                    <h4 className="font-semibold text-foreground text-sm truncate">
                      {proj.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {proj.site_location}
                    </p>

                    <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Current Milestone:
                      </span>
                      <span className="font-semibold text-amber-500">
                        {proj.current_stage}
                      </span>
                    </div>
                  </CardContent>
                </Card>
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
          myTasks.find((t) => t.id === targetHoldTaskId)?.text ||
          "Selected Task"
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
