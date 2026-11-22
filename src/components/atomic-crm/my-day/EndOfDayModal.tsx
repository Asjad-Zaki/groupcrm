import { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, Send, ShieldAlert } from "lucide-react";
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

  const handleStatusChange = (taskId: string | number, newStatus: Task["status"]) => {
    setTaskStates((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  const handleHoldReasonChange = (taskId: string | number, reason: string) => {
    setTaskStates((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, hold_reason: reason } : t))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if any on_hold tasks lack a reason
    const unreasonedHold = taskStates.find(
      (t) => t.status === "on_hold" && !t.hold_reason?.trim()
    );
    if (unreasonedHold) {
      setError(`Task "${unreasonedHold.text.slice(0, 30)}..." is marked On Hold but requires a reason.`);
      return;
    }

    if (!summary.trim()) {
      setError("Please write a brief summary of what you accomplished today.");
      return;
    }

    setSubmitting(true);

    const completedCount = taskStates.filter((t) => t.status === "completed").length;
    const pendingCount = taskStates.filter((t) => t.status === "pending" || t.status === "in_progress").length;
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

  const completedCount = taskStates.filter((t) => t.status === "completed").length;
  const totalCount = taskStates.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-2xl w-full shadow-2xl p-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white">Daily Check-in & Sign-off</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Takes &lt; 60 seconds • Updates your team's live daily log &amp; performance record
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {completedCount} / {totalCount} Done
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 mt-5">
          {/* Tasks Checklist */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Verify Today's Task Statuses
            </label>

            {taskStates.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-sm text-slate-400">
                No individual tasks were assigned today. You can still submit your daily summary below!
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {taskStates.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl border transition-all ${
                      task.status === "completed"
                        ? "bg-emerald-950/20 border-emerald-800/40"
                        : task.status === "on_hold"
                        ? "bg-amber-950/20 border-amber-800/40"
                        : "bg-slate-950/60 border-slate-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-slate-200 leading-snug">
                          {task.text}
                        </div>
                        {task.project_name && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            📌 {task.project_name}
                          </div>
                        )}
                      </div>

                      {/* Status Selector Pills */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          className={`px-2 py-1 text-[11px] font-medium rounded-lg transition-colors ${
                            task.status === "completed"
                              ? "bg-emerald-500 text-white font-semibold"
                              : "bg-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                          onClick={() => handleStatusChange(task.id, "completed")}
                        >
                          ✓ Done
                        </button>
                        <button
                          type="button"
                          className={`px-2 py-1 text-[11px] font-medium rounded-lg transition-colors ${
                            task.status === "in_progress"
                              ? "bg-indigo-500 text-white font-semibold"
                              : "bg-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                          onClick={() => handleStatusChange(task.id, "in_progress")}
                        >
                          ⏳ In Prog
                        </button>
                        <button
                          type="button"
                          className={`px-2 py-1 text-[11px] font-medium rounded-lg transition-colors ${
                            task.status === "on_hold"
                              ? "bg-amber-500 text-white font-semibold"
                              : "bg-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                          onClick={() => handleStatusChange(task.id, "on_hold")}
                        >
                          ⏸️ Hold
                        </button>
                      </div>
                    </div>

                    {/* Inline Hold Reason if On Hold */}
                    {task.status === "on_hold" && (
                      <div className="mt-2 pt-2 border-t border-amber-900/30">
                        <input
                          type="text"
                          placeholder="Reason required for Hold (e.g. Awaiting client review)..."
                          className="w-full bg-slate-900 border border-amber-700/50 rounded-lg p-2 text-xs text-amber-200 placeholder-amber-600/60 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          value={task.hold_reason || ""}
                          onChange={(e) => handleHoldReasonChange(task.id, e.target.value)}
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Summary of Today's Work <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Blockers / Challenges Requiring Manager Help (Optional)
            </label>
            <textarea
              rows={2}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              placeholder="e.g. Waiting for client to release tile deposit, DEWA inspector delayed to next Monday, access pass expired..."
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-500">
              Reporting as: <strong className="text-slate-300">{userName}</strong>
            </span>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
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
