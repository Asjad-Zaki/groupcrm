import { useState } from "react";
import { X, Calendar, User, Flag, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModalShortcuts } from "@/hooks/useModalShortcuts";
import { TEAM_MEMBERS } from "../providers/fakerest/dataGenerator/sales";
import type { Task, Project } from "../types";

interface AddProjectTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onAddTask: (task: Partial<Task>) => void;
}

export const AddProjectTaskModal = ({
  isOpen,
  onClose,
  project,
  onAddTask,
}: AddProjectTaskModalProps) => {
  const { handleBackdropClick } = useModalShortcuts({ isOpen, onClose });
  const [text, setText] = useState("");
  const [assigneeId, setAssigneeId] = useState<number>(
    typeof project.engineer_id === "number" ? project.engineer_id : 3,
  );
  const [priority, setPriority] = useState<"urgent" | "high" | "normal">(
    "high",
  );
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
  );
  const [taskType, setTaskType] = useState<string>("follow-up");

  if (!isOpen) return null;

  const assignedMember = TEAM_MEMBERS.find((m) => m.id === assigneeId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const opCompany =
      project.tenant_id === 1
        ? "goldland"
        : project.tenant_id === 2
          ? "abbadi"
          : "casavera";

    onAddTask({
      text: text.trim(),
      project_id: project.id,
      project_name: project.name,
      operating_company: opCompany,
      tenant_id: project.tenant_id,
      sales_id: assigneeId,
      owner_id: assigneeId,
      assignee_name: assignedMember
        ? `${assignedMember.first_name} ${assignedMember.last_name}`
        : "Team Member",
      priority,
      status: "pending",
      type: taskType,
      task_date: new Date().toISOString().split("T")[0],
      due_date: `${dueDate}T18:00:00.000Z`,
      carried_over_count: 0,
      created_at: new Date().toISOString(),
    });

    onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-foreground">
              Add Project Task
            </h2>
            <p className="text-xs text-muted-foreground">
              Assign an actionable deliverable scoped to {project.reference_no}.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted border border-border rounded">
              ESC
            </kbd>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground">
              Task Deliverable *
            </label>
            <textarea
              required
              rows={3}
              placeholder="E.g., Complete single-line diagram revision per DEWA inspection remarks..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Assigned Specialist
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {TEAM_MEMBERS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.first_name} {m.last_name} ({m.job_title})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground flex items-center gap-1">
                <Flag className="w-3.5 h-3.5" /> Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as "urgent" | "high" | "normal")
                }
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="urgent">Urgent (Red)</option>
                <option value="high">High (Amber)</option>
                <option value="normal">Normal (Slate)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Due Date
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Task Category
              </label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="follow-up">Follow-up / Action Item</option>
                <option value="meeting">Authority / Site Meeting</option>
                <option value="call">Client / Subcontractor Call</option>
                <option value="email">Formal Submission / Email</option>
              </select>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/40 border border-border text-muted-foreground space-y-1">
            <span className="font-semibold text-foreground">
              Attached Project:
            </span>
            <p>
              {project.reference_no} · {project.name}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Create Project Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
