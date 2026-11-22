import type {
  Company,
  Contact,
  ContactNote,
  Conversation,
  ConversationMember,
  Deal,
  DealNote,
  IssueThread,
  Meeting,
  Message,
  MessageLink,
  Project,
  Sale,
  Tag,
  Task,
  TaskComment,
  TaskEvent,
} from "../../../types";
import type { ConfigurationContextValue } from "../../../root/ConfigurationContext";

export type { TaskComment, TaskEvent };

export interface Db {
  companies: Company[];
  contacts: Contact[];
  contact_notes: ContactNote[];
  deals: Deal[];
  deal_notes: DealNote[];
  projects: Project[];
  meetings: Meeting[];
  sales: Sale[];
  tags: Tag[];
  tasks: Task[];
  task_comments: TaskComment[];
  task_events: TaskEvent[];
  conversations: Conversation[];
  conversation_members: ConversationMember[];
  messages: Message[];
  message_links: MessageLink[];
  issue_threads: IssueThread[];
  configuration: Array<{ id: number; config: ConfigurationContextValue }>;
}
