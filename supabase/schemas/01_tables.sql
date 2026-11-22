--
-- Tables
-- This file declares all tables in the public schema.
--

-- Extensions
create extension if not exists "http" with schema "extensions";
create extension if not exists "citext" with schema "extensions";

-- Tenant isolation column added for Group CRM
alter table public.contacts add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- Tenant isolation column
alter table public.contact_notes add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- Tenant isolation column
alter table public.deals add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- Tenant isolation column
alter table public.deal_notes add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- Tasks: make contact_id nullable, add tenant_id and new columns
alter table public.tasks drop constraint if exists tasks_contact_id_fkey;
alter table public.tasks add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;
alter table public.tasks add column if not exists lead_id bigint references public.leads(id) on update cascade on delete set null;
alter table public.tasks add column if not exists project_id bigint references public.projects(id) on update cascade on delete set null;
alter table public.tasks add column if not exists creator_id uuid references auth.users(id);
alter table public.tasks add column if not exists owner_id uuid references public.sales(id);
alter table public.tasks add column if not exists priority text default 'normal' check (priority in ('normal', 'high', 'urgent', 'critical'));
alter table public.tasks add column if not exists checklist jsonb default '[]'::jsonb;
alter table public.tasks add column if not exists group_id bigint;
alter table public.tasks add column if not exists remind_at timestamp with time zone;
alter table public.tasks add column if not exists escalate_at timestamp with time zone;
alter table public.tasks add column if not exists source_message_id bigint references public.messages(id) on update cascade on delete set null;

-- Make contact_id nullable (already dropped constraint above, but ensure)
comment on column public.tasks.contact_id is 'nullable: tasks can link to lead, project, or nothing';

-- Organizations: add tenant_id for backward compatibility
alter table public.organizations add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- Messages: add tenant_id
alter table public.messages add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- Stage history: add tenant_id
alter table public.stage_history add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- Stage transitions: add tenant_id
alter table public.stage_transitions add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- Engagement scores: add tenant_id
alter table public.engagement_scores add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- Engagement evidence: add tenant_id
alter table public.engagement_evidence add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- Engagement config: add tenant_id
alter table public.engagement_config add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- Projects: add tenant_id
alter table public.projects add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- Project milestones: add tenant_id
alter table public.project_milestones add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- Site visits: add tenant_id
alter table public.site_visits add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- Project approvals: add tenant_id
alter table public.project_approvals add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- Project comments: add tenant_id
alter table public.project_comments add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- AI conversations: add tenant_id
alter table public.ai_conversations add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- AI queries: add tenant_id
alter table public.ai_queries add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- AI prompt templates: add tenant_id
alter table public.ai_prompt_templates add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- AI model config: add tenant_id
alter table public.ai_model_config add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- AI response cache: add tenant_id
alter table public.ai_response_cache add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- Communication preferences: add tenant_id
alter table public.communication_preferences add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- Notification workflows: add tenant_id
alter table public.notification_workflows add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- Email templates: add tenant_id
alter table public.email_templates add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- WhatsApp ID mappings: add tenant_id
alter table public.wa_id_mappings add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- WhatsApp templates: add tenant_id
alter table public.wa_templates add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- WhatsApp consent: add tenant_id
alter table public.wa_consent add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- WhatsApp message status: add tenant_id
alter table public.wa_message_status add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- WhatsApp sessions: add tenant_id
alter table public.wa_sessions add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- Drive shared drives: add tenant_id
alter table public.drive_shared_drives add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- Drive folders: add tenant_id
alter table public.drive_folders add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- Drive files: add tenant_id
alter table public.drive_files add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- Drive file versions: add tenant_id
alter table public.drive_file_versions add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- Drive activity log: add tenant_id
alter table public.drive_activity_log add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- Drive share links: add tenant_id
alter table public.drive_share_links add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- Drive bucket config: add tenant_id
alter table public.drive_bucket_config add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- WA bot keywords: add tenant_id
alter table public.wa_bot_keywords add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- WA bot conversations: add tenant_id
alter table public.wa_bot_conversations add column if not exists tenant_id bigint references public.tenants(id) on update cascade on delete set null;

-- Tenants (operating companies: Goldland, Abbadi Tech, Casavera)
create table public.tenants (
    id bigint generated by default as identity primary key,
    name text not null,
    legal_name text not null,
    domain extensions.citext not null unique,
    branding jsonb default '{}'::jsonb,
    settings jsonb default '{}'::jsonb,
    active boolean not null default true,
    created_at timestamp with time zone not null default now()
);

-- Seed the three operating companies
insert into public.tenants (name, legal_name, domain, branding, settings, active) values
('Goldland', 'Goldland Contracting LLC', 'goldlandcontracting.ae'::citext,
 '{"logo": "GL", "primary": "#1A1F2F", "accent": "#E0E7FF"}'::jsonb,
 '{"currency": "AED", "timezone": "Asia/Dubai"}'::jsonb, true),
('Abbadi Tech', 'Abbadi Tech Technical Services LLC', 'abbaditech.ae'::citext,
 '{"logo": "AT", "primary": "#2D3748", "accent": "#EDF2FF"}'::jsonb,
 '{"currency": "AED", "timezone": "Asia/Dubai"}'::jsonb, true),
('Casavera', 'Casavera Interiors LLC', 'casavera.ae'::citext,
 '{"logo": "CV", "primary": "#4A3298", "accent": "#F5F3FF"}'::jsonb,
 '{"currency": "AED", "timezone": "Asia/Dubai"}'::jsonb, true)
on conflict (domain) do nothing;

-- Tenant memberships (links users to tenants with roles)
create table public.tenant_memberships (
    id bigint generated by default as identity primary key,
    sales_id bigint references public.sales(id) on update cascade on delete cascade,
    tenant_id bigint references public.tenants(id) on update cascade on delete cascade,
    role_id bigint references public.roles(id),
    department text,
    job_title text,
    status text not null check (status in ('provisional','active','suspended','ended')),
    is_temporary boolean not null default false,
    reviewed_by uuid references public.sales(id),
    reviewed_at timestamp with time zone,
    effective_from timestamp with time zone not null default now(),
    effective_to timestamp with time zone,
    created_at timestamp with time zone not null default now(),
    unique (sales_id, tenant_id)
);

-- Roles (permission keys and labels)
create table public.roles (
    id bigint generated by default as identity primary key,
    key text not null unique,
    label text not null,
    scope_default text not null default 'tenant' check (scope_default in ('own','team','department','tenant','group')),
    requires_mfa boolean not null default false,
    created_at timestamp with time zone not null default now()
);

-- Seed roles - privileged roles require MFA (aal2)
insert into public.roles (key, label, scope_default, requires_mfa) values
('md', 'MD / Operations', 'group', true),
('operations', 'Operations', 'tenant', true),
('accountant', 'Accountant', 'tenant', true),
('hr', 'HR', 'tenant', true),
('admin', 'Admin', 'tenant', true),
('it', 'IT', 'tenant', true),
('designer', 'Designer', 'tenant', false),
('sales', 'Sales', 'tenant', false),
('draftsman', 'Draftsman', 'tenant', false),
('site_engineer', 'Site Engineer', 'tenant', false),
('marketing', 'Marketing', 'tenant', false),
('viewer', 'Viewer', 'tenant', false)
on conflict (key) do nothing;

