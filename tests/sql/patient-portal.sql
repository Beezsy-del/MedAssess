-- Synthetic transaction fixture; run only against the isolated local test database.
insert into auth.users(id,email) values('10000000-0000-4000-8000-000000000001','synthetic-nurse@example.test'),('10000000-0000-4000-8000-000000000002','synthetic-doctor@example.test'),('10000000-0000-4000-8000-000000000003','synthetic-admin@example.test');
insert into public.hospitals(id,name,location) values('20000000-0000-4000-8000-000000000001','Synthetic portal hospital','Local'),('20000000-0000-4000-8000-000000000002','Synthetic other hospital','Local');
insert into public.hospital_memberships(hospital_id,user_id,role,display_name) values('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','nurse','Synthetic nurse'),('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','doctor','Synthetic doctor'),('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000003','hospital_admin','Synthetic admin');
set local request.jwt.claims='{"sub":"10000000-0000-4000-8000-000000000001"}';
create temporary table fixture(result jsonb);
insert into fixture select public.staff_command('20000000-0000-4000-8000-000000000001','register','{"operation_id":"30000000-0000-4000-8000-000000000001","name":"Synthetic portal patient"}');
do $$ declare v jsonb; token text; eid uuid; draft jsonb; response jsonb; begin
 select result into v from fixture;
 token:=v->>'manual_token';eid:=(v->>'id')::uuid;
 if length(token) is distinct from 32 then raise exception 'Manual token missing';end if;
 if exists(select 1 from public.encounter_access_tokens where token_hash=token or manual_token_hash=token) then raise exception 'Raw token stored';end if;
 response:=public.patient_portal(token,'status','{}');
 if response->>'reference' is distinct from v->>'reference' then raise exception 'Wrong encounter';end if;
 draft:='{"version":"patient-intake-2.0","language":"en","identity":{"name":"","age":null,"date_of_birth":"","sex":"","phone":"","emergency_contact":"","patient_identifier":"","assistance":"unknown","helper_name":"","relationship":""},"symptoms":[],"symptoms_complete":false,"complaint":"Synthetic concern","onset":"","progression":"unknown","location":"","pain":null,"spreading":"unknown","spread_location":"","answers":{},"history":{"status":"unknown","conditions":[],"details":"","surgery":"unknown","surgery_details":"","similar_before":"unknown","hospitalised":"unknown","current_treatment":"unknown","treatment_details":""},"medication_status":"unknown","medications":[],"medication_changed":"unknown","medication_missed":"unknown","current_symptom_medicine":"","allergy_status":"unknown","allergies":[],"pregnancy":"unknown","pregnancy_details":"","access_needs":"","additional":"","self_reported_vitals":{"pulse":null,"spo2":null,"respiratory_rate":null,"systolic":null,"temperature":null},"emergency_help":false,"warning_signs":[],"consent":true}';
 perform public.patient_portal(token,'draft',jsonb_build_object('answers',draft,'step',1));
 response:=public.patient_portal(token,'status','{}');
 if response->'draft' is distinct from draft then raise exception 'Draft did not persist';end if;
 response:=public.patient_portal(token,'submit',jsonb_build_object('answers',draft,'operation_id','40000000-0000-4000-8000-000000000001','previous_report_id',null));
 if response->>'ok' is distinct from 'true' then raise exception 'Submission failed';end if;
 if (select category from public.patient_encounters where id=eid)<>'ASSESSMENT_REQUIRED' then raise exception 'Missing information became normal';end if;
 response:=public.patient_portal(token,'submit',jsonb_build_object('answers',draft,'operation_id','40000000-0000-4000-8000-000000000001','previous_report_id',null));
 if response->>'duplicate' is distinct from 'true' or (select count(*) from public.patient_reports where encounter_id=eid)<>1 then raise exception 'Retry duplicated report';end if;
 perform public.patient_portal(token,'emergency','{}');perform public.patient_portal(token,'emergency','{}');
 if (select category from public.patient_encounters where id=eid)<>'RED' then raise exception 'Emergency did not override';end if;
 if (select count(*) from public.resource_requests where encounter_id=eid)<>1 then raise exception 'Emergency request missing/duplicated';end if;
 if exists(select 1 from public.resource_shortages where encounter_id=eid) then raise exception 'Emergency falsely reported inventory shortage';end if;
 if private.clinical_access('20000000-0000-4000-8000-000000000002',eid) then raise exception 'Cross tenant access';end if;
 update public.encounter_access_tokens set revoked_at=now() where encounter_id=eid;
 response:=public.patient_portal(token,'status','{}');
 if response->>'error' is null then raise exception 'Revoked token accepted';end if;
end $$;
set local request.jwt.claims='{"sub":"10000000-0000-4000-8000-000000000002"}';
do $$ begin
 begin perform public.staff_command('20000000-0000-4000-8000-000000000001','register','{}');raise exception 'Doctor registered patient';exception when insufficient_privilege then null;end;
end $$;
set local request.jwt.claims='{"sub":"10000000-0000-4000-8000-000000000003"}';
set local role authenticated;
do $$ begin
 if exists(select 1 from public.patient_reports) or exists(select 1 from public.patient_encounters) then raise exception 'Admin read clinical records';end if;
 if jsonb_array_length(public.workspace_directory('20000000-0000-4000-8000-000000000001')->'encounters')<>1 then raise exception 'Operational directory missing encounter';end if;
end $$;
reset role;
