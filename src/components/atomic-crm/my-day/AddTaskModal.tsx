import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TEAM_MEMBERS } from "../providers/fakerest/dataGenerator/sales";
import type { Task, Identifier } from "../types";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Partial<Task>) => void;
  defaultCompany?: "goldland" | "abbadi" | "casavera";
  currentUserId?: Identifier;
}

export const AddTaskModal = ({
  isOpen,
  onClose,
  onAddTask,
  defaultCompany = "goldland",
  currentUserId = 0,
}: AddTaskModalProps) => {
  const [text, setText] = useState("");
  const [company, setCompany] = useState<"goldland" | "abbadi" | "casavera">(defaultCompany);
  const [project, setProject] = useState("");
  const [assigneeId, setAssigneeId] = useState<number>(Number(currentUserId));
  const [priority, setPriority] = useState<"normal" | "high" | "urgent" | "critical">("high");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Please describe the task.");
      return;
    }

    const assignedMember = TEAM_MEMBERS.find((m) => m.id === assigneeId);

    const newTask: Partial<Task> = {
      text: text.trim(),
      operating_company: company,
      project_name: project.trim() || "General Project Operations",
      sales_id: assigneeId,
      owner_id: assigneeId,
      assignee_name: assignedMember ? `${assignedMember.first_name} ${assignedMember.last_name}` : "Team Member",
      priority,
      status: "pending",
      carried_over_count: 0,
      task_date: new Date().toISOString().split("T")[0],
      due_date: new Date(Date.now() + 86400000).toISOString(),
    };

    onAddTask(newTask);
    setText("");
    setProject("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-xl max-w-lg w-full shadow-2xl p-6">
        <div className="flex items-center gap-3 text-indigo-400 mb-4">
          <PlusCircle className="w-6 h-6 shrink-0" />
          <h3 className="text-lg font-semibold text-white">Create & Assign Daily Task</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Text */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Task Description <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Inspect fire damper installation on 3rd floor..."
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError("");
              }}
              autoFocus
            />
            {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
          </div>

          {/* Operating Company */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Operating Entity
              </label>
              <select
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={company}
                onChange={(e) => setCompany(e.target.value as any)}
              >
                <option value="goldland">Goldland Contracting LLC (GL)</option>
                <option value="abbadi">Abbadi Tech Technical (AT)</option>
                <option value="casavera">Casavera Interiors LLC (CV)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Priority
              </label>
              <select
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
                <option value="critical">Critical (Immediate)</option>
              </select>
            </div>
          </div>

          {/* Project Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Linked Project / Work Scope
            </label>
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Palm Jumeirah Villa Extension (GL-P-01)"
              value={project}
              onChange={(e) => setProject(e.target.value)}
            />
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Assign To Team Member
            </label>
            <select
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={assigneeId}
              onChange={(e) => setAssigneeId(Number(e.target.value))}
            >
              {TEAM_MEMBERS.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.first_name} {member.last_name} ({member.job_title || member.role_name})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
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
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
            >
              Assign Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
