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

insert into public.patient_encounters(id,hospital_id,patient_id,idempotency_key,intake) values('a3000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','a2000000-0000-4000-8000-000000000001',gen_random_uuid(),'{"medical_history":"Original patient report","allergies":"Original allergy report"}');
set local role authenticated;
do $$ declare i integer; r text; roles text[]:=array['super_admin','hospital_admin','receptionist','triage_nurse','nurse','doctor','emergency_coordinator','resource_manager']; allowed boolean; result jsonb; payload jsonb; begin
 for i in 1..8 loop
  r:=roles[i];
  perform set_config('request.jwt.claim.sub','a1000000-0000-4000-8000-'||lpad(i::text,12,'0'),true);
  payload:=jsonb_build_object('operation_id',gen_random_uuid(),'name','Synthetic intake role '||r,'identity_confirmed',true,'category','YELLOW','reason','Synthetic human assessment','input','{"warningSigns":[],"symptoms":"Synthetic role test","pain":null,"worsening":null,"verified":true,"vitals":{"pulse":null,"spo2":null,"respiratoryRate":null,"systolic":null,"temperature":null}}'::jsonb);
  allowed:=false;
  begin result:=public.staff_command('a0000000-0000-4000-8000-000000000001','intake',payload);allowed:=true;exception when insufficient_privilege then null;end;
  if allowed is distinct from (r in ('nurse','triage_nurse','doctor')) then raise exception 'FAIL intake role %',r;end if;
  if allowed and result->>'status'<>'WAITING' then raise exception 'FAIL queue status';end if;
  begin perform public.staff_command('a0000000-0000-4000-8000-000000000002','intake',payload);raise exception 'FAIL foreign intake';exception when insufficient_privilege then null;end;
  allowed:=false;
  begin perform * from public.find_patients('a0000000-0000-4000-8000-000000000001','Synthetic');allowed:=true;exception when insufficient_privilege then null;end;
  if allowed is distinct from (r in ('nurse','triage_nurse','doctor','receptionist')) then raise exception 'FAIL lookup role %',r;end if;
  begin perform * from public.find_patients('a0000000-0000-4000-8000-000000000002','Synthetic');raise exception 'FAIL foreign lookup';exception when insufficient_privilege then null;end;
  begin perform * from private.intake_receipts;raise exception 'FAIL receipt exposure';exception when insufficient_privilege then null;end;
 end loop;
end $$;
do $$ declare result jsonb; begin
 perform set_config('request.jwt.claim.sub','a1000000-0000-4000-8000-000000000004',true);
 result:=public.staff_command('a0000000-0000-4000-8000-000000000001','intake',jsonb_build_object('operation_id',gen_random_uuid(),'patient_id','a2000000-0000-4000-8000-000000000001','encounter_id','a3000000-0000-4000-8000-000000000001','version',1,'identity_confirmed',true,'category','YELLOW','reason','Synthetic human assessment','history','New nurse observation','input','{"warningSigns":[],"symptoms":"Synthetic role test","pain":null,"worsening":null,"verified":true,"vitals":{"pulse":null,"spo2":null,"respiratoryRate":null,"systolic":null,"temperature":null}}'::jsonb));
 if (select intake->>'medical_history' from public.patient_encounters where id='a3000000-0000-4000-8000-000000000001')<>'Original patient report' then raise exception 'FAIL original patient report replaced';end if;
 if not exists(select 1 from public.triage_assessments where encounter_id='a3000000-0000-4000-8000-000000000001' and input->>'medical_history'='New nurse observation') then raise exception 'FAIL nurse history missing';end if;
end $$;
reset role;
do $$ begin
 if (select count(*) from public.audit_logs where hospital_id='a0000000-0000-4000-8000-000000000001' and action='intake.confirmed' and actor is not null)<>4 then raise exception 'FAIL intake audit count';end if;
 if (select count(*) from private.intake_receipts where hospital_id='a0000000-0000-4000-8000-000000000001')<>4 then raise exception 'FAIL receipts';end if;
end $$;
select 'PASS: 8-role clinical intake and lookup permissions, 2-tenant isolation, private receipt access and attributable audit events, preserved patient report and staff observation history' as result;
rollback;
