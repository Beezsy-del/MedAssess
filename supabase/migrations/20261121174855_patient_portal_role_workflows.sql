-- Additive patient history and role workflows. Existing patient/encounter identities are retained.
alter table public.encounter_access_tokens add column manual_token_hash text unique;
alter table public.patient_encounters add column preliminary_category public.triage_category not null default 'ASSESSMENT_REQUIRED';
alter table public.patient_encounters add column latest_patient_report uuid;
alter table public.departments add column outpatient boolean not null default false;
alter table public.departments add column accepted_categories public.triage_category[] not null default '{}';
alter table public.departments add column routing_reviewed_by uuid references auth.users;
alter table public.departments add column routing_reviewed_at timestamptz;
alter table public.notifications add column department_id uuid;
alter table public.notifications add column recipient_user_id uuid references auth.users;
alter table public.notifications add constraint notification_department_tenant foreign key(department_id,hospital_id) references public.departments(id,hospital_id);
create table public.staff_department_memberships (
 hospital_id uuid not null references public.hospitals,user_id uuid not null references auth.users,department_id uuid not null,
 assigned_by uuid not null references auth.users,created_at timestamptz not null default now(),primary key(hospital_id,user_id,department_id),
 foreign key(department_id,hospital_id) references public.departments(id,hospital_id),foreign key(hospital_id,user_id) references public.hospital_memberships(hospital_id,user_id)
);
create table public.patient_questionnaires (
 version text primary key,title text not null,definition jsonb not null,created_at timestamptz not null default now(),clinical_validated boolean not null default false check(clinical_validated=false)
);
insert into public.patient_questionnaires(version,title,definition) values('patient-intake-2.0','Adaptive patient-reported intake',jsonb_build_object('sections',array['identity','symptoms','follow_up','history','medications','allergies','additional','review'],'languages',array['en','kn','hi'],'review_status','prototype wording; qualified clinical and translation review required'));
create table public.patient_reports (
 id uuid primary key default gen_random_uuid(),hospital_id uuid not null references public.hospitals,encounter_id uuid not null,patient_id uuid not null,
 questionnaire_version text not null references public.patient_questionnaires(version),previous_report_id uuid references public.patient_reports,
 answers jsonb not null check(jsonb_typeof(answers)='object' and length(answers::text)<=50000),source text not null default 'patient' check(source in ('patient','guardian','assisted')),
 submitted_at timestamptz not null default now(),operation_id uuid not null,token_id uuid not null references public.encounter_access_tokens,
 unique(hospital_id,operation_id),unique(id,hospital_id),foreign key(encounter_id,hospital_id) references public.patient_encounters(id,hospital_id),foreign key(patient_id,hospital_id) references public.patients(id,hospital_id)
);
alter table public.patient_encounters add constraint latest_report_tenant foreign key(latest_patient_report,hospital_id) references public.patient_reports(id,hospital_id);
create index patient_reports_encounter_history on public.patient_reports(encounter_id,submitted_at desc);
create table public.preliminary_assessments (
 id uuid primary key default gen_random_uuid(),hospital_id uuid not null references public.hospitals,encounter_id uuid not null,report_id uuid,
 previous_category public.triage_category not null,category public.triage_category not null,protocol_version text not null,
 reasons jsonb not null,missing jsonb not null default '[]',matched_rules jsonb not null default '[]',created_at timestamptz not null default now(),
 foreign key(encounter_id,hospital_id) references public.patient_encounters(id,hospital_id),foreign key(report_id,hospital_id) references public.patient_reports(id,hospital_id)
);
create index preliminary_assessments_encounter on public.preliminary_assessments(encounter_id,created_at desc);
create table private.patient_drafts (token_id uuid primary key references public.encounter_access_tokens,answers jsonb not null,step integer not null check(step between 0 and 7),updated_at timestamptz not null default now());
alter table private.patient_drafts enable row level security;
revoke all on private.patient_drafts from public,anon,authenticated;
create table public.department_referrals (
 id uuid primary key default gen_random_uuid(),hospital_id uuid not null references public.hospitals,encounter_id uuid not null,
 from_department_id uuid,to_department_id uuid not null,kind text not null check(kind in ('OPD','REFERRAL')),
 urgency public.triage_category not null,reason text not null check(length(trim(reason)) between 5 and 3000),observations text not null default '',
 requested_by uuid not null references auth.users,status text not null default 'REQUESTED' check(status in ('REQUESTED','ACKNOWLEDGED','ACCEPTED','ARRIVED','COMPLETED','CANCELLED')),
 acknowledged_by uuid references auth.users,acknowledged_at timestamptz,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),version integer not null default 1,
 unique(id,hospital_id),foreign key(encounter_id,hospital_id) references public.patient_encounters(id,hospital_id),foreign key(from_department_id,hospital_id) references public.departments(id,hospital_id),foreign key(to_department_id,hospital_id) references public.departments(id,hospital_id)
);
create unique index one_open_department_referral on public.department_referrals(encounter_id) where status not in ('COMPLETED','CANCELLED');
create index department_referral_inbox on public.department_referrals(hospital_id,to_department_id,status,created_at);
create table public.department_referral_events (
 id uuid primary key default gen_random_uuid(),hospital_id uuid not null references public.hospitals,referral_id uuid not null,encounter_id uuid not null,
 actor uuid not null references auth.users,status text not null,reason text not null,created_at timestamptz not null default now(),
 foreign key(referral_id,hospital_id) references public.department_referrals(id,hospital_id),foreign key(encounter_id,hospital_id) references public.patient_encounters(id,hospital_id)
);
create table private.portal_operations (hospital_id uuid not null,operation_id uuid not null,actor uuid not null,request jsonb not null,result jsonb not null,primary key(hospital_id,operation_id));
alter table private.portal_operations enable row level security;
revoke all on private.portal_operations from public,anon,authenticated;

