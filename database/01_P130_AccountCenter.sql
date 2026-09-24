-- P130 Account Center V0.1. Run once in Supabase SQL Editor.
-- This migration creates only P130 objects; it does not alter auth.users.
create table if not exists public."TblP130UserProfile" (
  "AuthUserID" uuid primary key references auth.users(id) on delete cascade,
  "DisplayName" text not null check (char_length(trim("DisplayName")) between 1 and 80),
  "CreatedAt" timestamptz not null default now(),
  "UpdatedAt" timestamptz not null default now()
);
alter table public."TblP130UserProfile" enable row level security;

create or replace function public.p130_ensure_profile()
returns text language plpgsql security definer set search_path = public, auth as $$
declare v_name text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select "DisplayName" into v_name from public."TblP130UserProfile" where "AuthUserID" = auth.uid();
  if v_name is null then
    v_name := coalesce(nullif(trim(auth.jwt() -> 'user_metadata' ->> 'display_name'), ''), split_part(coalesce(auth.jwt() ->> 'email','User'), '@', 1));
    insert into public."TblP130UserProfile" ("AuthUserID", "DisplayName") values (auth.uid(), left(v_name,80)) on conflict ("AuthUserID") do nothing;
  end if;
  select "DisplayName" into v_name from public."TblP130UserProfile" where "AuthUserID" = auth.uid();
  return v_name;
end; $$;

create or replace function public.p130_update_display_name(p_display_name text)
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if char_length(trim(coalesce(p_display_name,''))) not between 1 and 80 then raise exception 'Display name must contain 1-80 characters'; end if;
  insert into public."TblP130UserProfile" ("AuthUserID","DisplayName") values (auth.uid(),trim(p_display_name))
  on conflict ("AuthUserID") do update set "DisplayName"=excluded."DisplayName", "UpdatedAt"=now();
end; $$;

revoke all on table public."TblP130UserProfile" from anon, authenticated;
grant execute on function public.p130_ensure_profile() to authenticated;
grant execute on function public.p130_update_display_name(text) to authenticated;
