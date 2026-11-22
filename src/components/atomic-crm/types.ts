import type { Identifier, RaRecord } from "ra-core";
import type { ComponentType } from "react";

import type {
  COMPANY_CREATED,
  CONTACT_CREATED,
  CONTACT_NOTE_CREATED,
  DEAL_CREATED,
  DEAL_NOTE_CREATED,
} from "./consts";

export type SignUpData = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
};

export type SalesFormData = {
  avatar?: string;
  email: string;
  secondary_emails?: string[];
  password?: string;
  first_name: string;
  last_name: string;
  administrator: boolean;
  disabled: boolean;
};

export type Sale = {
  first_name: string;
  last_name: string;
  administrator: boolean;
  avatar?: RAFile;
  disabled?: boolean;
  user_id: string;

  /**
   * This is a copy of the user's email, to make it easier to handle by react admin
   * DO NOT UPDATE this field directly, it should be updated by the backend
   */
  email: string;

  secondary_emails?: string[];

  /**
   * This is used by the fake rest provider to store the password
   * DO NOT USE this field in your code besides the fake rest provider
   * @deprecated
   */
  password?: string;

  /**
   * The tenant this sales user belongs to
   */
  tenant_id?: number;

  /**
   * Accessible tenant IDs for multi-company memberships
   */
  tenant_ids?: string[];

  /**
   * Human-readable role designation
   */
  role_name?: string;

  /**
   * The user's role within the tenant
   */
  role_id?: number;

  /**
   * The user's department within the tenant
   */
  department?: string;

  /**
   * The user's job title within the tenant
   */
  job_title?: string;

  /**
   * Whether the membership is provisional and pending review
   */
  membership_status?: string;

  /**
   * The tenant scope for this user's permissions
   */
  permission_scope?: string;
} & Pick<RaRecord, "id">;

export type Company = {
  name: string;
  logo: RAFile;
  sector: string;
  size: 1 | 10 | 50 | 250 | 500;
  linkedin_url: string;
  website: string;
  phone_number: string;
  address: string;
  zipcode: string;
  city: string;
  state_abbr: string;
  sales_id?: Identifier;
  created_at: string;
  description: string;
  revenue: string;
  tax_identifier: string;
  country: string;
  context_links?: string[];
  nb_contacts?: number;
  nb_deals?: number;

  /**
   * The customer organization name (not to be confused with 'tenants')
   */
  customer_organization?: string;
} & Pick<RaRecord, "id">;

export type EmailAndType = {
  email: string;
  type: "Work" | "Home" | "Other";
};

export type PhoneNumberAndType = {
  number: string;
  type: "Work" | "Home" | "Other";
};

export type Contact = {
  first_name: string;
  last_name: string;
  title: string;
  company_id?: Identifier | null;
  tenant_id?: number;
  email_jsonb: EmailAndType[];
  avatar?: Partial<RAFile>;
  linkedin_url?: string | null;
  first_seen: string;
  last_seen: string;
  has_newsletter: boolean;
  tags: number[];
  gender: string;
  sales_id?: Identifier;
  status: string;
  background: string;
  phone_jsonb: PhoneNumberAndType[];
  nb_tasks?: number;
  company_name?: string;
} & Pick<RaRecord, "id">;

export type ContactNote = {
  contact_id: Identifier;
  text: string;
  date: string;
  sales_id: Identifier;
  status: string;
  attachments?: AttachmentNote[];
  tenant_id?: number;
} & Pick<RaRecord, "id">;

export type Deal = {
  name: string;
  company_id: Identifier;
  tenant_id?: number;
  contact_ids: Identifier[];
  categories: string[];
  stage: string;
  description: string;
  amount: number;
  created_at: string;
  updated_at: string;
  archived_at?: string;
  expected_closing_date: string;
  sales_id: Identifier;
  index: number;
  lead_id?: Identifier;
  project_id?: Identifier;
  high_risk?: boolean;
  risk_reason?: string;
  next_followup_at?: string;
} & Pick<RaRecord, "id">;

export interface ProjectMilestone {
  id: string;
  title: string;
  completed: boolean;
  completed_at?: string;
  due_date?: string;
  notes?: string;
}

