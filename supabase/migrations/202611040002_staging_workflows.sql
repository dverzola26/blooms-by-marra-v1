begin;
alter table public.branches add column is_staging boolean not null default false;
alter table public.products add column is_demo boolean not null default false;
alter table public.products add constraint demo_products_unpublished check(not is_demo or not is_active);
alter table public.branches add constraint staging_branches_unpublished check(not is_staging or not is_active);
alter table public.orders add column is_staging boolean not null default false,
 add column created_by uuid references public.profiles,
 add column idempotency_key uuid unique,
 add column version integer not null default 0,
 add column payment_method text check(payment_method in ('GCash','Maya','GoTyme','MariBank','Cash')),
 add column request_hash text, add column tracking_hash text, add column tracking_expires_at timestamptz,
 add constraint cash_pickup_only check(payment_method is distinct from 'Cash' or mode='pickup');
-- Operational writes must use audited, role-checked RPCs, including owner writes.
do $$ declare t text; begin foreach t in array array['orders','order_items','order_addresses','order_status_events','payment_records','payment_proof_files','custom_quote_requests','fulfillment_notes'] loop
 execute format('drop policy owner_access on public.%I',t);
 execute format('create policy owner_read on public.%I for select to authenticated using(public.is_owner())',t);
end loop; end $$;
create policy staging_branch_read on public.branches for select to authenticated using(is_staging and public.can_access_branch(id));
create policy staging_zone_read on public.service_zones for select to authenticated using(public.can_access_branch(branch_id) and exists(select 1 from public.branches b where b.id=branch_id and b.is_staging));
create policy staging_rates_read on public.delivery_rates for select to authenticated using(exists(select 1 from public.service_zones z join public.branches b on b.id=z.branch_id where z.id=zone_id and b.is_staging and public.can_access_branch(b.id)));
create policy staging_product_read on public.products for select to authenticated using(is_demo and not is_active and exists(select 1 from public.branch_inventory i where i.product_id=id and public.can_access_branch(i.branch_id)));

create function public.assert_staging_branch(b uuid, owner_only boolean default false) returns void language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.site_settings where key='runtime_mode' and value->>'mode'='staging') or not exists(select 1 from public.branches where id=b and is_staging and not is_active) then raise exception 'Staging only'; end if;
 if auth.uid() is null or not public.can_access_branch(b) or (owner_only and not public.is_owner()) then raise exception 'Forbidden'; end if;
end $$;

