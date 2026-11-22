import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface DetailRequest {
  meeting_id: string;
  user_id: string;
}

serve(async (req) => {
  // Create Supabase service role client
  const supabase = createClient(
    Deno.env.get("VITE_SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { headers: { } }
  );

  // Parse request body
  const body = (await req.json()) as DetailRequest;

  // Validate meeting exists
  const { data: meeting, error: meError } = await supabase
    .from("meetings")
    .select(`
      *,
      host:auth.users!inner(id, email, role_id),
      project:projects!left(title, name, status),
      lead:leads!left(title, status)
    `)
    .eq("id", body.meeting_id)
    .single();

  if (meError || !meeting) {
    return new Response(
      JSON.stringify({ error: "Meeting not found" }),
      { headers: { "Content-Type": "application/json" }, status: 404 }
    );
  }

  // Check permissions: host, project/lead members can read
  const userId = body.user_id;
  const isHost = meeting.host.id === userId;

  let hasProjectAccess = false;
  let hasLeadAccess = false;

  if (meeting.project_id) {
    const { data: member } = await supabase
      .from("project_members")
      .select("id")
      .eq("project_id", meeting.project_id)
      .eq("user_id", userId)
      .maybeSingle();
    hasProjectAccess = !!member;
  }

  if (meeting.lead_id) {
    const { data: leadMember } = await supabase
      .from("lead_members") // Would need this table, or use a different check
      .select("id")
      .eq("lead_id", meeting.lead_id)
      .eq("user_id", userId)
      .maybeSingle();
    hasLeadAccess = !!leadMember;
  }

  const canRead = isHost || hasProjectAccess || hasLeadAccess;

  if (!canRead) {
    return new Response(
      JSON.stringify({ error: "Insufficient permissions to view this meeting" }),
      { headers: { "Content-Type": "application/json" }, status: 403 }
    );
  }

  // Get participants
  const { data: participants, error: partError } = await supabase
    .from("meeting_participants")
    .select("*")
    .eq("meeting_id", body.meeting_id);

  if (partError) {
    return new Response(
      JSON.stringify({ error: "Failed to load participants", details: partError }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }

  // Get outcomes
  const { data: outcomes, error: outError } = await supabase
    .from("meeting_outcomes")
    .select("*")
    .eq("meeting_id", body.meeting_id);

  if (outError) {
    return new Response(
      JSON.stringify({ error: "Failed to load outcomes", details: outError }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }

  return new Response(
    JSON.stringify({ 
      meeting: {
        id: meeting.id,
        title: meeting.title,
        kind: meeting.kind,
        status: meeting.status,
        host: meeting.host,
        project: meeting.project,
        lead: meeting.lead,
        agenda: meeting.agenda,
        scheduled_start: meeting.scheduled_start,
        scheduled_end: meeting.scheduled_end,
        timezone: meeting.timezone,
        room_name: meeting.room_name,
        join_code: meeting.join_code,
        guest_access: meeting.guest_access,
        max_guests: meeting.max_guests,
        created_by: meeting.created_by,
      },
      participants: participants || [],
      outcomes: outcomes || [],
      can_edit: isHost,
    }),
    { headers: { "Content-Type": "application/json" }, status: 200 }
  );
});