export type Project = {
  name: string;
  reference_no: string;
  tenant_id: number; // 1: Goldland, 2: Abbadi, 3: Casavera
  deal_id?: Identifier;
  company_id: Identifier;
  contact_id?: Identifier;
  engineer_id?: Identifier;
  status: "in_progress" | "on_hold" | "completed" | "delayed";
  current_stage: string;
  progress_percent: number;
  contract_value: number;
  start_date: string;
  target_completion_date: string;
  actual_completion_date?: string;
  milestones: ProjectMilestone[];
  site_location: string;
  scope_summary: string;
  created_at: string;
  updated_at: string;
} & Pick<RaRecord, "id">;

export interface MeetingParticipant {
  id: string;
  userId: Identifier;
  name: string;
  role: "host" | "attendee" | "guest";
  inviteStatus: "invited" | "admitted" | "declined" | "joined" | "left" | "removed";
  guestEmail?: string;
  admittedAt?: string;
  joinedAt?: string;
  isVideoOn?: boolean;
  isMuted?: boolean;
}

export type Meeting = {
  title: string;
  tenant_id: number; // 1: Goldland, 2: Abbadi, 3: Casavera
  kind: "instant" | "scheduled" | "call";
  agenda?: string;
  host_id?: Identifier;
  project_id?: Identifier;
  lead_id?: Identifier;
  task_id?: Identifier;
  conversation_id?: number;
  scheduled_start: string;
  scheduled_end: string;
  timezone: string;
  status: "scheduled" | "live" | "ended" | "cancelled" | "missed";
  room_name?: string;
  join_code: string;
  guest_access: "off" | "waiting_room" | "open";
  max_guests: number;
  join_before_host?: boolean;
  created_by?: string;
  participants?: MeetingParticipant[];
  outcomes?: Array<{ id: string; decision: string; action_item?: string; assignee?: string }>;
  created_at: string;
  updated_at: string;
} & Pick<RaRecord, "id">;

export type DealNote = {
  deal_id: Identifier;
  text: string;
  date: string;
  sales_id: Identifier;
  attachments?: AttachmentNote[];

  // This is defined for compatibility with `ContactNote`
  status?: undefined;
  tenant_id?: number;
} & Pick<RaRecord, "id">;

export type Tag = {
  id: number;
  name: string;
  color: string;
};

export type Role = {
  id: number;
  key: string;
  label: string;
  scope_default: string;
} & Pick<RaRecord, "id">;

export type Permission = {
  id: number;
  entity: string;
  action: string;
} & Pick<RaRecord, "id">;

export type RolePermission = {
  id: number;
  role_id: number;
  permission_id: number;
  scope: string;
} & Pick<RaRecord, "id">;

export type Tenant = {
  id: number;
  name: string; // e.g. "Goldland Contracting LLC"
  legal_name: string; // e.g. "Goldland Contracting LLC"
  domain: string; // e.g. "goldlandcontracting.com"
  branding: {
    light?: string;
    dark?: string;
  };
  settings: {
    allow_whatsapp: boolean;
    allow_email: boolean;
    default_priority: string;
  };
  active: boolean;
  created_at: string;
} & Pick<RaRecord, "id">;

export type TenantMembership = {
  id: number;
  sales_id: number; // references public.sales(id)
  tenant_id: number; // references public.tenants(id)
  role_id?: number; // references public.roles(id)
  department?: string;
  job_title?: string;
  status: string; // 'provisional', 'active', 'suspended', 'ended'
  is_temporary: boolean;
  reviewed_by?: number;
  reviewed_at?: string;
  effective_from: string;
  effective_to: string;
  created_at: string;
} & Pick<RaRecord, "id">;

export type Lead = {
  id: string;
  tenant_id?: number;
  contact_id?: Identifier | null;
  company_id?: Identifier;
  source: string;
  source_meta?: any;
  service?: string;
  project_type?: string;
  location?: string;
  owner_id?: Identifier;
  stage: string;
  priority: string;
  risk_flag?: {
    type: string;
    owner: string;
    mitigation: string;
  } | null;
  next_followup_at: string;
  estimated_value?: number;
  lost_reason?: string;
  junk_reason?: string;
  normalized_phone?: string;
  normalized_email?: string;
  created_by?: Identifier;
  updated_by?: Identifier;
  created_at: string;
  updated_at: string;
} & Pick<RaRecord, "id">;

