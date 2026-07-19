-- 반 체크리스트 앱 스키마
-- 중요: password_hash가 들어있는 students 테이블은 anon key로 절대 직접 열지 않는다.
-- 모든 접근은 Next.js API route(서버, service role key)를 통해서만 이뤄진다.
-- 따라서 아래 테이블들은 RLS를 켜두되 "anon 접근 전면 차단" 정책만 둔다.
-- (서버는 service role key를 쓰므로 RLS를 우회해서 접근 가능)

create table if not exists rooms (
  id bigint generated always as identity primary key,
  name text not null,
  class_code text not null unique,       -- 학생들이 로그인 시 입력하는 반 코드 (예: 3-2-2026)
  created_at timestamptz default now()
);

create table if not exists students (
  id bigint generated always as identity primary key,
  room_id bigint not null references rooms(id) on delete cascade,
  student_number int not null,           -- 학급 번호 (1~49)
  name text not null,
  role text not null default 'student',  -- 'leader' | 'student'
  password_hash text not null,           -- bcrypt 해시. 평문은 절대 저장 안 함.
  must_change_password boolean not null default true,
  created_at timestamptz default now(),
  unique (room_id, student_number)
);

create table if not exists posts (
  id bigint generated always as identity primary key,
  room_id bigint not null references rooms(id) on delete cascade,
  type text not null,                    -- 'homework' | 'clothes' | 'supplies' | 'note'
  title text not null,
  due_date date,
  checker_type text not null default 'leader', -- 'leader' = 반장이 체크, 'self' = 학생 본인이 체크
  created_by bigint references students(id),
  created_at timestamptz default now()
);

create table if not exists checks (
  id bigint generated always as identity primary key,
  post_id bigint not null references posts(id) on delete cascade,
  student_id bigint not null references students(id) on delete cascade,
  checked boolean not null default false,
  checked_at timestamptz,
  checked_by bigint references students(id), -- 실제로 체크 버튼을 누른 사람
  unique (post_id, student_id)
);

alter table rooms enable row level security;
alter table students enable row level security;
alter table posts enable row level security;
alter table checks enable row level security;

-- anon key로는 아무 것도 못 하게 막는다. (정책을 아예 만들지 않으면 기본적으로 전부 차단됨)
-- 서버(service role key)는 RLS를 우회하므로 API route에서는 정상 동작함.

alter publication supabase_realtime add table posts;
alter publication supabase_realtime add table checks;
