import type { AuthProvider } from "ra-core";

import type { Sale } from "../../types";
import { canAccess } from "../commons/canAccess";
import { dataProvider } from "./dataProvider";
import { TEAM_MEMBERS } from "./dataGenerator/sales";

export const DEFAULT_USER: Sale = TEAM_MEMBERS[0];

export const USER_STORAGE_KEY = "user";

export async function findUserByCredential(input: string): Promise<Sale | undefined> {
  const query = (input || "").trim().toLowerCase();
  if (!query) return undefined;

  // Search in seeded TEAM_MEMBERS first
  let user = TEAM_MEMBERS.find((m) => {
    if (m.disabled) return false;
    if (m.email.toLowerCase() === query) return true;
    if (m.secondary_emails?.some((e) => e.toLowerCase() === query)) return true;
    if (m.first_name.toLowerCase() === query) return true;
    if (`${m.first_name} ${m.last_name}`.toLowerCase() === query) return true;
    return false;
  });

  if (user) return user;

  // Fallback to dataProvider sales list
  try {
    const res = await dataProvider.getList<Sale>("sales", {
      pagination: { page: 1, perPage: 100 },
      sort: { field: "id", order: "ASC" },
    });
    user = res.data.find(
      (s) =>
        !s.disabled &&
        (s.email.toLowerCase() === query ||
          s.secondary_emails?.some((e: string) => e.toLowerCase() === query) ||
          s.first_name.toLowerCase() === query),
    );
  } catch {
    // ignore
  }

  return user;
}

export const authProvider: AuthProvider = {
  login: async ({ email, username, password }) => {
    const cred = email || username;
    const user = await findUserByCredential(cred);

    if (!user) {
      throw new Error(`Employee account "${cred}" not found in Group CRM directory.`);
    }

    if (
      password &&
      password !== "demo" &&
      password !== "Password123!" &&
      user.password &&
      password !== user.password
    ) {
      throw new Error("Invalid password. Please use 'demo' or 'Password123!'.");
    }

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

    // Update active tenant context if user belongs to specific single tenant
    if (user.tenant_ids && user.tenant_ids.length === 1) {
      localStorage.setItem("atomic-crm-active-tenant", user.tenant_ids[0]);
    }

    // Dispatch event so active components update
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("group-crm:auth-change", { detail: user }),
      );
    }

    return Promise.resolve();
  },
  resetPassword: async () => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return;
  },
  setPassword: async () => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return;
  },
  logout: () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("group-crm:auth-change", { detail: null }),
      );
    }
    return Promise.resolve();
  },
  checkError: () => Promise.resolve(),
  checkAuth: () => {
    const userItem = localStorage.getItem(USER_STORAGE_KEY);
    if (!userItem) {
      return Promise.reject({ redirectTo: "/login" });
    }
    try {
      const user = JSON.parse(userItem);
      if (user && (user.id !== undefined || user.email)) {
        return Promise.resolve();
      }
    } catch {
      // Invalid JSON in localStorage
    }
    return Promise.reject({ redirectTo: "/login" });
  },
  canAccess: async ({ signal: _signal, ...params }) => {
    const userItem = localStorage.getItem(USER_STORAGE_KEY);
    const localUser = userItem ? (JSON.parse(userItem) as Sale) : null;
    if (!localUser) return false;

    const role = localUser.administrator ? "admin" : "user";
    return canAccess(role, params);
  },
  getIdentity: () => {
    const userItem = localStorage.getItem(USER_STORAGE_KEY);
    const user = userItem ? (JSON.parse(userItem) as Sale) : null;
    if (!user) {
      return Promise.reject(new Error("Not authenticated"));
    }
    return Promise.resolve({
      id: user.id,
      fullName: `${user.first_name} ${user.last_name}`,
      avatar: user.avatar?.src,
      email: user.email,
      role: user.role_name || (user.administrator ? "Administrator" : "Employee"),
      title: user.job_title || user.department,
      tenants: user.tenant_ids || ["goldland", "abbadi", "casavera"],
    });
  },
  async getAuthorizationDetails() {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      data: {
        authorization_id: "dummy",
        user: {
          id: "0",
          email: "navas@groupcrm.ae",
        },
        client: {
          name: "Group CRM Client",
        },
        scope: "openid profile email phone",
        redirect_uri: "https://example.com/auth_callback",
      },
      error: null,
    };
  },
  async approveAuthorization() {
    return {
      data: {
        redirect_url: "https://example.com/auth_callback",
      },
      error: null,
    };
  },
  async denyAuthorization() {
    return {
      data: {
        redirect_url: "https://example.com/denied",
      },
      error: null,
    };
  },
};
