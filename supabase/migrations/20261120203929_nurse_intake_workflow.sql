-- Additive patient demographics. Existing visits and clinical rules remain unchanged.
alter table public.patients add column date_of_birth date,
 add column identifier text check(length(identifier)<=80),
 add column emergency_contact text check(length(emergency_contact)<=300);
create unique index patient_identifier_unique on public.patients(hospital_id,lower(trim(identifier))) where nullif(trim(identifier),'') is not null;
create index patient_identity_lookup on public.patients(hospital_id,lower(trim(name)));
create index patient_dob_lookup on public.patients(hospital_id,date_of_birth);

-- Private receipts are not exposed through the Data API and contain no QR tokens.
create table private.intake_receipts(
 hospital_id uuid not null references public.hospitals,
 operation_id uuid not null, actor uuid not null references auth.users,
 request_hash text not null, result jsonb not null,
 created_at timestamptz not null default now(),primary key(hospital_id,operation_id)
);
alter table private.intake_receipts enable row level security;
revoke all on private.intake_receipts from public,anon,authenticated;

create function public.find_patients(p_hospital uuid,p_query text) returns setof public.patients
language plpgsql stable security invoker set search_path='' as $$
begin
 if auth.uid() is null or private.role_for(p_hospital) not in ('nurse','triage_nurse','doctor','receptionist') or private.role_for(p_hospital) is null then raise exception 'Registration role required' using errcode='42501'; end if;
 if length(trim(p_query))<2 or length(p_query)>160 then return; end if;
 return query select p.* from public.patients p where p.hospital_id=p_hospital and (
  strpos(lower(p.name),lower(trim(p_query)))>0 or strpos(p.id::text,lower(trim(p_query)))>0
  or strpos(lower(coalesce(p.identifier,'')),lower(trim(p_query)))>0
  or (length(regexp_replace(p_query,'[^0-9]','','g'))>=4 and strpos(regexp_replace(coalesce(p.phone,''),'[^0-9]','','g'),regexp_replace(p_query,'[^0-9]','','g'))>0)
  or p.date_of_birth::text=trim(p_query)
 ) order by p.name,p.id limit 26;
end $$;
revoke all on function public.find_patients(uuid,text) from public,anon;
grant execute on function public.find_patients(uuid,text) to authenticated;

-- Keep the existing command implementation, including every role/transition check.
alter function public.staff_command(uuid,text,jsonb) rename to workflow_command;
alter function public.workflow_command(uuid,text,jsonb) set schema private;
revoke all on function private.workflow_command(uuid,text,jsonb) from public,anon,authenticated;

