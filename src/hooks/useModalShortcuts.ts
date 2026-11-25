import { useEffect, useCallback } from "react";

interface UseModalShortcutsOptions {
  isOpen: boolean;
  onClose: () => void;
  closeOnEscape?: boolean;
}

/**
 * Hook to provide standardized keyboard navigation (Escape to close)
 * and backdrop-click dismissal for all modal overlays across Group CRM.
 */
export const useModalShortcuts = ({
  isOpen,
  onClose,
  closeOnEscape = true,
}: UseModalShortcutsOptions) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEscape && isOpen) {
        e.stopPropagation();
        onClose();
      }
    },
    [isOpen, onClose, closeOnEscape],
  );

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  return { handleBackdropClick };
};

export default useModalShortcuts;
