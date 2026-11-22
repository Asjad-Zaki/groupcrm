import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

export interface Tenant {
  id: string; // "group" | "goldland" | "abbadi" | "casavera"
  name: string;
  legal_name: string;
  domain: string;
  tenant_id: number | null;
  branding: {
    logo: string;
    primary: string;
    accent: string;
  };
  settings: {
    currency: string;
    timezone: string;
  };
  active: boolean;
}

export interface TenantMembership {
  id: string;
  sales_id: string;
  tenant_id: string;
  role_id: string | null;
  department: string;
  job_title: string;
  status: "provisional" | "active" | "suspended" | "ended";
  is_temporary: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  effective_from: string;
  effective_to: string | null;
  created_at: string;
}

export interface UseTenantContextValue {
  tenant: Tenant | null;
  tenants: Tenant[];
  memberships: TenantMembership[];
  activeTenantId: string;
  isGroup: boolean;
  companyFilter: Record<string, unknown>;
  isLoaded: boolean;
  setActiveTenantId: (tenantId: string) => Promise<void>;
  setActiveTenant: (tenantId: string) => void;
  loadMemberships: () => Promise<void>;
}

export const STORAGE_KEY = "atomic-crm-active-tenant";

export const TENANTS: Tenant[] = [
  {
    id: "group",
    name: "Group Overview",
    legal_name: "Group Holding LLC (UAE)",
    domain: "groupholding.ae",
    tenant_id: null,
    branding: {
      primary: "#0F172A",
      accent: "#38BDF8",
      logo: "GROUP",
    },
    settings: {
      currency: "AED",
      timezone: "Asia/Dubai",
    },
    active: true,
  },
  {
    id: "goldland",
    name: "Goldland Contracting LLC",
    legal_name: "Goldland Contracting LLC",
    domain: "goldland.ae",
    tenant_id: 1,
    branding: {
      primary: "#1E293B",
      accent: "#F59E0B",
      logo: "GL",
    },
    settings: {
      currency: "AED",
      timezone: "Asia/Dubai",
    },
    active: true,
  },
  {
    id: "abbadi",
    name: "Abbadi Tech Technical Services LLC",
    legal_name: "Abbadi Tech Technical Services LLC",
    domain: "abbaditech.ae",
    tenant_id: 2,
    branding: {
      primary: "#1E3A8A",
      accent: "#3B82F6",
      logo: "AT",
    },
    settings: {
      currency: "AED",
      timezone: "Asia/Dubai",
    },
    active: true,
  },
  {
    id: "casavera",
    name: "Casavera Interiors LLC",
    legal_name: "Casavera Interiors LLC",
    domain: "casavera.ae",
    tenant_id: 3,
    branding: {
      primary: "#064E3B",
      accent: "#10B981",
      logo: "CV",
    },
    settings: {
      currency: "AED",
      timezone: "Asia/Dubai",
    },
    active: true,
  },
];

const getStoredTenantId = (): string => {
  if (typeof window === "undefined") return "group";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && TENANTS.some((t) => t.id === saved)) {
      return saved;
    }
  } catch {
    // Ignore localStorage access issues
  }
  return "group";
};

const applyTenantBranding = (tenant: Tenant) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--primary-color", tenant.branding.primary);
  root.style.setProperty("--accent-color", tenant.branding.accent);
  root.dataset.tenant = tenant.id;
  if (tenant.branding.logo) {
    root.style.setProperty("--logo-url", `/logos/${tenant.branding.logo}`);
  }
};

export function useTenant(): UseTenantContextValue {
  const [activeTenantId, setActiveTenantIdState] = useState<string>(getStoredTenantId);
  const [isLoaded, setIsLoaded] = useState(true);

  const tenant = useMemo(() => {
    return TENANTS.find((t) => t.id === activeTenantId) || TENANTS[0];
  }, [activeTenantId]);

  const isGroup = activeTenantId === "group";

  const companyFilter = useMemo(() => {
    if (isGroup || tenant.tenant_id === null) {
      return {};
    }
    return { tenant_id: tenant.tenant_id };
  }, [isGroup, tenant.tenant_id]);

  const memberships: TenantMembership[] = useMemo(() => [
    {
      id: "mem-1",
      sales_id: "sales-1",
      tenant_id: activeTenantId,
      role_id: "director",
      department: "Management",
      job_title: "Commercial Director",
      status: "active",
      is_temporary: false,
      reviewed_by: null,
      reviewed_at: null,
      effective_from: "2026-01-01",
      effective_to: null,
      created_at: "2026-01-01",
    },
  ], [activeTenantId]);

  const applyTenant = useCallback((id: string) => {
    const target = TENANTS.find((t) => t.id === id) || TENANTS[0];
    setActiveTenantIdState(target.id);
    try {
      localStorage.setItem(STORAGE_KEY, target.id);
    } catch {
      // Ignore
    }
    applyTenantBranding(target);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tenantChanged", { detail: { tenantId: target.id } })
      );
    }
  }, []);

  const setActiveTenantId = useCallback(
    async (tenantId: string) => {
      applyTenant(tenantId);
    },
    [applyTenant]
  );

  const setActiveTenant = useCallback(
    (tenantId: string) => {
      applyTenant(tenantId);
    },
    [applyTenant]
  );

  const loadMemberships = useCallback(async () => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const found = TENANTS.find((t) => t.id === e.newValue);
        if (found) {
          setActiveTenantIdState(found.id);
          applyTenantBranding(found);
        }
      }
    };

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ tenantId: string }>;
      const id = customEvent.detail?.tenantId;
      if (id && id !== activeTenantId) {
        const found = TENANTS.find((t) => t.id === id);
        if (found) {
          setActiveTenantIdState(found.id);
          applyTenantBranding(found);
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("tenantChanged", handleCustomEvent);

    // Initial branding application
    applyTenantBranding(tenant);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("tenantChanged", handleCustomEvent);
    };
  }, [activeTenantId, tenant]);

  return {
    tenant,
    tenants: TENANTS,
    memberships,
    activeTenantId,
    isGroup,
    companyFilter,
    isLoaded,
    setActiveTenantId,
    setActiveTenant,
    loadMemberships,
  };
}

const defaultContextValue: UseTenantContextValue = {
  tenant: TENANTS[0],
  tenants: TENANTS,
  memberships: [],
  activeTenantId: "group",
  isGroup: true,
  companyFilter: {},
  isLoaded: true,
  setActiveTenantId: async () => {},
  setActiveTenant: () => {},
  loadMemberships: async () => {},
};

const TenantContext = createContext<UseTenantContextValue>(defaultContextValue);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const value = useTenant();
  return React.createElement(TenantContext.Provider, { value }, children);
};

export const useTenantContext = (): UseTenantContextValue => {
  const context = useContext(TenantContext);
  return context || defaultContextValue;
};

export const useActiveTenant = useTenantContext;

export default useTenant;