create function public.create_staging_order(payload jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare b uuid:=(payload->>'branchId')::uuid; k uuid:=(payload->>'idempotencyKey')::uuid; o public.orders; p public.products; inv public.branch_inventory; l jsonb; q integer; subtotal bigint:=0; fee bigint:=0; included boolean:=true; quoted boolean:=false; review boolean:=false; branch public.branches; z public.service_zones; contact jsonb:=payload->'contact'; d date:=(payload->'contact'->>'date')::date; result uuid; zone uuid:=nullif(payload->>'zoneId','')::uuid; cutoff time; local_now timestamp;
begin
 perform public.assert_staging_branch(b);
 if payload->>'fictionalDetails' is distinct from 'true' or coalesce(contact->>'mode','') not in ('pickup','delivery') or coalesce(contact->>'payment','') not in ('GCash','Maya','GoTyme','MariBank','Cash') or (contact->>'payment'='Cash' and contact->>'mode'<>'pickup') or coalesce(contact->>'window','') not in ('Morning','Afternoon') then raise exception 'Invalid order'; end if;
 if length(contact->>'customer') not between 2 and 100 or length(contact->>'recipient') not between 2 and 100 or coalesce(contact->>'email','') !~ '^[^@ ]+@[^@ ]+\.[^@ ]+$' or coalesce(contact->>'phone','') !~ '^(\+63|0)9[0-9]{9}$' or coalesce(contact->>'recipientPhone','') !~ '^(\+63|0)9[0-9]{9}$' or contact->>'consent' is distinct from 'true' then raise exception 'Invalid order'; end if;
 -- Serialize retries, including requests arriving before the first insert commits.
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(k::text,0));
 select * into o from public.orders where idempotency_key=k;
 if found then
  if o.created_by is distinct from auth.uid() or o.branch_id<>b or o.request_hash is distinct from encode(sha256(convert_to(payload::text,'UTF8')),'hex') then raise exception 'Duplicate request mismatch'; end if;
  return o.id;
 end if;
 select * into branch from public.branches where id=b;
 local_now:=now() at time zone branch.timezone;
 if d<local_now::date then raise exception 'Date unavailable'; end if;
 if exists(select 1 from public.holiday_cutoffs where branch_id=b and date=d and closed) then raise exception 'Date unavailable'; end if;
 select h.cutoff into cutoff from public.holiday_cutoffs h where h.branch_id=b and h.date=d;
 cutoff:=coalesce(cutoff,branch.cutoff);
 if contact->>'mode'='delivery' then
  select * into z from public.service_zones where id=zone and branch_id=b;
  if not found then raise exception 'Unavailable destination'; end if;
  if length(trim(coalesce(contact->>'address','')))<10 or length(contact->>'address')>500 then raise exception 'Invalid order'; end if;
  review:=d=local_now::date and local_now::time>=cutoff;
 end if;
 if jsonb_typeof(payload->'lines') is distinct from 'array' or coalesce(jsonb_array_length(payload->'lines'),0) not between 1 and 20 then raise exception 'Invalid item'; end if;
 if (select count(*) from jsonb_array_elements(payload->'lines'))<>(select count(distinct x->>'productId') from jsonb_array_elements(payload->'lines') x) then raise exception 'Invalid item'; end if;
 for l in select * from jsonb_array_elements(payload->'lines') loop
  q:=(l->>'quantity')::integer;
  if q not between 1 and 20 or length(coalesce(l->>'message',''))>300 then raise exception 'Invalid item'; end if;
  select * into p from public.products where id=(l->>'productId')::uuid and is_demo and not is_active;
  if not found then raise exception 'Invalid item'; end if;
  select * into inv from public.branch_inventory where product_id=p.id and branch_id=b;
  if not found then raise exception 'Invalid item'; end if;
  review:=review or not inv.available or (inv.quantity is not null and inv.quantity<q) or local_now+make_interval(hours=>p.lead_time_hours)>d+case when contact->>'window'='Morning' then time '08:00' else time '13:00' end;
  quoted:=quoted or p.custom_quote;
  if not p.custom_quote and p.price_centavos is null then raise exception 'Invalid amount'; end if;
  subtotal:=subtotal+coalesce(p.price_centavos,0)*q;
  if contact->>'mode'='delivery' and not exists(select 1 from public.delivery_inclusions where product_id=p.id and zone_id=zone) then
   included:=false;
   if not exists(select 1 from public.delivery_rates where zone_id=zone and product_type=p.product_type) then raise exception 'Unavailable destination'; end if;
   fee:=greatest(fee,(select amount_centavos from public.delivery_rates where zone_id=zone and product_type=p.product_type));
  end if;
 end loop;
 if contact->>'mode'='pickup' or included then fee:=0; end if;
 insert into public.orders(branch_id,created_by,idempotency_key,is_staging,mode,preferred_date,preferred_window,subtotal_centavos,fee_centavos,total_centavos,request_state,payment_method,request_hash)
 values(b,auth.uid(),k,true,contact->>'mode',d,contact->>'window',subtotal,fee,case when quoted then null else subtotal+fee end,case when quoted then 'quote_pending' when review then 'needs_review' else 'submitted' end,contact->>'payment',encode(sha256(convert_to(payload::text,'UTF8')),'hex')) returning id into result;
 insert into public.order_addresses(order_id,customer_name,customer_email,customer_phone,recipient_name,recipient_phone,address,city,instructions)
 values(result,contact->>'customer',contact->>'email',contact->>'phone',contact->>'recipient',contact->>'recipientPhone',case when contact->>'mode'='delivery' then contact->>'address' end,z.city,left(payload->>'instructions',500));
 for l in select * from jsonb_array_elements(payload->'lines') loop
  select * into p from public.products where id=(l->>'productId')::uuid;
  insert into public.order_items(order_id,product_id,snapshot,quantity,unit_price_centavos,card_message) values(result,p.id,jsonb_build_object('name',p.name,'sku',p.sku,'demo',true),(l->>'quantity')::integer,p.price_centavos,l->>'message');
 end loop;
 return result;
end $$;

