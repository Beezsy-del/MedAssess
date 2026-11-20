begin;
-- Transaction-scoped fixtures: no existing hospital records are modified.
insert into public.hospitals(id,name,location) values('00000000-0000-4000-8000-000000000001','Isolation test hospital','Synthetic');
insert into public.patients(id,hospital_id,name) values('00000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','Must remain hidden');
select set_config('request.jwt.claim.sub',(select user_id::text from public.hospital_memberships where role='doctor' limit 1),true);
set local role authenticated;
do $$
begin
 if exists(select 1 from public.hospitals where id='00000000-0000-4000-8000-000000000001') then raise exception 'FAIL cross-tenant hospital read'; end if;
 if exists(select 1 from public.patients where id='00000000-0000-4000-8000-000000000002') then raise exception 'FAIL cross-tenant patient read'; end if;
 if exists(select 1 from public.audit_logs) then raise exception 'FAIL doctor audit access'; end if;
 begin
  insert into public.patients(hospital_id,name) values('00000000-0000-4000-8000-000000000001','Unauthorized');
  raise exception 'FAIL direct write succeeded';
 exception when insufficient_privilege then null; end;
 begin
  update public.hospital_memberships set role='super_admin';
  raise exception 'FAIL privilege self-assignment succeeded';
 exception when insufficient_privilege then null; end;
 begin
  perform * from public.encounter_access_tokens;
  raise exception 'FAIL token table readable';
 exception when insufficient_privilege then null; end;
 begin
  perform public.staff_command('00000000-0000-4000-8000-000000000001','register','{}');
  raise exception 'FAIL foreign command succeeded';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
select set_config('request.jwt.claim.sub','',true);
set local role anon;
do $$ begin
 begin perform * from public.patients;raise exception 'FAIL anonymous patient read';exception when insufficient_privilege then null;end;
 begin perform public.staff_command('00000000-0000-4000-8000-000000000001','register','{}');raise exception 'FAIL anonymous command';exception when insufficient_privilege then null;end;
end $$;
reset role;
select 'PASS: hospital isolation, patient isolation, clinical audit restriction, direct write denial, self-role denial, token secrecy, foreign command denial, anonymous read denial, anonymous command denial' as result;
rollback;
