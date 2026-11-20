begin;
-- Entire fixture rolls back; no real membership or clinical records are changed.
insert into public.hospitals(id,name,location) values
 ('a0000000-0000-4000-8000-000000000001','Synthetic audit tenant A','Synthetic'),
 ('a0000000-0000-4000-8000-000000000002','Synthetic audit tenant B','Synthetic');
insert into public.hospital_settings(hospital_id) values('a0000000-0000-4000-8000-000000000001'),('a0000000-0000-4000-8000-000000000002');
do $$ declare i integer; roles text[]:=array['super_admin','hospital_admin','receptionist','triage_nurse','nurse','doctor','emergency_coordinator','resource_manager']; u uuid; begin
 for i in 1..8 loop
  u:=('a1000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid;
  insert into auth.users(id,aud,role,email) values(u,'authenticated','authenticated','synthetic-audit-'||i||'@example.invalid');
  insert into public.hospital_memberships(hospital_id,user_id,role,display_name) values('a0000000-0000-4000-8000-000000000001',u,roles[i]::public.staff_role,'Synthetic role '||roles[i]);
 end loop;
end $$;
insert into public.patients(id,hospital_id,name) values
 ('a2000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','Synthetic A'),
 ('a2000000-0000-4000-8000-000000000002','a0000000-0000-4000-8000-000000000002','Synthetic B');
insert into public.patient_encounters(id,hospital_id,patient_id,idempotency_key) values
 ('a3000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','a2000000-0000-4000-8000-000000000001',gen_random_uuid()),
 ('a3000000-0000-4000-8000-000000000002','a0000000-0000-4000-8000-000000000002','a2000000-0000-4000-8000-000000000002',gen_random_uuid());
insert into public.reassessment_records(hospital_id,encounter_id,reason,source) values('a0000000-0000-4000-8000-000000000002','a3000000-0000-4000-8000-000000000002','Synthetic hidden task','staff');
insert into public.encounter_access_tokens(hospital_id,encounter_id,token_hash,expires_at,revoked_at) values
 ('a0000000-0000-4000-8000-000000000001','a3000000-0000-4000-8000-000000000001',encode(extensions.digest(repeat('a',64),'sha256'),'hex'),now()+interval '1 hour',null),
 ('a0000000-0000-4000-8000-000000000001','a3000000-0000-4000-8000-000000000001',encode(extensions.digest(repeat('b',64),'sha256'),'hex'),now()-interval '1 hour',null),
 ('a0000000-0000-4000-8000-000000000001','a3000000-0000-4000-8000-000000000001',encode(extensions.digest(repeat('c',64),'sha256'),'hex'),now()+interval '1 hour',now());
set local role authenticated;
do $$ declare i integer; allowed boolean; result jsonb; r text; roles text[]:=array['super_admin','hospital_admin','receptionist','triage_nurse','nurse','doctor','emergency_coordinator','resource_manager']; begin
 for i in 1..8 loop
  r:=roles[i];
  perform set_config('request.jwt.claim.sub','a1000000-0000-4000-8000-'||lpad(i::text,12,'0'),true);
  if exists(select 1 from public.hospitals where id='a0000000-0000-4000-8000-000000000002') or exists(select 1 from public.patients where hospital_id='a0000000-0000-4000-8000-000000000002') or exists(select 1 from public.patient_encounters where hospital_id='a0000000-0000-4000-8000-000000000002') or exists(select 1 from public.reassessment_records where hospital_id='a0000000-0000-4000-8000-000000000002') then raise exception 'FAIL tenant isolation for %',r; end if;
  allowed:=false;
  begin perform public.staff_command('a0000000-0000-4000-8000-000000000002','register',jsonb_build_object('operation_id',gen_random_uuid()));allowed:=true;exception when insufficient_privilege then null;end;
  if allowed then raise exception 'FAIL foreign mutation for %',r; end if;
  allowed:=false;
  begin result:=public.staff_command('a0000000-0000-4000-8000-000000000001','register',jsonb_build_object('operation_id',gen_random_uuid(),'name','Synthetic role register'));allowed:=true;exception when others then null;end;
  if allowed is distinct from (r in ('receptionist','triage_nurse','nurse','doctor','emergency_coordinator')) then raise exception 'FAIL register permission for %',r; end if;
  allowed:=false;
  begin perform public.staff_command('a0000000-0000-4000-8000-000000000001','settings','{"reassessment_minutes":30,"alert_minutes":5}');allowed:=true;exception when others then null;end;
  if allowed is distinct from (r in ('super_admin','hospital_admin')) then raise exception 'FAIL settings permission for %',r; end if;
  begin update public.hospital_memberships set role='super_admin';raise exception 'FAIL self-role write';exception when insufficient_privilege then null;end;
  begin update public.audit_logs set action='tampered';raise exception 'FAIL audit edit';exception when insufficient_privilege then null;end;
 end loop;
 -- Doctor cannot manufacture a disposition using a note.
 perform set_config('request.jwt.claim.sub','a1000000-0000-4000-8000-000000000006',true);
 allowed:=false;
 begin perform public.staff_command('a0000000-0000-4000-8000-000000000001','note','{"encounter_id":"a3000000-0000-4000-8000-000000000001","kind":"Discharge","note":"Synthetic false discharge"}');allowed:=true;exception when others then null;end;
 if allowed then raise exception 'FAIL disposition bypass';end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub','',true);
set local role anon;
do $$ declare result jsonb; n integer; begin
 if not (public.patient_portal(repeat('b',64),'status') ? 'error') then raise exception 'FAIL expired capability';end if;
 if not (public.patient_portal(repeat('c',64),'status') ? 'error') then raise exception 'FAIL revoked capability';end if;
 result:=public.patient_portal(repeat('a',64),'status','{"encounter_id":"a3000000-0000-4000-8000-000000000002"}');
 if result ? 'name' or result ? 'intake' or not(result ? 'reference') then raise exception 'FAIL public data minimization';end if;
 for n in 1..30 loop perform public.patient_portal(repeat('a',64),'status');end loop;
 if not(public.patient_portal(repeat('a',64),'status')->>'error' like 'Too many%') then raise exception 'FAIL token rate limit';end if;
 begin perform * from public.patients;raise exception 'FAIL anonymous read';exception when insufficient_privilege then null;end;
end $$;
reset role;
select 'PASS: 8 roles x tenant reads, foreign mutations, registration/configuration permissions, role/audit write denial; expired/revoked/scoped tokens; rate limit; disposition integrity' as result;
rollback;
