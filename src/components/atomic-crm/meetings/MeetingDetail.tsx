import { useState } from "react";
import { useParams, Link } from "react-router";
import { useGetOne, useNotify } from "ra-core";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Copy,
  Link2,
  MessageCircle,
  Shield,
  CheckCircle2,
  User,
  Users,
  Video,
} from "lucide-react";
import type { Meeting } from "../types";
import { MeetingPanel } from "./MeetingPanel";

export const MeetingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const notify = useNotify();

  const { data: meeting, isPending, refetch } = useGetOne<Meeting>("meetings", {
    id: id!,
  });

  const [isCallOpen, setIsCallOpen] = useState(false);

  if (isPending || !meeting) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  const getCompanyLabel = (tenantId: number) => {
    switch (tenantId) {
      case 1:
        return { name: "Goldland Contracting LLC", code: "GL", color: "bg-amber-500/15 text-amber-500 border-amber-500/30" };
      case 2:
        return { name: "Abbadi Tech Technical Services LLC", code: "AT", color: "bg-blue-500/15 text-blue-500 border-blue-500/30" };
      case 3:
        return { name: "Casavera Interiors LLC", code: "CV", color: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" };
      default:
        return { name: "Group Meeting", code: "GP", color: "bg-slate-500/15 text-slate-500 border-slate-500/30" };
    }
  };

  const comp = getCompanyLabel(meeting.tenant_id);

  const guestUrl = `${window.location.origin}/#/m/${meeting.join_code}`;

  const copyGuestLink = () => {
    navigator.clipboard.writeText(guestUrl);
    notify("Guest meeting link copied to clipboard", { type: "success" });
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello, please join our meeting "${meeting.title}" using this secure link: ${guestUrl} (Passcode: ${meeting.join_code})`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const getStatusBadge = () => {
    switch (meeting.status) {
      case "live":
        return (
          <Badge className="bg-red-500 text-white animate-pulse font-bold text-xs">
            ● LIVE NOW
          </Badge>
        );
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs">
            Scheduled
          </Badge>
        );
      case "ended":
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground text-xs">
            Ended
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/meetings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Meetings
        </Link>
        <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold border ${comp.color}`}>
          {comp.name}
        </span>
      </div>

      {/* Main Meeting Banner Card */}
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {getStatusBadge()}
                <span className="text-xs font-mono text-muted-foreground">
                  Passcode: {meeting.join_code}
                </span>
              </div>
              <CardTitle className="text-xl font-bold mt-1">{meeting.title}</CardTitle>
              <CardDescription className="text-xs mt-1 max-w-2xl">
                {meeting.agenda || "No agenda specified."}
              </CardDescription>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                onClick={() => setIsCallOpen(true)}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                <Video className="h-4 w-4" />
                {meeting.status === "live" ? "Join Live Call" : "Start Meeting Call"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={copyGuestLink}
                className="gap-1.5 text-xs"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy Link
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareOnWhatsApp}
                className="gap-1.5 text-xs text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-border/60 text-xs">
          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Scheduled Start
            </span>
            <p className="font-semibold">
              {new Date(meeting.scheduled_start).toLocaleString("en-AE", {
                timeZone: "Asia/Dubai",
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Timezone
            </span>
            <p className="font-semibold">{meeting.timezone} (Dubai)</p>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" /> Host
            </span>
            <p className="font-semibold">{meeting.created_by || "Assigned Host"}</p>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <Shield className="h-3 w-3" /> Guest Admission
            </span>
            <p className="font-semibold capitalize">
              {meeting.guest_access === "waiting_room" ? "Waiting Room (Host approves)" : meeting.guest_access}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Participants & Outcomes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendees List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Attendees & Guests
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                {meeting.participants?.length || 0} participants
              </span>
            </CardTitle>
            <CardDescription className="text-xs">
              Internal employees and admitted external client guests.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-2.5">
            {meeting.participants && meeting.participants.length > 0 ? (
              meeting.participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-muted/20 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                      {p.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {p.role === "host" ? "Meeting Host" : p.role === "guest" ? `Guest · ${p.guestEmail || "Client"}` : "Internal Attendee"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] capitalize ${
                        p.inviteStatus === "joined"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : p.inviteStatus === "admitted"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.inviteStatus}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic text-center py-4">
                No participants invited yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Action Items / Outcomes */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Decisions & Action Items
              </CardTitle>
              <CardDescription className="text-xs">
                Logged decisions from this meeting session.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 text-xs">
              {meeting.outcomes && meeting.outcomes.length > 0 ? (
                meeting.outcomes.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-2.5 rounded-md bg-muted/30 border border-border/60 space-y-1"
                  >
                    <p className="font-medium text-foreground">{item.decision}</p>
                    {item.assignee && (
                      <span className="text-[10px] text-primary block">
                        Assigned to: {item.assignee}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic text-center py-4">
                  No action items logged. Start the call to record live decisions.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Secure Client Link Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Link2 className="h-4 w-4 text-primary" />
                Public Client Link
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <p className="text-[11px] text-muted-foreground">
                Clients can join directly from any mobile or desktop browser without installing any software:
              </p>
              <div className="p-2 rounded bg-muted font-mono text-[11px] break-all border">
                {guestUrl}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyGuestLink}
                className="w-full text-xs mt-1"
              >
                <Copy className="h-3 w-3 mr-1.5" />
                Copy Link to Clipboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* In-Call Modal */}
      <Dialog open={isCallOpen} onOpenChange={setIsCallOpen}>
        <DialogContent className="max-w-4xl p-0 border-0 bg-transparent overflow-hidden">
          <MeetingPanel meeting={meeting} onEndCall={() => { setIsCallOpen(false); refetch(); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MeetingDetail;