-- Permissions (entity x action)
create table public.permissions (
    id bigint generated by default as identity primary key,
    entity text not null check (entity in ('leads','contacts','companies','deals','tasks','notes','tags','companies_summary','contacts_summary','deals_summary','tasks_summary','projects','engagement_scores','transactions')),
    action text not null check (action in ('read','create','update','delete','export','print','assign','change_status')),
    created_at timestamp with time zone not null default now(),
    unique (entity, action)
);

-- Role-Permission assignments (which roles get which permissions with what scope)
create table public.role_permissions (
    id bigint generated by default as identity primary key,
    role_id bigint references public.roles(id) on update cascade on delete cascade,
    permission_id bigint references public.permissions(id) on update cascade on delete cascade,
    scope text not null default 'own' check (scope in ('own','team','department','tenant','group')),
    created_at timestamp with time zone not null default now(),
    unique (role_id, permission_id, scope)
);

-- Append-only audit logs (no UPDATE or DELETE for any role; written by trigger/RPC only)
create table public.audit_logs (
    id bigint generated by default as identity primary key,
    table_name text not null,
    record_id bigint not null,
    action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
    old_data jsonb,
    new_data jsonb,
    changed_by uuid not null references auth.users(id),
    changed_at timestamp with time zone not null default now(),
    tenant_id bigint references public.tenants(id),
    constraint audit_logs_insert_only check (true) -- enforced via row level security, not constraint

-- Task comments (S3)
create table public.task_comments (
    id bigint generated by default as identity primary key,
    task_id bigint references public.tasks(id) on update cascade on delete cascade not null,
    user_id uuid references auth.users(id) on update cascade on delete cascade not null,
    text text not null,
    created_at timestamp with time zone not null default now()
);

grant all on table public.task_comments to anon;
grant all on table public.task_comments to authenticated;
grant all on table public.task_comments to service_role;

-- Task events (S3)
create table public.task_events (
    id bigint generated by default as identity primary key,
    task_id bigint references public.tasks(id) on update cascade on delete cascade not null,
    user_id uuid references auth.users(id) on update cascade on delete set null,
    type text not null check (type in ('status_changed', 'priority_changed', 'reminder_fired', 'escalated', 'completed', 'unassigned')),
    description text,
    created_at timestamp with time zone not null default now()
);

grant all on table public.task_events to anon;
grant all on table public.task_events to authenticated;
grant all on table public.task_events to service_role;

-- Task priority enum comment
comment on column public.tasks.priority is 'Priority levels: normal, high, urgent, critical';

-- Task checklist default value comment
comment on column public.tasks.checklist is 'Default: '::jsonb || '[]'::jsonb;
);

-- Leads (S2)
create table public.leads (
    id bigint generated by default as identity primary key,
    tenant_id bigint references public.tenants(id) on update cascade on delete cascade not null,
    contact_id bigint references public.contacts(id) on update cascade on delete set null,
    company_id bigint references public.organizations(id) on update cascade on delete set null,
    source text not null,
    source_meta jsonb default '{}'::jsonb,
    service text,
    project_type text,
    location text,
    owner_id uuid references public.sales(id) on update cascade on delete set null,
    stage text not null default 'NEW'
    check (stage in ('NEW', 'INITIATED', 'UNDER_FOLLOW_UP', 'WARM', 'HOT', 'COLD', 'JUNK', 'WON/CONVERTED', 'LOST')),
    priority text default 'normal' check (priority in ('normal', 'high', 'urgent', 'critical')),
    risk_flag jsonb default null,
    next_followup_at timestamp with time zone not null,
    estimated_value bigint,
    lost_reason text,
    junk_reason text,
    normalized_phone extensions.citext,
    normalized_email extensions.citext,
    created_by uuid references auth.users(id),
    updated_by uuid references auth.users(id),
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    archived_at timestamp with time zone
);

-- Lead stage history (S2)
create table public.lead_stage_history (
    id bigint generated by default as identity primary key,
    lead_id bigint references public.leads(id) on update cascade on delete cascade not null,
    from_stage text not null,
    to_stage text not null,
    changed_by uuid not null references auth.users(id),
    changed_at timestamp with time zone not null default now(),
    reason text,
    created_at timestamp with time zone not null default now()
);

grant all on table public.leads to anon;
grant all on table public.leads to authenticated;
grant all on table public.leads to service_role;

grant all on table public.lead_stage_history to anon;
grant all on table public.lead_stage_history to authenticated;
grant all on table public.lead_stage_history to service_role;

grant all on table public.tenants to anon;
grant all on table public.tenants to authenticated;
grant all on table public.tenants to service_role;

grant all on table public.tenant_memberships to anon;
grant all on table public.tenant_memberships to authenticated;
grant all on table public.tenant_memberships to service_role;

grant all on table public.roles to anon;
grant all on table public.roles to authenticated;
grant all on table public.roles to service_role;

grant all on table public.permissions to anon;
grant all on table public.permissions to authenticated;
grant all on table public.permissions to service_role;

grant all on table public.role_permissions to anon;
grant all on table public.role_permissions to authenticated;
grant all on table public.role_permissions to service_role;

grant all on table public.audit_logs to anon;
grant all on table public.audit_logs to authenticated;
grant all on table public.audit_logs to service_role;

create table public.organizations (
    id bigint generated by default as identity primary key,
    created_at timestamp with time zone not null default now(),
    name text not null,
    sector text,
    size smallint,
    linkedin_url text,
    website extensions.citext,
    phone_number text,
    address text,
    zipcode text,
    city text,
    state_abbr text,
    sales_id bigint,
    context_links json,
    country text,
    description text,
    revenue text,
    tax_identifier text,
    logo jsonb
);

create table public.contacts (
    id bigint generated by default as identity primary key,
    first_name text,
    last_name text,
    gender text,
    title text,
    background text,
    avatar jsonb,
    first_seen timestamp with time zone,
    last_seen timestamp with time zone,
    has_newsletter boolean,
    status text,
    tags bigint[],
    organization_id bigint,
    sales_id bigint,
    linkedin_url text,
    email_jsonb jsonb,
    phone_jsonb jsonb
);

create table public.contact_notes (
    id bigint generated by default as identity (sequence name public."contactNotes_id_seq") not null,
    contact_id bigint not null,
    text text,
    date timestamp with time zone default now(),
    sales_id bigint,
    status text,
    organization_id bigint references public.organizations(id) on update cascade on delete set null,
    attachments jsonb[]
);

create table public.deals (
    id bigint generated by default as identity primary key,
    name text not null,
    organization_id bigint,
    contact_ids bigint[],
    categories text[],
    stage text not null
    check (stage in ('NEW', 'INITIATED', 'UNDER_FOLLOW_UP', 'WARM', 'HOT', 'COLD', 'JUNK', 'WON', 'LOST')),
    high_risk boolean not null default false,
    description text,
    amount bigint,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    archived_at timestamp with time zone,
    expected_closing_date date,
    next_follow_up timestamp with time zone,
    reason text,
    owner_id uuid,
    converted_at timestamp with time zone,
    lead_source text,
    contacted_at timestamp with time zone,
    sales_id bigint,
    index smallint
);

