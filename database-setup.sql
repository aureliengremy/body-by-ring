-- ==========================================
-- Body by Rings - Complete Database Schema
-- ==========================================

-- 0. TABLE PROFILES (utilisateurs)
-- ==========================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS pour profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- 1. TABLE EXERCISES (bibliothèque des mouvements)
-- ==========================================

CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('push', 'pull', 'legs', 'core')),
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 10),
  instructions TEXT,
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS pour exercises (lecture publique)
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exercises" 
ON exercises FOR SELECT 
USING (true);

-- 2. TABLE PROGRAMS (programmes d'entraînement)
-- ==========================================

CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Body by Rings',
  phase INTEGER NOT NULL DEFAULT 1 CHECK (phase BETWEEN 1 AND 3),
  cycle_number INTEGER NOT NULL DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS pour programs
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own programs" 
ON programs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own programs" 
ON programs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own programs" 
ON programs FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own programs" 
ON programs FOR DELETE 
USING (auth.uid() = user_id);

-- 3. TABLE WORKOUTS (séances d'entraînement)
-- ==========================================

CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 5),
  session_type TEXT NOT NULL CHECK (session_type IN ('push_1', 'pull_1', 'push_2', 'pull_2')),
  is_deload BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS pour workouts (via program_id)
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workouts" 
ON workouts FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM programs 
  WHERE programs.id = workouts.program_id 
  AND programs.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own workouts" 
ON workouts FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM programs 
  WHERE programs.id = workouts.program_id 
  AND programs.user_id = auth.uid()
));

CREATE POLICY "Users can update their own workouts" 
ON workouts FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM programs 
  WHERE programs.id = workouts.program_id 
  AND programs.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM programs 
  WHERE programs.id = workouts.program_id 
  AND programs.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own workouts" 
ON workouts FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM programs 
  WHERE programs.id = workouts.program_id 
  AND programs.user_id = auth.uid()
));

-- 4. TABLE SETS (séries individuelles)
-- ==========================================

CREATE TABLE sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) NOT NULL,
  set_number INTEGER NOT NULL,
  target_reps_min INTEGER,
  target_reps_max INTEGER,
  actual_reps INTEGER,
  rpe INTEGER CHECK (rpe BETWEEN 6 AND 10),
  tempo TEXT DEFAULT '30X1',
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS pour sets (via workout_id -> program_id)
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sets" 
ON sets FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM workouts 
  JOIN programs ON programs.id = workouts.program_id 
  WHERE workouts.id = sets.workout_id 
  AND programs.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own sets" 
ON sets FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM workouts 
  JOIN programs ON programs.id = workouts.program_id 
  WHERE workouts.id = sets.workout_id 
  AND programs.user_id = auth.uid()
));

CREATE POLICY "Users can update their own sets" 
ON sets FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM workouts 
  JOIN programs ON programs.id = workouts.program_id 
  WHERE workouts.id = sets.workout_id 
  AND programs.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM workouts 
  JOIN programs ON programs.id = workouts.program_id 
  WHERE workouts.id = sets.workout_id 
  AND programs.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own sets" 
ON sets FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM workouts 
  JOIN programs ON programs.id = workouts.program_id 
  WHERE workouts.id = sets.workout_id 
  AND programs.user_id = auth.uid()
));

-- 5. DONNÉES DE BASE - Exercices initiaux
-- ==========================================

INSERT INTO exercises (name, category, difficulty_level, instructions) VALUES
-- Exercices Push
('Push-ups', 'push', 3, 'Classic push-up movement. Keep body straight, lower chest to ground.'),
('Pike Push-ups', 'push', 5, 'Inverted V position, hands shoulder-width apart. Lower head toward ground.'),
('Handstand Push-ups', 'push', 8, 'Against wall, lower head to ground and press back up.'),
('Ring Dips', 'push', 6, 'On rings, lower body until shoulders below rings, press back up.'),

-- Exercices Pull  
('Pull-ups', 'pull', 5, 'Hang from bar, pull chest to bar with control.'),
('Chin-ups', 'pull', 4, 'Underhand grip, pull chest to bar.'),
('Ring Rows', 'pull', 3, 'Inclined body position, pull chest to rings.'),
('Muscle-ups', 'pull', 9, 'Pull-up followed by transition over rings/bar.'),

-- Exercices Legs/Core
('Squats', 'legs', 2, 'Feet shoulder-width apart, lower until thighs parallel to ground.'),
('Pistol Squats', 'legs', 7, 'Single-leg squat, other leg extended forward.'),
('L-sit', 'core', 6, 'Seated position with legs extended parallel to ground.'),
('Plank', 'core', 2, 'Hold straight body position on forearms or hands.');

-- ==========================================
-- Setup complete! ✅
-- ==========================================