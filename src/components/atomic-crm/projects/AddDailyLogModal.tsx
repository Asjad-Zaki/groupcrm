import { useState } from "react";
import {
  X,
  Calendar,
  User,
  Users,
  PackageCheck,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModalShortcuts } from "@/hooks/useModalShortcuts";
import type { ProjectDailyLogEntry } from "../types";

interface AddDailyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (log: Omit<ProjectDailyLogEntry, "id" | "created_at">) => void;
}

export const AddDailyLogModal = ({
  isOpen,
  onClose,
  onSubmit,
}: AddDailyLogModalProps) => {
  const { handleBackdropClick } = useModalShortcuts({ isOpen, onClose });
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [authorName, setAuthorName] = useState(
    "Arshad (Site Inspection Engineer)",
  );
  const authorRole = "Site Engineer";
  const [workSummary, setWorkSummary] = useState("");
  const [manpowerCount, setManpowerCount] = useState<number>(6);
  const [manpowerBreakdown, setManpowerBreakdown] = useState(
    "4 Installers, 1 Electrician, 1 Supervisor",
  );
  const [materialsReceived, setMaterialsReceived] = useState("");
  const [weatherCondition, setWeatherCondition] = useState(
    "Clear 30°C, Normal site access",
  );
  const [blockers, setBlockers] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workSummary.trim()) return;

    onSubmit({
      date,
      author_name: authorName,
      author_role: authorRole,
      work_summary: workSummary.trim(),
      manpower_count: Number(manpowerCount) || 0,
      manpower_breakdown: manpowerBreakdown.trim() || undefined,
      materials_received: materialsReceived.trim() || undefined,
      weather_site_condition: weatherCondition.trim() || undefined,
      blockers_or_delays: blockers.trim() || undefined,
      photos_count: 0,
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
              Post Site Daily Log
            </h2>
            <p className="text-xs text-muted-foreground">
              Record daily manpower, materials delivered, and site progress.
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Logging Engineer
              </label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground">
              Work Executed Today *
            </label>
            <textarea
              required
              rows={3}
              placeholder="E.g., Completed MEP 1st fix inspection with consultant, pulled power feeder cables..."
              value={workSummary}
              onChange={(e) => setWorkSummary(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Manpower
              </label>
              <input
                type="number"
                min={0}
                value={manpowerCount}
                onChange={(e) => setManpowerCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="font-semibold text-muted-foreground">
                Trades Breakdown
              </label>
              <input
                type="text"
                placeholder="E.g., 4 Joiners, 2 Electricians"
                value={manpowerBreakdown}
                onChange={(e) => setManpowerBreakdown(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground flex items-center gap-1">
              <PackageCheck className="w-3.5 h-3.5" /> Materials Received On
              Site
            </label>
            <input
              type="text"
              placeholder="E.g., 20 sheets marine plywood, LED strips, DEWA meter box"
              value={materialsReceived}
              onChange={(e) => setMaterialsReceived(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground flex items-center gap-1">
              Weather & Site Access Condition
            </label>
            <input
              type="text"
              value={weatherCondition}
              onChange={(e) => setWeatherCondition(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Site Blockers or
              Authority Delays (Optional)
            </label>
            <input
              type="text"
              placeholder="Leave blank if no blockers; or note permit hold, material delay..."
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Post Daily Log
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
