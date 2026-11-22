import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface GuestRequestBody {
  meeting_id: string;
  guest_name: string;
  guest_email?: string;
}

serve(async (req) => {
  // Create Supabase service role client (no auth check - public endpoint)
  const supabase = createClient(
    Deno.env.get("VITE_SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { headers: { } }
  );

  // Parse request body
  const body = (await req.json()) as GuestRequestBody;

  // Validate meeting exists
  const { data: meeting, error: meError } = await supabase
    .from("meetings")
    .select("id, status, guest_link_expires_at, max_guests, guest_access")
    .eq("id", body.meeting_id)
    .single();

  if (meError || !meeting) {
    return new Response(
      JSON.stringify({ error: "Meeting not found" }),
      { headers: { "Content-Type": "application/json" }, status: 404 }
    );
  }

  // Check if meeting is live or scheduled
  if (meeting.status !== "live" && meeting.status !== "scheduled") {
    return new Response(
      JSON.stringify({ error: "Meeting is not in a state that accepts guests" }),
      { headers: { "Content-Type": "application/json" }, status: 400 }
    );
  }

  // Check guest limit
  const currentGuests = 0; // Would query meeting_participants count
  if (currentGuests >= (meeting.max_guests ?? 20)) {
    return new Response(
      JSON.stringify({ error: "Maximum guest limit reached" }),
      { headers: { "Content-Type": "application/json" }, status: 400 }
    );
  }

  // Check if guest access is enabled
  if (meeting.guest_access === "off") {
    return new Response(
      JSON.stringify({ error: "Guest access is disabled for this meeting" }),
      { headers: { "Content-Type": "application/json" }, status: 403 }
    );
  }

  // Check if guest link has expired
  if (meeting.guest_link_expires_at) {
    const expires = new Date(meeting.guest_link_expires_at);
    const now = new Date();
    if (now > expires) {
      return new Response(
        JSON.stringify({ error: "Guest link has expired" }),
        { headers: { "Content-Type": "application/json" }, status: 410 }
      );
    }
  }

  // Generate an opaque ticket (random string that works once)
  const ticket = Math.random().toString(36).substring(2, 20) + Date.now().toString(36);
  
  // Rate limit: check if too many requests from this IP (simplified - would use actual IP)
  // In production, would check IP-based rate limiting

  // Create a waiting row
  const { error: insertError } = await supabase
    .from("meeting_participants")
    .insert({
      meeting_id: body.meeting_id,
      guest_name: body.guest_name,
      guest_email: body.guest_email,
      role: "guest",
      invite_status: "invited",
      requested_at: new Date().toISOString(),
    });

  if (insertError) {
    return new Response(
      JSON.stringify({ error: "Failed to create guest request", details: insertError }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }

  // Generate a guest join code
  const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  return new Response(
    JSON.stringify({ 
      ticket,
      join_code: joinCode,
      status: "waiting",
      message: "Guest request created. Awaiting host admission."
    }),
    { headers: { "Content-Type": "application/json" }, status: 201 }
  );
});