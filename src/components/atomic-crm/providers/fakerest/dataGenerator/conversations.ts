export function generateConversations(db: any) {
  const tasks = db.tasks ?? [];
  const conversations: any[] = [];
  let nextId = 1;

  // Create project chats for existing projects
  const projectChats = tasks
    .filter((t: any) => t.project_id)
    .map((t: any) => ({
      id: nextId++,
      tenant_id: t.tenant_id ?? 1,
      type: "project" as const,
      name: `Project Chat - Project ${t.project_id}`,
      posting_policy: "everyone",
      archived_at: null,
      created_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      unread_count: Math.floor(Math.random() * 50),
      project_name: `Project ${t.project_id}`,
    }));

  conversations.push(...projectChats);

  // Create some general channels
  const channelNames = ["General", "Announcements", "Technical Discussions", "Sales", "Support"];
  channelNames.forEach((name, i) => {
    conversations.push({
      id: nextId++,
      tenant_id: 1,
      type: "channel" as const,
      name,
      posting_policy: i < 2 ? "managers_only" : "everyone",
      archived_at: null,
      created_at: new Date(Date.now() - i * 86400000).toISOString(),
      last_activity: new Date(Date.now() - i * 86400000).toISOString(),
      unread_count: i === 0 ? 5 : 0,
    });
  });

  // Create some DMs
  const users = [1, 2, 3, 4, 5];
  for (let i = 0; i < 3; i++) {
    const participants = users.slice(i * 2, i * 2 + 2);
    conversations.push({
      id: nextId++,
      tenant_id: 1,
      type: "dm" as const,
      name: `DM between user ${participants[0]} and user ${participants[1]}`,
      posting_policy: "everyone",
      archived_at: null,
      created_at: new Date(Date.now() - i * 86400000).toISOString(),
      last_activity: new Date(Date.now() - i * 86400000).toISOString(),
      unread_count: i === 0 ? 2 : 0,
    });
  }

  // Create some issue threads
  const issueStatuses = ["open", "resolved"];
  Array(5).fill(1).forEach((_, i) => {
    conversations.push({
      id: nextId++,
      tenant_id: 1,
      type: "issue" as const,
      name: `Technical Issue Thread ${i + 1}`,
      posting_policy: "everyone",
      archived_at: null,
      created_at: new Date(Date.now() - i * 43200000).toISOString(),
      last_activity: new Date(Date.now() - i * 43200000).toISOString(),
      unread_count: i < 3 ? Math.floor(Math.random() * 30) : 0,
      ...(issueStatuses[i % 2] === "open"
        ? { status: "open", open_count: Math.floor(Math.random() * 10) }
        : { status: "resolved", resolved_by: 1, resolved_at: new Date(Date.now() - i * 86400000).toISOString(), open_count: 0 }),
    });
  });

  return conversations;
}
