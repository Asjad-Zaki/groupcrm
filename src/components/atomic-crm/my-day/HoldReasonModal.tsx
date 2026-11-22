import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HoldReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  taskTitle: string;
}

export const HoldReasonModal = ({
  isOpen,
  onClose,
  onSubmit,
  taskTitle,
}: HoldReasonModalProps) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please provide a reason why this task is being placed on hold.");
      return;
    }
    onSubmit(reason.trim());
    setReason("");
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-xl max-w-md w-full shadow-2xl p-6">
        <div className="flex items-center gap-3 text-amber-400 mb-4">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <h3 className="text-lg font-semibold text-white">Place Task On Hold</h3>
        </div>

        <p className="text-sm text-slate-300 mb-2">
          Company policy requires a documented reason when halting active tasks.
        </p>

        <div className="p-3 bg-slate-800/60 rounded-lg text-xs text-slate-400 mb-4 border border-slate-700/50">
          <span className="font-semibold text-slate-200">Task: </span>
          {taskTitle}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Hold Reason <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              placeholder="e.g. Awaiting client review on joinery mockups, site power disconnected, DEWA inspection rescheduled..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              autoFocus
            />
            {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
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
              className="bg-amber-600 hover:bg-amber-500 text-white font-medium"
            >
              Confirm Hold
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
