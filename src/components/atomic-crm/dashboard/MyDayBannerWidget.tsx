import { useGetIdentity, useGetList } from "ra-core";
import { Link } from "react-router";
import {
  Calendar,
  Clock,
  ArrowRight,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TEAM_MEMBERS } from "../providers/fakerest/dataGenerator/sales";
import type { Task } from "../types";

export const MyDayBannerWidget = () => {
  const { identity } = useGetIdentity();

  const currentPersona = (() => {
    if (!identity) return TEAM_MEMBERS[0];
    const email = (identity as any)?.email;
    const found = TEAM_MEMBERS.find(
      (m) => m.email === email || m.id === (identity as any)?.id,
    );
    return found || TEAM_MEMBERS[0];
  })();

  const { data: tasks } = useGetList<Task>("tasks", {
    pagination: { page: 1, perPage: 100 },
  });

  const myTasks = (tasks || []).filter(
    (t) => t.sales_id === currentPersona.id || t.owner_id === currentPersona.id,
  );

  const pendingCount = myTasks.filter(
    (t) => t.status === "pending" || t.status === "in_progress",
  ).length;
  const carriedCount = myTasks.filter(
    (t) => (t.carried_over_count || 0) > 0 && t.status !== "completed",
  ).length;
  const completedCount = myTasks.filter((t) => t.status === "completed").length;

  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Dubai",
  }).format(new Date());

  return (
    <Card className="border-border/60 bg-muted/20 shadow-xs">
      <CardContent className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={
              currentPersona.avatar?.src ||
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop"
            }
            alt={currentPersona.first_name}
            className="w-12 h-12 rounded-xl object-cover border border-border/80 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-primary flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {todayFormatted} (Dubai, UAE)
              </span>
            </div>

            <h2 className="text-lg font-bold text-foreground">
              Good day, {currentPersona.first_name}!
            </h2>

            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-muted-foreground">
              <span>
                You have{" "}
                <strong className="text-foreground">
                  {pendingCount} active task{pendingCount === 1 ? "" : "s"}
                </strong>{" "}
                today
              </span>
              {carriedCount > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {carriedCount} carried over
                </span>
              )}
              {completedCount > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {completedCount} done
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/my-day">
            <Button
              size="sm"
              className="font-semibold text-xs shadow-xs flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5" />
              Open My Day
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
