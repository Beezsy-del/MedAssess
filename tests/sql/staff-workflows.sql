-- Runs after patient-portal.sql inside the same rollback-only synthetic transaction.
insert into public.hospital_settings(hospital_id) values('20000000-0000-4000-8000-000000000001');
insert into public.departments(id,hospital_id,name) values('50000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Synthetic reviewed OPD'),('50000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001','Synthetic receiving ward');
set local request.jwt.claims='{"sub":"10000000-0000-4000-8000-000000000001"}';
do $$ declare eid uuid;nid uuid;begin
 select id into eid from public.patient_encounters where hospital_id='20000000-0000-4000-8000-000000000001' limit 1;
 insert into public.notifications(hospital_id,encounter_id,department_id,title,recipient_roles) values('20000000-0000-4000-8000-000000000001',eid,'50000000-0000-4000-8000-000000000002','Synthetic RED emergency',array['nurse','triage_nurse']::public.staff_role[]) returning id into nid;
 perform public.staff_command('20000000-0000-4000-8000-000000000001','alert',jsonb_build_object('id',nid,'status','ACKNOWLEDGED'));
 if (select status from public.notifications where id=nid)<>'ACKNOWLEDGED' then raise exception 'Emergency acknowledgement incorrectly required department membership';end if;
end $$;
set local request.jwt.claims='{"sub":"10000000-0000-4000-8000-000000000003"}';
select public.staff_command('20000000-0000-4000-8000-000000000001','department_access','{"operation_id":"60000000-0000-4000-8000-000000000001","user_id":"10000000-0000-4000-8000-000000000002","department_id":"50000000-0000-4000-8000-000000000001","enabled":true,"reason":"Synthetic receiving doctor assignment"}');
set local request.jwt.claims='{"sub":"10000000-0000-4000-8000-000000000002"}';
select public.staff_command('20000000-0000-4000-8000-000000000001','department_routing','{"operation_id":"60000000-0000-4000-8000-000000000002","department_id":"50000000-0000-4000-8000-000000000001","categories":["GREEN"],"reviewed":true,"reason":"Synthetic routing assertion, not clinical guidance"}');
do $$ declare e public.patient_encounters; response jsonb; req jsonb; ref public.department_referrals; next_status text; snap jsonb; begin
 select * into e from public.patient_encounters where hospital_id='20000000-0000-4000-8000-000000000001' limit 1;
 begin
  perform public.staff_command(e.hospital_id,'opd_route',jsonb_build_object('operation_id',gen_random_uuid(),'encounter_id',e.id,'version',e.version,'department_id','50000000-0000-4000-8000-000000000001','reason','Synthetic RED must not enter OPD'));
  raise exception 'RED OPD route accepted';
 exception when raise_exception then if sqlerrm='RED OPD route accepted' then raise;end if;end;
 -- Explicit synthetic fixture transition, not a medical recommendation.
 update public.patient_encounters set category='GREEN',emergency=false where id=e.id;
 req:=jsonb_build_object('operation_id','60000000-0000-4000-8000-000000000003','encounter_id',e.id,'version',e.version,'department_id','50000000-0000-4000-8000-000000000001','reason','Synthetic GREEN routing fixture');
 response:=public.staff_command(e.hospital_id,'opd_route',req);
 response:=public.staff_command(e.hospital_id,'opd_route',req);
 if response->>'duplicate' is distinct from 'true' then raise exception 'Referral retry not idempotent';end if;
 select * into ref from public.department_referrals where encounter_id=e.id;
 if (select department_id from public.patient_encounters where id=e.id)<>'50000000-0000-4000-8000-000000000001' then raise exception 'OPD queue was not assigned';end if;
 foreach next_status in array array['ACKNOWLEDGED','ACCEPTED','ARRIVED','COMPLETED'] loop
  select * into e from public.patient_encounters where id=e.id;
  select * into ref from public.department_referrals where id=ref.id;
  perform public.staff_command(e.hospital_id,'department_referral_status',jsonb_build_object('operation_id',gen_random_uuid(),'encounter_id',e.id,'version',e.version,'id',ref.id,'referral_version',ref.version,'status',next_status,'reason','Synthetic receiving team action'));
 end loop;
 if (select count(*) from public.department_referral_events where referral_id=ref.id)<>5 then raise exception 'Referral timeline incomplete';end if;
 if (select department_id from public.patient_encounters where id=e.id)<>'50000000-0000-4000-8000-000000000001' then raise exception 'Arrival not recorded';end if;
