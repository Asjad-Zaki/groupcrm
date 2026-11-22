import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface AdmitRequestBody {
  meeting_id: string;
  ticket: string;
  action: "admit" | "decline";
}

serve(async (req) => {
  // Create Supabase service role client
  const supabase = createClient(
    Deno.env.get("VITE_SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { headers: { } }
  );

  // Parse request body
  const body = (await req.json()) as AdmitRequestBody;

  // Validate meeting exists
  const { data: meeting, error: meError } = await supabase
    .from("meetings")
    .select("id, host_id, status, guest_access, max_guests")
    .eq("id", body.meeting_id)
    .single();

  if (meError || !meeting) {
    return new Response(
      JSON.stringify({ error: "Meeting not found" }),
      { headers: { "Content-Type": "application/json" }, status: 404 }
    );
  }

  // Check guest access
  if (meeting.guest_access === "off") {
    return new Response(
      JSON.stringify({ error: "Guest access is disabled" }),
      { headers: { "Content-Type": "application/json" }, status: 403 }
    );
  }

  // Find the participant with this ticket
  const { data: participant, error: peError } = await supabase
    .from("meeting_participants")
    .select("*")
    .eq("meeting_id", body.meeting_id)
    .eq("guest_name", body.ticket?.substring(0, 10) || "unknown")  // Simplified: would match on ticket field
    .single();

  if (peError || !participant) {
    return new Response(
      JSON.stringify({ error: "Invalid ticket or participant not found" }),
      { headers: { "Content-Type": "application/json" }, status: 404 }
    );
  }

  let newStatus: string;
  if (body.action === "admit") {
    newStatus = "admitted";
  } else {
    newStatus = "declined";
  }

  // Update participant status
  const { error: updateError } = await supabase
    .from("meeting_participants")
    .update({ invite_status: newStatus, admitted_at: new Date().toISOString() })
    .eq("meeting_id", body.meeting_id)
    .eq("guest_name", body.ticket?.substring(0, 10) || "unknown");

  if (updateError) {
    return new Response(
      JSON.stringify({ error: "Failed to update participant status", details: updateError }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }

  // If admitting, also update meeting status if needed
  if (body.action === "admit") {
    // Count admitted participants
    const { count: admittedCount, error: countError } = await supabase
      .from("meeting_participants")
      .select("*", { count: "exact", head: true })
      .eq("meeting_id", body.meeting_id)
      .eq("invite_status", "admitted");

    if (!countError && admittedCount && admittedCount >= 1) {
      // Update meeting status to indicate guests are present
      await supabase
        .from("meetings")
        .update({ status: "live" })
        .eq("id", body.meeting_id);
    }
  }

  return new Response(
    JSON.stringify({ 
      status: newStatus,
      meeting_id: body.meeting_id,
      message: body.action === "admit" ? "Guest admitted" : "Guest declined"
    }),
    { headers: { "Content-Type": "application/json" }, status: 200 }
  );
});