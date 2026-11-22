import { generateCompanies } from "./companies";
import { generateContactNotes } from "./contactNotes";
import { generateContacts } from "./contacts";
import { generateDealNotes } from "./dealNotes";
import { generateDeals } from "./deals";
import { generateProjects } from "./projects";
import { generateMeetings } from "./meetings";
import { finalize } from "./finalize";
import { generateSales } from "./sales";
import { generateTags } from "./tags";
import { generateTasks } from "./tasks";
import { generateTaskComments } from "./task_comments";
import { generateTaskEvents } from "./task_events";
import { generateConversations } from "./conversations";
import { generateConversationMembers } from "./conversation_members";
import { generateMessages } from "./messages";
import { generateMessageLinks } from "./message_links";
import { generateIssueThreads } from "./issue_threads";
import type { Db } from "./types";

export default (): Db => {
  const db = {} as Db;
  db.sales = generateSales(db);
  db.tags = generateTags(db);
  db.companies = generateCompanies(db);
  db.contacts = generateContacts(db);
  db.contact_notes = generateContactNotes(db);
  db.deals = generateDeals(db);
  db.deal_notes = generateDealNotes(db);
  db.projects = generateProjects(db);
  db.meetings = generateMeetings(db);
  db.tasks = generateTasks(db);
  db.task_comments = generateTaskComments(db);
  db.task_events = generateTaskEvents(db);
  db.conversations = generateConversations(db);
  db.conversation_members = generateConversationMembers(db);
  db.messages = generateMessages(db);
  db.message_links = generateMessageLinks(db);
  db.issue_threads = generateIssueThreads(db);
  db.configuration = [
    {
      id: 1,
      config: {} as Db["configuration"][number]["config"],
    },
  ];
  finalize(db);

  return db;
};
