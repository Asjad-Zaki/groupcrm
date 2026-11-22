import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface SchedulerRequest {
  title: string;
  kind: "scheduled";
  project_id?: string;
  lead_id?: string;
  date: string; // ISO date string
  start_time: string; // HH:MM format
  duration_minutes: number;
  timezone: string;
  internal_attendees: string[]; // user IDs
  guests: { name: string; email?: string }[];
  agenda: string;
  join_before_host?: boolean;
  reminders: { minutes: number; send_to: string[] }[];
}

serve(async (req) => {
  // Create Supabase admin client
  const supabase = createClient(
    Deno.env.get("VITE_SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
  );

  // Verify user has active tenant membership
  const { data: membership, error: memError } = await supabase
    .from("tenant_memberships")
    .select("*")
    .eq("user_id", req.headers.get("X-User-Id")!)
    .maybeSingle();

  if (memError || !membership) {
    return new Response(
      JSON.stringify({ error: "User has no tenant membership" }),
      { headers: { "Content-Type": "application/json" }, status: 403 }
    );
  }

  const tenantId = membership.tenant_id;

  // Parse request body
  const body = (await req.json()) as SchedulerRequest;

  // Validate project or lead exists and belongs to tenant
  let projectValidation = null;
  if (body.project_id) {
    const { data: project, error: pError } = await supabase
      .from("projects")
      .select("id, tenant_id, manager_id, title")
      .eq("id", body.project_id)
      .eq("tenant_id", tenantId)
      .single();

    if (pError || !project) {
      return new Response(
        JSON.stringify({ error: "Project not found or access denied" }),
        { headers: { "Content-Type": "application/json" }, status: 404 }
      );
    }
    projectValidation = project;
  }

  let leadValidation = null;
  if (body.lead_id) {
    const { data: lead, error: lError } = await supabase
      .from("leads")
      .select("id, tenant_id, title, status")
      .eq("id", body.lead_id)
      .eq("tenant_id", tenantId)
      .single();

    if (lError || !lead) {
      return new Response(
        JSON.stringify({ error: "Lead not found or access denied" }),
        { headers: { "Content-Type": "application/json" }, status: 404 }
      );
    }
    leadValidation = lead;
  }

  // Check user is manager or host for this project/lead
  const isManager = membership.role_id 
    ? membership.role_id === 1 // Assuming manager role ID
    : false;

  const hasProjectAccess = body.project_id 
    ? isManager || membership.user_id === projectValidation?.manager_id
    : true;

  const hasLeadAccess = body.lead_id
    ? isManager || membership.user_id === leadValidation?.owner_id
    : true;

  if (body.project_id && !hasProjectAccess) {
    return new Response(
      JSON.stringify({ error: "Insufficient permissions for this project" }),
      { headers: { "Content-Type": "application/json" }, status: 403 }
    );
  }

  if (body.lead_id && !hasLeadAccess) {
    return new Response(
      JSON.stringify({ error: "Insufficient permissions for this lead" }),
      { headers: { "Content-Type": "application/json" }, status: 403 }
    );
  }

  // Calculate scheduled start and end times
  const [startHour, startMinute] = body.start_time.split(":").map(Number);
  const scheduledStart = new Date();
  scheduledStart.setFullYear(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  );
  scheduledStart.setHours(startHour, startMinute, 0, 0);

  const scheduledEnd = new Date(scheduledStart.getTime() + body.duration_minutes * 60 * 1000);

  // Generate join code
  const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  // Generate room name
  const roomName = `meet-${tenantId}-${body.project_id || body.lead_id || Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  // Create the meeting
  const { data: meeting, error: insertError } = await supabase
    .from("meetings")
    .insert({
      tenant_id: tenantId,
      kind: "scheduled",
      title: body.title,
      host_id: req.headers.get("X-User-Id"),
      project_id: body.project_id,
      lead_id: body.lead_id,
      agenda: body.agenda,
      scheduled_start: scheduledStart.toISOString(),
      scheduled_end: scheduledEnd.toISOString(),
      timezone: body.timezone || "Asia/Dubai",
      status: "scheduled",
      room_name: roomName,
      join_code: joinCode,
      guest_access: "waiting_room", // Default per meeting.md
      max_guests: body.guests.length > 0 ? body.guests.length : 20,
      join_before_host: body.join_before_host ?? false,
    })
    .select()
    .single();

  if (insertError) {
    return new Response(
      JSON.stringify({ error: "Failed to create meeting", details: insertError }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }

  // Create guest participants
  if (body.guests.length > 0) {
    const guestParticipants = body.guests.map(guest => ({
      meeting_id: meeting.id,
      guest_name: guest.name,
      guest_email: guest.email,
      role: "guest",
      invite_status: "invited",
      requested_at: new Date().toISOString(),
    }));

    await supabase
      .from("meeting_participants")
      .insert(guestParticipants);
  }

  // In a full implementation, would:
  // 1. Send email invitations with .ics attachments
  // 2. Send WhatsApp messages via the meeting-send function
  // 3. Create calendar entries

  return new Response(
    JSON.stringify({ 
      id: meeting.id,
      room: meeting.room_name,
      join_code: meeting.join_code,
      status: meeting.status,
      guest_access: meeting.guest_access,
      message: "Meeting scheduled successfully",
      share_url: `/meet/${meeting.id}`,
    }),
    { headers: { "Content-Type": "application/json" }, status: 201 }
  );
});