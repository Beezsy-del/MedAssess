-- All new mutations are transactional, hospital-scoped and actor-attributed.
alter function public.staff_command(uuid,text,jsonb) rename to role_scoped_command;
alter function public.role_scoped_command(uuid,text,jsonb) set schema private;
revoke all on function private.role_scoped_command(uuid,text,jsonb) from public,anon,authenticated;
create unique index one_active_protocol_per_hospital on public.triage_protocol_versions(hospital_id) where status='active';
create function public.staff_command(p_hospital uuid,p_action text,p_data jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare r text; e public.patient_encounters; dest public.departments; ref public.department_referrals; saved private.portal_operations; result jsonb; op uuid; target uuid; next_status text; reason text; urgency public.triage_category; rec public.resource_requests; protocol public.triage_protocol_versions; row_id uuid; cfg jsonb; rule jsonb; field text; member public.hospital_memberships;
begin
 r:=private.role_for(p_hospital)::text;
 if auth.uid() is null or r is null then raise exception 'Access denied' using errcode='42501';end if;
 if not exists(select 1 from public.hospitals where id=p_hospital and is_demo) then raise exception 'Clinical use disabled' using errcode='42501';end if;
 if p_action in ('reserve','release','resource_restore','resource_clean') then return private.nonbed_resource_command(p_hospital,p_action,p_data);end if;
 if p_action='alert' and not exists(select 1 from public.notifications n where n.id=(p_data->>'id')::uuid and n.hospital_id=p_hospital and r=any(n.recipient_roles::text[]) and (n.recipient_user_id is null or n.recipient_user_id=auth.uid()) and (n.department_id is null or exists(select 1 from public.staff_department_memberships m where m.hospital_id=p_hospital and m.department_id=n.department_id and m.user_id=auth.uid()) or exists(select 1 from public.patient_encounters enc where enc.id=n.encounter_id and enc.hospital_id=p_hospital and enc.category='RED')) and (private.clinical_access(p_hospital,n.encounter_id) or (r in ('hospital_admin','super_admin','resource_manager') and n.title like 'Resource%'))) then raise exception 'Alert access denied' using errcode='42501';end if;
 if p_action not in ('opd_route','department_referral','department_referral_status','escalate_doctor','vitals','resource_request','resource_request_status','department_access','staff_access','staff_add','protocol_save','protocol_review','department_routing','resource_edit') then
  return private.role_scoped_command(p_hospital,p_action,p_data);
 end if;
 if (p_action in ('opd_route','escalate_doctor','vitals','resource_request') and r not in ('nurse','triage_nurse','doctor'))
 or (p_action in ('department_referral','protocol_save','protocol_review','department_routing') and r<>'doctor')
 or (p_action='department_referral_status' and r not in ('doctor','nurse','triage_nurse','emergency_coordinator'))
 or (p_action='resource_request_status' and r not in ('nurse','triage_nurse','doctor','resource_manager','emergency_coordinator'))
 or (p_action in ('department_access','staff_access','staff_add','resource_edit') and r not in ('hospital_admin','super_admin')) then raise exception 'Role cannot perform action' using errcode='42501';end if;
 op:=(p_data->>'operation_id')::uuid;reason:=trim(p_data->>'reason');
 if op is null or coalesce(length(reason),0) not between 5 and 3000 then raise exception 'Operation and reason required';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_hospital::text||op::text,0));
 select * into saved from private.portal_operations where hospital_id=p_hospital and operation_id=op;
 if found then
  if saved.actor<>auth.uid() or saved.request<>jsonb_build_object('action',p_action,'data',p_data) then raise exception 'Changed retry' using errcode='PT409';end if;
  return saved.result||'{"duplicate":true}'::jsonb;
 end if;
 if p_action in ('opd_route','department_referral','department_referral_status','escalate_doctor','vitals','resource_request') then
  select * into e from public.patient_encounters where id=(p_data->>'encounter_id')::uuid and hospital_id=p_hospital for update;
  if not found or not private.clinical_access(p_hospital,e.id) then raise exception 'Encounter access denied' using errcode='42501';end if;
  if e.status in ('DISCHARGED','TRANSFERRED','CANCELLED') then raise exception 'Encounter closed';end if;
  if e.version is distinct from (p_data->>'version')::integer then raise exception 'Encounter changed' using errcode='PT409';end if;
 end if;
 if p_action in ('opd_route','department_referral') then
  select * into dest from public.departments where id=(p_data->>'department_id')::uuid and hospital_id=p_hospital;
  if not found or dest.id is not distinct from e.department_id then raise exception 'Choose a different hospital department';end if;
  urgency:=case when p_action='opd_route' then e.category else (p_data->>'urgency')::public.triage_category end;
  if urgency is null or private.urgency_rank(urgency)<private.urgency_rank(e.category) then raise exception 'Referral cannot lower urgency';end if;
  if p_action='opd_route' and (e.emergency or e.category not in ('GREEN','YELLOW') or not dest.outpatient or dest.routing_reviewed_by is null or dest.routing_reviewed_at is null or not(e.category=any(dest.accepted_categories))) then raise exception 'Reviewed appropriate OPD destination required';end if;
  insert into public.department_referrals(hospital_id,encounter_id,from_department_id,to_department_id,kind,urgency,reason,observations,requested_by)
   values(p_hospital,e.id,e.department_id,dest.id,case when p_action='opd_route' then 'OPD' else 'REFERRAL' end,urgency,reason,coalesce(p_data->>'observations',''),auth.uid()) returning * into ref;
  insert into public.department_referral_events(hospital_id,referral_id,encounter_id,actor,status,reason) values(p_hospital,ref.id,e.id,auth.uid(),'REQUESTED',reason);
  insert into public.notifications(hospital_id,encounter_id,title,recipient_roles,department_id) values(p_hospital,e.id,'Department referral awaiting acknowledgement',array['doctor','nurse','triage_nurse']::public.staff_role[],dest.id);
  -- OPD routing assigns the destination queue now; referral movement waits for ARRIVED.
  update public.patient_encounters set department_id=case when p_action='opd_route' then dest.id else department_id end,assigned_to=case when p_action='opd_route' then null else assigned_to end,version=version+1,updated_at=now() where id=e.id;
  insert into public.patient_status_events(hospital_id,encounter_id,actor,from_status,to_status,reason) values(p_hospital,e.id,auth.uid(),e.status,e.status,case when p_action='opd_route' then 'Directed to OPD: ' else 'Department referral requested: ' end||dest.name||'. '||reason);
  result:=jsonb_build_object('ok',true,'id',ref.id);
 elsif p_action='department_referral_status' then
  select * into ref from public.department_referrals where id=(p_data->>'id')::uuid and hospital_id=p_hospital and encounter_id=e.id for update;
  if not found or ref.version is distinct from (p_data->>'referral_version')::integer then raise exception 'Referral changed' using errcode='PT409';end if;
  next_status:=p_data->>'status';
  if next_status='CANCELLED' then
   if ref.kind='OPD' then raise exception 'OPD routing is already assigned; arrange an explicit onward transfer';end if;
   if ref.requested_by<>auth.uid() or ref.status not in ('REQUESTED','ACKNOWLEDGED','ACCEPTED') then raise exception 'Only requester may cancel an unmoved referral' using errcode='42501';end if;
  else
   if not exists(select 1 from public.staff_department_memberships where hospital_id=p_hospital and user_id=auth.uid() and department_id=ref.to_department_id) then raise exception 'Receiving department membership required' using errcode='42501';end if;
   if next_status is distinct from (case ref.status when 'REQUESTED' then 'ACKNOWLEDGED' when 'ACKNOWLEDGED' then 'ACCEPTED' when 'ACCEPTED' then 'ARRIVED' when 'ARRIVED' then 'COMPLETED' else null end) or next_status is null then raise exception 'Invalid referral transition';end if;
  end if;
  update public.department_referrals set status=next_status,acknowledged_by=coalesce(acknowledged_by,auth.uid()),acknowledged_at=coalesce(acknowledged_at,now()),updated_at=now(),version=version+1 where id=ref.id;
  update public.patient_encounters set department_id=case when next_status='ARRIVED' then ref.to_department_id else department_id end,assigned_to=case when next_status='ARRIVED' then null else assigned_to end,version=version+1,updated_at=now() where id=e.id;
  insert into public.department_referral_events(hospital_id,referral_id,encounter_id,actor,status,reason) values(p_hospital,ref.id,e.id,auth.uid(),next_status,reason);
  insert into public.patient_status_events(hospital_id,encounter_id,actor,from_status,to_status,reason) values(p_hospital,e.id,auth.uid(),e.status,e.status,'Department referral '||next_status||': '||reason);
  result:='{"ok":true}';
 elsif p_action='escalate_doctor' then
  insert into public.notifications(hospital_id,encounter_id,title,recipient_roles,department_id) values(p_hospital,e.id,'Nurse requests doctor review: '||reason,array['doctor','emergency_coordinator']::public.staff_role[],e.department_id);
  insert into public.reassessment_records(hospital_id,encounter_id,actor,reason,source) values(p_hospital,e.id,auth.uid(),reason,'deterioration') on conflict(encounter_id) where resolved_at is null do nothing;
  result:='{"ok":true}';
 elsif p_action='vitals' then
  insert into public.vital_signs(hospital_id,encounter_id,actor,pulse,spo2,respiratory_rate,systolic,temperature) values(p_hospital,e.id,auth.uid(),(p_data->>'pulse')::numeric,(p_data->>'spo2')::numeric,(p_data->>'respiratory_rate')::numeric,(p_data->>'systolic')::numeric,(p_data->>'temperature')::numeric);
  update public.patient_encounters set version=version+1,updated_at=now() where id=e.id;
  insert into public.reassessment_records(hospital_id,encounter_id,actor,reason,source) values(p_hospital,e.id,auth.uid(),'New measured observations require human review: '||reason,'deterioration') on conflict(encounter_id) where resolved_at is null do nothing;
  perform private.notify(p_hospital,e.id,e.category,'New measured observations require clinical review');result:='{"ok":true}';
 elsif p_action='department_access' then
  target:=(p_data->>'user_id')::uuid;
  if not exists(select 1 from public.hospital_memberships where hospital_id=p_hospital and user_id=target and active) or not exists(select 1 from public.departments where hospital_id=p_hospital and id=(p_data->>'department_id')::uuid) then raise exception 'Hospital membership and department required';end if;
  if p_data->'enabled'='true'::jsonb then
   insert into public.staff_department_memberships(hospital_id,user_id,department_id,assigned_by) values(p_hospital,target,(p_data->>'department_id')::uuid,auth.uid()) on conflict do nothing;
  elsif p_data->'enabled'='false'::jsonb then delete from public.staff_department_memberships where hospital_id=p_hospital and user_id=target and department_id=(p_data->>'department_id')::uuid;
  else raise exception 'Choose access state';end if;result:='{"ok":true}';
 elsif p_action='staff_add' then
  if p_data->>'role' not in ('doctor','nurse','triage_nurse','receptionist','resource_manager','emergency_coordinator') or length(trim(coalesce(p_data->>'display_name',''))) not between 2 and 160 then raise exception 'Invalid staff membership';end if;
  insert into public.hospital_memberships(hospital_id,user_id,role,display_name) values(p_hospital,(p_data->>'user_id')::uuid,(p_data->>'role')::public.staff_role,trim(p_data->>'display_name'));
  result:='{"ok":true}';
 elsif p_action='staff_access' then
  target:=(p_data->>'user_id')::uuid;
  perform pg_advisory_xact_lock(hashtextextended('membership:'||p_hospital::text,0));
  select * into member from public.hospital_memberships where hospital_id=p_hospital and user_id=target for update;
  if not found or target=auth.uid() or member.role='super_admin' or p_data->>'role' not in ('hospital_admin','doctor','nurse','triage_nurse','receptionist','resource_manager','emergency_coordinator') or jsonb_typeof(p_data->'active') is distinct from 'boolean' then raise exception 'Cannot modify this membership' using errcode='42501';end if;
  if member.role='hospital_admin' and member.active and (p_data->>'role'<>'hospital_admin' or p_data->'active'='false'::jsonb) and (select count(*) from public.hospital_memberships where hospital_id=p_hospital and active and role in ('hospital_admin','super_admin'))<2 then raise exception 'Keep an active hospital administrator';end if;
  update public.hospital_memberships set role=(p_data->>'role')::public.staff_role,active=(p_data->>'active')::boolean where id=member.id;result:='{"ok":true}';
 elsif p_action='department_routing' then
  if p_data->'reviewed' is distinct from 'true'::jsonb or jsonb_typeof(p_data->'categories') is distinct from 'array' or exists(select 1 from jsonb_array_elements_text(p_data->'categories') x where x not in ('GREEN','YELLOW')) then raise exception 'Review GREEN/YELLOW routing eligibility';end if;
  update public.departments set outpatient=true,accepted_categories=array(select jsonb_array_elements_text(p_data->'categories')::public.triage_category),routing_reviewed_by=auth.uid(),routing_reviewed_at=now() where hospital_id=p_hospital and id=(p_data->>'department_id')::uuid;
  if not found then raise exception 'Department unavailable';end if;result:='{"ok":true}';
 elsif p_action='resource_edit' then
  update public.hospital_resources set name=trim(p_data->>'name'),location=trim(p_data->>'location') where hospital_id=p_hospital and id=(p_data->>'resource_id')::uuid and length(trim(p_data->>'name')) between 1 and 160;
  if not found then raise exception 'Resource unavailable';end if;result:='{"ok":true}';
 elsif p_action='protocol_save' then
  cfg:=p_data->'configuration';
  if not private.protocol_shape(cfg) then raise exception 'Invalid protocol shape';end if;
  if jsonb_typeof(cfg->'rules') is distinct from 'array' or jsonb_array_length(cfg->'rules')>30 or length(coalesce(cfg->>'version','')) not between 1 and 60 or length(coalesce(cfg->>'name','')) not between 3 and 160 or cfg->>'reference' !~ '^https?://' then raise exception 'Invalid protocol configuration';end if;
  foreach field in array array['RED','YELLOW','GREEN','ASSESSMENT_REQUIRED'] loop
   if jsonb_typeof(cfg#>array['reassessment_minutes',field]) is distinct from 'number' or (cfg#>>array['reassessment_minutes',field])::numeric not between 1 and 240 then raise exception 'Invalid reassessment interval';end if;
  end loop;
  for rule in select value from jsonb_array_elements(cfg->'rules') loop
   if rule->>'category' not in ('GREEN','YELLOW','RED') or jsonb_typeof(rule->'all') is distinct from 'array' or jsonb_array_length(rule->'all')=0 or jsonb_typeof(rule->'requires') is distinct from 'array' or jsonb_array_length(rule->'requires')=0 then raise exception 'Explicit rule criteria required';end if;
  end loop;
  insert into public.triage_protocol_versions(hospital_id,name,version,reference,configuration) values(p_hospital,cfg->>'name',cfg->>'version',cfg->>'reference',cfg) returning id into row_id;result:=jsonb_build_object('ok',true,'id',row_id);
 elsif p_action='protocol_review' then
  perform pg_advisory_xact_lock(hashtextextended('protocol:'||p_hospital::text,0));
  select * into protocol from public.triage_protocol_versions where hospital_id=p_hospital and id=(p_data->>'id')::uuid for update;
  if not found or protocol.status<>'draft' or p_data->'reviewed' is distinct from 'true'::jsonb then raise exception 'Review a draft protocol';end if;
  if not private.protocol_shape(protocol.configuration) then raise exception 'Protocol configuration requires a valid reviewed schema';end if;
  update public.triage_protocol_versions set status='retired' where hospital_id=p_hospital and status='active';
  update public.triage_protocol_versions set status='active',reviewer=auth.uid(),approved_at=now(),effective_at=now() where id=protocol.id;result:='{"ok":true}';
 elsif p_action='resource_request' then
  if p_data->>'kind' not in ('Stretcher','Wheelchair','Equipment') then raise exception 'Unsupported requested resource';end if;
  insert into public.resource_requests(hospital_id,encounter_id,requested_by,kind,reason) values(p_hospital,e.id,auth.uid(),p_data->>'kind',reason) on conflict(encounter_id,kind) where status in ('REQUESTED','ACKNOWLEDGED') do nothing returning id into row_id;
  if row_id is null then select id into row_id from public.resource_requests where encounter_id=e.id and kind=p_data->>'kind' and status in ('REQUESTED','ACKNOWLEDGED');end if;
  result:=jsonb_build_object('ok',true,'id',row_id);
 elsif p_action='resource_request_status' then
  select * into rec from public.resource_requests where hospital_id=p_hospital and id=(p_data->>'id')::uuid;
  if not found then raise exception 'Request unavailable';end if;
  perform 1 from public.patient_encounters where id=rec.encounter_id and hospital_id=p_hospital for update;
  select * into rec from public.resource_requests where id=rec.id for update;
  if r<>'resource_manager' and not private.clinical_access(p_hospital,rec.encounter_id) then raise exception 'Encounter access denied' using errcode='42501';end if;
  next_status:=p_data->>'status';
  if not ((rec.status='REQUESTED' and next_status in ('ACKNOWLEDGED','CANCELLED')) or (rec.status='ACKNOWLEDGED' and next_status in ('FULFILLED','CANCELLED'))) then raise exception 'Invalid request transition';end if;
  if next_status='FULFILLED' then
   if not exists(select 1 from public.hospital_resources where hospital_id=p_hospital and id=(p_data->>'resource_id')::uuid and kind=rec.kind and kind not like '%bed') then raise exception 'Matching non-bed resource required';end if;
   perform private.nonbed_resource_command(p_hospital,'reserve',jsonb_build_object('encounter_id',rec.encounter_id,'resource_id',p_data->>'resource_id'));
   select id into row_id from public.resource_reservations where hospital_id=p_hospital and encounter_id=rec.encounter_id and resource_id=(p_data->>'resource_id')::uuid and released_at is null;
   if row_id is null then raise exception 'Allocation not confirmed';end if;
  end if;
  update public.resource_requests set status=next_status,acknowledged_by=coalesce(acknowledged_by,auth.uid()),reservation_id=coalesce(row_id,reservation_id),updated_at=now() where id=rec.id;result:='{"ok":true}';
 end if;
 if result is null then raise exception 'Unsupported action';end if;
 perform private.record_event(p_hospital,coalesce(e.id,row_id),'workflow.'||p_action,jsonb_build_object('operation_id',op,'reason',reason));
 insert into private.portal_operations(hospital_id,operation_id,actor,request,result) values(p_hospital,op,auth.uid(),jsonb_build_object('action',p_action,'data',p_data),result);
 return result;
end $$;
revoke all on function public.staff_command(uuid,text,jsonb) from public,anon;
grant execute on function public.staff_command(uuid,text,jsonb) to authenticated;

-- Department alerts are visible only to the receiving team; RED retains emergency access.
drop policy recipient_read on public.notifications;
create policy recipient_read on public.notifications for select to authenticated using(
 private.role_for(hospital_id)=any(recipient_roles) and (recipient_user_id is null or recipient_user_id=auth.uid()) and
 (department_id is null or exists(select 1 from public.staff_department_memberships m where m.hospital_id=notifications.hospital_id and m.department_id=notifications.department_id and m.user_id=auth.uid()) or exists(select 1 from public.patient_encounters e where e.id=notifications.encounter_id and e.category='RED')) and
 (private.clinical_access(hospital_id,encounter_id) or (private.role_for(hospital_id) in ('hospital_admin','super_admin','resource_manager') and title like 'Resource%'))
);
create policy resource_manager_requests on public.resource_requests for select to authenticated using(private.role_for(hospital_id)='resource_manager');

-- A single read-only snapshot replaces dozens of independent API round trips.
create function public.workspace_snapshot(p_hospital uuid) returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare result jsonb; directory jsonb; clinical boolean; es jsonb;
begin
 if auth.uid() is null or private.role_for(p_hospital) is null then raise exception 'Access denied' using errcode='42501';end if;
 clinical:=private.role_for(p_hospital) in ('nurse','triage_nurse','doctor','emergency_coordinator');
 directory:=public.workspace_directory(p_hospital);
 if clinical then
  select coalesce(jsonb_agg(to_jsonb(x)),'[]') into es from(select * from public.patient_encounters where hospital_id=p_hospital order by case when status in ('DISCHARGED','TRANSFERRED','CANCELLED') then 1 else 0 end,arrived_at desc limit 10001)x;
  if jsonb_array_length(es)>10000 then raise exception 'Demo snapshot capacity exceeded';end if;
 else es:=directory->'encounters';end if;
 result:=jsonb_build_object('encounters',es,'census',directory->'census','directory_truncated',coalesce(directory->'truncated','false'),'hospital',(select to_jsonb(x) from public.hospitals x where id=p_hospital));
 result:=result||jsonb_build_object('patients',case when clinical then (select coalesce(jsonb_agg(to_jsonb(p)),'[]') from public.patients p where p.hospital_id=p_hospital and exists(select 1 from jsonb_array_elements(es) e where (e->>'patient_id')::uuid=p.id)) else directory->'patients' end);
 result:=result||jsonb_build_object('settings',(select to_jsonb(s) from public.hospital_settings s where hospital_id=p_hospital));
 result:=result||jsonb_build_object('departments',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from(select * from public.departments where hospital_id=p_hospital limit 10000)x));
 result:=result||jsonb_build_object('notifications',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from(select * from public.notifications where hospital_id=p_hospital order by created_at desc limit 1000)x));
 result:=result||jsonb_build_object('resources',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from(select r.*, (select max(h.created_at) from public.resource_status_history h where h.resource_id=r.id and h.hospital_id=p_hospital) as status_updated_at from public.hospital_resources r where hospital_id=p_hospital limit 10000)x));
 result:=result||jsonb_build_object('reservations',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from(select * from public.resource_reservations where hospital_id=p_hospital and released_at is null limit 10000)x));
 result:=result||jsonb_build_object('staff',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from(select * from public.hospital_memberships where hospital_id=p_hospital limit 10000)x));
 result:=result||jsonb_build_object('facilities',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from(select * from public.referral_facilities where hospital_id=p_hospital limit 10000)x));
 result:=result||jsonb_build_object('referrals',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from(select * from public.referrals where hospital_id=p_hospital limit 10000)x));
 result:=result||jsonb_build_object('events',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from(select * from public.patient_status_events where hospital_id=p_hospital order by created_at desc limit 1000)x));
 result:=result||jsonb_build_object('assessments',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from(select * from public.triage_assessments where hospital_id=p_hospital order by created_at desc limit 1000)x));
 result:=result||jsonb_build_object('notes',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from(select * from public.treatment_records where hospital_id=p_hospital order by created_at desc limit 1000)x));
 result:=result||jsonb_build_object('protocols',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from(select * from public.triage_protocol_versions where hospital_id=p_hospital limit 10000)x));
 result:=result||jsonb_build_object('shifts',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from(select * from public.staff_shifts where hospital_id=p_hospital limit 10000)x));
 result:=result||jsonb_build_object('vitals',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from(select * from public.vital_signs where hospital_id=p_hospital order by created_at desc limit 1000)x));
 result:=result||jsonb_build_object('reassessments',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from(select * from public.reassessment_records where hospital_id=p_hospital order by created_at desc limit 1000)x));
 result:=result||jsonb_build_object('shortages',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from(select * from public.resource_shortages where hospital_id=p_hospital order by created_at desc limit 1000)x));
 result:=result||jsonb_build_object('followUps',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from(select * from public.follow_up_records where hospital_id=p_hospital order by created_at desc limit 1000)x));
 result:=result||jsonb_build_object('wards',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from(select * from public.bed_wards where hospital_id=p_hospital limit 10000)x));
 result:=result||jsonb_build_object('bedProfiles',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from(select * from public.bed_profiles where hospital_id=p_hospital limit 10000)x));
 result:=result||jsonb_build_object('bedPlans',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from(select * from public.bed_placement_plans where hospital_id=p_hospital limit 10000)x));
 result:=result||jsonb_build_object('bedEvents',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from(select * from public.bed_allocation_events where hospital_id=p_hospital order by created_at desc limit 1000)x));
 result:=result||jsonb_build_object('patientReports',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from(select * from public.patient_reports where hospital_id=p_hospital order by submitted_at desc limit 1000)x));
 result:=result||jsonb_build_object('preliminaryAssessments',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from(select * from public.preliminary_assessments where hospital_id=p_hospital order by created_at desc limit 1000)x));
 result:=result||jsonb_build_object('departmentReferrals',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from(select * from public.department_referrals where hospital_id=p_hospital order by created_at desc limit 1000)x));
 result:=result||jsonb_build_object('departmentReferralEvents',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from(select * from public.department_referral_events where hospital_id=p_hospital order by created_at desc limit 1000)x));
 result:=result||jsonb_build_object('departmentMemberships',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from(select * from public.staff_department_memberships where hospital_id=p_hospital limit 10000)x));
 result:=result||jsonb_build_object('resourceRequests',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from(select * from public.resource_requests where hospital_id=p_hospital order by created_at desc limit 1000)x));
 result:=result||jsonb_build_object('audit',case when clinical then '[]'::jsonb else directory->'audit' end);
 return result;
