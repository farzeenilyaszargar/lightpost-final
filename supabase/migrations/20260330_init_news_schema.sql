-- Initial Supabase schema for Lightpost
-- Create core tables used by the app: news, word_of_day, daily_summary

create table if not exists public.news (
  id text primary key,
  title text not null,
  description text not null,
  summary text not null,
  published_at timestamptz not null default now(),
  image_url text,
  bias_score integer not null default 0,
  bias_reason text not null default '',
  topic text not null default 'world',
  rating integer not null default 0,
  likes integer not null default 0,
  dislikes integer not null default 0,
  interactions integer not null default 0,
  slug text not null unique,
  tags text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists news_topic_published_at_idx
  on public.news (topic, published_at desc);

create index if not exists news_rating_idx
  on public.news (rating desc);

create index if not exists news_published_at_idx
  on public.news (published_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_news_updated_at on public.news;
create trigger set_news_updated_at
before update on public.news
for each row execute procedure public.set_updated_at();

create table if not exists public.word_of_day (
  id bigserial primary key,
  word text not null,
  definition text not null,
  example text,
  pronounciation text,
  part_of_speech text,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_summary (
  id bigserial primary key,
  summary text not null,
  created_at timestamptz not null default now()
);

-- RLS + policies (safe defaults for client reads + reactions)
alter table public.news enable row level security;
alter table public.word_of_day enable row level security;
alter table public.daily_summary enable row level security;

create policy "Public read news"
  on public.news for select
  using (true);

create policy "Public update reactions"
  on public.news for update
  using (true)
  with check (true);

create policy "Public read word_of_day"
  on public.word_of_day for select
  using (true);

create policy "Public read daily_summary"
  on public.daily_summary for select
  using (true);

grant select on public.news to anon, authenticated;
grant update (likes, dislikes, interactions) on public.news to anon, authenticated;
grant select on public.word_of_day to anon, authenticated;
grant select on public.daily_summary to anon, authenticated;
