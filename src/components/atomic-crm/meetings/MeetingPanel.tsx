import { useState, useEffect } from "react";
import { useDataProvider, useNotify } from "ra-core";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Meeting } from "../types";

interface MeetingPanelProps {
  meeting: Meeting;
  onEndCall?: () => void;
}

export const MeetingPanel = ({ meeting, onEndCall }: MeetingPanelProps) => {
  const dataProvider = useDataProvider();
  const notify = useNotify();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [seconds, setSeconds] = useState(142); // 2:22 active duration
  const [actionInput, setActionInput] = useState("");
  const [outcomes, setOutcomes] = useState(meeting.outcomes || []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleEndCall = async () => {
    try {
      await dataProvider.update("meetings", {
        id: meeting.id,
        data: {
          ...meeting,
          status: "ended",
        },
        previousData: meeting,
      });
      notify("Meeting call ended successfully", { type: "info" });
      if (onEndCall) onEndCall();
    } catch {
      notify("Failed to end meeting", { type: "error" });
    }
  };

  const handleAddActionItem = () => {
    if (!actionInput.trim()) return;
    const newOutcome = {
      id: `act-${Date.now()}`,
      decision: actionInput.trim(),
      action_item: actionInput.trim(),
      assignee: "Assigned Engineer",
    };
    const updated = [...outcomes, newOutcome];
    setOutcomes(updated);
    setActionInput("");
    dataProvider.update("meetings", {
      id: meeting.id,
      data: { ...meeting, outcomes: updated },
      previousData: meeting,
    });
    notify("Action item recorded to meeting log", { type: "success" });
  };

  return (
    <div className="flex flex-col h-[520px] bg-slate-950 text-slate-100 rounded-xl overflow-hidden border border-border shadow-2xl">
      {/* Call Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
          <span className="text-xs font-semibold truncate max-w-[280px]">
            {meeting.title}
          </span>
          <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-400 border-red-500/30">
            LIVE · {formatDuration(seconds)}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <span>Room: {meeting.room_name || meeting.join_code}</span>
        </div>
      </div>

      {/* Main Stage */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 p-3 bg-slate-900/60 overflow-hidden">
        {/* Main Video Tile */}
        <div className="md:col-span-2 relative rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center justify-center overflow-hidden">
          {isVideoOff ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-20 w-20 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-400">
                HOST
              </div>
              <span className="text-xs text-slate-400 font-medium">Camera is turned off</span>
            </div>
          ) : (
            <div className="w-full h-full relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center">
              {/* Simulated active speaker tile */}
              <div className="text-center space-y-2">
                <div className="h-20 w-20 mx-auto rounded-full ring-4 ring-emerald-500/50 bg-slate-700 flex items-center justify-center text-2xl font-bold shadow-lg">
                  {meeting.created_by?.substring(0, 2).toUpperCase() || "GL"}
                </div>
                <p className="text-sm font-semibold">{meeting.created_by || "Host"}</p>
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  Speaking...
                </Badge>
              </div>

              {/* In-tile status indicator */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950/80 text-[11px]">
                {isMuted ? (
                  <MicOff className="h-3 w-3 text-red-400" />
                ) : (
                  <Mic className="h-3 w-3 text-emerald-400" />
                )}
                <span>You (Host)</span>
              </div>
            </div>
          )}

          {/* Guest tile in corner */}
          <div className="absolute top-3 right-3 h-28 w-40 rounded-md bg-slate-950/90 border border-slate-700/80 p-2 flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-300 truncate">
                Tariq M. (Guest)
              </span>
              <Mic className="h-2.5 w-2.5 text-emerald-400" />
            </div>
            <div className="flex items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
                TM
              </div>
            </div>
            <span className="text-[9px] text-muted-foreground text-center">Connected via Guest Link</span>
          </div>
        </div>

        {/* Sidebar: Action Items / Notes */}
        <div className="flex flex-col bg-slate-900 rounded-lg border border-slate-800 p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Live Meeting Outcomes
            </span>
            <Badge variant="outline" className="text-[10px]">
              {outcomes.length} items
            </Badge>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
            {outcomes.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic text-center py-6">
                No action items logged yet. Type below to record decisions in real-time.
              </p>
            ) : (
              outcomes.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-2 rounded bg-slate-800/80 border border-slate-700/60 space-y-1"
                >
                  <p className="text-slate-200 font-medium">{item.decision}</p>
                  {item.assignee && (
                    <span className="text-[10px] text-primary block">
                      Assignee: {item.assignee}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Quick Add Action Item */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <input
              type="text"
              value={actionInput}
              onChange={(e) => setActionInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddActionItem()}
              placeholder="Record decision or task..."
              className="w-full h-8 px-2.5 text-xs rounded bg-slate-950 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-primary text-slate-200 placeholder:text-slate-500"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddActionItem}
              className="w-full h-7 text-[11px] text-slate-200 border-slate-700 hover:bg-slate-800"
            >
              Log Decision
            </Button>
          </div>
        </div>
      </div>

      {/* Call Controls Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-900 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isMuted ? "destructive" : "secondary"}
            onClick={() => setIsMuted(!isMuted)}
            className="h-9 gap-1.5 text-xs font-semibold"
          >
            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {isMuted ? "Unmute" : "Mute"}
          </Button>

          <Button
            size="sm"
            variant={isVideoOff ? "destructive" : "secondary"}
            onClick={() => setIsVideoOff(!isVideoOff)}
            className="h-9 gap-1.5 text-xs font-semibold"
          >
            {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
            {isVideoOff ? "Start Video" : "Stop Video"}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={handleEndCall}
            className="h-9 px-4 gap-1.5 text-xs font-bold shadow-md bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="h-4 w-4" />
            End Call
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MeetingPanel;
