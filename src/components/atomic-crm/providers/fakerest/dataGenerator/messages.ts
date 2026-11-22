export function generateMessages(db: any) {
  const conversations = db.conversations ?? [];
  const conversationMembers = db.conversation_members ?? [];
  const messages: any[] = [];
  let messageId = 1;

  conversations.forEach((conv: any) => {
    const convMembers = conversationMembers.filter(
      (m: any) => m.conversation_id === conv.id
    );
    if (!convMembers.length) return;

    const numMessages = conv.type === "issue" ? 3 : 5;

    for (let i = 0; i < numMessages; i++) {
      const sender = convMembers[i % convMembers.length];
      const isReply = i > 1 && Math.random() > 0.7;
      const replyTo = isReply ? messages[messages.length - 1]?.id : undefined;

      const baseDate = new Date(conv.created_at);
      const messageDate = new Date(baseDate.getTime() + i * 3600000);

      messages.push({
        id: messageId++,
        conversation_id: conv.id,
        sender_id: sender.user_id,
        body: `Message ${i + 1} in ${conv.type} "${conv.name}"`,
        reply_to: replyTo,
        edited_at: i > 5 ? new Date(messageDate.getTime() + 3600000).toISOString() : null,
        deleted_at: null,
        attachments: i % 4 === 0 ? [{ file_name: `file_${i}.pdf`, file_url: `#`, file_type: "application/pdf" }] : [],
        created_at: messageDate.toISOString(),
        sender_name: `User ${sender.user_id}`,
      });
    }
  });

  messages.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return messages;
}
