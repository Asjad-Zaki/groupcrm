import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  CheckCircle2,
  GraduationCap,
  HeartHandshake,
  Info,
  Shield,
  Trophy,
} from "lucide-react";
import { useActiveTenant } from "@/hooks/useTenant";

interface EmployeeScore {
  id: string;
  name: string;
  role: string;
  family: "sales" | "engineering" | "operations";
  company: "Goldland" | "Abbadi Tech" | "Casavera" | "Group";
  companyCode: "GL" | "AT" | "CV" | "GP";
  avatar: string;
  quality: number; // 35 max
  ownership: number; // 25 max
  collaboration: number; // 15 max
  reliability: number; // 15 max
  learning: number; // 10 max
  total: number;
  isWinner?: boolean;
  citation?: string;
}

const EMPLOYEES_DATA: EmployeeScore[] = [
  {
    id: "e-1",
    name: "Arshad",
    role: "Site Inspection Engineer",
    family: "engineering",
    company: "Goldland",
    companyCode: "GL",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=faces",
    quality: 34.0,
    ownership: 24.5,
    collaboration: 14.0,
    reliability: 14.5,
    learning: 9.0,
    total: 96.0,
    isWinner: true,
    citation:
      "Outstanding authority approval turnaround and proactive site inspection coordination across Palm Jumeirah and Business Bay projects with zero rework.",
  },
  {
    id: "e-2",
    name: "Junaid",
    role: "Site MEP Engineer",
    family: "engineering",
    company: "Abbadi Tech",
    companyCode: "AT",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=faces",
    quality: 32.5,
    ownership: 24.0,
    collaboration: 14.5,
    reliability: 14.0,
    learning: 8.5,
    total: 93.5,
  },
  {
    id: "e-3",
    name: "Navas",
    role: "Operations / MD & Submission Consultant",
    family: "operations",
    company: "Goldland",
    companyCode: "GL",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&crop=faces",
    quality: 33.0,
    ownership: 23.5,
    collaboration: 14.0,
    reliability: 14.0,
    learning: 8.0,
    total: 92.5,
  },
  {
    id: "e-4",
    name: "Abrar",
    role: "Operations & Turnkey Project Manager",
    family: "operations",
    company: "Casavera",
    companyCode: "CV",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=128&h=128&fit=crop&crop=faces",
    quality: 31.5,
    ownership: 24.0,
    collaboration: 13.5,
    reliability: 14.0,
    learning: 8.5,
    total: 91.5,
  },
  {
    id: "e-5",
    name: "Mohamed",
    role: "Commercial Sales Consultant",
    family: "sales",
    company: "Goldland",
    companyCode: "GL",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=128&h=128&fit=crop&crop=faces",
    quality: 30.0,
    ownership: 23.0,
    collaboration: 13.0,
    reliability: 13.5,
    learning: 9.0,
    total: 88.5,
  },
  {
    id: "e-6",
    name: "Aysha",
    role: "Marketing & Lead Growth Specialist",
    family: "sales",
    company: "Group",
    companyCode: "GP",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=128&h=128&fit=crop&crop=faces",
    quality: 30.5,
    ownership: 22.0,
    collaboration: 14.0,
    reliability: 13.0,
    learning: 8.0,
    total: 87.5,
  },
];

