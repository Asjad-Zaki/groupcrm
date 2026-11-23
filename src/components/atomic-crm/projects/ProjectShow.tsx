import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router";
import { useGetOne } from "ra-core";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  User,
  Users,
  Building2,
  FileText,
  HardHat,
  CalendarRange,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MilestonesTab } from "./MilestonesTab";
import { DailyLogsTab } from "./DailyLogsTab";
import { ProjectTasksTab } from "./ProjectTasksTab";
import { TeamTab } from "./TeamTab";
import { DocumentsNOCTab } from "./DocumentsNOCTab";
import { GanttTimelineTab } from "./GanttTimelineTab";
import type { Project } from "../types";

export const ProjectShow = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  type TabType = "milestones" | "daily_logs" | "tasks" | "gantt" | "team" | "documents";
  const validTabs: TabType[] = ["milestones", "daily_logs", "tasks", "gantt", "team", "documents"];

  const initialTab = searchParams.get("tab") as TabType;
  const [activeTab, setActiveTab] = useState<TabType>(
    validTabs.includes(initialTab) ? initialTab : "milestones"
  );

  useEffect(() => {
    const currentTabParam = searchParams.get("tab") as TabType;
    if (currentTabParam && validTabs.includes(currentTabParam) && currentTabParam !== activeTab) {
      setActiveTab(currentTabParam);
    }
  }, [searchParams]);

  const handleTabSelect = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const { data: project, isPending, refetch } = useGetOne<Project>("projects", {
    id: id!,
  });

  if (isPending || !project) {
    return (
      <div className="w-full space-y-4 p-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-2xl" />
        <div className="h-40 bg-muted animate-pulse rounded-2xl" />
      </div>
    );
  }

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
        return {
          name: "Goldland Contracting LLC",
          code: "GL",
          color: "bg-amber-500/15 text-amber-500 border-amber-500/30",
        };
      case 2:
        return {
          name: "Abbadi Tech Technical Services LLC",
          code: "AT",
          color: "bg-blue-500/15 text-blue-500 border-blue-500/30",
        };
      case 3:
        return {
          name: "Casavera Interiors LLC",
          code: "CV",
          color: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
        };
      default:
        return {
          name: "Group Project",
          code: "GP",
          color: "bg-slate-500/15 text-slate-500 border-slate-500/30",
        };
    }
  };

  const comp = getCompanyLabel(project.tenant_id);

  const completedMilestonesCount = project.milestones?.filter((m) => m.completed).length || 0;
  const totalMilestonesCount = project.milestones?.length || 0;
  const dailyLogsCount = project.daily_logs?.length || 0;
  const teamMembersCount = project.team_members?.length || 0;
  const documentsCount = project.noc_documents?.length || 0;

  return (
    <div className="w-full space-y-6 pb-16">
      {/* Top back & actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects Directory
        </Link>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold border ${comp.color}`}>
            {comp.code} · {comp.name}
          </span>
          <Badge
            variant="outline"
            className="text-xs uppercase font-bold bg-primary/10 text-primary border-primary/25"
          >
            {project.status.replace("_", " ")}
          </Badge>
        </div>
      </div>

      {/* Project Banner Card */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="space-y-4 pb-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-primary font-bold tracking-wider">
                {project.reference_no}
              </span>
              <CardTitle className="text-2xl font-extrabold tracking-tight mt-0.5">
                {project.name}
              </CardTitle>
              <CardDescription className="text-xs max-w-3xl leading-relaxed text-muted-foreground">
                {project.scope_summary}
              </CardDescription>
            </div>
            <div className="text-left md:text-right shrink-0 p-3 rounded-xl bg-muted/40 border border-border/60">
              <span className="text-[11px] text-muted-foreground uppercase font-semibold block">
                Contract Value (AED)
              </span>
              <span className="text-2xl font-black text-foreground">
                {formatAED(project.contract_value)}
              </span>
            </div>
          </div>

          {/* Progress bar & Current Milestone */}
          <div className="pt-2 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-muted-foreground">
                Active Permitting / Work Stage:{" "}
                <strong className="text-foreground">{project.current_stage}</strong>
              </span>
              <span className="font-bold text-primary">{project.progress_percent}% Complete</span>
            </div>
            <Progress value={project.progress_percent} className="h-2.5" />
          </div>
        </CardHeader>

        {/* Project Meta Info Strip */}
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 border-t border-border/60 text-xs bg-muted/10">
          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-primary" /> Site Location
            </span>
            <p className="font-semibold text-foreground truncate">{project.site_location}</p>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Target Handover
            </span>
            <p className="font-semibold text-foreground font-mono">{project.target_completion_date}</p>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1 font-medium">
              <User className="w-3.5 h-3.5 text-blue-400" /> Assigned Engineer
            </span>
            <p className="font-semibold text-foreground">
              {project.engineer_id === 0
                ? "Navas (MD / Consultant)"
                : project.engineer_id === 3
                  ? "Abrar (Operations Director)"
                  : project.engineer_id === 5
                    ? "Asma (Interior Designer)"
                    : project.engineer_id === 6
                      ? "Faseela (Permitting Specialist)"
                      : project.engineer_id === 7
                        ? "Sadiq (Senior MEP Engineer)"
                        : "Arshad (Site Inspection Eng.)"}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Authority Stage
            </span>
            <p className="font-semibold text-foreground truncate">{project.current_stage}</p>
          </div>
        </CardContent>
      </Card>

      {/* Operational Hub Navigation Tabs */}
      <div className="border-b border-border/80">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => handleTabSelect("milestones")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === "milestones"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Milestones & Approvals
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary">
              {completedMilestonesCount}/{totalMilestonesCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSelect("daily_logs")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === "daily_logs"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            <HardHat className="w-4 h-4" />
            Project Daily Log
            {dailyLogsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary">
                {dailyLogsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabSelect("tasks")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === "tasks"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Project Tasks
          </button>

          <button
            type="button"
            onClick={() => handleTabSelect("gantt")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === "gantt"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            <CalendarRange className="w-4 h-4" />
            Gantt Timeline
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary">
              Bitrix24
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSelect("team")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === "team"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            <Users className="w-4 h-4" />
            Team & Key Contacts
            {teamMembersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary">
                {teamMembersCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabSelect("documents")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === "documents"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            <FileText className="w-4 h-4" />
            Drawings & NOC Documents
            {documentsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary">
                {documentsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Panes */}
      <div className="pt-2">
        {activeTab === "milestones" && (
          <MilestonesTab project={project} onRefresh={refetch} />
        )}

        {activeTab === "daily_logs" && (
          <DailyLogsTab project={project} onRefresh={refetch} />
        )}

        {activeTab === "tasks" && (
          <ProjectTasksTab project={project} />
        )}

        {activeTab === "gantt" && (
          <GanttTimelineTab project={project} onRefresh={refetch} />
        )}

        {activeTab === "team" && (
          <TeamTab project={project} onRefresh={refetch} />
        )}

        {activeTab === "documents" && (
          <DocumentsNOCTab project={project} onRefresh={refetch} />
        )}
      </div>
    </div>
  );
};

export default ProjectShow;
