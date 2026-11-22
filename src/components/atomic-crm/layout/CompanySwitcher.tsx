import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check, Building2, Globe } from "lucide-react";
import { useActiveTenant, type Tenant } from "@/hooks/useTenant";

export const CompanySwitcher = () => {
  const { tenant, tenants, activeTenantId, setActiveTenant } = useActiveTenant();
  const [open, setOpen] = useState(false);

  const handleSelect = (tenantId: string) => {
    setActiveTenant(tenantId);
    setOpen(false);
  };

  const getBadgeColor = (id: string) => {
    switch (id) {
      case "goldland":
        return "bg-amber-500 text-white";
      case "abbadi":
        return "bg-blue-600 text-white";
      case "casavera":
        return "bg-emerald-600 text-white";
      case "group":
      default:
        return "bg-slate-700 text-white";
    }
  };

  return (
    <div className="mr-2">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-background/80 hover:bg-accent/60 text-xs font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          title="Switch Operating Company Context"
        >
          <span
            className={`inline-flex items-center justify-center h-4 px-1.5 rounded text-[10px] font-bold ${getBadgeColor(
              tenant?.id || "group"
            )}`}
          >
            {tenant?.id === "group" ? (
              <Globe className="h-2.5 w-2.5 mr-0.5" />
            ) : (
              <Building2 className="h-2.5 w-2.5 mr-0.5" />
            )}
            {tenant?.branding.logo || "ALL"}
          </span>
          <span className="font-semibold max-w-[140px] md:max-w-[180px] truncate">
            {tenant?.name || "Group Overview"}
          </span>
          <ChevronDown className="h-3 w-3 opacity-60 ml-0.5 shrink-0" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-80 p-1.5 shadow-xl">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Operating Companies</span>
              <span className="text-[10px] font-normal lowercase opacity-75">UAE Region</span>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="my-1" />

          {tenants.map((item: Tenant) => {
            const isSelected = activeTenantId === item.id;
            return (
              <DropdownMenuItem
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                  isSelected ? "bg-primary/10 font-medium text-primary" : "hover:bg-muted/60"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`inline-flex items-center justify-center h-5 w-7 rounded text-[10px] font-bold shrink-0 ${getBadgeColor(
                      item.id
                    )}`}
                  >
                    {item.branding.logo}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate leading-tight">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate leading-tight">
                      {item.legal_name}
                    </p>
                  </div>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-2" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CompanySwitcher;
