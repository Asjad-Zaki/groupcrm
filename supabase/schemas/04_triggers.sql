--
-- Triggers
-- This file declares all triggers.
--

-- Auto-populate sales_id from current auth user on insert
create or replace trigger set_company_sales_id_trigger
    before insert on public.organizations
    for each row execute function public.set_sales_id_default();

create or replace trigger set_contact_sales_id_trigger
    before insert on public.contacts
    for each row execute function public.set_sales_id_default();

create or replace trigger set_contact_notes_sales_id_trigger
    before insert on public.contact_notes
    for each row execute function public.set_sales_id_default();

create or replace trigger set_deal_sales_id_trigger
    before insert on public.deals
    for each row execute function public.set_sales_id_default();

create or replace trigger set_deal_notes_sales_id_trigger
    before insert on public.deal_notes
    for each row execute function public.set_sales_id_default();

create or replace trigger set_task_sales_id_trigger
    before insert on public.tasks
    for each row execute function public.set_sales_id_default();

-- Auto-fetch company logo from website favicon on save
create or replace trigger company_saved
    before insert or update on public.organizations
    for each row execute function public.handle_company_saved();

-- Lowercase contact emails before insert or update (must run before contact_saved)
create or replace trigger "10_lowercase_contact_emails"
    before insert or update on public.contacts
    for each row execute function public.lowercase_email_jsonb();

-- Auto-fetch contact avatar from email on save (runs after lowercase_contact_emails)
create or replace trigger "20_contact_saved"
    before insert or update on public.contacts
    for each row execute function public.handle_contact_saved();

-- Update contact.last_seen when a contact note is created
create or replace trigger on_public_contact_notes_created_or_updated
    after insert on public.contact_notes
    for each row execute function public.handle_contact_note_created_or_updated();

-- Cleanup storage attachments when contact notes are updated or deleted
create or replace trigger on_contact_notes_attachments_updated_delete_note_attachments
    after update on public.contact_notes
    for each row
    when (old.attachments is distinct from new.attachments)
    execute function public.cleanup_note_attachments();

create or replace trigger on_contact_notes_deleted_delete_note_attachments
    after delete on public.contact_notes
    for each row execute function public.cleanup_note_attachments();

-- Cleanup storage attachments when deal notes are updated or deleted
create or replace trigger on_deal_notes_attachments_updated_delete_note_attachments
    after update on public.deal_notes
    for each row
    when (old.attachments is distinct from new.attachments)
    execute function public.cleanup_note_attachments();

create or replace trigger on_deal_notes_deleted_delete_note_attachments
    after delete on public.deal_notes
    for each row execute function public.cleanup_note_attachments();

-- Remove a deleted tag from every contact that references it
create or replace trigger on_tag_deleted
    after delete on public.tags
    for each row execute function public.handle_tag_deleted();

-- Auth triggers: sync auth.users to public.sales
create or replace trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

create or replace trigger on_auth_user_updated
    after update on auth.users
    for each row execute function public.handle_update_user();

-- Audit log triggers: track all edits, stage changes, deletions, permission changes
CREATE OR REPLACE FUNCTION public.log_audit_event() RETURNS trigger AS $$
BEGIN
    INSERT INTO public.audit_log (table_name, record_id, action, old_data, new_data, changed_by, changed_at, reason, company_id)
    VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        row_to_json(OLD),
        row_to_json(NEW),
        auth.uid(),
        now(),
        current_setting('request.jwt.claim.reason', true),
        (SELECT organization_id FROM public.contacts WHERE id = COALESCE(NEW.contact_id, OLD.contact_id) LIMIT 1)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '';

-- Contact notes audit triggers
create or replace trigger on_contact_notes_audit_insert
    after insert on public.contact_notes
    for each row execute function public.log_audit_event();

create or replace trigger on_contact_notes_audit_update
    after update on public.contact_notes
    for each row when (old.attachments is distinct from new.attachments or old.status is distinct from new.status or old.text is distinct from new.text)
    execute function public.log_audit_event();

create or replace trigger on_contact_notes_audit_delete
    after delete on public.contact_notes
    for each row execute function public.log_audit_event();

