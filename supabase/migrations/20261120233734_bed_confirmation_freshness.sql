-- Bind confirmation to the exact clinical plan and current reservation.
-- Disambiguate resource alias from the selected bed record for non-bed destinations.
create or replace function private.bed_command(p_hospital uuid,p_action text,p_data jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
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
   elsif exists(select 1 from public.resource_reservations r join public.hospital_resources resource on resource.id=r.resource_id where r.encounter_id=e.id and r.released_at is null and resource.kind like '%bed') then raise exception 'Release existing bed first';
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
    if plan.reviewed_at is distinct from (p_data->>'plan_reviewed_at')::timestamptz then raise exception 'Placement review changed' using errcode='PT409'; end if;
    if nullif(p_data->>'expected_reservation_id','')::uuid is distinct from (select x.id from public.resource_reservations x where x.encounter_id=e.id and x.is_bed and x.released_at is null) then raise exception 'Current bed allocation changed' using errcode='PT409'; end if;
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
