create type public.app_role as enum ('admin', 'moderator', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Users can read their own roles"
  on public.user_roles for select to authenticated
  using (auth.uid() = user_id);

-- Admin write access to catalogue tables (public read policies already exist)
grant insert, update, delete on public.products to authenticated;
grant insert, update, delete on public.brands to authenticated;
grant insert, update, delete on public.ingredients to authenticated;
grant insert, update, delete on public.product_ingredients to authenticated;
grant insert, update, delete on public.merchant_offers to authenticated;

create policy "Admins can insert products" on public.products for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update products" on public.products for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete products" on public.products for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert brands" on public.brands for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update brands" on public.brands for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete brands" on public.brands for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert ingredients" on public.ingredients for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update ingredients" on public.ingredients for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete ingredients" on public.ingredients for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert product_ingredients" on public.product_ingredients for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update product_ingredients" on public.product_ingredients for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete product_ingredients" on public.product_ingredients for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert offers" on public.merchant_offers for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update offers" on public.merchant_offers for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete offers" on public.merchant_offers for delete to authenticated using (public.has_role(auth.uid(), 'admin'));