create table public.resource_requests (
 id uuid primary key default gen_random_uuid(), hospital_id uuid not null references public.hospitals,
 encounter_id uuid not null, token_id uuid references public.encounter_access_tokens,
 requested_by uuid references auth.users, kind text not null, reason text not null,
 status text not null default 'REQUESTED' check(status in ('REQUESTED','ACKNOWLEDGED','FULFILLED','CANCELLED')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 acknowledged_by uuid references auth.users, reservation_id uuid references public.resource_reservations,
 foreign key(encounter_id,hospital_id) references public.patient_encounters(id,hospital_id),
 check(token_id is not null or requested_by is not null)
);
create unique index one_open_resource_request on public.resource_requests(encounter_id,kind) where status in ('REQUESTED','ACKNOWLEDGED');

create function private.clinical_access(h uuid,eid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.patient_encounters e where e.id=eid and e.hospital_id=h and private.role_for(h) in ('doctor','nurse','triage_nurse','emergency_coordinator') and (
  e.emergency or e.category='RED' or e.assigned_to=auth.uid() or e.department_id is null
  or exists(select 1 from public.staff_department_memberships m where m.hospital_id=h and m.user_id=auth.uid() and m.department_id=e.department_id)
  or exists(select 1 from public.department_referrals r join public.staff_department_memberships m on m.hospital_id=r.hospital_id and m.department_id=r.to_department_id and m.user_id=auth.uid() where r.encounter_id=e.id and r.status not in ('COMPLETED','CANCELLED'))
 ))
$$;
revoke all on function private.clinical_access(uuid,uuid) from public,anon;
grant execute on function private.clinical_access(uuid,uuid) to authenticated;

-- Clinical records are no longer exposed by an operational tenant-wide SELECT policy.
drop policy tenant_read on public.patient_encounters;
create policy clinical_encounter_read on public.patient_encounters for select to authenticated using(private.clinical_access(hospital_id,id));
drop policy tenant_read on public.patients;
create policy clinical_patient_read on public.patients for select to authenticated using(exists(select 1 from public.patient_encounters e where e.patient_id=patients.id and private.clinical_access(e.hospital_id,e.id)));
do $$ declare t text; p record; begin
 foreach t in array array['triage_assessments','vital_signs','treatment_records','patient_status_events','referrals','reassessment_records','follow_up_records','investigation_records','admissions','discharges'] loop
  for p in select policyname from pg_policies where schemaname='public' and tablename=t loop execute format('drop policy %I on public.%I',p.policyname,t); end loop;
  execute format('create policy clinical_read on public.%I for select to authenticated using(private.clinical_access(hospital_id,encounter_id))',t);
 end loop;
 foreach t in array array['patient_reports','preliminary_assessments','department_referrals','department_referral_events','resource_requests'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from public,anon,authenticated',t);
  execute format('grant select on public.%I to authenticated',t);
  execute format('create policy clinical_read on public.%I for select to authenticated using(private.clinical_access(hospital_id,encounter_id))',t);
 end loop;
end $$;
alter table public.staff_department_memberships enable row level security;
revoke all on public.staff_department_memberships from public,anon,authenticated;
grant select on public.staff_department_memberships to authenticated;
create policy staff_departments_read on public.staff_department_memberships for select to authenticated using(private.role_for(hospital_id) is not null);
alter table public.patient_questionnaires enable row level security;
revoke all on public.patient_questionnaires from public,anon,authenticated;
grant select on public.patient_questionnaires to authenticated;
create policy questionnaire_staff_read on public.patient_questionnaires for select to authenticated using(exists(select 1 from public.hospital_memberships where user_id=auth.uid() and active));
-- Read-only normalized history projections inherit the report's clinical RLS.
create view public.patient_conditions with(security_invoker=true) as select r.id report_id,r.hospital_id,r.patient_id,r.encounter_id,r.submitted_at,x.value condition from public.patient_reports r cross join lateral jsonb_array_elements_text(r.answers#>'{history,conditions}') x;
create view public.patient_medications with(security_invoker=true) as select r.id report_id,r.hospital_id,r.patient_id,r.encounter_id,r.submitted_at,x.value->>'name' name,x.value->>'dose' dose,x.value->>'frequency' frequency,x.value->>'details' details from public.patient_reports r cross join lateral jsonb_array_elements(r.answers->'medications') x;
create view public.patient_allergies with(security_invoker=true) as select r.id report_id,r.hospital_id,r.patient_id,r.encounter_id,r.submitted_at,x.value->>'substance' substance,x.value->>'reaction' reaction from public.patient_reports r cross join lateral jsonb_array_elements(r.answers->'allergies') x;
revoke all on public.patient_conditions,public.patient_medications,public.patient_allergies from public,anon,authenticated;
grant select on public.patient_conditions,public.patient_medications,public.patient_allergies to authenticated;

drop policy recipient_read on public.notifications;
create policy recipient_read on public.notifications for select to authenticated using(
 private.role_for(hospital_id)=any(recipient_roles) and (recipient_user_id is null or recipient_user_id=auth.uid()) and
 (private.clinical_access(hospital_id,encounter_id) or (private.role_for(hospital_id) in ('hospital_admin','super_admin','resource_manager') and title like 'Resource%'))
);
drop policy audit_read on public.audit_logs;
create policy audit_read on public.audit_logs for select to authenticated using(private.role_for(hospital_id)='super_admin');
-- Ordinary administrators receive a redacted audit projection through workspace_directory.

do $$ declare p record; t text; begin
 foreach t in array array['bed_placement_plans','bed_allocation_events'] loop
  for p in select policyname from pg_policies where schemaname='public' and tablename=t loop execute format('drop policy %I on public.%I',p.policyname,t); end loop;
  execute format('create policy care_placement_read on public.%I for select to authenticated using(private.role_for(hospital_id) in (''resource_manager'',''emergency_coordinator'') or private.clinical_access(hospital_id,encounter_id))',t);
 end loop;
end $$;

create function public.workspace_directory(p_hospital uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.staff_role; es jsonb; ps jsonb; a jsonb; c jsonb;
begin
 r:=private.role_for(p_hospital);if auth.uid() is null or r is null then raise exception 'Access denied' using errcode='42501';end if;
 if r in ('doctor','nurse','triage_nurse','emergency_coordinator') then return jsonb_build_object('encounters','[]'::jsonb,'patients','[]'::jsonb,'audit','[]'::jsonb,'census','{}'::jsonb);end if;
 select coalesce(jsonb_agg(to_jsonb(e)||jsonb_build_object('symptoms','','intake','{}'::jsonb,'score',null,'sub_priority',0,'deteriorating',false,'reassessment_due',null,'idempotency_key','00000000-0000-0000-0000-000000000000','created_by',null,'latest_patient_report',null,'preliminary_category','ASSESSMENT_REQUIRED','category',case when r='resource_manager' then e.category::text else 'ASSESSMENT_REQUIRED' end,'emergency',case when r='resource_manager' then e.emergency else false end)),'[]') into es from (select * from public.patient_encounters where hospital_id=p_hospital order by arrived_at desc limit 10000)e;
 select coalesce(jsonb_agg(to_jsonb(p)||jsonb_build_object('age',null,'date_of_birth',null,'sex',null,'phone',null,'emergency_contact',null)),'[]') into ps from public.patients p where p.hospital_id=p_hospital and exists(select 1 from jsonb_array_elements(es) e where (e->>'patient_id')::uuid=p.id);
 select jsonb_build_object('critical',count(*) filter(where category='RED'),'urgent',count(*) filter(where category='YELLOW'),'waiting',count(*) filter(where status in ('WAITING','STAFF_ASSIGNED')),'awaiting_admission',count(*) filter(where id in(select encounter_id from public.bed_placement_plans where hospital_id=p_hospital and decision in ('AWAITING','BED_REQUIRED')) and not exists(select 1 from public.resource_reservations rr where rr.encounter_id=patient_encounters.id and rr.is_bed and rr.released_at is null))) into c from public.patient_encounters where hospital_id=p_hospital and status not in ('DISCHARGED','TRANSFERRED','CANCELLED');
 if r in ('hospital_admin','super_admin') then
  select coalesce(jsonb_agg(to_jsonb(x)||jsonb_build_object('details','{}'::jsonb)),'[]') into a from(select * from public.audit_logs where hospital_id=p_hospital order by created_at desc limit 200)x;
 else a:='[]';end if;
 return jsonb_build_object('encounters',es,'patients',ps,'audit',a,'census',c,'truncated',jsonb_array_length(es)=10000);
end $$;
revoke all on function public.workspace_directory(uuid) from public,anon;
grant execute on function public.workspace_directory(uuid) to authenticated;

create function private.urgency_rank(c public.triage_category) returns integer language sql immutable set search_path='' as $$select case c when 'RED' then 3 when 'YELLOW' then 2 when 'GREEN' then 1 else 0 end$$;
revoke all on function private.urgency_rank(public.triage_category) from public,anon,authenticated;
create function private.evaluate_patient_report(h uuid,a jsonb,previous public.triage_category) returns jsonb language plpgsql security definer set search_path='' as $$
declare p public.triage_protocol_versions;rule jsonb;pred jsonb;v jsonb;f text;missing jsonb:='[]';reasons jsonb:='[]';matched jsonb:='[]';complete boolean;matches boolean;c public.triage_category:=previous;candidate public.triage_category;
begin
 if a->'emergency_help'='true'::jsonb or jsonb_array_length(coalesce(a->'warning_signs','[]'))>0 then return jsonb_build_object('category','RED','protocol','emergency-assistance-override','reasons',jsonb_build_array('Emergency assistance requested or warning reported. Alert nearby staff immediately; human assessment is required.'),'missing','[]'::jsonb,'matched','[]'::jsonb);end if;
 select * into p from public.triage_protocol_versions where hospital_id=h and status='active' and reviewer is not null and approved_at is not null order by effective_at desc nulls last limit 1;
 if not found or jsonb_typeof(p.configuration->'rules') is distinct from 'array' then return jsonb_build_object('category',c,'protocol','human-review-required','reasons',jsonb_build_array('No reviewed active protocol is available. Human assessment is required.'),'missing','[]'::jsonb,'matched','[]'::jsonb);end if;
 for rule in select value from jsonb_array_elements(p.configuration->'rules') loop
  complete:=true;
  for f in select jsonb_array_elements_text(rule->'requires') loop
   v:=a#>string_to_array(f,'.');
   if v is null or v in ('null'::jsonb,'""'::jsonb,'"unknown"'::jsonb) or(f='symptoms' and a->'symptoms_complete' is distinct from 'true'::jsonb) then complete:=false;missing:=missing||jsonb_build_array(f);end if;
  end loop;
  if not complete then continue;end if;
  matches:=true;
  for pred in select value from jsonb_array_elements(rule->'all') loop
   v:=a#>string_to_array(pred->>'field','.');
   if v is null or v in ('null'::jsonb,'""'::jsonb,'"unknown"'::jsonb) then matches:=false;
   elsif pred->>'operator'='equals' then matches:=matches and v=pred->'value';
   elsif pred->>'operator'='contains' then matches:=matches and jsonb_typeof(v)='array' and v@>jsonb_build_array(pred->'value');
   elsif pred->>'operator' in ('gte','lte') and jsonb_typeof(v)='number' and jsonb_typeof(pred->'value')='number' then
    matches:=matches and case when pred->>'operator'='gte' then (v::text)::numeric>=(pred->>'value')::numeric else (v::text)::numeric<=(pred->>'value')::numeric end;
   else matches:=false;end if;
  end loop;
  if matches then
   candidate:=(rule->>'category')::public.triage_category;
   if private.urgency_rank(candidate)>private.urgency_rank(c) then c:=candidate;end if;
   matched:=matched||jsonb_build_array(rule->>'id');reasons:=reasons||jsonb_build_array(rule->>'explanation');
  end if;
 end loop;
 if jsonb_array_length(matched)=0 then reasons:=reasons||jsonb_build_array('No reviewed rule matched complete information. Human assessment is required.');end if;
 if a->>'progression'='worsening' then reasons:=reasons||jsonb_build_array('Symptoms are worsening: clinical reassessment is required.');end if;
 return jsonb_build_object('category',c,'protocol',p.version,'reasons',reasons,'missing',missing,'matched',matched);
end $$;
revoke all on function private.evaluate_patient_report(uuid,jsonb,public.triage_category) from public,anon,authenticated;

create function private.patient_report_shape(a jsonb) returns boolean language sql immutable set search_path='' as $$
select coalesce((jsonb_typeof(a)='object' and a?'version' and a?'language' and a?'identity' and a?'symptoms' and a?'symptoms_complete' and a?'complaint' and a?'onset' and a?'progression' and a?'location' and a?'pain' and a?'spreading' and a?'spread_location' and a?'answers' and a?'history' and a?'medication_status' and a?'medications' and a?'medication_changed' and a?'medication_missed' and a?'current_symptom_medicine' and a?'allergy_status' and a?'allergies' and a?'pregnancy' and a?'pregnancy_details' and a?'access_needs' and a?'additional' and a?'self_reported_vitals' and a?'emergency_help' and a?'warning_signs' and a?'consent' and (a->'version')='"patient-intake-2.0"'::jsonb and (a->'language') in ('"en"'::jsonb,'"kn"'::jsonb,'"hi"'::jsonb) and (jsonb_typeof((a->'identity'))='object' and (a->'identity')?'name' and (a->'identity')?'age' and (a->'identity')?'date_of_birth' and (a->'identity')?'sex' and (a->'identity')?'phone' and (a->'identity')?'emergency_contact' and (a->'identity')?'patient_identifier' and (a->'identity')?'assistance' and (a->'identity')?'helper_name' and (a->'identity')?'relationship' and (jsonb_typeof(((a->'identity')->'name'))='string' and length(((a->'identity')->'name')#>>'{}') between 0 and 160) and ((case when jsonb_typeof(((a->'identity')->'age'))='number' then (((a->'identity')->'age')::text)::numeric between 0 and 130 and trunc((((a->'identity')->'age')::text)::numeric)=(((a->'identity')->'age')::text)::numeric else false end) or ((a->'identity')->'age')='null'::jsonb) and (((a->'identity')->'date_of_birth')='""'::jsonb or (jsonb_typeof(((a->'identity')->'date_of_birth'))='string' and length(((a->'identity')->'date_of_birth')#>>'{}') between 0 and 3000 and (((a->'identity')->'date_of_birth')#>>'{}') ~ '^\d{4}-\d{2}-\d{2}$')) and (jsonb_typeof(((a->'identity')->'sex'))='string' and length(((a->'identity')->'sex')#>>'{}') between 0 and 80) and (jsonb_typeof(((a->'identity')->'phone'))='string' and length(((a->'identity')->'phone')#>>'{}') between 0 and 40) and (jsonb_typeof(((a->'identity')->'emergency_contact'))='string' and length(((a->'identity')->'emergency_contact')#>>'{}') between 0 and 200) and (jsonb_typeof(((a->'identity')->'patient_identifier'))='string' and length(((a->'identity')->'patient_identifier')#>>'{}') between 0 and 100) and ((a->'identity')->'assistance') in ('"self"'::jsonb,'"guardian"'::jsonb,'"assisted"'::jsonb,'"unknown"'::jsonb) and (jsonb_typeof(((a->'identity')->'helper_name'))='string' and length(((a->'identity')->'helper_name')#>>'{}') between 0 and 160) and (jsonb_typeof(((a->'identity')->'relationship'))='string' and length(((a->'identity')->'relationship')#>>'{}') between 0 and 80) and ((a->'identity')-array['name','age','date_of_birth','sex','phone','emergency_contact','patient_identifier','assistance','helper_name','relationship']::text[])='{}'::jsonb) and (case when jsonb_typeof((a->'symptoms'))='array' then jsonb_array_length((a->'symptoms')) between 0 and 14 and not exists(select 1 from jsonb_array_elements((a->'symptoms')) item where not coalesce(item.value in ('"chest_discomfort"'::jsonb,'"breathing_difficulty"'::jsonb,'"fever"'::jsonb,'"bleeding"'::jsonb,'"injury"'::jsonb,'"dizziness"'::jsonb,'"vomiting"'::jsonb,'"diarrhoea"'::jsonb,'"fainting"'::jsonb,'"weakness"'::jsonb,'"seizure"'::jsonb,'"speech_vision_movement"'::jsonb,'"pain"'::jsonb,'"other"'::jsonb),false)) else false end) and (jsonb_typeof((a->'symptoms_complete'))='boolean') and (jsonb_typeof((a->'complaint'))='string' and length((a->'complaint')#>>'{}') between 0 and 3000) and (jsonb_typeof((a->'onset'))='string' and length((a->'onset')#>>'{}') between 0 and 200) and (a->'progression') in ('"improving"'::jsonb,'"same"'::jsonb,'"worsening"'::jsonb,'"unknown"'::jsonb) and (jsonb_typeof((a->'location'))='string' and length((a->'location')#>>'{}') between 0 and 200) and ((case when jsonb_typeof((a->'pain'))='number' then ((a->'pain')::text)::numeric between 0 and 10 else false end) or (a->'pain')='null'::jsonb) and (a->'spreading') in ('"yes"'::jsonb,'"no"'::jsonb,'"unknown"'::jsonb) and (jsonb_typeof((a->'spread_location'))='string' and length((a->'spread_location')#>>'{}') between 0 and 200) and (jsonb_typeof((a->'answers'))='object' and not exists(select 1 from jsonb_each(case when jsonb_typeof((a->'answers'))='object' then (a->'answers') else '{}'::jsonb end) item where not coalesce((item.value in ('"yes"'::jsonb,'"no"'::jsonb,'"unknown"'::jsonb) or (jsonb_typeof(item.value)='string' and length(item.value#>>'{}') between 0 and 300)),false))) and (jsonb_typeof((a->'history'))='object' and (a->'history')?'status' and (a->'history')?'conditions' and (a->'history')?'details' and (a->'history')?'surgery' and (a->'history')?'surgery_details' and (a->'history')?'similar_before' and (a->'history')?'hospitalised' and (a->'history')?'current_treatment' and (a->'history')?'treatment_details' and ((a->'history')->'status') in ('"recorded"'::jsonb,'"none_reported"'::jsonb,'"unknown"'::jsonb) and (case when jsonb_typeof(((a->'history')->'conditions'))='array' then jsonb_array_length(((a->'history')->'conditions')) between 0 and 7 and not exists(select 1 from jsonb_array_elements(((a->'history')->'conditions')) item where not coalesce(item.value in ('"diabetes"'::jsonb,'"hypertension"'::jsonb,'"heart_disease"'::jsonb,'"respiratory_condition"'::jsonb,'"kidney_disease"'::jsonb,'"neurological_condition"'::jsonb,'"other"'::jsonb),false)) else false end) and (jsonb_typeof(((a->'history')->'details'))='string' and length(((a->'history')->'details')#>>'{}') between 0 and 2000) and ((a->'history')->'surgery') in ('"yes"'::jsonb,'"no"'::jsonb,'"unknown"'::jsonb) and (jsonb_typeof(((a->'history')->'surgery_details'))='string' and length(((a->'history')->'surgery_details')#>>'{}') between 0 and 1000) and ((a->'history')->'similar_before') in ('"yes"'::jsonb,'"no"'::jsonb,'"unknown"'::jsonb) and ((a->'history')->'hospitalised') in ('"yes"'::jsonb,'"no"'::jsonb,'"unknown"'::jsonb) and ((a->'history')->'current_treatment') in ('"yes"'::jsonb,'"no"'::jsonb,'"unknown"'::jsonb) and (jsonb_typeof(((a->'history')->'treatment_details'))='string' and length(((a->'history')->'treatment_details')#>>'{}') between 0 and 1000) and ((a->'history')-array['status','conditions','details','surgery','surgery_details','similar_before','hospitalised','current_treatment','treatment_details']::text[])='{}'::jsonb) and (a->'medication_status') in ('"recorded"'::jsonb,'"none_reported"'::jsonb,'"unknown"'::jsonb) and (case when jsonb_typeof((a->'medications'))='array' then jsonb_array_length((a->'medications')) between 0 and 20 and not exists(select 1 from jsonb_array_elements((a->'medications')) item where not coalesce((jsonb_typeof(item.value)='object' and item.value?'name' and item.value?'dose' and item.value?'frequency' and item.value?'details' and (jsonb_typeof((item.value->'name'))='string' and length((item.value->'name')#>>'{}') between 1 and 160) and (jsonb_typeof((item.value->'dose'))='string' and length((item.value->'dose')#>>'{}') between 0 and 120) and (jsonb_typeof((item.value->'frequency'))='string' and length((item.value->'frequency')#>>'{}') between 0 and 120) and (jsonb_typeof((item.value->'details'))='string' and length((item.value->'details')#>>'{}') between 0 and 500) and (item.value-array['name','dose','frequency','details']::text[])='{}'::jsonb),false)) else false end) and (a->'medication_changed') in ('"yes"'::jsonb,'"no"'::jsonb,'"unknown"'::jsonb) and (a->'medication_missed') in ('"yes"'::jsonb,'"no"'::jsonb,'"unknown"'::jsonb) and (jsonb_typeof((a->'current_symptom_medicine'))='string' and length((a->'current_symptom_medicine')#>>'{}') between 0 and 1000) and (a->'allergy_status') in ('"recorded"'::jsonb,'"none_reported"'::jsonb,'"unknown"'::jsonb) and (case when jsonb_typeof((a->'allergies'))='array' then jsonb_array_length((a->'allergies')) between 0 and 20 and not exists(select 1 from jsonb_array_elements((a->'allergies')) item where not coalesce((jsonb_typeof(item.value)='object' and item.value?'substance' and item.value?'reaction' and (jsonb_typeof((item.value->'substance'))='string' and length((item.value->'substance')#>>'{}') between 1 and 160) and (jsonb_typeof((item.value->'reaction'))='string' and length((item.value->'reaction')#>>'{}') between 0 and 500) and (item.value-array['substance','reaction']::text[])='{}'::jsonb),false)) else false end) and (a->'pregnancy') in ('"yes"'::jsonb,'"no"'::jsonb,'"unknown"'::jsonb) and (jsonb_typeof((a->'pregnancy_details'))='string' and length((a->'pregnancy_details')#>>'{}') between 0 and 500) and (jsonb_typeof((a->'access_needs'))='string' and length((a->'access_needs')#>>'{}') between 0 and 1000) and (jsonb_typeof((a->'additional'))='string' and length((a->'additional')#>>'{}') between 0 and 2000) and (jsonb_typeof((a->'self_reported_vitals'))='object' and (a->'self_reported_vitals')?'pulse' and (a->'self_reported_vitals')?'spo2' and (a->'self_reported_vitals')?'respiratory_rate' and (a->'self_reported_vitals')?'systolic' and (a->'self_reported_vitals')?'temperature' and ((case when jsonb_typeof(((a->'self_reported_vitals')->'pulse'))='number' then (((a->'self_reported_vitals')->'pulse')::text)::numeric between 0 and 400 else false end) or ((a->'self_reported_vitals')->'pulse')='null'::jsonb) and ((case when jsonb_typeof(((a->'self_reported_vitals')->'spo2'))='number' then (((a->'self_reported_vitals')->'spo2')::text)::numeric between 0 and 100 else false end) or ((a->'self_reported_vitals')->'spo2')='null'::jsonb) and ((case when jsonb_typeof(((a->'self_reported_vitals')->'respiratory_rate'))='number' then (((a->'self_reported_vitals')->'respiratory_rate')::text)::numeric between 0 and 150 else false end) or ((a->'self_reported_vitals')->'respiratory_rate')='null'::jsonb) and ((case when jsonb_typeof(((a->'self_reported_vitals')->'systolic'))='number' then (((a->'self_reported_vitals')->'systolic')::text)::numeric between 0 and 350 else false end) or ((a->'self_reported_vitals')->'systolic')='null'::jsonb) and ((case when jsonb_typeof(((a->'self_reported_vitals')->'temperature'))='number' then (((a->'self_reported_vitals')->'temperature')::text)::numeric between 20 and 50 else false end) or ((a->'self_reported_vitals')->'temperature')='null'::jsonb) and ((a->'self_reported_vitals')-array['pulse','spo2','respiratory_rate','systolic','temperature']::text[])='{}'::jsonb) and (jsonb_typeof((a->'emergency_help'))='boolean') and (case when jsonb_typeof((a->'warning_signs'))='array' then jsonb_array_length((a->'warning_signs')) between 0 and 20 and not exists(select 1 from jsonb_array_elements((a->'warning_signs')) item where not coalesce((jsonb_typeof(item.value)='string' and length(item.value#>>'{}') between 0 and 100),false)) else false end) and (jsonb_typeof((a->'consent'))='boolean') and (a-array['version','language','identity','symptoms','symptoms_complete','complaint','onset','progression','location','pain','spreading','spread_location','answers','history','medication_status','medications','medication_changed','medication_missed','current_symptom_medicine','allergy_status','allergies','pregnancy','pregnancy_details','access_needs','additional','self_reported_vitals','emergency_help','warning_signs','consent']::text[])='{}'::jsonb),false)
$$;
revoke all on function private.patient_report_shape(jsonb) from public,anon,authenticated;

create function private.validate_patient_report(a jsonb) returns void language plpgsql set search_path='' as $$
declare k text;v jsonb;
begin
 if not private.patient_report_shape(a) then raise exception 'Invalid report shape';end if;
 if nullif(a#>>'{identity,date_of_birth}','') is not null and ((a#>>'{identity,date_of_birth}')::date>current_date or (a#>>'{identity,date_of_birth}')::date<current_date-interval '130 years') then raise exception 'Invalid date of birth';end if;
 if a#>'{identity,age}'<>'null'::jsonb and a#>>'{identity,date_of_birth}'<>'' then raise exception 'Enter age or date of birth';end if;
 if jsonb_typeof(a)<>'object' or length(a::text)>50000 or a->>'version'<>'patient-intake-2.0' or a->>'language' not in ('en','kn','hi') then raise exception 'Invalid questionnaire';end if;
 foreach k in array array['symptoms','medications','allergies','warning_signs'] loop
  if jsonb_typeof(a->k) is distinct from 'array' or jsonb_array_length(a->k)>20 then raise exception 'Invalid report array';end if;
 end loop;
 if jsonb_typeof(a->'identity') is distinct from 'object' or jsonb_typeof(a->'history') is distinct from 'object' or jsonb_typeof(a->'answers') is distinct from 'object' or jsonb_typeof(a->'self_reported_vitals') is distinct from 'object' then raise exception 'Invalid report structure';end if;
 if a->>'progression' not in ('unknown','improving','same','worsening') or a->>'allergy_status' not in ('unknown','none_reported','recorded') or a->>'medication_status' not in ('unknown','none_reported','recorded') or a#>>'{history,status}' not in ('unknown','none_reported','recorded') then raise exception 'Invalid report status';end if;
 if jsonb_typeof(a->'symptoms_complete') is distinct from 'boolean' or jsonb_typeof(a->'emergency_help') is distinct from 'boolean' then raise exception 'Explicit coverage required';end if;
 for k in select jsonb_object_keys(a->'answers') loop
  if (k like 'chest_%' and not(a->'symptoms'?'chest_discomfort')) or (k like 'fever_%' and not(a->'symptoms'?'fever')) or (k like 'bleeding_%' and not(a->'symptoms'?'bleeding')) or (k like 'breathing_%' and not(a->'symptoms'?'breathing_difficulty')) or (k like 'injury_%' and not(a->'symptoms'?'injury')) then raise exception 'Inactive symptom branch';end if;
 end loop;
 if a->>'medication_status'='recorded' and jsonb_array_length(a->'medications')=0 or a->>'allergy_status'='recorded' and jsonb_array_length(a->'allergies')=0 then raise exception 'Recorded history needs details';end if;
 for v in select value from jsonb_array_elements(a->'medications') loop if jsonb_typeof(v)<>'object' or length(trim(coalesce(v->>'name','')))=0 then raise exception 'Medication name required';end if;end loop;
 for v in select value from jsonb_array_elements(a->'allergies') loop if jsonb_typeof(v)<>'object' or length(trim(coalesce(v->>'substance','')))=0 then raise exception 'Allergy substance required';end if;end loop;
end $$;
revoke all on function private.validate_patient_report(jsonb) from public,anon,authenticated;

alter function public.patient_portal(text,text,jsonb) set schema private;
alter function private.patient_portal(text,text,jsonb) rename to legacy_patient_portal;
revoke all on function private.legacy_patient_portal(text,text,jsonb) from public,anon,authenticated;
create function public.patient_portal(p_token text,p_action text,p_data jsonb default '{}') returns jsonb language plpgsql security definer set search_path='' as $$
declare t public.encounter_access_tokens;e public.patient_encounters;p public.patients;report public.patient_reports;last_report public.patient_reports;draft private.patient_drafts;hash text;cnt integer;op uuid;a jsonb;assessment jsonb;cat public.triage_category;effective public.triage_category;source text;closed boolean;final_category public.triage_category;
begin
 if p_token is null or p_token !~ '^([a-f0-9]{32}|[a-f0-9]{64})$' then return jsonb_build_object('error','Link unavailable or expired');end if;
 hash:=encode(extensions.digest(p_token,'sha256'),'hex');
 select * into t from public.encounter_access_tokens where (token_hash=hash or manual_token_hash=hash) and revoked_at is null and expires_at>now();
 if not found then return jsonb_build_object('error','Link unavailable or expired');end if;
 select * into e from public.patient_encounters where id=t.encounter_id for update;
 select * into t from public.encounter_access_tokens where id=t.id and revoked_at is null and expires_at>now() for update;
 if not found then return jsonb_build_object('error','Link unavailable or expired');end if;
 if not exists(select 1 from public.hospitals where id=e.hospital_id and is_demo) then raise exception 'Clinical operational use disabled' using errcode='42501';end if;
 closed:=e.status in ('DISCHARGED','TRANSFERRED','CANCELLED');
 -- Emergency assistance has its own idempotent path; draft/status traffic cannot exhaust it.
 if p_action<>'emergency' then
  insert into private.request_limits(bucket,attempts) values('portal:'||t.id::text,1) on conflict(bucket) do update set attempts=case when request_limits.window_at<now()-interval '1 minute' then 1 else request_limits.attempts+1 end,window_at=case when request_limits.window_at<now()-interval '1 minute' then now() else request_limits.window_at end returning attempts into cnt;
  if cnt>30 then return jsonb_build_object('error','Too many requests. Please wait a minute.');end if;
 end if;
 if p_action='status' then
  select * into p from public.patients where id=e.patient_id;
  select * into last_report from public.patient_reports where encounter_id=e.id order by submitted_at desc limit 1;
  select * into draft from private.patient_drafts where token_id=t.id;
  select confirmed_category into final_category from public.triage_assessments where encounter_id=e.id order by created_at desc limit 1;
  return jsonb_build_object('reference',e.reference,'status',e.status,'submitted',t.submitted_at is not null,'emergency',e.emergency,'category',e.category,'preliminary_category',e.preliminary_category,'confirmed_category',final_category,'closed',closed,'department',(select name from public.departments where id=e.department_id),'identity',case when closed then null else jsonb_build_object('name',p.name,'age',p.age,'date_of_birth',p.date_of_birth,'sex',p.sex,'phone',p.phone,'emergency_contact',p.emergency_contact,'patient_identifier',p.identifier) end,'latest_report',case when closed then null else last_report.answers end,'report_id',last_report.id,'draft',case when closed then null else draft.answers end,'draft_step',draft.step,'updated_at',e.updated_at,'assessment',(select jsonb_build_object('category',category,'protocol',protocol_version,'reasons',reasons,'missing',missing,'created_at',created_at) from public.preliminary_assessments where encounter_id=e.id order by created_at desc limit 1));
 end if;
 if closed then raise exception 'Encounter closed';end if;
 if p_action='emergency' then
  if not e.emergency then
   update public.patient_encounters set emergency=true,category='RED',preliminary_category='RED',deteriorating=true,version=version+1,updated_at=now() where id=e.id;
   perform private.notify(e.hospital_id,e.id,'RED','Patient requests immediate emergency assistance');
   insert into public.preliminary_assessments(hospital_id,encounter_id,previous_category,category,protocol_version,reasons) values(e.hospital_id,e.id,e.preliminary_category,'RED','emergency-assistance-override','["Emergency assistance requested. Human assessment required."]');
   insert into public.resource_requests(hospital_id,encounter_id,token_id,kind,reason) values(e.hospital_id,e.id,t.id,'Stretcher','Patient emergency assistance request: staff must assess transport needs') on conflict(encounter_id,kind) where status in ('REQUESTED','ACKNOWLEDGED') do nothing;
   insert into public.patient_status_events(hospital_id,encounter_id,from_status,to_status,reason) values(e.hospital_id,e.id,e.status,e.status,'Patient requested emergency assistance; ordinary queue bypassed');
   perform private.record_event(e.hospital_id,e.id,'patient.emergency_reported',jsonb_build_object('token_id',t.id));
  end if;
  return jsonb_build_object('ok',true,'reference',e.reference,'category','RED','delivery','RECORDED','acknowledged',exists(select 1 from public.notifications where encounter_id=e.id and title='Patient requests immediate emergency assistance' and acknowledged_at is not null));
 elsif p_action='draft' then
  a:=p_data->'answers';perform private.validate_patient_report(a);
  insert into private.patient_drafts(token_id,answers,step) values(t.id,a,(p_data->>'step')::integer) on conflict(token_id) do update set answers=excluded.answers,step=excluded.step,updated_at=now();
  return jsonb_build_object('ok',true,'saved_at',now());
 elsif p_action='submit' then
  op:=(p_data->>'operation_id')::uuid;if op is null then raise exception 'Operation required';end if;
  a:=p_data->'answers';perform private.validate_patient_report(a);
  select * into report from public.patient_reports where hospital_id=e.hospital_id and operation_id=op;
  if found then
   if report.token_id<>t.id or report.encounter_id<>e.id or report.answers<>a then raise exception 'Changed retry' using errcode='PT409';end if;
   return jsonb_build_object('ok',true,'duplicate',true,'report_id',report.id,'reference',e.reference);
  end if;
  if a->'consent' is distinct from 'true'::jsonb or length(trim(coalesce(a->>'complaint','')))<2 then raise exception 'Review consent and presenting complaint required';end if;
  if (p_data->>'previous_report_id')::uuid is distinct from e.latest_patient_report then raise exception 'Symptoms changed on another device; review the latest report' using errcode='PT409';end if;
  source:=case when a#>>'{identity,assistance}'='guardian' then 'guardian' when a#>>'{identity,assistance}'='assisted' then 'assisted' else 'patient' end;
  insert into public.patient_reports(hospital_id,encounter_id,patient_id,questionnaire_version,previous_report_id,answers,source,operation_id,token_id) values(e.hospital_id,e.id,e.patient_id,a->>'version',e.latest_patient_report,a,source,op,t.id) returning * into report;
  assessment:=private.evaluate_patient_report(e.hospital_id,a,e.preliminary_category);
  cat:=(assessment->>'category')::public.triage_category;effective:=case when private.urgency_rank(cat)>private.urgency_rank(e.category) then cat else e.category end;
  insert into public.preliminary_assessments(hospital_id,encounter_id,report_id,previous_category,category,protocol_version,reasons,missing,matched_rules) values(e.hospital_id,e.id,report.id,e.preliminary_category,cat,assessment->>'protocol',assessment->'reasons',assessment->'missing',assessment->'matched');
  update public.patient_encounters set latest_patient_report=report.id,preliminary_category=cat,category=effective,emergency=e.emergency or cat='RED',deteriorating=e.deteriorating or a->>'progression'='worsening' or private.urgency_rank(cat)>private.urgency_rank(e.category),symptoms=case when e.latest_patient_report is null and e.symptoms='' then a->>'complaint' else e.symptoms end,version=version+1,updated_at=now() where id=e.id;
  if cat='RED' then
   insert into public.resource_requests(hospital_id,encounter_id,token_id,kind,reason) values(e.hospital_id,e.id,t.id,'Stretcher','Emergency patient report: staff must assess appropriate transport and equipment') on conflict(encounter_id,kind) where status in ('REQUESTED','ACKNOWLEDGED') do nothing;
  end if;
  update public.encounter_access_tokens set submitted_at=coalesce(submitted_at,now()) where id=t.id;
  delete from private.patient_drafts where token_id=t.id;
  if a->>'progression'='worsening' or private.urgency_rank(cat)>private.urgency_rank(e.category) then
   insert into public.reassessment_records(hospital_id,encounter_id,reason,source) values(e.hospital_id,e.id,'Patient reports a change requiring clinical review','deterioration') on conflict(encounter_id) where resolved_at is null do nothing;
  end if;
  perform private.notify(e.hospital_id,e.id,effective,case when effective='RED' then 'Emergency patient symptom report — immediate assistance' when effective='YELLOW' then 'Urgent patient symptom report — clinical review required' else 'Patient questionnaire submitted — human review required' end);
  insert into public.patient_status_events(hospital_id,encounter_id,from_status,to_status,reason) values(e.hospital_id,e.id,e.status,e.status,'Patient symptom report recorded; preliminary category '||cat::text||'; human confirmation required');
  perform private.record_event(e.hospital_id,e.id,'patient.report_submitted',jsonb_build_object('report_id',report.id,'previous_report_id',report.previous_report_id,'category',cat,'token_id',t.id));
  return jsonb_build_object('ok',true,'report_id',report.id,'reference',e.reference,'category',effective);
 elsif p_action='intake' and length(p_token)=64 then
  -- Retain old QR form compatibility until every client has updated.
  return private.legacy_patient_portal(p_token,p_action,p_data);
 end if;
 raise exception 'Unsupported patient operation';
end $$;
revoke all on function public.patient_portal(text,text,jsonb) from public;
grant execute on function public.patient_portal(text,text,jsonb) to anon,authenticated;

-- Keep the existing transactional workflows behind a single role-authorized entry point.
alter function public.staff_command(uuid,text,jsonb) rename to portal_previous_command;
alter function public.portal_previous_command(uuid,text,jsonb) set schema private;
revoke all on function private.portal_previous_command(uuid,text,jsonb) from public,anon,authenticated;
create function public.staff_command(p_hospital uuid,p_action text,p_data jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare r text; permitted boolean:=false; result jsonb; manual text; eid uuid;
begin
 r:=private.role_for(p_hospital)::text;
 if auth.uid() is null or r is null then raise exception 'Access denied' using errcode='42501';end if;
 permitted:=case
 when p_action in ('register','intake','token') then r in ('receptionist','nurse','triage_nurse')
 when p_action in ('assess','note','subpriority','reassessment') then r in ('nurse','triage_nurse','doctor')
 when p_action in ('follow_up','referral') then r='doctor'
 when p_action='referral_status' then r in ('doctor','emergency_coordinator')
 when p_action in ('settings','department','resource','facility','shift') then r in ('hospital_admin','super_admin')
 when p_action in ('bed_ward','bed_configure') then r in ('hospital_admin','super_admin','resource_manager','emergency_coordinator')
 when p_action in ('bed_plan','transition') then r in ('nurse','triage_nurse','doctor','emergency_coordinator')
 when p_action in ('bed_assign','bed_release') then r in ('nurse','triage_nurse','doctor','emergency_coordinator','resource_manager')
 when p_action in ('bed_refresh','bed_status','reserve','release','maintenance','shortage') then r in ('nurse','triage_nurse','doctor','emergency_coordinator','resource_manager','hospital_admin','super_admin')
 when p_action='alert' then r<>'receptionist'
 else false end;
 if not permitted then raise exception 'Role cannot perform action' using errcode='42501';end if;
 eid:=nullif(p_data->>'encounter_id','')::uuid;
 if eid is not null and p_action not in ('intake','token') and not private.clinical_access(p_hospital,eid) and not (r='resource_manager' and p_action in ('bed_assign','bed_release','shortage')) then raise exception 'Encounter access denied' using errcode='42501';end if;
 result:=private.portal_previous_command(p_hospital,p_action,p_data);
 if p_action in ('register','intake','token') and result->>'token' is not null then
  manual:=encode(extensions.gen_random_bytes(16),'hex');
  update public.encounter_access_tokens set manual_token_hash=encode(extensions.digest(manual,'sha256'),'hex') where hospital_id=p_hospital and token_hash=encode(extensions.digest(result->>'token','sha256'),'hex');
  if not found then raise exception 'Patient pass could not be issued';end if;
  result:=result||jsonb_build_object('manual_token',manual);
 end if;
 return result;
end $$;
revoke all on function public.staff_command(uuid,text,jsonb) from public,anon;
grant execute on function public.staff_command(uuid,text,jsonb) to authenticated;
