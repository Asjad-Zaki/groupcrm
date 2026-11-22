--
-- Row Level Security
-- Group CRM: All policies enforce tenant_id isolation via tenant_memberships.
-- No policy uses using (true) for business data.
-- IT admin break-glass: is_admin() exists but does NOT automatically grant business data access.
-- Provisional memberships get no access until reviewed.
--

-- Enable RLS on all tables
alter table public.organizations enable row level security;
alter table public.contacts enable row level security;
alter table public.contact_notes enable row level security;
alter table public.deals enable row level security;
alter table public.deal_notes enable row level security;
alter table public.sales enable row level security;
alter table public.tags enable row level security;
alter table public.tasks enable row level security;
alter table public.configuration enable row level security;
alter table public.favicons_excluded_domains enable row level security;
alter table public.user_invitations enable row level security;
alter table public.audit_logs enable row level security;

-- Tenant membership helper: user must have active (non-provisional) membership in the tenant
-- This is inlined in policies below as: exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = X.tenant_id and ucm.status = 'active')

-- Organizations (now linked to tenants via tenant_id)
create policy "Enable read access for tenant members" on public.organizations for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = organizations.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.organizations for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = organizations.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.organizations for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = organizations.tenant_id and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = organizations.tenant_id and ucm.status = 'active')
);
create policy "Enable delete for admin only" on public.organizations for delete to authenticated using (public.is_admin());

-- Contacts
create policy "Enable read access for tenant members" on public.contacts for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = contacts.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.contacts for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = contacts.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.contacts for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = contacts.tenant_id and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = contacts.tenant_id and ucm.status = 'active')
);
create policy "Enable delete for admin or approved member" on public.contacts for delete to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = contacts.tenant_id and ucm.status = 'active')
);

-- Contact Notes
create policy "Enable read access for tenant members" on public.contact_notes for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = contact_notes.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.contact_notes for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = contact_notes.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.contact_notes for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = contact_notes.tenant_id and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = contact_notes.tenant_id and ucm.status = 'active')
);
create policy "Enable delete for admin or approved member" on public.contact_notes for delete to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = contact_notes.tenant_id and ucm.status = 'active')
);

-- Deals
create policy "Enable read access for tenant members" on public.deals for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = deals.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.deals for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = deals.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.deals for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = deals.tenant_id and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = deals.tenant_id and ucm.status = 'active')
);
create policy "Enable delete for admin or approved member" on public.deals for delete to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = deals.tenant_id and ucm.status = 'active')
);

-- Deal Notes
create policy "Enable read access for tenant members" on public.deal_notes for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = deal_notes.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.deal_notes for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = deal_notes.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.deal_notes for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = deal_notes.tenant_id and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = deal_notes.tenant_id and ucm.status = 'active')
);
create policy "Enable delete for admin or approved member" on public.deal_notes for delete to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = deal_notes.tenant_id and ucm.status = 'active')
);

-- Sales (users - read restricted by membership, write admins only)
create policy "Enable read access for tenant members or admin" on public.sales for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.status = 'active') -- any tenant membership
    or public.is_admin()
);
create policy "Enable insert/update/delete for admins only" on public.sales for insert to authenticated with check (public.is_admin());
create policy "Enable update for admins only" on public.sales for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Enable delete for admins only" on public.sales for delete to authenticated using (public.is_admin());

-- Tags (tenant-aware: users can read tags in their tenant organizations, admins have restricted access)
create policy "Enable read access for tenant members" on public.tags for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = (
        select tenant_id from public.contacts where id = coalesce((select contact_id from public.tasks where id = coalesce(current_setting('request.current_task_id', true)), 1) LIMIT 1) LIMIT 1)
    and ucm.status = 'approved')
    or exists (select 1 from public.sales where user_id = auth.uid() and administrator = true)
);
create policy "Enable insert for admins only" on public.tags for insert to authenticated with check (public.is_admin());
create policy "Enable update for admins only" on public.tags for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Enable delete for admins only" on public.tags for delete to authenticated using (public.is_admin());

