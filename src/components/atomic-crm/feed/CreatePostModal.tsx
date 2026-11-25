import { useState } from "react";
import {
  X,
  Award,
  Megaphone,
  Building2,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotify } from "ra-core";
import { useModalShortcuts } from "@/hooks/useModalShortcuts";
import type { FeedPost } from "../types";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePost: (newPost: Omit<FeedPost, "id">) => void;
}

export const CreatePostModal = ({
  isOpen,
  onClose,
  onCreatePost,
}: CreatePostModalProps) => {
  const notify = useNotify();
  const { handleBackdropClick } = useModalShortcuts({ isOpen, onClose });

  const [type, setType] = useState<FeedPost["type"]>("announcement");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [badge, setBadge] = useState<FeedPost["badge"]>("star_performer");
  const [recipientName, setRecipientName] = useState("Sadiq (Senior MEP)");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      notify("Please provide both title and content", { type: "warning" });
      return;
    }

    const newPost: Omit<FeedPost, "id"> = {
      author_name: "Navas",
      author_role: "Managing Director",
      tenant_id: 1,
      type,
      title,
      content,
      badge: type === "appreciation" ? badge : undefined,
      recipient_name: type === "appreciation" ? recipientName : undefined,
      likes_count: 1,
      comments_count: 0,
      created_at: new Date().toISOString(),
      comments: [],
    };

    onCreatePost(newPost);
    notify(
      type === "appreciation"
        ? `Awarded recognition badge to ${recipientName}!`
        : "Published update to company stream",
      { type: "success" },
    );
    onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
    >
      <div className="relative w-full max-w-lg bg-card text-card-foreground border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/80 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Post to Company Feed
              </h3>
              <p className="text-xs text-muted-foreground">
                Broadcast announcements, celebrate milestones, or award GroupCRM
                recognition badges.
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
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Post Type Selector */}
          <div className="grid grid-cols-4 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setType("announcement")}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-semibold transition-all ${
                type === "announcement"
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-muted/30 border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Broadcast</span>
            </button>
            <button
              type="button"
              onClick={() => setType("appreciation")}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-semibold transition-all ${
                type === "appreciation"
                  ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                  : "bg-muted/30 border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Badge</span>
            </button>
            <button
              type="button"
              onClick={() => setType("milestone")}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-semibold transition-all ${
                type === "milestone"
                  ? "bg-blue-500/10 border-blue-500/40 text-blue-400"
                  : "bg-muted/30 border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Milestone</span>
            </button>
            <button
              type="button"
              onClick={() => setType("deal")}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-semibold transition-all ${
                type === "deal"
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                  : "bg-muted/30 border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Deal Win</span>
            </button>
          </div>

          {/* If Appreciation: Badge & Recipient */}
          {type === "appreciation" && (
            <div className="p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-3 animate-in fade-in">
              <div className="space-y-1.5 text-xs">
                <label className="text-amber-400 font-semibold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Select Recognition Badge
                </label>
                <select
                  value={badge}
                  onChange={(e) => setBadge(e.target.value as any)}
                  className="w-full bg-muted/40 border border-border rounded-lg px-2.5 py-2 text-foreground text-xs"
                >
                  <option value="star_performer">
                    Star Performer of the Month
                  </option>
                  <option value="fast_approvals">
                    Fast Approvals & NOC Champion
                  </option>
                  <option value="deal_closer">High-Value Deal Closer</option>
                  <option value="safety_champion">
                    Zero Incident Site Safety Champion
                  </option>
                  <option value="client_delight">
                    Client Delight & Luxury Standards
                  </option>
                </select>
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="text-muted-foreground font-medium">
                  Award To Colleague
                </label>
                <select
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-lg px-2.5 py-2 text-foreground text-xs"
                >
                  <option value="Sadiq (Senior MEP)">
                    Sadiq (Senior MEP Engineer)
                  </option>
                  <option value="Faseela (Permits Specialist)">
                    Faseela (Permits & Authority Specialist)
                  </option>
                  <option value="Asma (Interior Designer)">
                    Asma (Lead Interior Designer)
                  </option>
                  <option value="Arshad (Site Inspection)">
                    Arshad (Site Inspection Engineer)
                  </option>
                  <option value="Abrar (Operations Director)">
                    Abrar (Operations Director)
                  </option>
                </select>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5 text-xs">
            <label className="text-foreground font-semibold">
              Post Title *
            </label>
            <input
              type="text"
              placeholder={
                type === "appreciation"
                  ? "e.g., Outstanding speed on DEWA transformer energization"
                  : "e.g., New Authority Circular from Dubai Municipality"
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5 text-xs">
            <label className="text-foreground font-semibold">
              Message & Details *
            </label>
            <textarea
              rows={4}
              placeholder="Write your update or recognition note..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="w-full bg-muted/40 border border-border rounded-xl p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground text-xs font-semibold gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Share on Stream
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
