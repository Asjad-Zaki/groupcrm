import { useState } from "react";
import { useUpdate, useNotify } from "ra-core";
import {
  Calendar,
  Users,
  PackageCheck,
  AlertTriangle,
  Plus,
  Search,
  HardHat,
  Sun,
  Camera,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddDailyLogModal } from "./AddDailyLogModal";
import type { Project, ProjectDailyLogEntry } from "../types";

interface DailyLogsTabProps {
  project: Project;
  onRefresh: () => void;
}

export const DailyLogsTab = ({ project, onRefresh }: DailyLogsTabProps) => {
  const [update] = useUpdate();
  const notify = useNotify();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const logs = project.daily_logs || [];

  const handleAddLog = async (newLogData: Omit<ProjectDailyLogEntry, "id" | "created_at">) => {
    const newEntry: ProjectDailyLogEntry = {
      ...newLogData,
      id: `log-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    const updatedLogs = [newEntry, ...logs];

    try {
      await update(
        "projects",
        {
          id: project.id,
          data: {
            ...project,
            daily_logs: updatedLogs,
          },
          previousData: project,
        },
        { mutationMode: "optimistic" }
      );
      notify("Site Daily Log entry recorded", { type: "success" });
      onRefresh();
    } catch {
      notify("Failed to save daily log", { type: "error" });
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.work_summary.toLowerCase().includes(q) ||
      log.author_name.toLowerCase().includes(q) ||
      log.date.includes(q) ||
      (log.materials_received && log.materials_received.toLowerCase().includes(q))
    );
  });

  const totalManpowerToday = logs[0]?.manpower_count || 0;
  const totalEntries = logs.length;
  const activeBlockers = logs.filter((l) => !!l.blockers_or_delays);

  return (
    <div className="space-y-6">
      {/* Top Controls & KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60 bg-muted/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <HardHat className="w-4 h-4 text-primary" /> Active Manpower on Site
              </span>
              <p className="text-2xl font-black">{totalManpowerToday} Workers</p>
            </div>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              Today
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-muted/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-500" /> Site Entries Recorded
              </span>
              <p className="text-2xl font-black">{totalEntries} Logs</p>
            </div>
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
              Chronological
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-muted/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Active Site Blockers
              </span>
              <p className="text-2xl font-black">{activeBlockers.length}</p>
            </div>
            <Badge
              variant="outline"
              className={`text-xs ${
                activeBlockers.length > 0
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              }`}
            >
              {activeBlockers.length > 0 ? "Requires Review" : "Clear"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search site logs, trades, materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <Button
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          className="text-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Post Site Daily Log
        </Button>
      </div>

      {/* Daily Logs Timeline */}
      {filteredLogs.length === 0 ? (
        <Card className="border-dashed border-border/80">
          <CardContent className="p-8 text-center space-y-3">
            <HardHat className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-semibold">No daily site logs found</p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Start recording on-site operations, trade manpower, and material arrivals for this project.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs"
            >
              Post First Site Log
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <Card key={log.id} className="border-border/60 hover:border-border transition-colors">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {log.author_name.slice(0, 1)}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold">{log.author_name}</CardTitle>
                      <CardDescription className="text-xs">
                        {log.author_role} · <span className="font-mono">{log.date}</span>
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {log.manpower_count > 0 && (
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Users className="w-3 h-3 text-primary" />
                        {log.manpower_count} Men on Site
                      </Badge>
                    )}
                    {log.weather_site_condition && (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Sun className="w-3 h-3 text-amber-400" />
                        {log.weather_site_condition}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-xs">
                {/* Work Summary */}
                <p className="text-foreground text-sm font-medium leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/40">
                  {log.work_summary}
                </p>

                {/* Additional Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {log.manpower_breakdown && (
                    <div className="p-2.5 rounded-lg bg-background border border-border/50 space-y-1">
                      <span className="font-semibold text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3 text-primary" /> Manpower Breakdown:
                      </span>
                      <p className="text-foreground">{log.manpower_breakdown}</p>
                    </div>
                  )}

                  {log.materials_received && (
                    <div className="p-2.5 rounded-lg bg-background border border-border/50 space-y-1">
                      <span className="font-semibold text-muted-foreground flex items-center gap-1">
                        <PackageCheck className="w-3 h-3 text-emerald-500" /> Materials Delivered:
                      </span>
                      <p className="text-foreground">{log.materials_received}</p>
                    </div>
                  )}
                </div>

                {/* Blocker alert if present */}
                {log.blockers_or_delays && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 flex items-start gap-2 text-red-400">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Site Blocker / Issue Reported:</p>
                      <p className="mt-0.5">{log.blockers_or_delays}</p>
                    </div>
                  </div>
                )}

                {/* Photos indicator */}
                {log.photos_count && log.photos_count > 0 ? (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                    <Camera className="w-3.5 h-3.5 text-primary" />
                    <span>{log.photos_count} Site inspection photos attached to Shared Drive</span>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Daily Log Modal */}
      <AddDailyLogModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddLog}
      />
    </div>
  );
};
