-- Create role enum for user access control
CREATE TYPE public.app_role AS ENUM ('admin', 'franqueado', 'user');

-- Create user_roles table to manage user permissions
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1
$$;

-- Add user_id column to franqueados table to link franchise owners to their data
ALTER TABLE public.franqueados ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Create index for performance
CREATE INDEX idx_franqueados_user_id ON public.franqueados(user_id);

-- Drop existing overly permissive RLS policies
DROP POLICY IF EXISTS "Usuários autenticados podem ver todos os franqueados" ON public.franqueados;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir franqueados" ON public.franqueados;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar franqueados" ON public.franqueados;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar franqueados" ON public.franqueados;

-- Create secure RLS policies for franqueados table
-- Admins can view all franchise data
CREATE POLICY "Admins can view all franqueados"
ON public.franqueados
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Franchise owners can only view their own data
CREATE POLICY "Franqueados can view own data"
ON public.franqueados
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'franqueado') 
  AND user_id = auth.uid()
);

-- Only admins can insert new franchise data
CREATE POLICY "Admins can insert franqueados"
ON public.franqueados
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can update all, franchise owners can update their own data
CREATE POLICY "Admins can update all franqueados"
ON public.franqueados
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Franqueados can update own data"
ON public.franqueados
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'franqueado') 
  AND user_id = auth.uid()
);

-- Only admins can delete franchise data
CREATE POLICY "Admins can delete franqueados"
ON public.franqueados
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for user_roles table
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));