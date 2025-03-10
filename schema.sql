-- Create tables
create table public.profiles (
  id uuid references auth.users on delete cascade,
  full_name text,
  email text,
  phone text,
  is_admin boolean default false,
  primary key (id)
);

create table public.destinations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.tours (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  destination_id uuid references public.destinations(id),
  pickup_point text,
  duration integer,
  services text[],
  max_people integer,
  price decimal(10,2),
  date date,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  tour_id uuid references public.tours(id),
  user_id uuid references public.profiles(id),
  leader_name text,
  email text,
  phone text,
  number_of_people integer,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up row level security
alter table public.profiles enable row level security;
alter table public.destinations enable row level security;
alter table public.tours enable row level security;
alter table public.bookings enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

create policy "Destinations are viewable by everyone"
  on destinations for select
  using ( true );

create policy "Tours are viewable by everyone"
  on tours for select
  using ( true );

create policy "Admins can create tours"
  on tours for insert
  with check ( 
    exists (
      select 1 from profiles
      where id = auth.uid()
      and is_admin = true
    )
  );

create policy "Admins can update own tours"
  on tours for update
  using (
    auth.uid() = created_by
    and exists (
      select 1 from profiles
      where id = auth.uid()
      and is_admin = true
    )
  );

create policy "Admins can delete own tours"
  on tours for delete
  using (
    auth.uid() = created_by
    and exists (
      select 1 from profiles
      where id = auth.uid()
      and is_admin = true
    )
  );

create policy "Bookings are viewable by tour creator or booking user"
  on bookings for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from tours
      where tours.id = tour_id
      and tours.created_by = auth.uid()
    )
  );

create policy "Users can create bookings"
  on bookings for insert
  with check ( auth.uid() = user_id ); 