create table public.deal_notes (
    id bigint generated by default as identity (sequence name public."dealNotes_id_seq") not null,
    deal_id bigint not null,
    type text,
    text text,
    date timestamp with time zone default now(),
    sales_id bigint,
    organization_id bigint references public.organizations(id) on update cascade on delete set null,
    attachments jsonb[]
);

create table public.sales (
    id bigint generated by default as identity primary key,
    first_name text not null default 'Pending'::text,
    last_name text not null default 'Pending'::text,
    email extensions.citext not null,
    administrator boolean not null,
    user_id uuid not null,
    avatar jsonb,
    disabled boolean not null default false,
    secondary_emails jsonb not null default '[]'::jsonb,
    constraint sales_secondary_emails_is_array check (jsonb_typeof(secondary_emails) = 'array')
);

create unique index uq__sales__user_id on public.sales using btree (user_id);

create table public.tags (
    id bigint generated by default as identity primary key,
    name text not null,
    color text not null
);

create table public.tasks (
    id bigint generated by default as identity primary key,
    contact_id bigint not null,
    type text,
    text text,
    due_date timestamp with time zone,
    done_date timestamp with time zone,
    priority text default 'normal' check (priority in ('normal', 'high', 'urgent', 'critical')),
    checklist jsonb default '[]'::jsonb,
    linked_lead_id bigint references public.deals(id) on update cascade on delete set null,
    linked_project_id bigint references public.projects(id) on update cascade on delete set null,
    message text,
    message_count integer default 0,
    organization_id bigint references public.organizations(id) on update cascade on delete set null,
    sales_id bigint,
    created_at timestamp with time zone not null default now()
);

create table public.configuration (
    id integer not null default 1 primary key,
    config jsonb not null default '{}'::jsonb,
    constraint configuration_singleton check (id = 1)
);

create table public.favicons_excluded_domains (
    id bigint generated by default as identity primary key,
    domain text not null
);

create table public.lead_sources (id bigint generated by default as identity primary key, name text not null, value text, organization_id bigint references public.organizations(id), created_at timestamp with time zone not null default now());

create table public.stage_transitions (id bigint generated by default as identity primary key, from_stage text not null, to_stage text not null, organization_id bigint references public.organizations(id) not null, allowed boolean not null default true, reason_required boolean not null default false, created_at timestamp with time zone not null default now(), unique (from_stage, to_stage, organization_id));

create table public.stage_history (
    id bigint generated by default as identity primary key,
    deal_id bigint not null references public.deals(id) on update cascade on delete cascade,
    from_stage text not null,
    to_stage text not null,
    changed_by uuid not null references auth.users(id),
    changed_at timestamp with time zone not null default now(),
    reason text,
    created_at timestamp with time zone not null default now()
);

create table public.user_invitations (
    user_id uuid primary key
);

create table public.audit_log (
    id bigint generated by default as identity primary key,
    table_name text not null,
    record_id bigint not null,
    action text not null check (action in ('INSERT', 'UPDATE', 'DELETE', 'PERMISSION_CHANGE', 'STAGE_CHANGE')),
    old_data jsonb,
    new_data jsonb,
    changed_by uuid not null references auth.users(id),
    changed_at timestamp with time zone not null default now(),
    reason text,
    company_id bigint references public.organizations(id)
);

grant all on table public.audit_log to authenticated;
grant all on table public.audit_log to service_role;
revoke all on table public.audit_log from anon;

-- Audit log is insert-only: revoke update/delete for authenticated
revoke update, delete on table public.audit_log from authenticated;

--
-- Foreign keys
--

alter table public.organizations
    add constraint companies_sales_id_fkey foreign key (sales_id) references public.sales(id);

alter table public.contacts
    add constraint contacts_organization_id_fkey foreign key (organization_id) references public.organizations(id) on update cascade on delete set null;

alter table public.contacts
    add constraint contacts_sales_id_fkey foreign key (sales_id) references public.sales(id);

alter table public.contact_notes
    add constraint "contactNotes_contact_id_fkey" foreign key (contact_id) references public.contacts(id) on update cascade on delete cascade;

alter table public.contact_notes
    add constraint "contactNotes_sales_id_fkey" foreign key (sales_id) references public.sales(id) on update cascade on delete cascade;

alter table public.deals
    add constraint deals_organization_id_fkey foreign key (organization_id) references public.organizations(id) on update cascade on delete cascade;

alter table public.deals
    add constraint deals_sales_id_fkey foreign key (sales_id) references public.sales(id);

alter table public.deals
    add constraint deals_owner_id_fkey foreign key (owner_id) references public.sales(id) on update cascade on delete set null;

alter table public.deal_notes
    add constraint "dealNotes_deal_id_fkey" foreign key (deal_id) references public.deals(id) on update cascade on delete cascade;

alter table public.deal_notes
    add constraint "dealNotes_sales_id_fkey" foreign key (sales_id) references public.sales(id) on update cascade on delete cascade;

alter table public.deal_notes
    add constraint "dealNotes_organization_id_fkey" foreign key (organization_id) references public.organizations(id) on update cascade on delete set null;

alter table public.sales
    add constraint sales_user_id_fkey foreign key (user_id) references auth.users(id);

alter table public.tasks
    add constraint tasks_contact_id_fkey foreign key (contact_id) references public.contacts(id) on update cascade on delete cascade;

alter table public.tasks
    add constraint tasks_organization_id_fkey foreign key (organization_id) references public.organizations(id) on update cascade on delete set null;

--
-- Legacy primary key constraint names (from before snake_case rename)
--

alter table only public.contact_notes
    add constraint "contactNotes_pkey" primary key (id);

alter table only public.deal_notes
    add constraint "dealNotes_pkey" primary key (id);

--
-- Indexes on foreign keys
--

create index contact_notes_contact_id_idx on public.contact_notes using btree (contact_id);
create index contacts_organization_id_idx on public.contacts using btree (organization_id);
create index deal_notes_deal_id_idx on public.deal_notes using btree (deal_id);
create index deals_organization_id_idx on public.deals using btree (organization_id);

create index tasks_contact_id_idx on public.tasks using btree (contact_id);
create index tasks_organization_id_idx on public.tasks using btree (organization_id);
create index tasks_linked_lead_id_idx on public.tasks using btree (linked_lead_id);
create index tasks_linked_project_id_idx on public.tasks using btree (linked_project_id);

create table public.messages (
    id bigint generated by default as identity primary key,
    organization_id bigint references public.organizations(id) on update cascade on delete set null,
    thread_id bigint references public.messages(id),
    parent_id bigint references public.messages(id),
    sender_id uuid not null references auth.users(id),
    recipient_id uuid references auth.users(id),
    channel_type text not null check (channel_type in ('direct', 'group', 'channel', 'thread')),
    channel_id bigint,
    subject text,
    text text not null,
    timestamp timestamp with time zone not null default now(),
    edited_at timestamp with time zone,
    deleted_at timestamp with time zone,
    read_by uuid[],
    reactions jsonb default '[]'::jsonb,
    mentions jsonb default '[]'::jsonb,
    replies_count integer default 0,
    deleted boolean default false
);

