import { useEffect, useState } from "react";
import { useTranslate } from "ra-core";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useTenantContext } from "@/hooks/useTenant";
import { Shield } from "lucide-react";

const supabaseAdmin: any = null;

interface LeadFormData {
  id?: string;
  source: string;
  service: string;
  project_type: string;
  location: string;
  priority: string;
  estimated_value: string;
  next_followup_at: string;
  notes: string;
  normalized_phone?: string;
  normalized_email?: string;
  company_id?: string;
}

export const LeadCreate = () => {
  const { tenant, activeTenantId } = useTenantContext();
  const translate = useTranslate();

  const [form, setForm] = useState<LeadFormData>({
    source: "",
    service: "",
    project_type: "",
    location: "",
    priority: "normal",
    estimated_value: "",
    next_followup_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    notes: "",
  });
  
  // Initialize form from URL params or defaults on mount
  useEffect(() => {
    // Form is already initialized with defaults above
  }, []);

  const [_leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [duplicateCheck, setDuplicateCheck] = useState<{ isDuplicate: boolean; matches: any[] }>({ isDuplicate: false, matches: [] });

  // Fetch existing leads for duplicate check
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
          .select("id, normalized_phone, normalized_email, source, company_id, stage")
          .eq("tenant_id", activeTenantId);

        if (error) throw error;

        if (data && mounted) {
          setLeads(data);
        }
      } catch (err) {
        console.error("Error fetching leads for duplicate check:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchLeads();

    return () => {
      mounted = false;
    };
  }, [activeTenantId]);

  // Check for duplicates based on phone or email
  useEffect(() => {
    const checkDuplicates = async () => {
      if (!activeTenantId || (!form.normalized_phone && !form.normalized_email)) {
        setDuplicateCheck({ isDuplicate: false, matches: [] });
        return;
      }

      try {
        const matches: any[] = [];

        if (form.normalized_phone) {
          const { data: phoneMatches } = await supabaseAdmin
            .from("leads")
            .select("*")
            .eq("tenant_id", activeTenantId)
            .eq("normalized_phone", form.normalized_phone.toLowerCase());

          if (phoneMatches && phoneMatches.length > 0) {
            matches.push(...phoneMatches);
          }
        }

        if (form.normalized_email) {
          const { data: emailMatches } = await supabaseAdmin
            .from("leads")
            .select("*")
            .eq("tenant_id", activeTenantId)
            .eq("normalized_email", form.normalized_email.toLowerCase());

          if (emailMatches && emailMatches.length > 0) {
            matches.push(...emailMatches);
          }
        }

        // Remove current lead if editing
        const uniqueMatches = matches.filter(
          (m: any) => m.id !== (form.id || "")
        );

        setDuplicateCheck({
          isDuplicate: uniqueMatches.length > 0,
          matches: uniqueMatches,
        });
      } catch (err) {
        console.error("Error checking duplicates:", err);
        setDuplicateCheck({ isDuplicate: false, matches: [] });
      }
    };

    checkDuplicates();
  }, [activeTenantId, form.normalized_phone, form.normalized_email, form.id]);

  // Create lead
  const handleCreate = async (values: any) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("leads")
        .insert({
          tenant_id: tenant?.id,
          source: values.source,
          service: values.service,
          project_type: values.project_type,
          location: values.location,
          priority: values.priority,
          estimated_value: values.estimated_value || null,
          next_followup_at: values.next_followup_at,
          source_meta: {},
          stage: "NEW",
          owner_id: (tenant as any)?.memberships?.find((m: any) => m.status === "active")?.sales_id || undefined,
          created_by: values.created_by,
          normalized_phone: values.normalized_phone?.toLowerCase() || undefined,
          normalized_email: values.normalized_email?.toLowerCase() || undefined,
          company_id: values.company_id || null,
          contact_id: values.contact_id || null,
          lost_reason: null,
          junk_reason: null,
        });

      if (error) throw error;

      // Dispatch event for list to reload
      window.dispatchEvent(new CustomEvent("leadCreated", {
        detail: { lead: data },
      }));

      // Show success
      window.dispatchEvent(new CustomEvent("showNotification", {
        detail: {
          message: translate("crm.lead.created_successfully"),
          type: "success",
        },
      }));

      return { success: true, lead: data };
    } catch (err) {
      console.error("Error creating lead:", err);
      window.dispatchEvent(new CustomEvent("showNotification", {
        detail: {
          message: translate("crm.lead.create_failed"),
          type: "error",
        },
      }));
      return { success: false };
    }
  };

  // Duplicate warning UI
  const duplicateWarning = duplicateCheck.isDuplicate && duplicateCheck.matches.length > 0;
  const warningMessage = duplicateCheck.matches.map(
    (m: any) => 
      `Duplicate lead found: ${m.normalized_phone || m.normalized_email || m.id}`
  ).join("; ") || translate("crm.lead.no_duplicates");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{translate("crm.lead.create_lead")}</CardTitle>
        </CardHeader>

        <CardContent>
          {/* Duplicate Warning */}
          {duplicateWarning && (
            <div className="p-3 rounded-md bg-red-50 text-red-800 mb-4 flex items-start gap-3">
              <Shield className="h-4 w-4 mt-1" />
              <div>
                <p className="font-medium">Duplicate Lead Detected</p>
                <p className="text-sm mt-1">{warningMessage}</p>
                <p className="text-xs text-red-600 mt-1">
                  A lead with the same phone or email already exists in {tenant?.name || "the system"}.
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left column */}
            <div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {translate("crm.lead.source")}
                </label>
                <select
                  defaultValue={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value }) }
                  className="w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">{translate("crm.lead.select_source")}</option>
                  <option value="website">{translate("crm.lead.website_form")}</option>
                  <option value="meta">{translate("crm.lead.meta_campaign")}</option>
                  <option value="whatsapp">{translate("crm.lead.whatsapp")}</option>
                  <option value="call">{translate("crm.lead.call")}</option>
                  <option value="referral">{translate("crm.lead.referral")}</option>
                  <option value="manual">{translate("crm.lead.manual_entry")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {translate("crm.lead.service")}
                </label>
                <input
                  type="text"
                  defaultValue={form.service}
                  onChange={(e) => setForm({ ...form, service: e.target.value }) }
                  placeholder={translate("crm.lead.service_placeholder")}
                  className="w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {form.project_type && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    {translate("crm.lead.project_type")}
                  </label>
                  <input
                    type="text"
                    value={form.project_type || ""}
                    onChange={(e) => setForm({ ...form, project_type: e.target.value }) }
                    className="w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {translate("crm.lead.location")}
                </label>
                <input
                  type="text"
                  value={form.location || ""}
                  onChange={(e) => setForm({ ...form, location: e.target.value }) }
                  placeholder={translate("crm.lead.location_placeholder")}
                  className="w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Right column */}
            <div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {translate("crm.lead.priority")}
                </label>
                <select
                  value={form.priority || "normal"}
                  onChange={(e) => setForm({ ...form, priority: e.target.value }) }
                  className="w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="normal">{translate("crm.lead.priority_normal")}</option>
                  <option value="high">{translate("crm.lead.priority_high")}</option>
                  <option value="urgent">{translate("crm.lead.priority_urgent")}</option>
                  <option value="critical">{translate("crm.lead.priority_critical")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {translate("crm.lead.estimated_value")}
                </label>
                <input
                  type="number"
                  value={form.estimated_value || ""}
                  onChange={(e) => setForm({ ...form, estimated_value: e.target.value }) }
                  placeholder={translate("crm.lead.estimated_value_placeholder")}
                  className="w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  step="100"
                />
                <p className="text-xs text-muted-foreground">AED</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {translate("crm.lead.next_followup")}
                </label>
                <input
                  type="date"
                  value={form.next_followup_at || ""}
                  onChange={(e) => setForm({ ...form, next_followup_at: e.target.value }) }
                  className="w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {translate("crm.lead.phone")}
                </label>
                <input
                  type="tel"
                  value={form.normalized_phone || ""}
                  onChange={(e) => setForm({ ...form, normalized_phone: e.target.value }) }
                  placeholder="+971 50/52/55/58"
                  className="w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={20}
                />
                <p className="text-xs text-muted-foreground">e.g., +971 50 123 4567</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {translate("crm.lead.email")}
                </label>
                <input
                  type="email"
                  value={form.normalized_email || ""}
                  onChange={(e) => setForm({ ...form, normalized_email: e.target.value }) }
                  placeholder="example@domain.ae"
                  className="w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">Optional</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {translate("crm.lead.company")}
                </label>
                <select
                  value={form.company_id || ""}
                  onChange={(e) => setForm({ ...form, company_id: e.target.value }) }
                  className="w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">{translate("crm.lead.select_company")}</option>
                  {/* Companies would be fetched from the organizations table */}
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              {translate("crm.lead.notes")}
            </label>
            <textarea
              value={form.notes || ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value }) }
              rows={3}
              className="w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
              placeholder={translate("crm.lead.notes_placeholder")}
            ></textarea>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="py-2 px-4 rounded-md text-sm font-medium transition-colors hover:bg-muted/50 text-muted-foreground"
          >
            {translate("crm.general.cancel")}
          </button>
          <button
            type="button"
            onClick={() => handleCreate(form)}
            disabled={isLoading || duplicateWarning}
            className="py-2 px-4 rounded-md text-sm font-medium transition-colors bg-primary/90 text-white hover:bg-primary/95"
          >
            {isLoading ? (
              <span className="spinner spinner-sm mr-1" />
            ) : (
              duplicateWarning ? (
                <span className="text-sm text-red-600">
                  {translate("crm.lead.duplicate_warning")}
                </span>
              ) : (
                translate("crm.lead.create")
              )
            )}
          </button>
        </CardFooter>
      </Card>
    </div>
  );
};