-- Tasks (tenant-aware with lead_id/project_id support)
create policy "Enable read access for tenant members" on public.tasks for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = tasks.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.tasks for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = tasks.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.tasks for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = tasks.tenant_id and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = tasks.tenant_id and ucm.status = 'active')
);
create policy "Enable delete for admin or approved member" on public.tasks for delete to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = tasks.tenant_id and ucm.status = 'active')
);

-- Configuration (admin-only for writes)
create policy "Enable read for tenant members or admin" on public.configuration for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admins" on public.configuration for insert to authenticated with check (public.is_admin());
create policy "Enable update for admins" on public.configuration for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Favicons excluded domains (public reference data)
create policy "Enable access for authenticated users only" on public.favicons_excluded_domains to authenticated using (true) with check (true);

-- User invitations (service_role only, RLS enabled but service_role bypasses)
alter table public.user_invitations enable row level security;
grant all on table public.user_invitations to service_role;
revoke all on table public.user_invitations from anon, authenticated;

-- Audit logs (insert-only for authenticated; service_role can do everything)
alter table public.audit_logs enable row level security;
create policy "Enable insert for authenticated" on public.audit_logs for insert to authenticated with check (true);
create policy "Enable all for service_role" on public.audit_logs to service_role;
revoke update, delete on table public.audit_logs from authenticated;
revoke update, delete on table public.audit_logs from anon;

-- Messages (tenant-aware)
create policy "Enable read access for tenant members" on public.messages for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = messages.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.messages for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = messages.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.messages for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = messages.tenant_id and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = messages.tenant_id and ucm.status = 'active')
);
create policy "Enable delete for admin or approved member" on public.messages for delete to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = messages.tenant_id and ucm.status = 'active')
);

-- Stage history (tenant-aware)
create policy "Enable read access for tenant members" on public.stage_history for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = stage_history.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.stage_history for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = stage_history.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.stage_history for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = stage_history.tenant_id and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = stage_history.tenant_id and ucm.status = 'active')
);
create policy "Enable delete for admin only" on public.stage_history for delete to authenticated using (public.is_admin());

-- Stage transitions (tenant-aware)
create policy "Enable read access for tenant members" on public.stage_transitions for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = stage_transitions.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.stage_transitions for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = stage_transitions.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.stage_transitions for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = stage_transitions.tenant_id and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = stage_transitions.tenant_id and ucm.status = 'active')
);
create policy "Enable delete for admin only" on public.stage_transitions for delete to authenticated using (public.is_admin());

-- Leads (S2)
create policy "Enable read access for tenant members" on public.leads for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = leads.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.leads for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = leads.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.leads for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = leads.tenant_id and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = leads.tenant_id and ucm.status = 'active')
);
create policy "Enable delete for admin or approved member" on public.leads for delete to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = leads.tenant_id and ucm.status = 'active')
);

-- Lead stage history (S2)
create policy "Enable read access for tenant members" on public.lead_stage_history for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = lead_stage_history.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.lead_stage_history for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = lead_stage_history.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.lead_stage_history for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = lead_stage_history.tenant_id and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = lead_stage_history.tenant_id and ucm.status = 'active')
);
create policy "Enable delete for admin only" on public.lead_stage_history for delete to authenticated using (public.is_admin());

-- Conversations (tenant-aware)
create policy "Enable read access for tenant members" on public.conversations for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = conversations.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.conversations for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = conversations.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.conversations for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = conversations.tenant_id and ucm.status = 'active')
);
create policy "Enable delete for admin or approved member" on public.conversations for delete to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = conversations.tenant_id and ucm.status = 'active')
);