create index idx_messages_organization_id on public.messages (organization_id);
create index idx_messages_thread_id on public.messages (thread_id);
create index idx_messages_parent_id on public.messages (parent_id);
create index idx_messages_channel_id on public.messages (channel_id);
create index idx_messages_sender_id on public.messages (sender_id);
create index idx_messages_recipient_id on public.messages (recipient_id);
create index idx_messages_channel_type on public.messages (channel_type);
create index idx_messages_deleted on public.messages (deleted);
create index idx_messages_timestamp on public.messages (timestamp desc);

-- Realtime channel policies will be set via Supabase dashboard or migration
-- Organizations can only message within their organization
-- Direct messages between users in the same organization
-- Group channels for departments
-- Threaded replies on messages

-- Comment threads on deals
create table public.deal_message_threads (
    id bigint generated by default as identity primary key,
    deal_id bigint not null references public.deals(id) on update cascade on delete cascade,
    organization_id bigint references public.organizations(id) on update cascade on delete set null,
    root_message_id bigint references public.messages(id),
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create index idx_deal_message_threads_deal_id on public.deal_message_threads (deal_id);
create index idx_deal_message_threads_org_id on public.deal_message_threads (organization_id);

-- Comment threads on tasks
create table public.task_message_threads (
    id bigint generated by default as identity primary key,
    task_id bigint not null references public.tasks(id) on update cascade on delete cascade,
    organization_id bigint references public.organizations(id) on update cascade on delete set null,
    root_message_id bigint references public.messages(id),
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create index idx_task_message_threads_task_id on public.task_message_threads (task_id);
create index idx_task_message_threads_org_id on public.task_message_threads (organization_id);

-- Comment threads on projects (when S10 is implemented)
create table public.project_message_threads (
    id bigint generated by default as identity primary key,
    project_id bigint references public.projects(id) on update cascade on delete set null,
    organization_id bigint references public.organizations(id) on update cascade on delete set null,
    root_message_id bigint references public.messages(id),
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create index idx_project_message_threads_project_id on public.project_message_threads (project_id);
create index idx_project_message_threads_org_id on public.project_message_threads (organization_id);

-- WhatsApp Integration Tables

-- Maps Supabase user IDs to WhatsApp phone numbers
create table public.wa_id_mappings (
    id bigint generated by default as identity primary key,
    organization_id bigint references public.organizations(id) on update cascade on delete cascade,
    tenant_id bigint references public.tenants(id) on update cascade on delete set null,
    user_id uuid not null references auth.users(id) on update cascade on delete cascade,
    whatsapp_number text not null check (whatsapp_number ~* '^\+[1-9]\d{1,14}$'),
    wa_id text not null unique,
    is_primary boolean default true,
    consented_at timestamp with time zone not null default now(),
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create unique index idx_wa_id_mappings_organization_id on public.wa_id_mappings (organization_id, user_id);
create unique index idx_wa_id_mappings_wa_id on public.wa_id_mappings (wa_id);

-- Messenger / Chat Tables

-- Conversations (channels, issue threads, project chats, DMs)
create table public.conversations (
    id bigint generated by default as identity primary key,
    tenant_id bigint references public.tenants(id) on update cascade on delete cascade not null,
    type text not null check (type in ('dm', 'channel', 'project', 'issue')),
    project_id bigint references public.projects(id) on update cascade on delete set null,
    name text,
    posting_policy text not null default 'everyone' check (posting_policy in ('everyone', 'managers_only')),
    archived_at timestamp with time zone,
    created_at timestamp with time zone not null default now()
);

create index idx_conversations_tenant_id on public.conversations (tenant_id);
create index idx_conversations_project_id on public.conversations (project_id);

-- Conversation members
create table public.conversation_members (
    id bigint generated by default as identity primary key,
    conversation_id bigint references public.conversations(id) on update cascade on delete cascade not null,
    user_id uuid references auth.users(id) on update cascade on delete cascade not null,
    role text not null default 'member' check (role in ('admin', 'member')),
    last_read_at timestamp with time zone,
    muted boolean default false,
    unique (conversation_id, user_id)
);

create index idx_conversation_members_conversation_id on public.conversation_members (conversation_id);
create index idx_conversation_members_user_id on public.conversation_members (user_id);

-- Messages
create table public.messages (
    id bigint generated by default as identity primary key,
    conversation_id bigint references public.conversations(id) on update cascade on delete cascade not null,
    sender_id uuid references auth.users(id) on update cascade on delete set null,
    body text,
    reply_to bigint references public.messages(id) on update cascade on delete set null,
    edited_at timestamp with time zone,
    deleted_at timestamp with time zone,
    attachments jsonb default '[]'::jsonb,
    created_at timestamp with time zone not null default now()
);

create index idx_messages_conversation_id on public.messages (conversation_id);
create index idx_messages_sender_id on messages (sender_id);

-- Message links (associate messages with tasks, leads, projects)
create table public.message_links (
    id bigint generated by default as identity primary key,
    message_id bigint references public.messages(id) on update cascade on delete cascade not null,
    target_type text not null check (target_type in ('task', 'lead', 'project')),
    target_id bigint not null,
    created_at timestamp with time zone not null default now()
);

create index idx_message_links_message_id on public.message_links (message_id);
create index idx_message_links_target on public.message_links (target_type, target_id);

-- Issue threads (for Technical Issues channel)
create table public.issue_threads (
    id bigint generated by default as identity primary key,
    conversation_id bigint references public.conversations(id) on update cascade on delete cascade not null,
    reporter_id uuid references auth.users(id) on update cascade on delete set null,
    status text not null default 'open' check (status in ('open', 'resolved')),
    resolved_by uuid references auth.users(id) on update cascade on delete set null,
    resolved_at timestamp with time zone,
    open_count integer default 0,
    created_at timestamp with time zone not null default now()
);

create index idx_issue_threads_conversation_id on public.issue_threads (conversation_id);
create index idx_issue_threads_status on public.issue_threads (status);

-- Grant permissions
grant all on table public.conversations to authenticated;
grant all on table public.conversation_members to authenticated;
grant all on table public.messages to authenticated;
grant all on table public.message_links to authenticated;
grant all on table public.issue_threads to authenticated;

-- Row level security policies will be added in 05_policies.sql

-- WhatsApp message templates (must be approved by Meta)
create table public.wa_templates (
    id bigint generated by default as identity primary key,
    organization_id bigint references public.organizations(id) on update cascade on delete set null,
    name text not null,
    category text not null check (category in ('marketing', 'utility', 'authentication', 'service')),
    language text not null default 'en_US',
    namespace text, -- Official Meta namespace for approved templates
    status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'withdrawn')),
    components jsonb, -- Template components (variables, buttons, etc.)
    approval_date timestamp with time zone,
    approved_by uuid references auth.users(id),
    rejection_reason text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create index idx_wa_templates_org_id on public.wa_templates (organization_id);
create index idx_wa_templates_status on public.wa_templates (status);

-- User consent for WhatsApp communication
create table public.wa_consent (
    id bigint generated by default as identity primary key,
    organization_id bigint references public.organizations(id) on update cascade on delete cascade,
    user_id uuid not null references auth.users(id) on update cascade on delete cascade,
    consented boolean default true,
    consent_date timestamp with time zone not null default now(),
    expiry_date timestamp with time zone,
    channel text not null check (channel in ('whatsapp', 'sms', 'email')),
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    UNIQUE (organization_id, user_id, channel)
);

create index idx_wa_consent_org_id on public.wa_consent (organization_id);
create index idx_wa_consent_user_id on public.wa_consent (user_id);

-- WhatsApp message status tracking
create table public.wa_message_status (
    id bigint generated by default as identity primary key,
    organization_id bigint references public.organizations(id) on update cascade on delete set null,
    message_id text not null, -- Meta message UUID
    supabase_message_id bigint references public.messages(id),
    to_number text not null,
    status text not null check (status in ('pending', 'sent', 'delivered', 'read', 'failed', ' rejected')),
    error_code text,
    error_message text,
    api_response jsonb,
    sent_at timestamp with time zone,
    delivered_at timestamp with time zone,
    read_at timestamp with time zone,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create index idx_wa_message_status_org_id on public.wa_message_status (organization_id);
create index idx_wa_message_status_message_id on public.wa_message_status (message_id);
create index idx_wa_message_status_to_number on public.wa_message_status (to_number);
create index idx_wa_message_status_status on public.wa_message_status (status);

-- WhatsApp sessions (active connections)
create table public.wa_sessions (
    id bigint generated by default as identity primary key,
    organization_id bigint references public.organizations(id) on update cascade on delete cascade,
    wa_id text not null,
    access_token text not null,
    refresh_token text,
    expires_at timestamp with time zone not null,
    platform text not null check (platform in ('cloud_api', 'on_premises')),
    status text not null default 'active' check (status in ('active', 'paused', 'expired', 'revoked')),
    metadata jsonb,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    UNIQUE (organization_id, wa_id)
);

create index idx_wa_sessions_org_id on public.wa_sessions (organization_id);
create index idx_wa_sessions_status on public.wa_sessions (status);

-- WhatsApp audit log (insert-only for compliance)
create table public.wa_audit_log (
    id bigint generated by default as identity primary key,
    organization_id bigint references public.organizations(id) on update cascade on delete set null,
    action text not null check (action in ('template_created', 'template_approved', 'template_rejected', 'message_sent', 'message_delivered', 'message_read', 'consent_given', 'consent_revoked', 'wa_id_created', 'wa_id_deleted')),
    details jsonb,
    user_id uuid references auth.users(id),
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone not null default now()
);

-- Insert-only policy for audit log
alter table public.wa_audit_log enable row level security;
create policy "wa_audit_log_insert_only" on public.wa_audit_log
    using (true)
    with check (true);

-- Drive Integration (Shared Drives, folders, files, permissions)

-- Shared Drives (one per organization, for file segregation)
create table public.drive_shared_drives (
    id bigint generated by default as identity primary key,
    organization_id bigint references public.organizations(id) on update cascade on delete cascade,
    name text not null,
    storage_limit_bytes bigint,
    used_bytes bigint default 0,
    status text not null default 'active' check (status in ('active', 'paused', 'deleted')),
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    UNIQUE (organization_id)
);

create index idx_drive_shared_drives_org_id on public.drive_shared_drives (organization_id);

-- Folders within Shared Drives
create table public.drive_folders (
    id bigint generated by default as identity primary key,
    shared_drive_id bigint references public.drive_shared_drives(id) on update cascade on delete cascade,
    organization_id bigint references public.organizations(id) on update cascade on delete set null,
    name text not null,
    parent_id bigint references public.drive_folders(id) on update cascade on delete set null,
    path text not null,
    storage_bytes bigint default 0,
    type text not null check (type in ('shared_drive', 'folder', 'file')),
    owner_id uuid references auth.users(id),
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create index idx_drive_folders_shared_drive_id on public.drive_folders (shared_drive_id);
create index idx_drive_folders_parent_id on public.drive_folders (parent_id);
create index idx_drive_folders_org_id on public.drive_folders (organization_id);
create index idx_drive_folders_path on public.drive_folders (path);
create index idx_drive_folders_type on public.drive_folders (type);

-- File metadata and tracking (audited)
create table public.drive_files (
    id bigint generated by default as identity primary key,
    shared_drive_id bigint references public.drive_shared_drives(id) on update cascade on delete cascade,
    folder_id bigint references public.drive_folders(id) on update cascade on delete set null,
    organization_id bigint references public.organizations(id) on update cascade on delete set null,
    name text not null,
    original_name text,
    size_bytes bigint default 0,
    mime_type text,
    storage_id text not null, -- Supabase Storage file ID
    path text not null,
    version integer default 1,
    is_folder boolean default false,
    parent_version_id bigint references public.drive_files(id),
    md5 hash,
    sha256 hash,
    permissions jsonb default '{"read": [], "write": [], "delete": []}'::jsonb,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    created_by uuid references auth.users(id)
);

create index idx_drive_files_shared_drive_id on public.drive_files (shared_drive_id);
create index idx_drive_files_folder_id on public.drive_files (folder_id);
create index idx_drive_files_org_id on public.drive_files (organization_id);
create index idx_drive_files_path on public.drive_files (path);
create index idx_drive_files_mime_type on public.drive_files (mime_type);
create index idx_drive_files_version on public.drive_files (version);
create index idx_drive_files_created_by on public.drive_files (created_by);

-- File version history
create table public.drive_file_versions (
    id bigint generated by default as identity primary key,
    file_id bigint references public.drive_files(id) on update cascade on delete cascade,
    version integer not null,
    size_bytes bigint default 0,
    md5 hash,
    sha256 hash,
    storage_version_id text, -- Supabase Storage version ID
    change_description text,
    created_at timestamp with time zone not null default now(),
    created_by uuid references auth.users(id)
);

create index idx_drive_file_versions_file_id on public.drive_file_versions (file_id);
create index idx_drive_file_versions_version on public.drive_file_versions (version);

-- File activity log (insert-only for audit trail)
create table public.drive_activity_log (
    id bigint generated by default as identity primary key,
    organization_id bigint references public.organizations(id) on update cascade on delete set null,
    file_id bigint references public.drive_files(id),
    action text not null check (action in ('upload', 'download', 'rename', 'move', 'copy', 'delete', 'share', 'unshare', 'version_restore', 'permissions_update')),
    user_id uuid references auth.users(id),
    ip_address inet,
    user_agent text,
    details jsonb,
    created_at timestamp with time zone not null default now()
);

-- Insert-only policy for drive activity log
alter table public.drive_activity_log enable row level security;
create policy "drive_activity_log_insert_only" on public.drive_activity_log
    using (true)
    with check (true);

-- File sharing links
create table public.drive_share_links (
    id bigint generated by default as identity primary key,
    file_id bigint references public.drive_files(id) on update cascade on delete cascade,
    organization_id bigint references public.organizations(id) on update cascade on delete set null,
    share_token text unique not null,
    expires_at timestamp with time zone,
    role text not null check (role in ('view', 'edit', 'owner')),
    password protected,
    created_at timestamp with time zone not null default now(),
    created_by uuid references auth.users(id),
    access_count integer default 0,
    last_accessed_at timestamp with time zone
);

create index idx_drive_share_links_file_id on public.drive_share_links (file_id);
create index idx_drive_share_links_org_id on public.drive_share_links (organization_id);
create index idx_drive_share_links_token on public.drive_share_links (share_token);

-- Storage bucket configuration reference
create table public.drive_bucket_config (
    id bigint generated by default as identity primary key,
    organization_id bigint references public.organizations(id) on update cascade on delete cascade,
    bucket_name text not null,
    allowed_mime_types jsonb default '["*"]'::jsonb,
    max_size_bytes bigint,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    UNIQUE (organization_id)
);

create index idx_drive_bucket_config_org_id on public.drive_bucket_config (organization_id);

-- Projects (S10)
-- Organization-Scoped Projects with milestones, site visits, and approvals

-- Projects table
create table public.projects (
    id bigint generated by default as identity primary key,
    organization_id bigint references public.organizations(id) on update cascade on delete cascade,
    name text not null,
    description text,
    status text not null default 'active' check (status in ('active', 'on_hold', 'completed', 'cancelled')),
    pipeline_stage text not null default 'prospect' check (pipeline_stage in ('prospect', 'qualification', 'proposal', 'negotiation', 'closing', 'won', 'lost')),
    deal_value numeric(15, 2),
    currency text not null default 'AED',
    start_date date,
    end_date date,
    address text,
    site_visit_count integer default 0,
    max_site_visits integer default 3,
    close_date date,
    probability integer default 0 check (probability >= 0 and probability <= 100),
    expected_value numeric(15, 2) generated always as (deal_value * probability / 100) stored,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    created_by uuid references auth.users(id)
);

create index idx_projects_org_id on public.projects (organization_id);
create index idx_projects_status on public.projects (status);
create index idx_projects_pipeline_stage on public.projects (pipeline_stage);
create index idx_projects_created_by on public.projects (created_by);

-- Project milestones
create table public.project_milestones (
    id bigint generated by default as identity primary key,
    project_id bigint references public.projects(id) on update cascade on delete cascade,
    organization_id bigint references public.organizations(id) on update cascade on delete set null,
    name text not null,
    description text,
    target_date date,
    actual_date date,
    status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'missed')),
    order_index integer default 0,
    deliverable text,
    notes text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    created_by uuid references auth.users(id)
);

create index idx_project_milestones_project_id on public.project_milestones (project_id);
create index idx_project_milestones_org_id on public.project_milestones (organization_id);
create index idx_project_milestones_status on public.project_milestones (status);
create index idx_project_milestones_target_date on public.project_milestones (target_date);

-- Site visits
create table public.site_visits (
    id bigint generated by default as identity primary key,
    project_id bigint references public.projects(id) on update cascade on delete cascade,
    organization_id bigint references public.organizations(id) on update cascade on delete set null,
    visit_date timestamp with time zone not null,
    location text,
    purpose text,
    attendees jsonb default '[]'::jsonb,
    findings text,
    photos jsonb default '[]'::jsonb,
    next_steps text,
    status text not null default 'completed' check (status in ('scheduled', 'completed', 'cancelled')),
    created_at timestamp with time zone not null default now(),
    created_by uuid references auth.users(id)
);

create index idx_site_visits_project_id on public.site_visits (project_id);
create index idx_site_visits_org_id on public.site_visits (organization_id);
create index idx_site_visits_date on public.site_visits (visit_date);

-- Project approvals tracker
create table public.project_approvals (
    id bigint generated by default as identity primary key,
    project_id bigint references public.projects(id) on update cascade on delete cascade,
    organization_id bigint references public.organizations(id) on update cascade on delete set null,
    approver_id uuid references auth.users(id),
    approver_role text,
    approval_type text not null check (approval_type in ('budget', 'scope', 'timeline', 'legal', 'compliance')),
    approved boolean default false,
    approval_date timestamp with time zone,
    comments text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create index idx_project_approvals_project_id on public.project_approvals (project_id);
create index idx_project_approvals_org_id on public.project_approvals (organization_id);
create index idx_project_approvals_approver_id on public.project_approvals (approver_id);
create index idx_project_approvals_type on public.project_approvals (approval_type);
create index idx_project_approvals_approved on public.project_approvals (approved);

-- Project comments/notes (threaded, organization-scoped)
create table public.project_comments (
    id bigint generated by default as identity primary key,
    project_id bigint references public.projects(id) on update cascade on delete cascade,
    organization_id bigint references public.organizations(id) on update cascade on delete set null,
    parent_id bigint references public.project_comments(id) on update cascade on delete set null,
    user_id uuid references auth.users(id),
    text text not null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create index idx_project_comments_project_id on public.project_comments (project_id);
create index idx_project_comments_parent_id on public.project_comments (parent_id);
create index idx_project_comments_org_id on public.project_comments (organization_id);
create index idx_project_comments_created_at on public.project_comments (created_at desc);

-- Realtime channel policies for projects will enforce organization membership
-- Only members of an organization can access project data within that organization

-- Engagement Score (S12)
-- Monthly role-family-adjusted engagement scoring with evidence links and approval

-- Engagement scores per user per month
create table public.engagement_scores (
    id bigint generated by default as identity primary key,
    organization_id bigint references public.organizations(id) on update cascade on delete cascade,
    user_id uuid references auth.users(id) on update cascade on delete cascade,
    month date not null, -- First day of the month (e.g., 2026-11-01)
    year integer not null,
    month_integer integer not null check (month_integer >= 1 and month_integer <= 12),
    score integer default 0 check (score >= 0 and score <= 100),
    max_score integer default 100,
    role_family text not null default 'general' check (role_family in ('general', 'management', 'sales', 'support', 'admin')),
    department text,
    evidence_links jsonb default '[]'::jsonb, -- Links to activities, notes, deals, projects
    evidence_count integer default 0,
    approved boolean default false,
    approved_by uuid references auth.users(id),
    approved_at timestamp with time zone,
    hr_comments text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    UNIQUE (organization_id, user_id, month)
);

create index idx_engagement_scores_org_id on public.engagement_scores (organization_id);
create index idx_engagement_scores_user_id on public.engagement_scores (user_id);
create index idx_engagement_scores_month on public.engagement_scores (month);
create index idx_engagement_scores_role on public.engagement_scores (role_family);

-- Engagement evidence log (activities that contribute to score)
create table public.engagement_evidence (
    id bigint generated by default as identity primary key,
    organization_id bigint references public.organizations(id) on update cascade on delete cascade,
    user_id uuid references auth.users(id) on update cascade on delete cascade,
    engagement_score_id bigint references public.engagement_scores(id) on delete cascade,
    activity_type text not null check (activity_type in ('task_completed', 'deal_won', 'deal_lost', 'project_milestone', 'site_visit', 'note_created', 'contact_made', 'call_made', 'email_sent', 'meeting_held')),
    activity_id bigint, -- ID of the related record (task_id, deal_id, project_id, etc.)
    details jsonb default '{}'::jsonb,
    contributed_points integer default 0,
    created_at timestamp with time zone not null default now()
);

create index idx_engagement_evidence_org_id on public.engagement_evidence (organization_id);
create index idx_engagement_evidence_user_id on public.engagement_evidence (user_id);
create index idx_engagement_evidence_score_id on public.engagement_evidence (engagement_score_id);
create index idx_engagement_evidence_activity_type on public.engagement_evidence (activity_type);

-- HR/Management approval queue
create table public.engagement_approvals (
    id bigint generated by default as identity primary key,
    engagement_score_id bigint references public.engagement_scores(id) on delete cascade,
    reviewer_id uuid references auth.users(id),
    reviewer_role text not null check (reviewer_role in ('hr', 'management', 'director')),
    approved boolean default false,
    review_date timestamp with time zone,
    comments text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create index idx_engagement_approvals_score_id on public.engagement_approvals (engagement_score_id);
create index idx_engagement_approvals_reviewer_id on public.engagement_approvals (reviewer_id);
create index idx_engagement_approvals_approved on public.engagement_approvals (approved);

-- Engagement score configuration per organization
create table public.engagement_config (
    id bigint generated by default as identity primary key,
    organization_id bigint references public.organizations(id) on update cascade on delete cascade,
    weight_tasks integer default 10 check (weight_tasks >= 0 and weight_tasks <= 50),
    weight_deals integer default 20 check (weight_deals >= 0 and weight_deals <= 50),
    weight_projects integer default 10 check (weight_projects >= 0 and weight_projects <= 50),
    weight_communication integer default 15 check (weight_communication >= 0 and weight_communication <= 50),
    weight_attendance integer default 5 check (weight_attendance >= 0 and weight_attendance <= 25),
    min_activities integer default 1 check (min_activities >= 1),
    max_activities integer default 100 check (max_activities >= 1),
    active boolean default true,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    UNIQUE (organization_id)
);

create index idx_engagement_config_org_id on public.engagement_config (organization_id);

-- Engagement score history (for trend analysis)
create table public.engagement_score_history (
    id bigint generated by default as identity primary key,
    organization_id bigint references public.organizations(id) on update cascade on delete cascade,
    user_id uuid references auth.users(id) on update cascade on delete cascade,
    month date not null,
    score integer not null,
    role_family text not null,
    changed_by uuid references auth.users(id),
    change_reason text,
    changed_at timestamp with time zone not null default now()
);

create index idx_engagement_score_history_org_id on public.engagement_score_history (organization_id);
create index idx_engagement_score_history_user_id on public.engagement_score_history (user_id);
create index idx_engagement_score_history_month on public.engagement_score_history (month);

-- Insert-only audit log for engagement score changes
create table public.engagement_audit_log (
    id bigint generated by default as identity primary key,
    organization_id bigint references public.organizations(id) on update cascade on delete set null,
    action text not null check (action in ('score_created', 'score_updated', 'evidence_added', 'evidence_removed', 'approved', 'rejected', 'config_updated')),
    details jsonb,
    user_id uuid references auth.users(id),
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone not null default now()
);

-- Insert-only policy for engagement audit log
alter table public.engagement_audit_log enable row level security;
create policy "engagement_audit_log_insert_only" on public.engagement_audit_log
    using (true)
    with check (true);

-- AI Assistant (S13)
-- Read-only JWT-based assistant, source-showing, prompt-injection resistant, no autonomous writes

-- AI conversation history
create table public.ai_conversations (
    id bigint generated by default as identity primary key,
    organization_id bigint references public.organizations(id) on update cascade on delete cascade,
    user_id uuid references auth.users(id) on update cascade on delete cascade,
    title text not null,
    model text not null check (model in ('gpt-4o-mini', 'gpt-4o', 'claude-3-haiku', 'claude-3-sonnet')),
    purpose text not null check (purpose in ('general', 'deal_support', 'contact_support', 'project_support', 'hr_query')),
    is_private boolean default false,
    token_count integer default 0,
    total_score integer default 0, -- engagement score referenced
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create index idx_ai_conversations_org_id on public.ai_conversations (organization_id);
create index idx_ai_conversations_user_id on public.ai_conversations (user_id);
create index idx_ai_conversations_created on public.ai_conversations (created_at desc);

-- AI query log (audited, for source tracking and cost monitoring)
create table public.ai_queries (
    id bigint generated by default as identity primary key,
    organization_id bigint references public.organizations(id) on update cascade on delete cascade,
    conversation_id bigint references public.ai_conversations(id) on delete cascade,
    user_id uuid references auth.users(id) on update cascade on delete cascade,
    query_text text not null,
    response_text text,
    tokens_used integer default 0,
    cost_cents integer default 0,
    status text not null default 'completed' check (status in ('completed', 'failed', 'cancelled')),
    source_references jsonb default '[]'::jsonb, -- Which records were referenced (table, id, field)
    evidence jsonb default '{}'::jsonb, -- Supporting data from CRM
    created_at timestamp with time zone not null default now()
);

create index idx_ai_queries_org_id on public.ai_queries (organization_id);
create index idx_ai_queries_conversation_id on public.ai_queries (conversation_id);
create index idx_ai_queries_user_id on public.ai_queries (user_id);
create index idx_ai_queries_created on public.ai_queries (created_at desc);
create index idx_ai_queries_status on public.ai_queries (status);

-- AI prompt templates (approved, organization-scoped)
create table public.ai_prompt_templates (
    id bigint generated by default as identity primary key,
    organization_id bigint references public.organizations(id) on update cascade on delete set null,
    name text not null,
    category text not null check (category in ('general', 'deal_support', 'contact_support', 'project_support', 'hr_query', 'reporting')),
    description text,
    prompt_text text not null, -- The template prompt (must not contain user-controlled data injection)
    variables jsonb default '{}'::jsonb, -- Allowed variable substitutions (closed list)
    is_active boolean default true,
    usage_count integer default 0,
    last_used_at timestamp with time zone,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    UNIQUE (organization_id, name)
);

create index idx_ai_prompt_templates_org_id on public.ai_prompt_templates (organization_id);
create index idx_ai_prompt_templates_category on public.ai_prompt_templates (category);
create index idx_ai_prompt_templates_active on public.ai_prompt_templates (is_active);

-- AI model configuration per organization
create table public.ai_model_config (
    id bigint generated by default as identity primary key,
    organization_id bigint references public.organizations(id) on update cascade on delete cascade,
    default_model text not null check (default_model in ('gpt-4o-mini', 'gpt-4o', 'claude-3-haiku', 'claude-3-sonnet')),
    max_tokens integer default 4000 check (max_tokens > 0 and max_tokens <= 32000),
    temperature numeric default 0.7 check (temperature >= 0 and temperature <= 1),
    system_prompt text, -- System prompt (static, no user data injection)
    allowed_data_sources jsonb default '["contacts", "deals", "tasks", "projects", "notes"]'::jsonb,
    forbidden_patterns jsonb default '[]'::jsonb, -- Regex patterns to block in user input
    active boolean default true,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    UNIQUE (organization_id)
);

create index idx_ai_model_config_org_id on public.ai_model_config (organization_id);

-- AI response cache (for performance, automatically TTL'd)
create table public.ai_response_cache (
    id bigint generated by default as identity primary key,
    organization_id bigint references public.organizations(id) on update cascade on delete cascade,
    conversation_id bigint references public.ai_conversations(id) on delete cascade,
    query_hash text not null, -- SHA256 hash of query text
    response_text text not null,
    tokens_used integer default 0,
    cached_at timestamp with time zone not null default now(),
    expires_at timestamp with time zone not null
);

create index idx_ai_response_cache_org_id on public.ai_response_cache (organization_id);
create index idx_ai_response_cache_hash on public.ai_response_cache (query_hash);
create index idx_ai_response_cache_expires on public.ai_response_cache (expires_at);

-- Prompt injection attempt log (audited)
create table public.ai_prompt_injection_log (
    id bigint generated by default as identity primary key,
    organization_id bigint references public.organizations(id) on update cascade on delete set null,
    user_id uuid references auth.users(id),
    attempt_text text not null,
    detected_pattern text,
    blocked boolean default true,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone not null default now()
);

-- Insert-only policy for prompt injection log
alter table public.ai_prompt_injection_log enable row level security;
create policy "ai_prompt_injection_log_insert_only" on public.ai_prompt_injection_log
    using (true)
    with check (true);

-- Communication preferences (S16+)
-- User opt-in settings for email/SMS notifications
create table public.communication_preferences (
    id bigint generated by default as identity primary key,
    organization_id bigint references public.organizations(id) on update cascade on delete cascade,
    user_id uuid references auth.users(id) on update cascade on delete cascade,
    can_receive_email boolean default true,
    can_receive_sms boolean default true,
    email_frequency text default 'normal' check (email_frequency in ('normal', 'digest', 'off')),
    sms_frequency text default 'normal' check (sms_frequency in ('normal', 'digest', 'off')),
    preferred_contact_method text default 'email' check (preferred_contact_method in ('email', 'sms', 'whatsapp', 'none')),
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    UNIQUE (organization_id, user_id)
);

create index idx_communication_preferences_org_id on public.communication_preferences (organization_id);
create index idx_communication_preferences_user_id on public.communication_preferences (user_id);

-- Notification Workflows (S17+)
-- Automated cross-channel notification rules
create table public.notification_workflows (
    id bigint generated by default as identity primary key,
    organization_id bigint references public.organizations(id) on update cascade on delete cascade,
    name text not null,
    description text,
    trigger_type text not null check (trigger_type in ('task_due', 'deal_stage_change', 'deal_won', 'deal_lost', 'milestone_missed', 'site_visit_reminder', 'comment_mention', 'custom')),
    trigger_condition jsonb, -- Conditions for when the workflow activates (e.g., { "deal_stage": "WON", "probability": "> 80" })
    action_channel text not null check (action_channel in ('email', 'sms', 'whatsapp', 'all')),
    action_template_id bigint references public.email_templates(id) on delete set null,
    action_sms_template text, -- Inline SMS template if channel is sms
    is_active boolean default true,
    schedule_type text default 'immediate' check (schedule_type in ('immediate', 'delayed', 'cron')),
    schedule_delay_minutes integer default 0 check (schedule_delay_minutes >= 0),
    cron_expression text, -- For cron schedule type (e.g., "0 9 * * 1-5" for 9am weekdays)
    execution_count integer default 0,
    last_triggered_at timestamp with time zone,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    UNIQUE (organization_id, name)
);

create index idx_notification_workflows_org_id on public.notification_workflows (organization_id);
create index idx_notification_workflows_trigger on public.notification_workflows (trigger_type);
create index idx_notification_workflows_active on public.notification_workflows (is_active);
create index idx_notification_workflows_cron on public.notification_workflows (cron_expression);

-- Email Templates (S17+)
-- Organization-scoped email templates with variable substitution
create table public.email_templates (
    id bigint generated by default as identity primary key,
    organization_id bigint references public.organizations(id) on update cascade on delete cascade,
    name text not null,
    category text not null check (category in ('welcome', 'notification', 'marketing', 'follow_up', 'reminder', 'custom')),
    description text,
    subject_template text not null, -- Subject with {{variable}} support
    html_template text, -- HTML version with {{variable}} support
    text_template text, -- Plain text version with {{variable}} support
    variables jsonb default '[]'::jsonb, -- Allowed variable names
    usage_count integer default 0,
    last_used_at timestamp with time zone,
    is_active boolean default true,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    UNIQUE (organization_id, name)
);

create index idx_email_templates_org_id on public.email_templates (organization_id);
create index idx_email_templates_category on public.email_templates (category);
create index idx_email_templates_active on public.email_templates (is_active);

-- WhatsBot Automation (S17+)
-- Keyword triggers and conversation state tracking

-- Bot keywords table
create table public.wa_bot_keywords (
    id bigint generated by default as identity primary key,
    organization_id bigint references public.organizations(id) on update cascade on delete cascade,
    keyword text not null check (keyword ~* '^[a-zA-Z0-9\s]+$'),
    response_type text not null check (response_type in ('message', 'away', 'redirect', 'escalate')),
    response_text text,
    response_template text, -- Template with {{variable}} substitution
    variables jsonb default '[]'::jsonb, -- Allowed variable names
    case_sensitive boolean default false,
    priority integer default 0 check (priority >= 0 and priority <= 100),
    is_active boolean default true,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    UNIQUE (organization_id, keyword)
);

create index idx_wa_bot_keywords_org_id on public.wa_bot_keywords (organization_id);
create index idx_wa_bot_keywords_active on public.wa_bot_keywords (is_active);
create index idx_wa_bot_keywords_priority on public.wa_bot_keywords (priority desc);

-- Bot conversation states
create table public.wa_bot_conversations (
    id bigint generated by default as identity primary key,
    organization_id bigint references public.organizations(id) on update cascade on delete cascade,
    wa_id text not null,
    user_phone text not null,
    state text default 'start' check (state in ('start', 'awaiting_input', 'confirmed', 'error')),
    current_keyword text,
    last_interaction timestamp with time zone not null default now(),
    interaction_count integer default 0,
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    UNIQUE (organization_id, wa_id)
);

create index idx_wa_bot_conversations_org_id on public.wa_bot_conversations (organization_id);
create index idx_wa_bot_conversations_wa_id on public.wa_bot_conversations (wa_id);
create index idx_wa_bot_conversations_state on public.wa_bot_conversations (state);

-- Bot responses (away messages, scheduled, etc.)
create table public.wa_bot_responses (
    id bigint generated by default as identity primary key,
    organization_id bigint references public.organizations(id) on update cascade on delete cascade,
    keyword_id bigint references public.wa_bot_keywords(id) on delete set null,
    name text not null,
    response_text text not null,
    is_away_message boolean default false,
    active_hours_start time,
    active_hours_end time,
    time_zone text default 'UTC',
    is_active boolean default true,
    usage_count integer default 0,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create index idx_wa_bot_responses_org_id on public.wa_bot_responses (organization_id);
create index idx_wa_bot_responses_keyword_id on public.wa_bot_responses (keyword_id);
create index idx_wa_bot_responses_active on public.wa_bot_responses (is_active);

-- Bot session tracking (enhanced wa_sessions)
alter table public.wa_sessions add column if not exists bot_state text default 'start' check (bot_state in ('start', 'awaiting_input', 'confirmed', 'error'));
alter table public.wa_sessions add column if not exists current_keyword text;
alter table public.wa_sessions add column if not exists last_message_at timestamp with time zone;
alter table public.wa_sessions add column if not EXISTS metadata_updates jsonb default '{"bot": {}}'::jsonb;

create index idx_wa_sessions_bot_state on public.wa_sessions (bot_state);
create index idx_wa_sessions_last_message on public.wa_sessions (last_message_at);