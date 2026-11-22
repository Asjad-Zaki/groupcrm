import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface SendWhatsAppMessageRequest {
  to: string; // E.164 formatted number
  template_id: string;
  language_code?: string;
  variables?: (string | number)[];
}

serve(async (req) => {
  // Create Supabase admin client
  const supabase = createClient(
    Deno.env.get("VITE_SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
  );

  // Parse request body
  const body = (await req.json()) as SendWhatsAppMessageRequest;

  // Verify user has WhatsApp consent and mapping
  const { data: waMapping, error: waError } = await supabase
    .from("wa_id_mappings")
    .select("*")
    .eq("user_id", req.headers.get("X-User-Id")!)
    .maybeSingle();

  if (waError || !waMapping) {
    return new Response(
      JSON.stringify({ error: "WhatsApp not configured for user" }),
      { headers: { "Content-Type": "application/json" }, status: 403 }
    );
  }

  // Check consent
  const { data: consent, error: consentError } = await supabase
    .from("wa_consent")
    .select("*")
    .eq("organization_id", waMapping.organization_id)
    .eq("user_id", waMapping.user_id)
    .eq("channel", "whatsapp")
    .maybeSingle();

  if (consentError || !consent.consented) {
    return new Response(
      JSON.stringify({ error: "No WhatsApp consent" }),
      { headers: { "Content-Type": "application/json" }, status: 403 }
    );
  }

  // Send via Meta Cloud API
  const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID")!;
  const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN")!;

  const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to: body.to,
    type: "template",
    template: {
      name: body.template_id,
      language: { code: body.language_code || "en_US" },
      components: body.variables?.map((v, i) => ({
        type: "body",
        parameters: [{ type: "text", text: String(v) }]
      })) || []
    }
  };

  const fetchResponse = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await fetchResponse.json();

  // Log the message status to audit
  if (fetchResponse.ok) {
    await supabase.from("wa_message_status").insert({
      organization_id: waMapping.organization_id,
      message_id: result.messages?.[0],
      to_number: body.to,
      status: "sent",
    });

    // Also create a message record
    await supabase.from("messages").insert({
      organization_id: waMapping.organization_id,
      sender_id: waMapping.user_id,
      recipient_id: waMapping.user_id,
      channel_type: "direct",
      channel_id: waMapping.id,
      text: `WhatsApp template: ${body.template_id}`,
      timestamp: new Date().toISOString(),
    });
  }

  return new Response(
    JSON.stringify({ result, sent: fetchResponse.ok }),
    { headers: { "Content-Type": "application/json" }, status: fetchResponse.ok ? 200 : 500 }
  );
});