create function public.change_staging_order(order_id uuid, expected_version integer, action text, amount bigint default null, payment_id uuid default null) returns void language plpgsql security definer set search_path='' as $$
declare o public.orders; record public.payment_records; paid bigint; begin
 select * into o from public.orders where id=order_id and is_staging for update;
 if not found then raise exception 'Not found'; end if;
 perform public.assert_staging_branch(o.branch_id,action in ('approve','quote','verify_payment','confirm','record_cash'));
 if o.version<>expected_version then raise exception 'Stale order'; end if;
 if action='quote' then
  if o.request_state<>'quote_pending' or amount is null or amount<=0 or amount>100000000 then raise exception 'Invalid amount'; end if;
  update public.orders set total_centavos=amount,subtotal_centavos=amount-fee_centavos,request_state='needs_review',version=version+1 where id=o.id;
 elsif action='approve' then
  if o.request_state not in ('submitted','needs_review') or o.total_centavos is null or o.fulfillment_state<>'unconfirmed' then raise exception 'Invalid transition'; end if;
  -- Approval explicitly records owner responsibility for stock, quote, timing and route.
  update public.orders set request_state='awaiting_payment',approved_by=auth.uid(),approved_at=now(),version=version+1 where id=o.id;
 elsif action='verify_payment' then
  if o.request_state<>'awaiting_payment' then raise exception 'Invalid transition'; end if;
  select * into record from public.payment_records where id=payment_id and payment_records.order_id=o.id and state='submitted' for update;
  if not found then raise exception 'Not found'; end if;
  update public.payment_records set state='verified',verified_by=auth.uid(),verified_at=now() where id=record.id;
  select coalesce(sum(amount_centavos),0) into paid from public.payment_records where payment_records.order_id=o.id and state='verified';
  update public.orders set payment_state=case when paid>=ceil(o.total_centavos*o.deposit_percent/100.0) then 'verified'::public.payment_state else 'submitted'::public.payment_state end,version=version+1 where id=o.id;
 elsif action='record_cash' then
  if o.mode<>'pickup' or o.payment_method<>'Cash' or o.fulfillment_state<>'ready_for_pickup' or o.payment_state='verified' then raise exception 'Invalid transition'; end if;
  insert into public.payment_records(order_id,method,amount_centavos,state,verified_by,verified_at) values(o.id,'Cash',o.total_centavos,'verified',auth.uid(),now());
  update public.orders set payment_state='verified',version=version+1 where id=o.id;
 elsif action='confirm' then
  if o.request_state<>'awaiting_payment' or o.approved_by is null or o.fulfillment_state<>'unconfirmed' then raise exception 'Invalid transition'; end if;
  if o.payment_state<>'verified' and not(o.mode='pickup' and o.payment_method='Cash') then raise exception 'Payment required'; end if;
  update public.orders set fulfillment_state='confirmed',version=version+1 where id=o.id;
 elsif (action='preparing' and o.fulfillment_state='confirmed') or (action='ready_for_pickup' and o.mode='pickup' and o.fulfillment_state='preparing') or (action='out_for_delivery' and o.mode='delivery' and o.fulfillment_state='preparing') or (action='completed' and o.fulfillment_state in ('ready_for_pickup','out_for_delivery')) then
  if action='completed' and o.payment_state<>'verified' then raise exception 'Payment required'; end if;
  update public.orders set fulfillment_state=action::public.fulfillment_state,version=version+1 where id=o.id;
 else raise exception 'Invalid transition'; end if;
end $$;

create function public.rotate_staging_tracking(order_id uuid, token_hash text) returns void language plpgsql security definer set search_path='' as $$
declare o public.orders; begin
 select * into o from public.orders where id=order_id and is_staging for update;
 if not found then raise exception 'Not found'; end if;
 perform public.assert_staging_branch(o.branch_id);
 if token_hash !~ '^[a-f0-9]{64}$' then raise exception 'Invalid order'; end if;
 update public.orders set tracking_hash=token_hash,tracking_expires_at=now()+interval '7 days',version=version+1 where id=o.id;
end $$;

create function public.track_staging_order(order_id uuid, token text) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb; begin
 if not exists(select 1 from public.site_settings where key='runtime_mode' and value->>'mode'='staging') or token !~ '^[a-f0-9]{64}$' then return null; end if;
 select jsonb_build_object('reference',o.id,'request',o.request_state,'payment',o.payment_state,'fulfillment',o.fulfillment_state,'mode',o.mode,'date',o.preferred_date,'staging',true) into result from public.orders o where o.id=order_id and o.is_staging and o.tracking_expires_at>now() and o.tracking_hash=encode(sha256(convert_to(token,'UTF8')),'hex');
 return result;
end $$;

create function public.register_staging_proof(order_id uuid, storage_path text, bytes bigint, amount bigint) returns uuid language plpgsql security definer set search_path='' as $$
declare o public.orders; payment uuid; begin
 select * into o from public.orders where id=order_id and is_staging for update;
 if not found then raise exception 'Not found'; end if;
 perform public.assert_staging_branch(o.branch_id);
 if o.request_state<>'awaiting_payment' or o.payment_method='Cash' then raise exception 'Invalid transition'; end if;
 if amount<=0 or amount>o.total_centavos or bytes not between 1 and 5242880 or split_part(storage_path,'/',1)<>o.id::text then raise exception 'Invalid amount'; end if;
 if not exists(select 1 from storage.objects where bucket_id='payment-proofs' and name=storage_path) then raise exception 'Not found'; end if;
 insert into public.payment_records(order_id,method,amount_centavos,state) values(o.id,o.payment_method,amount,'submitted') returning id into payment;
 insert into public.payment_proof_files(payment_record_id,storage_path,mime_type,byte_size) values(payment,storage_path,'image/jpeg',bytes);
 update public.orders set payment_state=case when payment_state='verified' then payment_state else 'submitted'::public.payment_state end,version=version+1 where id=o.id;
 return payment;
