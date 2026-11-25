import { useState } from "react";
import { X, Search, FolderKanban, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModalShortcuts } from "@/hooks/useModalShortcuts";
import type { Project } from "../types";

interface AttachProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

export const AttachProjectModal = ({
  isOpen,
  onClose,
  projects,
  onSelectProject,
}: AttachProjectModalProps) => {
  const { handleBackdropClick } = useModalShortcuts({ isOpen, onClose });
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const filtered = projects.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.reference_no.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.site_location.toLowerCase().includes(q)
    );
  });

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-primary" />
              Attach Project Reference
            </h2>
            <p className="text-xs text-muted-foreground">
              Link an active UAE project directly into the chat message.
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
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search reference # or project name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
          {filtered.map((proj) => (
            <div
              key={proj.id}
              onClick={() => {
                onSelectProject(proj);
                onClose();
              }}
              className="p-2.5 rounded-xl border border-border/60 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all flex items-center justify-between gap-2"
            >
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-primary">
                    {proj.reference_no}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-semibold">
                    {proj.tenant_id === 1
                      ? "GL"
                      : proj.tenant_id === 2
                        ? "AT"
                        : "CV"}
                  </span>
                </div>
                <p className="text-xs font-medium truncate text-foreground">
                  {proj.name}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {proj.site_location}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 shrink-0"
              >
                <Check className="w-3.5 h-3.5 text-primary" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2 border-t border-border">
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
