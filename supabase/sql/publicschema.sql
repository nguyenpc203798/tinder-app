CREATE TABLE public.user_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  name TEXT,
  age INTEGER CHECK (age IS NULL OR age >= 18),
  gender TEXT CHECK (gender IS NULL OR gender IN ('male', 'female', 'other')),
  bio TEXT,
  location TEXT,
  height_cm INTEGER,
  weight_kg INTEGER,
  education TEXT,
  job_title TEXT,
  photos TEXT[],
  interests TEXT[],
  age_range INTEGER[2],
  distance INTEGER,
  is_verified BOOLEAN DEFAULT false,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE user_role AS ENUM ('customer', 'admin');

ALTER TABLE user_profile
ADD COLUMN role user_role NOT NULL DEFAULT 'customer';
