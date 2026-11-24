import { useState } from "react";
import { useDataProvider, useNotify, useRedirect } from "ra-core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  Building2,
} from "lucide-react";
import type { Deal, Project } from "../types";
import {
  GOLDLAND_STAGES,
  ABBADI_STAGES,
  CASAVERA_STAGES,
} from "../providers/fakerest/dataGenerator/projects";

interface ConvertLeadToProjectModalProps {
  deal: Deal | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ConvertLeadToProjectModal = ({
  deal,
  open,
  onClose,
  onSuccess,
}: ConvertLeadToProjectModalProps) => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const redirect = useRedirect();

  const tenantId = deal?.tenant_id || 1;
  const prefix =
    tenantId === 1 ? "GL" : tenantId === 2 ? "AT" : "CV";
  const defaultRef = `${prefix}-PRJ-2026-${String(Math.floor(Math.random() * 900) + 100)}`;

  const defaultDate = new Date();
  defaultDate.setMonth(defaultDate.getMonth() + 3);
  const defaultTargetDate = defaultDate.toISOString().split("T")[0];

  const [refNo, setRefNo] = useState(defaultRef);
  const [contractValue, setContractValue] = useState(deal?.amount || 0);
  const [targetDate, setTargetDate] = useState(defaultTargetDate);
  const [siteLocation, setSiteLocation] = useState("Dubai, United Arab Emirates");
  const [engineerId, setEngineerId] = useState<number>(
    tenantId === 1 ? 4 : tenantId === 2 ? 2 : 1
  );
  const [scope, setScope] = useState(deal?.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!deal) return null;

  const getStagesForTenant = (tId: number) => {
    switch (tId) {
      case 1:
        return GOLDLAND_STAGES;
      case 2:
        return ABBADI_STAGES;
      case 3:
      default:
        return CASAVERA_STAGES;
    }
  };

  const handleConvert = async () => {
    setIsSubmitting(true);
    try {
      const stages = getStagesForTenant(tenantId);
      const milestones = stages.map((title, idx) => ({
        id: `m-${idx + 1}`,
        title,
        completed: idx === 0, // First milestone initiated
        completed_at: idx === 0 ? new Date().toISOString().split("T")[0] : undefined,
        due_date: targetDate,
      }));

      const newProjectData: Partial<Project> = {
        name: deal.name,
        reference_no: refNo,
        tenant_id: tenantId,
        deal_id: deal.id,
        company_id: deal.company_id,
        engineer_id: engineerId,
        status: "in_progress",
        current_stage: stages[1] || stages[0],
        progress_percent: 15,
        contract_value: Number(contractValue),
        start_date: new Date().toISOString().split("T")[0],
        target_completion_date: targetDate,
        site_location: siteLocation,
        scope_summary: scope,
        milestones,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const res = await dataProvider.create("projects", {
        data: newProjectData,
      });

      // Update deal stage to won
      await dataProvider.update("deals", {
        id: deal.id,
        data: {
          ...deal,
          stage: "won",
          project_id: res.data.id,
        },
        previousData: deal,
      });

      notify("Lead converted to Project successfully!", { type: "success" });
      onClose();
      if (onSuccess) onSuccess();
      redirect(`/projects/${res.data.id}/show`);
    } catch {
      notify("Failed to convert lead to project", { type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-5 w-5 text-amber-500" />
            Convert Won Lead to Project
          </DialogTitle>
          <DialogDescription className="text-xs">
            Initialize project milestones, assign site engineering lead, and schedule handover.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Lead Summary Info */}
          <div className="p-3 rounded-lg bg-muted/40 border border-border/60 space-y-1">
            <span className="font-semibold text-foreground text-sm block truncate">
              {deal.name}
            </span>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-bold text-primary">
                {tenantId === 1 ? "Goldland Approvals" : tenantId === 2 ? "Abbadi MEP Services" : "Casavera Fit-out"}
              </span>
              <span>•</span>
              <span>AED {Number(deal.amount || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Project Ref No.</Label>
              <Input
                value={refNo}
                onChange={(e) => setRefNo(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Contract Value (AED)</Label>
              <Input
                type="number"
                value={contractValue}
                onChange={(e) => setContractValue(Number(e.target.value))}
                className="h-8 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Target Completion</Label>
              <Input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Site Engineer Lead</Label>
              <select
                value={engineerId}
                onChange={(e) => setEngineerId(Number(e.target.value))}
                className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value={0}>Navas (Operations / MD / Consultant)</option>
                <option value={1}>Abrar (Operations / MD)</option>
                <option value={2}>Junaid (Site Engineer)</option>
                <option value={4}>Arshad (Site Inspection Engineer)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-semibold">Site Location in UAE</Label>
            <Input
              value={siteLocation}
              onChange={(e) => setSiteLocation(e.target.value)}
              placeholder="e.g. Downtown Dubai / Dubai Hills / JAFZA"
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-semibold">Scope of Work Summary</Label>
            <Textarea
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              rows={2}
              className="text-xs resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConvert}
            disabled={isSubmitting}
            className="gap-1.5"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isSubmitting ? "Converting..." : "Confirm & Launch Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConvertLeadToProjectModal;

