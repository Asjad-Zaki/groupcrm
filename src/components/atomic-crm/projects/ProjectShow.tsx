import { useParams, Link } from "react-router";
import { useGetOne, useUpdate, useNotify } from "ra-core";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Circle,
  ExternalLink,
  FileText,
  FolderOpen,
  MapPin,
  ShieldCheck,
  User,
} from "lucide-react";
import type { Project } from "../types";

export const ProjectShow = () => {
  const { id } = useParams<{ id: string }>();
  const notify = useNotify();

  const { data: project, isPending, refetch } = useGetOne<Project>("projects", {
    id: id!,
  });

  const [update] = useUpdate();

  if (isPending || !project) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  const toggleMilestone = async (milestoneId: string) => {
    const updatedMilestones = project.milestones.map((m) => {
      if (m.id === milestoneId) {
        const nextState = !m.completed;
        return {
          ...m,
          completed: nextState,
          completed_at: nextState ? new Date().toISOString().split("T")[0] : undefined,
        };
      }
      return m;
    });

    const completedCount = updatedMilestones.filter((m) => m.completed).length;
    const progress_percent = Math.round(
      (completedCount / updatedMilestones.length) * 100
    );

    // Find current active stage (first incomplete milestone or last stage)
    const activeMilestone =
      updatedMilestones.find((m) => !m.completed) ||
      updatedMilestones[updatedMilestones.length - 1];

    try {
      await update(
        "projects",
        {
          id: project.id,
          data: {
            ...project,
            milestones: updatedMilestones,
            progress_percent,
            current_stage: activeMilestone.title,
            status: progress_percent === 100 ? "completed" : project.status,
          },
          previousData: project,
        },
        { mutationMode: "optimistic" }
      );
      notify("Milestone updated", { type: "success" });
      refetch();
    } catch {
      notify("Failed to update milestone", { type: "error" });
    }
  };

  const formatAED = (value: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getCompanyLabel = (tenantId: number) => {
    switch (tenantId) {
      case 1:
        return { name: "Goldland Contracting LLC", code: "GL", color: "bg-amber-500/15 text-amber-500 border-amber-500/30" };
      case 2:
        return { name: "Abbadi Tech Technical Services LLC", code: "AT", color: "bg-blue-500/15 text-blue-500 border-blue-500/30" };
      case 3:
        return { name: "Casavera Interiors LLC", code: "CV", color: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" };
      default:
        return { name: "Group Project", code: "GP", color: "bg-slate-500/15 text-slate-500 border-slate-500/30" };
    }
  };

  const comp = getCompanyLabel(project.tenant_id);

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top back & actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
        <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold border ${comp.color}`}>
          {comp.name}
        </span>
      </div>

      {/* Project Banner Card */}
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-muted-foreground">{project.reference_no}</span>
              <CardTitle className="text-xl font-bold mt-1">{project.name}</CardTitle>
              <CardDescription className="text-xs mt-1 max-w-3xl">
                {project.scope_summary}
              </CardDescription>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs text-muted-foreground block">Contract Value</span>
              <span className="text-xl font-extrabold text-foreground">{formatAED(project.contract_value)}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="pt-2 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-muted-foreground">
                Current Milestone Track: <strong className="text-foreground">{project.current_stage}</strong>
              </span>
              <span className="font-bold text-primary">{project.progress_percent}% Complete</span>
            </div>
            <Progress value={project.progress_percent} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-border/60 text-xs">
          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Site Location
            </span>
            <p className="font-semibold">{project.site_location}</p>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Target Handover
            </span>
            <p className="font-semibold">{project.target_completion_date}</p>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" /> Assigned Engineer
            </span>
            <p className="font-semibold">
              {project.engineer_id === 0
                ? "Navas (MD / Consultant)"
                : project.engineer_id === 1
                  ? "Abrar (Operations)"
                  : project.engineer_id === 2
                    ? "Junaid (Site Engineer)"
                    : "Arshad (Site Inspection Eng.)"}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Execution Status
            </span>
            <p className="font-semibold capitalize text-primary">{project.status.replace("_", " ")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Milestones Stepper */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Execution Workflow Milestones</span>
              <span className="text-xs font-normal text-muted-foreground">
                {project.milestones.filter((m) => m.completed).length} of {project.milestones.length} completed
              </span>
            </CardTitle>
            <CardDescription className="text-xs">
              Click checkbox to update milestone progress and coordinate handoff.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {project.milestones.map((milestone, idx) => (
              <div
                key={milestone.id}
                onClick={() => toggleMilestone(milestone.id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  milestone.completed
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : idx === project.milestones.findIndex((m) => !m.completed)
                      ? "bg-primary/5 border-primary/40 shadow-sm"
                      : "bg-muted/20 border-border/50 hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    className="shrink-0 focus:outline-none"
                    title={milestone.completed ? "Mark incomplete" : "Mark completed"}
                  >
                    {milestone.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-semibold truncate ${
                        milestone.completed ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {idx + 1}. {milestone.title}
                    </p>
                    {milestone.completed_at && (
                      <span className="text-[10px] text-emerald-500 font-medium">
                        Completed on {milestone.completed_at}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Due: {milestone.due_date || project.target_completion_date}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Documents & Site Coordination */}
        <div className="space-y-6">
          {/* Google Drive Workspace */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-primary" />
                Project Documents
              </CardTitle>
              <CardDescription className="text-xs">
                Google Workspace Shared Drive folder
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-md bg-muted/30 border border-border/60 text-xs space-y-2">
                <div className="flex items-center justify-between font-medium">
                  <span className="flex items-center gap-1.5 truncate">
                    <FileText className="h-3.5 w-3.5 text-blue-400" />
                    Approved Drawings & Permitting
                  </span>
                  <Badge variant="outline" className="text-[10px]">PDF</Badge>
                </div>
                <div className="flex items-center justify-between font-medium">
                  <span className="flex items-center gap-1.5 truncate">
                    <FileText className="h-3.5 w-3.5 text-emerald-400" />
                    Signed Contract & BOQ
                  </span>
                  <Badge variant="outline" className="text-[10px]">DOCX</Badge>
                </div>
                <div className="flex items-center justify-between font-medium">
                  <span className="flex items-center gap-1.5 truncate">
                    <FileText className="h-3.5 w-3.5 text-amber-400" />
                    Site Inspection Photos
                  </span>
                  <Badge variant="outline" className="text-[10px]">12 Photos</Badge>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs flex items-center justify-center gap-1.5"
                onClick={() => notify("Connecting to Google Drive Shared folder...", { type: "info" })}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open Google Drive Folder
              </Button>
            </CardContent>
          </Card>

          {/* Quick Handover Checklist */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Site Safety & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2 text-muted-foreground">
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span>DCD Fire & Safety Permit:</span>
                <span className="font-semibold text-emerald-400">Compliant</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span>Site Insurance Coverage:</span>
                <span className="font-semibold text-foreground">Active (Oman Ins.)</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Contractor Pass:</span>
                <span className="font-semibold text-foreground">Issued</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectShow;

