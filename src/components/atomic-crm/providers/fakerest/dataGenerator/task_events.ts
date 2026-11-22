import type { TaskEvent, Db } from "./types";

export const generateTaskEvents = (db: Db) => {
  return Array.from(Array(100).keys()).map<TaskEvent>((id) => ({
    id: id + 1,
    task_id: Math.floor(Math.random() * (db.tasks.length + 1)) + 1,
    user_id: `user_${Math.floor(Math.random() * 10) + 1}`,
    type: ["status_changed", "priority_changed", "reminder_fired", "escalated", "completed", "unassigned"][Math.floor(Math.random() * 6)],
    description: eventTypes[Math.floor(Math.random() * eventTypes.length)],
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

const eventTypes = [
  "Status changed from new to initiated",
  "Priority changed to high",
  "Reminder fired for overdue task",
  "Task escalated to manager",
  "Task marked as completed",
  "Task unassigned from user",
];