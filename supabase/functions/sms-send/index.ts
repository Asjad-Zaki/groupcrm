import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface SendSMSRequest {
  organization_id: string;
  user_id: string;
  to: string;
  message: string;
  template?: string;
  variables?: Record<string, string>;
  from?: string;
  workflow_id?: string; // Optional: trigger from notification workflow
}

serve(async (req) => {
  // Create Supabase admin client
  const supabase = createClient(
    Deno.env.get("VITE_SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Parse request body
  const body = (await req.json()) as SendSMSRequest;

  // Validate organization membership
  const { data: membership, error: membershipError } = await supabase
    .from("user_company_memberships")
    .select("role")
    .eq("organization_id", body.organization_id)
    .eq("user_id", body.user_id)
    .maybeSingle();

  if (membershipError || !membership) {
    return new Response(
      JSON.stringify({ error: "User not a member of this organization" }),
      { headers: { "Content-Type": "application/json" }, status: 403 }
    );
  }

  // Check user communication preferences
  const { data: preferences, error: prefsError } = await supabase
    .from("communication_preferences")
    .select("*")
    .eq("organization_id", body.organization_id)
    .eq("user_id", body.user_id)
    .maybeSingle();

  if (prefsError || !preferences?.can_receive_sms) {
    return new Response(
      JSON.stringify({ error: "User has not consented to receive SMS" }),
      { headers: { "Content-Type": "application/json" }, status: 403 }
    );
  }

  // Attempt to lookup SMS template context from notification workflows
  let resolvedMessage: string = body.message;
  let workflowContext: { name: string; description: string; trigger_type: string } | null = null;

  if (body.workflow_id) {
    const { data: workflow, error: workflowError } = await supabase
      .from("notification_workflows")
      .select("name, description, trigger_type")
      .eq("organization_id", body.organization_id)
      .eq("id", body.workflow_id)
      .eq("is_active", true)
      .maybeSingle();

    if (!workflowError && workflow) {
      workflowContext = {
        name: workflow.name,
        description: workflow.description,
        trigger_type: workflow.trigger_type,
      };
      
      // If workflow has an inline SMS template, use it
      if (workflow.trigger_type && body.template) {
        // For now, use the body.message with variable substitution from workflow context
        // In a full implementation, the workflow would define the exact SMS text
        // and variables. Here we just pass through the body.message.
        resolvedMessage = body.message;
      }
    }
  }

  // Send via SMS gateway API
  // Using Twilio as example - in production, configure with actual credentials
  const twilioSid = Deno.env.get("TWILIO_SID");
  const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const twilioNumber = Deno.env.get("TWILIO_FROM_NUMBER");

  if (!twilioSid || !twilioToken || !twilioNumber) {
    // Log the failure for later configuration
    await supabase.from("activity_log").insert({
      organization_id: body.organization_id,
      action: "sms_send_skipped",
      user_id: body.user_id,
      details: { reason: "SMS gateway not configured" },
    });

    return new Response(
      JSON.stringify({ 
        error: "SMS gateway not configured - contact administrator",
        status: "pending_config"
      }),
      { headers: { "Content-Type": "application/json" }, status: 501 }
    );
  }

  // Apply variable substitution if template provided (SMS optimized)
  const finalMessage = body.template
    ? renderSMSTemplate(body.template, body.variables || {})
    : body.message;

  const payload = {
    To: body.to,
    From: twilioNumber || body.from,
    Body: resolvedMessage,
  };

  const fetchResponse = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
    {
      method: "POST",
      auth: {
        username: twilioSid,
        password: twilioToken,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(payload as Record<string, string>),
    },
  );

  const result = await fetchResponse.json();

  if (fetchResponse.ok) {
    // Log the SMS in activity with workflow context
    await supabase.from("activity_log").insert({
      organization_id: body.organization_id,
      action: "sms_sent",
      user_id: body.user_id,
      details: {
        to: body.to,
        message: body.message,
        template: body.template,
        variables: body.variables,
        sid: result.sid,
        workflow_id: body.workflow_id,
      },
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        sid: result.sid,
        status: result.status,
        sentAt: result.date,
        workflow_context: workflowContext
      }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
  } else {
    // Log the failure
    await supabase.from("activity_log").insert({
      organization_id: body.organization_id,
      action: "sms_send_failed",
      user_id: body.user_id,
      details: {
        to: body.to,
        message: body.message,
        error: result.message || result.error,
      },
    });

    return new Response(
      JSON.stringify({ error: result.message || "Failed to send SMS" }),
      { headers: { "Content-Type": "application/json" }, status: fetchResponse.status }
    );
  }
});

/**
 * Render SMS template with variable substitution
 * SMS has a 160-character limit for standard GSM-7 encoding
 */
function renderSMSTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  
  // Substitute {{variable}} patterns - SMS optimized (no HTML)
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    result = result.replace(regex, value);
  }
  
  // SMS length check - warn if over 160 chars (standard GSM-7)
  const maxLength = 160;
  if (result.length > maxLength) {
    // Truncate with ellipsis and note
    result = result.substring(0, maxLength - 3) + "...";
  }
  
  return result;
}