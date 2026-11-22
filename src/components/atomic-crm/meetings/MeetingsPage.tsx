import { useState } from "react";
import {
  useGetList,
  useCreate,
  useRedirect,
  useNotify,
} from "ra-core";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Clock,
  Copy,
  MessageCircle,
  Plus,
  Search,
  Sparkles,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { useActiveTenant } from "@/hooks/useTenant";
import type { Meeting } from "../types";

export const MeetingsPage = () => {
  const { activeTenantId, isGroup } = useActiveTenant();
  const redirect = useRedirect();
  const notify = useNotify();
  const [create] = useCreate();

  const [activeTab, setActiveTab] = useState<"live" | "upcoming" | "past" | "mine">("upcoming");
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);

  // New Meeting Form State
  const [newTitle, setNewTitle] = useState("");
  const [newTenantId, setNewTenantId] = useState<number>(1);
  const [newKind, setNewKind] = useState<"scheduled" | "instant">("scheduled");
  const [newDate, setNewDate] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [newDuration, setNewDuration] = useState("30");
  const [newAgenda, setNewAgenda] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: meetings = [], isPending, refetch } = useGetList<Meeting>("meetings", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "scheduled_start", order: "DESC" },
  });

  const now = new Date();

  const filteredMeetings = meetings.filter((m) => {
    // 1. Company Filter
    if (!isGroup) {
      const tenantNum =
        activeTenantId === "goldland"
          ? 1
          : activeTenantId === "abbadi"
            ? 2
            : activeTenantId === "casavera"
              ? 3
              : null;
      if (tenantNum !== null && m.tenant_id !== tenantNum) {
        return false;
      }
    }

    // 2. Tab Filter
    const startTime = new Date(m.scheduled_start);
    if (activeTab === "live") {
      if (m.status !== "live") return false;
    } else if (activeTab === "upcoming") {
      if (m.status === "ended" || m.status === "cancelled") return false;
      if (m.status !== "live" && startTime < now) return false;
    } else if (activeTab === "past") {
      if (m.status !== "ended" && m.status !== "cancelled" && startTime >= now) return false;
    } else if (activeTab === "mine") {
      // Hosted by user or contains user
      if (m.host_id !== 0 && m.created_by !== "Navas (MD)") return false;
    }

    // 3. Search Filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchCode = m.join_code.toLowerCase().includes(q);
      const matchAgenda = m.agenda?.toLowerCase().includes(q);
      if (!matchTitle && !matchCode && !matchAgenda) return false;
    }

    return true;
  });

  const liveCount = meetings.filter((m) => m.status === "live").length;

  const getCompanyBadge = (tenantId: number) => {
    switch (tenantId) {
      case 1:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
            GL · Goldland
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-500 border border-blue-500/30">
            AT · Abbadi Tech
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
            CV · Casavera
          </span>
        );
      default:
        return null;
    }
  };

  const copyGuestLink = (e: React.MouseEvent, joinCode: string) => {
    e.stopPropagation();
    const guestUrl = `${window.location.origin}/#/m/${joinCode}`;
    navigator.clipboard.writeText(guestUrl);
    notify("Guest link copied to clipboard", { type: "success" });
  };

  const shareOnWhatsApp = (e: React.MouseEvent, m: Meeting) => {
    e.stopPropagation();
    const guestUrl = `${window.location.origin}/#/m/${m.join_code}`;
    const text = encodeURIComponent(
      `Hello, please join our meeting "${m.title}" using this secure link: ${guestUrl} (Passcode: ${m.join_code})`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleCreateMeeting = async () => {
    if (!newTitle.trim()) {
      notify("Please provide a meeting title", { type: "warning" });
      return;
    }

    setIsSubmitting(true);
    try {
      const prefix = newTenantId === 1 ? "GL" : newTenantId === 2 ? "AT" : "CV";
      const code = `${prefix}-${Math.floor(Math.random() * 90000 + 10000)}`;

      const start = new Date(newDate);
      const end = new Date(start.getTime() + Number(newDuration) * 60 * 1000);

      const newMeeting: Partial<Meeting> = {
        title: newTitle.trim(),
        tenant_id: newTenantId,
        kind: newKind,
        agenda: newAgenda.trim() || undefined,
        host_id: 0,
        scheduled_start: start.toISOString(),
        scheduled_end: end.toISOString(),
        timezone: "Asia/Dubai",
        status: newKind === "instant" ? "live" : "scheduled",
        room_name: `${prefix}-ROOM-${code}`,
        join_code: code,
        guest_access: "waiting_room",
        max_guests: 20,
        created_by: "Navas (MD)",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await create("meetings", { data: newMeeting });
      notify(
        newKind === "instant" ? "Instant call room started!" : "Meeting scheduled successfully!",
        { type: "success" }
      );
      setIsNewDialogOpen(false);
      setNewTitle("");
      setNewAgenda("");
      refetch();
    } catch {
      notify("Failed to create meeting", { type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartInstantCall = () => {
    setNewKind("instant");
    setNewTitle("Instant Collaboration Call");
    setIsNewDialogOpen(true);
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meetings & Client Links</h1>
          <p className="text-sm text-muted-foreground">
            Instant project calls, authority consultation links, and secure client waiting rooms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleStartInstantCall}
            className="gap-1.5 text-xs font-semibold border-amber-500/40 text-amber-500 hover:bg-amber-500/10"
          >
            <Zap className="h-3.5 w-3.5" />
            Instant Call
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setNewKind("scheduled");
              setNewTitle("");
              setIsNewDialogOpen(true);
            }}
            className="gap-1.5 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow"
          >
            <Plus className="h-4 w-4" />
            New Meeting
          </Button>
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("live")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "live"
                ? "bg-red-500/15 text-red-400 border border-red-500/30"
                : "text-muted-foreground hover:bg-muted/60"
            }`}
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            Live now
            {liveCount > 0 && (
              <Badge variant="secondary" className="h-4 px-1 text-[9px] font-bold">
                {liveCount}
              </Badge>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("upcoming")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "upcoming"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted/60"
            }`}
          >
            Upcoming
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("past")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "past"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted/60"
            }`}
          >
            Past
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("mine")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "mine"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted/60"
            }`}
          >
            Mine
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search meetings or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 w-60 rounded-md border border-input bg-background pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Meetings Grid */}
      {isPending ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : filteredMeetings.length === 0 ? (
        <Card className="p-12 text-center">
          <Video className="h-12 w-12 mx-auto text-muted-foreground opacity-40 mb-3" />
          <h3 className="text-base font-semibold">No meetings found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {activeTab === "live"
              ? "There are no live meetings currently in session."
              : "No meetings found matching your filter criteria. Schedule one to get started."}
          </p>
          <Button
            size="sm"
            onClick={() => setIsNewDialogOpen(true)}
            className="mt-4 gap-1.5 text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5" /> Schedule Meeting
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMeetings.map((m) => {
            const isLive = m.status === "live";
            return (
              <Card
                key={m.id}
                onClick={() => redirect(`/meetings/${m.id}/show`)}
                className={`cursor-pointer hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between ${
                  isLive ? "border-red-500/40 bg-red-950/5" : ""
                }`}
              >
                <CardHeader className="pb-2 space-y-2">
                  <div className="flex items-center justify-between">
                    {getCompanyBadge(m.tenant_id)}
                    {isLive ? (
                      <Badge className="bg-red-500 text-white font-bold text-[10px] animate-pulse">
                        ● LIVE NOW
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {m.status}
                      </Badge>
                    )}
                  </div>

                  <div>
                    <CardTitle className="text-sm font-semibold line-clamp-2 leading-snug">
                      {m.title}
                    </CardTitle>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Code: {m.join_code}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {m.agenda || "No specific agenda."}
                  </p>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 shrink-0" />
                      {new Date(m.scheduled_start).toLocaleTimeString("en-AE", {
                        timeZone: "Asia/Dubai",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3 shrink-0" />
                      {m.participants?.length || 1} attendee{m.participants?.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <Button
                      size="sm"
                      variant={isLive ? "default" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation();
                        redirect(`/meetings/${m.id}/show`);
                      }}
                      className={`h-7 px-3 text-xs font-semibold gap-1.5 flex-1 ${
                        isLive ? "bg-red-600 hover:bg-red-700 text-white font-bold" : ""
                      }`}
                    >
                      <Video className="h-3 w-3" />
                      {isLive ? "Join Now" : "Details"}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => copyGuestLink(e, m.join_code)}
                      title="Copy guest link"
                      className="h-7 w-7 p-0"
                    >
                      <Copy className="h-3 w-3 text-muted-foreground" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => shareOnWhatsApp(e, m)}
                      title="Share link on WhatsApp"
                      className="h-7 w-7 p-0 text-emerald-500 hover:text-emerald-400"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* New Meeting Dialog */}
      <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {newKind === "instant" ? "Start Instant Call" : "Schedule New Meeting"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Generate a secure room with host waiting-room controls and instant client links.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Meeting Title</Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Authority Drawing Review / Client Alignment"
                className="h-8 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Operating Company</Label>
                <select
                  value={newTenantId}
                  onChange={(e) => setNewTenantId(Number(e.target.value))}
                  className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value={1}>Goldland Contracting LLC</option>
                  <option value={2}>Abbadi Tech Technical Services</option>
                  <option value={3}>Casavera Interiors LLC</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Duration (Minutes)</Label>
                <select
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </div>
            </div>

            {newKind === "scheduled" && (
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Date & Time (Asia/Dubai)</Label>
                <Input
                  type="datetime-local"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Agenda & Objectives</Label>
              <Textarea
                value={newAgenda}
                onChange={(e) => setNewAgenda(e.target.value)}
                placeholder="Key items to review, drawings to discuss..."
                rows={2}
                className="text-xs resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNewDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreateMeeting}
              disabled={isSubmitting}
              className="gap-1.5 font-bold"
            >
              <Video className="h-3.5 w-3.5" />
              {newKind === "instant" ? "Launch Call Now" : "Confirm Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MeetingsPage;
