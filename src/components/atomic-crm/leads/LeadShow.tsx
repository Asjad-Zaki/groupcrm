import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useTranslate } from "ra-core";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useTenantContext } from "@/hooks/useTenant";
import { Clock, Phone, AlertTriangle } from "lucide-react";

// Safe client placeholder for client-side evaluation
const supabaseAdmin: any = null;

export const LeadShow = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const { activeTenantId } = useTenantContext();
  const translate = useTranslate();

  const [lead, setLead] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [_timelineEvents, setTimelineEvents] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;

    const fetchLead = async () => {
      if (!activeTenantId || !leadId) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch lead with related data
        const { data, error } = await supabaseAdmin
          .from("leads")
          .select(
            `
            *,
            sales:tenant_memberships!inner (role_id),
            contacts (
              first_name,
              last_name,
              email,
              phone,
              title,
              organization_id
            ),
            lead_stage_history (
              *,
              sales:tenant_memberships!inner (role_id)
            )
          `,
          )
          .eq("id", leadId)
          .eq("tenant_id", activeTenantId)
          .single();

        if (error) throw error;

        if (data && mounted) {
          setLead({
            id: data.id.toString(),
            tenant_id: data.tenant_id ? Number(data.tenant_id) : undefined,
            contact_id: data.contact_id?.toString() || undefined,
            company_id: data.company_id?.toString() || undefined,
            source: data.source || "unknown",
            source_meta: data.source_meta || {},
            service: data.service || undefined,
            project_type: data.project_type || undefined,
            location: data.location || undefined,
            owner_id: data.owner_id?.toString() || undefined,
            stage: data.stage || "NEW",
            priority: data.priority || "normal",
            risk_flag: data.risk_flag,
            next_followup_at: data.next_followup_at || undefined,
            estimated_value: data.estimated_value
              ? Number(data.estimated_value)
              : undefined,
            lost_reason: data.lost_reason || undefined,
            junk_reason: data.junk_reason || undefined,
            normalized_phone: data.normalized_phone || undefined,
            normalized_email: data.normalized_email || undefined,
            created_by: data.created_by?.toString() || undefined,
            updated_by: data.updated_by?.toString() || undefined,
            created_at: data.created_at?.toString() || undefined,
            updated_at: data.updated_at?.toString() || undefined,
            // Related data
            contact: data.contacts
              ? {
                  id: data.contacts.id?.toString() || undefined,
                  first_name: data.contacts.first_name || "",
                  last_name: data.contacts.last_name || "",
                  email: data.contacts.email || "",
                  phone: data.contacts.phone || "",
                  title: data.contacts.title || undefined,
                  organization_id:
                    data.contacts.organization_id?.toString() || undefined,
                }
              : undefined,
            stageHistory: data.lead_stage_history || [],
          });
        }

        // Fetch timeline events (calls, meetings, notes, messages)
        if (data && mounted) {
          const { data: messages, error: msgError } = (await supabaseAdmin
            ?.from("messages")
            ?.select("*")
            ?.eq("lead_id", leadId)
            ?.eq("tenant_id", activeTenantId)
            ?.order("created_at", { ascending: false })) || {
            data: [],
            error: null,
          };

          if (!msgError && mounted) {
            const { data: notes, error: notesError } = (await supabaseAdmin
              ?.from("contact_notes")
              ?.select("*")
              ?.eq("contact_id", data.contact_id)
              ?.eq("tenant_id", activeTenantId)
              ?.order("created_at", { ascending: false })) || {
              data: [],
              error: null,
            };

            if (!notesError && mounted) {
              const events: any[] = [];

              // Add messages to timeline
              if (messages) {
                messages.forEach((m: any) => {
                  events.push({
                    id: m.id,
                    type: "message",
                    title: `Message from ${m.direction || "unknown"}`,
                    description: m.subject || m.body?.substring(0, 100) || "",
                    created_at: m.created_at,
                    related_id: m.id,
                    related_type: "message",
                  });
                });
              }

              // Add notes to timeline
              if (notes) {
                notes.forEach((n: any) => {
                  events.push({
                    id: n.id,
                    type: "note",
                    title: `Note by ${n.sales_id ? "User" : "System"}`,
                    description: n.text || "",
                    created_at: n.created_at,
                    related_id: n.id,
                    related_type: "note",
                  });
                });
              }

              setTimelineEvents(
                events.sort(
                  (a: any, b: any) =>
                    new Date(a.created_at).getTime() -
                    new Date(b.created_at).getTime(),
                ),
              );
            }
          }
        }
      } catch (err) {
        console.error("Error fetching lead:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchLead();

    return () => {
      mounted = false;
    };
  }, [activeTenantId, leadId]);

  if (!lead || isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-8 text-muted-foreground">
        <div className="text-center">
          <div className="spinner spinner-sm mx-auto mb-4" />
          <h3>{translate("crm.lead.loading_lead")}</h3>
        </div>
      </div>
    );
  }

  // Format stage name
  const stageNames: Record<string, string> = {
    NEW: translate("crm.lead.stage.new"),
    INITIATED: translate("crm.lead.stage.initiated"),
    UNDER_FOLLOW_UP: translate("crm.lead.stage.under_follow_up"),
    WARM: translate("crm.lead.stage.warm"),
    HOT: translate("crm.lead.stage.hot"),
    COLD: translate("crm.lead.stage.cold"),
    JUNK: translate("crm.lead.stage.junk"),
    WON_CONVERTED: translate("crm.lead.stage.won_converted"),
    LOST: translate("crm.lead.stage.lost"),
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {lead.stage ? (
              <span
                className={`inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-medium ${
                  lead.priority === "urgent"
                    ? "bg-red-100 text-red-800"
                    : lead.priority === "high"
                      ? "bg-orange-100 text-orange-800"
                      : lead.priority === "normal"
                        ? "bg-gray-100 text-gray-800"
                        : ""
                }`}
              >
                {stageNames[lead.stage] || lead.stage}
              </span>
            ) : (
              "Lead Details"
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Lead Information Column */}
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {translate("crm.lead.owner")}
                </label>
                {lead.owner_id && (
                  <div className="p-3 rounded-md border bg-muted/50">
                    <div className="font-medium">{lead.owner_id}</div>
                    <div className="text-xs text-muted-foreground">
                      {translate("crm.general.role")}
                    </div>
                  </div>
                )}
                {!lead.owner_id && (
                  <p className="text-sm text-muted-foreground">
                    {translate("crm.lead.no_owner")}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {translate("crm.lead.source")}
                </label>
                <p className="font-medium">{lead.source || "Unknown"}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {translate("crm.lead.service")}
                </label>
                <p className="font-medium">{lead.service || "—"}</p>
              </div>

              {lead.project_type && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    {translate("crm.lead.project_type")}
                  </label>
                  <p className="font-medium">{lead.project_type}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {translate("crm.lead.location")}
                </label>
                <p className="font-medium">{lead.location || "—"}</p>
              </div>

              {lead.estimated_value && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    {translate("crm.lead.estimated_value")}
                  </label>
                  <p className="font-medium">{lead.estimated_value} AED</p>
                </div>
              )}

              {!lead.estimated_value && (
                <p className="text-sm text-muted-foreground">
                  {translate("crm.lead.no_estimated_value")}
                </p>
              )}
            </div>

            {/* Timeline & Status Column */}
            <div>
              {/* Stage Progress */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {translate("crm.lead.stage")}
                </label>
                <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-colors ${lead.priority === "urgent" ? "bg-red-500" : lead.priority === "high" ? "bg-orange-500" : lead.priority === "normal" ? "bg-gray-500" : "bg-green-500"}`}
                    style={{
                      width:
                        lead.stage === "WON_CONVERTED" ? "100%" : "percentage",
                    }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stageNames[lead.stage] || lead.stage}
                </p>
              </div>

              {/* Next Follow-up */}
              {lead.next_followup_at && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    {translate("crm.lead.next_followup")}
                  </label>
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                      new Date(lead.next_followup_at) < new Date()
                        ? "border-red-500"
                        : "border-green-500"
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {new Date(lead.next_followup_at).toLocaleDateString()}{" "}
                      {new Date(lead.next_followup_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              )}

              {/* Risk Flag */}
              {lead.risk_flag && (
                <div className="mb-4 p-3 rounded-md bg-red-50 text-red-800">
                  <div className="font-medium flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{translate("crm.lead.high_risk")}</span>
                  </div>
                  <p className="text-sm mt-1">
                    {lead.risk_flag.mitigation || "Risk mitigation in progress"}
                  </p>
                </div>
              )}

              {/* Contact Information */}
              {lead.contact && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    {translate("crm.lead.contact")}
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <a
                        href={`tel:${lead.contact.phone}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {lead.contact.phone || "—"}
                      </a>
                    </div>
                    {lead.contact.email && (
                      <a
                        href={`mailto:${lead.contact.email}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {lead.contact.email}
                      </a>
                    )}
                    {(lead.contact.first_name || lead.contact.last_name) && (
                      <div className="text-sm">
                        <span>
                          {`${lead.contact.first_name || ""} ${lead.contact.last_name || ""}`.trim()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Stage History Summary */}
              {lead.stageHistory && lead.stageHistory.length > 0 && (
                <div className="mb-4 p-3 rounded-md bg-muted/50">
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    {translate("crm.lead.stage_history")} (
                    {lead.stageHistory.length})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {lead.stageHistory.slice(0, 5).map((h: any) => (
                      <span
                        key={h.id}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                          h.from_stage === "WON_CONVERTED"
                            ? "bg-green-100 text-green-800"
                            : h.to_stage === "WON_CONVERTED"
                              ? "bg-green-100 text-green-800"
                              : "text-muted-foreground"
                        }`}
                      >
                        {h.from_stage} → {h.to_stage}
                      </span>
                    ))}
                  </div>
                  {lead.stageHistory.length > 5 && (
                    <span className="text-xs text-muted-foreground">
                      +{lead.stageHistory.length - 5} more
                    </span>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("editLead", { detail: { lead } }),
                    )
                  }
                  className="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors hover:bg-primary/10 text-primary"
                >
                  {translate("crm.lead.edit")}
                </button>
                <button
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("convertLead", { detail: { lead } }),
                    )
                  }
                  className="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors bg-green-600 text-white"
                >
                  {translate("crm.lead.convert_to_project")}
                </button>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <div className="text-right">
            <button
              onClick={() => window.history.back()}
              className="text-sm text-muted-foreground hover:underline"
            >
              {translate("crm.general.back")}
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
