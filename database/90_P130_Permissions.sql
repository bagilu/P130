-- P130 permissions repair. Safe to rerun.
alter table public."TblP130UserProfile" enable row level security;
revoke all on table public."TblP130UserProfile" from anon, authenticated;
revoke all on function public.p130_ensure_profile() from public;
revoke all on function public.p130_update_display_name(text) from public;
grant execute on function public.p130_ensure_profile() to authenticated;
grant execute on function public.p130_update_display_name(text) to authenticated;
