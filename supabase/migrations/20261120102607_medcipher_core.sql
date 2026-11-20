create schema if not exists private;
create extension if not exists pgcrypto with schema extensions;
create type public.staff_role as enum ('super_admin','hospital_admin','receptionist','triage_nurse','nurse','doctor','emergency_coordinator','resource_manager');
create type public.triage_category as enum ('RED','YELLOW','GREEN','ASSESSMENT_REQUIRED');
create table public.hospitals(id uuid primary key default gen_random_uuid(), name text not null, location text not null, is_demo boolean not null default true, created_at timestamptz not null default now());
create table public.hospital_memberships(id uuid primary key default gen_random_uuid(), hospital_id uuid not null references public.hospitals, user_id uuid not null references auth.users, role public.staff_role not null, display_name text not null, active boolean not null default true, unique(hospital_id,user_id));
create index on public.hospital_memberships(user_id,hospital_id);
create table public.departments(id uuid primary key default gen_random_uuid(),hospital_id uuid not null references public.hospitals,name text not null,location text not null default '',capacity integer not null default 10 check(capacity>0),unique(id,hospital_id));
create table public.patients(id uuid primary key default gen_random_uuid(),hospital_id uuid not null references public.hospitals,name text not null check(length(name) between 1 and 160),age integer check(age between 0 and 130),sex text,phone text,unidentified boolean not null default false,created_at timestamptz not null default now(),unique(id,hospital_id));
create table public.patient_encounters(id uuid primary key default gen_random_uuid(),hospital_id uuid not null references public.hospitals,patient_id uuid not null,reference text not null default ('MC-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,10))),department_id uuid,assigned_to uuid references auth.users,status text not null default 'TRIAGE_PENDING' check(status in ('REGISTERED','TRIAGE_PENDING','TRIAGE_COMPLETED','WAITING','STAFF_ASSIGNED','ASSESSMENT','DIAGNOSTICS','TREATMENT','DISPOSITION','DISCHARGED','ADMITTED','REFERRED','TRANSFERRED','CANCELLED')),category public.triage_category not null default 'ASSESSMENT_REQUIRED',emergency boolean not null default false,sub_priority integer not null default 0 check(sub_priority between 0 and 10),deteriorating boolean not null default false,score numeric(5,2) check(score between 0 and 100),symptoms text not null default '',intake jsonb not null default '{}',reassessment_due timestamptz,arrived_at timestamptz not null default now(),updated_at timestamptz not null default now(),version integer not null default 1,idempotency_key uuid not null,created_by uuid references auth.users,unique(id,hospital_id),unique(hospital_id,idempotency_key),unique(reference),foreign key(patient_id,hospital_id) references public.patients(id,hospital_id),foreign key(department_id,hospital_id) references public.departments(id,hospital_id));
create index on public.patient_encounters(hospital_id,status,category,arrived_at);
create table public.encounter_access_tokens(id uuid primary key default gen_random_uuid(),hospital_id uuid not null references public.hospitals,encounter_id uuid not null,token_hash text not null unique,expires_at timestamptz not null default now()+interval '24 hours',revoked_at timestamptz,submitted_at timestamptz,foreign key(encounter_id,hospital_id) references public.patient_encounters(id,hospital_id));
create table public.triage_protocol_versions(id uuid primary key default gen_random_uuid(),hospital_id uuid not null references public.hospitals,name text not null,version text not null,status text not null default 'draft' check(status in ('draft','reviewed','active','retired')),reference text,reviewer uuid references auth.users,approved_at timestamptz,effective_at timestamptz,configuration jsonb not null default '{}',unique(hospital_id,version));
create table public.triage_assessments(id uuid primary key default gen_random_uuid(),hospital_id uuid not null references public.hospitals,encounter_id uuid not null,actor uuid not null references auth.users,proposed_category public.triage_category not null,confirmed_category public.triage_category not null,reason text not null check(length(reason)>=5),input jsonb not null,result jsonb not null,protocol text not null default 'demo-1.0-unvalidated',created_at timestamptz not null default now(),foreign key(encounter_id,hospital_id) references public.patient_encounters(id,hospital_id));
create table public.vital_signs(id uuid primary key default gen_random_uuid(),hospital_id uuid not null references public.hospitals,encounter_id uuid not null,actor uuid not null references auth.users,pulse numeric check(pulse between 0 and 400),spo2 numeric check(spo2 between 0 and 100),respiratory_rate numeric check(respiratory_rate between 0 and 150),systolic numeric check(systolic between 0 and 350),temperature numeric check(temperature between 20 and 50),created_at timestamptz not null default now(),foreign key(encounter_id,hospital_id) references public.patient_encounters(id,hospital_id));
create table public.patient_status_events(id uuid primary key default gen_random_uuid(),hospital_id uuid not null references public.hospitals,encounter_id uuid not null,actor uuid references auth.users,from_status text,to_status text not null,reason text not null,created_at timestamptz not null default now(),foreign key(encounter_id,hospital_id) references public.patient_encounters(id,hospital_id));
create table public.notifications(id uuid primary key default gen_random_uuid(),hospital_id uuid not null references public.hospitals,encounter_id uuid not null,title text not null,recipient_roles public.staff_role[] not null,status text not null default 'CREATED' check(status in ('CREATED','ACKNOWLEDGED','IN_PROGRESS','ESCALATED','RESOLVED','CANCELLED')),created_at timestamptz not null default now(),acknowledged_by uuid references auth.users,acknowledged_at timestamptz,resolved_at timestamptz,resolution text,foreign key(encounter_id,hospital_id) references public.patient_encounters(id,hospital_id));
create index on public.notifications(hospital_id,status);
create table public.hospital_resources(id uuid primary key default gen_random_uuid(),hospital_id uuid not null references public.hospitals,name text not null,kind text not null check(kind in ('General bed','Emergency bed','ICU bed','Stretcher','Wheelchair','Equipment')),department_id uuid,status text not null default 'AVAILABLE' check(status in ('AVAILABLE','RESERVED','OCCUPIED','CLEANING','MAINTENANCE')),location text not null default '',unique(id,hospital_id),foreign key(department_id,hospital_id) references public.departments(id,hospital_id));
create table public.resource_reservations(id uuid primary key default gen_random_uuid(),hospital_id uuid not null references public.hospitals,resource_id uuid not null,encounter_id uuid not null,actor uuid not null references auth.users,created_at timestamptz not null default now(),released_at timestamptz,foreign key(resource_id,hospital_id) references public.hospital_resources(id,hospital_id),foreign key(encounter_id,hospital_id) references public.patient_encounters(id,hospital_id));
create unique index one_active_reservation on public.resource_reservations(resource_id) where released_at is null;
create table public.referral_facilities(id uuid primary key default gen_random_uuid(),hospital_id uuid not null references public.hospitals,name text not null,contact text not null,services text not null,availability_note text not null default 'External capacity not verified',unique(id,hospital_id));
create table public.referrals(id uuid primary key default gen_random_uuid(),hospital_id uuid not null references public.hospitals,encounter_id uuid not null,facility_id uuid not null,doctor_id uuid not null references auth.users,reason text not null,summary text not null,transport text not null,status text not null default 'REQUESTED' check(status in ('REQUESTED','CONTACTED','ACCEPTED','DEPARTED','ARRIVED','COMPLETED')),acknowledgement text,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),foreign key(encounter_id,hospital_id) references public.patient_encounters(id,hospital_id),foreign key(facility_id,hospital_id) references public.referral_facilities(id,hospital_id));
create table public.treatment_records(id uuid primary key default gen_random_uuid(),hospital_id uuid not null references public.hospitals,encounter_id uuid not null,actor uuid not null references auth.users,kind text not null check(kind in ('Assessment','Treatment','Investigation','Handover','Discharge','Admission')),note text not null check(length(note)>=5),created_at timestamptz not null default now(),foreign key(encounter_id,hospital_id) references public.patient_encounters(id,hospital_id));
create table public.audit_logs(id uuid primary key default gen_random_uuid(),hospital_id uuid not null references public.hospitals,actor uuid references auth.users,action text not null,entity_id uuid,details jsonb not null default '{}',created_at timestamptz not null default now());
create index on public.audit_logs(hospital_id,created_at desc);
create table public.hospital_settings(id uuid primary key default gen_random_uuid(),hospital_id uuid not null unique references public.hospitals,reassessment_minutes integer not null default 30 check(reassessment_minutes between 1 and 240),alert_minutes integer not null default 5 check(alert_minutes between 1 and 60),clinical_enabled boolean not null default false check(clinical_enabled=false),languages text[] not null default array['en','kn','hi']);
create table public.offline_sync_events(id uuid primary key default gen_random_uuid(),hospital_id uuid not null references public.hospitals,operation_id uuid not null,actor uuid not null references auth.users,encounter_id uuid,created_at timestamptz not null default now(),unique(hospital_id,operation_id));
create table public.staff_shifts(id uuid primary key default gen_random_uuid(),hospital_id uuid not null references public.hospitals,user_id uuid not null references auth.users,starts_at timestamptz not null,ends_at timestamptz not null,check(ends_at>starts_at));
create table private.request_limits(bucket text primary key,window_at timestamptz not null default now(),attempts integer not null default 0);
alter table private.request_limits enable row level security;

create function private.role_for(h uuid) returns public.staff_role language sql stable security definer set search_path='' as $$ select role from public.hospital_memberships where hospital_id=h and user_id=(select auth.uid()) and active $$;
revoke all on function private.role_for(uuid) from public;
grant usage on schema private to authenticated;
grant execute on function private.role_for(uuid) to authenticated;

do $$ declare t text; begin
 foreach t in array array['hospitals','hospital_memberships','departments','patients','patient_encounters','encounter_access_tokens','triage_protocol_versions','triage_assessments','vital_signs','patient_status_events','notifications','hospital_resources','resource_reservations','referral_facilities','referrals','treatment_records','audit_logs','hospital_settings','offline_sync_events','staff_shifts'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon,authenticated',t);
 if t <> 'encounter_access_tokens' then
 execute format('grant select on public.%I to authenticated',t);
 if t='hospitals' then execute 'create policy hospital_read on public.hospitals for select to authenticated using (private.role_for(id) is not null)';
 elsif t='audit_logs' then execute 'create policy audit_read on public.audit_logs for select to authenticated using (private.role_for(hospital_id) in (''hospital_admin'',''super_admin''))';
 elsif t in ('triage_assessments','vital_signs','treatment_records') then execute format('create policy clinical_read on public.%I for select to authenticated using (private.role_for(hospital_id) in (''doctor'',''nurse'',''triage_nurse'',''emergency_coordinator''))',t);
 else execute format('create policy tenant_read on public.%I for select to authenticated using (private.role_for(hospital_id) is not null)',t); end if;
 end if;
 end loop;
end $$;

create function private.record_event(h uuid, e uuid, a text, detail jsonb default '{}') returns void language sql security definer set search_path='' as $$ insert into public.audit_logs(hospital_id,actor,action,entity_id,details) values(h,auth.uid(),a,e,detail) $$;
revoke all on function private.record_event(uuid,uuid,text,jsonb) from public;
create function private.notify(h uuid,e uuid,c public.triage_category, title text) returns void language sql security definer set search_path='' as $$ insert into public.notifications(hospital_id,encounter_id,title,recipient_roles) values(h,e,title,case when c='RED' then array['emergency_coordinator','doctor','triage_nurse']::public.staff_role[] when c='YELLOW' then array['triage_nurse','doctor']::public.staff_role[] else array['nurse','triage_nurse']::public.staff_role[] end) $$;
revoke all on function private.notify(uuid,uuid,public.triage_category,text) from public;

create function public.staff_command(p_hospital uuid,p_action text,p_data jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.staff_role; e public.patient_encounters; pid uuid; eid uuid; rid uuid; target text; raw_token text; confirmed public.triage_category; proposed public.triage_category; oldstatus text; rec public.hospital_resources; n public.notifications; ref public.referrals; nexts text[]; v jsonb; sign_count integer;
begin
 r:=private.role_for(p_hospital);
 if auth.uid() is null or r is null then raise exception 'Access denied' using errcode='42501'; end if;
 if not exists(select 1 from public.hospitals where id=p_hospital and is_demo) then raise exception 'Clinical operational use is disabled pending protocol review'; end if;
 if p_action='register' then
  if r not in ('receptionist','triage_nurse','nurse','doctor','emergency_coordinator') then raise exception 'Role cannot register'; end if;
  select * into e from public.patient_encounters where hospital_id=p_hospital and idempotency_key=(p_data->>'operation_id')::uuid;
  if found then return jsonb_build_object('id',e.id,'reference',e.reference,'duplicate',true); end if;
  if p_data->>'patient_id' is not null then
   select id into pid from public.patients where id=(p_data->>'patient_id')::uuid and hospital_id=p_hospital;
   if pid is null then raise exception 'Patient unavailable'; end if;
  else
   insert into public.patients(hospital_id,name,age,sex,phone,unidentified) values(p_hospital,coalesce(nullif(trim(p_data->>'name'),''),'Unidentified patient'),nullif(p_data->>'age','')::integer,p_data->>'sex',p_data->>'phone',coalesce((p_data->>'unidentified')::boolean,false)) returning id into pid;
  end if;
  insert into public.patient_encounters(hospital_id,patient_id,department_id,symptoms,category,emergency,idempotency_key,created_by) values(p_hospital,pid,nullif(p_data->>'department_id','')::uuid,coalesce(p_data->>'symptoms',''),case when coalesce((p_data->>'emergency')::boolean,false) then 'RED'::public.triage_category else 'ASSESSMENT_REQUIRED'::public.triage_category end,coalesce((p_data->>'emergency')::boolean,false),(p_data->>'operation_id')::uuid,auth.uid()) returning * into e;
  raw_token:=encode(extensions.gen_random_bytes(32),'hex');
  insert into public.encounter_access_tokens(hospital_id,encounter_id,token_hash) values(p_hospital,e.id,encode(extensions.digest(raw_token,'sha256'),'hex'));
  insert into public.patient_status_events(hospital_id,encounter_id,actor,to_status,reason) values(p_hospital,e.id,auth.uid(),'TRIAGE_PENDING','Registered for human triage');
  insert into public.offline_sync_events(hospital_id,operation_id,actor,encounter_id) values(p_hospital,(p_data->>'operation_id')::uuid,auth.uid(),e.id);
  perform private.notify(p_hospital,e.id,e.category,case when e.emergency then 'Emergency assistance requested' else 'New patient awaiting triage' end);
  perform private.record_event(p_hospital,e.id,'encounter.registered');
  return jsonb_build_object('id',e.id,'reference',e.reference,'token',raw_token);
 end if;
 if p_action in ('settings','department','resource','facility','shift') then
  if r not in ('hospital_admin','super_admin') then raise exception 'Administrator required'; end if;
  if p_action='settings' then update public.hospital_settings set reassessment_minutes=(p_data->>'reassessment_minutes')::integer,alert_minutes=(p_data->>'alert_minutes')::integer where hospital_id=p_hospital;
  elsif p_action='department' then insert into public.departments(hospital_id,name,location,capacity) values(p_hospital,p_data->>'name',p_data->>'location',(p_data->>'capacity')::integer);
  elsif p_action='resource' then insert into public.hospital_resources(hospital_id,name,kind,location) values(p_hospital,p_data->>'name',p_data->>'kind',p_data->>'location');
  elsif p_action='facility' then insert into public.referral_facilities(hospital_id,name,contact,services) values(p_hospital,p_data->>'name',p_data->>'contact',p_data->>'services');
  elsif p_action='shift' then
   if not exists(select 1 from public.hospital_memberships where hospital_id=p_hospital and user_id=(p_data->>'user_id')::uuid and active) then raise exception 'Staff unavailable'; end if;
   insert into public.staff_shifts(hospital_id,user_id,starts_at,ends_at) values(p_hospital,(p_data->>'user_id')::uuid,(p_data->>'starts_at')::timestamptz,(p_data->>'ends_at')::timestamptz);
  end if;
  perform private.record_event(p_hospital,p_hospital,'configuration.'||p_action); return jsonb_build_object('ok',true);
 end if;
 if p_action='alert' then
  select * into n from public.notifications where id=(p_data->>'id')::uuid and hospital_id=p_hospital for update;
  if not found or not (r=any(n.recipient_roles) or r in ('hospital_admin','super_admin')) then raise exception 'Alert unavailable for this role'; end if;
  target:=p_data->>'status';
  if not ((n.status in ('CREATED','ESCALATED') and target='ACKNOWLEDGED') or (n.status='ACKNOWLEDGED' and target='IN_PROGRESS') or (n.status='IN_PROGRESS' and target='RESOLVED') or (n.status in ('CREATED','ACKNOWLEDGED','IN_PROGRESS') and target='ESCALATED')) then raise exception 'Invalid alert transition'; end if;
  if target='RESOLVED' and length(trim(coalesce(p_data->>'reason','')))<5 then raise exception 'Resolution required'; end if;
  update public.notifications set status=target,acknowledged_by=case when target='ACKNOWLEDGED' then auth.uid() else acknowledged_by end,acknowledged_at=case when target='ACKNOWLEDGED' then now() else acknowledged_at end,resolved_at=case when target='RESOLVED' then now() else null end,resolution=p_data->>'reason',recipient_roles=case when target='ESCALATED' then array['emergency_coordinator','doctor']::public.staff_role[] else recipient_roles end where id=n.id;
  perform private.record_event(p_hospital,n.id,'alert.'||lower(target)); return jsonb_build_object('ok',true);
 end if;
 if p_action='release' then
  if r not in ('resource_manager','emergency_coordinator','nurse','doctor') then raise exception 'Resource role required'; end if;
  select * into rec from public.hospital_resources where id=(p_data->>'resource_id')::uuid and hospital_id=p_hospital for update;
  if not found then raise exception 'Resource unavailable'; end if;
  update public.resource_reservations set released_at=now() where resource_id=rec.id and released_at is null;
  update public.hospital_resources set status=case when rec.status in ('RESERVED','OCCUPIED') then 'CLEANING' else 'AVAILABLE' end where id=rec.id;
  perform private.record_event(p_hospital,rec.id,'resource.released_or_cleaned'); return jsonb_build_object('ok',true);
 end if;
 select * into e from public.patient_encounters where id=(p_data->>'encounter_id')::uuid and hospital_id=p_hospital for update;
 if not found then raise exception 'Encounter unavailable'; end if;
 if p_data ? 'version' and e.version<>(p_data->>'version')::integer then raise exception 'Conflict: record changed. Refresh and review before retrying.' using errcode='40001'; end if;
 if e.status in ('DISCHARGED','ADMITTED','TRANSFERRED','CANCELLED') then raise exception 'Encounter is closed'; end if;
 if p_action='token' then
  if r not in ('receptionist','triage_nurse','nurse','doctor') then raise exception 'Registration role required'; end if;
  update public.encounter_access_tokens set revoked_at=now() where encounter_id=e.id and revoked_at is null;
  raw_token:=encode(extensions.gen_random_bytes(32),'hex');
  insert into public.encounter_access_tokens(hospital_id,encounter_id,token_hash) values(p_hospital,e.id,encode(extensions.digest(raw_token,'sha256'),'hex'));
  perform private.record_event(p_hospital,e.id,'token.rotated'); return jsonb_build_object('token',raw_token);
 elsif p_action='assess' then
  if r not in ('triage_nurse','nurse','doctor') then raise exception 'Clinical role required'; end if;
  if length(trim(coalesce(p_data->>'reason','')))<5 then raise exception 'Clinical reason required'; end if;
  confirmed:=(p_data->>'category')::public.triage_category;
  sign_count:=jsonb_array_length(coalesce(p_data->'input'->'warningSigns','[]'));
  proposed:=case when sign_count>0 then 'RED'::public.triage_category else 'ASSESSMENT_REQUIRED'::public.triage_category end;
  if (sign_count>0 or e.emergency) and confirmed<>'RED' and r<>'doctor' then raise exception 'Doctor review required to downgrade emergency'; end if;
  if confirmed<>'ASSESSMENT_REQUIRED' and coalesce((p_data->'input'->>'verified')::boolean,false)=false then raise exception 'Human verification required'; end if;
  v:=p_data->'input'->'vitals';
  insert into public.vital_signs(hospital_id,encounter_id,actor,pulse,spo2,respiratory_rate,systolic,temperature) values(p_hospital,e.id,auth.uid(),(v->>'pulse')::numeric,(v->>'spo2')::numeric,(v->>'respiratoryRate')::numeric,(v->>'systolic')::numeric,(v->>'temperature')::numeric);
  insert into public.triage_assessments(hospital_id,encounter_id,actor,proposed_category,confirmed_category,reason,input,result) values(p_hospital,e.id,auth.uid(),proposed,confirmed,p_data->>'reason',p_data->'input',jsonb_build_object('category',proposed,'score',null,'note','Human decision recorded; unvalidated score not authoritative'));
  oldstatus:=e.status;
  update public.patient_encounters set category=confirmed,emergency=(confirmed='RED' and (sign_count>0 or e.emergency)),score=null,deteriorating=coalesce((p_data->'input'->>'worsening')::boolean,false),symptoms=coalesce(p_data->'input'->>'symptoms',symptoms),status=case when status in ('REGISTERED','TRIAGE_PENDING') and confirmed<>'ASSESSMENT_REQUIRED' then 'TRIAGE_COMPLETED' else status end,reassessment_due=now()+make_interval(mins=>(select reassessment_minutes from public.hospital_settings where hospital_id=p_hospital)),version=version+1,updated_at=now() where id=e.id returning * into e;
  if oldstatus<>e.status then insert into public.patient_status_events(hospital_id,encounter_id,actor,from_status,to_status,reason) values(p_hospital,e.id,auth.uid(),oldstatus,e.status,p_data->>'reason'); end if;
  perform private.notify(p_hospital,e.id,confirmed,'Clinical reassessment: '||confirmed::text);
 elsif p_action='transition' then
  target:=p_data->>'status';
  if r not in ('doctor','nurse','triage_nurse','emergency_coordinator') then raise exception 'Clinical role required'; end if;
  if length(trim(coalesce(p_data->>'reason','')))<5 then raise exception 'Transition documentation required'; end if;
  if target in ('DISCHARGED','ADMITTED','REFERRED','TRANSFERRED','DISPOSITION') and r<>'doctor' then raise exception 'Doctor approval required'; end if;
  nexts:=case e.status when 'REGISTERED' then array['TRIAGE_PENDING','CANCELLED'] when 'TRIAGE_PENDING' then array['CANCELLED'] when 'TRIAGE_COMPLETED' then array['WAITING'] when 'WAITING' then array['STAFF_ASSIGNED','TRIAGE_PENDING'] when 'STAFF_ASSIGNED' then array['ASSESSMENT','TRIAGE_PENDING'] when 'ASSESSMENT' then array['DIAGNOSTICS','TREATMENT','DISPOSITION'] when 'DIAGNOSTICS' then array['ASSESSMENT','TREATMENT'] when 'TREATMENT' then array['DIAGNOSTICS','DISPOSITION'] when 'DISPOSITION' then array['DISCHARGED','ADMITTED','REFERRED'] when 'REFERRED' then array['TRANSFERRED'] else array[]::text[] end;
  if not target=any(nexts) then raise exception 'Invalid patient-flow transition'; end if;
  if target='STAFF_ASSIGNED' and not exists(select 1 from public.hospital_memberships where hospital_id=p_hospital and user_id=(p_data->>'assigned_to')::uuid and role in ('doctor','nurse','triage_nurse') and active) then raise exception 'Assign an active clinician'; end if;
  if target='ADMITTED' and not exists(select 1 from public.resource_reservations rr join public.hospital_resources hr on rr.resource_id=hr.id where rr.encounter_id=e.id and rr.released_at is null and hr.kind like '%bed') then raise exception 'Reserve an appropriate bed before admission'; end if;
  if target='REFERRED' and not exists(select 1 from public.referrals where encounter_id=e.id) then raise exception 'Create documented referral first'; end if;
  if target='TRANSFERRED' and not exists(select 1 from public.referrals where encounter_id=e.id and status='COMPLETED') then raise exception 'Complete receiving facility handover first'; end if;
  update public.patient_encounters set status=target,assigned_to=case when target='STAFF_ASSIGNED' then (p_data->>'assigned_to')::uuid else assigned_to end,version=version+1,updated_at=now() where id=e.id;
  insert into public.patient_status_events(hospital_id,encounter_id,actor,from_status,to_status,reason) values(p_hospital,e.id,auth.uid(),e.status,target,p_data->>'reason');
  if target in ('DISCHARGED','ADMITTED') then insert into public.treatment_records(hospital_id,encounter_id,actor,kind,note) values(p_hospital,e.id,auth.uid(),case when target='DISCHARGED' then 'Discharge' else 'Admission' end,p_data->>'reason'); end if;
  if target in ('DISCHARGED','TRANSFERRED','CANCELLED') then
   update public.hospital_resources set status='CLEANING' where id in(select resource_id from public.resource_reservations where encounter_id=e.id and released_at is null);
   update public.resource_reservations set released_at=now() where encounter_id=e.id and released_at is null;
   update public.encounter_access_tokens set revoked_at=now() where encounter_id=e.id and revoked_at is null;
  end if;
 elsif p_action='note' then
  if r not in ('doctor','nurse','triage_nurse') or (r<>'doctor' and p_data->>'kind' in ('Discharge','Admission','Investigation')) then raise exception 'Clinical permission required'; end if;
  insert into public.treatment_records(hospital_id,encounter_id,actor,kind,note) values(p_hospital,e.id,auth.uid(),p_data->>'kind',p_data->>'note');
 elsif p_action='reserve' then
  if r not in ('resource_manager','emergency_coordinator','nurse','doctor') then raise exception 'Resource role required'; end if;
  select * into rec from public.hospital_resources where id=(p_data->>'resource_id')::uuid and hospital_id=p_hospital for update;
  if not found or rec.status<>'AVAILABLE' then raise exception 'Resource unavailable; review alternatives without lowering urgency'; end if;
  insert into public.resource_reservations(hospital_id,resource_id,encounter_id,actor) values(p_hospital,rec.id,e.id,auth.uid());
  update public.hospital_resources set status='RESERVED' where id=rec.id;
 elsif p_action='referral' then
  if r<>'doctor' then raise exception 'Doctor required'; end if;
  if length(trim(coalesce(p_data->>'reason','')))<5 or length(trim(coalesce(p_data->>'summary','')))<5 then raise exception 'Referral reason and clinical summary required'; end if;
  insert into public.referrals(hospital_id,encounter_id,facility_id,doctor_id,reason,summary,transport) values(p_hospital,e.id,(p_data->>'facility_id')::uuid,auth.uid(),p_data->>'reason',p_data->>'summary',p_data->>'transport');
 elsif p_action='referral_status' then
  if r not in ('doctor','emergency_coordinator') then raise exception 'Referral role required'; end if;
  select * into ref from public.referrals where id=(p_data->>'id')::uuid and encounter_id=e.id and hospital_id=p_hospital for update;
  target:=p_data->>'status';
  if not found or target<>(case ref.status when 'REQUESTED' then 'CONTACTED' when 'CONTACTED' then 'ACCEPTED' when 'ACCEPTED' then 'DEPARTED' when 'DEPARTED' then 'ARRIVED' when 'ARRIVED' then 'COMPLETED' else '' end) then raise exception 'Invalid referral transition'; end if;
  if length(trim(coalesce(p_data->>'reason','')))<5 then raise exception 'Handover evidence required'; end if;
  update public.referrals set status=target,acknowledgement=p_data->>'reason',updated_at=now() where id=ref.id;
 else raise exception 'Unknown action';
 end if;
 perform private.record_event(p_hospital,e.id,'encounter.'||p_action,jsonb_build_object('reason',p_data->>'reason','status',p_data->>'status'));
 return jsonb_build_object('ok',true,'id',e.id);
end $$;
revoke all on function public.staff_command(uuid,text,jsonb) from public,anon;
grant execute on function public.staff_command(uuid,text,jsonb) to authenticated;

create function public.patient_portal(p_token text,p_action text,p_data jsonb default '{}') returns jsonb language plpgsql security definer set search_path='' as $$
declare t public.encounter_access_tokens; e public.patient_encounters; hash text; cnt integer; emergency boolean;
begin
 if length(p_token)<>64 or p_token !~ '^[a-f0-9]+$' then raise exception 'Link unavailable or expired'; end if;
 hash:=encode(extensions.digest(p_token,'sha256'),'hex');
 insert into private.request_limits(bucket,attempts) values(hash,1) on conflict(bucket) do update set attempts=case when request_limits.window_at<now()-interval '1 minute' then 1 else request_limits.attempts+1 end,window_at=case when request_limits.window_at<now()-interval '1 minute' then now() else request_limits.window_at end returning attempts into cnt;
 if cnt>30 then return jsonb_build_object('error','Too many requests. Please wait a minute.'); end if;
 select * into t from public.encounter_access_tokens where token_hash=hash and revoked_at is null and expires_at>now() for update;
 if not found then return jsonb_build_object('error','Link unavailable or expired'); end if;
 select * into e from public.patient_encounters where id=t.encounter_id for update;
 if p_action='status' then return jsonb_build_object('reference',e.reference,'status',e.status,'submitted',t.submitted_at is not null,'emergency',e.emergency); end if;
 if e.status in ('DISCHARGED','ADMITTED','TRANSFERRED','CANCELLED') then raise exception 'Encounter closed'; end if;
 if p_action='emergency' then
  if not e.emergency then
   update public.patient_encounters set emergency=true,category='RED',deteriorating=true,version=version+1,updated_at=now() where id=e.id;
   perform private.notify(e.hospital_id,e.id,'RED','Patient requests immediate emergency assistance');
   perform private.record_event(e.hospital_id,e.id,'patient.emergency_reported');
  end if;
 elsif p_action='intake' then
  if t.submitted_at is not null then return jsonb_build_object('reference',e.reference,'duplicate',true); end if;
  if coalesce((p_data->>'consent')::boolean,false)=false or length(trim(coalesce(p_data->>'symptoms','')))<2 or length(p_data::text)>20000 then raise exception 'Consent and symptoms required'; end if;
  emergency:=coalesce((p_data->>'emergency')::boolean,false);
  update public.patient_encounters set intake=p_data,symptoms=p_data->>'symptoms',emergency=e.emergency or emergency,category=case when e.emergency or emergency then 'RED'::public.triage_category else category end,version=version+1,updated_at=now() where id=e.id;
  update public.encounter_access_tokens set submitted_at=now() where id=t.id;
  perform private.notify(e.hospital_id,e.id,case when emergency then 'RED'::public.triage_category else e.category end,'Patient intake submitted; human verification required');
  perform private.record_event(e.hospital_id,e.id,'patient.intake_submitted');
 else raise exception 'Invalid portal action'; end if;
 return jsonb_build_object('reference',e.reference,'ok',true);
end $$;
revoke all on function public.patient_portal(text,text,jsonb) from public;
grant execute on function public.patient_portal(text,text,jsonb) to anon,authenticated;

alter publication supabase_realtime add table public.patient_encounters,public.notifications,public.hospital_resources;