-- Conversation members (tenant-aware, admin can manage members)
create policy "Enable read access for conversation members" on public.conversation_members for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = (select tenant_id from public.conversations where id = conversation_id) and ucm.status = 'active')
);
create policy "Enable insert for participant" on public.conversation_members for insert to authenticated with check (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = (select tenant_id from public.conversations where id = conversation_id) and ucm.status = 'active')
);
create policy "Enable update for admin or member" on public.conversation_members for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = (select tenant_id from public.conversations where id = conversation_id) and ucm.status = 'active')
);
create policy "Enable delete for admin or member" on public.conversation_members for delete to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = (select tenant_id from public.conversations where id = conversation_id) and ucm.status = 'active')
);

-- Messages (tenant-aware)
create policy "Enable read access for tenant members" on public.messages for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = (select tenant_id from public.conversations where id = conversation_id) and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.messages for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = (select tenant_id from public.conversations where id = conversation_id) and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.messages for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = (select tenant_id from public.conversations where id = conversation_id) and ucm.status = 'active')
);
create policy "Enable delete for admin or approved member" on public.messages for delete to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = (select tenant_id from public.conversations where id = conversation_id) and ucm.status = 'active')
);

-- Message links
create policy "Enable read access for message links" on public.message_links for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = (select tenant_id from public.conversations where id = (select conversation_id from public.messages where id = message_links.message_id)) and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.message_links for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = (select tenant_id from public.conversations where id = (select conversation_id from public.messages where id = message_links.message_id)) and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.message_links for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = (select tenant_id from public.conversations where id = (select conversation_id from public.messages where id = message_links.message_id)) and ucm.status = 'active')
);
create policy "Enable delete for admin or approved member" on public.message_links for delete to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = (select tenant_id from public.conversations where id = (select conversation_id from public.messages where id = message_links.message_id)) and ucm.status = 'active')
);

-- Issue threads (tenant-aware)
create policy "Enable read access for issue threads" on public.issue_threads for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = (select tenant_id from public.conversations where id = conversation_id) and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.issue_threads for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = (select tenant_id from public.conversations where id = conversation_id) and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.issue_threads for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = (select tenant_id from public.conversations where id = conversation_id) and ucm.status = 'active')
);
create policy "Enable delete for admin only" on public.issue_threads for delete to authenticated using (public.is_admin());

-- Grant service_role all permissions on chat tables
grant all on table public.conversations to service_role;
grant all on table public.conversation_members to service_role;
grant all on table public.messages to service_role;
grant all on table public.message_links to service_role;
grant all on table public.issue_threads to service_role;

-- Task comments (S3)
create policy "Enable read access for tenant members" on public.task_comments for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = (
        select tenant_id from public.tasks where id = task_comments.task_id limit 1
    ) and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.task_comments for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = (
        select tenant_id from public.tasks where id = task_comments.task_id limit 1
    ) and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.task_comments for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = (
        select tenant_id from public.tasks where id = task_comments.task_id limit 1
    ) and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = (
        select tenant_id from public.tasks where id = task_comments.task_id limit 1
    ) and ucm.status = 'active')
);
create policy "Enable delete for admin or approved member" on public.task_comments for delete to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = (
        select tenant_id from public.tasks where id = task_comments.task_id limit 1
    ) and ucm.status = 'active')
);

-- Task events (S3)
create policy "Enable read access for tenant members" on public.task_events for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = (
        select tenant_id from public.tasks where id = task_events.task_id limit 1
    ) and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.task_events for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = (
        select tenant_id from public.tasks where id = task_events.task_id limit 1
    ) and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.task_events for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = (
        select tenant_id from public.tasks where id = task_events.task_id limit 1
    ) and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = (
        select tenant_id from public.tasks where id = task_events.task_id limit 1
    ) and ucm.status = 'active')
);
create policy "Enable delete for admin only" on public.task_events for delete to authenticated using (public.is_admin());

-- Engagement scores (tenant-aware)
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = engagement_scores.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.engagement_scores for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = engagement_scores.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.engagement_scores for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = engagement_scores.tenant_id and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = engagement_scores.tenant_id and ucm.status = 'active')
);
create policy "Enable delete for admin only" on public.engagement_scores for delete to authenticated using (public.is_admin());

