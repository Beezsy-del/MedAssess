-- Additive workflow records. Existing clinical categories are never inferred or changed.
create table public.reassessment_records (
 id uuid primary key default gen_random_uuid(), hospital_id uuid not null references public.hospitals,
 encounter_id uuid not null, actor uuid references auth.users, reason text not null check(length(reason)>=5),
 source text not null check(source in ('staff','waiting_time','deterioration')),
 created_at timestamptz not null default now(), resolved_at timestamptz, resolved_by uuid references auth.users,
 foreign key(encounter_id,hospital_id) references public.patient_encounters(id,hospital_id)
);
create unique index one_open_reassessment on public.reassessment_records(encounter_id) where resolved_at is null;
create table public.resource_shortages (
 id uuid primary key default gen_random_uuid(), hospital_id uuid not null references public.hospitals,
 encounter_id uuid not null, actor uuid not null references auth.users, kind text not null,
 reason text not null check(length(reason)>=5), created_at timestamptz not null default now(),
 foreign key(encounter_id,hospital_id) references public.patient_encounters(id,hospital_id)
);
create table public.resource_status_history (
 id uuid primary key default gen_random_uuid(), hospital_id uuid not null references public.hospitals,
 resource_id uuid not null, actor uuid references auth.users, from_status text, to_status text not null,
 created_at timestamptz not null default now(), foreign key(resource_id,hospital_id) references public.hospital_resources(id,hospital_id)
);
create table public.admissions (
 id uuid primary key default gen_random_uuid(), hospital_id uuid not null references public.hospitals,
 encounter_id uuid not null, actor uuid references auth.users, note text not null, created_at timestamptz not null default now(),
 unique(encounter_id), foreign key(encounter_id,hospital_id) references public.patient_encounters(id,hospital_id)
);
create table public.discharges (
 id uuid primary key default gen_random_uuid(), hospital_id uuid not null references public.hospitals,
 encounter_id uuid not null, actor uuid references auth.users, instructions text not null, created_at timestamptz not null default now(),
 unique(encounter_id), foreign key(encounter_id,hospital_id) references public.patient_encounters(id,hospital_id)
);
create table public.follow_up_records (
 id uuid primary key default gen_random_uuid(), hospital_id uuid not null references public.hospitals,
 encounter_id uuid not null, actor uuid not null references auth.users, instructions text not null check(length(instructions)>=5),
 due_at timestamptz not null, created_at timestamptz not null default now(),
 foreign key(encounter_id,hospital_id) references public.patient_encounters(id,hospital_id)
);
create table public.investigation_records (
 id uuid primary key default gen_random_uuid(), hospital_id uuid not null references public.hospitals,
 encounter_id uuid not null, actor uuid references auth.users, note text not null, treatment_record_id uuid not null unique references public.treatment_records,
 created_at timestamptz not null default now(), foreign key(encounter_id,hospital_id) references public.patient_encounters(id,hospital_id)
);
create table public.notification_acknowledgements (
 id uuid primary key default gen_random_uuid(), hospital_id uuid not null references public.hospitals,
 notification_id uuid not null references public.notifications, actor uuid references auth.users,
 status text not null, reason text, created_at timestamptz not null default now()
);
do $$ declare t text; begin
 foreach t in array array['reassessment_records','resource_shortages','resource_status_history','admissions','discharges','follow_up_records','investigation_records','notification_acknowledgements'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from public,anon,authenticated',t);
 execute format('grant select on public.%I to authenticated',t);
 execute format('create index on public.%I(hospital_id,created_at desc)',t);
 if t in ('admissions','discharges','follow_up_records','investigation_records') then
 execute format('create policy clinical_read on public.%I for select to authenticated using(private.role_for(hospital_id) in (''doctor'',''nurse'',''triage_nurse'',''emergency_coordinator''))',t);
 elsif t='notification_acknowledgements' then
 execute 'create policy recipient_read on public.notification_acknowledgements for select to authenticated using (exists(select 1 from public.notifications n where n.id=notification_id and n.hospital_id=notification_acknowledgements.hospital_id))';
 else
 execute format('create policy tenant_read on public.%I for select to authenticated using(private.role_for(hospital_id) is not null)',t);
 end if;
 end loop;
end $$;

create function private.workflow_history() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_table_name='hospital_resources' then
  if old.status is distinct from new.status then
   insert into public.resource_status_history(hospital_id,resource_id,actor,from_status,to_status) values(new.hospital_id,new.id,auth.uid(),old.status,new.status);
  end if;
 elsif tg_table_name='treatment_records' then
  if new.kind='Admission' then
   insert into public.admissions(hospital_id,encounter_id,actor,note,created_at) values(new.hospital_id,new.encounter_id,new.actor,new.note,new.created_at) on conflict(encounter_id) do nothing;
  elsif new.kind='Discharge' then
   insert into public.discharges(hospital_id,encounter_id,actor,instructions,created_at) values(new.hospital_id,new.encounter_id,new.actor,new.note,new.created_at) on conflict(encounter_id) do nothing;
  elsif new.kind='Investigation' then
   insert into public.investigation_records(hospital_id,encounter_id,actor,note,treatment_record_id,created_at) values(new.hospital_id,new.encounter_id,new.actor,new.note,new.id,new.created_at);
  end if;
 elsif tg_table_name='notifications' then
  if old.status is distinct from new.status then
   insert into public.notification_acknowledgements(hospital_id,notification_id,actor,status,reason) values(new.hospital_id,new.id,auth.uid(),new.status,new.resolution);
  end if;
 elsif tg_table_name='triage_assessments' then
  update public.reassessment_records set resolved_at=now(),resolved_by=new.actor where encounter_id=new.encounter_id and resolved_at is null;
 end if;
 return new;
end $$;
revoke all on function private.workflow_history() from public,anon,authenticated;
create trigger resource_history after update of status on public.hospital_resources for each row execute function private.workflow_history();
create trigger disposition_history after insert on public.treatment_records for each row execute function private.workflow_history();
create trigger notification_history after update of status on public.notifications for each row execute function private.workflow_history();
create trigger reassessment_completed after insert on public.triage_assessments for each row execute function private.workflow_history();
-- Backfill only records actually documented by earlier workflows.
insert into public.admissions(hospital_id,encounter_id,actor,note,created_at) select distinct on(encounter_id) hospital_id,encounter_id,actor,note,created_at from public.treatment_records where kind='Admission' order by encounter_id,created_at;
insert into public.discharges(hospital_id,encounter_id,actor,instructions,created_at) select distinct on(encounter_id) hospital_id,encounter_id,actor,note,created_at from public.treatment_records where kind='Discharge' order by encounter_id,created_at;
insert into public.investigation_records(hospital_id,encounter_id,actor,note,treatment_record_id,created_at) select hospital_id,encounter_id,actor,note,id,created_at from public.treatment_records where kind='Investigation';

-- Keep the original transactional implementation private and delegate known actions.
alter function public.staff_command(uuid,text,jsonb) set schema private;
revoke all on function private.staff_command(uuid,text,jsonb) from public,anon,authenticated;
create function public.staff_command(p_hospital uuid,p_action text,p_data jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.staff_role; e public.patient_encounters; resource public.hospital_resources; task uuid;
begin
 r:=private.role_for(p_hospital);
 if auth.uid() is null or r is null then raise exception 'Access denied' using errcode='42501'; end if;
 if not exists(select 1 from public.hospitals where id=p_hospital and is_demo) then raise exception 'Clinical operational use disabled'; end if;
 if p_action not in ('reassessment','subpriority','shortage','maintenance','follow_up') then
  return private.staff_command(p_hospital,p_action,p_data);
 end if;
 if length(trim(coalesce(p_data->>'reason','')))<5 then raise exception 'Documentation required'; end if;
 if p_action='maintenance' then
  if r not in ('resource_manager','emergency_coordinator','hospital_admin','super_admin') then raise exception 'Resource permission required' using errcode='42501'; end if;
  select * into resource from public.hospital_resources where hospital_id=p_hospital and id=(p_data->>'resource_id')::uuid for update;
  if not found or resource.status not in ('AVAILABLE','CLEANING') or exists(select 1 from public.resource_reservations where resource_id=resource.id and released_at is null) then raise exception 'Resource must be free before maintenance'; end if;
  update public.hospital_resources set status='MAINTENANCE' where id=resource.id;
  perform private.record_event(p_hospital,resource.id,'resource.maintenance',jsonb_build_object('reason',p_data->>'reason'));
  return jsonb_build_object('ok',true);
 end if;
 select * into e from public.patient_encounters where hospital_id=p_hospital and id=(p_data->>'encounter_id')::uuid for update;
 if not found then raise exception 'Encounter unavailable'; end if;
 if p_data ? 'version' and e.version<>(p_data->>'version')::integer then raise exception 'Record changed' using errcode='PT409'; end if;
 if p_action='follow_up' then
  if r<>'doctor' then raise exception 'Doctor required' using errcode='42501'; end if;
  if (p_data->>'due_at')::timestamptz is null or (p_data->>'due_at')::timestamptz<=now() then raise exception 'Future follow-up date required'; end if;
  insert into public.follow_up_records(hospital_id,encounter_id,actor,instructions,due_at) values(p_hospital,e.id,auth.uid(),p_data->>'reason',(p_data->>'due_at')::timestamptz);
 else
  if e.status in ('DISCHARGED','ADMITTED','TRANSFERRED','CANCELLED') then raise exception 'Encounter is closed'; end if;
  if p_action='shortage' then
   if r not in ('doctor','nurse','triage_nurse','emergency_coordinator','resource_manager') then raise exception 'Resource permission required' using errcode='42501'; end if;
   if p_data->>'kind' not in ('General bed','Emergency bed','ICU bed','Stretcher','Wheelchair','Equipment') or p_data->>'kind' is null then raise exception 'Resource kind required'; end if;
   insert into public.resource_shortages(hospital_id,encounter_id,actor,kind,reason) values(p_hospital,e.id,auth.uid(),p_data->>'kind',p_data->>'reason');
   insert into public.notifications(hospital_id,encounter_id,title,recipient_roles) values(p_hospital,e.id,'Resource shortage — review alternatives; preserve urgency',array['emergency_coordinator','resource_manager','doctor']::public.staff_role[]);
  else
   if r not in ('doctor','nurse','triage_nurse') then raise exception 'Clinical permission required' using errcode='42501'; end if;
   if p_action='subpriority' then
    if p_data->>'sub_priority' is null then raise exception 'Subpriority required'; end if;
    update public.patient_encounters set sub_priority=(p_data->>'sub_priority')::integer,version=version+1,updated_at=now() where id=e.id;
   else
    insert into public.reassessment_records(hospital_id,encounter_id,actor,reason,source) values(p_hospital,e.id,auth.uid(),p_data->>'reason','deterioration') on conflict(encounter_id) where resolved_at is null do nothing returning id into task;
    update public.patient_encounters set deteriorating=true,reassessment_due=now(),version=version+1,updated_at=now() where id=e.id;
    if task is not null then perform private.notify(p_hospital,e.id,e.category,'Deterioration reported — reassessment required'); end if;
   end if;
  end if;
 end if;
 perform private.record_event(p_hospital,e.id,'encounter.'||p_action,p_data - 'encounter_id');
 return jsonb_build_object('ok',true);
end $$;
revoke all on function public.staff_command(uuid,text,jsonb) from public,anon;
grant execute on function public.staff_command(uuid,text,jsonb) to authenticated;

alter function public.escalate_alerts(uuid) set schema private;
revoke all on function private.escalate_alerts(uuid) from public,anon,authenticated;
create function public.escalate_alerts(p_hospital uuid) returns integer language plpgsql security definer set search_path='' as $$
declare e public.patient_encounters; task uuid; result integer;
begin
 if auth.uid() is null or private.role_for(p_hospital) is null then raise exception 'Access denied' using errcode='42501'; end if;
 result:=private.escalate_alerts(p_hospital);
 for e in select * from public.patient_encounters where hospital_id=p_hospital and reassessment_due<=now() and status not in ('DISCHARGED','ADMITTED','TRANSFERRED','CANCELLED') for update loop
  insert into public.reassessment_records(hospital_id,encounter_id,reason,source) values(p_hospital,e.id,'Waiting-time review is due; urgency unchanged','waiting_time') on conflict(encounter_id) where resolved_at is null do nothing returning id into task;
  if task is not null then
   perform private.notify(p_hospital,e.id,e.category,'Reassessment due — urgency unchanged');
   perform private.record_event(p_hospital,e.id,'reassessment.due');
  end if;
 end loop;
 return result;
end $$;
revoke all on function public.escalate_alerts(uuid) from public,anon;
grant execute on function public.escalate_alerts(uuid) to authenticated;
