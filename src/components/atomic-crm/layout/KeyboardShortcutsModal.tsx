import { Keyboard, X } from "lucide-react";
import { useModalShortcuts } from "@/hooks/useModalShortcuts";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutSection {
  title: string;
  items: ShortcutItem[];
}

export const KeyboardShortcutsModal = ({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) => {
  const { handleBackdropClick } = useModalShortcuts({ isOpen, onClose });

  if (!isOpen) return null;

  const sections: ShortcutSection[] = [
    {
      title: "Global Essentials",
      items: [
        {
          keys: ["?"],
          description: "Open or close this shortcuts cheat sheet",
        },
        {
          keys: ["Ctrl", "K"],
          description: "Open Global Search & navigation palette",
        },
        { keys: ["Esc"], description: "Close active modal, dialog, or drawer" },
        { keys: ["t"], description: "Toggle between Dark and Light mode" },
      ],
    },
    {
      title: "Navigation (Press 'g' then key, or 1-6)",
      items: [
        {
          keys: ["g", "d"],
          description: "Go to Executive Dashboard (or press '1')",
        },
        {
          keys: ["g", "m"],
          description: "Go to My Day Daily Cockpit (or press '2')",
        },
        {
          keys: ["g", "l"],
          description: "Go to Leads & Deals Pipeline (or press '3')",
        },
        {
          keys: ["g", "p"],
          description: "Go to Projects & Site Management (or press '4')",
        },
        {
          keys: ["g", "q"],
          description: "Go to UAE Quotes & BOQ Generator (or press '5')",
        },
        {
          keys: ["g", "i"],
          description: "Go to Tax Invoices & Retention (or press '6')",
        },
        {
          keys: ["g", "w"],
          description: "Go to Messages & Departmental Channels",
        },
        { keys: ["g", "f"], description: "Go to Company Feed & Announcements" },
        { keys: ["g", "a"], description: "Go to Authority Portals Directory" },
        {
          keys: ["g", "r"],
          description: "Go to Team Performance & Contribution",
        },
        { keys: ["g", "c"], description: "Go to Contacts Directory" },
        { keys: ["g", "o"], description: "Go to Companies & Organizations" },
      ],
    },
  ];

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-card text-card-foreground border border-border/80 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/70 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Keyboard Shortcuts
              </h3>
              <p className="text-xs text-muted-foreground">
                Speed up your daily workflow with system-wide hotkeys
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

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {sections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 px-1">
                {section.title}
              </h4>
              <div className="rounded-xl border border-border/60 bg-muted/10 divide-y divide-border/40">
                {section.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3.5 py-2.5 text-xs hover:bg-muted/30 transition-colors"
                  >
                    <span className="text-foreground font-medium">
                      {item.description}
                    </span>
                    <div className="flex items-center gap-1 shrink-0 ml-4">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2 py-1 text-[11px] font-mono font-bold text-foreground bg-background border border-border/80 rounded-md shadow-xs"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 text-xs text-muted-foreground flex items-center justify-between">
            <span>
              Tip: Press{" "}
              <kbd className="px-1.5 py-0.5 font-mono text-foreground font-semibold bg-background border border-border rounded">
                ?
              </kbd>{" "}
              from anywhere outside an input field to toggle this guide.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
