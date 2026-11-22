export function generateMessageLinks(db: any) {
  const messages = db.messages ?? [];
  const tasks = db.tasks ?? [];
  const messageLinks: any[] = [];
  let linkId = 1;

  messages.forEach((msg: any, msgIndex: number) => {
    const targetType = ["task", "project", "lead"][msgIndex % 3];
    let targetId = 1;
    if (targetType === "task" && tasks.length > 0) {
      targetId = tasks[msgIndex % tasks.length]?.id ?? 1;
    }

    messageLinks.push({
      id: linkId++,
      message_id: msg.id,
      target_type: targetType,
      target_id: targetId,
      created_at: new Date().toISOString(),
    });
  });

  return messageLinks;
}
