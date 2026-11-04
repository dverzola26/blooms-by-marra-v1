-- Run only in the chosen staging project, after both migrations.
-- In your SQL session first: SET app.allow_staging_seed = 'yes';
begin;
do $$ begin if current_setting('app.allow_staging_seed',true) is distinct from 'yes' then raise exception 'Explicit staging seed opt-in required'; end if; end $$;
insert into public.site_settings(key,value) values('runtime_mode','{"mode":"staging"}') on conflict(key) do update set value=excluded.value;
insert into public.branches(id,name,region,is_staging) values
('10000000-0000-4000-8000-000000000001','DEMO Valenzuela','Metro Manila',true),
('10000000-0000-4000-8000-000000000002','DEMO Angeles','Pampanga',true) on conflict(id) do nothing;
insert into public.service_zones(id,branch_id,city) values
('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Valenzuela'),
('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','Angeles') on conflict(id) do nothing;
insert into public.delivery_rates(zone_id,product_type,amount_centavos) values
('20000000-0000-4000-8000-000000000001','bouquet',15000),('20000000-0000-4000-8000-000000000001','standee',30000),('20000000-0000-4000-8000-000000000002','bouquet',18000) on conflict(zone_id,product_type) do nothing;
insert into public.products(id,sku,slug,name,price_centavos,product_type,is_demo,custom_quote) values
('30000000-0000-4000-8000-000000000001','DEMO-ROSE','staging-rose','DEMO rose study',120000,'bouquet',true,false),
('30000000-0000-4000-8000-000000000002','DEMO-SUN','staging-sun','DEMO sunflower study',180000,'bouquet',true,false),
('30000000-0000-4000-8000-000000000003','DEMO-QUOTE','staging-quote','DEMO custom study',null,'bouquet',true,true) on conflict(id) do nothing;
insert into public.branch_inventory(product_id,branch_id,available,quantity) values
('30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001',true,10),
('30000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002',true,10),
('30000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000002',false,null) on conflict(product_id,branch_id) do nothing;
insert into public.delivery_inclusions(product_id,zone_id) values('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001') on conflict do nothing;
-- No users, payment destinations, public catalog products or live availability are created.
commit;
