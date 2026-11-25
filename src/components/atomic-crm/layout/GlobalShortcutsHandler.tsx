import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useTheme } from "@/components/admin/use-theme";
import { KeyboardShortcutsModal } from "./KeyboardShortcutsModal";

const isEditableElement = (el: EventTarget | null): boolean => {
  if (!el || !(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    el.isContentEditable ||
    el.getAttribute("role") === "textbox"
  );
};

export const GlobalShortcutsHandler = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  // Listen for custom open event (e.g. from Header button)
  useEffect(() => {
    const handleOpenHelp = () => setIsHelpOpen(true);
    window.addEventListener("groupcrm:open-shortcuts", handleOpenHelp);
    return () =>
      window.removeEventListener("groupcrm:open-shortcuts", handleOpenHelp);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger shortcuts when typing inside form inputs
      if (isEditableElement(e.target)) {
        return;
      }

      // 1. Toggle Keyboard Shortcuts Help ('?' or Shift + '/')
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
        setPendingKey(null);
        return;
      }

      // 2. Escape closes help modal if open
      if (e.key === "Escape" && isHelpOpen) {
        e.preventDefault();
        setIsHelpOpen(false);
        setPendingKey(null);
        return;
      }

      // 3. Quick Theme Toggle ('t')
      if (
        e.key === "t" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !pendingKey
      ) {
        e.preventDefault();
        setTheme(theme === "dark" ? "light" : "dark");
        return;
      }

      // 4. Quick Direct Number Navigation ('1'-'6')
      if (!pendingKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        switch (e.key) {
          case "1":
            e.preventDefault();
            navigate("/");
            return;
          case "2":
            e.preventDefault();
            navigate("/my-day");
            return;
          case "3":
            e.preventDefault();
            navigate("/deals");
            return;
          case "4":
            e.preventDefault();
            navigate("/projects");
            return;
          case "5":
            e.preventDefault();
            navigate("/quotes");
            return;
          case "6":
            e.preventDefault();
            navigate("/invoices");
            return;
        }
      }

      // 5. 'g' then [key] sequence navigation
      if (!pendingKey) {
        if (e.key === "g" && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          setPendingKey("g");
          if (timerRef.current) window.clearTimeout(timerRef.current);
          timerRef.current = window.setTimeout(() => {
            setPendingKey(null);
          }, 1500);
          return;
        }
      } else if (pendingKey === "g") {
        e.preventDefault();
        if (timerRef.current) window.clearTimeout(timerRef.current);
        setPendingKey(null);

        switch (e.key.toLowerCase()) {
          case "d":
            navigate("/");
            break;
          case "m":
            navigate("/my-day");
            break;
          case "l":
            navigate("/deals");
            break;
          case "p":
            navigate("/projects");
            break;
          case "q":
            navigate("/quotes");
            break;
          case "i":
            navigate("/invoices");
            break;
          case "w":
            navigate("/messages");
            break;
          case "f":
            navigate("/feed");
            break;
          case "a":
            navigate("/portals");
            break;
          case "r":
            navigate("/performance");
            break;
          case "c":
            navigate("/contacts");
            break;
          case "o":
            navigate("/companies");
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [navigate, theme, setTheme, isHelpOpen, pendingKey]);

  return (
    <>
      <KeyboardShortcutsModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Floating HUD when 'g' sequence is pending */}
      {pendingKey === "g" && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="bg-popover text-popover-foreground border border-border px-3.5 py-2 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>Go to:</span>
            <span className="font-mono text-muted-foreground">
              [d]ash, [m]y-day, [l]eads, [p]rj, [q]uote, [i]nv, [w]chat,
              [f]eed...
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalShortcutsHandler;
