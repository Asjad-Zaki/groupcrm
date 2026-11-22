export const disableEmailPasswordAuthentication =
  import.meta.env.VITE_DISABLE_EMAIL_PASSWORD_AUTHENTICATION === "true";

export const googleWorkplaceDomain: string | undefined = import.meta.env
  .VITE_GOOGLE_WORKPLACE_DOMAIN;

/**
 * Domain allowlist for Google Workspace sign-in.
 * Only users with emails matching these domains can sign in.
 * Used by the auth provider to reject outside accounts.
 */
export const workspaceDomainAllowlist: ReadonlyArray<string> = [
  "goldlandcontracting.com",
  "abadditech.com",
  "casaverainteriors.com",
];