export const PerformancePage = () => {
  const { activeTenantId, isGroup } = useActiveTenant();
  const [selectedFamily, setSelectedFamily] = useState<string>("all");

  const winner = EMPLOYEES_DATA.find((e) => e.isWinner) || EMPLOYEES_DATA[0];

  const filteredEmployees = EMPLOYEES_DATA.filter((e) => {
    // Filter by company
    if (!isGroup) {
      if (activeTenantId === "goldland" && e.companyCode !== "GL" && e.companyCode !== "GP") return false;
      if (activeTenantId === "abbadi" && e.companyCode !== "AT" && e.companyCode !== "GP") return false;
      if (activeTenantId === "casavera" && e.companyCode !== "CV" && e.companyCode !== "GP") return false;
    }
    // Filter by role family
    if (selectedFamily !== "all" && e.family !== selectedFamily) return false;
    return true;
  });

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Performance & Recognition</h1>
        <p className="text-sm text-muted-foreground">
          Recognizing verified outcomes, milestone execution, and reliable contribution across Goldland, Abbadi Tech & Casavera.
        </p>
      </div>

      {/* Spotlight: Employee of the Month */}
      <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-background to-background">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={winner.avatar}
                  alt={winner.name}
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-amber-500 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1 rounded-full shadow">
                  <Trophy className="h-4 w-4" />
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold text-[10px]">
                    ★ EMPLOYEE OF THE MONTH · NOVEMBER 2026
                  </Badge>
                  <span className="text-[11px] font-semibold text-amber-500">
                    [{winner.companyCode}] {winner.company}
                  </span>
                </div>
                <h2 className="text-xl font-bold">{winner.name}</h2>
                <p className="text-xs text-muted-foreground">{winner.role}</p>
                <p className="text-xs text-foreground/90 max-w-xl italic mt-1">
                  "{winner.citation}"
                </p>
              </div>
            </div>

            <div className="text-right shrink-0 border-l border-border/60 pl-6 space-y-1">
              <span className="text-xs text-muted-foreground block font-medium">Balanced Contribution Score</span>
              <span className="text-3xl font-extrabold text-amber-500">{winner.total}</span>
              <span className="text-xs text-muted-foreground block">/ 100 points</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scoring Weights Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <Award className="h-4 w-4" /> Quality & Outcomes
          </div>
          <div className="text-lg font-bold mt-1">35%</div>
          <p className="text-[10px] text-muted-foreground">Completed work, accuracy, zero rework</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
            <CheckCircle2 className="h-4 w-4" /> Task Ownership
          </div>
          <div className="text-lg font-bold mt-1">25%</div>
          <p className="text-[10px] text-muted-foreground">On-time delivery, follow-through</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <HeartHandshake className="h-4 w-4" /> Collaboration
          </div>
          <div className="text-lg font-bold mt-1">15%</div>
          <p className="text-[10px] text-muted-foreground">Handoffs & cross-company support</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400">
            <Shield className="h-4 w-4" /> Reliability
          </div>
          <div className="text-lg font-bold mt-1">15%</div>
          <p className="text-[10px] text-muted-foreground">Commitment follow-through & SLA adherence</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <GraduationCap className="h-4 w-4" /> Learning
          </div>
          <div className="text-lg font-bold mt-1">10%</div>
          <p className="text-[10px] text-muted-foreground">Process improvement & knowledge sharing</p>
        </Card>
      </div>

      {/* Fair Scoring Notice */}
      <div className="p-3 rounded-lg bg-muted/40 border border-border/60 flex items-start gap-3 text-xs text-muted-foreground">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div>
          <strong className="text-foreground">Fair Scoring Principle:</strong> Employees are compared exclusively within similar job families. Scoring is based on verified work output, milestone sign-offs, and client satisfaction—not keystroke tracking, covert monitoring, or screen time.
        </div>
      </div>

      {/* Role Family Filter & Rankings Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Contribution Rankings</CardTitle>
            <CardDescription className="text-xs">
              Current monthly normalized ratings for operating company staff
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Job Family:</span>
            <select
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">All Families</option>
              <option value="engineering">Engineering & Drafting</option>
              <option value="sales">Commercial & Sales</option>
              <option value="operations">Operations & Management</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-semibold border-y border-border/60">
                <tr>
                  <th className="px-4 py-2.5">Rank</th>
                  <th className="px-4 py-2.5">Employee</th>
                  <th className="px-4 py-2.5">Company</th>
                  <th className="px-3 py-2.5 text-center">Quality (35%)</th>
                  <th className="px-3 py-2.5 text-center">Ownership (25%)</th>
                  <th className="px-3 py-2.5 text-center">Collab (15%)</th>
                  <th className="px-3 py-2.5 text-center">Reliability (15%)</th>
                  <th className="px-3 py-2.5 text-center">Learning (10%)</th>
                  <th className="px-4 py-2.5 text-right">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredEmployees.map((emp, idx) => (
                  <tr key={emp.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-bold text-center w-12">
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="h-7 w-7 rounded-full object-cover shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-foreground">{emp.name}</p>
                          <p className="text-[10px] text-muted-foreground">{emp.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-[10px] font-bold">
                        {emp.companyCode} · {emp.company}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-center font-mono">{emp.quality.toFixed(1)}</td>
                    <td className="px-3 py-3 text-center font-mono">{emp.ownership.toFixed(1)}</td>
                    <td className="px-3 py-3 text-center font-mono">{emp.collaboration.toFixed(1)}</td>
                    <td className="px-3 py-3 text-center font-mono">{emp.reliability.toFixed(1)}</td>
                    <td className="px-3 py-3 text-center font-mono">{emp.learning.toFixed(1)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-extrabold text-sm text-primary">
                        {emp.total.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformancePage;