-- Deal notes audit triggers
create or replace trigger on_deal_notes_audit_insert
    after insert on public.deal_notes
    for each row execute function public.log_audit_event();

create or replace trigger on_deal_notes_audit_update
    after update on public.deal_notes
    for each row when (old.attachments is distinct from new.attachments or old.status is distinct from new.status or old.text is distinct from new.text)
    execute function public.log_audit_event();

create or replace trigger on_deal_notes_audit_delete
    after delete on public.deal_notes
    for each row execute function public.log_audit_event();

-- Deals audit triggers
create or replace trigger on_deals_audit_insert
    after insert on public.deals
    for each row execute function public.log_audit_event();

create or replace trigger on_deals_audit_update
    after update on public.deals
    for each row when (old.stage is distinct from new.stage or old.amount != new.amount or old.expected_closing_date is distinct from new.expected_closing_date)
    execute function public.log_audit_event();

create or replace trigger on_deals_audit_delete
    after delete on public.deals
    for each row execute function public.log_audit_event();

-- Deal stage transition triggers
CREATE OR REPLACE FUNCTION public.validate_deal_stage_transition() RETURNS trigger AS $$
DECLARE
    min_follow_up_interval interval := interval '7 days';
    sla_interval interval := interval '48 hours';
BEGIN
    -- Require reason for COLD, JUNK, LOST stages
    IF new.stage in ('COLD', 'JUNK', 'LOST') THEN
        IF new.reason IS NULL OR new.reason = '' THEN
            RAISE EXCEPTION 'Reason is required for stage %', new.stage;
        END IF;
    END IF;

    -- Require next_follow_up for UNDER_FOLLOW_UP, WARM, HOT stages
    IF new.stage in ('UNDER_FOLLOW_UP', 'WARM', 'HOT') THEN
        IF new.next_follow_up IS NULL THEN
            RAISE EXCEPTION 'Next follow-up date is required for stage %', new.stage;
        ELSIF new.next_follow_up < now() THEN
            RAISE EXCEPTION 'Next follow-up date must be in the future for stage %', new.stage;
        END IF;
    END IF;

    -- Require owner within SLA for WON stage
    IF new.stage = 'WON' THEN
        IF new.owner_id IS NULL THEN
            RAISE EXCEPTION 'Owner is required when stage is WON';
        ELSIF NEW.owner_id IS NOT NULL THEN
            -- Check if owner has been assigned within SLA
            IF NEW.converted_at < now() - sla_interval THEN
                RAISE EXCEPTION 'Owner must be assigned within 48 hours of WON stage';
            END IF;
        END IF;
    END IF;

    -- Track stage history
    INSERT INTO public.stage_history (deal_id, from_stage, to_stage, changed_by, changed_at, reason)
    VALUES (
        NEW.id,
        COALESCE(old.stage, 'NEW'),
        new.stage,
        auth.uid(),
        now(),
        new.reason
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '';

create or replace trigger on_deals_stage_transition
    after update on public.deals
    for each row when (old.stage is distinct from new.stage)
    execute function public.validate_deal_stage_transition();

-- Stage history table
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

-- Tasks audit triggers
create or replace trigger on_tasks_audit_insert
    after insert on public.tasks
    for each row execute function public.log_audit_event();

create or replace trigger on_tasks_audit_update
    after update on public.tasks
    for each row when (old.status is distinct from new.status or old.priority is distinct from new.priority or old.due_date is distinct from new.due_date)
    execute function public.log_audit_event();

create or replace trigger on_tasks_audit_delete
    after delete on public.tasks
    for each row execute function public.log_audit_event();

-- Organizations audit triggers
create or replace trigger on_organizations_audit_insert
    after insert on public.organizations
    for each row execute function public.log_audit_event();

create or replace trigger on_organizations_audit_update
    after update on public.organizations
    for each row when (old.name is distinct from new.name or old.sector is distinct from new.sector)
    execute function public.log_audit_event();

create or replace trigger on_organizations_audit_delete
    after delete on public.organizations
    for each row execute function public.log_audit_event();