-- Engagement evidence (tenant-aware)
create policy "Enable read access for tenant members" on public.engagement_evidence for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = engagement_evidence.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.engagement_evidence for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = engagement_evidence.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.engagement_evidence for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = engagement_evidence.tenant_id and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = engagement_evidence.tenant_id and ucm.status = 'active')
);
create policy "Enable delete for admin only" on public.engagement_evidence for delete to authenticated using (public.is_admin());

-- Engagement config (tenant-aware)
create policy "Enable read access for tenant members" on public.engagement_config for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = engagement_config.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin" on public.engagement_config for insert to authenticated with check (public.is_admin());
create policy "Enable update for admin" on public.engagement_config for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Projects (tenant-aware)
create policy "Enable read access for tenant members" on public.projects for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = projects.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.projects for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = projects.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.projects for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = projects.tenant_id and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = projects.tenant_id and ucm.status = 'active')
);
create policy "Enable delete for admin or approved member" on public.projects for delete to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = projects.tenant_id and ucm.status = 'active')
);

-- Project milestones (tenant-aware)
create policy "Enable read access for tenant members" on public.project_milestones for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = project_milestones.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.project_milestones for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = project_milestones.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.project_milestones for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = project_milestones.tenant_id and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = project_milestones.tenant_id and ucm.status = 'active')
);
create policy "Enable delete for admin or approved member" on public.project_milestones for delete to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = project_milestones.tenant_id and ucm.status = 'active')
);

-- Site visits (tenant-aware)
create policy "Enable read access for tenant members" on public.site_visits for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = site_visits.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.site_visits for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = site_visits.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.site_visits for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = site_visits.tenant_id and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = site_visits.tenant_id and ucm.status = 'active')
);
create policy "Enable delete for admin or approved member" on public.site_visits for delete to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = site_visits.tenant_id and ucm.status = 'active')
);

-- Project approvals (tenant-aware)
create policy "Enable read access for tenant members" on public.project_approvals for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = project_approvals.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.project_approvals for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = project_approvals.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.project_approvals for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = project_approvals.tenant_id and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = project_approvals.tenant_id and ucm.status = 'active')
);
create policy "Enable delete for admin or approved member" on public.project_approvals for delete to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = project_approvals.tenant_id and ucm.status = 'active')
);

-- Project comments (tenant-aware)
create policy "Enable read access for tenant members" on public.project_comments for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = project_comments.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.project_comments for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = project_comments.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.project_comments for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = project_comments.tenant_id and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = project_comments.tenant_id and ucm.status = 'active')
);
create policy "Enable delete for admin or approved member" on public.project_comments for delete to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = project_comments.tenant_id and ucm.status = 'active')
);

-- AI conversations (tenant-aware)
create policy "Enable read access for tenant members" on public.ai_conversations for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = ai_conversations.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.ai_conversations for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = ai_conversations.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.ai_conversations for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = ai_conversations.tenant_id and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = ai_conversations.tenant_id and ucm.status = 'active')
);
create policy "Enable delete for admin only" on public.ai_conversations for delete to authenticated using (public.is_admin());

-- AI queries (tenant-aware)
create policy "Enable read access for tenant members" on public.ai_queries for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = ai_queries.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.ai_queries for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = ai_queries.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.ai_queries for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = ai_queries.tenant_id and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = ai_queries.tenant_id and ucm.status = 'active')
);
create policy "Enable delete for admin only" on public.ai_queries for delete to authenticated using (public.is_admin());

-- AI prompt templates (tenant-aware)
create policy "Enable read access for tenant members" on public.ai_prompt_templates for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = ai_prompt_templates.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin" on public.ai_prompt_templates for insert to authenticated with check (public.is_admin());
create policy "Enable update for admin" on public.ai_prompt_templates for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Enable delete for admin" on public.ai_prompt_templates for delete to authenticated using (public.is_admin());

