import { useState } from "react";
import { PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModalShortcuts } from "@/hooks/useModalShortcuts";
import type { AuthorityPortal } from "./types";

interface AddPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (portal: AuthorityPortal) => void;
}

export const AddPortalModal = ({
  isOpen,
  onClose,
  onAdd,
}: AddPortalModalProps) => {
  const { handleBackdropClick } = useModalShortcuts({ isOpen, onClose });
  const [name, setName] = useState("");
  const [acronym, setAcronym] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] =
    useState<AuthorityPortal["category"]>("municipalities");
  const [description, setDescription] = useState("");
  const [hotline, setHotline] = useState("");
  const [hours, setHours] = useState("");
  const [companies, setCompanies] = useState<
    Array<"goldland" | "abbadi" | "casavera">
  >(["goldland"]);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleToggleCompany = (c: "goldland" | "abbadi" | "casavera") => {
    setCompanies((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim() || !acronym.trim()) {
      setError("Please fill in Portal Name, Acronym, and URL.");
      return;
    }

    if (companies.length === 0) {
      setError("Please select at least one relevant operating entity.");
      return;
    }

    const newPortal: AuthorityPortal = {
      id: "custom_" + Date.now(),
      name: name.trim(),
      acronym: acronym.trim().toUpperCase(),
      url: url.trim(),
      category,
      description:
        description.trim() ||
        "UAE Authority Submission & Online Services Portal.",
      operating_companies: companies,
      submission_guidelines: [
        "Ensure all drawings have valid consultant registration seals.",
        "Sign and stamp appointment letters before online submission.",
      ],
      required_documents: [
        "Architectural & Engineering Drawings",
        "Valid Trade License and Affection Plan",
      ],
      contact_hotline: hotline.trim() || undefined,
      working_hours: hours.trim() || "Mon – Thu: 07:30 AM – 03:30 PM",
    };

    onAdd(newPortal);
    onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="bg-card border border-border/80 text-card-foreground rounded-2xl max-w-lg w-full shadow-2xl p-6 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <PlusCircle className="w-5 h-5 shrink-0" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Add Authority Portal Shortcut
              </h3>
              <p className="text-xs text-muted-foreground">
                Configure quick-access link for team submissions
              </p>
            </div>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-foreground mb-1">
                Portal Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Dubai Civil Defence Portal"
                className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Acronym <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. DCD"
                className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                value={acronym}
                onChange={(e) => setAcronym(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Official Portal URL <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              placeholder="https://..."
              className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Category
              </label>
              <select
                className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
              >
                <option value="municipalities">Municipalities</option>
                <option value="civil_defence">Civil Defence</option>
                <option value="utilities">Utilities</option>
                <option value="developers">Developers</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Support Hotline
              </label>
              <input
                type="text"
                placeholder="e.g. 800 900"
                className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                value={hotline}
                onChange={(e) => setHotline(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Official Hours
              </label>
              <input
                type="text"
                placeholder="e.g. 07:30 – 15:30"
                className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Description / Services
            </label>
            <textarea
              rows={2}
              placeholder="Key services covered by this authority portal..."
              className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Relevant Operating Entities
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  companies.includes("goldland")
                    ? "bg-amber-500/15 text-amber-500 border-amber-500/40"
                    : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground"
                }`}
                onClick={() => handleToggleCompany("goldland")}
              >
                GL · Goldland
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  companies.includes("abbadi")
                    ? "bg-blue-500/15 text-blue-500 border-blue-500/40"
                    : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground"
                }`}
                onClick={() => handleToggleCompany("abbadi")}
              >
                AT · Abbadi Tech
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  companies.includes("casavera")
                    ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/40"
                    : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground"
                }`}
                onClick={() => handleToggleCompany("casavera")}
              >
                CV · Casavera
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-500 font-medium">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="text-xs shadow-xs">
              Save Portal Shortcut
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
