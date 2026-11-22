--
-- Views
-- This file declares all views in the public schema.
--

create or replace view public.activity_log with (security_invoker = on) as
select
    ('company.' || c.id || '.created') as id,
    'company.created' as type,
    c.created_at as date,
    c.id as company_id,
    c.sales_id,
    (to_jsonb(c.*) - 'fts')::json as company,
    null::json as contact,
    null::json as deal,
    null::json as contact_note,
    null::json as deal_note
from public.organizations c
union all
select
    ('contact.' || co.id || '.created') as id,
    'contact.created' as type,
    co.first_seen as date,
    co.company_id,
    co.sales_id,
    null::json as company,
    (to_jsonb(co.*) - 'fts')::json as contact,
    null::json as deal,
    null::json as contact_note,
    null::json as deal_note
from public.contacts co
union all
select
    ('contactNote.' || cn.id || '.created') as id,
    'contactNote.created' as type,
    cn.date,
    co.company_id,
    cn.sales_id,
    null::json as company,
    null::json as contact,
    null::json as deal,
    (to_jsonb(cn.*) - 'fts')::json as contact_note,
    null::json as deal_note
from public.contact_notes cn
    left join public.contacts co on co.id = cn.contact_id
union all
select
    ('deal.' || d.id || '.created') as id,
    'deal.created' as type,
    d.created_at as date,
    d.company_id,
    d.sales_id,
    null::json as company,
    null::json as contact,
    (to_jsonb(d.*) - 'fts')::json as deal,
    null::json as contact_note,
    null::json as deal_note
from public.deals d
union all
select
    ('dealNote.' || dn.id || '.created') as id,
    'dealNote.created' as type,
    dn.date,
    d.company_id,
    dn.sales_id,
    null::json as company,
    null::json as contact,
    null::json as deal,
    null::json as contact_note,
    (to_jsonb(dn.*) - 'fts')::json as deal_note
from public.deal_notes dn
    left join public.deals d on d.id = dn.deal_id;

create or replace view public.companies_summary with (security_invoker = on) as
select
    c.id,
    c.created_at,
    c.name,
    c.sector,
    c.size,
    c.linkedin_url,
    c.website,
    c.phone_number,
    c.address,
    c.zipcode,
    c.city,
    c.state_abbr,
    c.sales_id,
    c.context_links,
    c.country,
    c.description,
    c.revenue,
    c.tax_identifier,
    c.logo,
    count(distinct d.id) as nb_deals,
    count(distinct co.id) as nb_contacts
from public.organizations c
    left join public.deals d on c.id = d.company_id
    left join public.contacts co on c.id = co.company_id
group by c.id;

create or replace view public.contacts_summary with (security_invoker = on) as
select
    co.id,
    co.first_name,
    co.last_name,
    co.gender,
    co.title,
    co.background,
    co.avatar,
    co.first_seen,
    co.last_seen,
    co.has_newsletter,
    co.status,
    co.tags,
    co.company_id,
    co.sales_id,
    co.linkedin_url,
    co.email_jsonb,
    co.phone_jsonb,
    (jsonb_path_query_array(co.email_jsonb, '$[*]."email"'))::text as email_fts,
    (jsonb_path_query_array(co.phone_jsonb, '$[*]."number"'))::text as phone_fts,
    c.name as company_name,
    count(distinct t.id) filter (where t.done_date is null) as nb_tasks
from public.contacts co
    left join public.tasks t on co.id = t.contact_id
    left join public.organizations c on co.organization_id = c.id
group by co.id, c.name;

-- Deal summary per organization
create or replace view public.deals_summary with (security_invoker = on) as
select
    d.id,
    d.company_id,
    c.name as company_name,
    d.title,
    d.stage,
    d.high_risk,
    d.next_follow_up,
    d.reason,
    d.owner_id,
    d.converted_at,
    d.lead_source,
    d.contracted_at,
    d.contacted_at,
    case when d.owner_id is not null then true else false end as has_owner,
    count(distinct co.id) as nb_contacts,
    count(distinct t.id) filter (where t.done_date is null) as nb_open_tasks,
    count(distinct a.id) filter (where a.approved) as nb_approvals,
    count(distinct ms.id) as nb_milestones,
    count(distinct sv.id) as nb_site_visits,
    d.deal_value,
    d.currency,
    d.probability,
    d.expected_value,
    d.pipeline_stage,
    d.status,
    d.created_at