export type LeadStageHistory = {
  id: number;
  lead_id: number;
  from_stage: string;
  to_stage: string;
  changed_by?: Identifier;
  changed_at: string;
  reason?: string;
  created_at: string;
} & Pick<RaRecord, "id">;

export type WorkflowTemplate = {
  id: number;
  tenant_id: number;
  service?: string;
  stages: Array<{
    name: string;
    stage: string;
    required: boolean;
  }>;
  created_at: string;
  updated_at: string;
} & Pick<RaRecord, "id">;

export type AutomationRule = {
  id: number;
  tenant_id: number;
  trigger: string;
  conditions?: any;
  actions?: any;
  is_active: boolean;
  created_at: string;
  created_by?: Identifier;
} & Pick<RaRecord, "id">;

export type WaIdMapping = {
  id: number;
  tenant_id: number;
  user_id: Identifier;
  whatsapp_number: string;
  wa_id: string;
  is_primary: boolean;
  consented_at: string;
  created_at: string;
  updated_at: string;
};

export type WaTemplate = {
  id: number;
  tenant_id: number;
  name: string;
  category: string;
  language?: string;
  namespace?: string;
  status: string;
  components?: any;
  approval_date?: string;
  approved_by?: Identifier;
  created_at: string;
  updated_at: string;
};

export type WaConsent = {
  id: number;
  tenant_id: number;
  user_id: Identifier;
  consented: boolean;
  consent_date: string;
  expiry_date?: string;
  channel: string;
  created_at: string;
  updated_at: string;
};

export type WaMessage = {
  id: string;
  tenant_id?: number;
  wa_id?: string;
  direction: 'inbound' | 'outbound';
  phone_number_id: Identifier;
  message_id: string; // Meta message UUID
  text?: string;
  media_url?: string;
  status: string;
  template_id?: number;
  consented: boolean;
  created_at: string;
  read_at?: string;
};

export type Document = {
  id: number;
  tenant_id?: number;
  drive_file_id: string;
  name: string;
  mime: string;
  linked_type?: string;
  linked_id?: Identifier;
  created_by?: Identifier;
  created_at: string;
  updated_at: string;
};

export type DocumentAccessLog = {
  id: number;
  tenant_id: number;
  document_id: number;
  user_id: Identifier;
  action: string; // 'upload', 'download', 'share', 'unshare'
  created_at: string;
};

export type Notification = {
  id: number;
  tenant_id?: number;
  user_id: Identifier;
  type: string; // 'task_due', 'lead_assigned', 'project_status', etc.
  title: string;
  message: string;
  related_id?: Identifier; // lead_id, project_id, task_id, etc.
  related_type?: string; // 'lead', 'project', 'task'
  read: boolean;
  created_at: string;
};

export type EngagementMetric = {
  id: number;
  tenant_id?: number;
  user_id: Identifier;
  role_family?: string;
  quality?: number;
  task_delivery?: number;
  collaboration?: number;
  reliability?: number;
  learning?: number;
  attendance?: number;
  month: string; // e.g. '2026-11'
  year: number;
  score?: number;
  max_score?: number;
  approved?: boolean;
  approved_by?: Identifier;
  approved_at?: string;
  hr_comments?: string;
  created_at: string;
  updated_at: string;
};

export type SearchResourceName =
  | "companies"
  | "contacts"
  | "deals"
  | "tasks"
  | "contact_notes"
  | "deal_notes"
  | "leads"
  | "projects"
  | "tenants"
  | "roles"
  | "permissions"
  | "role_permissions"
  | "engagement_metrics"
  | "notifications"
  | "task_comments"
  | "task_events"
  | "conversations"
  | "conversation_members"
  | "messages"
  | "message_links"
  | "issue_threads";

export type SearchResult = {
  resource: SearchResourceName;
  record_id: Identifier;
  title: string | null;
  subtitle: string | null;
  contact_id: Identifier | null;
  deal_id: Identifier | null;
  tenant_id?: number | null;
  date: string | null;
  content: string | null;
};

export type Conversation = {
  id: number;
  tenant_id: number;
  type: "dm" | "channel" | "project" | "issue";
  name?: string;
  posting_policy: "everyone" | "managers_only";
  archived_at?: string;
  created_at: string;
  last_activity?: string;
  unread_count: number;
  project_name?: string;
};

export type ConversationMember = {
  id: number;
  conversation_id: number;
  user_id: Identifier;
  tenant_id: number;
  role?: "admin" | "member";
  muted?: boolean;
  last_read_at?: string;
};

