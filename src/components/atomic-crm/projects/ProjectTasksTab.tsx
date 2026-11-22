import { useState } from "react";
import { useGetList, useUpdate, useCreate, useNotify } from "ra-core";
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Plus,
  Search,
  User,
  Calendar,
  PauseCircle,
  PlayCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddProjectTaskModal } from "./AddProjectTaskModal";
import { HoldReasonModal } from "../my-day/HoldReasonModal";
import type { Task, Project } from "../types";

interface ProjectTasksTabProps {
  project: Project;
}

export const ProjectTasksTab = ({ project }: ProjectTasksTabProps) => {
  const notify = useNotify();
  const [update] = useUpdate();
  const [create] = useCreate();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [holdingTaskId, setHoldingTaskId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "in_progress" | "completed" | "on_hold">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allTasks = [], refetch } = useGetList<Task>("tasks", {
    pagination: { page: 1, perPage: 200 },
    sort: { field: "created_at", order: "DESC" },
  });

  // Filter tasks belonging to this project
  const projectTasks = allTasks.filter((t) => {
    if (t.project_id === project.id) return true;
    if (t.project_name && (
      t.project_name.toLowerCase().includes(project.reference_no.toLowerCase()) ||
      t.project_name.toLowerCase().includes(project.name.toLowerCase().slice(0, 15))
    )) {
      return true;
    }
    return false;
  });

  const filteredTasks = projectTasks.filter((t) => {
    if (statusFilter !== "all" && (t.status || "pending") !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = t.text.toLowerCase().includes(q);
      const matchAssignee = t.assignee_name?.toLowerCase().includes(q);
      return matchText || matchAssignee;
    }
    return true;
  });

  const handleStatusChange = async (
    task: Task,
    newStatus: "pending" | "in_progress" | "completed" | "on_hold",
    holdReason?: string
  ) => {
    try {
      await update(
        "tasks",
        {
          id: task.id,
          data: {
            ...task,
            status: newStatus,
            completed: newStatus === "completed",
            hold_reason: newStatus === "on_hold" ? holdReason : undefined,
            done_date: newStatus === "completed" ? new Date().toISOString() : undefined,
          },
          previousData: task,
        },
        { mutationMode: "optimistic" }
      );
      notify(`Task updated to ${newStatus.replace("_", " ")}`, { type: "success" });
      refetch();
    } catch {
      notify("Failed to update task status", { type: "error" });
    }
  };

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      await create(
        "tasks",
        {
          data: taskData,
        },
        {
          onSuccess: () => {
            notify("Project task created successfully", { type: "success" });
            refetch();
          },
        }
      );
    } catch {
      notify("Failed to create task", { type: "error" });
    }
  };

  const activeCount = projectTasks.filter((t) => t.status !== "completed").length;
  const completedCount = projectTasks.filter((t) => t.status === "completed").length;
  const onHoldCount = projectTasks.filter((t) => t.status === "on_hold").length;

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-border/60 bg-muted/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Total Deliverables</span>
              <p className="text-2xl font-black">{projectTasks.length}</p>
            </div>
            <Badge variant="outline" className="text-xs">All Scoped</Badge>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-muted/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Active Tasks</span>
              <p className="text-2xl font-black text-primary">{activeCount}</p>
            </div>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">In-Flight</Badge>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-muted/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Completed</span>
              <p className="text-2xl font-black text-emerald-500">{completedCount}</p>
            </div>
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Done</Badge>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-muted/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium">On Hold</span>
              <p className="text-2xl font-black text-amber-500">{onHoldCount}</p>
            </div>
            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20">Pending Action</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filters */}
          <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-xl border border-border text-xs">
            {(["all", "pending", "in_progress", "on_hold", "completed"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 font-semibold rounded-lg capitalize transition-colors ${
                  statusFilter === st
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tasks or assignees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          className="text-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add Project Task
        </Button>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <Card className="border-dashed border-border/80">
          <CardContent className="p-8 text-center space-y-3">
            <Clock className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-semibold">No project tasks found</p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              There are currently no deliverables matching the selected filter for this project.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs"
            >
              Add First Deliverable
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isDone = task.status === "completed";
            const isInProgress = task.status === "in_progress";
            const isOnHold = task.status === "on_hold";

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isDone
                    ? "bg-muted/15 border-border/40 opacity-75"
                    : isOnHold
                      ? "bg-amber-500/5 border-amber-500/30"
                      : isInProgress
                        ? "bg-primary/5 border-primary/30 shadow-sm"
                        : "bg-card border-border/70 hover:border-border"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(task, isDone ? "pending" : "completed")}
                    className="mt-0.5 shrink-0 focus:outline-none"
                    title={isDone ? "Mark Pending" : "Mark Completed"}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                    )}
                  </button>

                  <div className="space-y-1.5 min-w-0">
                    <p
                      className={`text-sm font-medium leading-snug ${
                        isDone ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {task.text}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {task.assignee_name && (
                        <span className="flex items-center gap-1 font-semibold text-foreground/80">
                          <User className="w-3 h-3 text-primary" />
                          {task.assignee_name}
                        </span>
                      )}

                      {task.priority && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold px-1.5 py-0 ${
                            task.priority === "urgent" || task.priority === "critical"
                              ? "bg-red-500/10 text-red-500 border-red-500/30"
                              : task.priority === "high"
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                                : "bg-slate-500/10 text-slate-400 border-slate-500/30"
                          }`}
                        >
                          {task.priority.toUpperCase()}
                        </Badge>
                      )}

                      {task.due_date && (
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Calendar className="w-3 h-3" />
                          Due {task.due_date.split("T")[0]}
                        </span>
                      )}

                      {task.carried_over_count && task.carried_over_count > 0 ? (
                        <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-400 border-red-500/20">
                          Carried {task.carried_over_count}d
                        </Badge>
                      ) : null}
                    </div>

                    {isOnHold && task.hold_reason && (
                      <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span><strong>Hold Reason:</strong> {task.hold_reason}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Action buttons */}
                <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                  {!isDone && !isInProgress && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs flex items-center gap-1"
                      onClick={() => handleStatusChange(task, "in_progress")}
                    >
                      <PlayCircle className="w-3.5 h-3.5 text-blue-400" />
                      Start
                    </Button>
                  )}

                  {!isDone && !isOnHold && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs flex items-center gap-1"
                      onClick={() => setHoldingTaskId(Number(task.id))}
                    >
                      <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
                      Hold
                    </Button>
                  )}

                  {!isDone ? (
                    <Button
                      size="sm"
                      className="h-8 text-xs flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleStatusChange(task, "completed")}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Complete
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => handleStatusChange(task, "pending")}
                    >
                      Reopen
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      <AddProjectTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        project={project}
        onAddTask={handleCreateTask}
      />

      {/* Hold Reason Modal */}
      {holdingTaskId !== null && (
        <HoldReasonModal
          isOpen={true}
          onClose={() => setHoldingTaskId(null)}
          taskTitle={
            projectTasks.find((t) => Number(t.id) === holdingTaskId)?.text ||
            "Project Task"
          }
          onSubmit={(reason: string) => {
            const task = projectTasks.find((t) => Number(t.id) === holdingTaskId);
            if (task) {
              handleStatusChange(task, "on_hold", reason);
            }
            setHoldingTaskId(null);
          }}
        />
      )}
    </div>
  );
};
