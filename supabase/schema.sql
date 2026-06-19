-- 1. Create all tables in dependency order

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  role text not null check (role in ('admin', 'student')),
  full_name text,
  language_pref text default 'en',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create courses table
create table public.courses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references public.profiles(id) on delete set null
);

-- Create enrollments table
create table public.enrollments (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  enrolled_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, course_id)
);

-- Create lessons table
create table public.lessons (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  description text,
  youtube_url text,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  is_published boolean default false,
  created_by uuid references public.profiles(id) on delete set null
);

-- Create lesson_topics table
create table public.lesson_topics (
  id uuid default gen_random_uuid() primary key,
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  name text not null
);

-- Create quizzes table (Exams)
create table public.quizzes (
  id uuid default gen_random_uuid() primary key,
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  title text not null,
  language text default 'en',
  type text default 'practice',
  difficulty text default 'medium',
  is_published boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create questions table
create table public.questions (
  id uuid default gen_random_uuid() primary key,
  quiz_id uuid references public.quizzes(id) on delete cascade not null,
  type text not null,
  text text not null,
  options jsonb,
  correct_answer text not null,
  explanation text,
  topic text
);

-- Create quiz_submissions table
create table public.quiz_submissions (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  quiz_id uuid references public.quizzes(id) on delete cascade not null,
  score integer,
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create student_answers table
create table public.student_answers (
  id uuid default gen_random_uuid() primary key,
  submission_id uuid references public.quiz_submissions(id) on delete cascade not null,
  question_id uuid references public.questions(id) on delete cascade not null,
  given_answer text,
  is_correct boolean
);

-- Create student_progress table
create table public.student_progress (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  completed_lessons integer default 0,
  watched_videos integer default 0,
  average_score numeric(5,2) default 0.0,
  progress_percentage integer default 0,
  last_activity timestamp with time zone default timezone('utc'::text, now()),
  unique(student_id, course_id)
);

-- Create ai_generation_history table
create table public.ai_generation_history (
  id uuid default gen_random_uuid() primary key,
  admin_id uuid references public.profiles(id) on delete cascade not null,
  prompt_used text,
  pdf_context_used text,
  output_json jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_topics enable row level security;
alter table public.quizzes enable row level security;
alter table public.questions enable row level security;
alter table public.quiz_submissions enable row level security;
alter table public.student_answers enable row level security;
alter table public.student_progress enable row level security;
alter table public.ai_generation_history enable row level security;

-- 3. Define RLS Policies

-- profiles
create policy "Public profiles are viewable by admin." on profiles for select using ( auth.uid() in (select id from profiles where role = 'admin') );
create policy "Users can view own profile." on profiles for select using ( auth.uid() = id );
create policy "Admin can insert profiles." on profiles for insert with check ( auth.uid() in (select id from profiles where role = 'admin') );
create policy "Users can insert own profile." on profiles for insert with check ( auth.uid() = id and role = 'student' );
create policy "Admin can update profiles." on profiles for update using ( auth.uid() in (select id from profiles where role = 'admin') );
create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );

-- courses
create policy "Admin has full access to courses." on courses for all using ( auth.uid() in (select id from profiles where role = 'admin') );
create policy "Students can view enrolled courses." on courses for select using ( 
  id in (select course_id from enrollments where student_id = auth.uid()) 
);

-- enrollments
create policy "Admin has full access to enrollments." on enrollments for all using ( auth.uid() in (select id from profiles where role = 'admin') );
create policy "Students can view own enrollments." on enrollments for select using ( auth.uid() = student_id );

-- lessons
create policy "Admin has full access to lessons." on lessons for all using ( auth.uid() in (select id from profiles where role = 'admin') );
create policy "Students can view assigned lessons." on lessons for select using ( 
  course_id in (select course_id from enrollments where student_id = auth.uid()) and is_published = true 
);

-- lesson_topics
create policy "Admin has full access to lesson_topics." on lesson_topics for all using ( auth.uid() in (select id from profiles where role = 'admin') );
create policy "Students can view topics of assigned lessons." on lesson_topics for select using ( 
  lesson_id in (select id from lessons where course_id in (select course_id from enrollments where student_id = auth.uid()))
);

-- quizzes
create policy "Admin has full access to quizzes." on quizzes for all using ( auth.uid() in (select id from profiles where role = 'admin') );
create policy "Students can view assigned published quizzes." on quizzes for select using ( 
  lesson_id in (select id from lessons where course_id in (select course_id from enrollments where student_id = auth.uid())) and is_published = true 
);

-- questions
create policy "Admin has full access to questions." on questions for all using ( auth.uid() in (select id from profiles where role = 'admin') );
create policy "Students can view questions for their quizzes." on questions for select using ( 
  quiz_id in (select id from quizzes where lesson_id in (select id from lessons where course_id in (select course_id from enrollments where student_id = auth.uid())) and is_published = true)
);

-- quiz_submissions
create policy "Admin has full access to quiz_submissions." on quiz_submissions for all using ( auth.uid() in (select id from profiles where role = 'admin') );
create policy "Students can insert own submissions." on quiz_submissions for insert with check ( auth.uid() = student_id );
create policy "Students can view own submissions." on quiz_submissions for select using ( auth.uid() = student_id );

-- student_answers
create policy "Admin has full access to student_answers." on student_answers for all using ( auth.uid() in (select id from profiles where role = 'admin') );
create policy "Students can insert own answers." on student_answers for insert with check ( 
  auth.uid() in (select student_id from quiz_submissions where id = submission_id) 
);
create policy "Students can view own answers." on student_answers for select using ( 
  auth.uid() in (select student_id from quiz_submissions where id = submission_id) 
);

-- student_progress
create policy "Admin has full access to student_progress." on student_progress for all using ( auth.uid() in (select id from profiles where role = 'admin') );
create policy "Students can view own progress." on student_progress for select using ( auth.uid() = student_id );

-- ai_generation_history
create policy "Admin has full access to ai_generation_history." on ai_generation_history for all using ( auth.uid() in (select id from profiles where role = 'admin') );

-- 4. Set up storage for PDFs
insert into storage.buckets (id, name, public) values ('lesson_files', 'lesson_files', false) on conflict do nothing;

create policy "Admin can full access lesson files" on storage.objects for all using ( 
  bucket_id = 'lesson_files' and auth.uid() in (select id from public.profiles where role = 'admin') 
);

create policy "Students can read assigned lesson files" on storage.objects for select using ( 
  bucket_id = 'lesson_files' and auth.uid() in (
    select student_id from public.enrollments 
    where course_id::text = (storage.foldername(name))[1] -- assumes files are stored as course_id/lesson_id/filename
  )
);
