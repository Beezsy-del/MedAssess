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

insert into public.departments(id,hospital_id,name) values('a4000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','Synthetic ward department'),('a4000000-0000-4000-8000-000000000002','a0000000-0000-4000-8000-000000000002','Foreign ward department');
insert into public.bed_wards(id,hospital_id,department_id,name,zone,categories) values('a5000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','a4000000-0000-4000-8000-000000000001','Synthetic high acuity','high',array['YELLOW']::public.triage_category[]),('a5000000-0000-4000-8000-000000000002','a0000000-0000-4000-8000-000000000002','a4000000-0000-4000-8000-000000000002','Foreign high acuity','high',array['YELLOW']::public.triage_category[]);
insert into public.hospital_resources(id,hospital_id,name,kind) values('a6000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','Synthetic B01','Emergency bed');
insert into public.bed_profiles(resource_id,hospital_id,ward_id,row_number,column_number,verified,capabilities) values('a6000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','a5000000-0000-4000-8000-000000000001',1,1,true,array['oxygen']);
update public.patient_encounters set status='DISPOSITION',category='YELLOW' where id='a3000000-0000-4000-8000-000000000001';
set local role authenticated;
do $$ declare i int; r text; roles text[]:=array['super_admin','hospital_admin','receptionist','triage_nurse','nurse','doctor','emergency_coordinator','resource_manager']; allowed boolean; result jsonb; begin
 for i in 1..8 loop
 r:=roles[i];perform set_config('request.jwt.claim.sub','a1000000-0000-4000-8000-'||lpad(i::text,12,'0'),true);
 if exists(select 1 from public.bed_wards where hospital_id='a0000000-0000-4000-8000-000000000002') then raise exception 'FAIL foreign ward exposed';end if;
 allowed:=false;begin perform public.staff_command('a0000000-0000-4000-8000-000000000001','bed_refresh','{}');allowed:=true;exception when insufficient_privilege then null;end;
 if allowed is distinct from (r<>'receptionist') then raise exception 'FAIL bed read role %',r;end if;
 allowed:=false;begin perform public.staff_command('a0000000-0000-4000-8000-000000000001','bed_plan',jsonb_build_object('operation_id',gen_random_uuid(),'encounter_id','a3000000-0000-4000-8000-000000000001','version',1,'decision','NO_BED','required_capabilities','[]'::jsonb,'reviewed',true,'reason','Synthetic clinician reviewed ambulatory care'));allowed:=true;exception when insufficient_privilege then null;end;
 if allowed is distinct from (r in ('nurse','triage_nurse','doctor')) then raise exception 'FAIL clinical placement role %',r;end if;
 begin perform public.staff_command('a0000000-0000-4000-8000-000000000002','bed_refresh','{}');raise exception 'FAIL foreign operation allowed';exception when insufficient_privilege then null;end;
 begin perform * from private.bed_operations;raise exception 'FAIL receipts exposed';exception when insufficient_privilege then null;end;
 end loop;
end $$;
-- Review, reserve and expire a hold without occupying or dirtying the bed.
do $$ declare v int; begin
 perform set_config('request.jwt.claim.sub','a1000000-0000-4000-8000-000000000006',true);
 perform public.staff_command('a0000000-0000-4000-8000-000000000001','bed_plan',jsonb_build_object('operation_id',gen_random_uuid(),'encounter_id','a3000000-0000-4000-8000-000000000001','version',1,'decision','BED_REQUIRED','ward_id','a5000000-0000-4000-8000-000000000001','bed_kind','Emergency bed','required_capabilities','["oxygen"]'::jsonb,'reviewed',true,'reason','Synthetic ward and equipment review'));
 select version into v from public.hospital_resources where id='a6000000-0000-4000-8000-000000000001';
 perform public.staff_command('a0000000-0000-4000-8000-000000000001','bed_assign',jsonb_build_object('operation_id',gen_random_uuid(),'encounter_id','a3000000-0000-4000-8000-000000000001','version',1,'resource_id','a6000000-0000-4000-8000-000000000001','bed_version',v,'expected_reservation_id','','plan_reviewed_at',(select reviewed_at from public.bed_placement_plans where encounter_id='a3000000-0000-4000-8000-000000000001'),'confirmed',true,'hold',true,'reassign',false,'reason','Synthetic reserved bed'));
end $$;
reset role;
update public.resource_reservations set hold_until=now()-interval '1 minute' where resource_id='a6000000-0000-4000-8000-000000000001' and released_at is null;
set local role authenticated;
do $$ declare v int; begin
 perform public.staff_command('a0000000-0000-4000-8000-000000000001','bed_refresh','{}');
 if (select status from public.hospital_resources where id='a6000000-0000-4000-8000-000000000001')<>'AVAILABLE' then raise exception 'FAIL hold expiry';end if;
 select version into v from public.hospital_resources where id='a6000000-0000-4000-8000-000000000001';
 perform public.staff_command('a0000000-0000-4000-8000-000000000001','bed_assign',jsonb_build_object('operation_id',gen_random_uuid(),'encounter_id','a3000000-0000-4000-8000-000000000001','version',1,'resource_id','a6000000-0000-4000-8000-000000000001','bed_version',v,'expected_reservation_id','','plan_reviewed_at',(select reviewed_at from public.bed_placement_plans where encounter_id='a3000000-0000-4000-8000-000000000001'),'confirmed',true,'hold',false,'reassign',false,'reason','Synthetic occupied bed'));
 perform public.staff_command('a0000000-0000-4000-8000-000000000001','transition',jsonb_build_object('encounter_id','a3000000-0000-4000-8000-000000000001','version',1,'status','DISCHARGED','reason','Synthetic doctor approved discharge'));
 if (select status from public.hospital_resources where id='a6000000-0000-4000-8000-000000000001')<>'CLEANING' then raise exception 'FAIL discharge turnover';end if;
 if exists(select 1 from public.resource_reservations where resource_id='a6000000-0000-4000-8000-000000000001' and released_at is null) then raise exception 'FAIL discharge reservation release';end if;
 if not exists(select 1 from public.bed_allocation_events where resource_id='a6000000-0000-4000-8000-000000000001' and action='released' and actor=auth.uid()) then raise exception 'FAIL discharge audit';end if;
end $$;
reset role;
select 'PASS: eight-role clinical review, two-tenant isolation, private receipts, hold expiry, discharge cleaning and attributable history' as result;
rollback;
