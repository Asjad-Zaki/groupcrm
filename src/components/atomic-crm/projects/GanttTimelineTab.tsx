import { useState, useMemo } from "react";
import {
  Clock,
  Building2,
  CheckCircle2,
  CalendarRange,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetList, useUpdate, useNotify } from "ra-core";
import type { Project, Task } from "../types";

interface GanttTimelineTabProps {
  project: Project;
  onRefresh?: () => void;
}

interface TimelineItem {
  id: string | number;
  isMilestone: boolean;
  title: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: "completed" | "in_progress" | "pending" | "on_hold";
  assigneeName?: string;
  authority?: string;
  dependency?: string;
  criticalPath?: boolean;
}

export const GanttTimelineTab = ({ project, onRefresh }: GanttTimelineTabProps) => {
  const notify = useNotify();
  const [update] = useUpdate();
  const [viewMode, setViewMode] = useState<"weeks" | "months">("weeks");
  const [filterType, setFilterType] = useState<"all" | "milestones" | "tasks">("all");

  const { data: allTasks = [] } = useGetList<Task>("tasks", {
    pagination: { page: 1, perPage: 200 },
    sort: { field: "due_date", order: "ASC" },
  });

  // Filter tasks belonging or tagged to this project
  const projectTasks = useMemo(() => {
    const pRef = project.reference_no.toLowerCase();
    const pName = project.name.toLowerCase();
    return allTasks.filter((t) => {
      const matchText = (t.text || "").toLowerCase();
      return (
        matchText.includes(pRef) ||
        matchText.includes(pName) ||
        (t.type === "project" && (t as any).project_id === project.id)
      );
    });
  }, [allTasks, project]);

  // Unified timeline items from project milestones and tasks
  const timelineItems: TimelineItem[] = useMemo(() => {
    const items: TimelineItem[] = [];

    // 1. Convert Milestones
    project.milestones.forEach((m, idx) => {
      const targetDate = m.due_date || "2026-11-15";
      // Milestone start is estimated 14 days before target
      const targetMs = new Date(targetDate).getTime();
      const startMs = targetMs - 14 * 24 * 60 * 60 * 1000;
      const startDateStr = new Date(startMs).toISOString().split("T")[0];

      items.push({
        id: m.id,
        isMilestone: true,
        title: m.title,
        startDate: startDateStr,
        endDate: targetDate,
        progress: m.completed ? 100 : idx === 1 ? 50 : 0,
        status: m.completed ? "completed" : idx === 1 ? "in_progress" : "pending",
        authority: m.authority,
        dependency: idx > 0 ? project.milestones[idx - 1].title : undefined,
        criticalPath: true,
      });
    });

    // 2. Convert Tasks
    if (projectTasks.length > 0) {
      projectTasks.forEach((t) => {
        const dueDate = t.due_date ? t.due_date.split("T")[0] : "2026-11-30";
        const dueMs = new Date(dueDate).getTime();
        const startMs = dueMs - 7 * 24 * 60 * 60 * 1000;
        const startDateStr = new Date(startMs).toISOString().split("T")[0];

        const status = (t as any).status || (t.done_date ? "completed" : "in_progress");
        const progress = status === "completed" ? 100 : status === "in_progress" ? 60 : 15;

        items.push({
          id: t.id,
          isMilestone: false,
          title: t.text,
          startDate: startDateStr,
          endDate: dueDate,
          progress,
          status: status === "completed" ? "completed" : status === "on_hold" ? "on_hold" : "in_progress",
          assigneeName: "Field Team",
          dependency: project.milestones[0]?.title,
          criticalPath: false,
        });
      });
    } else {
      // Add standard execution phases if no specific tasks exist
      const mockPhases: TimelineItem[] = [
        {
          id: "tp-1",
          isMilestone: false,
          title: "Mobilization & Hoarding NOC Permit",
          startDate: "2026-10-05",
          endDate: "2026-10-20",
          progress: 100,
          status: "completed" as const,
          assigneeName: "Arshad (Site Eng.)",
          dependency: "Dubai Municipality NOC",
          criticalPath: true,
        },
        {
          id: "tp-2",
          isMilestone: false,
          title: "First Fix MEP (DEWA Conduits & Drainage Roughed-in)",
          startDate: "2026-10-22",
          endDate: "2026-11-15",
          progress: 85,
          status: "in_progress" as const,
          assigneeName: "Sadiq (MEP Lead)",
          dependency: "DEWA Single Line Approval",
          criticalPath: true,
        },
        {
          id: "tp-3",
          isMilestone: false,
          title: "Civil Defense Smoke & Fire Damper Compliance",
          startDate: "2026-11-10",
          endDate: "2026-11-28",
          progress: 40,
          status: "in_progress" as const,
          assigneeName: "Faseela (Permits)",
          dependency: "DCD Engineering Submittal",
          criticalPath: true,
        },
        {
          id: "tp-4",
          isMilestone: false,
          title: "Joinery, Wall Paneling & Architectural Finishes",
          startDate: "2026-11-20",
          endDate: "2026-12-15",
          progress: 10,
          status: "pending" as const,
          assigneeName: "Asma (Design Lead)",
          dependency: "1st Fix MEP Inspection",
          criticalPath: false,
        },
        {
          id: "tp-5",
          isMilestone: false,
          title: "Final Authority Joint Inspection & Building Completion Certificate (BCC)",
          startDate: "2026-12-10",
          endDate: "2026-12-30",
          progress: 0,
          status: "pending" as const,
          assigneeName: "Navas (MD)",
          dependency: "Civil Defense Compliance",
          criticalPath: true,
        },
      ];
      items.push(...mockPhases);
    }

    return items;
  }, [project, projectTasks]);

  // Filter items
  const filteredItems = useMemo(() => {
    return timelineItems.filter((item) => {
      if (filterType === "milestones") return item.isMilestone;
      if (filterType === "tasks") return !item.isMilestone;
      return true;
    });
  }, [timelineItems, filterType]);

  // Overall schedule completion %
  const overallProgress = useMemo(() => {
    if (timelineItems.length === 0) return 0;
    const sum = timelineItems.reduce((acc, curr) => acc + curr.progress, 0);
    return Math.round(sum / timelineItems.length);
  }, [timelineItems]);

  // Timeline Scale Definition (Oct 1, 2026 to Jan 15, 2027)
  const timelineStart = new Date("2026-10-01").getTime();
  const timelineEnd = new Date("2027-01-15").getTime();
  const totalDuration = timelineEnd - timelineStart;

  // Timeline columns
  const weeksColumns = [
    { label: "W1 Oct", month: "Oct 2026", start: "2026-10-01" },
    { label: "W2 Oct", month: "Oct 2026", start: "2026-10-08" },
    { label: "W3 Oct", month: "Oct 2026", start: "2026-10-15" },
    { label: "W4 Oct", month: "Oct 2026", start: "2026-10-22" },
    { label: "W1 Nov", month: "Nov 2026", start: "2026-11-01" },
    { label: "W2 Nov", month: "Nov 2026", start: "2026-11-08" },
    { label: "W3 Nov", month: "Nov 2026", start: "2026-11-15" },
    { label: "W4 Nov", month: "Nov 2026", start: "2026-11-22" },
    { label: "W1 Dec", month: "Dec 2026", start: "2026-12-01" },
    { label: "W2 Dec", month: "Dec 2026", start: "2026-12-08" },
    { label: "W3 Dec", month: "Dec 2026", start: "2026-12-15" },
    { label: "W4 Dec", month: "Dec 2026", start: "2026-12-22" },
    { label: "W1 Jan", month: "Jan 2027", start: "2027-01-01" },
    { label: "W2 Jan", month: "Jan 2027", start: "2027-01-08" },
  ];

  const monthsColumns = [
    { label: "October 2026", start: "2026-10-01", flex: 31 },
    { label: "November 2026", start: "2026-11-01", flex: 30 },
    { label: "December 2026", start: "2026-12-01", flex: 31 },
    { label: "January 2027", start: "2027-01-01", flex: 15 },
  ];

  // Helper to calculate left % and width % on timeline
  const getPositionStyles = (startDate: string, endDate: string) => {
    const s = Math.max(timelineStart, new Date(startDate).getTime());
    const e = Math.min(timelineEnd, new Date(endDate).getTime());
    const leftPercent = Math.max(0, Math.min(100, ((s - timelineStart) / totalDuration) * 100));
    const widthPercent = Math.max(2, Math.min(100 - leftPercent, ((e - s) / totalDuration) * 100));
    return { left: `${leftPercent}%`, width: `${widthPercent}%` };
  };

  // Current day position (Nov 22, 2026)
  const todayMs = new Date("2026-11-22").getTime();
  const todayLeftPercent = ((todayMs - timelineStart) / totalDuration) * 100;

  const handleToggleItem = async (item: TimelineItem) => {
    if (item.isMilestone) {
      const updated = project.milestones.map((m) =>
        m.id === item.id ? { ...m, completed: !m.completed } : m
      );
      await update("projects", {
        id: project.id,
        data: { milestones: updated },
        previousData: project,
      });
      notify(`Milestone updated`, { type: "info" });
      if (onRefresh) onRefresh();
    } else {
      notify(`Task "${item.title}" schedule updated`, { type: "info" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Bitrix24 Gantt Control Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card/60 backdrop-blur border border-border p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <CalendarRange className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground">
                Bitrix24 Interactive Gantt Timeline
              </h3>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px]">
                Critical Path Engine
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Automated milestone dependencies, authority NOC critical path & site work packages.
            </p>
          </div>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Zoom Switcher */}
          <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border/60 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("weeks")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                viewMode === "weeks"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Weeks
            </button>
            <button
              type="button"
              onClick={() => setViewMode("months")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                viewMode === "months"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Months
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border/60 text-xs">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                filterType === "all"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterType("milestones")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                filterType === "milestones"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Milestones
            </button>
            <button
              type="button"
              onClick={() => setFilterType("tasks")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                filterType === "tasks"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Tasks
            </button>
          </div>
        </div>
      </div>

      {/* Progress & Legend Metric Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/40 border-border/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Schedule Progress
              </p>
              <p className="text-2xl font-bold text-foreground mt-0.5">{overallProgress}%</p>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-muted flex items-center justify-center relative">
              <span className="text-xs font-bold text-primary">{overallProgress}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Total Work Packages
              </p>
              <p className="text-2xl font-bold text-blue-400 mt-0.5">{timelineItems.length}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Critical Path Items
              </p>
              <p className="text-2xl font-bold text-amber-400 mt-0.5">
                {timelineItems.filter((i) => i.criticalPath).length}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Target Handover Date
              </p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">
                {project.target_completion_date || "2026-12-30"}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Gantt Canvas */}
      <Card className="bg-card/60 backdrop-blur border border-border shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[950px]">
            {/* Gantt Header: Left Title Column + Timeline Calendar Columns */}
            <div className="flex border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
              <div className="w-[320px] p-3.5 border-r border-border shrink-0 flex items-center justify-between">
                <span>Work Package / Milestone</span>
                <span className="text-[10px] text-muted-foreground">Dates & Prereq</span>
              </div>

              {/* Timeline Header Columns */}
              <div className="flex-1 flex relative">
                {viewMode === "weeks" ? (
                  weeksColumns.map((col, idx) => (
                    <div
                      key={idx}
                      className="flex-1 p-2 text-center border-r border-border/40 text-[11px] truncate"
                    >
                      <div className="font-bold text-foreground/80">{col.label}</div>
                      <div className="text-[9px] text-muted-foreground">{col.start.slice(5)}</div>
                    </div>
                  ))
                ) : (
                  monthsColumns.map((col, idx) => (
                    <div
                      key={idx}
                      style={{ flex: col.flex }}
                      className="p-2.5 text-center border-r border-border/40 text-xs font-bold text-foreground/90 truncate"
                    >
                      {col.label}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Gantt Rows */}
            <div className="relative divide-y divide-border/40">
              {/* Vertical TODAY Marker Line */}
              <div
                style={{ left: `calc(320px + (100% - 320px) * ${todayLeftPercent / 100})` }}
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none opacity-80"
              >
                <div className="sticky top-1 -translate-x-1/2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                  TODAY
                </div>
              </div>

              {filteredItems.map((item) => {
                const pos = getPositionStyles(item.startDate, item.endDate);

                return (
                  <div
                    key={item.id}
                    className="flex items-center hover:bg-muted/20 transition-colors text-xs group"
                  >
                    {/* Left Column: Title & Metadata */}
                    <div className="w-[320px] p-3 border-r border-border shrink-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleItem(item)}
                          className="focus:outline-none"
                        >
                          {item.status === "completed" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-muted-foreground/40 shrink-0 hover:border-primary" />
                          )}
                        </button>
                        <span
                          className={`font-semibold truncate ${
                            item.status === "completed"
                              ? "line-through text-muted-foreground"
                              : "text-foreground"
                          }`}
                          title={item.title}
                        >
                          {item.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground pl-6">
                        <span>{item.startDate.slice(5)} to {item.endDate.slice(5)}</span>
                        {item.criticalPath && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 bg-amber-500/10 text-amber-400 border-amber-500/20">
                            Critical
                          </Badge>
                        )}
                        {item.authority && (
                          <span className="font-mono text-primary truncate max-w-[90px]">
                            {item.authority}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Timeline Bar Canvas */}
                    <div className="flex-1 relative h-14 flex items-center px-1">
                      {/* Grid guideline columns */}
                      <div className="absolute inset-0 flex pointer-events-none">
                        {(viewMode === "weeks" ? weeksColumns : monthsColumns).map((_, idx) => (
                          <div key={idx} className="flex-1 border-r border-border/15 h-full" />
                        ))}
                      </div>

                      {/* Interactive Gantt Bar */}
                      <div
                        style={{ left: pos.left, width: pos.width }}
                        className={`absolute h-8 rounded-lg border shadow-sm flex items-center justify-between px-2 cursor-pointer transition-all overflow-hidden ${
                          item.status === "completed"
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                            : item.status === "on_hold"
                              ? "bg-red-500/20 border-red-500/40 text-red-300"
                              : item.criticalPath
                                ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                                : "bg-blue-500/20 border-blue-500/40 text-blue-300"
                        }`}
                        title={`${item.title} (${item.progress}% Completed)`}
                        onClick={() => handleToggleItem(item)}
                      >
                        {/* Progress fill bar */}
                        <div
                          style={{ width: `${item.progress}%` }}
                          className={`absolute left-0 top-0 bottom-0 opacity-40 transition-all ${
                            item.status === "completed"
                              ? "bg-emerald-500"
                              : item.status === "on_hold"
                                ? "bg-red-500"
                                : item.criticalPath
                                  ? "bg-amber-500"
                                  : "bg-blue-500"
                          }`}
                        />

                        {/* Bar Content */}
                        <div className="relative z-10 flex items-center gap-1.5 truncate text-[11px] font-medium">
                          {item.isMilestone && (
                            <span className="w-2 h-2 rotate-45 bg-amber-400 shrink-0" />
                          )}
                          <span className="truncate">{item.title}</span>
                        </div>

                        <span className="relative z-10 text-[10px] font-mono font-bold shrink-0 ml-1">
                          {item.progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