create function private.complete_intake(p_hospital uuid,p_data jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 r public.staff_role; e public.patient_encounters; p public.patients;
 operation uuid; fingerprint text; receipt private.intake_receipts;
 registered jsonb; result jsonb; candidate uuid; dob date; pid uuid;
 confirmed public.triage_category; input jsonb; department uuid; reason text;
begin
 r:=private.role_for(p_hospital);
 if auth.uid() is null or r is null or r not in ('nurse','triage_nurse','doctor') then raise exception 'Clinical intake role required' using errcode='42501'; end if;
 if not exists(select 1 from public.hospitals where id=p_hospital and is_demo) then raise exception 'Clinical operational use disabled' using errcode='42501'; end if;
 operation:=(p_data->>'operation_id')::uuid;
 if operation is null then raise exception 'Operation required'; end if;
 fingerprint:=encode(extensions.digest(p_data::text,'sha256'),'hex');
 perform pg_advisory_xact_lock(hashtextextended(p_hospital::text||':'||operation::text,0));
 select * into receipt from private.intake_receipts where hospital_id=p_hospital and operation_id=operation;
 if found then
  if receipt.actor<>auth.uid() or receipt.request_hash<>fingerprint then raise exception 'Operation already used with different input' using errcode='PT409'; end if;
  return receipt.result||jsonb_build_object('duplicate',true);
 end if;
 if coalesce((p_data->>'identity_confirmed')::boolean,false)<>true then raise exception 'Identity confirmation required'; end if;
 confirmed:=(p_data->>'category')::public.triage_category;
 input:=p_data->'input'; reason:=trim(p_data->>'reason');
 if confirmed is null or length(coalesce(reason,''))<5 or length(reason)>3000 or jsonb_typeof(input)<>'object' or input is null then raise exception 'Assessment and explicit category required'; end if;
 if jsonb_typeof(input->'warningSigns') is distinct from 'array' or jsonb_typeof(input->'vitals') is distinct from 'object' or jsonb_typeof(input->'verified') is distinct from 'boolean' then raise exception 'Assessment information invalid'; end if;
 if length(coalesce(input->>'symptoms',''))>3000 or (input->>'pain')::numeric not between 0 and 10 then raise exception 'Assessment information invalid'; end if;
 department:=nullif(p_data->>'department_id','')::uuid;
 if department is not null and not exists(select 1 from public.departments where id=department and hospital_id=p_hospital) then raise exception 'Department unavailable' using errcode='42501'; end if;
 pid:=nullif(p_data->>'patient_id','')::uuid;
 if pid is not null then
  select * into p from public.patients where id=pid and hospital_id=p_hospital;
  if not found then raise exception 'Patient unavailable' using errcode='42501'; end if;
 end if;
 if nullif(p_data->>'encounter_id','') is not null then
  select * into e from public.patient_encounters where id=(p_data->>'encounter_id')::uuid and hospital_id=p_hospital for update;
  if not found or pid is null or e.patient_id<>pid then raise exception 'Patient encounter mismatch' using errcode='42501'; end if;
  if e.status not in ('REGISTERED','TRIAGE_PENDING') or (p_data->>'version')::integer is distinct from e.version then raise exception 'Encounter changed; review current record' using errcode='PT409'; end if;
  update public.patient_encounters set department_id=department where id=e.id;
 else
  -- Serialize identity matching and patient creation for this hospital.
  perform pg_advisory_xact_lock(hashtextextended(p_hospital::text||':patient-identity',0));
  if exists(select 1 from public.patient_encounters where hospital_id=p_hospital and idempotency_key=operation) then raise exception 'Operation belongs to another registration' using errcode='PT409'; end if;
  if pid is null then
   dob:=nullif(p_data->>'date_of_birth','')::date;
   if dob>current_date or dob<current_date-interval '130 years' then raise exception 'Date of birth invalid'; end if;
   if dob is not null and nullif(p_data->>'age','') is not null then raise exception 'Use date of birth or age'; end if;
   if not coalesce((p_data->>'unidentified')::boolean,false) then
    if length(trim(coalesce(p_data->>'name','')))<1 then raise exception 'Name required'; end if;
    select id into candidate from public.patients where hospital_id=p_hospital and not unidentified and (
     (nullif(trim(p_data->>'identifier'),'') is not null and lower(trim(identifier))=lower(trim(p_data->>'identifier')))
     or lower(trim(name))=lower(trim(p_data->>'name'))
    ) limit 1;
    if candidate is not null and length(trim(coalesce(p_data->>'duplicate_reason','')))<10 then raise exception 'Possible existing patient; verify identity before creating another record' using errcode='PT422'; end if;
   end if;
  elsif exists(select 1 from public.patient_encounters where hospital_id=p_hospital and patient_id=pid and status not in ('DISCHARGED','ADMITTED','TRANSFERRED','CANCELLED')) and length(trim(coalesce(p_data->>'new_visit_reason','')))<5 then
   raise exception 'Patient has an active visit; resume it or explain the new visit' using errcode='PT423';
  end if;
  registered:=private.staff_command(p_hospital,'register',p_data||jsonb_build_object('symptoms',coalesce(input->>'symptoms',''),'emergency',jsonb_array_length(input->'warningSigns')>0));
  select * into e from public.patient_encounters where id=(registered->>'id')::uuid;
  if pid is null then
   update public.patients set date_of_birth=dob,identifier=nullif(trim(p_data->>'identifier'),''),emergency_contact=nullif(trim(p_data->>'emergency_contact'),'') where id=e.patient_id returning * into p;
  end if;
 end if;
 -- Existing assessment command preserves recommendation, human decision, vitals,
 -- emergency downgrade restrictions, status events and notifications, atomically.
 perform private.staff_command(p_hospital,'assess',jsonb_build_object('encounter_id',e.id,'version',e.version,'category',confirmed,'reason',reason,'input',input));
 update public.patient_encounters set intake=intake||jsonb_build_object('arrival_method',coalesce(p_data->>'arrival_method',''),'medical_history',coalesce(p_data->>'history',''),'allergies',coalesce(p_data->>'allergies',''),'staff_notes',coalesce(p_data->>'notes',''),'recorded_by',auth.uid(),'recorded_at',now()) where id=e.id;
 select * into e from public.patient_encounters where id=e.id;
 if e.status='TRIAGE_COMPLETED' then
  perform private.staff_command(p_hospital,'transition',jsonb_build_object('encounter_id',e.id,'version',e.version,'status','WAITING','reason','Initial triage confirmed; entered assigned priority queue'));
  select * into e from public.patient_encounters where id=e.id;
 end if;
 select * into p from public.patients where id=e.patient_id;
 result:=jsonb_build_object('id',e.id,'patient_id',p.id,'name',p.name,'reference',e.reference,'category',e.category,'status',e.status,'department',coalesce((select name from public.departments where id=e.department_id),'Awaiting department assignment'),'registered_at',e.arrived_at,'confirmed_at',now(),'actor',auth.uid(),'actor_name',(select display_name from public.hospital_memberships where hospital_id=p_hospital and user_id=auth.uid()),'symptoms',e.symptoms,'reason',reason);
 perform private.record_event(p_hospital,e.id,'intake.confirmed',jsonb_build_object('patient_id',p.id,'category',confirmed,'operation_id',operation,'duplicate_reason',p_data->>'duplicate_reason','new_visit_reason',p_data->>'new_visit_reason'));
 insert into private.intake_receipts(hospital_id,operation_id,actor,request_hash,result) values(p_hospital,operation,auth.uid(),fingerprint,result);
 return result;
end $$;
revoke all on function private.complete_intake(uuid,jsonb) from public,anon,authenticated;

create function public.staff_command(p_hospital uuid,p_action text,p_data jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if p_action='intake' then return private.complete_intake(p_hospital,p_data); end if;
 return private.workflow_command(p_hospital,p_action,p_data);
end $$;
revoke all on function public.staff_command(uuid,text,jsonb) from public,anon;
grant execute on function public.staff_command(uuid,text,jsonb) to authenticated;
