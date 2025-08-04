
-- Create faculties table
CREATE TABLE public.faculties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create departments table with reference to faculties
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  faculty_id UUID NOT NULL REFERENCES public.faculties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Public can view faculties and departments
CREATE POLICY "Public can view faculties" 
ON public.faculties
FOR SELECT 
USING (true);

CREATE POLICY "Public can view departments" 
ON public.departments
FOR SELECT 
USING (true);

-- Admins can manage faculties and departments
CREATE POLICY "Admins can manage faculties"
ON public.faculties
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage departments"
ON public.departments
USING (public.get_current_user_role() = 'admin');

-- Insert initial faculty and department data for ULI campus
INSERT INTO public.faculties (name, description) VALUES
('Faculty of Engineering', 'Engineering programs at ULI campus'),
('Faculty of Natural Sciences', 'Natural Sciences programs at ULI campus'),
('Faculty of Physical Sciences', 'Physical Sciences programs at ULI campus'),
('Faculty of Environmental Sciences', 'Environmental Sciences programs at ULI campus'),
('Faculty of Basic Medical Sciences', 'Basic Medical Sciences programs at ULI campus'),
('Faculty of Education', 'Education programs at ULI campus');

-- Insert Engineering departments
INSERT INTO public.departments (faculty_id, name)
SELECT id, 'Civil Engineering'
FROM public.faculties WHERE name = 'Faculty of Engineering';

INSERT INTO public.departments (faculty_id, name)
SELECT id, 'Chemical Engineering'
FROM public.faculties WHERE name = 'Faculty of Engineering';

INSERT INTO public.departments (faculty_id, name)
SELECT id, 'Electrical/Electronic Engineering'
FROM public.faculties WHERE name = 'Faculty of Engineering';

INSERT INTO public.departments (faculty_id, name)
SELECT id, 'Mechanical Engineering'
FROM public.faculties WHERE name = 'Faculty of Engineering';

-- Insert Natural Sciences departments
INSERT INTO public.departments (faculty_id, name)
SELECT id, 'Biological Sciences'
FROM public.faculties WHERE name = 'Faculty of Natural Sciences';

INSERT INTO public.departments (faculty_id, name)
SELECT id, 'Microbiology'
FROM public.faculties WHERE name = 'Faculty of Natural Sciences';

INSERT INTO public.departments (faculty_id, name)
SELECT id, 'Biochemistry'
FROM public.faculties WHERE name = 'Faculty of Natural Sciences';

-- Insert Physical Sciences departments
INSERT INTO public.departments (faculty_id, name)
SELECT id, 'Computer Sciences'
FROM public.faculties WHERE name = 'Faculty of Physical Sciences';

INSERT INTO public.departments (faculty_id, name)
SELECT id, 'Geology'
FROM public.faculties WHERE name = 'Faculty of Physical Sciences';

INSERT INTO public.departments (faculty_id, name)
SELECT id, 'Industrial Physics'
FROM public.faculties WHERE name = 'Faculty of Physical Sciences';

INSERT INTO public.departments (faculty_id, name)
SELECT id, 'Pure and Industrial Chemistry'
FROM public.faculties WHERE name = 'Faculty of Physical Sciences';

INSERT INTO public.departments (faculty_id, name)
SELECT id, 'Mathematics'
FROM public.faculties WHERE name = 'Faculty of Physical Sciences';

INSERT INTO public.departments (faculty_id, name)
SELECT id, 'Statistics'
FROM public.faculties WHERE name = 'Faculty of Physical Sciences';

-- Insert Environmental Sciences departments
INSERT INTO public.departments (faculty_id, name)
SELECT id, 'Architecture'
FROM public.faculties WHERE name = 'Faculty of Environmental Sciences';

INSERT INTO public.departments (faculty_id, name)
SELECT id, 'Urban and Regional Planning'
FROM public.faculties WHERE name = 'Faculty of Environmental Sciences';

INSERT INTO public.departments (faculty_id, name)
SELECT id, 'Estate Management'
FROM public.faculties WHERE name = 'Faculty of Environmental Sciences';

INSERT INTO public.departments (faculty_id, name)
SELECT id, 'Environmental Management'
FROM public.faculties WHERE name = 'Faculty of Environmental Sciences';

-- Insert Basic Medical Sciences departments
INSERT INTO public.departments (faculty_id, name)
SELECT id, 'Anatomy'
FROM public.faculties WHERE name = 'Faculty of Basic Medical Sciences';

INSERT INTO public.departments (faculty_id, name)
SELECT id, 'Physiology'
FROM public.faculties WHERE name = 'Faculty of Basic Medical Sciences';

INSERT INTO public.departments (faculty_id, name)
SELECT id, 'Medicine & Surgery'
FROM public.faculties WHERE name = 'Faculty of Basic Medical Sciences';

-- Insert Education departments
INSERT INTO public.departments (faculty_id, name)
SELECT id, 'Science Education'
FROM public.faculties WHERE name = 'Faculty of Education';
