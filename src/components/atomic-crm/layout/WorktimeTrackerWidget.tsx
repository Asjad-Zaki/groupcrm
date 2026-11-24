import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router";
import {
  Play,
  Pause,
  Square,
  Clock,
  ChevronDown,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetList, useNotify } from "ra-core";
import type { Project, Identifier } from "../types";

interface WorktimeState {
  status: "stopped" | "running" | "paused";
  startTime: number | null;
  accumulatedSeconds: number;
  lastTickTime: number | null;
  projectId: Identifier | null;
  projectName: string;
  taskDescription: string;
}

const STORAGE_KEY = "group_crm_worktime_session";

const defaultState: WorktimeState = {
  status: "stopped",
  startTime: null,
  accumulatedSeconds: 0,
  lastTickTime: null,
  projectId: null,
  projectName: "",
  taskDescription: "",
};

export const WorktimeTrackerWidget = () => {
  const notify = useNotify();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popup on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Load initial state from localStorage
  const [session, setSession] = useState<WorktimeState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as WorktimeState;
        // If it was running, calculate time passed since last tick
        if (parsed.status === "running" && parsed.lastTickTime) {
          const delta = Math.floor((Date.now() - parsed.lastTickTime) / 1000);
          if (delta > 0) {
            parsed.accumulatedSeconds += delta;
            parsed.lastTickTime = Date.now();
          }
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    return defaultState;
  });

  const { data: projects } = useGetList<Project>("projects", {
    pagination: { page: 1, perPage: 20 },
    sort: { field: "name", order: "ASC" },
  });

  // Save session on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // ignore
    }
  }, [session]);

  // Timer tick
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (session.status === "running") {
      interval = setInterval(() => {
        setSession((prev) => {
          if (prev.status !== "running") return prev;
          return {
            ...prev,
            accumulatedSeconds: prev.accumulatedSeconds + 1,
            lastTickTime: Date.now(),
          };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session.status]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    const defaultProject = projects && projects.length > 0 ? projects[0] : null;
    setSession((prev) => ({
      ...prev,
      status: "running",
      startTime: prev.startTime || Date.now(),
      lastTickTime: Date.now(),
      projectId: prev.projectId || defaultProject?.id || null,
      projectName:
        prev.projectName || defaultProject?.name || "General Site Operations",
    }));
    notify("Clocked In: Worktime tracking started", { type: "info" });
  };

  const handlePause = () => {
    setSession((prev) => ({
      ...prev,
      status: "paused",
      lastTickTime: null,
    }));
    notify("Worktime paused for break", { type: "warning" });
  };

  const handleResume = () => {
    setSession((prev) => ({
      ...prev,
      status: "running",
      lastTickTime: Date.now(),
    }));
    notify("Worktime resumed", { type: "info" });
  };

  const handleStop = () => {
    const durationStr = formatTime(session.accumulatedSeconds);
    notify(`Clocked Out: Shift ended (${durationStr} logged to project log)`, {
      type: "success",
    });
    setSession(defaultState);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* GroupCRM Topbar Tracker Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
          session.status === "running"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
            : session.status === "paused"
              ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
              : "bg-muted/40 border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
        title="GroupCRM Live Worktime Tracker"
      >
        <span className="relative flex h-2 w-2">
          {session.status === "running" && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              session.status === "running"
                ? "bg-emerald-500"
                : session.status === "paused"
                  ? "bg-amber-500"
                  : "bg-muted-foreground/60"
            }`}
          />
        </span>

        <Clock className="w-3.5 h-3.5" />
        <span className="font-mono font-semibold tracking-wider">
          {formatTime(session.accumulatedSeconds)}
        </span>

        {session.status === "running" && session.projectName && (
          <span className="hidden xl:inline-block max-w-[130px] truncate opacity-80 text-[11px]">
            {session.projectName}
          </span>
        )}

        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {/* GroupCRM Worktime Popover Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-popover text-popover-foreground border border-border rounded-xl shadow-2xl p-4 z-50 space-y-4 animate-in fade-in-50 zoom-in-95">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h4 className="text-xs font-bold tracking-wide uppercase text-muted-foreground">
                GroupCRM Worktime Tracker
              </h4>
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <span
                  className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                    session.status === "running"
                      ? "bg-emerald-500"
                      : session.status === "paused"
                        ? "bg-amber-500"
                        : "bg-muted-foreground"
                  }`}
                />
                {session.status === "running"
                  ? "Active Working Shift"
                  : session.status === "paused"
                    ? "On Break / Pause"
                    : "Shift Not Started"}
              </p>
            </div>
            <Badge
              variant="outline"
              className={
                session.status === "running"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : session.status === "paused"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : "bg-muted text-muted-foreground"
              }
            >
              {session.status === "running"
                ? "Clocked In"
                : session.status === "paused"
                  ? "On Break"
                  : "Clocked Out"}
            </Badge>
          </div>

          {/* Monospace Big Timer Display */}
          <div className="text-center py-2 bg-muted/30 rounded-lg border border-border/40">
            <div className="text-3xl font-mono font-bold text-foreground tracking-wider">
              {formatTime(session.accumulatedSeconds)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Logged Time Today (Dubai Standard Time)
            </p>
          </div>

          {/* Active Project Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-primary" /> Active Project
            </label>
            <select
              value={session.projectId || ""}
              onChange={(e) => {
                const pId = Number(e.target.value);
                const found = projects?.find((p) => p.id === pId);
                setSession((prev) => ({
                  ...prev,
                  projectId: pId,
                  projectName: found ? found.name : "",
                }));
              }}
              className="w-full text-xs bg-muted/50 border border-border rounded-lg px-2.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">-- General Site & Authority Duties --</option>
              {projects?.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name} ({proj.reference_no})
                </option>
              ))}
            </select>
          </div>

          {/* Current Task Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Current Task / Milestone Notes
            </label>
            <input
              type="text"
              value={session.taskDescription}
              onChange={(e) =>
                setSession((prev) => ({
                  ...prev,
                  taskDescription: e.target.value,
                }))
              }
              placeholder="e.g., DEWA Single Line Diagram submission..."
              className="w-full text-xs bg-muted/50 border border-border rounded-lg px-2.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Action Control Buttons */}
          <div className="pt-2 border-t border-border/60 flex items-center gap-2">
            {session.status === "stopped" ? (
              <Button
                type="button"
                onClick={handleStart}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Clock In (Start
                Shift)
              </Button>
            ) : (
              <>
                {session.status === "running" ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePause}
                    className="flex-1 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10 gap-1"
                  >
                    <Pause className="w-3.5 h-3.5" /> Take Break
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResume}
                    className="flex-1 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 gap-1"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Resume
                  </Button>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleStop}
                  className="flex-1 text-xs gap-1 font-semibold"
                >
                  <Square className="w-3.5 h-3.5 fill-current" /> Clock Out
                </Button>
              </>
            )}
          </div>

          {/* UAE Shift Notice */}
          <div className="text-[10px] text-muted-foreground/80 flex items-center gap-1.5 bg-muted/20 p-2 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>
              Shift hours automatically sync with Project Daily Logs & EOD
              report.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