export type Message = {
  id: number;
  conversation_id: number;
  sender_id: Identifier;
  body: string;
  reply_to?: number;
  edited_at?: string;
  deleted_at?: string;
  attachments: Array<{ file_name: string; file_url: string; file_type: string }>;
  created_at: string;
};

export type MessageLink = {
  id: number;
  message_id: number;
  target_type: "task" | "lead" | "project";
  target_id: number;
  created_at: string;
};

export type IssueThread = {
  id: number;
  conversation_id: number;
  reporter_id: Identifier;
  status: "open" | "resolved";
  resolved_by?: Identifier;
  resolved_at?: string;
  open_count: number;
  created_at: string;
};

export type ActivityCompanyCreated = {
  type: typeof COMPANY_CREATED;
  company_id: Identifier;
  company: Company;
  sales_id: Identifier;
  date: string;
} & Pick<RaRecord, "id">;

export type ActivityContactCreated = {
  type: typeof CONTACT_CREATED;
  company_id: Identifier;
  sales_id?: Identifier;
  contact: Contact;
  date: string;
} & Pick<RaRecord, "id">;

export type ActivityContactNoteCreated = {
  type: typeof CONTACT_NOTE_CREATED;
  sales_id?: Identifier;
  contactNote: ContactNote;
  date: string;
} & Pick<RaRecord, "id">;

export type ActivityDealCreated = {
  type: typeof DEAL_CREATED;
  company_id: Identifier;
  sales_id?: Identifier;
  deal: Deal;
  date: string;
};

export type ActivityDealNoteCreated = {
  type: typeof DEAL_NOTE_CREATED;
  sales_id?: Identifier;
  dealNote: DealNote;
  date: string;
};

export type Activity = RaRecord &
  (
    | ActivityCompanyCreated
    | ActivityContactCreated
    | ActivityContactNoteCreated
    | ActivityDealCreated
    | ActivityDealNoteCreated
  );

export interface RAFile {
  src: string;
  title: string;
  path?: string;
  rawFile: File;
  type?: string;
}

export type AttachmentNote = RAFile;

export interface LabeledValue {
  value: string;
  label: string;
}

export type DealStage = LabeledValue;

export interface NoteStatus extends LabeledValue {
  color: string;
}

export interface ContactGender {
  value: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export type SearchResourceNameV2 =
  | "companies"
  | "contacts"
  | "deals"
  | "tasks"
  | "contact_notes"
  | "deal_notes"
  | "leads"
  | "projects"
  | "tenants"
  | "roles"
  | "permissions"
  | "role_permissions"
  | "engagement_metrics"
  | "notifications";

export type Task = {
  id: Identifier;
  contact_id?: Identifier | null; // nullable: tasks can link to lead, project, or nothing
  tenant_id?: number; // optional: populated by RLS; fakerest demo data may not include it
  lead_id?: Identifier;
  project_id?: Identifier;
  creator_id?: Identifier;
  owner_id?: Identifier;
  type?: string;
  text: string;
  due_date?: string;
  done_date?: string | null;
  priority?: string; // 'normal' | 'high' | 'urgent' | 'critical'
  checklist?: any; // default '[]'::jsonb
  remind_at?: string;
  escalate_at?: string;
  source_message_id?: number;
  created_at?: string;
} & Pick<RaRecord, "id">;

export type TaskComment = {
  id: number;
  task_id: number;
  user_id: Identifier;
  text: string;
  created_at: string;
};

export type TaskEvent = {
  id: number;
  task_id: number;
  user_id?: Identifier;
  type: string; // 'status_changed', 'priority_changed', 'reminder_fired', etc.
  description?: string;
  created_at: string;
};

export type InitState = {
  is_initialized: boolean;
};

export type CrmDataProvider = {
  getList: <T = any>(resource: string, params: any) => Promise<{ data: T[]; total: number }>;
  getOne: <T = any>(resource: string, params: any) => Promise<T | null>;
  create: <T = any>(resource: string, params: any) => Promise<T>;
  update: <T = any>(resource: string, params: any) => Promise<T>;
  delete: <T = any>(resource: string, params: any) => Promise<T>;
  getApiUrl: () => string;
  getAuthHeaders: () => Record<string, string>;
};