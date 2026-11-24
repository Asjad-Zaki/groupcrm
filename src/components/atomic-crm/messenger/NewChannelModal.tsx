import { useState } from "react";
import { X, Hash, Building2, FolderKanban, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Conversation, Project } from "../types";

interface NewChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onCreateChannel: (
    channel: Omit<Conversation, "id" | "created_at" | "unread_count">,
  ) => void;
}

export const NewChannelModal = ({
  isOpen,
  onClose,
  projects,
  onCreateChannel,
}: NewChannelModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"channel" | "project">("channel");
  const [operatingCompany, setOperatingCompany] = useState<
    "group" | "goldland" | "abbadi" | "casavera"
  >("group");
  const [selectedProjectId, setSelectedProjectId] = useState<number>(
    projects[0]?.id ? Number(projects[0].id) : 1,
  );
  const [postingPolicy, setPostingPolicy] = useState<
    "everyone" | "managers_only"
  >("everyone");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const selectedProj =
      type === "project"
        ? projects.find((p) => Number(p.id) === selectedProjectId)
        : undefined;
    const finalName = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-");
    const tenantId =
      operatingCompany === "goldland"
        ? 1
        : operatingCompany === "abbadi"
          ? 2
          : operatingCompany === "casavera"
            ? 3
            : 1;

    onCreateChannel({
      name: finalName,
      description: description.trim() || undefined,
      type,
      operating_company: operatingCompany,
      tenant_id: tenantId,
      project_id: selectedProj?.id,
      project_name: selectedProj?.reference_no,
      posting_policy: postingPolicy,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Hash className="w-4 h-4 text-primary" />
              Create Team Channel or Project Thread
            </h2>
            <p className="text-xs text-muted-foreground">
              Add a new departmental channel or dedicated site project room.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">
                Conversation Scope
              </label>
              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as "channel" | "project")
                }
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="channel">Public Departmental Channel</option>
                <option value="project">Project-Specific Site Thread</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> Operating Entity
              </label>
              <select
                value={operatingCompany}
                onChange={(e) => setOperatingCompany(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="group">Group-Wide (All 3 Entities)</option>
                <option value="goldland">Goldland Contracting LLC</option>
                <option value="abbadi">Abbadi Tech Technical Services</option>
                <option value="casavera">Casavera Interiors LLC</option>
              </select>
            </div>
          </div>

          {type === "project" && (
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground flex items-center gap-1">
                <FolderKanban className="w-3.5 h-3.5" /> Linked Project
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  const idNum = Number(e.target.value);
                  setSelectedProjectId(idNum);
                  const p = projects.find((pr) => Number(pr.id) === idNum);
                  if (p) {
                    setName(
                      `${p.reference_no.toLowerCase()}-${p.name
                        .slice(0, 20)
                        .toLowerCase()
                        .replace(/[^a-z0-9]/g, "-")}`,
                    );
                  }
                }}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {projects.map((p) => (
                  <option key={p.id} value={Number(p.id)}>
                    {p.reference_no} · {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground">
              Channel Name *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-muted-foreground font-mono">
                #
              </span>
              <input
                type="text"
                required
                placeholder="e.g. dubai-municipality-revisions"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-7 pr-3 py-2 rounded-lg bg-background border border-border text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground">
              Channel Topic & Purpose
            </label>
            <input
              type="text"
              placeholder="e.g. Fast coordination for structural remarks & inspection dates"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Posting Rights
            </label>
            <select
              value={postingPolicy}
              onChange={(e) =>
                setPostingPolicy(e.target.value as "everyone" | "managers_only")
              }
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="everyone">Everyone can post</option>
              <option value="managers_only">
                Broadcast only (Directors & Managers)
              </option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Create Channel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
