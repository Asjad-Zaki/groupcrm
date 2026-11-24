/*
 * Theme Provider for Group CRM
 * Provides: colour theme (light/dark), density, tenant branding, RTL support
 * Uses shadcn-admin-kit patterns; no second component library
 */

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

// Import types from theme.ts instead of redefining them
import { applyTenantBranding, applyDensity } from "./theme";

// Tenant branding type (matches supabase tenants.branding jsonb)
// Kept locally since it's used in this file's interfaces and components
export type TenantBranding = {
  primary?: string;   // CSS colour value (e.g. "#1d4ed8")
  accent?: string;    // CSS colour value
  logo?: string;      // URL to logo image
};

// ============================================================
// Theme provider component
// ============================================================

export interface ThemeProviderProps {
  /** Tenant-specific branding (primary, accent, logo) - from tenants.branding */
  branding?: TenantBranding;
  /** Default density for the app */
  density?: "compact" | "default" | "spacious";
  /** Children component(s) */
  children: React.ReactNode;
}

/**
 * ThemeProvider - wraps the app with design tokens, tenant branding,
 * light/dark mode, and density settings.
 *
 * - Applies tenant branding CSS variables via applyTenantBranding()
 * - Sets density class via applyDensity()
 * - Handles system theme preference (light/dark)
 * - Provides CSS variables for the entire app to use
 */
export const ThemeProvider = ({
  branding,
  density: defaultDensity = "default",
  children,
}: ThemeProviderProps) => {
  // State for density (controlled, can be toggled in UI)
  const [density] = useState<"compact" | "default" | "spacious">(
    defaultDensity
  );

  // Apply density on mount/update
  useEffect(() => {
    applyDensity(density);
  }, [density]);

  // Apply tenant branding on mount/update
  useEffect(() => {
    applyTenantBranding(branding);
  }, [branding]);

  // System theme preference
  useEffect(() => {
    const prefersDark = typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const html = document.documentElement;
    html.classList.toggle("dark", prefersDark);
  }, []);

  return (
    <div
      // Apply density class to html root
      className={`density-${density}`}
      // We also set data-tenant for per-company theming in CSS
      data-tenant={`${defaultDensity}-${JSON.stringify(branding || {})}`}
    >
      {children}
    </div>
  );
};

/**
 * useTheme - hook to access theme values in components
 * Provides: current density, toggle density
 */
export function useTheme() {
  const [density, setDensity] = useState<"compact" | "default" | "spacious">(
    "default"
  );

  const toggleDensity = (newDensity: "compact" | "default" | "spacious") => {
    setDensity(newDensity);
  };

  return { density, toggleDensity };
}

/**
 * BrandingBadge - displays company logo/initials in the header
 * Uses tenant branding from branding prop
 */
export const BrandingBadge = ({
  branding,
}: {
  branding?: TenantBranding;
}) => {
  if (!branding?.logo) {
    // Fallback: show company initials in primary colour
    const initials = branding?.primary
      ? branding.primary.replace(/^#/, "").substring(0, 2).toUpperCase()
      : "GC";
    return (
      <span
        className="flex items-center gap-1 text-sm font-medium"
        style={{ color: branding?.primary }}
      >
        {initials}
      </span>
    );
  }
  return <img src={branding.logo} alt="Company logo" className="h-6 w-6 shrink-0" />;
};

/**
 * CommandPalette - simple command palette (Cmd/Ctrl+K)
 * Provides quick access to major screens
 */
export const CommandPalette = ({
  onSelect,
  items,
}: {
  onSelect: (item: { id: string; label: string }) => void;
  items: { id: string; label: string }[];
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = items.filter(
    (item) => item.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="absolute top-4 right-4 hidden sm:block bg-white dark:bg-gray-800 rounded-full p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Open command palette (Cmd+K)"
      >
        <Search className="w-4 h-4 text-muted-foreground" />
      </button>

      {open && (
        <div
          className="absolute top-8 right-4 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <input
              onInput={(e) => setQuery((e.currentTarget as HTMLInputElement).value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpen(false);
                if (e.key === "ArrowDown") {/* focus next */}
                if (e.key === "ArrowUp") {/* focus prev */}
              }}
              type="text"
              placeholder="Search or command..."
              className="w-full bg-gray-50 dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-600 py-2 pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Command palette search"
            />
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {filtered.map((item) => (
              <li
                key={item.id}
                onClick={() => onSelect(item)}
                className="px-4 py-2 cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-900"
                role="menuitem"
              >
                {item.label}
              </li>
            ))}
            {!filtered.length && (
              <li key="no-results" className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                No results found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * NotificationCentre - displays notifications
 * Can be placed in the header or as a drawer
 */
export const NotificationCentre = ({
  notifications,
  onMarkRead: _onMarkRead,
  onDismiss: _onDismiss,
}: {
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    action?: () => void;
  }>;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
}) => {
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <button
        onClick={() => {/* open notification drawer */}}
        className="relative flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-sm text-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Notifications"
      >
        {unread > 0 && (
          <span
            className="absolute -top-1 right-1 bg-red-600 text-white rounded-full w-3 h-3 text-xs"
          >
            {unread}
          </span>
        )}
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm10-4h-5.5l3.133-3.917L18.5 10.5l2.266-3.086z" />
          <path d="M22 4l-4.586 4.586a2 2 0 01-2.828 0L12 8l-1.273-1.707a2 2 0 010-2.828L8.5 5.25l3.133-3.917A2 2 0 0112 4h13zm-8 .5L7.5 12l4.388 5.757.077.078a2 2 0 012.828 2.829l-.078.077l-4.388 5.757L1.5 12l4.866-6.375a2 2 0 010-2.829l.077-.078L7.5 9.25l4.388-5.757z" />
        </svg>
      </button>

      {unread > 0 && (
        <div
          className="absolute right-0 top-10 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-lg z-50 min-w max-h-[80vh] overflow-y-auto max-w-full"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100">
              {unread} new notification{unread > 1 ? "s" : ""}
            </h3>
          </div>
          <ul className="max-h-[60vh] overflow-y-auto space-y-1">
            {notifications.map((n) => (
              <li
                key={n.id}
                className="px-3 py-2 cursor-pointer select-none rounded-sm hover:bg-gray-50 dark:hover:bg-gray-900"
                style={{ color: n.read ? undefined : "var(--foreground)" }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`h-3 w-3 rounded-full ${n.read ? "bg-gray-300" : "bg-primary"}`}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate line-clamp-1">
                      {n.title}
                    </p>
                    <p className="text-xs truncate line-clamp-1 text-gray-500 dark:text-gray-400">
                      {n.message}
                    </p>
                  </div>
                  {n.action && (
                    <button
                      className="ml-2 text-xs text-primary underline underline-offset-1 cursor-pointer"
                      onClick={n.action}
                    >
                      View
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate line-clamp-1">
                  {n.timestamp instanceof Date
                    ? n.timestamp.toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ThemeProvider;