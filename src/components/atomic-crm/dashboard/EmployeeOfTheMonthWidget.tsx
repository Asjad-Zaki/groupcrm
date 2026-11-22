import { Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, ArrowRight, Star } from "lucide-react";

export const EmployeeOfTheMonthWidget = () => {
  return (
    <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-background to-background mb-4">
      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=faces"
              alt="Arshad"
              className="h-12 w-12 rounded-full object-cover ring-2 ring-amber-500 shadow"
            />
            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full shadow">
              <Trophy className="h-3 w-3" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wide flex items-center gap-1">
                <Star className="h-2.5 w-2.5 fill-amber-500" />
                Employee of the Month
              </span>
              <Badge variant="outline" className="text-[9px] font-bold border-amber-500/40 text-amber-500">
                GL · Goldland
              </Badge>
            </div>
            <h4 className="text-sm font-bold">Arshad · Site Inspection Engineer</h4>
            <p className="text-[11px] text-muted-foreground line-clamp-1">
              Top contribution score (96.0/100) — zero rework across Palm Jumeirah & Business Bay submissions.
            </p>
          </div>
        </div>

        <Link
          to="/performance"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 shrink-0 self-end sm:self-center"
        >
          View Rankings <ArrowRight className="h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  );
};

export default EmployeeOfTheMonthWidget;

