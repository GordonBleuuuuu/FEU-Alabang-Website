alter type public.event_status add value if not exists 'submitted' after 'draft';
alter type public.event_status add value if not exists 'needs_changes' after 'submitted';
alter type public.event_status add value if not exists 'approved' after 'needs_changes';
alter type public.event_status add value if not exists 'completed' after 'published';
