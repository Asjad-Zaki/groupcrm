import type {
  Company,
  Contact,
  ContactNote,
  Conversation,
  ConversationMember,
  DailyReport,
  Deal,
  DealNote,
  IssueThread,
  Meeting,
  Message,
  MessageLink,
  Project,
  Quotation,
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
  daily_reports: DailyReport[];
  task_comments: TaskComment[];
  task_events: TaskEvent[];
  conversations: Conversation[];
  conversation_members: ConversationMember[];
  messages: Message[];
  message_links: MessageLink[];
  issue_threads: IssueThread[];
  quotations: Quotation[];
  configuration: Array<{ id: number; config: ConfigurationContextValue }>;
}
