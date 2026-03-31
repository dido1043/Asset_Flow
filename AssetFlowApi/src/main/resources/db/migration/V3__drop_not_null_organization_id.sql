-- Ensure organization_id is nullable. Use USING if necessary for casting.
ALTER TABLE employee ALTER COLUMN organization_id DROP NOT NULL;
ALTER TABLE leader ALTER COLUMN organization_id DROP NOT NULL;


ALTER TABLE app_user DROP CONSTRAINT app_user_role_check;
ALTER TABLE app_user ADD CONSTRAINT app_user_role_check CHECK (role IN ('ADMIN', 'LEADER', 'EMPLOYEE'));