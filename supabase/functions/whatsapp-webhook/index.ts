import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface WebhookPayload {
  entry: Array<{
    changes: Array<{
      value: {
        messages: Array<{
          id: string;
          from: string;
          timestamp: string;
          type: string;
          text?: { body: string };
          context?: {
            from: string;
            id: string;
          };
        }>;
        statuses?: Array<{
          status: string;
          message_id: string;
          external_id?: string;
        }>;
      };
      field: string;
    }>;
    id: string;
    time: string;
  }>;
}

interface BotMatch {
  keywordId: string;
  responseText: string;
  responseType: 'message' | 'away' | 'escalate';
}

serve(async (req) => {
  // Check for Meta verification request
  if (req.method === "GET") {
    const { searchParams } = new URL(req.url, "http://localhost");
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === Deno.env.get("WHATSAPP_VERIFY_TOKEN")) {
      return new Response(challenge ?? "", { headers: { "Content-Type": "text/plain" } });
    }
    return new Response("Verification failed", { status: 403 });
  }

  // POST - handle webhook payload
  const body: WebhookPayload = await req.json();

  const supabase = createClient(
    Deno.env.get("VITE_SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  for (const entry of body.entry) {
    for (const change of entry.changes) {
      const value = change.value;

      // Handle new messages
      if (value.messages) {
        for (const message of value.messages) {
          // Check if user has WhatsApp mapping
          const { data: waMapping, error: mappingError } = await supabase
            .from("wa_id_mappings")
            .select("*")
            .eq("whatsapp_number", message.from)
            .maybeSingle();

          if (mappingError || !waMapping) {
            continue; // Skip if no mapping found
          }

          // Check consent
          const { data: consent } = await supabase
            .from("wa_consent")
            .select("*")
            .eq("organization_id", waMapping.organization_id)
            .eq("user_id", waMapping.user_id)
            .eq("channel", "whatsapp")
            .maybeSingle();

          if (!consent?.consented) {
            continue; // Skip if no consent
          }

          // --- BOT KEYWORD MATCHING ---
          // Check if this message matches a bot keyword trigger
          const { data: botKeyword, error: keywordError } = await supabase
            .from("wa_bot_keywords")
            .select("*")
            .eq("organization_id", waMapping.organization_id)
            .eq("is_active", true)
            .maybeSingle();

          let botResponse: BotMatch | null = null;

          if (!keywordError && botKeyword) {
            // Check if message text matches keyword (case-insensitive by default)
            const keyword = botKeyword.keyword;
            const messageText = (message.text?.body || "").toLowerCase();
            const keywordLower = keyword.toLowerCase();

            // Exact match or startsWith match
            const match =
              messageText === keywordLower ||
              messageText.startsWith(keywordLower + " ") ||
              keywordLower.startsWith(messageText);

            if (match) {
              // Fetch the response
              const { data: response, error: responseError } = await supabase
                .from("wa_bot_responses")
                .select("*")
                .eq("keyword_id", botKeyword.id)
                .eq("is_active", true)
                .maybeSingle();

              if (!responseError && response) {
                let finalText = response.response_text;

                // Variable substitution if template
                if (response.variables && response.variables.length > 0) {
                  // Simple {{var}} substitution
                  for (const [key, value] of Object.entries(response.variables as Record<string, string>)) {
                    const regex = new RegExp(`\\{\\${key}\\}`, "g");
                    finalText = finalText.replace(regex, value);
                  }
                }

                botResponse = {
                  keywordId: botKeyword.id,
                  responseText: finalText,
                  responseType: response.response_type,
                };
              }
            }
          }

          // --- CONVERSATION STATE TRACKING ---
          // Update or create bot conversation state
          const { data: existingConv, error: convError } = await supabase
            .from("wa_bot_conversations")
            .select("*")
            .eq("organization_id", waMapping.organization_id)
            .eq("wa_id", waMapping.id)
            .maybeSingle();

          if (!convError && existingConv) {
            // Update existing conversation
            const newState =
              botResponse ? 'confirmed' : existingConv.state;
            const newInteractionCount = (existingConv.interaction_count || 0) + 1;
            const newLastInteraction = new Date().toISOString();

            await supabase.from("wa_bot_conversations").update({
              state: newState,
              current_keyword: botResponse?.keywordId,
              last_interaction: newLastInteraction,
              interaction_count: newInteractionCount,
              metadata:
                botResponse && response?.variables
                  ? { ...(existingConv.metadata || {}), last_keyword: botKeyword.keyword, last_response: botResponse.responseText }
                  : existingConv.metadata,
            }).eq("id", existingConv.id);
          } else {
            // Create new conversation
            const state = botResponse ? 'confirmed' : 'awaiting_input';

            await supabase.from("wa_bot_conversations").insert({
              organization_id: waMapping.organization_id,
              wa_id: waMapping.id,
              user_phone: message.from,
              state: state,
              current_keyword: botResponse?.keywordId,
              last_interaction: new Date().toISOString(),
              interaction_count: botResponse ? 1 : 0,
              metadata: botResponse && response?.variables
                ? { last_keyword: botKeyword.keyword, last_response: botResponse.responseText }
                : {},
            });
          }

          // --- SEND BOT RESPONSE IF TRIGGERED ---
          if (botResponse) {
            // Check if this is an away message (outside active hours)
            const now = new Date();
            const hour = now.getHours();
            const minute = now.getMinutes();
            const currentTime = hour * 60 + minute;

            let sendResponse = true;
            if (botResponse.responseType === 'away') {
              // Check if within active hours
              const { data: activeHrs } = await supabase
                .from("wa_bot_responses")
                .select("active_hours_start, active_hours_end, time_zone")
                .eq("keyword_id", botResponse.keywordId)
                .eq("is_away_message", true)
                .maybeSingle();

              if (activeHrs) {
                const tzOffset = 0; // Simplified - would use actual time_zone
                const startMinutes = parseInt(activeHrs.active_hours_start.split(':')[0]) * 60 + parseInt(activeHrs.active_hours_start.split(':')[1]);
                const endMinutes = parseInt(activeHrs.active_hours_end.split(':')[0]) * 60 + parseInt(activeHrs.active_hours_end.split(':')[1]);

                if (currentTime < startMinutes || currentTime > endMinutes) {
                  sendResponse = true; // Outside hours - send away message
                } else {
                  sendResponse = false; // Inside hours - don't send away message, handle normally
                }
              }
            }

            if (sendResponse) {
              // Send message via Meta API
              const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID")!;
              const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN")!;

              const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;

              const payload = {
                messaging_product: "whatsapp",
                to: message.from,
                type: "text",
                text: {
                  body: botResponse.responseText,
                },
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

              // Log the bot response
              await supabase.from("wa_message_status").insert({
                organization_id: waMapping.organization_id,
                message_id: message.id,
                to_number: message.from,
                status: fetchResponse.ok ? 'sent' : 'failed',
              });

              if (fetchResponse.ok && result.messages?.[0]) {
                // Update conversation as confirmed
                await supabase.from("wa_bot_conversations").update({
                  state: 'confirmed',
                  last_interaction: new Date().toISOString(),
                }).eq("id", existingConv?.id || (await supabase.from("wa_bot_conversations").insert({
                  organization_id: waMapping.organization_id,
                  wa_id: waMapping.id,
                  user_phone: message.from,
                  state: 'start',
                  current_keyword: botResponse.keywordId,
                  last_interaction: new Date().toISOString(),
                  interaction_count: 0,
                  metadata: {},
                }).then(r => r.data[0]?.id).orElse(null)!.toString()));
              }
            }
          } else {
            // No bot trigger - create a regular message record
            await supabase.from("messages").insert({
              organization_id: waMapping.organization_id,
              sender_id: waMapping.user_id,
              recipient_id: waMapping.user_id,
              channel_type: "direct",
              channel_id: waMapping.id,
              subject: `WhatsApp from ${message.from}`,
              text: message.text?.body || "",
              timestamp: new Date(message.timestamp).toISOString(),
            });
          }
        }
      }

      // Handle message status updates
      if (value.statuses) {
        for (const status of value.statuses) {
          await supabase.from("wa_message_status").upsert({
            organization_id: waMapping?.organization_id,
            message_id: status.message_id,
            status: status.status,
            error_code: status.error_code,
            error_message: status.error_message,
            delivered_at: status.status === "delivered" ? new Date().toISOString() : null,
            read_at: status.status === "read" ? new Date().toISOString() : null,
          });
        }
      }
    }
  }

  return new Response(JSON.stringify({ status: "processed" }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});