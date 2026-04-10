-- =====================================================
-- JEE MENTOR PLATFORM — Supabase Schema
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL CHECK (role IN ('mentor', 'student')),
  mentor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Mentors can view their students" ON profiles
  FOR SELECT TO authenticated
  USING (
    mentor_id = auth.uid() OR id = auth.uid()
  );

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, mentor_id, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    CASE 
      WHEN (NEW.raw_user_meta_data->>'mentor_id') IS NOT NULL AND (NEW.raw_user_meta_data->>'mentor_id') <> ''
      THEN (NEW.raw_user_meta_data->>'mentor_id')::uuid 
      ELSE NULL 
    END,
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Policy to allow viewing mentors (needed for student signup selection)
CREATE POLICY "Anyone can view mentors" ON profiles
  FOR SELECT TO anon, authenticated
  USING (role = 'mentor');


-- 2. Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  task_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentors manage their tasks" ON tasks
  FOR ALL TO authenticated
  USING (mentor_id = auth.uid());

CREATE POLICY "Students view mentor tasks" ON tasks
  FOR SELECT TO authenticated
  USING (
    mentor_id IN (SELECT mentor_id FROM profiles WHERE id = auth.uid())
  );


-- 3. Task Items
CREATE TABLE IF NOT EXISTS task_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

ALTER TABLE task_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Task items follow task access" ON task_items
  FOR ALL TO authenticated
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE mentor_id = auth.uid()
      UNION
      SELECT id FROM tasks WHERE mentor_id IN (SELECT mentor_id FROM profiles WHERE id = auth.uid())
    )
  );


-- 4. Student Task Progress
CREATE TABLE IF NOT EXISTS student_task_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  task_item_id UUID REFERENCES task_items(id) ON DELETE CASCADE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, task_item_id)
);

ALTER TABLE student_task_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage own progress" ON student_task_progress
  FOR ALL TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Mentors view student progress" ON student_task_progress
  FOR SELECT TO authenticated
  USING (
    student_id IN (SELECT id FROM profiles WHERE mentor_id = auth.uid())
  );


-- 5. Assignments
CREATE TABLE IF NOT EXISTS assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentors manage assignments" ON assignments
  FOR ALL TO authenticated
  USING (mentor_id = auth.uid());

CREATE POLICY "Students view mentor assignments" ON assignments
  FOR SELECT TO authenticated
  USING (
    mentor_id IN (SELECT mentor_id FROM profiles WHERE id = auth.uid())
  );


-- 6. Assignment Submissions
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  image_urls TEXT[] DEFAULT '{}',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage own submissions" ON assignment_submissions
  FOR ALL TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Mentors view submissions" ON assignment_submissions
  FOR SELECT TO authenticated
  USING (
    assignment_id IN (SELECT id FROM assignments WHERE mentor_id = auth.uid())
  );


-- 7. Tests
CREATE TABLE IF NOT EXISTS tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  test_name TEXT NOT NULL,
  test_date DATE NOT NULL DEFAULT CURRENT_DATE,
  subjects TEXT[] DEFAULT ARRAY['Physics', 'Chemistry', 'Maths'],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentors manage tests" ON tests
  FOR ALL TO authenticated
  USING (mentor_id = auth.uid());

CREATE POLICY "Students view mentor tests" ON tests
  FOR SELECT TO authenticated
  USING (
    mentor_id IN (SELECT mentor_id FROM profiles WHERE id = auth.uid())
  );


-- 8. Test Scores
CREATE TABLE IF NOT EXISTS test_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  scores JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(test_id, student_id)
);

ALTER TABLE test_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage own scores" ON test_scores
  FOR ALL TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Mentors view scores" ON test_scores
  FOR SELECT TO authenticated
  USING (
    test_id IN (SELECT id FROM tests WHERE mentor_id = auth.uid())
  );


-- 9. Materials
CREATE TABLE IF NOT EXISTS materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  link_url TEXT NOT NULL,
  description TEXT,
  material_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentors manage materials" ON materials
  FOR ALL TO authenticated
  USING (mentor_id = auth.uid());

CREATE POLICY "Students view mentor materials" ON materials
  FOR SELECT TO authenticated
  USING (
    mentor_id IN (SELECT mentor_id FROM profiles WHERE id = auth.uid())
  );


-- 10. Daily Notes
CREATE TABLE IF NOT EXISTS daily_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  note_date DATE NOT NULL DEFAULT CURRENT_DATE,
  content TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, note_date)
);

ALTER TABLE daily_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage own notes" ON daily_notes
  FOR ALL TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Mentors view student notes" ON daily_notes
  FOR SELECT TO authenticated
  USING (
    student_id IN (SELECT id FROM profiles WHERE mentor_id = auth.uid())
  );


-- 11. Doubts
CREATE TABLE IF NOT EXISTS doubts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  question_number TEXT,
  section TEXT,
  chapter TEXT,
  subject TEXT NOT NULL CHECK (subject IN ('Physics', 'Chemistry', 'Maths')),
  image_urls TEXT[],
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  mentor_reply TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE doubts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage own doubts" ON doubts
  FOR ALL TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Mentors view and reply to doubts" ON doubts
  FOR ALL TO authenticated
  USING (
    student_id IN (SELECT id FROM profiles WHERE mentor_id = auth.uid())
  );


-- =====================================================
-- STORAGE BUCKETS
-- Create these manually in Supabase Dashboard > Storage
-- Bucket names: assignment-images, doubt-images
-- Set both as PUBLIC buckets
-- =====================================================

-- Storage policies (run after creating buckets)

-- assignment-images bucket
CREATE POLICY "Authenticated upload assignment images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'assignment-images');

CREATE POLICY "Public read assignment images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'assignment-images');

-- doubt-images bucket
CREATE POLICY "Authenticated upload doubt images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'doubt-images');

CREATE POLICY "Public read doubt images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'doubt-images');
