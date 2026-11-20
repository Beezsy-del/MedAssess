create or replace function public.staff_command(p_hospital uuid,p_action text,p_data jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
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
 if p_data ? 'version' and e.version<>(p_data->>'version')::integer then raise exception 'Conflict: record changed. Refresh and review before retrying.' using errcode='PT409'; end if;
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
  update public.patient_encounters set category=confirmed,emergency=(confirmed='RED' and (sign_count>0 or e.emergency)),score=(select (result->>'score')::numeric from public.triage_assessments where encounter_id=e.id order by created_at desc limit 1),deteriorating=coalesce((p_data->'input'->>'worsening')::boolean,false),symptoms=coalesce(p_data->'input'->>'symptoms',symptoms),status=case when status in ('REGISTERED','TRIAGE_PENDING') and confirmed<>'ASSESSMENT_REQUIRED' then 'TRIAGE_COMPLETED' else status end,reassessment_due=now()+make_interval(mins=>(select reassessment_minutes from public.hospital_settings where hospital_id=p_hospital)),version=version+1,updated_at=now() where id=e.id returning * into e;
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

create or replace function public.patient_portal(p_token text,p_action text,p_data jsonb default '{}') returns jsonb language plpgsql security definer set search_path='' as $$
declare t public.encounter_access_tokens; e public.patient_encounters; hash text; cnt integer; reported_emergency boolean;
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
  reported_emergency:=coalesce((p_data->>'emergency')::boolean,false);
  update public.patient_encounters set intake=p_data,symptoms=p_data->>'symptoms',emergency=e.emergency or reported_emergency,category=case when e.emergency or reported_emergency then 'RED'::public.triage_category else category end,version=version+1,updated_at=now() where id=e.id;
  update public.encounter_access_tokens set submitted_at=now() where id=t.id;
  perform private.notify(e.hospital_id,e.id,case when reported_emergency then 'RED'::public.triage_category else e.category end,'Patient intake submitted; human verification required');
  perform private.record_event(e.hospital_id,e.id,'patient.intake_submitted');
 else raise exception 'Invalid portal action'; end if;
 return jsonb_build_object('reference',e.reference,'ok',true);
end $$;

-- Reproducible demonstration score calculated at the persistence boundary.
create function private.assessment_score() returns trigger language plpgsql set search_path='' as $$
declare v jsonb; complete boolean; pain numeric; warning numeric; worsening numeric; score numeric;
begin
 v:=new.input->'vitals';
 complete:=coalesce((new.input->>'verified')::boolean,false) and nullif(new.input->>'symptoms','') is not null and new.input->>'pain' is not null and new.input->>'worsening' is not null and v->>'pulse' is not null and v->>'spo2' is not null and v->>'respiratoryRate' is not null and v->>'systolic' is not null and v->>'temperature' is not null;
 if complete then
  pain:=least(10,greatest(0,(new.input->>'pain')::numeric))*1.5;
  warning:=case when jsonb_array_length(new.input->'warningSigns')>0 then 40 else 0 end;
  worsening:=case when (new.input->>'worsening')::boolean then 10 else 0 end;
  score:=round(pain+warning+worsening,2);
  new.result:=new.result||jsonb_build_object('score',score,'breakdown',jsonb_build_array(jsonb_build_object('label','Reported warning sign (demo)','value',warning),jsonb_build_object('label','Reported pain (demo)','value',pain),jsonb_build_object('label','Worsening symptoms (demo)','value',worsening)),'protocol','demo-1.0-unvalidated');
 else new.result:=new.result||'{"score":null,"breakdown":[],"limitation":"Insufficient or unverified information"}'::jsonb;
 end if;
 return new;
end $$;
revoke all on function private.assessment_score() from public;
create trigger calculate_assessment_score before insert on public.triage_assessments for each row execute function private.assessment_score();

create function public.escalate_alerts(p_hospital uuid) returns integer language plpgsql security definer set search_path='' as $$
declare changed integer;
begin
 if auth.uid() is null or private.role_for(p_hospital) is null then raise exception 'Access denied'; end if;
 with updated as (
 update public.notifications n set status='ESCALATED',recipient_roles=array['emergency_coordinator','doctor']::public.staff_role[]
 where n.hospital_id=p_hospital and n.status='CREATED' and n.created_at<now()-make_interval(mins=>(select alert_minutes from public.hospital_settings where hospital_id=p_hospital))
 returning n.id)
 insert into public.audit_logs(hospital_id,actor,action,entity_id) select p_hospital,auth.uid(),'alert.automatically_escalated',id from updated;
 get diagnostics changed=row_count;
 return changed;
end $$;
revoke all on function public.escalate_alerts(uuid) from public,anon;
grant execute on function public.escalate_alerts(uuid) to authenticated;

-- Defense in depth: no direct reads even if table grants are added accidentally.
create policy token_deny on public.encounter_access_tokens for all to anon,authenticated using(false) with check(false);
create policy limits_deny on private.request_limits for all to anon,authenticated using(false) with check(false);
