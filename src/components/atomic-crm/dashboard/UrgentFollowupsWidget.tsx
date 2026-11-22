import { useGetList, useRedirect } from "ra-core";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, ArrowRight, ShieldAlert } from "lucide-react";
import type { Deal } from "../types";
import { useActiveTenant } from "@/hooks/useTenant";

export const UrgentFollowupsWidget = () => {
  const { activeTenantId, isGroup } = useActiveTenant();
  const redirect = useRedirect();

  const { data: deals = [] } = useGetList<Deal>("deals", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "created_at", order: "DESC" },
  });

  const todayStr = new Date().toISOString().split("T")[0];

  const urgentDeals = deals.filter((deal) => {
    // Company filter
    if (!isGroup) {
      const tenantNum =
        activeTenantId === "goldland"
          ? 1
          : activeTenantId === "abbadi"
            ? 2
            : activeTenantId === "casavera"
              ? 3
              : null;
      if (tenantNum !== null && deal.tenant_id !== tenantNum) {
        return false;
      }
    }

    const isOverdue =
      deal.next_followup_at && deal.next_followup_at < todayStr;
    return deal.high_risk || isOverdue;
  });

  if (urgentDeals.length === 0) return null;

  const getCompanyCode = (tenantId?: number) => {
    switch (tenantId) {
      case 1:
        return "GL";
      case 2:
        return "AT";
      case 3:
        return "CV";
      default:
        return "GP";
    }
  };

  return (
    <Card className="mb-4 border-red-500/20 bg-red-950/5">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-red-500" />
          <CardTitle className="text-sm font-bold text-red-400">
            Urgent Attention: SLA Overdue & High-Risk Leads ({urgentDeals.length})
          </CardTitle>
        </div>
        <button
          type="button"
          onClick={() => redirect("/deals")}
          className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          View Pipeline <ArrowRight className="h-3 w-3" />
        </button>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {urgentDeals.slice(0, 3).map((deal) => {
            const isOverdue =
              deal.next_followup_at && deal.next_followup_at < todayStr;
            return (
              <div
                key={deal.id}
                onClick={() => redirect(`/deals/${deal.id}/show`)}
                className="p-2.5 rounded-lg border border-border/60 bg-background/80 hover:border-red-500/40 hover:shadow-sm cursor-pointer transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {getCompanyCode(deal.tenant_id)}
                  </Badge>
                  <div className="flex items-center gap-1">
                    {deal.high_risk && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        RISK
                      </span>
                    )}
                    {isOverdue && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400">
                        <Clock className="h-2.5 w-2.5" />
                        OVERDUE
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs font-semibold line-clamp-1">{deal.name}</p>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                  <span>AED {Number(deal.amount || 0).toLocaleString()}</span>
                  <span className="text-[10px]">
                    {isOverdue ? `Due: ${deal.next_followup_at}` : deal.risk_reason || "Flagged"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default UrgentFollowupsWidget;

