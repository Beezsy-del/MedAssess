-- Enforce one active physical bed per encounter, including future reservation paths.
alter table public.resource_reservations add column is_bed boolean not null default false;
update public.resource_reservations r set is_bed=true from public.hospital_resources b where b.id=r.resource_id and b.kind like '%bed';
create unique index one_active_bed_per_encounter on public.resource_reservations(encounter_id) where is_bed and released_at is null;
create unique index bed_identifier_per_hospital on public.hospital_resources(hospital_id,lower(trim(name))) where kind like '%bed';
create function private.mark_bed_reservation() returns trigger language plpgsql security definer set search_path='' as $$ begin
 select kind like '%bed' into new.is_bed from public.hospital_resources where id=new.resource_id and hospital_id=new.hospital_id;
 return new;
end $$;
revoke all on function private.mark_bed_reservation() from public,anon,authenticated;
create trigger mark_bed_reservation before insert or update of resource_id on public.resource_reservations for each row execute function private.mark_bed_reservation();
create or replace function public.staff_command(p_hospital uuid,p_action text,p_data jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.staff_role;
begin
 r:=private.role_for(p_hospital);
 if auth.uid() is null or r is null then raise exception 'Access denied' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtextextended('beds:'||p_hospital::text,0));
 if p_action='bed_status' and p_data->>'status'='CLEANING' and exists(select 1 from public.hospital_resources where id=(p_data->>'resource_id')::uuid and hospital_id=p_hospital and status in ('MAINTENANCE','BLOCKED')) and r not in ('resource_manager','hospital_admin','super_admin','emergency_coordinator') then raise exception 'Resource clearance required' using errcode='42501'; end if;
 if p_action like 'bed_%' then return private.bed_command(p_hospital,p_action,p_data); end if;
 if p_action in ('reserve','release','maintenance') and exists(select 1 from public.hospital_resources where id=(p_data->>'resource_id')::uuid and hospital_id=p_hospital and kind like '%bed') then raise exception 'Use reviewed bed allocation workflow' using errcode='PT428'; end if;
 if p_action='transition' and p_data->>'status'='ADMITTED' and not exists(
  select 1 from public.patient_encounters e join public.resource_reservations rr on rr.encounter_id=e.id and rr.released_at is null
  join public.hospital_resources b on b.id=rr.resource_id join public.bed_profiles bp on bp.resource_id=b.id
  join public.bed_wards w on w.id=bp.ward_id join public.bed_placement_plans plan on plan.encounter_id=e.id
  where e.hospital_id=p_hospital and e.id=(p_data->>'encounter_id')::uuid and b.status in ('OCCUPIED','RESERVED')
  and (b.status='OCCUPIED' or rr.hold_until>now()) and bp.verified and w.zone<>'unconfigured'
  and plan.decision='BED_REQUIRED' and plan.encounter_version=e.version and plan.ward_id=w.id and plan.bed_kind=b.kind
  and plan.required_capabilities<@bp.capabilities and e.category=any(w.categories)
 ) then raise exception 'Current reviewed compatible bed required for admission' using errcode='PT428'; end if;
 return private.intake_command(p_hospital,p_action,p_data);
end $$;
revoke all on function public.staff_command(uuid,text,jsonb) from public,anon;
grant execute on function public.staff_command(uuid,text,jsonb) to authenticated;
