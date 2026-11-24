import { useState, useEffect } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Send,
  ShieldAlert,
  FolderKanban,
  PlayCircle,
  PauseCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Task, DailyReport, Identifier } from "../types";

interface EndOfDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  userName: string;
  userId: Identifier;
  company: "goldland" | "abbadi" | "casavera";
  onSubmitReport: (report: Partial<DailyReport>, updatedTasks: Task[]) => void;
}

export const EndOfDayModal = ({
  isOpen,
  onClose,
  tasks,
  userName,
  userId,
  company,
  onSubmitReport,
}: EndOfDayModalProps) => {
  // Local task states for quick inline editing before submission
  const [taskStates, setTaskStates] = useState<Task[]>(tasks);
  const [summary, setSummary] = useState("");
  const [blockers, setBlockers] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setTaskStates(tasks);
  }, [tasks]);

  if (!isOpen) return null;

  const handleStatusChange = (
    taskId: string | number,
    newStatus: Task["status"],
  ) => {
    setTaskStates((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );
  };

  const handleHoldReasonChange = (taskId: string | number, reason: string) => {
    setTaskStates((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, hold_reason: reason } : t)),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if any on_hold tasks lack a reason
    const unreasonedHold = taskStates.find(
      (t) => t.status === "on_hold" && !t.hold_reason?.trim(),
    );
    if (unreasonedHold) {
      setError(
        `Task "${unreasonedHold.text.slice(0, 30)}..." is marked On Hold but requires a reason.`,
      );
      return;
    }

    if (!summary.trim()) {
      setError("Please write a brief summary of what you accomplished today.");
      return;
    }

    setSubmitting(true);

    const completedCount = taskStates.filter(
      (t) => t.status === "completed",
    ).length;
    const pendingCount = taskStates.filter(
      (t) => t.status === "pending" || t.status === "in_progress",
    ).length;
    const onHoldCount = taskStates.filter((t) => t.status === "on_hold").length;

    const report: Partial<DailyReport> = {
      user_id: userId,
      user_name: userName,
      operating_company: company,
      report_date: new Date().toISOString().split("T")[0],
      status: "submitted",
      summary: summary.trim(),
      blockers: blockers.trim() || undefined,
      submitted_at: new Date().toISOString(),
      tasks_completed_count: completedCount,
      tasks_pending_count: pendingCount,
      tasks_on_hold_count: onHoldCount,
    };

    onSubmitReport(report, taskStates);
    setSubmitting(false);
    onClose();
  };

  const completedCount = taskStates.filter(
    (t) => t.status === "completed",
  ).length;
  const totalCount = taskStates.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card border border-border/80 text-card-foreground rounded-2xl max-w-2xl w-full shadow-2xl p-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-foreground">
                Daily Check-in & Sign-off
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Takes &lt; 60 seconds • Updates your team's live daily log &amp;
              performance record
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">
              {completedCount} / {totalCount} Done
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 mt-5">
          {/* Tasks Checklist */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Verify Today's Task Statuses
            </label>

            {taskStates.length === 0 ? (
              <div className="p-4 rounded-xl bg-muted/30 border border-border/60 text-center text-sm text-muted-foreground">
                No individual tasks were assigned today. You can still submit
                your daily summary below!
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {taskStates.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl border transition-all ${
                      task.status === "completed"
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : task.status === "on_hold"
                          ? "bg-amber-500/10 border-amber-500/30"
                          : "bg-muted/20 border-border/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-foreground leading-snug">
                          {task.text}
                        </div>
                        {task.project_name && (
                          <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                            <FolderKanban className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span>{task.project_name}</span>
                          </div>
                        )}
                      </div>

                      {/* Status Selector Pills */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          className={`px-2 py-1 text-[11px] font-medium rounded-lg transition-colors flex items-center gap-1 ${
                            task.status === "completed"
                              ? "bg-emerald-600 text-white font-semibold"
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                          onClick={() =>
                            handleStatusChange(task.id, "completed")
                          }
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Done
                        </button>
                        <button
                          type="button"
                          className={`px-2 py-1 text-[11px] font-medium rounded-lg transition-colors flex items-center gap-1 ${
                            task.status === "in_progress"
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                          onClick={() =>
                            handleStatusChange(task.id, "in_progress")
                          }
                        >
                          <PlayCircle className="w-3 h-3" />
                          In Prog
                        </button>
                        <button
                          type="button"
                          className={`px-2 py-1 text-[11px] font-medium rounded-lg transition-colors flex items-center gap-1 ${
                            task.status === "on_hold"
                              ? "bg-amber-600 text-white font-semibold"
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                          onClick={() => handleStatusChange(task.id, "on_hold")}
                        >
                          <PauseCircle className="w-3 h-3" />
                          Hold
                        </button>
                      </div>
                    </div>

                    {/* Inline Hold Reason if On Hold */}
                    {task.status === "on_hold" && (
                      <div className="mt-2 pt-2 border-t border-border/60">
                        <input
                          type="text"
                          placeholder="Reason required for Hold (e.g. Awaiting client review)..."
                          className="w-full bg-muted/40 border border-amber-500/40 rounded-lg p-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          value={task.hold_reason || ""}
                          onChange={(e) =>
                            handleHoldReasonChange(task.id, e.target.value)
                          }
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Daily Summary */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Summary of Today's Work{" "}
              <span className="text-destructive">*</span>
            </label>
            <textarea
              rows={3}
              className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="e.g. Conducted site inspection on Palm Jumeirah villa, verified MEP wiring with consultant, coordinated DDA drawing revisions."
              value={summary}
              onChange={(e) => {
                setSummary(e.target.value);
                if (error) setError("");
              }}
            />
          </div>

          {/* Blockers */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-amber-500 mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Blockers / Challenges Requiring Manager Help (Optional)
            </label>
            <textarea
              rows={2}
              className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              placeholder="e.g. Waiting for client to release tile deposit, DEWA inspector delayed to next Monday, access pass expired..."
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-xs text-destructive flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-destructive" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border/60">
            <span className="text-xs text-muted-foreground">
              Reporting as:{" "}
              <strong className="text-foreground">{userName}</strong>
            </span>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-border text-foreground hover:bg-muted"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Daily Report
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
