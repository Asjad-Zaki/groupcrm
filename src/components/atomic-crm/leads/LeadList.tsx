import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslate } from "ra-core";
import { useTenantContext } from "@/hooks/useTenant";

const supabaseAdmin: any = null;

interface Lead {
  id: string;
  tenant_id?: number;
  contact_id?: string | null;
  company_id?: string | null;
  source: string;
  source_meta?: any;
  service?: string;
  project_type?: string;
  location?: string;
  owner_id?: string | null;
  stage: string;
  priority: string;
  risk_flag?: { type: string; owner: string; mitigation: string } | null;
  next_followup_at: string;
  estimated_value?: number;
  lost_reason?: string;
  junk_reason?: string;
  normalized_phone?: string;
  normalized_email?: string;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

export const LeadList = () => {
  const { tenant, activeTenantId } = useTenantContext();
  const translate = useTranslate();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchLeads = async () => {
      if (!activeTenantId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabaseAdmin
          .from("leads")
          .select(`
            *,
            sales:tenant_memberships!inner (role_id),
            contacts (
              first_name,
              last_name,
              email,
              phone
            )
          `)
          .eq("tenant_id", activeTenantId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data && mounted) {
          const leadList = data.map((l: any) => ({
            id: l.id.toString(),
            tenant_id: l.tenant_id ? Number(l.tenant_id) : undefined,
            contact_id: l.contact_id?.toString() || undefined,
            company_id: l.company_id?.toString() || undefined,
            source: l.source || "unknown",
            source_meta: l.source_meta || {},
            service: l.service || undefined,
            project_type: l.project_type || undefined,
            location: l.location || undefined,
            owner_id: l.owner_id?.toString() || undefined,
            stage: l.stage || "NEW",
            priority: l.priority || "normal",
            risk_flag: l.risk_flag,
            next_followup_at: l.next_followup_at || new Date().toISOString(),
            estimated_value: l.estimated_value ? Number(l.estimated_value) : undefined,
            lost_reason: l.lost_reason || undefined,
            junk_reason: l.junk_reason || undefined,
            normalized_phone: l.normalized_phone || undefined,
            normalized_email: l.normalized_email || undefined,
            created_by: l.created_by?.toString() || undefined,
            updated_by: l.updated_by?.toString() || undefined,
            created_at: l.created_at?.toString() || new Date().toISOString(),
            updated_at: l.updated_at?.toString() || new Date().toISOString(),
          })) as Lead[];

          setLeads(leadList);
        }
      } catch (err) {
        console.error("Error fetching leads:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchLeads();

    // Listen for changes via custom event
    const handleNewLead = () => {
      fetchLeads();
    };
    window.addEventListener("leadCreated", handleNewLead);

    return () => {
      mounted = false;
      window.removeEventListener("leadCreated", handleNewLead);
    };
  }, [activeTenantId, tenant]);

  // Group leads by stage for kanban board
  const groupedLeads = leads.reduce((acc, lead) => {
    const stage = lead.stage || "NEW";
    if (!acc[stage]) acc[stage] = [];
    acc[stage].push(lead);
    return acc;
  }, {} as Record<string, Lead[]>);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{translate("resources.leads.name", { smart_count: leads.length })}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Loading leads…
            </div>
          ) : (
            <>
              {/* Kanban Board Style */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                {/* NEW stage */}
                <div
                  key="NEW"
                  className={`p-4 rounded-lg border ${groupedLeads.NEW ? "" : "opacity-50"}`}
                  style={{ borderColor: "#1A1F2F" }}
                >
                  <div className="text-xs font-medium text-primary-foreground uppercase tracking-wider">{translate("crm.lead.stage.new")}</div>
                  {groupedLeads.NEW?.length > 0 ? (
                    <div className="mt-2 space-y-1 max-h-96 overflow-y-auto">
                      {groupedLeads.NEW!.map((lead) => (
                        <div
                          key={lead.id}
                          className={`p-3 rounded-md border-t-2 ${lead.priority === "urgent" ? "border-red-500" : "border-transparent"} cursor-pointer hover:bg-muted/50 transition-colors`}
                          onClick={() => window.dispatchEvent(new CustomEvent("leadSelected", { detail: { lead } }))}
                        >
                          <div className="font-medium truncate">{lead.normalized_phone || lead.normalized_email || `Lead ${lead.id.slice(0, 8)}`}</div>
                          <div className="text-xs text-muted-foreground">{lead.source}</div>
                          {lead.estimated_value && (
                            <div className="text-right text-sm font-medium">{lead.estimated_value} AED</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground no-leads">
                      {translate("crm.lead.no_leads")}
                    </div>
                  )}
                </div>

                {/* INITIATED stage */}
                <div
                  key="INITIATED"
                  className={`p-4 rounded-lg border ${groupedLeads.INITIATED ? "" : "opacity-50"}`}
                  style={{ borderColor: "#3182CE" }}
                >
                  <div className="text-xs font-medium text-primary-foreground uppercase tracking-wider">{translate("crm.lead.stage.initiated")}</div>
                  {groupedLeads.INITIATED?.length > 0 ? (
                    <div className="mt-2 space-y-1 max-h-96 overflow-y-auto">
                      {groupedLeads.INITIATED!.map((lead) => (
                        <div key={lead.id} className="p-3 rounded-md border-t-2 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => window.dispatchEvent(new CustomEvent("leadSelected", { detail: lead }))}>
                          <div className="font-medium truncate">{lead.normalized_phone || lead.normalized_email || `Lead ${lead.id.slice(0, 8)}`}</div>
                          <div className="text-xs text-muted-foreground">{lead.source}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground no-leads">{translate("crm.lead.no_leads")}</div>
                  )}
                </div>

                {/* UNDER FOLLOW-UP stage */}
                <div
                  key="UNDER_FOLLOW_UP"
                  className={`p-4 rounded-lg border ${groupedLeads.UNDER_FOLLOW_UP ? "" : "opacity-50"}`}
                  style={{ borderColor: "#48BB78" }}
                >
                  <div className="text-xs font-medium text-primary-foreground uppercase tracking-wider">{translate("crm.lead.stage.under_follow_up")}</div>
                  {groupedLeads.UNDER_FOLLOW_UP?.length > 0 ? (
                    <div className="mt-2 space-y-1 max-h-96 overflow-y-auto">
                      {groupedLeads.UNDER_FOLLOW_UP!.map((lead) => (
                        <div key={lead.id} className="p-3 rounded-md border-t-2 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => window.dispatchEvent(new CustomEvent("leadSelected", { detail: { lead } }))}>
                          <div className="font-medium truncate">{lead.normalized_phone || lead.normalized_email || `Lead ${lead.id.slice(0, 8)}`}</div>
                          <div className="text-xs text-muted-foreground">{lead.source}</div>
                          {lead.next_followup_at && (
                            <div className="text-right text-sm font-medium">
                              {new Date(lead.next_followup_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground no-leads">{translate("crm.lead.no_leads")}</div>
                  )}
                </div>

                {/* WARM stage */}
                <div
                  key="WARM"
                  className={`p-4 rounded-lg border ${groupedLeads.WARM ? "" : "opacity-50"}`}
                  style={{ borderColor: "#ED8936" }}
                >
                  <div className="text-xs font-medium text-primary-foreground uppercase tracking-wider">{translate("crm.lead.stage.warm")}</div>
                  {groupedLeads.WARM?.length > 0 ? (
                    <div className="mt-2 space-y-1 max-h-96 overflow-y-auto">
                      {groupedLeads.WARM!.map((lead) => (
                        <div key={lead.id} className="p-3 rounded-md border-t-2 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => window.dispatchEvent(new CustomEvent("leadSelected", { detail: { lead } }))}>
                          <div className="font-medium truncate">{lead.normalized_phone || lead.normalized_email || `Lead ${lead.id.slice(0, 8)}`}</div>
                          <div className="text-xs text-muted-foreground">{lead.source}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground no-leads">{translate("crm.lead.no_leads")}</div>
                  )}
                </div>

                {/* HOT stage */}
                <div
                  key="HOT"
                  className={`p-4 rounded-lg border ${groupedLeads.HOT ? "" : "opacity-50"}`}
                  style={{ borderColor: "#FC8181" }}
                >
                  <div className="text-xs font-medium text-primary-foreground uppercase tracking-wider">{translate("crm.lead.stage.hot")}</div>
                  {groupedLeads.HOT?.length > 0 ? (
                    <div className="mt-2 space-y-1 max-h-96 overflow-y-auto">
                      {groupedLeads.HOT!.map((lead) => (
                        <div key={lead.id} className="p-3 rounded-md border-t-2 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => window.dispatchEvent(new CustomEvent("leadSelected", { detail: { lead } }))}>
                          <div className="font-medium truncate">{lead.normalized_phone || lead.normalized_email || `Lead ${lead.id.slice(0, 8)}`}</div>
                          <div className="text-xs text-muted-foreground">{lead.source}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground no-leads">{translate("crm.lead.no_leads")}</div>
                  )}
                </div>

                {/* COLD / JUNK stages */}
                <div
                  key="COLD_JUNK"
                  className={`p-4 rounded-lg border ${!groupedLeads.COLD && !groupedLeads.JUNK ? "opacity-50" : ""}`}
                  style={{ borderColor: "#ED8936" }}
                >
                  <div className="text-xs font-medium text-primary-foreground uppercase tracking-wider">COLD / JUNK</div>
                  {groupedLeads.COLD?.length > 0 || groupedLeads.JUNK?.length > 0 ? (
                    <div className="mt-2 space-y-1 max-h-96 overflow-y-auto">
                      {([...(groupedLeads.COLD || []), ...(groupedLeads.JUNK || [])] as Lead[]).map((lead) => {
                        const stage = lead.stage === "COLD" ? "COLD" : "JUNK";
                        return (
                          <div
                            key={lead.id}
                            className={`p-3 rounded-md border-t-2 cursor-pointer hover:bg-muted/50 transition-colors`}
                            style={{ borderColor: stage === "COLD" ? "#ED8936" : "#F6E05E" }}
                            onClick={() => window.dispatchEvent(new CustomEvent("leadSelected", { detail: { lead } }))}
                          >
                            <div className="font-medium truncate">{lead.normalized_phone || lead.normalized_email || `Lead ${lead.id.slice(0, 8)}`}</div>
                            <div className="text-xs text-muted-foreground">{lead.source} — {stage}</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground no-leads">{translate("crm.lead.no_leads")}</div>
                  )}
                </div>
              </div>

              {/* Table view button */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent("showLeadTable"))}
                  className="text-sm text-primary underline cursor-pointer"
                >
                  {translate("crm.lead.view_table")}
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};