end $$;
set local role authenticated;
do $$ declare snap jsonb;begin
 snap:=public.workspace_snapshot('20000000-0000-4000-8000-000000000001');
 if jsonb_array_length(snap->'patientReports')<>1 or jsonb_array_length(snap->'departmentReferrals')<>1 then raise exception 'Clinical snapshot incomplete';end if;
end $$;
reset role;
set local request.jwt.claims='{"sub":"10000000-0000-4000-8000-000000000001"}';
set local role authenticated;
do $$ begin
 if exists(select 1 from public.patient_encounters) then raise exception 'Unassigned nurse retained non-emergency department access';end if;
end $$;
reset role;
set local request.jwt.claims='{"sub":"10000000-0000-4000-8000-000000000003"}';
set local role authenticated;
do $$ declare snap jsonb;begin
 snap:=public.workspace_snapshot('20000000-0000-4000-8000-000000000001');
 if jsonb_array_length(snap->'patientReports')<>0 or jsonb_array_length(snap->'notes')<>0 or jsonb_array_length(snap->'departmentReferrals')<>0 or jsonb_array_length(snap->'encounters')<>1 then raise exception 'Admin snapshot boundaries failed';end if;
 if snap#>>'{encounters,0,symptoms}'<>'' then raise exception 'Admin received clinical complaint';end if;
end $$;
reset role;

-- System monitoring is independent of dashboard requests and preserves urgency.
do $$ declare eid uuid; original public.triage_category; first_count integer;begin
 select id,category into eid,original from public.patient_encounters where hospital_id='20000000-0000-4000-8000-000000000001' limit 1;
 update public.patient_encounters set arrived_at=now()-interval '3 hours',status='TRIAGE_PENDING' where id=eid;
 update public.triage_protocol_versions set status='retired' where hospital_id='20000000-0000-4000-8000-000000000001' and status='active';
 insert into public.triage_protocol_versions(hospital_id,name,version,reference,configuration,status,reviewer,approved_at) values('20000000-0000-4000-8000-000000000001','Synthetic timer fixture','timer-fixture','https://example.test/not-clinical','{"version":"timer-fixture","reassessment_minutes":{"RED":1,"YELLOW":1,"GREEN":1,"ASSESSMENT_REQUIRED":1}}','active','10000000-0000-4000-8000-000000000002',now());
 update public.reassessment_records set resolved_at=now() where encounter_id=eid and resolved_at is null;
 perform private.workflow_tick();
 select count(*) into first_count from public.reassessment_records where encounter_id=eid and resolved_at is null;
 if first_count<>1 then raise exception 'Timer did not create one reassessment';end if;
 perform private.workflow_tick();
 if (select count(*) from public.reassessment_records where encounter_id=eid and resolved_at is null)<>1 or (select category from public.patient_encounters where id=eid)<>original then raise exception 'Timer duplicated task or changed urgency';end if;
end $$;
set local request.jwt.claims='{"sub":"10000000-0000-4000-8000-000000000002"}';
do $$ declare rid uuid;eid uuid;h uuid:='20000000-0000-4000-8000-000000000001';begin
 select id into eid from public.patient_encounters where hospital_id=h limit 1;
 insert into public.hospital_resources(hospital_id,name,kind,location) values(h,'Synthetic retry stretcher','Stretcher','Local test') returning id into rid;
 perform public.staff_command(h,'reserve',jsonb_build_object('resource_id',rid,'encounter_id',eid));
 begin perform public.staff_command(h,'reserve',jsonb_build_object('resource_id',rid,'encounter_id',eid));raise exception 'Double allocation allowed';exception when sqlstate 'PT409' then null;end;
 perform public.staff_command(h,'release',jsonb_build_object('resource_id',rid));
 perform public.staff_command(h,'release',jsonb_build_object('resource_id',rid));
 if (select status from public.hospital_resources where id=rid)<>'CLEANING' then raise exception 'Repeated release bypassed cleaning';end if;
 perform public.staff_command(h,'resource_clean',jsonb_build_object('resource_id',rid,'checks_confirmed',true));
 if (select status from public.hospital_resources where id=rid)<>'AVAILABLE' then raise exception 'Confirmed cleaning failed';end if;
end $$;
