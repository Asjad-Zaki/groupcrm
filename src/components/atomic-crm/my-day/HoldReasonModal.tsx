import { useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModalShortcuts } from "@/hooks/useModalShortcuts";

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
  const { handleBackdropClick } = useModalShortcuts({ isOpen, onClose });
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError(
        "Please provide a reason why this task is being placed on hold.",
      );
      return;
    }
    onSubmit(reason.trim());
    setReason("");
    setError("");
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="bg-card border border-border/80 text-card-foreground rounded-2xl max-w-md w-full shadow-2xl p-6 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-4">
          <div className="flex items-center gap-2.5 text-amber-500">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <h3 className="text-base font-bold text-foreground">
              Place Task On Hold
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted border border-border rounded">
              ESC
            </kbd>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-3">
          Company policy requires a documented reason when halting active
          project tasks.
        </p>

        <div className="p-3 bg-muted/40 rounded-xl text-xs text-muted-foreground mb-4 border border-border/60">
          <span className="font-semibold text-foreground">Task: </span>
          {taskTitle}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Hold Reason <span className="text-destructive">*</span>
            </label>
            <textarea
              rows={3}
              className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              placeholder="e.g. Awaiting client review on joinery mockups, site power disconnected, DEWA inspection rescheduled..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              autoFocus
            />
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
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
