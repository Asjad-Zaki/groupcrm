import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface SendEmailRequest {
  organization_id: string;
  user_id: string;
  to: string;
  subject: string;
  template?: string; // Template name from email_templates, or inline template
  variables?: Record<string, string>;
  cc?: string;
  bcc?: string;
  reply_to?: string;
  workflow_id?: string; // Optional: trigger from notification workflow
}

serve(async (req) => {
  // Create Supabase admin client
  const supabase = createClient(
    Deno.env.get("VITE_SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Parse request body
  const body = (await req.json()) as SendEmailRequest;

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

  if (prefsError || !preferences?.can_receive_email) {
    return new Response(
      JSON.stringify({ error: "User has not consented to receive emails" }),
      { headers: { "Content-Type": "application/json" }, status: 403 }
    );
  }

  // Attempt to lookup template from email_templates table
  let htmlTemplate: string | undefined = undefined;
  let textTemplate: string | undefined = undefined;
  let resolvedSubject: string = body.subject;
  let useInlineRendering = true;
  let workflowContext: { name: string; description: string; trigger_type: string } | null = null;

  if (body.template) {
    // Try to lookup template from database
    const { data: storedTemplate, error: templateError } = await supabase
      .from("email_templates")
      .select("*")
      .eq("organization_id", body.organization_id)
      .eq("name", body.template)
      .eq("is_active", true)
      .maybeSingle();

    if (!templateError && storedTemplate) {
      useInlineRendering = false;
      
      // Apply variable substitution from stored template
      let variablesToUse = body.variables || {};
      
      // If stored template has defined variables, use those
      if (storedTemplate.variables && Array.isArray(storedTemplate.variables)) {
        // Use stored variable definitions, but allow overrides from request
        variablesToUse = { ...(storedTemplate.variables as Record<string, string>), ...body.variables };
      }
      
      // Substitute variables in subject
      if (storedTemplate.subject_template) {
        resolvedSubject = storedTemplate.subject_template;
        for (const [key, value] of Object.entries(variablesToUse)) {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
          resolvedSubject = resolvedSubject.replace(regex, value);
        }
      }
      
      // Substitute variables in HTML template
      if (storedTemplate.html_template) {
        htmlTemplate = storedTemplate.html_template;
        for (const [key, value] of Object.entries(variablesToUse)) {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
          htmlTemplate = htmlTemplate.replace(regex, value);
        }
      }
      
      // Substitute variables in text template
      if (storedTemplate.text_template) {
        textTemplate = storedTemplate.text_template;
        for (const [key, value] of Object.entries(variablesToUse)) {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
          textTemplate = textTemplate.replace(regex, value);
        }
      }
      
      // Store workflow context if workflow_id provided
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
        }
      }
    }
  }

  // Fall back to inline rendering if no template looked up or not found
  if (useInlineRendering) {
    // If an inline template was provided, render it
    if (body.template && !storedTemplate) {
      // This branch handles the case where template is provided but not in DB
      // We'll just use the inline rendering below
    }
    
    // Build payload with inline rendering
    const inlineHtml = body.template
      ? renderEmailTemplate(body.template, body.variables || {})
      : undefined;
    const inlineText = body.template
      ? renderEmailTemplate(body.template, body.variables || {}, true)
      : undefined;
    
    // Use inline templates for subject if not already resolved
    if (!resolvedSubject && body.template) {
      resolvedSubject = renderEmailTemplate(body.template, body.variables || {}, false);
    }
    
    htmlTemplate = inlineHtml;
    textTemplate = inlineText;
  }

  // Send via Postmark API
  const postmarkApiKey = Deno.env.get("POSTMARK_API_KEY");
  if (!postmarkApiKey) {
    return new Response(
      JSON.stringify({ error: "Postmark API key not configured" }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }

  const postmarkUrl = "https://api.postmarkapp.com/email";

  const payload = {
    From: "noreply@atomic-crm.example.com",
    To: body.to,
    Subject: resolvedSubject,
    HtmlBody: htmlTemplate,
    TextBody: textTemplate,
    Cc: body.cc,
    Bcc: body.bcc,
    ReplyTo: body.reply_to,
    TrackOpens: true,
    TrackLinks: "HtmlAndText",
    MessageStream: "outbound",
  };

  const fetchResponse = await fetch(postmarkUrl, {
    method: "POST",
    headers: {
      "X-Postmark-Server-Token": postmarkApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await fetchResponse.json();

  if (fetchResponse.ok) {
    // Log the email in activity with template info and workflow context
    await supabase.from("activity_log").insert({
      organization_id: body.organization_id,
      action: "email_sent",
      user_id: body.user_id,
      details: {
        to: body.to,
        subject: resolvedSubject,
        template: body.template,
        used_stored_template: !useInlineRendering,
        variables: body.variables,
        workflow_id: body.workflow_id,
        workflow_name: workflowContext?.name,
      },
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        messageId: result.MessageID,
        sentAt: result.SentAt,
        template_used: body.template,
        from_db: !useInlineRendering,
        workflow_context: workflowContext
      }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
  } else {
    // Log the failure
    await supabase.from("activity_log").insert({
      organization_id: body.organization_id,
      action: "email_send_failed",
      user_id: body.user_id,
      details: {
        to: body.to,
        subject: resolvedSubject,
        template: body.template,
        error: result.Message || result.Error,
      },
    });

    return new Response(
      JSON.stringify({ error: result.Message || "Failed to send email" }),
      { headers: { "Content-Type": "application/json" }, status: fetchResponse.status }
    );
  }
});

/**
 * Render email template with variable substitution (inline fallback)
 */
function renderEmailTemplate(
  template: string,
  variables: Record<string, string>,
  isText: boolean = false
): string {
  let result = template;
  
  // Substitute {{variable}} patterns
  for (const [key, value] of Object.entries(variables)) {
    const regex = isText 
      ? new RegExp(`\\{\\{${key}\\}\\}`, "g") 
      : new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
    result = result.replace(regex, value);
  }
  
  return result;
}