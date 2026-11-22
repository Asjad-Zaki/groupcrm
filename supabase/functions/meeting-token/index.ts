import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface TokenRequest {
  meeting_id: string;
}

serve(async (req) => {
  // Create Supabase service role client
  const supabase = createClient(
    Deno.env.get("VITE_SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
  );

  // Parse request body
  const body = (await req.json()) as TokenRequest;

  // Validate meeting exists and user has permission
  const { data: meeting, error: meError } = await supabase
    .from("meetings")
    .select(`
      *,
      host:auth.users!auth.users(id, email, role_id)
    `)
    .eq("id", body.meeting_id)
    .single();

  if (meError || !meeting) {
    return new Response(
      JSON.stringify({ error: "Meeting not found" }),
      { headers: { "Content-Type": "application/json" }, status: 404 }
    );
  }

  const userId = req.headers.get("X-User-Id")!;

  // Check permissions: host, project members, and managers can get tokens
  const userRoleId = meeting.host.role_id;

  // Check if user is the host
  const isHost = meeting.host.id === userId;

  // Check if user is a project member
  let isProjectMember = false;
  if (meeting.project_id) {
    const { data: memberCheck, error: mcError } = await supabase
      .from("project_members")
      .select("id")
      .eq("project_id", meeting.project_id)
      .eq("user_id", userId)
      .maybeSingle();
    isProjectMember = !mcError && !!memberCheck;
  }

  // For now, allow host and project members; managers can be added later
  const hasPermission = isHost || isProjectMember;

  if (!hasPermission) {
    return new Response(
      JSON.stringify({ error: "Insufficient permissions to access this meeting" }),
      { headers: { "Content-Type": "application/json" }, status: 403 }
    );
  }

  // Domain for the meeting
  const domain = Deno.env.get("JITSI_DOMAIN") || "meet.crm.local";

  // Generate a short-lived JWT token for Jitsi
  // In a real implementation, this would be a properly signed JWT
  const token = `${userId}-${body.meeting_id}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

  // Token TTL: 30 minutes
  const ttlMinutes = 30;
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();

  return new Response(
    JSON.stringify({ 
      domain, 
      room: meeting.room_name,
      jwt: token,
      expires_at: expiresAt,
      meeting_id: meeting.id
    }),
    { headers: { "Content-Type": "application/json" }, status: 200 }
  );
});