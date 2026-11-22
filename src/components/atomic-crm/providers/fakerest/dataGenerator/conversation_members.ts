export function generateConversationMembers(db: any) {
  const conversations = db.conversations ?? [];
  const sales = db.sales ?? [];
  const members: any[] = [];
  let memberId = 1;

  conversations.forEach((conv: any, convIndex: number) => {
    const creatorId = sales?.[0]?.id ?? 1;

    members.push({
      id: memberId++,
      conversation_id: conv.id,
      user_id: creatorId,
      tenant_id: conv.tenant_id ?? 1,
      role: "admin",
      last_read_at: new Date().toISOString(),
      muted: false,
    });

    const numMembers = (convIndex % 3) + 1;
    const availableUsers = sales?.filter((s: any) => s.id !== creatorId) ?? [];

    for (let m = 0; m < numMembers && availableUsers[m]; m++) {
      members.push({
        id: memberId++,
        conversation_id: conv.id,
        user_id: availableUsers[m].id,
        tenant_id: conv.tenant_id ?? 1,
        role: m === 0 ? "admin" : "member",
        last_read_at: new Date(Date.now() - m * 86400000).toISOString(),
        muted: m % 2 === 0,
      });
    }
  });

  return members;
}
