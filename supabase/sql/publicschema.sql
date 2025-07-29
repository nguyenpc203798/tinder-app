CREATE TABLE public.user_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  full_name TEXT,
  age INTEGER CHECK (age IS NULL OR age >= 18),
  gender TEXT CHECK (gender IS NULL OR gender IN ('male', 'female', 'other')),
  bio TEXT,

  location TEXT,
  latitude FLOAT,
  longitude FLOAT,

  height_cm INTEGER,
  weight_kg INTEGER,
  education_level TEXT,
  job_title TEXT,
  company TEXT,
  income_range TEXT,

  marital_status TEXT CHECK (
    marital_status IS NULL OR marital_status IN ('single', 'divorced', 'widowed', 'married')
  ),
  children BOOLEAN,
  religion TEXT,
  zodiac_sign TEXT,
  lifestyle TEXT,

  interests TEXT[],
  personality_traits TEXT[],
  habits JSONB,

  photos TEXT[],
  is_verified BOOLEAN DEFAULT false,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE user_role AS ENUM ('customer', 'admin');

ALTER TABLE user_profile
ADD COLUMN role user_role NOT NULL DEFAULT 'customer';
