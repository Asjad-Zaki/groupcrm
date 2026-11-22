export function generateIssueThreads(db: any) {
  const conversations = db.conversations ?? [];
  const issueThreads: any[] = [];
  let threadId = 1;

  // Create issue threads for issue-type conversations
  const issueConvs = conversations.filter((c: any) => c.type === "issue");

  issueConvs.forEach((conv: any) => {
    const statuses = ["open", "resolved"];
    const status = statuses[threadId % 2];
    const openCount = status === "open" ? 3 : 0;

    let resolvedBy: any = null;
    let resolvedAt: string | null = null;

    if (status === "resolved") {
      resolvedBy = 1;
      resolvedAt = new Date(Date.now() - 30 * 86400000).toISOString();
    }

    issueThreads.push({
      id: threadId++,
      conversation_id: conv.id,
      reporter_id: 1,
      status,
      resolved_by: resolvedBy,
      resolved_at: resolvedAt,
      open_count: openCount,
      created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    });
  });

  // Also create some issue threads linked to project conversations
  const projectConvs = conversations.filter((c: any) => c.type === "project");
  projectConvs.slice(0, 3).forEach((conv: any) => {
    const statuses = ["open", "resolved"];
    const status = statuses[threadId % 2];
    const openCount = status === "open" ? 2 : 0;

    issueThreads.push({
      id: threadId++,
      conversation_id: conv.id,
      reporter_id: 1,
      status,
      resolved_by: status === "resolved" ? 1 : null,
      resolved_at: status === "resolved" ? new Date(Date.now() - 30 * 86400000).toISOString() : null,
      open_count: openCount,
      created_at: new Date().toISOString(),
    });
  });

  return issueThreads;
}
