import type { TaskComment, Db } from "./types";

export const generateTaskComments = (db: Db) => {
  return Array.from(Array(50).keys()).map<TaskComment>((id) => ({
    id: id + 1,
    task_id: Math.floor(Math.random() * (db.tasks.length + 1)) + 1,
    user_id: `user_${Math.floor(Math.random() * 10) + 1}`,
    text: `Task comment ${id + 1}`,
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};