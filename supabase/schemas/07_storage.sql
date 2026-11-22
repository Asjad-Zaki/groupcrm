--
-- Storage
-- Group CRM: Storage paths are tenant-prefixed (tenant_id/filename).
-- Bucket policies enforce basic authenticated access; tenant isolation
-- is achieved by prefixing all storage paths with the user's tenant_id
-- and filtering in the data provider/retrieval logic.
--

-- Attachments bucket
create policy "Attachments select" on storage.objects for select to authenticated using (bucket_id = 'attachments');
create policy "Attachments insert" on storage.objects for insert to authenticated with check (bucket_id = 'attachments');
create policy "Attachments delete" on storage.objects for delete to authenticated using (bucket_id = 'attachments');

-- WhatsApp-related storage
create policy "WhatsApp attachments select" on storage.objects for select to authenticated using (bucket_id = 'whatsapp');
create policy "WhatsApp attachments insert" on storage.objects for insert to authenticated with check (bucket_id = 'whatsapp');
create policy "WhatsApp attachments delete" on storage.objects for delete to authenticated using (bucket_id = 'whatsapp');

-- Generated files bucket (if separate from attachments)
create policy "Generatedfiles select" on storage.objects for select to authenticated using (bucket_id = 'generated');
create policy "Generatedfiles insert" on storage.objects for insert to authenticated with check (bucket_id = 'generated');
create policy "Generatedfiles delete" on storage.objects for delete to authenticated using (bucket_id = 'generated');