from public.deals d
    left join public.organizations c on d.organization_id = c.id
    left join public.contacts co on co.company_id = c.id
    left join public.tasks t on t.linked_lead_id = d.id or (t.linked_project_id = d.id and t.link_type = 'project')
    left join public.project_approvals a on a.project_id = d.id
    left join public.project_milestones ms on ms.project_id = d.id
    left join public.site_visits sv on sv.project_id = d.id
group by d.id, c.name, d.stage, d.high_risk, d.next_follow_up, d.reason, d.owner_id, d.converted_at, d.lead_source, d.contracted_at, d.contacted_at, d.deal_value, d.currency, d.probability, d.expected_value, d.pipeline_stage, d.status, d.created_at;

-- Pipeline stage distribution per organization
create or replace view public.pipeline_distribution with (security_invoker = on) as
select
    c.id as organization_id,
    c.name as organization_name,
    d.pipeline_stage,
    count(d.id) as deal_count,
    count(d.id) filter (where d.high_risk) as high_risk_count,
    count(d.id) filter (where d.stage = 'WON') as won_count,
    count(d.id) filter (where d.stage = 'LOST') as lost_count,
    count(d.id) filter (where d.stage in ('HOT', 'WARM', 'UNDER_FOLLOW_UP')) as active_count,
    round(count(d.id) filter (where d.probability > 0) * 100.0 / nullif(count(d.id), 0)::numeric, 2) as weighted_percentage,
    sum(d.deal_value) filter (where d.deal_value is not null) as total_value,
    sum(d.expected_value) as expected_total
from public.deals d
    left public.organizations c on d.organization_id = c.id
group by c.id, c.name, d.pipeline_stage;

-- Task summary per organization
create or replace view public.tasks_summary with (security_invoker = on) as
select
    t.organization_id,
    count(t.id) as total_tasks,
    count(t.id) filter (where t.priority = 'urgent' or t.priority = 'critical') as high_priority_tasks,
    count(t.id) filter (where t.done_date is null) as open_tasks,
    count(t.id) filter (where t.done_date is not null) as completed_tasks,
    count(t.id) filter (where t.priority = 'normal') as normal_priority_tasks,
    count(distinct t.contact_id) as nb_contacts_involved,
    count(distinct t.project_id) filter (where t.project_id is not null) as nb_projects_involved,
    array_agg(distinct t.priority) as priority_distribution
from public.tasks t
group by t.organization_id;

-- Deal stage transition success rates
create or replace view public.stage_transition_stats with (security_invoker = on) as
select
    d.stage,
    count(d.id) as total_deals,
    count(d.id) filter (where d.stage = 'WON') as won,
    count(d.id) filter (where d.stage = 'LOST') as lost,
    round(count(d.id) filter (where d.stage = 'WON') * 100.0 / nullif(count(d.id), 0)::numeric, 2) as win_rate,
    round(avg(d.probability)::numeric, 2) as avg_probability
from public.deals d
group by d.stage;

-- Project summary per organization
create or replace view public.projects_summary with (security_invoker = on) as
select
    p.id,
    p.organization_id,
    c.name as organization_name,
    p.name,
    p.status,
    p.pipeline_stage,
    p.deal_value,
    p.currency,
    p.start_date,
    p.end_date,
    count(DISTINCT ms.id) as nb_milestones,
    count(DISTINCT sv.id) as nb_site_visits,
    count(DISTINCT a.id) filter (where a.approved) as nb_approvals,
    count(DISTINCT t.id) filter (where t.done_date is null) as nb_open_tasks,
    count(DISTINCT t.id) filter (where t.done_date is not null) as nb_completed_tasks,
    p.created_at
from public.projects p
    left join public.organizations c on p.organization_id = c.id
    left join public.project_milestones ms on ms.project_id = p.id
    left join public.site_visits sv on sv.project_id = p.id
    left join public.project_approvals a on a.project_id = p.id
    left join public.tasks t on t.linked_project_id = p.id
group by p.id, c.name, p.name, p.status, p.pipeline_stage, p.deal_value, p.currency, p.start_date, p.end_date, p.created_at;

create or replace view public.init_state with (security_invoker = off) as
select count(sub.id) as is_initialized
from (
    select sales.id from public.sales limit 1
) sub;