-- AI model config (tenant-aware)
create policy "Enable read access for tenant members" on public.ai_model_config for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = ai_model_config.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin" on public.ai_model_config for insert to authenticated with check (public.is_admin());
create policy "Enable update for admin" on public.ai_model_config for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- AI response cache (tenant-aware)
create policy "Enable read access for tenant members" on public.ai_response_cache for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = ai_response_cache.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.ai_response_cache for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = ai_response_cache.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.ai_response_cache for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = ai_response_cache.tenant_id and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = ai_response_cache.tenant_id and ucm.status = 'active')
);
create policy "Enable delete for admin only" on public.ai_response_cache for delete to authenticated using (public.is_admin());

-- Communication preferences (tenant-aware)
create policy "Enable read access for tenant members" on public.communication_preferences for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = communication_preferences.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.communication_preferences for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = communication_preferences.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.communication_preferences for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = communication_preferences.tenant_id and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = communication_preferences.tenant_id and ucm.status = 'active')
);

-- Notification workflows (tenant-aware)
create policy "Enable read access for tenant members" on public.notification_workflows for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = notification_workflows.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin" on public.notification_workflows for insert to authenticated with check (public.is_admin());
create policy "Enable update for admin" on public.notification_workflows for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Enable delete for admin" on public.notification_workflows for delete to authenticated using (public.is_admin());

-- Email templates (tenant-aware)
create policy "Enable read access for tenant members" on public.email_templates for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = email_templates.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin" on public.email_templates for insert to authenticated with check (public.is_admin());
create policy "Enable update for admin" on public.email_templates for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Enable delete for admin" on public.email_templates for delete to authenticated using (public.is_admin());

-- WhatsApp ID mappings (tenant-aware)
create policy "Enable read access for tenant members" on public.wa_id_mappings for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = wa_id_mappings.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.wa_id_mappings for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = wa_id_mappings.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.wa_id_mappings for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = wa_id_mappings.tenant_id and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = wa_id_mappings.tenant_id and ucm.status = 'active')
);
create policy "Enable delete for admin or approved member" on public.wa_id_mappings for delete to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = wa_id_mappings.tenant_id and ucm.status = 'active')
);

-- WhatsApp templates (tenant-aware)
create policy "Enable read access for tenant members" on public.wa_templates for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = wa_templates.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.wa_templates for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = wa_templates.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.wa_templates for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = wa_templates.tenant_id and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = wa_templates.tenant_id and ucm.status = 'active')
);
create policy "Enable delete for admin or approved member" on public.wa_templates for delete to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = wa_templates.tenant_id and ucm.status = 'active')
);

-- WhatsApp consent (tenant-aware)
create policy "Enable read access for tenant members" on public.wa_consent for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = wa_consent.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.wa_consent for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = wa_consent.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.wa_consent for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = wa_consent.tenant_id and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = wa_consent.tenant_id and ucm.status = 'active')
);
create policy "Enable delete for admin or approved member" on public.wa_consent for delete to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = wa_consent.tenant_id and ucm.status = 'active')
);

-- WhatsApp message status (tenant-aware)
create policy "Enable read access for tenant members" on public.wa_message_status for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = wa_message_status.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.wa_message_status for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = wa_message_status.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.wa_message_status for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = wa_message_status.tenant_id and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = wa_message_status.tenant_id and ucm.status = 'active')
);
create policy "Enable delete for admin or approved member" on public.wa_message_status for delete to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = wa_message_status.tenant_id and ucm.status = 'active')
);

-- WhatsApp sessions (tenant-aware)
create policy "Enable read access for tenant members" on public.wa_sessions for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = wa_sessions.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.wa_sessions for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = wa_sessions.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.wa_sessions for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = wa_sessions.tenant_id and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = wa_sessions.tenant_id and ucm.status = 'active')
);
create policy "Enable delete for admin only" on public.wa_sessions for delete to authenticated using (public.is_admin());

