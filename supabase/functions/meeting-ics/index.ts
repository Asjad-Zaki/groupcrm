import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  // Parse query parameters
  const url = new URL(req.url, `https://${req.headers.get("host")}`);
  const meetingId = url.searchParams.get("meeting_id");

  if (!meetingId) {
    return new Response(
      JSON.stringify({ error: "meeting_id query parameter required" }),
      { headers: { "Content-Type": "application/json" }, status: 400 }
    );
  }

  // Generate ICS calendar file for the meeting
  const now = new Date();
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Group CRM//Meeting Invitation//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${meetingId}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}
DTSTAMP:${now.toISOString()}
DTSTART:${startTime.toISOString().replace(/[-TZ]/g, "").replace(/:/g, "")}
DTEND:${endTime.toISOString().replace(/[-TZ]/g, "").replace(/:/g, "")}
SUMMARY:Group CRM Meeting
DESCRIPTION:Group CRM Meeting - Join via the app
LOCATION:Group CRM Meeting Room
URL;VALUE=URI:https://crm.local/meeting/${meetingId}
END:VEVENT
END:VCALENDAR`;

  return new Response(
    icsContent,
    { headers: { 
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="meeting-${meetingId}.ics"`
    } },
  );
});