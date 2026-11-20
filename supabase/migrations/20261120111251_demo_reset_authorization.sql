create or replace function public.archive_demo_tests(p_hospital uuid) returns integer language plpgsql security definer set search_path='' as $$
declare e public.patient_encounters; total integer:=0;
begin
 if auth.uid() is null or private.role_for(p_hospital) is null or private.role_for(p_hospital) not in ('hospital_admin','super_admin') then raise exception 'Administrator required'; end if;
 if not exists(select 1 from public.hospitals where id=p_hospital and is_demo) then raise exception 'Demo-only operation'; end if;
 for e in select pe.* from public.patient_encounters pe join public.patients p on p.id=pe.patient_id where pe.hospital_id=p_hospital and p.name like 'Synthetic %' and pe.status not in ('DISCHARGED','ADMITTED','TRANSFERRED','CANCELLED') for update of pe loop
  update public.patient_encounters set status='CANCELLED',version=version+1,updated_at=now() where id=e.id;
  insert into public.patient_status_events(hospital_id,encounter_id,actor,from_status,to_status,reason) values(p_hospital,e.id,auth.uid(),e.status,'CANCELLED','Synthetic test archived by demo administrator; no records deleted');
  update public.hospital_resources set status='CLEANING' where id in(select resource_id from public.resource_reservations where encounter_id=e.id and released_at is null);
  update public.resource_reservations set released_at=now() where encounter_id=e.id and released_at is null;
  update public.encounter_access_tokens set revoked_at=now() where encounter_id=e.id and revoked_at is null;
  update public.notifications set status='CANCELLED',resolution='Synthetic test archived' where encounter_id=e.id and status not in ('RESOLVED','CANCELLED');
  perform private.record_event(p_hospital,e.id,'demo.test_archived');
  total:=total+1;
 end loop;
 return total;
end $$;
revoke all on function public.archive_demo_tests(uuid) from public,anon;
grant execute on function public.archive_demo_tests(uuid) to authenticated;
