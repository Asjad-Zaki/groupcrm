import { useState } from "react";
import { useUpdate, useNotify } from "ra-core";
import {
  CheckCircle2,
  Circle,
  Calendar,
  AlertCircle,
  Clock,
  ShieldCheck,
  Building2,
  FileCheck2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Project } from "../types";

interface MilestonesTabProps {
  project: Project;
  onRefresh: () => void;
}

export const MilestonesTab = ({ project, onRefresh }: MilestonesTabProps) => {
  const [update] = useUpdate();
  const notify = useNotify();
  const [inspectionDate, setInspectionDate] = useState<string>("2026-11-28");
  const [inspectorNotes, setInspectorNotes] = useState<string>(
    "Emaar Retail and Dubai Municipality joint site inspection scheduled for final electrical & fire ceiling closure."
  );
  const [isEditingInspection, setIsEditingInspection] = useState(false);

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
      notify("Milestone stage updated successfully", { type: "success" });
      onRefresh();
    } catch {
      notify("Failed to update milestone", { type: "error" });
    }
  };

  const completedCount = project.milestones.filter((m) => m.completed).length;
  const currentStageIndex = project.milestones.findIndex((m) => !m.completed);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Milestones Stepper */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    Authority & Execution Milestones
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Track sequence from authority identification through DM/Civil Defence clearance to handover.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs px-2.5 py-0.5 bg-primary/10 text-primary border-primary/20">
                  {completedCount} of {project.milestones.length} Completed
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {project.milestones.map((milestone, idx) => {
                const isCompleted = milestone.completed;
                const isCurrent = idx === currentStageIndex;

                return (
                  <div
                    key={milestone.id}
                    onClick={() => toggleMilestone(milestone.id)}
                    className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isCompleted
                        ? "bg-emerald-500/5 border-emerald-500/25 hover:bg-emerald-500/10"
                        : isCurrent
                          ? "bg-primary/10 border-primary/40 shadow-sm ring-1 ring-primary/30"
                          : "bg-muted/20 border-border/60 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        type="button"
                        className="mt-0.5 shrink-0 focus:outline-none"
                        title={isCompleted ? "Mark incomplete" : "Mark completed"}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : isCurrent ? (
                          <Clock className="w-5 h-5 text-primary animate-pulse" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                        )}
                      </button>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground">
                            Step {idx + 1}
                          </span>
                          <span
                            className={`text-sm font-semibold truncate ${
                              isCompleted
                                ? "line-through text-muted-foreground"
                                : isCurrent
                                  ? "text-primary font-bold"
                                  : "text-foreground"
                            }`}
                          >
                            {milestone.title}
                          </span>
                          {isCurrent && (
                            <Badge className="text-[10px] h-4 bg-primary text-primary-foreground font-semibold px-1.5">
                              Current Track
                            </Badge>
                          )}
                        </div>

                        {milestone.notes && (
                          <p className="text-xs text-muted-foreground">
                            {milestone.notes}
                          </p>
                        )}

                        {milestone.completed_at && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            Completed on {milestone.completed_at}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 text-right space-y-1">
                      <span className="text-[11px] font-mono text-muted-foreground block">
                        Due: {milestone.due_date || project.target_completion_date}
                      </span>
                      <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to {isCompleted ? "reopen" : "complete"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Cards: Inspection Coordination & Permitting Summary */}
        <div className="space-y-6">
          {/* Site Inspection Coordination Card */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Authority Inspection Schedule
                </span>
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  Booked
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-muted/40 border border-border/60 space-y-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Next Inspection Date
                  </span>
                  <strong className="text-foreground font-mono">{inspectionDate}</strong>
                </div>
                <div className="text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Inspector Notes & Scope:</p>
                  {isEditingInspection ? (
                    <div className="space-y-2 mt-2">
                      <input
                        type="date"
                        value={inspectionDate}
                        onChange={(e) => setInspectionDate(e.target.value)}
                        className="w-full text-xs p-1.5 rounded bg-background border border-border"
                      />
                      <textarea
                        value={inspectorNotes}
                        onChange={(e) => setInspectorNotes(e.target.value)}
                        rows={3}
                        className="w-full text-xs p-1.5 rounded bg-background border border-border"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => setIsEditingInspection(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            setIsEditingInspection(false);
                            notify("Inspection schedule updated", { type: "success" });
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="italic text-foreground/90">{inspectorNotes}</p>
                  )}
                </div>
              </div>

              {!isEditingInspection && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setIsEditingInspection(true)}
                >
                  Reschedule / Update Inspection
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Permitting Status Quick Overview */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-primary" />
                Permitting Checkpoints
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span>Authority Fit-out Permit:</span>
                <span className="font-semibold text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span>DCD Fire & Safety:</span>
                <span className="font-semibold text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Layout Approved
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span>DEWA Load Clearance:</span>
                <span className="font-semibold text-blue-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Sanctioned
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span>Developer Gate Passes:</span>
                <span className="font-semibold text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Notice Card */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-500">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              Remember to verify that all on-site technicians carry active Emirates IDs and valid contractor passes during inspector visits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
