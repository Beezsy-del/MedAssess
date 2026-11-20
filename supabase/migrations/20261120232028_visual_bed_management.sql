-- Physical ward map and clinician-reviewed placement. Synthetic use only.
alter table public.hospital_resources drop constraint hospital_resources_status_check;
alter table public.hospital_resources add constraint hospital_resources_status_check check(status in ('AVAILABLE','RESERVED','OCCUPIED','CLEANING','MAINTENANCE','BLOCKED'));
alter table public.hospital_resources add column version integer not null default 1;
alter table public.resource_reservations add column hold_until timestamptz;
create table public.bed_wards(
 id uuid primary key default gen_random_uuid(), hospital_id uuid not null references public.hospitals,
 department_id uuid not null, name text not null check(length(name) between 1 and 100),
 zone text not null check(zone in ('critical','high','standard','ambulatory','unconfigured')),
 categories public.triage_category[] not null default '{}', display_order integer not null default 0,
 unique(id,hospital_id),unique(hospital_id,name),foreign key(department_id,hospital_id) references public.departments(id,hospital_id)
);
create table public.bed_profiles(
 resource_id uuid primary key, hospital_id uuid not null references public.hospitals, ward_id uuid not null,
 row_number integer not null check(row_number between 1 and 30), column_number integer not null check(column_number between 1 and 12),
 capabilities text[] not null default '{}', verified boolean not null default false, restrictions text not null default '',
 unique(ward_id,row_number,column_number),
 foreign key(resource_id,hospital_id) references public.hospital_resources(id,hospital_id),
 foreign key(ward_id,hospital_id) references public.bed_wards(id,hospital_id)
);
create table public.bed_placement_plans(
 encounter_id uuid primary key, hospital_id uuid not null references public.hospitals,
 decision text not null check(decision in ('BED_REQUIRED','NO_BED','AWAITING','OTHER')),
 ward_id uuid, bed_kind text, required_capabilities text[] not null default '{}',
 reason text not null check(length(trim(reason)) between 5 and 3000), actor uuid not null references auth.users,
 reviewed_at timestamptz not null default now(), encounter_version integer not null,
 foreign key(encounter_id,hospital_id) references public.patient_encounters(id,hospital_id),
 foreign key(ward_id,hospital_id) references public.bed_wards(id,hospital_id)
);
create table public.bed_allocation_events(
 id uuid primary key default gen_random_uuid(), hospital_id uuid not null references public.hospitals,
 encounter_id uuid, resource_id uuid, actor uuid references auth.users, action text not null,
 details jsonb not null default '{}', created_at timestamptz not null default now(),
 foreign key(encounter_id,hospital_id) references public.patient_encounters(id,hospital_id),
 foreign key(resource_id,hospital_id) references public.hospital_resources(id,hospital_id)
);
create index bed_events_hospital on public.bed_allocation_events(hospital_id,created_at desc);
create index bed_profiles_hospital on public.bed_profiles(hospital_id);
create index bed_wards_hospital on public.bed_wards(hospital_id);
create index bed_plans_hospital on public.bed_placement_plans(hospital_id);
create table private.bed_operations(hospital_id uuid not null, operation_id uuid not null, actor uuid not null, request jsonb not null, result jsonb not null, primary key(hospital_id,operation_id));
alter table private.bed_operations enable row level security;
revoke all on private.bed_operations from public,anon,authenticated;
do $$ declare t text; begin
 foreach t in array array['bed_wards','bed_profiles','bed_placement_plans','bed_allocation_events'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from public,anon,authenticated',t);
 execute format('grant select on public.%I to authenticated',t);
 execute format('create policy bed_team_read on public.%I for select to authenticated using(private.role_for(hospital_id) in (''nurse'',''triage_nurse'',''doctor'',''resource_manager'',''emergency_coordinator'',''hospital_admin'',''super_admin''))',t);
 end loop;
end $$;
create function private.bed_resource_version() returns trigger language plpgsql set search_path='' as $$ begin new.version:=old.version+1; return new; end $$;
revoke all on function private.bed_resource_version() from public,anon,authenticated;
create trigger bed_resource_version before update on public.hospital_resources for each row execute function private.bed_resource_version();
-- All reservation mutations, including discharge/transfer, retain bed history.
create function private.bed_reservation_history() returns trigger language plpgsql security definer set search_path='' as $$ begin
 if exists(select 1 from public.hospital_resources where id=new.resource_id and kind like '%bed') then
  insert into public.bed_allocation_events(hospital_id,encounter_id,resource_id,actor,action,details)
  values(new.hospital_id,new.encounter_id,new.resource_id,auth.uid(),case when tg_op='INSERT' then 'assigned' else 'released' end,jsonb_build_object('reservation_id',new.id));
 end if; return new; end $$;
revoke all on function private.bed_reservation_history() from public,anon,authenticated;
create trigger bed_reservation_insert after insert on public.resource_reservations for each row execute function private.bed_reservation_history();
create trigger bed_reservation_release after update of released_at on public.resource_reservations for each row when(old.released_at is null and new.released_at is not null) execute function private.bed_reservation_history();
-- Seed physical positions/capabilities only for existing synthetic beds; no invented occupancy.
do $$ declare h record; d uuid; w uuid; k text; i integer; b record; begin
 for h in select id from public.hospitals where is_demo loop
  for k in select unnest(array['ICU bed','Emergency bed','General bed']) loop
   select id into d from public.departments where hospital_id=h.id order by case when name ilike '%emergency%' then 0 else 1 end,name limit 1;
   if d is null then continue; end if;
   insert into public.bed_wards(hospital_id,department_id,name,zone,categories,display_order)
   values(h.id,d,case k when 'ICU bed' then 'Critical care' when 'Emergency bed' then 'High acuity' else 'Treatment & observation' end,
    case k when 'ICU bed' then 'critical' when 'Emergency bed' then 'high' else 'standard' end,
    case k when 'ICU bed' then array['RED']::public.triage_category[] when 'Emergency bed' then array['RED','YELLOW']::public.triage_category[] else array['YELLOW','GREEN']::public.triage_category[] end,
    case k when 'ICU bed' then 1 when 'Emergency bed' then 2 else 3 end) returning id into w;
   i:=0;
   for b in select id from public.hospital_resources where hospital_id=h.id and kind=k order by name,id loop
    insert into public.bed_profiles(resource_id,hospital_id,ward_id,row_number,column_number,capabilities,verified,restrictions)
    values(b.id,h.id,w,1+i/5,1+i%5,case k when 'ICU bed' then array['oxygen','cardiac_monitor','ventilator'] when 'Emergency bed' then array['oxygen','cardiac_monitor'] else '{}'::text[] end,true,'Synthetic configuration only. Staff must verify suitability and equipment before use.');
    update public.hospital_resources set department_id=d where id=b.id;
    i:=i+1;
   end loop;
  end loop;
 end loop;
end $$;
create function private.bed_command(p_hospital uuid,p_action text,p_data jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare role public.staff_role; e public.patient_encounters; b public.hospital_resources; p public.bed_profiles; w public.bed_wards; plan public.bed_placement_plans; oldop private.bed_operations; op uuid; result jsonb; rr public.resource_reservations; caps text[]; target text; rid uuid; wid uuid;
begin
 role:=private.role_for(p_hospital);
 if auth.uid() is null or role is null or role not in ('nurse','triage_nurse','doctor','resource_manager','emergency_coordinator','hospital_admin','super_admin') then raise exception 'Bed access denied' using errcode='42501'; end if;
 if not exists(select 1 from public.hospitals where id=p_hospital and is_demo) then raise exception 'Clinical operations disabled'; end if;
 -- Consistent lock order with the public dispatcher prevents transfer/discharge deadlocks.
 perform pg_advisory_xact_lock(hashtextextended('beds:'||p_hospital::text,0));
 if p_action='bed_refresh' then
  for rr in select x.* from public.resource_reservations x join public.hospital_resources r on r.id=x.resource_id where x.hospital_id=p_hospital and x.released_at is null and x.hold_until<=now() and r.status='RESERVED' for update of x loop
   update public.resource_reservations set released_at=now() where id=rr.id;
   update public.hospital_resources set status='AVAILABLE' where id=rr.resource_id;
   perform private.record_event(p_hospital,rr.resource_id,'bed.hold_expired');
  end loop;
  return jsonb_build_object('ok',true);
 end if;
 op:=(p_data->>'operation_id')::uuid;
 if op is null then raise exception 'Operation required'; end if;
 select * into oldop from private.bed_operations where hospital_id=p_hospital and operation_id=op;
 if found then
  if oldop.actor<>auth.uid() or oldop.request<>jsonb_build_object('action',p_action,'data',p_data) then raise exception 'Changed retry' using errcode='PT409'; end if;
  return oldop.result;
 end if;
 if length(trim(coalesce(p_data->>'reason','')))<5 or length(p_data->>'reason')>3000 then raise exception 'Reason required'; end if;
 if p_action='bed_ward' then
  if role not in ('hospital_admin','super_admin','resource_manager') then raise exception 'Configuration permission required' using errcode='42501'; end if;
  insert into public.bed_wards(hospital_id,department_id,name,zone,categories,display_order)
  values(p_hospital,(p_data->>'department_id')::uuid,p_data->>'name',p_data->>'zone',array(select jsonb_array_elements_text(p_data->'categories'))::public.triage_category[],coalesce((p_data->>'display_order')::int,0)) returning id into wid;
  result:=jsonb_build_object('ok',true,'ward_id',wid);
 elsif p_action='bed_configure' then
  if role not in ('hospital_admin','super_admin','resource_manager') then raise exception 'Configuration permission required' using errcode='42501'; end if;
  select * into w from public.bed_wards where hospital_id=p_hospital and id=(p_data->>'ward_id')::uuid;
  if not found then raise exception 'Ward unavailable'; end if;
  rid:=nullif(p_data->>'resource_id','')::uuid;
  if rid is null then
   if p_data->>'kind' not in ('General bed','Emergency bed','ICU bed') then raise exception 'Bed type required'; end if;
   insert into public.hospital_resources(hospital_id,name,kind,department_id,location) values(p_hospital,p_data->>'name',p_data->>'kind',w.department_id,w.name) returning * into b;
  else
   select * into b from public.hospital_resources where id=rid and hospital_id=p_hospital for update;
   if not found or b.kind not like '%bed' or b.status in ('RESERVED','OCCUPIED') or b.version is distinct from (p_data->>'bed_version')::int then raise exception 'Bed changed or in use' using errcode='PT409'; end if;
   update public.hospital_resources set department_id=w.department_id,location=w.name where id=b.id;
  end if;
  caps:=array(select jsonb_array_elements_text(p_data->'capabilities'));
  if not caps <@ array['oxygen','cardiac_monitor','ventilator','isolation','negative_pressure','accessible'] then raise exception 'Unsupported capabilities'; end if;
  insert into public.bed_profiles(resource_id,hospital_id,ward_id,row_number,column_number,capabilities,verified,restrictions)
  values(b.id,p_hospital,w.id,(p_data->>'row_number')::int,(p_data->>'column_number')::int,caps,coalesce((p_data->>'verified')::boolean,false),coalesce(p_data->>'restrictions',''))
  on conflict(resource_id) do update set ward_id=excluded.ward_id,row_number=excluded.row_number,column_number=excluded.column_number,capabilities=excluded.capabilities,verified=excluded.verified,restrictions=excluded.restrictions;
  result:=jsonb_build_object('ok',true,'resource_id',b.id);
 elsif p_action='bed_status' then
  select * into b from public.hospital_resources where id=(p_data->>'resource_id')::uuid and hospital_id=p_hospital for update;
  if not found or b.kind not like '%bed' or b.version is distinct from (p_data->>'bed_version')::int then raise exception 'Bed changed' using errcode='PT409'; end if;
  target:=p_data->>'status';
  if exists(select 1 from public.resource_reservations where resource_id=b.id and released_at is null) then raise exception 'Release allocation first'; end if;
  if target='AVAILABLE' and (b.status<>'CLEANING' or (p_data->>'checks_confirmed')::boolean is distinct from true) then raise exception 'Cleaning and safety checks required'; end if;
  if target in ('MAINTENANCE','BLOCKED') and role not in ('resource_manager','hospital_admin','super_admin','emergency_coordinator') then raise exception 'Resource permission required' using errcode='42501'; end if;
  if target not in ('AVAILABLE','CLEANING','MAINTENANCE','BLOCKED') or target is null or b.status in ('OCCUPIED','RESERVED') then raise exception 'Invalid bed status'; end if;
  update public.hospital_resources set status=target where id=b.id;
  result:=jsonb_build_object('ok',true,'status',target,'resource_id',b.id);
 else
  select * into e from public.patient_encounters where hospital_id=p_hospital and id=(p_data->>'encounter_id')::uuid for update;
  if not found then raise exception 'Encounter unavailable'; end if;
  if e.version is distinct from (p_data->>'version')::int then raise exception 'Encounter changed' using errcode='PT409'; end if;
  if p_action='bed_plan' then
   if role not in ('nurse','triage_nurse','doctor') then raise exception 'Clinical review required' using errcode='42501'; end if;
   if e.status in ('DISCHARGED','TRANSFERRED','CANCELLED') or (p_data->>'reviewed')::boolean is distinct from true then raise exception 'Clinical review required'; end if;
   target:=p_data->>'decision'; caps:=array(select jsonb_array_elements_text(p_data->'required_capabilities'));
   if not caps <@ array['oxygen','cardiac_monitor','ventilator','isolation','negative_pressure','accessible'] then raise exception 'Unsupported requirements'; end if;
   wid:=nullif(p_data->>'ward_id','')::uuid;
   if target='BED_REQUIRED' then
    select * into w from public.bed_wards where id=wid and hospital_id=p_hospital;
    if not found or not(e.category=any(w.categories)) or e.category='ASSESSMENT_REQUIRED' or w.zone='unconfigured' or p_data->>'bed_kind' not in ('General bed','Emergency bed','ICU bed') or p_data->>'bed_kind' is null then raise exception 'Ward or care requirements incompatible' using errcode='PT428'; end if;
   elsif exists(select 1 from public.resource_reservations r join public.hospital_resources b on b.id=r.resource_id where r.encounter_id=e.id and r.released_at is null and b.kind like '%bed') then raise exception 'Release existing bed first';
   end if;
   insert into public.bed_placement_plans(encounter_id,hospital_id,decision,ward_id,bed_kind,required_capabilities,reason,actor,encounter_version)
   values(e.id,p_hospital,target,wid,nullif(p_data->>'bed_kind',''),caps,p_data->>'reason',auth.uid(),e.version)
   on conflict(encounter_id) do update set decision=excluded.decision,ward_id=excluded.ward_id,bed_kind=excluded.bed_kind,required_capabilities=excluded.required_capabilities,reason=excluded.reason,actor=excluded.actor,encounter_version=excluded.encounter_version,reviewed_at=now();
   if target='AWAITING' then insert into public.notifications(hospital_id,encounter_id,title,recipient_roles) values(p_hospital,e.id,'Bed placement pending — review capacity; preserve urgency',array['resource_manager','emergency_coordinator','doctor']::public.staff_role[]); end if;
   result:=jsonb_build_object('ok',true,'decision',target,'encounter_id',e.id);
  elsif p_action in ('bed_assign','bed_release') then
   if role not in ('nurse','triage_nurse','doctor','resource_manager','emergency_coordinator') then raise exception 'Allocation permission required' using errcode='42501'; end if;
   select * into b from public.hospital_resources where id=(p_data->>'resource_id')::uuid and hospital_id=p_hospital for update;
   if not found or b.kind not like '%bed' or b.version is distinct from (p_data->>'bed_version')::int then raise exception 'Bed changed' using errcode='PT409'; end if;
   if p_action='bed_release' then
    if not exists(select 1 from public.resource_reservations where resource_id=b.id and encounter_id=e.id and released_at is null) then raise exception 'Allocation changed' using errcode='PT409'; end if;
    update public.resource_reservations set released_at=now() where resource_id=b.id and encounter_id=e.id and released_at is null;
    update public.hospital_resources set status='CLEANING' where id=b.id;
    result:=jsonb_build_object('ok',true,'status','CLEANING','resource_id',b.id);
   else
    if e.status in ('DISCHARGED','TRANSFERRED','CANCELLED') or (p_data->>'confirmed')::boolean is distinct from true then raise exception 'Active encounter and confirmation required'; end if;
    select * into plan from public.bed_placement_plans where encounter_id=e.id and hospital_id=p_hospital;
    select * into p from public.bed_profiles where resource_id=b.id and hospital_id=p_hospital;
    select * into w from public.bed_wards where id=p.ward_id and hospital_id=p_hospital;
    if plan.encounter_version is distinct from e.version or plan.decision is distinct from 'BED_REQUIRED' or not coalesce(p.verified,false) or w.id is null or plan.ward_id is distinct from w.id or plan.bed_kind is distinct from b.kind or not coalesce(e.category=any(w.categories),false) or not coalesce(plan.required_capabilities<@p.capabilities,false) then raise exception 'Review current placement requirements and bed compatibility' using errcode='PT428'; end if;
    if b.status='RESERVED' then
     select * into rr from public.resource_reservations where resource_id=b.id and released_at is null;
     if rr.encounter_id is distinct from e.id or rr.hold_until is null or rr.hold_until<=now() then raise exception 'Bed reserved' using errcode='PT409'; end if;
    elsif b.status<>'AVAILABLE' then raise exception 'Bed unavailable' using errcode='PT409';
    end if;
    if exists(select 1 from public.resource_reservations x join public.hospital_resources y on y.id=x.resource_id where x.encounter_id=e.id and x.released_at is null and y.kind like '%bed' and y.id<>b.id) and (p_data->>'reassign')::boolean is distinct from true then raise exception 'Confirm reassignment'; end if;
    if coalesce((p_data->>'hold')::boolean,false) and exists(select 1 from public.resource_reservations x join public.hospital_resources y on y.id=x.resource_id where x.encounter_id=e.id and x.released_at is null and y.kind like '%bed' and y.id<>b.id) then raise exception 'Keep current bed until reassignment is confirmed'; end if;
    -- Release old bed and allocate target atomically. The old bed always needs turnover.
    update public.hospital_resources set status='CLEANING' where id in(select x.resource_id from public.resource_reservations x join public.hospital_resources y on y.id=x.resource_id where x.encounter_id=e.id and x.released_at is null and y.kind like '%bed' and y.id<>b.id);
    update public.resource_reservations x set released_at=now() where x.encounter_id=e.id and x.released_at is null and x.resource_id<>b.id and exists(select 1 from public.hospital_resources y where y.id=x.resource_id and y.kind like '%bed');
    target:=case when coalesce((p_data->>'hold')::boolean,false) then 'RESERVED' else 'OCCUPIED' end;
    if b.status='AVAILABLE' then
     insert into public.resource_reservations(hospital_id,resource_id,encounter_id,actor,hold_until) values(p_hospital,b.id,e.id,auth.uid(),case when target='RESERVED' then now()+interval '10 minutes' end);
    else
     update public.resource_reservations set hold_until=case when target='RESERVED' then now()+interval '10 minutes' end where id=rr.id;
    end if;
    update public.hospital_resources set status=target where id=b.id;
    result:=jsonb_build_object('ok',true,'resource_id',b.id,'encounter_id',e.id,'status',target);
   end if;
  else raise exception 'Unsupported bed action'; end if;
 end if;
 insert into public.bed_allocation_events(hospital_id,encounter_id,resource_id,actor,action,details) values(p_hospital,e.id,b.id,auth.uid(),p_action,p_data-'operation_id');
 perform private.record_event(p_hospital,coalesce(e.id,b.id,wid),p_action,p_data-'operation_id');
 insert into private.bed_operations values(p_hospital,op,auth.uid(),jsonb_build_object('action',p_action,'data',p_data),result);
 return result;
end $$;
revoke all on function private.bed_command(uuid,text,jsonb) from public,anon,authenticated;
-- Retain existing intake and clinical workflows, but close generic bed mutation bypasses.
alter function public.staff_command(uuid,text,jsonb) rename to intake_command;
alter function public.intake_command(uuid,text,jsonb) set schema private;
revoke all on function private.intake_command(uuid,text,jsonb) from public,anon,authenticated;
create function public.staff_command(p_hospital uuid,p_action text,p_data jsonb) returns jsonb language plpgsql security definer set search_path='' as $$ begin
 if auth.uid() is null or private.role_for(p_hospital) is null then raise exception 'Access denied' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtextextended('beds:'||p_hospital::text,0));
 if p_action like 'bed_%' then return private.bed_command(p_hospital,p_action,p_data); end if;
 if p_action in ('reserve','release','maintenance') and exists(select 1 from public.hospital_resources where id=(p_data->>'resource_id')::uuid and hospital_id=p_hospital and kind like '%bed') then raise exception 'Use reviewed bed allocation workflow' using errcode='PT428'; end if;
 return private.intake_command(p_hospital,p_action,p_data);
end $$;
revoke all on function public.staff_command(uuid,text,jsonb) from public,anon;
grant execute on function public.staff_command(uuid,text,jsonb) to authenticated;
alter publication supabase_realtime add table public.bed_placement_plans,public.bed_profiles,public.bed_wards;
