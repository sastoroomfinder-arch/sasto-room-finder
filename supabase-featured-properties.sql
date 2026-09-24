-- Sasto Room Finder: Featured Properties database support
-- Run this once in Supabase Dashboard -> SQL Editor.

alter table public.room
add column if not exists is_featured boolean not null default false;

create index if not exists room_is_featured_idx
on public.room (is_featured);

-- Optional verification:
select column_name, data_type, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'room'
  and column_name = 'is_featured';