end $$;
revoke all on function public.workspace_snapshot(uuid) from public,anon;
grant execute on function public.workspace_snapshot(uuid) to authenticated;

-- Resource-shortage reasons are clinical records, not administrative directory data.
drop policy tenant_read on public.resource_shortages;
create policy shortage_team_read on public.resource_shortages for select to authenticated using(private.clinical_access(hospital_id,encounter_id) or private.role_for(hospital_id)='resource_manager');

-- Time raises an attributable system review task; it never changes clinical urgency.
create function private.workflow_tick() returns integer language plpgsql security definer set search_path='' as $$
declare h uuid; e record; rr record; task uuid; total integer:=0;
begin
 for h in select id from public.hospitals where is_demo loop
  perform pg_advisory_xact_lock(hashtextextended('beds:'||h::text,0));
  for rr in select x.* from public.resource_reservations x join public.hospital_resources b on b.id=x.resource_id where x.hospital_id=h and x.released_at is null and x.hold_until<=now() and b.status='RESERVED' for update of x,b loop
   update public.resource_reservations set released_at=now() where id=rr.id;
   update public.hospital_resources set status='AVAILABLE' where id=rr.resource_id;
   insert into public.audit_logs(hospital_id,actor,action,entity_id,details) values(h,null,'system.bed_hold_expired',rr.resource_id,jsonb_build_object('reservation_id',rr.id));
  end loop;
  for e in select enc.*,p.configuration from public.patient_encounters enc join public.triage_protocol_versions p on p.hospital_id=enc.hospital_id and p.status='active' and p.approved_at is not null and p.reviewer is not null where enc.hospital_id=h and enc.status not in ('DISCHARGED','ADMITTED','TRANSFERRED','CANCELLED') and coalesce((select max(a.created_at) from public.triage_assessments a where a.encounter_id=enc.id),enc.arrived_at)+make_interval(mins=>(p.configuration#>>array['reassessment_minutes',enc.category::text])::integer)<=now() for update of enc skip locked loop
   insert into public.reassessment_records(hospital_id,encounter_id,reason,source) values(h,e.id,'Reviewed waiting-time threshold exceeded; urgency unchanged','waiting_time') on conflict(encounter_id) where resolved_at is null do nothing returning id into task;
   if task is not null then
    update public.patient_encounters set reassessment_due=now() where id=e.id;
    perform private.notify(h,e.id,e.category,'Reassessment overdue — urgency unchanged');
    insert into public.audit_logs(hospital_id,actor,action,entity_id,details) values(h,null,'system.reassessment_due',e.id,jsonb_build_object('protocol',e.configuration->>'version'));
    total:=total+1;
   end if;
  end loop;
  update public.notifications set status='ESCALATED',recipient_roles=array(select distinct unnest(recipient_roles||array['emergency_coordinator']::public.staff_role[])) where hospital_id=h and status='CREATED' and created_at<now()-make_interval(mins=>coalesce((select alert_minutes from public.hospital_settings where hospital_id=h),5));
 end loop;
 return total;
end $$;
revoke all on function private.workflow_tick() from public,anon,authenticated;
grant execute on function private.workflow_tick() to service_role;
-- Local bare PostgreSQL lacks pg_cron; hosted/local Supabase installs schedule when supported.
do $$ begin
 if exists(select 1 from pg_available_extensions where name='pg_cron') then
  create extension if not exists pg_cron;
  perform cron.schedule('medcipher-workflow-review','* * * * *','select private.workflow_tick()');
 end if;
end $$;

create or replace function private.notify(h uuid,e uuid,c public.triage_category,title text) returns void language sql security definer set search_path='' as $$
 insert into public.notifications(hospital_id,encounter_id,title,recipient_roles) values(h,e,title,case when c='RED' then array['emergency_coordinator','doctor','triage_nurse','nurse']::public.staff_role[] when c='YELLOW' then array['triage_nurse','nurse','doctor']::public.staff_role[] else array['nurse','triage_nurse']::public.staff_role[] end)
$$;
create function private.resource_request_notification() returns trigger language plpgsql security definer set search_path='' as $$ begin
 insert into public.notifications(hospital_id,encounter_id,title,recipient_roles) values(new.hospital_id,new.encounter_id,'Resource assistance request — staff must assess suitability',array['resource_manager','hospital_admin','super_admin','emergency_coordinator']::public.staff_role[]);
 return new;
end $$;
revoke all on function private.resource_request_notification() from public,anon,authenticated;
create trigger resource_request_notification after insert on public.resource_requests for each row execute function private.resource_request_notification();

-- Reception receives identity lookup through a narrow, checked RPC, not raw patient-table access.
create or replace function public.find_patients(p_hospital uuid,p_query text) returns setof public.patients language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or coalesce(private.role_for(p_hospital)::text,'') not in ('nurse','triage_nurse','receptionist') then raise exception 'Registration role required' using errcode='42501';end if;
 if length(trim(p_query))<2 or length(p_query)>160 then return;end if;
 return query select p.* from public.patients p where p.hospital_id=p_hospital and (strpos(lower(p.name),lower(trim(p_query)))>0 or strpos(p.id::text,lower(trim(p_query)))>0 or strpos(lower(coalesce(p.identifier,'')),lower(trim(p_query)))>0 or (length(regexp_replace(p_query,'[^0-9]','','g'))>=4 and strpos(regexp_replace(coalesce(p.phone,''),'[^0-9]','','g'),regexp_replace(p_query,'[^0-9]','','g'))>0) or p.date_of_birth::text=trim(p_query)) order by p.name,p.id limit 26;
end $$;

-- Non-PHI invalidation lets operational users refresh aggregate counts without clinical SELECT access.
create table public.hospital_activity(hospital_id uuid primary key references public.hospitals,version bigint not null default 1,updated_at timestamptz not null default now());
alter table public.hospital_activity enable row level security;
revoke all on public.hospital_activity from public,anon,authenticated;
grant select on public.hospital_activity to authenticated;
create policy hospital_activity_read on public.hospital_activity for select to authenticated using(private.role_for(hospital_id) is not null);
create function private.signal_hospital_activity() returns trigger language plpgsql security definer set search_path='' as $$begin
 insert into public.hospital_activity(hospital_id) values(new.hospital_id) on conflict(hospital_id) do update set version=hospital_activity.version+1,updated_at=now();return new;
end $$;
revoke all on function private.signal_hospital_activity() from public,anon,authenticated;
create trigger signal_encounter_activity after insert or update on public.patient_encounters for each row execute function private.signal_hospital_activity();
alter publication supabase_realtime add table public.hospital_activity;

create function private.protocol_shape(a jsonb) returns boolean language sql immutable set search_path='' as $$
select coalesce((jsonb_typeof(a)='object' and a?'name' and a?'version' and a?'reference' and a?'rules' and a?'considerations' and a?'reassessment_minutes' and (jsonb_typeof((a->'name'))='string' and length((a->'name')#>>'{}') between 3 and 160) and (jsonb_typeof((a->'version'))='string' and length((a->'version')#>>'{}') between 1 and 60) and (jsonb_typeof((a->'reference'))='string' and length((a->'reference')#>>'{}') between 0 and 1000) and (case when jsonb_typeof((a->'rules'))='array' then jsonb_array_length((a->'rules')) between 0 and 30 and not exists(select 1 from jsonb_array_elements((a->'rules')) item where not coalesce((jsonb_typeof(item.value)='object' and item.value?'id' and item.value?'category' and item.value?'explanation' and item.value?'requires' and item.value?'all' and (jsonb_typeof((item.value->'id'))='string' and length((item.value->'id')#>>'{}') between 0 and 3000) and (item.value->'category') in ('"RED"'::jsonb,'"YELLOW"'::jsonb,'"GREEN"'::jsonb) and (jsonb_typeof((item.value->'explanation'))='string' and length((item.value->'explanation')#>>'{}') between 10 and 1000) and (case when jsonb_typeof((item.value->'requires'))='array' then jsonb_array_length((item.value->'requires')) between 1 and 40 and not exists(select 1 from jsonb_array_elements((item.value->'requires')) item where not coalesce(item.value in ('"symptoms"'::jsonb,'"symptoms_complete"'::jsonb,'"progression"'::jsonb,'"pain"'::jsonb,'"onset"'::jsonb,'"history.conditions"'::jsonb,'"history.status"'::jsonb,'"medication_status"'::jsonb,'"allergy_status"'::jsonb,'"pregnancy"'::jsonb,'"answers.chest_current"'::jsonb,'"answers.chest_breathing"'::jsonb,'"answers.chest_faintness_sweating"'::jsonb,'"answers.chest_spread"'::jsonb,'"answers.bleeding_ongoing"'::jsonb,'"answers.bleeding_uncontrolled"'::jsonb,'"answers.breathing_current"'::jsonb,'"answers.breathing_worsening"'::jsonb,'"answers.breathing_speech"'::jsonb,'"answers.breathing_warning"'::jsonb,'"answers.injury_unconscious"'::jsonb,'"self_reported_vitals.pulse"'::jsonb,'"self_reported_vitals.spo2"'::jsonb,'"self_reported_vitals.respiratory_rate"'::jsonb,'"self_reported_vitals.systolic"'::jsonb,'"self_reported_vitals.temperature"'::jsonb),false)) else false end) and (case when jsonb_typeof((item.value->'all'))='array' then jsonb_array_length((item.value->'all')) between 1 and 20 and not exists(select 1 from jsonb_array_elements((item.value->'all')) item where not coalesce((jsonb_typeof(item.value)='object' and item.value?'field' and item.value?'operator' and item.value?'value' and (item.value->'field') in ('"symptoms"'::jsonb,'"symptoms_complete"'::jsonb,'"progression"'::jsonb,'"pain"'::jsonb,'"onset"'::jsonb,'"history.conditions"'::jsonb,'"history.status"'::jsonb,'"medication_status"'::jsonb,'"allergy_status"'::jsonb,'"pregnancy"'::jsonb,'"answers.chest_current"'::jsonb,'"answers.chest_breathing"'::jsonb,'"answers.chest_faintness_sweating"'::jsonb,'"answers.chest_spread"'::jsonb,'"answers.bleeding_ongoing"'::jsonb,'"answers.bleeding_uncontrolled"'::jsonb,'"answers.breathing_current"'::jsonb,'"answers.breathing_worsening"'::jsonb,'"answers.breathing_speech"'::jsonb,'"answers.breathing_warning"'::jsonb,'"answers.injury_unconscious"'::jsonb,'"self_reported_vitals.pulse"'::jsonb,'"self_reported_vitals.spo2"'::jsonb,'"self_reported_vitals.respiratory_rate"'::jsonb,'"self_reported_vitals.systolic"'::jsonb,'"self_reported_vitals.temperature"'::jsonb) and (item.value->'operator') in ('"equals"'::jsonb,'"contains"'::jsonb,'"gte"'::jsonb,'"lte"'::jsonb) and ((jsonb_typeof((item.value->'value'))='string' and length((item.value->'value')#>>'{}') between 0 and 200) or (case when jsonb_typeof((item.value->'value'))='number' then ((item.value->'value')::text)::numeric between -1e100 and 1e100 else false end) or (jsonb_typeof((item.value->'value'))='boolean')) and (item.value-array['field','operator','value']::text[])='{}'::jsonb),false)) else false end) and (item.value-array['id','category','explanation','requires','all']::text[])='{}'::jsonb),false)) else false end) and (case when jsonb_typeof((a->'considerations'))='array' then jsonb_array_length((a->'considerations')) between 0 and 20 and not exists(select 1 from jsonb_array_elements((a->'considerations')) item where not coalesce((jsonb_typeof(item.value)='object' and item.value?'label' and item.value?'symptoms' and item.value?'limitations' and item.value?'reference' and (jsonb_typeof((item.value->'label'))='string' and length((item.value->'label')#>>'{}') between 3 and 200) and (case when jsonb_typeof((item.value->'symptoms'))='array' then jsonb_array_length((item.value->'symptoms')) between 1 and 14 and not exists(select 1 from jsonb_array_elements((item.value->'symptoms')) item where not coalesce((jsonb_typeof(item.value)='string' and length(item.value#>>'{}') between 0 and 80),false)) else false end) and (jsonb_typeof((item.value->'limitations'))='string' and length((item.value->'limitations')#>>'{}') between 10 and 1000) and (jsonb_typeof((item.value->'reference'))='string' and length((item.value->'reference')#>>'{}') between 0 and 1000) and (item.value-array['label','symptoms','limitations','reference']::text[])='{}'::jsonb),false)) else false end) and (jsonb_typeof((a->'reassessment_minutes'))='object' and (a->'reassessment_minutes')?'RED' and (a->'reassessment_minutes')?'YELLOW' and (a->'reassessment_minutes')?'GREEN' and (a->'reassessment_minutes')?'ASSESSMENT_REQUIRED' and (case when jsonb_typeof(((a->'reassessment_minutes')->'RED'))='number' then (((a->'reassessment_minutes')->'RED')::text)::numeric between 1 and 240 and trunc((((a->'reassessment_minutes')->'RED')::text)::numeric)=(((a->'reassessment_minutes')->'RED')::text)::numeric else false end) and (case when jsonb_typeof(((a->'reassessment_minutes')->'YELLOW'))='number' then (((a->'reassessment_minutes')->'YELLOW')::text)::numeric between 1 and 240 and trunc((((a->'reassessment_minutes')->'YELLOW')::text)::numeric)=(((a->'reassessment_minutes')->'YELLOW')::text)::numeric else false end) and (case when jsonb_typeof(((a->'reassessment_minutes')->'GREEN'))='number' then (((a->'reassessment_minutes')->'GREEN')::text)::numeric between 1 and 240 and trunc((((a->'reassessment_minutes')->'GREEN')::text)::numeric)=(((a->'reassessment_minutes')->'GREEN')::text)::numeric else false end) and (case when jsonb_typeof(((a->'reassessment_minutes')->'ASSESSMENT_REQUIRED'))='number' then (((a->'reassessment_minutes')->'ASSESSMENT_REQUIRED')::text)::numeric between 1 and 240 and trunc((((a->'reassessment_minutes')->'ASSESSMENT_REQUIRED')::text)::numeric)=(((a->'reassessment_minutes')->'ASSESSMENT_REQUIRED')::text)::numeric else false end) and ((a->'reassessment_minutes')-array['RED','YELLOW','GREEN','ASSESSMENT_REQUIRED']::text[])='{}'::jsonb) and (a-array['name','version','reference','rules','considerations','reassessment_minutes']::text[])='{}'::jsonb),false)
$$;
revoke all on function private.protocol_shape(jsonb) from public,anon,authenticated;

create function private.nonbed_resource_command(h uuid,a text,d jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare r text:=private.role_for(h)::text; b public.hospital_resources; e public.patient_encounters;
begin
 if auth.uid() is null or coalesce(r,'') not in ('doctor','nurse','triage_nurse','resource_manager','emergency_coordinator','hospital_admin','super_admin') then raise exception 'Resource access denied' using errcode='42501';end if;
 if a='reserve' then
  if r in ('hospital_admin','super_admin') then raise exception 'Care team allocation required' using errcode='42501';end if;
  select * into e from public.patient_encounters where id=(d->>'encounter_id')::uuid and hospital_id=h for update;
  if not found or e.status in ('DISCHARGED','ADMITTED','TRANSFERRED','CANCELLED') then raise exception 'Active encounter required';end if;
  if r<>'resource_manager' and not private.clinical_access(h,e.id) then raise exception 'Encounter access denied' using errcode='42501';end if;
 end if;
 select * into b from public.hospital_resources where id=(d->>'resource_id')::uuid and hospital_id=h for update;
 if not found then raise exception 'Resource unavailable';end if;
 if b.kind like '%bed' then raise exception 'Use reviewed bed workflow' using errcode='PT428';end if;
 if a='reserve' then
  if b.status<>'AVAILABLE' or exists(select 1 from public.resource_reservations where resource_id=b.id and released_at is null) then raise exception 'Resource no longer available' using errcode='PT409';end if;
  insert into public.resource_reservations(hospital_id,resource_id,encounter_id,actor) values(h,b.id,e.id,auth.uid());
  update public.hospital_resources set status='RESERVED' where id=b.id;
 elsif a='release' then
  if b.status in ('MAINTENANCE','BLOCKED') then raise exception 'Maintenance clearance required';end if;
  if b.status in ('AVAILABLE','CLEANING') then return '{"ok":true,"duplicate":true}';end if;
  update public.resource_reservations set released_at=now() where resource_id=b.id and released_at is null;
  update public.hospital_resources set status='CLEANING' where id=b.id;
 elsif a='resource_clean' then
  if d->'checks_confirmed' is distinct from 'true'::jsonb then raise exception 'Cleaning confirmation required';end if;
  if b.status='AVAILABLE' then return '{"ok":true,"duplicate":true}';end if;
  if b.status<>'CLEANING' then raise exception 'Resource is not awaiting cleaning' using errcode='PT409';end if;
  update public.hospital_resources set status='AVAILABLE' where id=b.id;
 elsif a='resource_restore' then
  if r not in ('resource_manager','emergency_coordinator','hospital_admin','super_admin') or length(trim(coalesce(d->>'reason','')))<5 or d->'checks_confirmed' is distinct from 'true'::jsonb then raise exception 'Documented maintenance clearance required' using errcode='42501';end if;
  if b.status<>'MAINTENANCE' then raise exception 'Resource is not under maintenance' using errcode='PT409';end if;
  update public.hospital_resources set status='CLEANING' where id=b.id;
 else raise exception 'Unsupported resource operation';end if;
 perform private.record_event(h,b.id,'resource.'||a,jsonb_build_object('reason',d->>'reason','previous_status',b.status));
 return '{"ok":true}';
end $$;
revoke all on function private.nonbed_resource_command(uuid,text,jsonb) from public,anon,authenticated;