end $$;

-- Restrict tracking hash visibility to API reads that explicitly select safe fields; RLS remains mandatory.
create policy staging_proof_metadata on public.payment_proof_files for select to authenticated using(exists(select 1 from public.payment_records p join public.orders o on o.id=p.order_id where p.id=payment_record_id and o.is_staging and public.can_access_branch(o.branch_id)));
create policy staging_private_upload on storage.objects for insert to authenticated with check(bucket_id='payment-proofs' and exists(select 1 from public.orders o where o.id::text=split_part(name,'/',1) and o.is_staging and o.request_state='awaiting_payment' and public.can_access_branch(o.branch_id)));
create policy staging_private_read on storage.objects for select to authenticated using(bucket_id='payment-proofs' and exists(select 1 from public.orders o where o.id::text=split_part(name,'/',1) and o.is_staging and public.can_access_branch(o.branch_id)));
create policy staging_orphan_cleanup on storage.objects for delete to authenticated using(bucket_id='payment-proofs' and exists(select 1 from public.orders o where o.id::text=split_part(name,'/',1) and o.is_staging and public.can_access_branch(o.branch_id)) and not exists(select 1 from public.payment_proof_files p where p.storage_path=name));
update storage.buckets set public=false,allowed_mime_types=array['image/jpeg','image/png'],file_size_limit=5242880 where id='payment-proofs';
revoke all on function public.assert_staging_branch(uuid,boolean),public.create_staging_order(jsonb),public.change_staging_order(uuid,integer,text,bigint,uuid),public.rotate_staging_tracking(uuid,text),public.register_staging_proof(uuid,text,bigint,bigint),public.track_staging_order(uuid,text) from public;
grant execute on function public.assert_staging_branch(uuid,boolean),public.create_staging_order(jsonb),public.change_staging_order(uuid,integer,text,bigint,uuid),public.rotate_staging_tracking(uuid,text),public.register_staging_proof(uuid,text,bigint,bigint) to authenticated;
grant execute on function public.track_staging_order(uuid,text) to anon,authenticated;
create table public.staff_actions(id uuid primary key default gen_random_uuid(),actor_id uuid not null references public.profiles,branch_id uuid not null references public.branches,action text not null,details jsonb not null,created_at timestamptz not null default now());
alter table public.staff_actions enable row level security;
create policy owner_audit_read on public.staff_actions for select to authenticated using(public.is_owner());
create function public.set_staging_operations(branch uuid, cutoff time default null, product uuid default null, available boolean default null, quantity integer default null) returns void language plpgsql security definer set search_path='' as $$
begin
 perform public.assert_staging_branch(branch,true);
 if product is null then
  if cutoff is null then raise exception 'Invalid order'; end if;
  update public.branches set cutoff=set_staging_operations.cutoff where id=branch;
  insert into public.staff_actions(actor_id,branch_id,action,details) values(auth.uid(),branch,'cutoff',jsonb_build_object('cutoff',cutoff));
 else
  if available is null or quantity<0 or not exists(select 1 from public.products where id=product and is_demo and not is_active) then raise exception 'Invalid item'; end if;
  if not exists(select 1 from public.branch_inventory where product_id=product and branch_id=branch) then raise exception 'Invalid item'; end if;
  update public.branch_inventory set available=set_staging_operations.available,quantity=set_staging_operations.quantity,updated_at=now() where product_id=product and branch_id=branch;
  insert into public.staff_actions(actor_id,branch_id,action,details) values(auth.uid(),branch,'inventory',jsonb_build_object('product',product,'available',available,'quantity',quantity));
 end if;
end $$;
revoke all on function public.set_staging_operations(uuid,time,uuid,boolean,integer) from public;
grant execute on function public.set_staging_operations(uuid,time,uuid,boolean,integer) to authenticated;
grant select on public.branches,public.products,public.branch_inventory,public.service_zones,public.delivery_rates,public.orders,public.order_items,public.order_addresses,public.order_status_events,public.payment_records,public.payment_proof_files,public.staff_actions to authenticated;
commit;
