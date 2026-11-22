import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface StartMeetingRequest {
  conversation_id: string;
  kind: "instant" | "scheduled" | "call";
  title?: string;
  scheduled_start?: string;
  scheduled_end?: string;
  max_guests?: number;
  guest_access?: "off" | "waiting_room" | "open";
  join_before_host?: boolean;
}

serve(async (req) => {
  // Create Supabase admin client
  const supabase = createClient(
    Deno.env.get("VITE_SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
  );

  // Verify user has an active tenant membership
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
  const body = (await req.json()) as StartMeetingRequest;

  // Validate conversation exists and belongs to tenant
  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", body.conversation_id)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (convError || !conversation) {
    return new Response(
      JSON.stringify({ error: "Conversation not found or access denied" }),
      { headers: { "Content-Type": "application/json" }, status: 404 }
    );
  }

  // Check project membership for project chats
  if (conversation.type === "project" && conversation.project_id) {
    const { data: projectMembers, error: pmError } = await supabase
      .from("project_members")
      .select("user_id")
      .eq("project_id", conversation.project_id)
      .eq("user_id", req.headers.get("X-User-Id")!);

    if (pmError || !projectMembers) {
      return new Response(
        JSON.stringify({ error: "You are not a member of this project" }),
        { headers: { "Content-Type": "application/json" }, status: 403 }
      );
    }
  }

  // For instant calls, check if there's already a live meeting
  if (body.kind === "instant") {
    const { data: existingMeeting, error: emError } = await supabase
      .from("meetings")
      .select("*")
      .eq("conversation_id", body.conversation_id)
      .eq("kind", "instant")
      .eq("status", "live")
      .maybeSingle();

    if (existingMeeting && !req.headers.get("X-Force-New")) {
      // Return the existing live meeting
      const { data: tokenData, error: tkError } = await supabase
        .from("meetings")
        .select("domain, room_name, join_code")
        .eq("id", existingMeeting.id)
        .maybeSingle();

      return new Response(
        JSON.stringify({ 
          kind: "instant", 
          room: existingMeeting.room_name,
          join_code: existingMeeting.join_code,
          is_live: true
        }),
        { headers: { "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Create a new instant meeting
    const roomName = `proj-${conversation.id}-${Date.now().toString(36)}`;
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data: newMeeting, error: insertError } = await supabase
      .from("meetings")
      .insert({
        tenant_id: tenantId,
        kind: "instant",
        title: body.title || `Call in ${conversation.name}`,
        host_id: req.headers.get("X-User-Id"),
        project_id: conversation.project_id,
        conversation_id: body.conversation_id,
        scheduled_start: null,
        scheduled_end: null,
        timezone: "Asia/Dubai",
        status: "live",
        room_name: roomName,
        join_code: joinCode,
        max_guests: body.max_guests ?? 20,
        guest_access: body.guest_access ?? "waiting_room",
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

    return new Response(
      JSON.stringify({ 
        kind: "instant", 
        room: newMeeting.room_name,
        join_code: newMeeting.join_code,
        is_live: true
      }),
      { headers: { "Content-Type": "application/json" }, status: 201 }
    );
  }

  // Scheduled meeting - create scheduling record
  if (body.kind === "scheduled") {
    const scheduledStart = body.scheduled_start ? new Date(body.scheduled_start) : null;
    const scheduledEnd = body.scheduled_end ? new Date(body.scheduled_end) : null;

    const { data: scheduledMeeting, error: smError } = await supabase
      .from("meetings")
      .insert({
        tenant_id: tenantId,
        kind: "scheduled",
        title: body.title || `Scheduled Meeting`,
        host_id: req.headers.get("X-User-Id"),
        project_id: conversation.project_id,
        conversation_id: body.conversation_id,
        scheduled_start,
        scheduled_end,
        timezone: "Asia/Dubai",
        status: "scheduled",
        room_name: `meet-${conversation.id}-${Date.now().toString(36)}`,
        join_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        max_guests: body.max_guests ?? 20,
        guest_access: body.guest_access ?? "waiting_room",
        join_before_host: body.join_before_host ?? false,
      })
      .select()
      .single();

    if (smError) {
      return new Response(
        JSON.stringify({ error: "Failed to create scheduled meeting", details: smError }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ kind: "scheduled", id: scheduledMeeting.id }),
      { headers: { "Content-Type": "application/json" }, status: 201 }
    );
  }

  // User-to-user call - initiate a call from a DM or profile
  if (body.kind === "call") {
    // Check if callee is already in a call
    const { data: activeCall, error: acError } = await supabase
      .from("meetings")
      .select("*")
      .eq("host_id", body.conversation_id)  // Would need callee user_id check
      .eq("kind", "call")
      .eq("status", "live")
      .maybeSingle();

    // For now, create the call record
    const roomName = `call-${conversation.id}-${Date.now().toString(36)}`;
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data: callMeeting, error: insertError } = await supabase
      .from("meetings")
      .insert({
        tenant_id: tenantId,
        kind: "call",
        title: body.title || `Call`,
        host_id: req.headers.get("X-User-Id"),
        project_id: conversation.project_id,
        conversation_id: body.conversation_id,
        scheduled_start: new Date().toISOString(),
        scheduled_end: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min duration
        timezone: "Asia/Dubai",
        status: "live",
        room_name: roomName,
        join_code: joinCode,
        max_guests: 2,
        guest_access: "open",
        join_before_host: false,
      })
      .select()
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({ error: "Failed to create call", details: insertError }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        kind: "call", 
        room: callMeeting.room_name,
        join_code: callMeeting.join_code,
        is_live: true,
        call_duration_minutes: 30,
        busy_if_active: false  // Would check if callee in call
      }),
      { headers: { "Content-Type": "application/json" }, status: 201 }
    );
  }

  return new Response(
    JSON.stringify({ error: "Invalid kind. Use 'instant', 'scheduled', or 'call'" }),
    { headers: { "Content-Type": "application/json" }, status: 400 }
  );
});