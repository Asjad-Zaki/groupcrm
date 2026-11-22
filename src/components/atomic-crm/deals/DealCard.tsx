import { Draggable } from "@hello-pangea/dnd";
import { useRedirect, RecordContextProvider } from "ra-core";
import { ReferenceField } from "@/components/admin/reference-field";
import { NumberField } from "@/components/admin/number-field";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Clock, Calendar } from "lucide-react";

import { CompanyAvatar } from "../companies/CompanyAvatar";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal } from "../types";
import { formatDealCategories } from "./dealUtils";

export const DealCard = ({ deal, index }: { deal: Deal; index: number }) => {
  if (!deal) return null;

  return (
    <Draggable draggableId={String(deal.id)} index={index}>
      {(provided, snapshot) => (
        <DealCardContent provided={provided} snapshot={snapshot} deal={deal} />
      )}
    </Draggable>
  );
};

export const DealCardContent = ({
  provided,
  snapshot,
  deal,
}: {
  provided?: any;
  snapshot?: any;
  deal: Deal;
}) => {
  const { dealCategories, currency } = useConfigurationContext();
  const redirect = useRedirect();
  const handleClick = () => {
    redirect(`/deals/${deal.id}/show`, undefined, undefined, undefined, {
      _scrollToTop: false,
    });
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const isOverdue =
    deal.next_followup_at && deal.next_followup_at < todayStr;

  const renderCompanyBadge = () => {
    switch (deal.tenant_id) {
      case 1:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-500 border border-amber-500/30">
            GL
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/15 text-blue-500 border border-blue-500/30">
            AT
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
            CV
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="cursor-pointer"
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      ref={provided?.innerRef}
      onClick={handleClick}
    >
      <RecordContextProvider value={deal}>
        <Card
          className={`py-2.5 transition-all duration-200 border-l-4 ${
            deal.high_risk
              ? "border-l-red-500 bg-red-950/10"
              : deal.tenant_id === 1
                ? "border-l-amber-500"
                : deal.tenant_id === 2
                  ? "border-l-blue-500"
                  : deal.tenant_id === 3
                    ? "border-l-emerald-500"
                    : "border-l-transparent"
          } ${
            snapshot?.isDragging
              ? "opacity-90 transform rotate-1 shadow-lg"
              : "shadow-sm hover:shadow-md"
          }`}
        >
          <CardContent className="px-3 py-1 flex flex-col gap-1.5">
            {/* Top row: Company Pill & High Risk / Overdue badges */}
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5">
                {renderCompanyBadge()}
                {deal.high_risk && (
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40"
                    title={deal.risk_reason || "High Risk Flagged"}
                  >
                    <AlertTriangle className="h-2.5 w-2.5" />
                    RISK
                  </span>
                )}
              </div>

              {deal.next_followup_at && (
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    isOverdue
                      ? "bg-red-500/15 text-red-400 font-semibold border border-red-500/30"
                      : "bg-muted text-muted-foreground"
                  }`}
                  title={isOverdue ? "Follow-up Overdue" : "Next Follow-up"}
                >
                  {isOverdue ? (
                    <Clock className="h-2.5 w-2.5 text-red-400" />
                  ) : (
                    <Calendar className="h-2.5 w-2.5" />
                  )}
                  {deal.next_followup_at}
                </span>
              )}
            </div>

            {/* Title & Customer Organization */}
            <div className="flex-1 flex items-start gap-1.5">
              <p className="flex-1 text-xs font-semibold leading-snug line-clamp-2">
                <ReferenceField
                  source="company_id"
                  reference="companies"
                  link={false}
                />
                {" - "}
                {deal.name}
              </p>
              <ReferenceField
                source="company_id"
                reference="companies"
                link={false}
              >
                <CompanyAvatar width={20} height={20} />
              </ReferenceField>
            </div>

            {/* Value & Categories */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5 border-t border-border/50">
              <span className="font-semibold text-foreground">
                <NumberField
                  source="amount"
                  options={{
                    notation: "compact",
                    style: "currency",
                    currency,
                    currencyDisplay: "narrowSymbol",
                    minimumSignificantDigits: 3,
                  }}
                />
              </span>
              <span className="truncate max-w-[150px] text-[10px] opacity-80">
                {formatDealCategories(dealCategories, deal.categories)}
              </span>
            </div>
          </CardContent>
        </Card>
      </RecordContextProvider>
    </div>
  );
};

export default DealCard;
