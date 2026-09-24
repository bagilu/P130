-- P130 Health Check. All checks should return true or the expected named rows.
select to_regclass('public."TblP130UserProfile"') is not null as profile_table_exists;
select exists (select 1 from pg_tables where schemaname='public' and tablename='TblP130UserProfile' and rowsecurity) as rls_enabled;
select exists (select 1 from pg_proc where proname='p130_ensure_profile') as ensure_profile_function_exists;
select exists (select 1 from pg_proc where proname='p130_update_display_name') as update_profile_function_exists;
select grantee, privilege_type from information_schema.routine_privileges where routine_schema='public' and routine_name in ('p130_ensure_profile','p130_update_display_name') order by routine_name, grantee;
