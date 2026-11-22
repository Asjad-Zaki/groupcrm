/*
 * Design tokens for Group CRM
 * Tokens as CSS variables: colour, radius, spacing, shadow, type, motion
 * Light and dark themes, two densities
 * Per-company theming via tenants.branding and [data-tenant] attribute
 * Never invent brand colours - use placeholders until client supplies assets
 */

// ============================================================
// Colour tokens (placeholder - will be overridden by tenant branding)
// ============================================================

// Base colours - neutral grays as placeholders
// These are applied as CSS variables: var(--color-*, #default-value)
export const colours = {
  // Light mode
  light: {
    background: "#f8fafc",
    foreground: "#1e293b",
    primary: "#1d4ed8",
    primaryForeground: "#ffffff",
    secondary: "#64748b",
    secondaryForeground: "#ffffff",
    muted: "#f1f5f9",
    mutedForeground: "#64748b",
    accent: "#0f172a",
    card: "#ffffff",
    border: "#e2e8f0",
    input: "#ffffff",
    ring: "#1d4ed8",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    // Table row alternation
    rowEven: "#f8fafc",
    rowOdd: "#ffffff",
  },
  // Dark mode
  dark: {
    background: "#0f172a",
    foreground: "#f8fafc",
    primary: "#3b82f6",
    primaryForeground: "#ffffff",
    secondary: "#94a3b8",
    secondaryForeground: "#0f172a",
    muted: "#1e293b",
    mutedForeground: "#64748b",
    accent: "#f1f5f9",
    card: "#1e293b",
    border: "#334155",
    input: "#334155",
    ring: "#3b82f6",
    success: "#34d399",
    warning: "#fbbf24",
    error: "#f87171",
    // Table row alternation
    rowEven: "#1e293b",
    rowOdd: "#0f172a",
  },
} as const

// ============================================================
// Radius tokens
// ============================================================

export const radius = {
  none: "0",
  sm: "0.125rem",
  DEFAULT: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  full: "9999px",
} as const

// ============================================================
// Spacing tokens
// ============================================================

export const spacing = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  32: "8rem",
} as const

// ============================================================
// Shadow tokens
// ============================================================

export const shadow = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.05)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
} as const

// ============================================================
// Typography tokens
// ============================================================

export const typography = {
  fontFamily: {
    sans:
      '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    display: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
  },
  fontSize: {
    xs: ["0.75rem", { lineHeight: "1rem" }],
    sm: ["0.875rem", { lineHeight: "1.25rem" }],
    md: ["1rem", { lineHeight: "1.5rem" }],
    lg: ["1.125rem", { lineHeight: "1.75rem" }],
    xl: ["1.25rem", { lineHeight: "1.625rem" }],
    "2xl": ["1.5rem", { lineHeight: "2rem" }],
    "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
    "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
    "5xl": ["3rem", { lineHeight: "1" }],
    "6xl": ["3.75rem", { lineHeight: "1" }],
  },
  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0em",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },
} as const

// ============================================================
// Motion tokens
// ============================================================

export const motion = {
  // Timing: micro 120-200 ms, panels 200-300 ms, pages at most 300 ms
  micro: 120,
  panel: 250,
  page: 300,
  // Easing
  default: "cubic-bezier(0.4, 0, 0.2, 1)",
  easing: {
    micro: "cubic-bezier(0.4, 0, 0.2, 1)",
    panel: "cubic-bezier(0.4, 0, 0.2, 1)",
    page: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  // Reduced motion
  reducedMotion: "reduce",
} as const

// ============================================================
// Density tokens
// ============================================================

export const density = {
  compact: "compact",
  default: "default",
  spacious: "spacious",
} as const

// ============================================================
// Z-index tokens
// ============================================================

export const zIndex = {
  popover: 1000,
  dropdown: 1000,
  sticky: 1020,
  overlay: 1030,
  modal: 1040,
  tooltip: 1050,
} as const

// ============================================================
// Helper: apply tenant branding to root element
// ============================================================

// Given a tenant branding object, apply CSS variables to the document root
// Branding format from tenants table: { primary, accent, logo } colours in hex
export function applyTenantBranding(branding?: {
  primary?: string;
  accent?: string;
  logo?: string;
}) {
  if (!branding) return;

  const html = document.documentElement;

  // Apply primary colour as CSS variable
  if (branding.primary) {
    html.style.setProperty("--color-primary", branding.primary);
    html.style.setProperty("--color-primary-foreground", "#ffffff");
  }

  // Apply accent colour
  if (branding.accent) {
    html.style.setProperty("--color-accent", branding.accent);
  }

  // Apply logo if provided (as background image)
  if (branding.logo) {
    html.style.setProperty("--brand-logo", `url("${branding.logo}")`);
  }
}

// ============================================================
// Helper: apply density class to root
// ============================================================

export function applyDensity(d: DensityKey) {
  const html = document.documentElement;
  html.classList.remove("density-compact", "density-default", "density-spacious");
  html.classList.add(`density-${d}`);
}

// ============================================================
// Export types for TypeScript consumers
// ============================================================

export type ColourKey = keyof typeof colours;
export type RadiusKey = keyof typeof radius;
export type SpacingKey = keyof typeof spacing;
export type ShadowKey = keyof typeof shadow;
export type TypographyKey = keyof typeof typography;
export type MotionKey = keyof typeof motion;
export type DensityKey = keyof typeof density;
export type ZIndexKey = keyof typeof zIndex;