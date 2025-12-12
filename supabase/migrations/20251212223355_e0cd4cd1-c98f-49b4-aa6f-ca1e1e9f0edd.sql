-- Step 1: Drop dependent policies first
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Step 2: Drop dependent functions
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
DROP FUNCTION IF EXISTS public.get_user_role(uuid);

-- Step 3: Rename old enum and create new one
ALTER TYPE app_role RENAME TO app_role_old;
CREATE TYPE app_role AS ENUM ('admin', 'branch_manager', 'teller', 'risk_officer', 'auditor');

-- Step 4: Update user_roles table to use new enum
ALTER TABLE public.user_roles 
  ALTER COLUMN role TYPE app_role USING role::text::app_role;

-- Step 5: Drop old enum
DROP TYPE app_role_old;

-- Step 6: Recreate functions with new enum
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

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Step 7: Recreate policies
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Step 8: Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT UNIQUE NOT NULL,
  member_id TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer', 'loan_disbursement', 'loan_repayment')),
  account_balance DECIMAL(15,2) NOT NULL,
  description TEXT,
  device_fingerprint TEXT,
  geo_location TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'on_hold')),
  risk_score DECIMAL(5,2) DEFAULT 0,
  ai_metadata JSONB DEFAULT '{}',
  flags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Step 9: Create alerts table
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.transactions(id),
  member_id TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('rule', 'anomaly', 'sim_swap', 'deepfake', 'behavioral')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  reason TEXT NOT NULL,
  confidence DECIMAL(5,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'escalated', 'dismissed')),
  assigned_to UUID,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Step 10: Create immutable audit_logs table with hash chaining
CREATE TABLE public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor_id UUID,
  actor_role TEXT,
  payload JSONB NOT NULL,
  prev_hash TEXT,
  hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Step 11: Create whistleblower_reports table
CREATE TABLE public.whistleblower_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT[],
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'investigating', 'resolved', 'dismissed')),
  assigned_to UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.whistleblower_reports ENABLE ROW LEVEL SECURITY;

-- Step 12: RLS Policies for transactions
CREATE POLICY "Authenticated users can view transactions"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Tellers and above can create transactions"
  ON public.transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'teller'::app_role) OR
    has_role(auth.uid(), 'branch_manager'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Branch managers and admins can update transactions"
  ON public.transactions FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'branch_manager'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Step 13: RLS Policies for alerts
CREATE POLICY "Authenticated users can view alerts"
  ON public.alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can create alerts"
  ON public.alerts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Risk officers and above can update alerts"
  ON public.alerts FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'risk_officer'::app_role) OR
    has_role(auth.uid(), 'branch_manager'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Step 14: RLS Policies for audit_logs
CREATE POLICY "Auditors and above can view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'auditor'::app_role) OR
    has_role(auth.uid(), 'risk_officer'::app_role) OR
    has_role(auth.uid(), 'branch_manager'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Authenticated can insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Step 15: RLS Policies for whistleblower_reports
CREATE POLICY "Anyone can create whistleblower reports"
  ON public.whistleblower_reports FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Managers and above can view whistleblower reports"
  ON public.whistleblower_reports FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'branch_manager'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'auditor'::app_role)
  );

CREATE POLICY "Managers and admins can update whistleblower reports"
  ON public.whistleblower_reports FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'branch_manager'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Step 16: Update triggers
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_whistleblower_reports_updated_at
  BEFORE UPDATE ON public.whistleblower_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Step 17: Update handle_new_user to always default to auditor
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'auditor'::app_role);
  
  RETURN NEW;
END;
$$;