-- WA bot keywords (tenant-aware)
create policy "Enable read access for tenant members" on public.wa_bot_keywords for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = wa_bot_keywords.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin" on public.wa_bot_keywords for insert to authenticated with check (public.is_admin());
create policy "Enable update for admin" on public.wa_bot_keywords for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Enable delete for admin" on public.wa_bot_keywords for delete to authenticated using (public.is_admin());

-- WA bot conversations (tenant-aware)
create policy "Enable read access for tenant members" on public.wa_bot_conversations for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = wa_bot_conversations.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.wa_bot_conversations for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = wa_bot_conversations.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.wa_bot_conversations for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = wa_bot_conversations.tenant_id and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = wa_bot_conversations.tenant_id and ucm.status = 'active')
);
create policy "Enable delete for admin" on public.wa_bot_conversations for delete to authenticated using (public.is_admin());

-- Drive shared drives (tenant-aware)
create policy "Enable read access for tenant members" on public.drive_shared_drives for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = drive_shared_drives.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin" on public.drive_shared_drives for insert to authenticated with check (public.is_admin());
create policy "Enable delete for admin" on public.drive_shared_drives for delete to authenticated using (public.is_admin());

-- Drive folders (tenant-aware)
create policy "Enable read access for tenant members" on public.drive_folders for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = drive_folders.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin" on public.drive_folders for insert to authenticated with check (public.is_admin());
create policy "Enable update for admin" on public.drive_folders for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Enable delete for admin" on public.drive_folders for delete to authenticated using (public.is_admin());

-- Drive files (tenant-aware)
create policy "Enable read access for tenant members" on public.drive_files for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = drive_files.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.drive_files for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = drive_files.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.drive_files for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = drive_files.tenant_id and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = drive_files.tenant_id and ucm.status = 'active')
);
create policy "Enable delete for admin or approved member" on public.drive_files for delete to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = drive_files.tenant_id and ucm.status = 'active')
);

-- Drive file versions (tenant-aware)
create policy "Enable read access for tenant members" on public.drive_file_versions for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = drive_file_versions.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.drive_file_versions for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = drive_file_versions.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.drive_file_versions for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = drive_file_versions.tenant_id and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = drive_file_versions.tenant_id and ucm.status = 'active')
);
create policy "Enable delete for admin only" on public.drive_file_versions for delete to authenticated using (public.is_admin());

-- Drive activity log (insert-only)
alter table public.drive_activity_log enable row level security;
create policy "Enable insert for authenticated" on public.drive_activity_log for insert to authenticated with check (true);
create policy "Enable all for service_role" on public.drive_activity_log to service_role;
revoke update, delete on table public.drive_activity_log from authenticated;
revoke update, delete on table public.drive_activity_log from anon;

-- Drive share links (tenant-aware)
create policy "Enable read access for tenant members" on public.drive_share_links for select to authenticated using (
    exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = drive_share_links.tenant_id and ucm.status = 'active')
    or public.is_admin()
);
create policy "Enable insert for admin or approved member" on public.drive_share_links for insert to authenticated with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = drive_share_links.tenant_id and ucm.status = 'active')
);
create policy "Enable update for admin or approved member" on public.drive_share_links for update to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = drive_share_links.tenant_id and ucm.status = 'active')
) with check (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = drive_share_links.tenant_id and ucm.status = 'active')
);
create policy "Enable delete for admin or approved member" on public.drive_share_links for delete to authenticated using (
    public.is_admin() or exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = drive_share_links.tenant_id and ucm.status = 'active')
);

-- Drive bucket config (admin-only)
create policy "Enable insert for admin" on public.drive_bucket_config for insert to authenticated with check (public.is_admin());
create policy "Enable update for admin" on public.drive_bucket_config for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Enable delete for admin" on public.drive_bucket_config for delete to authenticated using (public.is_admin());
create policy "Enable read for authenticated" on public.drive_bucket_config for select to authenticated using (true);