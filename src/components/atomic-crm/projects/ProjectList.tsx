import { useState } from "react";
import {
  useGetList,
  useRedirect,
} from "ra-core";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  CheckCircle2,
  Layers,
  MapPin,
  Search,
} from "lucide-react";
import { useActiveTenant } from "@/hooks/useTenant";
import type { Project } from "../types";

export const ProjectList = () => {
  const { activeTenantId, isGroup } = useActiveTenant();
  const redirect = useRedirect();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: projects = [], isPending } = useGetList<Project>("projects", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "created_at", order: "DESC" },
  });

  const filteredProjects = projects.filter((p) => {
    // Tenant filter
    if (!isGroup) {
      const tenantNum =
        activeTenantId === "goldland"
          ? 1
          : activeTenantId === "abbadi"
            ? 2
            : activeTenantId === "casavera"
              ? 3
              : null;
      if (tenantNum !== null && p.tenant_id !== tenantNum) {
        return false;
      }
    }

    // Status filter
    if (statusFilter !== "all" && p.status !== statusFilter) {
      return false;
    }

    // Search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchRef = p.reference_no.toLowerCase().includes(q);
      const matchLocation = p.site_location.toLowerCase().includes(q);
      if (!matchName && !matchRef && !matchLocation) return false;
    }

    return true;
  });

  const getCompanyBadge = (tenantId: number) => {
    switch (tenantId) {
      case 1:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
            GL · Goldland
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/15 text-blue-500 border border-blue-500/30">
            AT · Abbadi Tech
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
            CV · Casavera
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: Project["status"]) => {
    switch (status) {
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
            In Progress
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            Completed
          </Badge>
        );
      case "on_hold":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
            On Hold
          </Badge>
        );
      case "delayed":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">
            Delayed
          </Badge>
        );
    }
  };

  const formatAED = (value: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects & Operations</h1>
          <p className="text-sm text-muted-foreground">
            {isGroup
              ? "Consolidated Group Project Tracking across Goldland, Abbadi Tech & Casavera"
              : `Operating Project Delivery & Milestone Execution`}
          </p>
        </div>

        {/* Search & Status Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-60 rounded-md border border-input bg-background pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Statuses</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
            <option value="delayed">Delayed</option>
          </select>
        </div>
      </div>

      {/* Project Cards Grid */}
      {isPending ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="p-12 text-center">
          <Layers className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-3" />
          <h3 className="text-base font-semibold">No projects found</h3>
          <p className="text-xs text-muted-foreground mt-1">
            No projects match the selected operating company and filters.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              onClick={() => redirect(`/projects/${project.id}/show`)}
              className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <CardHeader className="pb-3 space-y-2">
                <div className="flex items-center justify-between">
                  {getCompanyBadge(project.tenant_id)}
                  {getStatusBadge(project.status)}
                </div>
                <div>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {project.reference_no}
                  </span>
                  <CardTitle className="text-sm font-semibold line-clamp-2 mt-0.5">
                    {project.name}
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {project.scope_summary}
                </p>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Stage: {project.current_stage}</span>
                    <span className="font-semibold text-primary">{project.progress_percent}%</span>
                  </div>
                  <Progress value={project.progress_percent} className="h-1.5" />
                </div>

                {/* Meta details */}
                <div className="pt-2 border-t border-border/60 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{project.site_location}</span>
                  </div>
                  <div className="flex items-center justify-end font-semibold text-foreground">
                    {formatAED(project.contract_value)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 shrink-0" />
                    <span>Due: {project.target_completion_date}</span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                    <span>
                      {project.milestones.filter((m) => m.completed).length} /{" "}
                      {project.milestones.length} Done
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;

