-- Ensure organization_id is nullable. Use USING if necessary for casting.
ALTER TABLE employee ALTER COLUMN organization_id DROP NOT NULL;
ALTER TABLE leader ALTER COLUMN organization_id DROP NOT NULL;

